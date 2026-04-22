import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, GUNS } from "./useGameStore";

function ARModel({ gun }: { gun: typeof GUNS[0] }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0, -0.4]}>
        <boxGeometry args={[0.09, 0.08, 0.55]} />
        <meshLambertMaterial color={gun.bodyColor} />
      </mesh>
      {/* Barrel */}
      <mesh position={[0, 0.01, -0.75]}>
        <cylinderGeometry args={[0.018, 0.018, 0.42, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshLambertMaterial color={gun.barrelColor} />
      </mesh>
      {/* Stock */}
      <mesh position={[0, -0.01, -0.09]}>
        <boxGeometry args={[0.07, 0.07, 0.22]} />
        <meshLambertMaterial color={gun.stockColor} />
      </mesh>
      {/* Mag */}
      <mesh position={[0, -0.085, -0.38]}>
        <boxGeometry args={[0.05, 0.1, 0.07]} />
        <meshLambertMaterial color="#263238" />
      </mesh>
      {/* Grip */}
      <mesh position={[0, -0.075, -0.16]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[0.055, 0.1, 0.06]} />
        <meshLambertMaterial color={gun.stockColor} />
      </mesh>
      {/* Sight */}
      <mesh position={[0, 0.065, -0.42]}>
        <boxGeometry args={[0.025, 0.03, 0.06]} />
        <meshLambertMaterial color="#b0bec5" />
      </mesh>
    </group>
  );
}

function ShotgunModel({ gun }: { gun: typeof GUNS[0] }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0, -0.35]}>
        <boxGeometry args={[0.095, 0.085, 0.45]} />
        <meshLambertMaterial color={gun.bodyColor} />
      </mesh>
      {/* Barrel - double */}
      <mesh position={[0.025, 0.01, -0.75]}>
        <cylinderGeometry args={[0.022, 0.022, 0.52, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshLambertMaterial color={gun.barrelColor} />
      </mesh>
      <mesh position={[-0.025, 0.01, -0.75]}>
        <cylinderGeometry args={[0.022, 0.022, 0.52, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshLambertMaterial color={gun.barrelColor} />
      </mesh>
      {/* Stock */}
      <mesh position={[0, -0.01, -0.06]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.075, 0.095, 0.28]} />
        <meshLambertMaterial color={gun.stockColor} />
      </mesh>
      {/* Pump */}
      <mesh position={[0, -0.01, -0.62]}>
        <boxGeometry args={[0.075, 0.055, 0.14]} />
        <meshLambertMaterial color={gun.stockColor} />
      </mesh>
      {/* Guard */}
      <mesh position={[0, -0.04, -0.27]}>
        <torusGeometry args={[0.04, 0.008, 6, 12, Math.PI]} />
        <meshLambertMaterial color={gun.barrelColor} />
      </mesh>
    </group>
  );
}

function SniperModel({ gun }: { gun: typeof GUNS[0] }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0, -0.4]}>
        <boxGeometry args={[0.08, 0.07, 0.5]} />
        <meshLambertMaterial color={gun.bodyColor} />
      </mesh>
      {/* Long barrel */}
      <mesh position={[0, 0.01, -0.85]}>
        <cylinderGeometry args={[0.015, 0.015, 0.62, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshLambertMaterial color={gun.barrelColor} />
      </mesh>
      {/* Muzzle brake */}
      <mesh position={[0, 0.01, -1.18]}>
        <cylinderGeometry args={[0.025, 0.018, 0.06, 6]} rotation={[Math.PI / 2, 0, 0]} />
        <meshLambertMaterial color={gun.barrelColor} />
      </mesh>
      {/* Scope */}
      <mesh position={[0, 0.08, -0.45]}>
        <cylinderGeometry args={[0.032, 0.032, 0.26, 10]} rotation={[Math.PI / 2, 0, 0]} />
        <meshLambertMaterial color="#1a237e" />
      </mesh>
      {/* Scope lens */}
      <mesh position={[0, 0.08, -0.33]}>
        <circleGeometry args={[0.030, 10]} />
        <meshLambertMaterial color="#64b5f6" />
      </mesh>
      {/* Bipod left */}
      <mesh position={[0.05, -0.07, -0.75]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.008, 0.14, 0.008]} />
        <meshLambertMaterial color={gun.barrelColor} />
      </mesh>
      {/* Bipod right */}
      <mesh position={[-0.05, -0.07, -0.75]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.008, 0.14, 0.008]} />
        <meshLambertMaterial color={gun.barrelColor} />
      </mesh>
      {/* Stock */}
      <mesh position={[0, 0, -0.08]} rotation={[0.1, 0, 0]}>
        <boxGeometry args={[0.065, 0.085, 0.24]} />
        <meshLambertMaterial color={gun.stockColor} />
      </mesh>
      {/* Mag */}
      <mesh position={[0, -0.075, -0.4]}>
        <boxGeometry args={[0.04, 0.09, 0.06]} />
        <meshLambertMaterial color="#263238" />
      </mesh>
    </group>
  );
}

