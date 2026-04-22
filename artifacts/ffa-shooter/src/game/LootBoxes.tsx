import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, LootBox } from "./useGameStore";

const COLLECT_RADIUS = 2.0;

const TYPE_CONFIG = {
  health: { color: "#ff4d6d", emissive: "#ff0040", label: "HP", labelColor: "#ff4d6d" },
  ammo:   { color: "#ffd60a", emissive: "#ff8800", label: "AMM", labelColor: "#ffd60a" },
  sword:  { color: "#48cae4", emissive: "#0077b6", label: "⚔", labelColor: "#48cae4" },
};

function LootBoxMesh({ box }: { box: LootBox }) {
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(Math.random() * Math.PI * 2);
  const collected = useRef(box.collected);
  const { camera } = useThree();
  const { collectLoot } = useGameStore();
  const cfg = TYPE_CONFIG[box.type];

  useFrame((_, delta) => {
    collected.current = useGameStore.getState().lootBoxes.find((b) => b.id === box.id)?.collected ?? false;
    const g = groupRef.current;
    if (!g) return;

    // Float and spin
    timeRef.current += delta * 1.2;
    g.position.y = box.position[1] + Math.sin(timeRef.current) * 0.18;
    g.rotation.y += delta * 1.0;

    if (collected.current) return;

    // Check proximity to player
    const px = camera.position.x;
    const pz = camera.position.z;
    const dx = box.position[0] - px;
    const dz = box.position[2] - pz;
    if (Math.sqrt(dx * dx + dz * dz) < COLLECT_RADIUS) {
      collectLoot(box.id);
    }
  });

  // Read collected state reactively
  const isCollected = useGameStore((s) => s.lootBoxes.find((b) => b.id === box.id)?.collected ?? false);
  if (isCollected) return null;

  return (
    <group ref={groupRef} position={box.position}>
      {/* Main crate body */}
      <mesh castShadow>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial
          color={cfg.color}
          emissive={cfg.emissive}
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      {/* Corner trims */}
      {[[-0.35, 0.35], [0.35, 0.35], [-0.35, -0.35], [0.35, -0.35]].map(([x, z], i) => (
        <mesh key={i} position={[x as number, 0, z as number]}>
          <boxGeometry args={[0.08, 0.74, 0.08]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}

      {/* Top edge */}
      <mesh position={[0, 0.355, 0]}>
        <boxGeometry args={[0.76, 0.06, 0.76]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>
      {/* Bottom edge */}
      <mesh position={[0, -0.355, 0]}>
        <boxGeometry args={[0.76, 0.06, 0.76]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Type-specific icon on front face */}
      {box.type === "health" && (
        <>
          {/* Red cross */}
          <mesh position={[0, 0, 0.362]}>
            <boxGeometry args={[0.12, 0.36, 0.04]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.362]}>
            <boxGeometry args={[0.36, 0.12, 0.04]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.4} />
          </mesh>
        </>
      )}
      {box.type === "ammo" && (
        <>
          {/* Bullet dots */}
          {[-0.14, 0, 0.14].map((x, i) => (
            <mesh key={i} position={[x, 0, 0.362]}>
              <cylinderGeometry args={[0.04, 0.04, 0.22, 6]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          ))}
        </>
      )}
      {box.type === "sword" && (
        <>
          {/* Sword blade */}
          <mesh position={[0, 0, 0.362]} rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.06, 0.44, 0.04]} />
            <meshStandardMaterial color="#e0f7fa" emissive="#48cae4" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Crossguard */}
          <mesh position={[0, 0, 0.362]} rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.06, 0.26, 0.04]} />
            <meshStandardMaterial color="#e0f7fa" emissive="#48cae4" emissiveIntensity={0.8} metalness={0.9} roughness={0.1} />
          </mesh>
        </>
      )}

      {/* Glow point light */}
      <pointLight
        color={cfg.emissive}
        intensity={1.2}
        distance={4}
        decay={2}
      />
    </group>
  );
}

export function LootBoxes() {
  const lootBoxes = useGameStore((s) => s.lootBoxes);
  return (
    <>
      {lootBoxes.map((box) => (
        <LootBoxMesh key={box.id} box={box} />
      ))}
    </>
  );
}
