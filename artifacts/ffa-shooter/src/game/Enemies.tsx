import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, Enemy } from "./useGameStore";

const ENEMY_SPEED = 3;
const SHOOT_RANGE = 30;
const SHOOT_COOLDOWN = 2000;
const CHASE_RANGE = 40;
const BULLET_SPEED = 35;

const ENEMY_SKINS = [
  { bodyColor: "#b71c1c", headColor: "#ef5350", armorColor: "#7f0000", accentColor: "#ff8a80", helmetColor: "#4e0000", faceColor: "#c8946a" },
  { bodyColor: "#4a148c", headColor: "#9c27b0", armorColor: "#38006b", accentColor: "#e040fb", helmetColor: "#2a0050", faceColor: "#c07850" },
  { bodyColor: "#01579b", headColor: "#1e88e5", armorColor: "#003c8f", accentColor: "#82b1ff", helmetColor: "#002171", faceColor: "#b8916a" },
  { bodyColor: "#1b5e20", headColor: "#43a047", armorColor: "#003300", accentColor: "#69f0ae", helmetColor: "#002200", faceColor: "#c09060" },
  { bodyColor: "#bf360c", headColor: "#e64a19", armorColor: "#7f1600", accentColor: "#ff6e40", helmetColor: "#6a1200", faceColor: "#c87840" },
];

// Exported hitbox constants used by Bullets.tsx
export const ENEMY_HEAD_CENTER_Y = 1.66;
export const ENEMY_HEAD_RADIUS   = 0.26;
export const ENEMY_BODY_CENTER_Y = 0.85;
export const ENEMY_BODY_RADIUS   = 0.52;

type EnemySkin = typeof ENEMY_SKINS[0];

