import { WebSocketServer, WebSocket } from "ws";
import type { Server } from "node:http";
import { logger } from "./lib/logger";

export interface RemotePlayerState {
  id: string;
  name: string;
  skin: string;
  gun: string;
  slot: number;
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  health: number;
  alive: boolean;
}

interface ShotEvent {
  type: "shot";
  from: string;
  ox: number;
  oy: number;
  oz: number;
  dx: number;
  dy: number;
  dz: number;
  damage: number;
  speed: number;
  bullets: number;
  spread: number;
  gun: string;
}

interface HitEvent {
  type: "hit";
  shooter: string;
  victim: string;
  damage: number;
  headshot: boolean;
}

interface JoinMessage {
  type: "join";
  name: string;
  skin: string;
  gun: string;
}

interface UpdateMessage {
  type: "update";
  x: number;
  y: number;
  z: number;
  yaw: number;
  pitch: number;
  skin: string;
  gun: string;
  slot: number;
  health: number;
  alive: boolean;
}

interface RespawnMessage {
  type: "respawn";
  x: number;
  y: number;
  z: number;
}

type ClientMessage =
  | JoinMessage
  | UpdateMessage
  | ShotEvent
  | HitEvent
  | RespawnMessage;

interface Client {
  ws: WebSocket;
  state: RemotePlayerState;
}

const clients = new Map<string, Client>();
let nextId = 1;

function broadcast(payload: object, exceptId?: string) {
  const data = JSON.stringify(payload);
  for (const [id, c] of clients) {
    if (id === exceptId) continue;
    if (c.ws.readyState === WebSocket.OPEN) {
      try {
        c.ws.send(data);
      } catch {
        /* ignore */
      }
    }
  }
}

function snapshot(): RemotePlayerState[] {
  return Array.from(clients.values()).map((c) => c.state);
}

export function attachMultiplayer(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", (ws) => {
    const id = `p${nextId++}`;
    const state: RemotePlayerState = {
      id,
      name: `Player${nextId - 1}`,
      skin: "ghost",
      gun: "ar15",
      slot: 0,
      x: 0,
      y: 1,
      z: 0,
      yaw: 0,
      pitch: 0,
      health: 100,
      alive: true,
    };
    clients.set(id, { ws, state });

    logger.info({ id, total: clients.size }, "ws: client connected");

    ws.send(
      JSON.stringify({
        type: "welcome",
        id,
        players: snapshot().filter((p) => p.id !== id),
      }),
    );

    broadcast({ type: "playerJoined", player: state }, id);

    ws.on("message", (raw) => {
      let msg: ClientMessage;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }
      const client = clients.get(id);
      if (!client) return;

      switch (msg.type) {
        case "join":
          client.state.name = String(msg.name).slice(0, 20) || client.state.name;
          client.state.skin = String(msg.skin) || client.state.skin;
          client.state.gun = String(msg.gun) || client.state.gun;
          broadcast({ type: "playerJoined", player: client.state }, id);
          break;
        case "update":
          client.state.x = msg.x;
          client.state.y = msg.y;
          client.state.z = msg.z;
          client.state.yaw = msg.yaw;
          client.state.pitch = msg.pitch;
          client.state.skin = msg.skin;
          client.state.gun = msg.gun;
          client.state.slot = msg.slot;
          client.state.health = msg.health;
          client.state.alive = msg.alive;
          break;
        case "shot":
          broadcast({ ...msg, from: id }, id);
          break;
        case "hit": {
          const victim = clients.get(msg.victim);
          if (victim && victim.ws.readyState === WebSocket.OPEN) {
            victim.ws.send(
              JSON.stringify({
                type: "hit",
                shooter: id,
                damage: msg.damage,
                headshot: msg.headshot,
              }),
            );
          }
          break;
        }
        case "respawn":
          client.state.x = msg.x;
          client.state.y = msg.y;
          client.state.z = msg.z;
          client.state.health = 100;
          client.state.alive = true;
          break;
      }
    });

    const closeHandler = () => {
      clients.delete(id);
      broadcast({ type: "playerLeft", id });
      logger.info({ id, total: clients.size }, "ws: client disconnected");
    };
    ws.on("close", closeHandler);
    ws.on("error", closeHandler);
  });

  // Broadcast snapshots at 20Hz
  setInterval(() => {
    if (clients.size === 0) return;
    const players = snapshot();
    const data = JSON.stringify({ type: "snapshot", players });
    for (const c of clients.values()) {
      if (c.ws.readyState === WebSocket.OPEN) {
        try {
          c.ws.send(data);
        } catch {
          /* ignore */
        }
      }
    }
  }, 50);

  return wss;
}
