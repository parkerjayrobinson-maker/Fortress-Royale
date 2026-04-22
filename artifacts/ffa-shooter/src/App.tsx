import { useGameStore } from "./game/useGameStore";
import { Menu } from "./pages/Menu";
import { GameScene } from "./game/GameScene";
import { DeadScreen } from "./pages/DeadScreen";
import { WonScreen } from "./pages/WonScreen";

function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", background: "#000" }}>
      {phase === "menu" && <Menu />}
      {(phase === "playing" || phase === "dead" || phase === "won") && <GameScene />}
      {phase === "dead" && <DeadScreen />}
      {phase === "won" && <WonScreen />}
    </div>
  );
}

export default App;
