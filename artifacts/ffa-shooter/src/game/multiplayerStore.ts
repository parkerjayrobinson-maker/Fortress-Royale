import { create } from "zustand";

export interface RemotePlayer {
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

interface MultiplayerState {
  enabled: boolean;
  connected: boolean;
  myId: string | null;
  name: string;
  players: Record<string, RemotePlayer>;
  socket: WebSocket | null;
  setName: (n: string) => void;
  setEnabled: (v: boolean) => void;
  connect: (opts: { name: string; skin: string; gun: string }) => void;
  disconnect: () => void;
  send: (payload: object) => void;
}

function getDefaultWsUrl(): string {
  const envUrl = (import.meta.env.VITE_WS_URL as string | undefined) ?? "";
  if (envUrl) return envUrl;
  if (typeof window === "undefined") return "";
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}/ws`;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  enabled: false,
  connected: false,
  myId: null,
  name:
    (typeof localStorage !== "undefined" && localStorage.getItem("mp_name")) ||
    `Player${Math.floor(Math.random() * 9000) + 1000}`,
  players: {},
  socket: null,

  setName: (name) => {
    if (typeof localStorage !== "undefined") localStorage.setItem("mp_name", name);
    set({ name });
  },

  setEnabled: (enabled) => set({ enabled }),

  connect: ({ name, skin, gun }) => {
    const existing = get().socket;
    if (existing && existing.readyState <= 1) return;

    const url = getDefaultWsUrl();
    if (!url) return;

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch (e) {
      console.error("[mp] failed to create socket", e);
      return;
    }

    ws.addEventListener("open", () => {
      set({ connected: true });
      ws.send(JSON.stringify({ type: "join", name, skin, gun }));
    });

    ws.addEventListener("close", () => {
      set({ connected: false, players: {}, socket: null, myId: null });
    });

    ws.addEventListener("error", (e) => {
      console.warn("[mp] ws error", e);
    });

    ws.addEventListener("message", (ev) => {
      let msg: any;
      try { msg = JSON.parse(ev.data); } catch { return; }
      switch (msg.type) {
        case "welcome": {
          const players: Record<string, RemotePlayer> = {};
          for (const p of msg.players ?? []) players[p.id] = p;
          set({ myId: msg.id, players });
          break;
        }
        case "snapshot": {
          const myId = get().myId;
          const players: Record<string, RemotePlayer> = {};
          for (const p of msg.players ?? []) {
            if (p.id !== myId) players[p.id] = p;
          }
          set({ players });
          break;
        }
        case "playerJoined": {
          if (msg.player.id === get().myId) break;
          set((s) => ({ players: { ...s.players, [msg.player.id]: msg.player } }));
          break;
        }
        case "playerLeft": {
          set((s) => {
            const { [msg.id]: _gone, ...rest } = s.players;
            return { players: rest };
          });
          break;
        }
        case "shot": {
          const handler = (window as any).__mpOnRemoteShot;
          if (typeof handler === "function") handler(msg);
          break;
        }
        case "hit": {
          const handler = (window as any).__mpOnIncomingHit;
          if (typeof handler === "function") handler(msg);
          break;
        }
      }
    });

    set({ socket: ws, enabled: true });
  },

  disconnect: () => {
    const ws = get().socket;
    if (ws) try { ws.close(); } catch { /* ignore */ }
    set({ socket: null, connected: false, players: {}, myId: null, enabled: false });
  },

  send: (payload) => {
    const ws = get().socket;
    if (ws && ws.readyState === 1) {
      try { ws.send(JSON.stringify(payload)); } catch { /* ignore */ }
    }
  },
}));
