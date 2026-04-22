import { useMemo } from "react";
import { RigidBody } from "@react-three/rapier";

function WindowPane({ pos }: { pos: [number, number, number] }) {
  return (
    <mesh position={pos}>
      <boxGeometry args={[0.65, 0.7, 0.06]} />
      <meshLambertMaterial color="#b3e5fc" transparent opacity={0.85} />
    </mesh>
  );
}

function Building({
  position, w, h, d, wallColor, roofColor, accentColor = "#ffffff",
}: {
  position: [number, number, number]; w: number; h: number; d: number;
  wallColor: string; roofColor: string; accentColor?: string;
}) {
  const rows = Math.floor(h / 3.5);
  return (
    <group position={[position[0], h / 2, position[2]]}>
      {/* Main body */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshLambertMaterial color={wallColor} />
        </mesh>
      </RigidBody>
      {/* Roof ledge */}
      <mesh castShadow position={[0, h / 2 + 0.2, 0]}>
        <boxGeometry args={[w + 0.5, 0.4, d + 0.5]} />
        <meshLambertMaterial color={roofColor} />
      </mesh>
      {/* Roof top */}
      <mesh castShadow position={[0, h / 2 + 0.55, 0]}>
        <boxGeometry args={[w + 0.1, 0.3, d + 0.1]} />
        <meshLambertMaterial color={accentColor} />
      </mesh>
      {/* Front windows */}
      {Array.from({ length: rows }, (_, r) =>
        [-w * 0.25, w * 0.25].map((ox, ci) => (
          <WindowPane key={`fw-${r}-${ci}`} pos={[ox, -h / 2 + 1.2 + r * 3.5, d / 2 + 0.04]} />
        ))
      )}
      {/* Side windows */}
      {rows > 0 && (
        <WindowPane pos={[d / 2 + 0.04, -h / 2 + 1.5, 0]} />
      )}
      {/* Door */}
      <mesh position={[0, -h / 2 + 1.1, d / 2 + 0.04]}>
        <boxGeometry args={[0.9, 2.2, 0.06]} />
        <meshLambertMaterial color="#5d3a1a" />
      </mesh>
      {/* Door frame */}
      <mesh position={[0, -h / 2 + 1.1, d / 2 + 0.03]}>
        <boxGeometry args={[1.1, 2.4, 0.04]} />
        <meshLambertMaterial color={roofColor} />
      </mesh>
    </group>
  );
}

function RoundTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow position={[0, 1.6, 0]}>
          <cylinderGeometry args={[0.2, 0.32, 3.2, 8]} />
          <meshLambertMaterial color="#795548" />
        </mesh>
      </RigidBody>
      <mesh castShadow position={[0, 4.7, 0]}>
        <sphereGeometry args={[2.0, 9, 8]} />
        <meshLambertMaterial color="#388e3c" />
      </mesh>
      <mesh castShadow position={[1.0, 3.8, 0.7]}>
        <sphereGeometry args={[1.35, 9, 8]} />
        <meshLambertMaterial color="#43a047" />
      </mesh>
      <mesh castShadow position={[-0.8, 4.0, -0.6]}>
        <sphereGeometry args={[1.2, 9, 8]} />
        <meshLambertMaterial color="#4caf50" />
      </mesh>
      <mesh castShadow position={[0.4, 5.8, -0.3]}>
        <sphereGeometry args={[1.1, 9, 8]} />
        <meshLambertMaterial color="#2e7d32" />
      </mesh>
    </group>
  );
}