// ── EnemyCharacter ────────────────────────────────────────────────────────────
function EnemyCharacter({
  skin,
  walkPhaseRef,
  isMovingRef,
}: {
  skin: EnemySkin;
  walkPhaseRef: React.MutableRefObject<number>;
  isMovingRef: React.MutableRefObject<boolean>;
}) {
  const leftLegRef  = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef  = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const moving = isMovingRef.current;
    const phase  = walkPhaseRef.current;
    const target = moving ? Math.sin(phase) * 0.48 : 0;
    const lerp   = moving ? 0.25 : 0.15;
    if (leftLegRef.current)  leftLegRef.current.rotation.x  += (target  - leftLegRef.current.rotation.x)  * lerp;
    if (rightLegRef.current) rightLegRef.current.rotation.x += (-target - rightLegRef.current.rotation.x) * lerp;
    if (leftArmRef.current)  leftArmRef.current.rotation.x  += (-target * 0.4 - leftArmRef.current.rotation.x)  * lerp;
    if (rightArmRef.current) rightArmRef.current.rotation.x += (target  * 0.4 - rightArmRef.current.rotation.x) * lerp;
  });

  return (
    <group>
      {/* ── LEFT LEG pivot at hip y=0.79 ── */}
      <group ref={leftLegRef} position={[-0.13, 0.79, 0]}>
        <mesh castShadow position={[0, -0.27, 0]}>
          <boxGeometry args={[0.22, 0.54, 0.22]} />
          <meshLambertMaterial color={skin.bodyColor} />
        </mesh>
        <mesh position={[0, -0.19, 0.125]}>
          <boxGeometry args={[0.20, 0.14, 0.05]} />
          <meshLambertMaterial color={skin.armorColor} />
        </mesh>
        <mesh castShadow position={[0, -0.66, 0.04]}>
          <boxGeometry args={[0.22, 0.26, 0.30]} />
          <meshLambertMaterial color="#1a0f00" />
        </mesh>
      </group>

      {/* ── RIGHT LEG pivot at hip y=0.79 ── */}
      <group ref={rightLegRef} position={[0.13, 0.79, 0]}>
        <mesh castShadow position={[0, -0.27, 0]}>
          <boxGeometry args={[0.22, 0.54, 0.22]} />
          <meshLambertMaterial color={skin.bodyColor} />
        </mesh>
        <mesh position={[0, -0.19, 0.125]}>
          <boxGeometry args={[0.20, 0.14, 0.05]} />
          <meshLambertMaterial color={skin.armorColor} />
        </mesh>
        <mesh castShadow position={[0, -0.66, 0.04]}>
          <boxGeometry args={[0.22, 0.26, 0.30]} />
          <meshLambertMaterial color="#1a0f00" />
        </mesh>
      </group>

      {/* Torso */}
      <mesh castShadow position={[0, 1.06, 0]}>
        <boxGeometry args={[0.58, 0.60, 0.34]} />
        <meshLambertMaterial color={skin.armorColor} />
      </mesh>
      <mesh position={[0, 1.06, 0.18]}>
        <boxGeometry args={[0.40, 0.46, 0.03]} />
        <meshLambertMaterial color={skin.accentColor} />
      </mesh>
      <mesh position={[-0.31, 1.06, 0.01]}>
        <boxGeometry args={[0.04, 0.50, 0.36]} />
        <meshLambertMaterial color={skin.accentColor} transparent opacity={0.5} />
      </mesh>
      {/* Belt */}
      <mesh position={[0, 0.77, 0]}>
        <boxGeometry args={[0.56, 0.11, 0.36]} />
        <meshLambertMaterial color="#0d0d0d" />
      </mesh>
      <mesh position={[0, 0.77, 0.19]}>
        <boxGeometry args={[0.14, 0.09, 0.03]} />
        <meshLambertMaterial color="#ffd600" />
      </mesh>

      {/* Shoulder pads */}
      <mesh castShadow position={[-0.36, 1.24, 0]}>
        <boxGeometry args={[0.18, 0.16, 0.40]} />
        <meshLambertMaterial color={skin.armorColor} />
      </mesh>
      <mesh castShadow position={[0.36, 1.24, 0]}>
        <boxGeometry args={[0.18, 0.16, 0.40]} />
        <meshLambertMaterial color={skin.armorColor} />
      </mesh>

      {/* ── LEFT ARM pivot at shoulder y=1.10 ── */}
      <group ref={leftArmRef} position={[-0.34, 1.10, 0]}>
        <mesh castShadow position={[0, -0.13, 0]}>
          <capsuleGeometry args={[0.09, 0.34, 4, 8]} />
          <meshLambertMaterial color={skin.armorColor} />
        </mesh>
        <mesh position={[0, -0.40, 0]}>
          <sphereGeometry args={[0.09, 6, 5]} />
          <meshLambertMaterial color={skin.faceColor} />
        </mesh>
      </group>

      {/* ── RIGHT ARM pivot at shoulder y=1.10 — gun arm ── */}
      <group ref={rightArmRef} position={[0.34, 1.10, 0]}>
        <mesh castShadow position={[0, -0.13, 0]}>
          <capsuleGeometry args={[0.09, 0.34, 4, 8]} />
          <meshLambertMaterial color={skin.armorColor} />
        </mesh>
        <mesh position={[0, -0.40, 0]}>
          <sphereGeometry args={[0.09, 6, 5]} />
          <meshLambertMaterial color={skin.faceColor} />
        </mesh>
      </group>

      {/* Neck */}
      <mesh position={[0, 1.38, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.13, 8]} />
        <meshLambertMaterial color={skin.faceColor} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.66, 0]}>
        <boxGeometry args={[0.40, 0.42, 0.38]} />
        <meshLambertMaterial color={skin.headColor} />
      </mesh>
      <mesh position={[0, 1.64, 0.20]}>
        <boxGeometry args={[0.30, 0.30, 0.02]} />
        <meshLambertMaterial color={skin.faceColor} />
      </mesh>
      {/* Glowing red eyes */}
      <mesh position={[-0.08, 1.70, 0.22]}>
        <boxGeometry args={[0.07, 0.06, 0.02]} />
        <meshLambertMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0.08, 1.70, 0.22]}>
        <boxGeometry args={[0.07, 0.06, 0.02]} />
        <meshLambertMaterial color="#ff1744" emissive="#ff1744" emissiveIntensity={0.8} />
      </mesh>
      {/* Angry brows */}
      <mesh position={[-0.08, 1.78, 0.21]} rotation={[0, 0, 0.35]}>
        <boxGeometry args={[0.09, 0.03, 0.02]} />
        <meshLambertMaterial color="#0d0d0d" />
      </mesh>
      <mesh position={[0.08, 1.78, 0.21]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.09, 0.03, 0.02]} />
        <meshLambertMaterial color="#0d0d0d" />
      </mesh>
      {/* Helmet */}
      <mesh castShadow position={[0, 1.88, 0]}>
        <boxGeometry args={[0.44, 0.22, 0.42]} />
        <meshLambertMaterial color={skin.helmetColor} />
      </mesh>
      <mesh position={[0.23, 1.88, 0]}>
        <boxGeometry args={[0.03, 0.20, 0.44]} />
        <meshLambertMaterial color={skin.accentColor} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 1.72, 0.21]}>
        <boxGeometry args={[0.32, 0.12, 0.02]} />
        <meshLambertMaterial color={skin.accentColor} transparent opacity={0.8} />
      </mesh>

      {/* Gun in right hand (local +X = toward camera after enemy faces player) */}
      <group position={[0.34, 0.90, -0.32]} rotation={[0, 0.12, 0]}>
        <mesh><boxGeometry args={[0.07, 0.07, 0.40]} /><meshLambertMaterial color="#546e7a" /></mesh>
        <mesh position={[0, 0, -0.27]}><cylinderGeometry args={[0.014, 0.014, 0.28, 6]} rotation={[Math.PI/2,0,0]} /><meshLambertMaterial color="#37474f" /></mesh>
        <mesh position={[0, -0.065, -0.12]}><boxGeometry args={[0.05, 0.09, 0.06]} /><meshLambertMaterial color="#263238" /></mesh>
      </group>
    </group>
  );
}

