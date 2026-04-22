// lib/game-core/src/index.ts

export interface PlayerState {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { y: number };
  anim: string; 
}

export interface GameSnapshot {
  players: Record<string, PlayerState>;
}