import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RigidBody, CapsuleCollider, RapierRigidBody } from "@react-three/rapier";
import { useGameStore, GUNS, SKINS } from "./useGameStore";

const MOVE_SPEED = 8;
const JUMP_IMPULSE = 7;
const NORMAL_FOV = 75;
const NORMAL_BEHIND = 2.4;
const NORMAL_RIGHT  = 0.55;
const NORMAL_HEIGHT = 1.1;
const AIM_BEHIND    = 1.6;
const AIM_RIGHT     = 0.65;
const AIM_HEIGHT    = 1.05;
const SWORD_COOLDOWN = 600;

const keys: Record<string, boolean> = {};

// Shared walk state written by Player, read by PlayerCharacter's useFrame
export const playerWalkState = { phase: 0, moving: false };

// ── GunInHand ─────────────────────────────────────────────────────────────────
// Gun is in LOCAL space. After +PI Y-rotation: local -X = camera-right, local +Z = toward camera.
function GunInHand({ gunId, bodyColor, barrelColor, stockColor }: {
  gunId: string; bodyColor: string; barrelColor: string; stockColor: string;
}) {
  if (gunId === "shotgun") {
    return (
      <group position={[-0.26, 0.88, 0.28]}>
        <mesh><boxGeometry args={[0.06, 0.07, 0.4]} /><meshLambertMaterial color={bodyColor} /></mesh>
        <mesh position={[0.018, 0.005, 0.26]}><cylinderGeometry args={[0.015, 0.015, 0.35, 6]} rotation={[Math.PI/2,0,0]} /><meshLambertMaterial color={barrelColor} /></mesh>
        <mesh position={[-0.018, 0.005, 0.26]}><cylinderGeometry args={[0.015, 0.015, 0.35, 6]} rotation={[Math.PI/2,0,0]} /><meshLambertMaterial color={barrelColor} /></mesh>
        <mesh position={[0, -0.01, -0.12]} rotation={[-0.1,0,0]}><boxGeometry args={[0.055, 0.08, 0.2]} /><meshLambertMaterial color={stockColor} /></mesh>
      </group>
    );
  }
  if (gunId === "sniper") {
    return (
      <group position={[-0.22, 0.90, 0.30]}>
        <mesh><boxGeometry args={[0.055, 0.06, 0.55]} /><meshLambertMaterial color={bodyColor} /></mesh>
        <mesh position={[0, 0.005, 0.42]}><cylinderGeometry args={[0.012, 0.012, 0.5, 6]} rotation={[Math.PI/2,0,0]} /><meshLambertMaterial color={barrelColor} /></mesh>
        <mesh position={[0, 0.055, 0.08]}><cylinderGeometry args={[0.022, 0.022, 0.18, 8]} rotation={[Math.PI/2,0,0]} /><meshLambertMaterial color="#1a237e" /></mesh>
        <mesh position={[0, 0, -0.20]} rotation={[-0.08,0,0]}><boxGeometry args={[0.045, 0.065, 0.18]} /><meshLambertMaterial color={stockColor} /></mesh>
      </group>
    );
  }
  if (gunId === "smg") {
    return (
      <group position={[-0.26, 0.88, 0.26]}>
        <mesh><boxGeometry args={[0.06, 0.065, 0.30]} /><meshLambertMaterial color={bodyColor} /></mesh>
        <mesh position={[0, 0.003, 0.22]}><cylinderGeometry args={[0.013, 0.013, 0.2, 6]} rotation={[Math.PI/2,0,0]} /><meshLambertMaterial color={barrelColor} /></mesh>
        <mesh position={[0, -0.07, 0.04]} rotation={[-0.12,0,0]}><boxGeometry args={[0.04, 0.09, 0.045]} /><meshLambertMaterial color={barrelColor} /></mesh>
        <mesh position={[-0.032, 0.01, 0.04]}><boxGeometry args={[0.003, 0.035, 0.22]} /><meshLambertMaterial color="#e040fb" /></mesh>
      </group>
    );
  }
  // AR-15 default
  return (
    <group position={[-0.24, 0.90, 0.28]}>
      <mesh><boxGeometry args={[0.06, 0.065, 0.44]} /><meshLambertMaterial color={bodyColor} /></mesh>
      <mesh position={[0, 0.004, 0.32]}><cylinderGeometry args={[0.013, 0.013, 0.3, 6]} rotation={[Math.PI/2,0,0]} /><meshLambertMaterial color={barrelColor} /></mesh>
      <mesh position={[0, -0.065, 0.14]}><boxGeometry args={[0.04, 0.08, 0.05]} /><meshLambertMaterial color="#263238" /></mesh>
      <mesh position={[0, 0, -0.15]} rotation={[-0.18,0,0]}><boxGeometry args={[0.048, 0.062, 0.16]} /><meshLambertMaterial color={stockColor} /></mesh>
    </group>
  );
}