function Crate({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders="cuboid">
      <group>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshLambertMaterial color="#c4a35a" />
        </mesh>
        {[-0.35, 0.35].map((y) => (
          <mesh key={y} position={[0, y, 0.62]}>
            <boxGeometry args={[1.22, 0.07, 0.03]} />
            <meshLambertMaterial color="#7b5c2a" />
          </mesh>
        ))}
        {[-0.35, 0.35].map((x) => (
          <mesh key={x} position={[x, 0, 0.62]}>
            <boxGeometry args={[0.07, 1.22, 0.03]} />
            <meshLambertMaterial color="#7b5c2a" />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}

function Barrel({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody type="fixed" position={position} colliders="cuboid">
      <group>
        <mesh castShadow>
          <cylinderGeometry args={[0.33, 0.33, 0.9, 10]} />
          <meshLambertMaterial color="#d32f2f" />
        </mesh>
        {[-0.3, 0.3].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <torusGeometry args={[0.34, 0.03, 6, 12]} />
            <meshLambertMaterial color="#3e2723" />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}

function StoneWall({ position, size, rotation = 0 }: {
  position: [number, number, number]; size: [number, number, number]; rotation?: number;
}) {
  return (
    <RigidBody type="fixed" position={position} rotation={[0, rotation, 0]} colliders="cuboid">
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshLambertMaterial color="#9e9e9e" />
      </mesh>
    </RigidBody>
  );
}

function Sandbags({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {[[-0.55, 0.3, 0], [0, 0.3, 0], [0.55, 0.3, 0]].map(([x, y, z], i) => (
        <RigidBody key={i} type="fixed" colliders="cuboid" position={[x, y, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.35, 0.7]} />
            <meshLambertMaterial color="#a1887f" />
          </mesh>
        </RigidBody>
      ))}
      {[[-0.28, 0.66, 0], [0.28, 0.66, 0]].map(([x, y, z], i) => (
        <RigidBody key={`top-${i}`} type="fixed" colliders="cuboid" position={[x, y, z]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 0.35, 0.7]} />
            <meshLambertMaterial color="#8d6e63" />
          </mesh>
        </RigidBody>
      ))}
    </group>
  );
}

function Fountain() {
  return (
    <group position={[0, 0, 0]}>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow>
          <cylinderGeometry args={[3.8, 4.2, 0.7, 14]} />
          <meshLambertMaterial color="#90a4ae" />
        </mesh>
      </RigidBody>
      <mesh position={[0, 0.42, 0]}>
        <cylinderGeometry args={[3.5, 3.5, 0.12, 14]} />
        <meshLambertMaterial color="#4dd0e1" transparent opacity={0.8} />
      </mesh>
      <RigidBody type="fixed" colliders="cuboid">
        <mesh castShadow position={[0, 1.5, 0]}>
          <cylinderGeometry args={[0.45, 0.55, 2.2, 10]} />
          <meshLambertMaterial color="#b0bec5" />
        </mesh>
      </RigidBody>
      <mesh castShadow position={[0, 2.7, 0]}>
        <cylinderGeometry args={[1.1, 0.9, 0.45, 12]} />
        <meshLambertMaterial color="#b0bec5" />
      </mesh>
      <mesh position={[0, 3.0, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.12, 12]} />
        <meshLambertMaterial color="#4dd0e1" transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

function GrassPatch({ position, size }: { position: [number, number, number]; size: [number, number] }) {
  return (
    <mesh receiveShadow position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={size} />
      <meshLambertMaterial color="#558b2f" />
    </mesh>
  );
}

export function World() {
  const buildings = useMemo(() => [
    { position: [-22, 0, -22] as [number,number,number], w: 9,  h: 11, d: 9,  wallColor: "#fff3e0", roofColor: "#bf360c", accentColor: "#ff8f00" },
    { position: [22,  0, -24] as [number,number,number], w: 7,  h: 15, d: 7,  wallColor: "#e8eaf6", roofColor: "#283593", accentColor: "#5c6bc0" },
    { position: [-30, 0, 15]  as [number,number,number], w: 10, h: 9,  d: 10, wallColor: "#e8f5e9", roofColor: "#1b5e20", accentColor: "#66bb6a" },
    { position: [25,  0, 20]  as [number,number,number], w: 7,  h: 13, d: 7,  wallColor: "#fce4ec", roofColor: "#880e4f", accentColor: "#f48fb1" },
    { position: [0,   0, -36] as [number,number,number], w: 11, h: 17, d: 9,  wallColor: "#fff8e1", roofColor: "#e65100", accentColor: "#ffa726" },
    { position: [-16, 0, 30]  as [number,number,number], w: 8,  h: 11, d: 8,  wallColor: "#e0f7fa", roofColor: "#004d40", accentColor: "#4dd0e1" },
    { position: [36,  0, -10] as [number,number,number], w: 7,  h: 19, d: 7,  wallColor: "#f3e5f5", roofColor: "#4a148c", accentColor: "#ce93d8" },
    { position: [-36, 0, -5]  as [number,number,number], w: 10, h: 13, d: 10, wallColor: "#fffde7", roofColor: "#f57f17", accentColor: "#ffee58" },
    { position: [10,  0, 36]  as [number,number,number], w: 8,  h: 9,  d: 8,  wallColor: "#fbe9e7", roofColor: "#bf360c", accentColor: "#ff7043" },
    { position: [-26, 0, -36] as [number,number,number], w: 9,  h: 15, d: 9,  wallColor: "#e8eaf6", roofColor: "#1a237e", accentColor: "#7986cb" },
  ], []);

  const trees = useMemo(() => [
    [18, 0, 18], [-18, 0, 18], [18, 0, -18], [-18, 0, -18],
    [32, 0, 5],  [-32, 0, 5],  [5, 0, 32],   [-5, 0, 32],
    [5, 0, -32], [-5, 0, -32], [28, 0, -28], [-28, 0, 28],
    [42, 0, 12], [-42, 0, -14], [14, 0, 42],  [-14, 0, -42],
    [22, 0, 0],  [-22, 0, 0],  [0, 0, 22],   [0, 0, -22],
    [38, 0, 32], [-38, 0, 32], [38, 0, -32], [-38, 0, -32],
  ] as [number, number, number][], []);

  return (
    <>
      {/* Ground base */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[300, 300]} />
          <meshLambertMaterial color="#6ab04c" />
        </mesh>
      </RigidBody>

      {/* Darker grass patches */}
      <GrassPatch position={[-30, 0.01, -30]} size={[18, 18]} />
      <GrassPatch position={[30, 0.01, 30]}   size={[16, 16]} />
      <GrassPatch position={[-30, 0.01, 30]}  size={[14, 14]} />
      <GrassPatch position={[30, 0.01, -30]}  size={[15, 15]} />

      {/* Dirt paths (cross shape) */}
      <mesh receiveShadow position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[5, 80]} />
        <meshLambertMaterial color="#a5845c" />
      </mesh>
      <mesh receiveShadow position={[0, 0.008, 0]} rotation={[-Math.PI / 2, Math.PI / 2, 0]}>
        <planeGeometry args={[5, 80]} />
        <meshLambertMaterial color="#a5845c" />
      </mesh>

      {/* Plaza stone */}
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[26, 0.04, 26]} />
        <meshLambertMaterial color="#c8c8c8" />
      </mesh>
      {/* Plaza border trim */}
      {[[-12, 0, -12], [-12, 0, 12], [12, 0, -12], [12, 0, 12]].map(([x, y, z], i) => (
        <mesh key={i} receiveShadow position={[x, 0.06, z]}>
          <boxGeometry args={[2, 0.08, 2]} />
          <meshLambertMaterial color="#bdbdbd" />
        </mesh>
      ))}

      <Fountain />

      {/* Buildings */}
      {buildings.map((b, i) => (
        <Building key={i} {...b} />
      ))}

      {/* Stone walls */}
      <StoneWall position={[9, 1.1, 9]}   size={[7, 2.2, 0.55]} />
      <StoneWall position={[-9, 1.1, 9]}  size={[7, 2.2, 0.55]} />
      <StoneWall position={[9, 1.1, -9]}  size={[0.55, 2.2, 7]} />
      <StoneWall position={[-9, 1.1, -9]} size={[0.55, 2.2, 7]} />
      <StoneWall position={[16, 1.0, 0]}  size={[0.55, 2.0, 9]} />
      <StoneWall position={[-16, 1.0, 0]} size={[0.55, 2.0, 9]} />
      <StoneWall position={[0, 1.0, 16]}  size={[9, 2.0, 0.55]} />
      <StoneWall position={[0, 1.0, -16]} size={[9, 2.0, 0.55]} />

      {/* Sandbags */}
      <Sandbags position={[6, 0, 6]} />
      <Sandbags position={[-6, 0, 6]} rotation={Math.PI} />
      <Sandbags position={[6, 0, -6]} rotation={Math.PI / 2} />
      <Sandbags position={[-6, 0, -6]} rotation={-Math.PI / 2} />
      <Sandbags position={[14, 0, 14]} />
      <Sandbags position={[-14, 0, -14]} rotation={Math.PI} />

      {/* Crate clusters */}
      <Crate position={[5, 0.6, 14]} />
      <Crate position={[6.4, 0.6, 14]} />
      <Crate position={[5.7, 1.8, 14]} />
      <Crate position={[-5, 0.6, -14]} />
      <Crate position={[-6.4, 0.6, -14]} rotation={0.4} />
      <Crate position={[14, 0.6, -5]} />
      <Crate position={[-14, 0.6, 5]} />

      {/* Barrel clusters */}
      <Barrel position={[11.5, 0.45, 11.5]} />
      <Barrel position={[12.8, 0.45, 11.5]} />
      <Barrel position={[-11.5, 0.45, -11.5]} />
      <Barrel position={[11.5, 0.45, -11.5]} />
      <Barrel position={[-11.5, 0.45, 11.5]} />

      {/* Round trees */}
      {trees.map((pos, i) => (
        <RoundTree key={i} position={pos} />
      ))}
    </>
  );
}
