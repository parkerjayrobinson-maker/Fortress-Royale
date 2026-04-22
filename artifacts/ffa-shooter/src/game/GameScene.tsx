import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Sky, Stars } from "@react-three/drei";
import { Player } from "./Player";
import { World } from "./World";
import { Enemies } from "./Enemies";
import { Bullets } from "./Bullets";
import { LootBoxes } from "./LootBoxes";
import { Crosshair } from "./Crosshair";
import { HUD } from "../components/hud/HUD";

export function GameScene() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0a", position: "relative" }}>
      <Canvas
        shadows
        camera={{ fov: 75, near: 0.1, far: 500 }}
        style={{ width: "100%", height: "100%" }}
      >
        <Suspense fallback={null}>
          <Physics gravity={[0, -20, 0]}>
            <ambientLight intensity={0.45} />
            <directionalLight
              position={[50, 100, 50]}
              intensity={1.2}
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-far={200}
              shadow-camera-left={-80}
              shadow-camera-right={80}
              shadow-camera-top={80}
              shadow-camera-bottom={-80}
            />
            <Sky sunPosition={[100, 50, 100]} />
            <Stars radius={150} depth={50} count={3000} factor={4} />
            <fog attach="fog" args={["#87ceeb", 60, 150]} />

            <Player />
            <World />
            <Enemies />
            <Bullets />
            <LootBoxes />
          </Physics>
        </Suspense>
      </Canvas>
      <Crosshair />
      <HUD />
    </div>
  );
}
