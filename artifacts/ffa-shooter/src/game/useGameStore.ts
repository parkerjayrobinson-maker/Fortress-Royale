import { create } from "zustand";

export interface Enemy {
  id: string;
  position: [number, number, number];
  health: number;
  maxHealth: number;
  alive: boolean;
  target: [number, number, number] | null;
  lastShot: number;
  moveDir: [number, number, number];
  skinIndex: number;
}

export interface Bullet {
  id: string;
  position: [number, number, number];
  direction: [number, number, number];
  speed: number;
  createdAt: number;
  fromPlayer: boolean;
  damage: number;
}

export interface Kill {
  id: string;
  timestamp: number;
  text: string;
}

export type LootType = "health" | "ammo" | "sword";

export interface LootBox {
  id: string;
  position: [number, number, number];
  type: LootType;
  collected: boolean;
}

export type GamePhase = "menu" | "playing" | "dead" | "won";
export type GameMode = "solo" | "multiplayer";

export type SkinId = "ghost" | "shadow" | "inferno" | "arctic" | "venom";
export type GunId = "ar15" | "shotgun" | "sniper" | "smg";

export interface SkinDef {
  id: SkinId;
  name: string;
  bodyColor: string;
  headColor: string;
  armorColor: string;
  accentColor: string;
}

export interface GunDef {
  id: GunId;
  name: string;
  fireRate: number;
  damage: number;
  bulletSpeed: number;
  ammo: number;
  spread: number;
  aimSpread: number;
  bulletsPerShot: number;
  reloadTime: number;
  bodyColor: string;
  barrelColor: string;
  stockColor: string;
  description: string;
  aimFov: number;
}

export const SKINS: SkinDef[] = [
  { id: "ghost",   name: "Ghost",   bodyColor: "#e0e0e0", headColor: "#f5f5f5", armorColor: "#bdbdbd", accentColor: "#90caf9" },
  { id: "shadow",  name: "Shadow",  bodyColor: "#212121", headColor: "#1a1a1a", armorColor: "#333",    accentColor: "#ce93d8" },
  { id: "inferno", name: "Inferno", bodyColor: "#b71c1c", headColor: "#c62828", armorColor: "#e64a19", accentColor: "#ffb300" },
  { id: "arctic",  name: "Arctic",  bodyColor: "#1565c0", headColor: "#0d47a1", armorColor: "#42a5f5", accentColor: "#e3f2fd" },
  { id: "venom",   name: "Venom",   bodyColor: "#1b5e20", headColor: "#2e7d32", armorColor: "#388e3c", accentColor: "#76ff03" },
];

export const GUNS: GunDef[] = [
  {
    id: "ar15",    name: "AR-15",   fireRate: 150,  damage: 34, bulletSpeed: 70, ammo: 30, spread: 0.03, aimSpread: 0.005, bulletsPerShot: 1, reloadTime: 1800,
    bodyColor: "#546e7a", barrelColor: "#37474f", stockColor: "#455a64", description: "Balanced assault rifle", aimFov: 55,
  },
  {
    id: "shotgun", name: "Shotgun", fireRate: 900,  damage: 20, bulletSpeed: 40, ammo: 8,  spread: 0.14, aimSpread: 0.07, bulletsPerShot: 6, reloadTime: 2400,
    bodyColor: "#8d6e63", barrelColor: "#6d4c41", stockColor: "#4e342e", description: "Devastating close range", aimFov: 60,
  },
  {
    id: "sniper",  name: "Sniper",  fireRate: 1200, damage: 100, bulletSpeed: 120, ammo: 5, spread: 0.003, aimSpread: 0.0005, bulletsPerShot: 1, reloadTime: 2800,
    bodyColor: "#263238", barrelColor: "#1c2529", stockColor: "#37474f", description: "One-shot precision", aimFov: 25,
  },
  {
    id: "smg",     name: "SMG",     fireRate: 70,   damage: 18, bulletSpeed: 55, ammo: 50, spread: 0.07, aimSpread: 0.025, bulletsPerShot: 1, reloadTime: 1400,
    bodyColor: "#4a148c", barrelColor: "#311b92", stockColor: "#6a1b9a", description: "Rapid-fire spray", aimFov: 50,
  },
];

