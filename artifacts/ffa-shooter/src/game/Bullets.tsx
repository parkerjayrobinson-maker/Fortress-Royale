import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, Bullet } from "./useGameStore";
import { ENEMY_HEAD_CENTER_Y, ENEMY_HEAD_RADIUS, ENEMY_BODY_CENTER_Y, ENEMY_BODY_RADIUS } from "./Enemies";

const BULLET_LIFETIME = 3000;
const HEADSHOT_MULTIPLIER = 2.5;

// Returns true if the segment p0→p1 passes within `radius` of `center`
function segmentHitsSphere(
  p0: THREE.Vector3, p1: THREE.Vector3,
  center: THREE.Vector3, radius: number
): boolean {
  const d = new THREE.Vector3().subVectors(p1, p0);
  const f = new THREE.Vector3().subVectors(p0, center);
  const a = d.dot(d);
  if (a < 1e-10) return p0.distanceTo(center) < radius;
  const b = 2 * f.dot(d);
  const c = f.dot(f) - radius * radius;
  const disc = b * b - 4 * a * c;
  if (disc < 0) return false;
  const sq = Math.sqrt(disc);
  const t1 = (-b - sq) / (2 * a);
  const t2 = (-b + sq) / (2 * a);
  // Hit if either root is in [0,1], or segment is fully inside sphere
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1);
}

function BulletMesh({ bullet }: { bullet: Bullet }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  const store = useGameStore();
  const pos = useRef(new THREE.Vector3(...bullet.position));
  const prevPos = useRef(new THREE.Vector3(...bullet.position));
  const dir = useRef(new THREE.Vector3(...bullet.direction));

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const now = Date.now();
    if (now - bullet.createdAt > BULLET_LIFETIME) {
      store.removeBullet(bullet.id);
      return;
    }

    prevPos.current.copy(pos.current);
    pos.current.addScaledVector(dir.current, bullet.speed * delta);
    meshRef.current.position.copy(pos.current);
    if (trailRef.current) {
      trailRef.current.position.copy(pos.current);
      trailRef.current.lookAt(pos.current.clone().add(dir.current));
    }

    if (bullet.fromPlayer) {
      const { enemies, killEnemy, addKillFeed } = useGameStore.getState();
      for (const enemy of enemies) {
        if (!enemy.alive) continue;
        const ex = enemy.position[0];
        const ez = enemy.position[2];

        // --- HEAD swept check ---
        const headCenter = new THREE.Vector3(ex, ENEMY_HEAD_CENTER_Y, ez);
        if (segmentHitsSphere(prevPos.current, pos.current, headCenter, ENEMY_HEAD_RADIUS)) {
          const hsDamage = bullet.damage * HEADSHOT_MULTIPLIER;
          const newHealth = enemy.health - hsDamage;
          if (newHealth <= 0) {
            killEnemy(enemy.id, true);
          } else {
            useGameStore.getState().updateEnemy(enemy.id, { health: newHealth });
            addKillFeed(`HEADSHOT! -${Math.round(hsDamage)} dmg`);
          }
          store.removeBullet(bullet.id);
          return;
        }

        // --- BODY swept check ---
        const bodyCenter = new THREE.Vector3(ex, ENEMY_BODY_CENTER_Y, ez);
        if (segmentHitsSphere(prevPos.current, pos.current, bodyCenter, ENEMY_BODY_RADIUS)) {
          const newHealth = enemy.health - bullet.damage;
          if (newHealth <= 0) {
            killEnemy(enemy.id, false);
          } else {
            useGameStore.getState().updateEnemy(enemy.id, { health: newHealth });
          }
          store.removeBullet(bullet.id);
          return;
        }
      }
    } else {
      // Enemy bullet → player hitbox near camera
      const playerPos = camera.position.clone();
      if (segmentHitsSphere(prevPos.current, pos.current, playerPos, 0.9)) {
        store.takeDamage(bullet.damage);
        store.removeBullet(bullet.id);
        return;
      }
    }

    if (pos.current.y < -3) {
      store.removeBullet(bullet.id);
    }
  });

  const color = bullet.fromPlayer ? "#ffe066" : "#ff4444";
  const glowColor = bullet.fromPlayer ? "#ffcc00" : "#ff0000";

  return (
    <>
      <mesh ref={meshRef} position={bullet.position}>
        <sphereGeometry args={[0.055, 6, 5]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={trailRef} position={bullet.position}>
        <cylinderGeometry args={[0.012, 0.012, 0.28, 4]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.5} />
      </mesh>
    </>
  );
}

export function Bullets() {
  const { bullets } = useGameStore();
  return (
    <>
      {bullets.map((b) => (
        <BulletMesh key={b.id} bullet={b} />
      ))}
    </>
  );
}