// Sword held in hand
function SwordInHand() {
  return (
    <group position={[-0.24, 0.86, 0.32]} rotation={[-0.2, 0, 0.3]}>
      {/* Blade */}
      <mesh position={[0, 0.30, 0]}>
        <boxGeometry args={[0.06, 0.60, 0.04]} />
        <meshStandardMaterial color="#e0f7fa" emissive="#48cae4" emissiveIntensity={1.0} metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Crossguard */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.22, 0.06, 0.06]} />
        <meshStandardMaterial color="#ffd600" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Handle */}
      <mesh position={[0, -0.18, 0]}>
        <boxGeometry args={[0.055, 0.22, 0.055]} />
        <meshLambertMaterial color="#4e342e" />
      </mesh>
      {/* Pommel */}
      <mesh position={[0, -0.30, 0]}>
        <sphereGeometry args={[0.06, 6, 5]} />
        <meshStandardMaterial color="#ffd600" metalness={0.8} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ── PlayerCharacter ───────────────────────────────────────────────────────────
function PlayerCharacter({ skinId, gunId, selectedSlot }: {
  skinId: string; gunId: string; selectedSlot: number;
}) {
  const skin = SKINS.find((s) => s.id === skinId) ?? SKINS[0];
  const gun  = GUNS.find((g) => g.id === gunId) ?? GUNS[0];
  const faceColor = skinId === "arctic" ? "#c8b090" : skinId === "ghost" ? "#e8d8c0" : "#c8946a";

  // Walk animation refs (pivot groups)
  const leftLegRef  = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef  = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const { phase, moving } = playerWalkState;
    const target = moving ? Math.sin(phase) * 0.48 : 0;
    const lerp = moving ? 0.25 : 0.15;
    if (leftLegRef.current)  leftLegRef.current.rotation.x  += (target  - leftLegRef.current.rotation.x)  * lerp;
    if (rightLegRef.current) rightLegRef.current.rotation.x += (-target - rightLegRef.current.rotation.x) * lerp;
    // Arms swing opposite to legs (counter-swing)
    if (leftArmRef.current)  leftArmRef.current.rotation.x  += (-target * 0.45 - leftArmRef.current.rotation.x)  * lerp;
    if (rightArmRef.current) rightArmRef.current.rotation.x += (target * 0.45  - rightArmRef.current.rotation.x) * lerp;
  });

  return (
    <group>
      {/* ── LEFT LEG pivot at hip y=0.79 ── */}
      <group ref={leftLegRef} position={[-0.13, 0.79, 0]}>
        <mesh castShadow position={[0, -0.27, 0]}>
          <boxGeometry args={[0.22, 0.54, 0.22]} />
          <meshLambertMaterial color={skin.bodyColor} />
        </mesh>
        {/* Knee pad */}
        <mesh position={[0, -0.19, 0.125]}>
          <boxGeometry args={[0.20, 0.14, 0.05]} />
          <meshLambertMaterial color={skin.armorColor} />
        </mesh>
        {/* Boot */}
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
        <meshLambertMaterial color={skin.accentColor} transparent opacity={0.55} />
      </mesh>
      <mesh position={[0.31, 1.06, 0]}>
        <boxGeometry args={[0.04, 0.52, 0.36]} />
        <meshLambertMaterial color={skin.accentColor} transparent opacity={0.4} />
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

      {/* ── LEFT ARM pivot at shoulder y=1.10 (appears camera-RIGHT after PI flip) ── */}
      <group ref={leftArmRef} position={[-0.30, 1.10, 0]}>
        <mesh castShadow position={[0, -0.18, 0.16]} rotation={[-0.5, 0, 0]}>
          <capsuleGeometry args={[0.09, 0.34, 4, 8]} />
          <meshLambertMaterial color={skin.armorColor} />
        </mesh>
        <mesh position={[0.04, -0.38, 0.30]}>
          <sphereGeometry args={[0.09, 6, 5]} />
          <meshLambertMaterial color={faceColor} />
        </mesh>
      </group>

      {/* ── RIGHT ARM pivot at shoulder y=1.10 (appears camera-LEFT) ── */}
      <group ref={rightArmRef} position={[0.34, 1.10, 0]}>
        <mesh castShadow position={[0, -0.13, 0]}>
          <capsuleGeometry args={[0.09, 0.32, 4, 8]} />
          <meshLambertMaterial color={skin.armorColor} />
        </mesh>
      </group>

      {/* Neck */}
      <mesh position={[0, 1.38, 0]}>
        <cylinderGeometry args={[0.09, 0.11, 0.13, 8]} />
        <meshLambertMaterial color={faceColor} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.66, 0]}>
        <boxGeometry args={[0.40, 0.42, 0.38]} />
        <meshLambertMaterial color={skin.headColor} />
      </mesh>
      <mesh position={[0, 1.64, 0.20]}>
        <boxGeometry args={[0.30, 0.30, 0.02]} />
        <meshLambertMaterial color={faceColor} />
      </mesh>
      <mesh position={[-0.09, 1.70, 0.22]}>
        <boxGeometry args={[0.07, 0.06, 0.02]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.09, 1.70, 0.22]}>
        <boxGeometry args={[0.07, 0.06, 0.02]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      {/* Helmet */}
      <mesh castShadow position={[0, 1.88, 0]}>
        <boxGeometry args={[0.44, 0.22, 0.42]} />
        <meshLambertMaterial color={skin.bodyColor} />
      </mesh>
      <mesh position={[0, 1.78, 0.22]}>
        <boxGeometry args={[0.42, 0.04, 0.03]} />
        <meshLambertMaterial color={skin.accentColor} />
      </mesh>
      <mesh position={[0, 1.72, 0.21]}>
        <boxGeometry args={[0.32, 0.12, 0.02]} />
        <meshLambertMaterial color={skin.accentColor} transparent opacity={0.8} />
      </mesh>

      {/* Weapon in hand */}
      {selectedSlot === 4
        ? <SwordInHand />
        : <GunInHand gunId={gun.id} bodyColor={gun.bodyColor} barrelColor={gun.barrelColor} stockColor={gun.stockColor} />
      }
    </group>
  );
}

