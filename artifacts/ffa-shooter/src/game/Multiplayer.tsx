import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMultiplayerStore } from "./multiplayerStore";
import { useGameStore } from "./useGameStore";
import { RemotePlayers } from "./RemotePlayers";

const SEND_INTERVAL_MS = 50; // 20Hz

/**
 * Drives multiplayer: sends our state, receives remote shots/hits.
 * Renders other connected players.
 */
export function Multiplayer() {
  const { camera } = useThree();
  const enabled = useMultiplayerStore((s) => s.enabled);
  const send = useMultiplayerStore((s) => s.send);
  const lastSent = useRef(0);

  const phase = useGameStore((s) => s.phase);
  const health = useGameStore((s) => s.health);
  const selectedSkin = useGameStore((s) => s.selectedSkin);
  const selectedGun = useGameStore((s) => s.selectedGun);
  const selectedSlot = useGameStore((s) => s.selectedSlot);

  // Receive remote shots → spawn enemy bullets locally so they're visible & damaging
  useEffect(() => {
    if (!enabled) return;
    (window as any).__mpOnRemoteShot = (msg: any) => {
      const addBullet = useGameStore.getState().addBullet;
      const bullets = Math.max(1, Math.min(12, msg.bullets ?? 1));
      const now = Date.now();
      for (let i = 0; i < bullets; i++) {
        const dir = new THREE.Vector3(msg.dx, msg.dy, msg.dz).normalize();
        if (msg.spread > 0) {
          dir.x += (Math.random() - 0.5) * msg.spread;
          dir.y += (Math.random() - 0.5) * msg.spread;
          dir.z += (Math.random() - 0.5) * msg.spread;
          dir.normalize();
        }
        addBullet({
          id: `mb-${msg.from}-${now}-${i}-${Math.random()}`,
          position: [msg.ox, msg.oy, msg.oz],
          direction: [dir.x, dir.y, dir.z],
          speed: msg.speed ?? 60,
          createdAt: now,
          fromPlayer: false,
          damage: msg.damage ?? 15,
        });
      }
    };
    (window as any).__mpOnIncomingHit = (msg: any) => {
      useGameStore.getState().takeDamage(msg.damage ?? 15);
    };
    (window as any).__mpSendShot = (bullet: any) => {
      send({
        type: "shot",
        ox: bullet.position[0],
        oy: bullet.position[1],
        oz: bullet.position[2],
        dx: bullet.direction[0],
        dy: bullet.direction[1],
        dz: bullet.direction[2],
        damage: bullet.damage,
        speed: bullet.speed,
        bullets: 1,
        spread: 0,
        gun: useGameStore.getState().selectedGun,
      });
    };
    return () => {
      (window as any).__mpOnRemoteShot = undefined;
      (window as any).__mpOnIncomingHit = undefined;
      (window as any).__mpSendShot = undefined;
    };
  }, [enabled, send]);

  useFrame(() => {
    if (!enabled) return;
    const now = performance.now();
    if (now - lastSent.current < SEND_INTERVAL_MS) return;
    lastSent.current = now;

    // Approximate body position from camera (camera sits ~1.1 above player)
    const yaw = Math.atan2(-camera.matrix.elements[8], -camera.matrix.elements[10]);
    const pitch = Math.asin(THREE.MathUtils.clamp(-camera.matrix.elements[6], -1, 1));

    // Player feet are roughly camera.y - 1.1; we sync the body root
    send({
      type: "update",
      x: camera.position.x,
      y: Math.max(0, camera.position.y - 1.1),
      z: camera.position.z,
      yaw,
      pitch,
      skin: selectedSkin,
      gun: selectedGun,
      slot: selectedSlot,
      health,
      alive: phase === "playing",
    });
  });

  return <RemotePlayers />;
}
