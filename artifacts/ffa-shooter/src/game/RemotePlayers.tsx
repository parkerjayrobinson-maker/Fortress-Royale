import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Text } from "@react-three/drei";
import { useMultiplayerStore, RemotePlayer } from "./multiplayerStore";
import { SKINS } from "./useGameStore";

const FACE_COLORS: Record<string, string> = {
  arctic: "#c8b090",
  ghost: "#e8d8c0",
};

function colorsFor(skinId: string) {
  const skin = SKINS.find((s) => s.id === skinId) ?? SKINS[0];
  return {
    body: skin.bodyColor,
    head: skin.headColor,
    armor: skin.armorColor,
    accent: skin.accentColor,
    face: FACE_COLORS[skinId] ?? "#c8946a",
  };
}

function RemoteCharacter({ player }: { player: RemotePlayer }) {
  const groupRef = useRef<THREE.Group>(null);
  const lastPos = useRef(new THREE.Vector3(player.x, player.y, player.z));
  const targetPos = useRef(new THREE.Vector3(player.x, player.y, player.z));
  const targetYaw = useRef(player.yaw);
  const walkPhase = useRef(0);
  const isMoving = useRef(false);

  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useEffect(() => {
    targetPos.current.set(player.x, player.y, player.z);
    targetYaw.current = player.yaw;
  }, [player.x, player.y, player.z, player.yaw]);

  useFrame((_, delta) => {
    const g = groupRef.current;
    if (!g) return;

    const lerpFactor = Math.min(delta * 12, 1);
    g.position.lerp(targetPos.current, lerpFactor);
    // ground the model so feet sit at ground
    g.position.y = Math.max(0, g.position.y - 0.9);

    // Smoothly rotate toward target yaw
    let dy = targetYaw.current + Math.PI - g.rotation.y;
    while (dy > Math.PI) dy -= Math.PI * 2;
    while (dy < -Math.PI) dy += Math.PI * 2;
    g.rotation.y += dy * lerpFactor;

    const dx = targetPos.current.x - lastPos.current.x;
    const dz = targetPos.current.z - lastPos.current.z;
    const speed = Math.sqrt(dx * dx + dz * dz) / Math.max(delta, 0.001);
    isMoving.current = speed > 0.5;
    if (isMoving.current) walkPhase.current += delta * Math.min(speed, 8) * 0.72;
    lastPos.current.copy(targetPos.current);

    const target = isMoving.current ? Math.sin(walkPhase.current) * 0.48 : 0;
    const lerp = isMoving.current ? 0.25 : 0.15;
    if (leftLegRef.current)
      leftLegRef.current.rotation.x +=
        (target - leftLegRef.current.rotation.x) * lerp;
    if (rightLegRef.current)
      rightLegRef.current.rotation.x +=
        (-target - rightLegRef.current.rotation.x) * lerp;
    if (leftArmRef.current)
      leftArmRef.current.rotation.x +=
        (-target * 0.4 - leftArmRef.current.rotation.x) * lerp;
    if (rightArmRef.current)
      rightArmRef.current.rotation.x +=
        (target * 0.4 - rightArmRef.current.rotation.x) * lerp;
  });

  if (!player.alive) return null;

  const c = colorsFor(player.skin);
  const healthFrac = Math.max(0, Math.min(1, player.health / 100));

  return (
    <group ref={groupRef} position={[player.x, 0, player.z]}>
      {/* Legs */}
      <group ref={leftLegRef} position={[-0.13, 0.79, 0]}>
        <mesh castShadow position={[0, -0.27, 0]}>
          <boxGeometry args={[0.22, 0.54, 0.22]} />
          <meshLambertMaterial color={c.body} />
        </mesh>
        <mesh castShadow position={[0, -0.66, 0.04]}>
          <boxGeometry args={[0.22, 0.26, 0.30]} />
          <meshLambertMaterial color="#1a0f00" />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.13, 0.79, 0]}>
        <mesh castShadow position={[0, -0.27, 0]}>
          <boxGeometry args={[0.22, 0.54, 0.22]} />
          <meshLambertMaterial color={c.body} />
        </mesh>
        <mesh castShadow position={[0, -0.66, 0.04]}>
          <boxGeometry args={[0.22, 0.26, 0.30]} />
          <meshLambertMaterial color="#1a0f00" />
        </mesh>
      </group>

      {/* Torso */}
      <mesh castShadow position={[0, 1.06, 0]}>
        <boxGeometry args={[0.58, 0.60, 0.34]} />
        <meshLambertMaterial color={c.armor} />
      </mesh>
      <mesh position={[0, 1.06, 0.18]}>
        <boxGeometry args={[0.40, 0.46, 0.03]} />
        <meshLambertMaterial color={c.accent} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.77, 0]}>
        <boxGeometry args={[0.56, 0.11, 0.36]} />
        <meshLambertMaterial color="#0d0d0d" />
      </mesh>

      {/* Shoulders */}
      <mesh castShadow position={[-0.36, 1.24, 0]}>
        <boxGeometry args={[0.18, 0.16, 0.40]} />
        <meshLambertMaterial color={c.armor} />
      </mesh>
      <mesh castShadow position={[0.36, 1.24, 0]}>
        <boxGeometry args={[0.18, 0.16, 0.40]} />
        <meshLambertMaterial color={c.armor} />
      </mesh>

      {/* Arms */}
      <group ref={leftArmRef} position={[-0.34, 1.10, 0]}>
        <mesh castShadow position={[0, -0.13, 0]}>
          <capsuleGeometry args={[0.09, 0.34, 4, 8]} />
          <meshLambertMaterial color={c.armor} />
        </mesh>
        <mesh position={[0, -0.40, 0]}>
          <sphereGeometry args={[0.09, 6, 5]} />
          <meshLambertMaterial color={c.face} />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.34, 1.10, 0]}>
        <mesh castShadow position={[0, -0.13, 0]}>
          <capsuleGeometry args={[0.09, 0.34, 4, 8]} />
          <meshLambertMaterial color={c.armor} />
        </mesh>
        <mesh position={[0, -0.40, 0]}>
          <sphereGeometry args={[0.09, 6, 5]} />
          <meshLambertMaterial color={c.face} />
        </mesh>
      </group>

      {/* Head */}
      <mesh position={[0, 1.38, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.13, 8]} />
        <meshLambertMaterial color={c.face} />
      </mesh>
      <mesh castShadow position={[0, 1.66, 0]}>
        <boxGeometry args={[0.40, 0.42, 0.38]} />
        <meshLambertMaterial color={c.head} />
      </mesh>
      <mesh position={[0, 1.64, 0.20]}>
        <boxGeometry args={[0.30, 0.30, 0.02]} />
        <meshLambertMaterial color={c.face} />
      </mesh>
      <mesh position={[-0.09, 1.70, 0.22]}>
        <boxGeometry args={[0.07, 0.06, 0.02]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.09, 1.70, 0.22]}>
        <boxGeometry args={[0.07, 0.06, 0.02]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      <mesh castShadow position={[0, 1.88, 0]}>
        <boxGeometry args={[0.44, 0.22, 0.42]} />
        <meshLambertMaterial color={c.body} />
      </mesh>

      {/* Simple gun */}
      <group position={[0.34, 0.90, -0.32]}>
        <mesh>
          <boxGeometry args={[0.07, 0.07, 0.40]} />
          <meshLambertMaterial color="#546e7a" />
        </mesh>
        <mesh position={[0, 0, -0.27]}>
          <cylinderGeometry args={[0.014, 0.014, 0.28, 6]} rotation={[Math.PI / 2, 0, 0]} />
          <meshLambertMaterial color="#37474f" />
        </mesh>
      </group>

      {/* Name tag */}
      <Text
        position={[0, 2.7, 0]}
        fontSize={0.28}
        color="#ffffff"
        outlineColor="#000000"
        outlineWidth={0.025}
        anchorX="center"
        anchorY="middle"
      >
        {player.name}
      </Text>

      {/* Health bar */}
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[1.0, 0.1, 0.04]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.5 + (healthFrac * 1.0) / 2, 2.45, 0.03]}>
        <boxGeometry args={[Math.max(0.001, healthFrac * 1.0), 0.075, 0.04]} />
        <meshBasicMaterial color={healthFrac > 0.5 ? "#00e676" : healthFrac > 0.25 ? "#ffb300" : "#ff1744"} />
      </mesh>
    </group>
  );
}

export function RemotePlayers() {
  const players = useMultiplayerStore((s) => s.players);
  const enabled = useMultiplayerStore((s) => s.enabled);
  if (!enabled) return null;
  return (
    <>
      {Object.values(players).map((p) => (
        <RemoteCharacter key={p.id} player={p} />
      ))}
    </>
  );
}