function SMGModel({ gun }: { gun: typeof GUNS[0] }) {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0, -0.3]}>
        <boxGeometry args={[0.082, 0.075, 0.38]} />
        <meshLambertMaterial color={gun.bodyColor} />
      </mesh>
      {/* Short barrel */}
      <mesh position={[0, 0.005, -0.6]}>
        <cylinderGeometry args={[0.016, 0.016, 0.28, 8]} rotation={[Math.PI / 2, 0, 0]} />
        <meshLambertMaterial color={gun.barrelColor} />
      </mesh>
      {/* Curved mag */}
      <mesh position={[0, -0.095, -0.32]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.048, 0.12, 0.055]} />
        <meshLambertMaterial color={gun.barrelColor} />
      </mesh>
      {/* Grip */}
      <mesh position={[0, -0.072, -0.14]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.05, 0.09, 0.055]} />
        <meshLambertMaterial color={gun.stockColor} />
      </mesh>
      {/* Fold stock */}
      <mesh position={[0, 0, -0.07]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.06, 0.06, 0.15]} />
        <meshLambertMaterial color={gun.stockColor} />
      </mesh>
      {/* Accent stripe */}
      <mesh position={[0.042, 0.02, -0.3]}>
        <boxGeometry args={[0.004, 0.04, 0.3]} />
        <meshLambertMaterial color="#e040fb" />
      </mesh>
    </group>
  );
}

export function GunViewModel() {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const { selectedGun, isReloading, ammo } = useGameStore();
  const gun = GUNS.find((g) => g.id === selectedGun)!;
  const bobTimer = useRef(0);
  const recoilRef = useRef(0);
  const prevAmmo = useRef(ammo);

  useFrame((_, delta) => {
    bobTimer.current += delta * 4;
    if (ammo < prevAmmo.current) {
      recoilRef.current = 1;
    }
    prevAmmo.current = ammo;
    recoilRef.current = Math.max(0, recoilRef.current - delta * 8);

    const group = groupRef.current;
    if (!group) return;

    const bobX = Math.sin(bobTimer.current) * 0.006;
    const bobY = Math.abs(Math.sin(bobTimer.current * 0.5)) * 0.004;
    const reloadTilt = isReloading ? Math.sin(Date.now() * 0.003) * 0.18 : 0;
    const recoilZ = recoilRef.current * 0.12;
    const recoilY = recoilRef.current * -0.04;

    const offset = new THREE.Vector3(0.22 + bobX, -0.2 + bobY + recoilY, -0.5 - recoilZ);
    offset.applyQuaternion(camera.quaternion);
    group.position.copy(camera.position).add(offset);
    group.quaternion.copy(camera.quaternion);
    group.rotateZ(reloadTilt);
  });

  return (
    <group ref={groupRef}>
      {gun.id === "ar15" && <ARModel gun={gun} />}
      {gun.id === "shotgun" && <ShotgunModel gun={gun} />}
      {gun.id === "sniper" && <SniperModel gun={gun} />}
      {gun.id === "smg" && <SMGModel gun={gun} />}
    </group>
  );
}
