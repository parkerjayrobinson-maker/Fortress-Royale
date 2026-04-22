import { useGameStore } from "../game/useGameStore";

export function DeadScreen() {
  const { score, resetGame, startGame } = useGameStore();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        backdropFilter: "blur(4px)",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: "#e74c3c",
            letterSpacing: -2,
            textShadow: "0 0 60px rgba(231,76,60,0.6)",
          }}
        >
          YOU DIED
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 18,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: 2,
          }}
        >
          ELIMINATED
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 48,
            fontWeight: 900,
            color: "#ffe066",
            textShadow: "0 0 40px rgba(255,224,102,0.4)",
          }}
        >
          {score.toLocaleString()}
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, letterSpacing: 2, marginTop: 4 }}>
          FINAL SCORE
        </div>

        <div style={{ marginTop: 48, display: "flex", gap: 16, justifyContent: "center" }}>
          <button
            onClick={startGame}
            style={{
              padding: "14px 40px",
              fontSize: 16,
              fontWeight: 800,
              color: "#0a0a1a",
              background: "#ffe066",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              letterSpacing: 2,
              textTransform: "uppercase",
              boxShadow: "0 0 30px rgba(255,224,102,0.3)",
            }}
          >
            PLAY AGAIN
          </button>
          <button
            onClick={resetGame}
            style={{
              padding: "14px 40px",
              fontSize: 16,
              fontWeight: 800,
              color: "white",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              cursor: "pointer",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