// ── Player ────────────────────────────────────────────────────────────────────
export function Player() {
  const rbRef   = useRef<RapierRigidBody>(null);
  const charRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const shootRef   = useRef(false);
  const lastShot   = useRef(0);
  const lastSword  = useRef(0);
  const yawRef     = useRef(0);
  const pitchRef   = useRef(0);
  const isLocked   = useRef(false);
  const isAimingRef = useRef(false);
  const canJump    = useRef(true);
  const currentFov = useRef(75);

  const reloadTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reloadInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    phase, ammo, isReloading, addBullet, shoot,
    startReload, finishReload, setReloadProgress,
    selectedGun, selectedSkin, setAiming,
    selectedSlot, selectSlot, hasSword, swordSwing,
  } = useGameStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") { isAimingRef.current = true; setAiming(true); }
      if (e.code === "KeyR") startReload();
      if (e.code === "Digit1") selectSlot(0);
      if (e.code === "Digit2") selectSlot(1);
      if (e.code === "Digit3") selectSlot(2);
      if (e.code === "Digit4") selectSlot(3);
      if (e.code === "Digit5") selectSlot(4);
      if (e.code === "Space") {
        e.preventDefault();
        if (canJump.current && rbRef.current) {
          const linvel = rbRef.current.linvel();
          if (Math.abs(linvel.y) < 1.5) {
            rbRef.current.applyImpulse({ x: 0, y: JUMP_IMPULSE, z: 0 }, true);
            canJump.current = false;
            setTimeout(() => { canJump.current = true; }, 650);
          }
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
      if (e.code === "ShiftLeft" || e.code === "ShiftRight") { isAimingRef.current = false; setAiming(false); }
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        if (!isLocked.current) {
          document.body.requestPointerLock().catch(() => {});
        } else {
          shootRef.current = true;
        }
      }
    };
    const handleMouseUp = (_e: MouseEvent) => {};
    const handleContextMenu = (e: Event) => e.preventDefault();
    const handleMouseMove = (e: MouseEvent) => {
      if (!isLocked.current) return;
      const sens = isAimingRef.current ? 0.0012 : 0.002;
      yawRef.current -= e.movementX * sens;
      pitchRef.current += e.movementY * sens;
      pitchRef.current = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, pitchRef.current));
    };
    const handleLockChange = () => {
      isLocked.current = document.pointerLockElement === document.body;
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("pointerlockchange", handleLockChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("pointerlockchange", handleLockChange);
    };
  }, [startReload, setAiming, selectSlot]);

  useEffect(() => {
    if (isReloading) {
      const gun = GUNS.find((g) => g.id === selectedGun)!;
      const reloadTime = gun.reloadTime;
      let progress = 0;
      const steps = 20;
      reloadInterval.current = setInterval(() => {
        progress += 100 / steps;
        setReloadProgress(Math.min(progress, 100));
      }, reloadTime / steps);
      reloadTimer.current = setTimeout(() => {
        finishReload();
        if (reloadInterval.current) clearInterval(reloadInterval.current);
      }, reloadTime);
    }
    return () => {
      if (reloadTimer.current) clearTimeout(reloadTimer.current);
      if (reloadInterval.current) clearInterval(reloadInterval.current);
    };
  }, [isReloading, finishReload, setReloadProgress, selectedGun]);

  useFrame((_, delta) => {
    if (phase !== "playing") return;
    const rb = rbRef.current;
    const charGroup = charRef.current;
    if (!rb || !charGroup) return;

    const yawQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yawRef.current, 0));
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(yawQuat);
    const right   = new THREE.Vector3(1, 0, 0).applyQuaternion(yawQuat);
    const moveDir = new THREE.Vector3();
    if (keys["KeyW"] || keys["ArrowUp"])    moveDir.add(forward);
    if (keys["KeyS"] || keys["ArrowDown"])  moveDir.sub(forward);
    if (keys["KeyA"] || keys["ArrowLeft"])  moveDir.sub(right);
    if (keys["KeyD"] || keys["ArrowRight"]) moveDir.add(right);
    moveDir.normalize();

    const linvel = rb.linvel();
    rb.setLinvel({ x: moveDir.x * MOVE_SPEED, y: linvel.y, z: moveDir.z * MOVE_SPEED }, true);
    if (Math.abs(linvel.y) < 0.3) canJump.current = true;

    // Update walk state for animation
    const speed = Math.sqrt(linvel.x ** 2 + linvel.z ** 2);
    playerWalkState.moving = speed > 0.5;
    if (playerWalkState.moving) playerWalkState.phase += delta * Math.min(speed, MOVE_SPEED) * 0.72;

    // Place character
    const pos = rb.translation();
    charGroup.position.set(pos.x, pos.y - 0.9, pos.z);
    const aimFacePitch = isAimingRef.current ? pitchRef.current * 0.4 : 0;
    charGroup.rotation.set(aimFacePitch, yawRef.current + Math.PI, 0, "YXZ");

    // Camera
    const isAiming = isAimingRef.current;
    const gun = GUNS.find((g) => g.id === selectedGun)!;
    const targetFov = isAiming ? gun.aimFov : NORMAL_FOV;
    currentFov.current += (targetFov - currentFov.current) * Math.min(delta * 10, 1);
    (camera as THREE.PerspectiveCamera).fov = currentFov.current;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

    const yaw   = yawRef.current;
    const pitch = pitchRef.current;
    const fwdX = -Math.sin(yaw), fwdZ = -Math.cos(yaw);
    const rgtX =  Math.cos(yaw), rgtZ = -Math.sin(yaw);
    const behind  = isAiming ? AIM_BEHIND  : NORMAL_BEHIND;
    const rightOff = isAiming ? AIM_RIGHT  : NORMAL_RIGHT;
    const heightOff = isAiming ? AIM_HEIGHT : NORMAL_HEIGHT;

    camera.position.set(
      pos.x + (-fwdX * behind) + (rgtX * rightOff),
      pos.y + heightOff,
      pos.z + (-fwdZ * behind) + (rgtZ * rightOff),
    );
    const lookDirX = -Math.sin(yaw) * Math.cos(pitch);
    const lookDirY = -Math.sin(pitch);
    const lookDirZ = -Math.cos(yaw) * Math.cos(pitch);
    camera.lookAt(
      camera.position.x + lookDirX * 200,
      camera.position.y + lookDirY * 200,
      camera.position.z + lookDirZ * 200,
    );

    // Shooting / Sword
    if (shootRef.current) {
      shootRef.current = false;
      const now = Date.now();

      const curSlot = useGameStore.getState().selectedSlot;
      if (curSlot === 4) {
        // Sword swing
        if (now - lastSword.current > SWORD_COOLDOWN) {
          lastSword.current = now;
          swordSwing(pos.x, pos.z);
        }
      } else {
        const activeSpread = isAimingRef.current ? gun.aimSpread : gun.spread;
        if (now - lastShot.current > gun.fireRate && ammo > 0 && !isReloading) {
          const didShoot = shoot();
          if (didShoot) {
            lastShot.current = now;
            const baseDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
            for (let i = 0; i < gun.bulletsPerShot; i++) {
              const dir = baseDir.clone();
              dir.x += (Math.random() - 0.5) * activeSpread;
              dir.y += (Math.random() - 0.5) * activeSpread;
              dir.z += (Math.random() - 0.5) * activeSpread;
              dir.normalize();
              addBullet({
                id: `b-${now}-${i}-${Math.random()}`,
                position: [
                  camera.position.x + dir.x * 1.5,
                  camera.position.y + dir.y * 1.5,
                  camera.position.z + dir.z * 1.5,
                ],
                direction: [dir.x, dir.y, dir.z],
                speed: gun.bulletSpeed,
                createdAt: now,
                fromPlayer: true,
                damage: gun.damage,
              });
            }
          }
        }
      }
    }
  });

  return (
    <>
      <RigidBody
        ref={rbRef}
        position={[0, 3, 0]}
        enabledRotations={[false, false, false]}
        mass={1}
        linearDamping={10}
        angularDamping={1}
        colliders={false}
        type="dynamic"
      >
        <CapsuleCollider args={[0.5, 0.4]} />
      </RigidBody>
      <group ref={charRef}>
        <PlayerCharacter skinId={selectedSkin} gunId={selectedGun} selectedSlot={selectedSlot} />
      </group>
    </>
  );
}