// ── EnemyMesh ─────────────────────────────────────────────────────────────────
function EnemyMesh({ enemy }: { enemy: Enemy }) {
  const meshRef    = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { updateEnemy, killEnemy, addBullet, phase } = useGameStore();

  const pos         = useRef(new THREE.Vector3(...enemy.position));
  const walkPhaseRef = useRef(Math.random() * Math.PI * 2);
  const isMovingRef  = useRef(false);
  const skin = ENEMY_SKINS[enemy.skinIndex % ENEMY_SKINS.length];

  useFrame((_, delta) => {
    if (!enemy.alive || phase !== "playing") return;
    const mesh = meshRef.current;
    if (!mesh) return;

    const playerPos = camera.position.clone();
    playerPos.y = 0;
    const enemyPos = pos.current.clone();
    enemyPos.y = 0;

    const toPlayer = playerPos.clone().sub(enemyPos);
    const dist = toPlayer.length();

    if (dist < CHASE_RANGE) {
      isMovingRef.current = true;
      const dir = toPlayer.normalize();
      const newPos = pos.current.clone().addScaledVector(dir, ENEMY_SPEED * delta);
      pos.current.copy(newPos);
      mesh.position.set(newPos.x, 0, newPos.z);
      mesh.lookAt(playerPos.x, 0, playerPos.z);
      walkPhaseRef.current += delta * ENEMY_SPEED * 0.75;

      if (dist < SHOOT_RANGE) {
        const now = Date.now();
        if (now - enemy.lastShot > SHOOT_COOLDOWN) {
          updateEnemy(enemy.id, { lastShot: now });
          const shootDir = new THREE.Vector3(
            camera.position.x - pos.current.x,
            camera.position.y - pos.current.y,
            camera.position.z - pos.current.z
          ).normalize();
          const spread = 0.05;
          shootDir.x += (Math.random() - 0.5) * spread;
          shootDir.y += (Math.random() - 0.5) * spread;
          shootDir.z += (Math.random() - 0.5) * spread;
          shootDir.normalize();
          addBullet({
            id: `eb-${now}-${Math.random()}`,
            position: [pos.current.x, pos.current.y + 1.3, pos.current.z],
            direction: [shootDir.x, shootDir.y, shootDir.z],
            speed: BULLET_SPEED,
            createdAt: now,
            fromPlayer: false,
            damage: 15,
          });
        }
      }
      updateEnemy(enemy.id, { position: [pos.current.x, 0, pos.current.z] });
    } else {
      isMovingRef.current = false;
    }
  });

  useEffect(() => {
    pos.current.set(enemy.position[0], 0, enemy.position[2]);
  }, []);

  if (!enemy.alive) return null;

  const healthFrac = enemy.health / enemy.maxHealth;

  return (
    <group ref={meshRef} position={[enemy.position[0], 0, enemy.position[2]]}>
      <EnemyCharacter skin={skin} walkPhaseRef={walkPhaseRef} isMovingRef={isMovingRef} />
      {/* Health bar */}
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[1.0, 0.12, 0.06]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.5 + (healthFrac * 1.0) / 2, 2.45, 0.04]}>
        <boxGeometry args={[healthFrac * 1.0, 0.09, 0.04]} />
        <meshBasicMaterial color={healthFrac > 0.5 ? "#00e676" : healthFrac > 0.25 ? "#ffb300" : "#ff1744"} />
      </mesh>
    </group>
  );
}

export function Enemies() {
  const { enemies } = useGameStore();
  return (
    <>
      {enemies.map((enemy) => (
        <EnemyMesh key={enemy.id} enemy={enemy} />
      ))}
    </>
  );
}
