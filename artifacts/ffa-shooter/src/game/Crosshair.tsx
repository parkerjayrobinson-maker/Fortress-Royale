import { useGameStore, GUNS } from "./useGameStore";

export function Crosshair() {
  const { selectedGun, ammo, isReloading, isAiming } = useGameStore();
  const gun = GUNS.find((g) => g.id === selectedGun)!;

  // Dynamic spread based on aim state
  const baseSpread = isAiming ? gun.aimSpread : gun.spread;
  const spread = isReloading ? 20 : Math.max(3, Math.round(baseSpread * 70));
  const color = isReloading
    ? "rgba(255,200,0,0.8)"
    : isAiming
    ? "rgba(255,100,100,0.95)"
    : "rgba(255,255,255,0.85)";
  const dotColor = isAiming ? "#ff6666" : "white";

  if (selectedGun === "sniper" && isAiming) {
    return (
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        pointerEvents: "none", zIndex: 100,
      }}>
        {/* Full scope overlay */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle at 50% 50%, transparent 28%, rgba(0,0,0,0.88) 29%)",
        }} />
        <svg
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
        >
          {/* Outer scope ring */}
          <circle cx="50" cy="50" r="28" stroke="rgba(255,255,255,0.6)" strokeWidth="0.3" fill="none" />
          {/* Reticle lines */}
          <line x1="50" y1="22" x2="50" y2="44" stroke="rgba(255,80,80,0.9)" strokeWidth="0.4" />
          <line x1="50" y1="56" x2="50" y2="78" stroke="rgba(255,80,80,0.9)" strokeWidth="0.4" />
          <line x1="22" y1="50" x2="44" y2="50" stroke="rgba(255,80,80,0.9)" strokeWidth="0.4" />
          <line x1="56" y1="50" x2="78" y2="50" stroke="rgba(255,80,80,0.9)" strokeWidth="0.4" />
          {/* Mil-dot center */}
          <circle cx="50" cy="50" r="0.6" fill="rgba(255,80,80,0.9)" />
          {/* Range hash marks */}
          <line x1="44" y1="53" x2="56" y2="53" stroke="rgba(255,255,255,0.5)" strokeWidth="0.25" />
          <line x1="46" y1="56" x2="54" y2="56" stroke="rgba(255,255,255,0.5)" strokeWidth="0.25" />
          <line x1="47" y1="59" x2="53" y2="59" stroke="rgba(255,255,255,0.5)" strokeWidth="0.25" />
        </svg>
        <div style={{ position: "absolute", top: 16, left: "50%", transform: "translateX(-50%)", color: "rgba(255,80,80,0.8)", fontSize: 11, fontWeight: 700, letterSpacing: 3, fontFamily: "monospace" }}>
          SNIPER × ADS
        </div>
      </div>
    );
  }

  if (selectedGun === "shotgun") {
    const r = spread + 10;
    const size = r * 2 + 24;
    return (
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none", zIndex: 100,
      }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
          <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="4 4" />
          <circle cx={size / 2} cy={size / 2} r="2.5" fill={dotColor} />
        </svg>
      </div>
    );
  }

  const c = spread + 12;
  const size = c * 2;
  return (
    <div style={{
      position: "fixed", top: "50%", left: "50%",
      transform: "translate(-50%, -50%)",
      pointerEvents: "none", zIndex: 100,
    }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
        <line x1={c} y1={c - spread - 8} x2={c} y2={c - spread - 2} stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1={c} y1={c + spread + 2} x2={c} y2={c + spread + 8} stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1={c - spread - 8} y1={c} x2={c - spread - 2} y2={c} stroke={color} strokeWidth="2" strokeLinecap="round" />
        <line x1={c + spread + 2} y1={c} x2={c + spread + 8} y2={c} stroke={color} strokeWidth="2" strokeLinecap="round" />
        <circle cx={c} cy={c} r="2" fill={dotColor} />
      </svg>
    </div>
  );
}