const ENEMY_SKINS = [
  { bodyColor: "#c0392b", headColor: "#e74c3c", armorColor: "#922b21", accentColor: "#ff7675" },
  { bodyColor: "#7d3c98", headColor: "#9b59b6", armorColor: "#6c3483", accentColor: "#d7bde2" },
  { bodyColor: "#1a5276", headColor: "#2980b9", armorColor: "#154360", accentColor: "#85c1e9" },
  { bodyColor: "#1e8449", headColor: "#27ae60", armorColor: "#196f3d", accentColor: "#82e0aa" },
  { bodyColor: "#935116", headColor: "#ca6f1e", armorColor: "#784212", accentColor: "#f0b27a" },
];

function randomSpawn(): [number, number, number] {
  const angle = Math.random() * Math.PI * 2;
  const dist = 20 + Math.random() * 30;
  return [Math.cos(angle) * dist, 0, Math.sin(angle) * dist];
}

function makeEnemy(id: string): Enemy {
  return {
    id,
    position: randomSpawn(),
    health: 100,
    maxHealth: 100,
    alive: true,
    target: null,
    lastShot: 0,
    moveDir: [Math.random() - 0.5, 0, Math.random() - 0.5],
    skinIndex: Math.floor(Math.random() * ENEMY_SKINS.length),
  };
}

const INITIAL_LOOT_BOXES: LootBox[] = [
  { id: "lb-0",  position: [6,   0.5,  6],   type: "health", collected: false },
  { id: "lb-1",  position: [-9,  0.5,  4],   type: "ammo",   collected: false },
  { id: "lb-2",  position: [13,  0.5, -2],   type: "sword",  collected: false },
  { id: "lb-3",  position: [-6,  0.5, -11],  type: "health", collected: false },
  { id: "lb-4",  position: [0,   0.5,  16],  type: "ammo",   collected: false },
  { id: "lb-5",  position: [-16, 0.5,  6],   type: "health", collected: false },
  { id: "lb-6",  position: [9,   0.5, -13],  type: "ammo",   collected: false },
  { id: "lb-7",  position: [-4,  0.5, -21],  type: "sword",  collected: false },
  { id: "lb-8",  position: [21,  0.5,  9],   type: "health", collected: false },
  { id: "lb-9",  position: [-20, 0.5, -9],   type: "ammo",   collected: false },
];

let enemyIdCounter = 0;

interface GameState {
  phase: GamePhase;
  mode: GameMode;
  health: number;
  maxHealth: number;
  ammo: number;
  maxAmmo: number;
  score: number;
  kills: Kill[];
  enemies: Enemy[];
  bullets: Bullet[];
  isReloading: boolean;
  reloadProgress: number;
  isAiming: boolean;
  selectedSkin: SkinId;
  selectedGun: GunId;
  selectedSlot: number;
  hasSword: boolean;
  lootBoxes: LootBox[];
  notification: string | null;

  setSkin: (skin: SkinId) => void;
  setGun: (gun: GunId) => void;
  setAiming: (v: boolean) => void;
  selectSlot: (slot: number) => void;
  startGame: () => void;
  resetGame: () => void;
  setPhase: (phase: GamePhase) => void;
  setMode: (mode: GameMode) => void;
  startMultiplayerGame: () => void;
  takeDamage: (amount: number) => void;
  shoot: () => boolean;
  addBullet: (bullet: Bullet) => void;
  removeBullet: (id: string) => void;
  spawnEnemies: (count: number) => void;
  updateEnemy: (id: string, updates: Partial<Enemy>) => void;
  killEnemy: (id: string, headshot?: boolean) => void;
  addKillFeed: (text: string) => void;
  startReload: () => void;
  finishReload: () => void;
  setReloadProgress: (p: number) => void;
  updateBullets: (bullets: Bullet[]) => void;
  setEnemies: (enemies: Enemy[]) => void;
  getEnemySkin: (index: number) => typeof ENEMY_SKINS[0];
  collectLoot: (id: string) => void;
  swordSwing: (playerX: number, playerZ: number) => void;
  showNotification: (msg: string) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  phase: "menu",
  mode: "solo",
  health: 100,
  maxHealth: 100,
  ammo: 30,
  maxAmmo: 30,
  score: 0,
  kills: [],
  enemies: [],
  bullets: [],
  isReloading: false,
  reloadProgress: 0,
  isAiming: false,
  selectedSkin: "ghost",
  selectedGun: "ar15",
  selectedSlot: 0,
  hasSword: false,
  lootBoxes: INITIAL_LOOT_BOXES.map((b) => ({ ...b })),
  notification: null,

