import { useGameStore, GUNS } from "../../game/useGameStore";

const SLOT_LABELS = ["1", "2", "3", "4", "5"];
const GUN_COLORS = ["#546e7a", "#8d6e63", "#263238", "#4a148c"];

export function HUD() {
  const {
    health, maxHealth, ammo, maxAmmo, score, kills,
    isReloading, reloadProgress, phase, selectedGun,
    selectedSkin, isAiming, selectedSlot, hasSword, notification,
  } = useGameStore();

  if (phase !== "playing") return null;

  const healthPercent = (health / maxHealth) * 100;
  const gun = GUNS.find((g) => g.id === selectedGun)!;
  const skinAccent =
    selectedSkin === "ghost" ? "#90caf9"
    : selectedSkin === "shadow" ? "#ce93d8"
    : selectedSkin === "inferno" ? "#ffb300"
    : selectedSkin === "arctic" ? "#e3f2fd"
    : "#76ff03";
  const skinName = selectedSkin.charAt(0).toUpperCase() + selectedSkin.slice(1);

  const isSword = selectedSlot === 4;

  return (
    <>
      {/* Aim vignette */}
      {isAiming && (
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 40,
          background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)",
        }} />
      )}

      {/* ── BOTTOM BAR ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        padding: "0 20px 12px",
        display: "flex", flexDirection: "column", alignItems: "stretch", gap: 8,
        pointerEvents: "none", zIndex: 50,
        background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)",
        opacity: isAiming ? 0.3 : 1, transition: "opacity 0.2s ease",
      }}>

        {/* ── Item slots row ── */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 6, alignItems: "flex-end",
        }}>
          {GUNS.map((g, i) => {
            const isSel = selectedSlot === i;
            return (
              <div key={g.id} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                background: isSel ? "rgba(255,224,102,0.18)" : "rgba(0,0,0,0.55)",
                border: `2px solid ${isSel ? "#ffe066" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 8,
                padding: "6px 8px",
                minWidth: 56,
                boxShadow: isSel ? `0 0 12px rgba(255,224,102,0.4)` : "none",
                transition: "all 0.15s ease",
              }}>
                {/* Gun color bar */}
                <div style={{ width: 30, height: 6, borderRadius: 3, background: GUN_COLORS[i], marginBottom: 2 }} />
                <span style={{ color: isSel ? "#ffe066" : "rgba(255,255,255,0.7)", fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>
                  {g.name.toUpperCase()}
                </span>
                <span style={{ color: isSel ? "white" : "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700 }}>
                  {selectedSlot === i ? `${ammo}/${maxAmmo}` : g.ammo}
                </span>
                <span style={{
                  color: "rgba(255,255,255,0.3)", fontSize: 8, fontWeight: 700,
                  background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 3, marginTop: 2,
                }}>{SLOT_LABELS[i]}</span>
              </div>
            );
          })}

          {/* Sword slot */}
          {(hasSword || true) && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              background: selectedSlot === 4 ? "rgba(72,202,228,0.18)" : hasSword ? "rgba(0,0,0,0.55)" : "rgba(0,0,0,0.25)",
              border: `2px solid ${selectedSlot === 4 ? "#48cae4" : hasSword ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}`,
              borderRadius: 8,
              padding: "6px 8px",
              minWidth: 56,
              boxShadow: selectedSlot === 4 ? "0 0 12px rgba(72,202,228,0.4)" : "none",
              opacity: hasSword ? 1 : 0.35,
              transition: "all 0.15s ease",
            }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>⚔️</span>
              <span style={{ color: selectedSlot === 4 ? "#48cae4" : "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>
                SWORD
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>MELEE</span>
              <span style={{
                color: "rgba(255,255,255,0.3)", fontSize: 8, fontWeight: 700,
                background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 3, marginTop: 2,
              }}>5</span>
            </div>
          )}
        </div>

        {/* ── Bottom stat row: health | reload/ads | ammo ── */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          {/* Health */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 700, letterSpacing: 2 }}>HEALTH</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 150, height: 10, background: "rgba(0,0,0,0.5)", borderRadius: 5, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
                <div style={{
                  height: "100%", width: `${healthPercent}%`,
                  background: healthPercent > 50 ? "#2ecc71" : healthPercent > 25 ? "#f39c12" : "#e74c3c",
                  borderRadius: 5, transition: "width 0.2s ease, background 0.3s ease",
                  boxShadow: healthPercent > 50 ? "0 0 8px rgba(46,204,113,0.5)" : "0 0 8px rgba(231,76,60,0.5)",
                }} />
              </div>
              <span style={{ color: "white", fontSize: 14, fontWeight: 700 }}>{health}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: skinAccent, boxShadow: `0 0 6px ${skinAccent}` }} />
              <span style={{ color: skinAccent, fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>{skinName.toUpperCase()}</span>
            </div>
          </div>

          {/* Center: reload bar / ADS / sword prompt */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            {isReloading && (
              <>
                <div style={{ color: "#f39c12", fontWeight: 700, fontSize: 10, letterSpacing: 2 }}>RELOADING...</div>
                <div style={{ width: 100, height: 4, background: "rgba(0,0,0,0.5)", borderRadius: 2, overflow: "hidden", border: "1px solid rgba(255,255,255,0.12)" }}>
                  <div style={{ height: "100%", width: `${reloadProgress}%`, background: "#f39c12", borderRadius: 2, transition: "width 0.1s linear" }} />
                </div>
              </>
            )}
            {isAiming && !isReloading && (
              <div style={{ color: "rgba(255,100,100,0.9)", fontSize: 10, fontWeight: 700, letterSpacing: 3 }}>ADS</div>
            )}
            {isSword && !isReloading && (
              <div style={{ color: "#48cae4", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>⚔️ CLICK TO SWING</div>
            )}
          </div>

          {/* Right: ammo display */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            {isSword ? (
              <>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: 2 }}>MELEE</div>
                <span style={{ color: "#48cae4", fontSize: 34, fontWeight: 900, textShadow: "0 0 16px #48cae4" }}>⚔️</span>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9 }}>2.8m range</div>
              </>
            ) : (
              <>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 700, letterSpacing: 2 }}>{gun.name.toUpperCase()}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{
                    color: ammo > gun.ammo * 0.2 ? "white" : "#e74c3c",
                    fontSize: 34, fontWeight: 900,
                    textShadow: `0 0 14px ${gun.bodyColor}`,
                  }}>
                    {ammo}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>/ {maxAmmo}</span>
                </div>
                {/* Ammo pip bar */}
                <div style={{ display: "flex", gap: 2, flexWrap: "wrap", maxWidth: 110, justifyContent: "flex-end" }}>
                  {Array.from({ length: maxAmmo }, (_, i) => (
                    <div key={i} style={{
                      width: maxAmmo <= 10 ? 8 : maxAmmo <= 30 ? 4 : 3,
                      height: maxAmmo <= 10 ? 8 : maxAmmo <= 30 ? 4 : 3,
                      borderRadius: 1,
                      background: i < ammo ? gun.bodyColor : "rgba(255,255,255,0.08)",
                      transition: "background 0.1s ease",
                    }} />
                  ))}
                </div>
                {ammo === 0 && !isReloading && (
                  <div style={{ color: "#e74c3c", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>PRESS R</div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Score + kill feed ── */}
      <div style={{
        position: "fixed", top: 16, right: 16,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6,
        pointerEvents: "none", zIndex: 50,
        opacity: isAiming ? 0.3 : 1, transition: "opacity 0.2s ease",
      }}>
        <div style={{ color: "#ffe066", fontSize: 22, fontWeight: 900, textShadow: "0 0 16px rgba(255,224,102,0.6)" }}>
          {score.toLocaleString()} pts
        </div>
        {kills.map((k) => {
          const isHS = k.text.includes("HEADSHOT");
          return (
            <div key={k.id} style={{
              color: isHS ? "#ff4444" : "#ffe066",
              fontSize: isHS ? 12 : 11,
              fontWeight: 700,
              background: isHS ? "rgba(255,30,30,0.18)" : "rgba(0,0,0,0.6)",
              padding: "3px 10px",
              borderRadius: 5,
              borderLeft: `3px solid ${isHS ? "#ff4444" : "#ffe066"}`,
              textShadow: isHS ? "0 0 8px rgba(255,50,50,0.8)" : "none",
            }}>
              {isHS ? `🎯 ${k.text}` : k.text}
            </div>
          );
        })}
      </div>

      {/* ── Loot notification ── */}
      {notification && (
        <div style={{
          position: "fixed", top: "40%", left: "50%", transform: "translate(-50%, -50%)",
          pointerEvents: "none", zIndex: 60,
          background: "rgba(0,0,0,0.75)",
          border: "2px solid rgba(255,255,255,0.2)",
          borderRadius: 12,
          padding: "10px 22px",
          color: "white",
          fontSize: 16,
          fontWeight: 800,
          textAlign: "center",
          letterSpacing: 1,
          boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          animation: "fadeInOut 0.3s ease",
        }}>
          {notification}
        </div>
      )}

      {/* ── Controls hint ── */}
      <div style={{
        position: "fixed", top: 16, left: 16,
        pointerEvents: "none", zIndex: 50,
        display: "flex", flexDirection: "column", gap: 3,
        opacity: isAiming ? 0.15 : 0.8, transition: "opacity 0.2s ease",
      }}>
        {[["WASD","Move"],["SPACE","Jump"],["LMB","Shoot/Swing"],["SHIFT","Aim"],["R","Reload"],["1-5","Slots"]].map(([key, action]) => (
          <div key={key} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 9, fontWeight: 700, background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: 3, border: "1px solid rgba(255,255,255,0.18)" }}>{key}</span>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9 }}>{action}</span>
          </div>
        ))}
      </div>
    </>
  );
}
