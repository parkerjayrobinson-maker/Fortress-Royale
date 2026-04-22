export interface Player {
  id: string;
  x: number;
  y: number;
  z: number;
  rotation: number;
  health: number;
  lastAction: number;
}

export interface GameState {
  players: Record<string, Player>;
}

// Simple logic used by both Client (for prediction) and Server (for validation)
export const movePlayer = (player: Player, input: { x: number, z: number }) => {
  player.x += input.x;
  player.z += input.z;
};