  setSkin: (selectedSkin) => set({ selectedSkin }),
  setGun: (selectedGun) => {
    const gun = GUNS.find((g) => g.id === selectedGun)!;
    set({ selectedGun, ammo: gun.ammo, maxAmmo: gun.ammo });
  },
  setAiming: (isAiming) => set({ isAiming }),

  selectSlot: (slot) => {
    const { hasSword } = get();
    if (slot === 4 && !hasSword) return;
    if (slot < 0 || slot > 4) return;
    if (slot < 4) {
      const gun = GUNS[slot];
      set({ selectedSlot: slot, selectedGun: gun.id, ammo: gun.ammo, maxAmmo: gun.ammo, isReloading: false });
    } else {
      set({ selectedSlot: 4 });
    }
  },

  showNotification: (notification) => {
    set({ notification });
    setTimeout(() => set({ notification: null }), 2500);
  },

  collectLoot: (id) => {
    const { lootBoxes, health, maxHealth, selectedGun, hasSword, showNotification } = get();
    const box = lootBoxes.find((b) => b.id === id);
    if (!box || box.collected) return;
    set({ lootBoxes: lootBoxes.map((b) => b.id === id ? { ...b, collected: true } : b) });

    if (box.type === "health") {
      const healed = Math.min(maxHealth, health + 30);
      set({ health: healed });
      showNotification("❤️  +30 Health!");
    } else if (box.type === "ammo") {
      const gun = GUNS.find((g) => g.id === selectedGun)!;
      set({ ammo: gun.ammo, maxAmmo: gun.ammo });
      showNotification("🔸 Ammo Refilled!");
    } else if (box.type === "sword") {
      if (!hasSword) {
        set({ hasSword: true });
        showNotification("⚔️  Sword Acquired! (press 5)");
      } else {
        showNotification("Already have sword");
      }
    }
    // Respawn after 20s
    setTimeout(() => {
      set((state) => ({
        lootBoxes: state.lootBoxes.map((b) => b.id === id ? { ...b, collected: false } : b)
      }));
    }, 20000);
  },

  swordSwing: (px, pz) => {
    const { enemies, killEnemy, score } = get();
    const RANGE = 2.8;
    let hit = false;
    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.position[0] - px;
      const dz = enemy.position[2] - pz;
      if (Math.sqrt(dx * dx + dz * dz) < RANGE) {
        const dmg = 75;
        const newHp = enemy.health - dmg;
        if (newHp <= 0) {
          killEnemy(enemy.id, false);
        } else {
          get().updateEnemy(enemy.id, { health: newHp });
        }
        hit = true;
      }
    }
    if (!hit) get().showNotification("Swing! (no target)");
  },

  setMode: (mode) => set({ mode }),

  startMultiplayerGame: () => {
    const { selectedGun } = get();
    const gun = GUNS.find((g) => g.id === selectedGun)!;
    set({
      phase: "playing",
      mode: "multiplayer",
      health: 100,
      ammo: gun.ammo,
      maxAmmo: gun.ammo,
      score: 0,
      kills: [],
      enemies: [],
      bullets: [],
      isReloading: false,
      reloadProgress: 0,
      isAiming: false,
      selectedSlot: 0,
      hasSword: false,
      lootBoxes: INITIAL_LOOT_BOXES.map((b) => ({ ...b })),
      notification: null,
    });
  },

  startGame: () => {
    enemyIdCounter = 0;
    const { selectedGun } = get();
    const gun = GUNS.find((g) => g.id === selectedGun)!;
    const enemies = Array.from({ length: 8 }, (_, _i) =>
      makeEnemy(`enemy-${enemyIdCounter++}`)
    );
    set({
      phase: "playing",
      mode: "solo",
      health: 100,
      ammo: gun.ammo,
      maxAmmo: gun.ammo,
      score: 0,
      kills: [],
      enemies,
      bullets: [],
      isReloading: false,
      reloadProgress: 0,
      isAiming: false,
      selectedSlot: 0,
      hasSword: false,
      lootBoxes: INITIAL_LOOT_BOXES.map((b) => ({ ...b })),
      notification: null,
    });
  },

  resetGame: () => {
    set({ phase: "menu", health: 100, ammo: 30, score: 0, kills: [], enemies: [], bullets: [], isReloading: false, reloadProgress: 0, isAiming: false, selectedSlot: 0, hasSword: false, notification: null });
  },

  setPhase: (phase) => set({ phase }),

  takeDamage: (amount) => {
    const { health } = get();
    const newHealth = Math.max(0, health - amount);
    if (newHealth <= 0) {
      set({ health: 0, phase: "dead" });
    } else {
      set({ health: newHealth });
    }
  },

  shoot: () => {
    const { ammo, isReloading, phase, selectedSlot } = get();
    if (selectedSlot === 4) return true; // sword handled separately
    if (ammo <= 0 || isReloading || phase !== "playing") return false;
    set({ ammo: ammo - 1 });
    return true;
  },

  addBullet: (bullet) => {
    set((state) => ({ bullets: [...state.bullets, bullet] }));
    if (bullet.fromPlayer) {
      const fn = (window as any).__mpSendShot;
      if (typeof fn === "function") fn(bullet);
    }
  },
  removeBullet: (id) => set((state) => ({ bullets: state.bullets.filter((b) => b.id !== id) })),
  updateBullets: (bullets) => set({ bullets }),

  spawnEnemies: (count) => {
    const newEnemies = Array.from({ length: count }, () => makeEnemy(`enemy-${enemyIdCounter++}`));
    set((state) => ({ enemies: [...state.enemies, ...newEnemies] }));
  },

  updateEnemy: (id, updates) =>
    set((state) => ({ enemies: state.enemies.map((e) => e.id === id ? { ...e, ...updates } : e) })),

  killEnemy: (id, headshot = false) => {
    const { score, enemies, addKillFeed, spawnEnemies, mode } = get();
    const alive = enemies.filter((e) => e.alive && e.id !== id);
    const pts = headshot ? 250 : 100;
    set((state) => ({
      enemies: state.enemies.map((e) => e.id === id ? { ...e, alive: false, health: 0 } : e),
      score: score + pts,
    }));
    addKillFeed(headshot ? `HEADSHOT KILL! +${pts} pts` : `Enemy eliminated! +${pts} pts`);
    if (mode === "solo") {
      if (alive.length === 0) {
        set({ phase: "won" });
      } else if (alive.length <= 3) {
        spawnEnemies(2);
      }
    }
  },

  setEnemies: (enemies) => set({ enemies }),
  getEnemySkin: (index) => ENEMY_SKINS[index % ENEMY_SKINS.length],

  addKillFeed: (text) => {
    const kill: Kill = { id: `kill-${Date.now()}-${Math.random()}`, timestamp: Date.now(), text };
    set((state) => ({ kills: [kill, ...state.kills].slice(0, 5) }));
    setTimeout(() => {
      set((state) => ({ kills: state.kills.filter((k) => k.id !== kill.id) }));
    }, 3000);
  },

  startReload: () => {
    const { ammo, maxAmmo, isReloading, phase, selectedSlot } = get();
    if (selectedSlot === 4 || isReloading || ammo === maxAmmo || phase !== "playing") return;
    set({ isReloading: true, reloadProgress: 0 });
  },

  setReloadProgress: (p) => set({ reloadProgress: p }),

  finishReload: () => {
    const { selectedGun } = get();
    const gun = GUNS.find((g) => g.id === selectedGun)!;
    set({ ammo: gun.ammo, maxAmmo: gun.ammo, isReloading: false, reloadProgress: 0 });
  },
}));
