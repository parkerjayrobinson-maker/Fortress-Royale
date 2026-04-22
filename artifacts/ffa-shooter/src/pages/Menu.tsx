import { useState } from "react";
import { useGameStore, SKINS, GUNS, SkinId, GunId } from "../game/useGameStore";
import { useMultiplayerStore } from "../game/multiplayerStore";

function SkinCard({ skin, selected, onClick }: { skin: typeof SKINS[0]; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        border: `2px solid ${selected ? skin.accentColor : "rgba(255,255,255,0.1)"}`,
        borderRadius: 10,
        padding: "10px 8px",
        background: selected ? `${skin.bodyColor}22` : "rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        transition: "all 0.15s ease",
        boxShadow: selected ? `0 0 18px ${skin.accentColor}55` : "none",
        minWidth: 80,
      }}
    >
      <svg width="40" height="56" viewBox="0 0 40 56">
        {/* Legs */}
        <rect x="8" y="36" width="9" height="18" rx="2" fill={skin.bodyColor} />
        <rect x="23" y="36" width="9" height="18" rx="2" fill={skin.bodyColor} />
        {/* Torso */}
        <rect x="6" y="20" width="28" height="18" rx="3" fill={skin.armorColor} />
        {/* Arms */}
        <rect x="0" y="21" width="7" height="14" rx="3" fill={skin.armorColor} />
        <rect x="33" y="21" width="7" height="14" rx="3" fill={skin.armorColor} />
        {/* Armor stripe */}
        <rect x="10" y="23" width="20" height="12" rx="2" fill={skin.accentColor} opacity="0.45" />
        {/* Head */}
        <rect x="9" y="6" width="22" height="16" rx="4" fill={skin.headColor} />
        {/* Helmet */}
        <rect x="7" y="3" width="26" height="9" rx="3" fill={skin.bodyColor} />
        {/* Visor */}
        <rect x="11" y="11" width="18" height="5" rx="2" fill={skin.accentColor} opacity="0.7" />
      </svg>
      <span style={{ color: selected ? skin.accentColor : "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
        {skin.name.toUpperCase()}
      </span>
    </div>
  );
}

function GunCard({ gun, selected, onClick }: { gun: typeof GUNS[0]; selected: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        cursor: "pointer",
        border: `2px solid ${selected ? gun.bodyColor : "rgba(255,255,255,0.1)"}`,
        borderRadius: 10,
        padding: "10px 14px",
        background: selected ? `${gun.bodyColor}22` : "rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        transition: "all 0.15s ease",
        boxShadow: selected ? `0 0 18px ${gun.bodyColor}55` : "none",
        flex: 1,
        minWidth: 120,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ color: selected ? "white" : "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 800 }}>
          {gun.name}
        </span>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1, padding: "2px 6px", borderRadius: 4,
          background: gun.bodyColor, color: "white",
        }}>
          {gun.ammo} RDS
        </span>
      </div>
      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 10 }}>{gun.description}</span>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
        {[
          { label: "DMG", value: Math.round((gun.damage / 100) * 100), max: 100 },
          { label: "RATE", value: Math.round((1 - gun.fireRate / 1200) * 100), max: 100 },
          { label: "RANGE", value: Math.round((gun.bulletSpeed / 120) * 100), max: 100 },
        ].map((stat) => (
          <div key={stat.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, width: 34 }}>{stat.label}</span>
            <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3 }}>
              <div style={{
                height: "100%", width: `${stat.value}%`, borderRadius: 3,
                background: selected ? gun.bodyColor : "rgba(255,255,255,0.35)",
                transition: "width 0.3s ease",
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Menu() {
  const { startGame, startMultiplayerGame, selectedSkin, selectedGun, setSkin, setGun } = useGameStore();
  const mpName = useMultiplayerStore((s) => s.name);
  const setMpName = useMultiplayerStore((s) => s.setName);
  const mpConnect = useMultiplayerStore((s) => s.connect);
  const mpDisconnect = useMultiplayerStore((s) => s.disconnect);
  const mpConnected = useMultiplayerStore((s) => s.connected);
  const mpPlayerCount = useMultiplayerStore((s) => Object.keys(s.players).length);
  const [tab, setTab] = useState<"skins" | "guns">("skins");

  const playMultiplayer = () => {
    mpDisconnect();
    setTimeout(() => {
      mpConnect({ name: mpName, skin: selectedSkin, gun: selectedGun });
      startMultiplayerGame();
    }, 50);
  };

  return (
    <div style={{
      width: "100vw", height: "100vh",
      background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0d1b2a 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', system-ui, sans-serif", userSelect: "none",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 40%, rgba(100,0,255,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ textAlign: "center", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <div style={{ fontSize: 60, fontWeight: 900, color: "white", letterSpacing: -2, lineHeight: 1, textShadow: "0 0 60px rgba(255,200,0,0.4)" }}>
          BATTLE
        </div>
        <div style={{ fontSize: 60, fontWeight: 900, color: "#ffe066", letterSpacing: -2, lineHeight: 1, textShadow: "0 0 60px rgba(255,224,102,0.6)" }}>
          ARENA
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: 4, marginTop: 4, marginBottom: 24 }}>
          3D FREE-FOR-ALL SHOOTER
        </div>

        <div style={{
          background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 14, padding: 20, width: 500, backdropFilter: "blur(10px)",
        }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {(["skins", "guns"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: "8px 0", fontSize: 12, fontWeight: 700, letterSpacing: 2,
                  background: tab === t ? "rgba(255,224,102,0.15)" : "transparent",
                  border: `1px solid ${tab === t ? "#ffe066" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 7, color: tab === t ? "#ffe066" : "rgba(255,255,255,0.4)",
                  cursor: "pointer", transition: "all 0.15s ease",
                }}
              >
                {t === "skins" ? "SKINS" : "WEAPONS"}
              </button>
            ))}
          </div>

          {tab === "skins" && (
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {SKINS.map((skin) => (
                <SkinCard
                  key={skin.id}
                  skin={skin}
                  selected={selectedSkin === skin.id}
                  onClick={() => setSkin(skin.id as SkinId)}
                />
              ))}
            </div>
          )}

          {tab === "guns" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {GUNS.slice(0, 2).map((gun) => (
                  <GunCard key={gun.id} gun={gun} selected={selectedGun === gun.id} onClick={() => setGun(gun.id as GunId)} />
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {GUNS.slice(2).map((gun) => (
                  <GunCard key={gun.id} gun={gun} selected={selectedGun === gun.id} onClick={() => setGun(gun.id as GunId)} />
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8, width: 500 }}>
          <input
            value={mpName}
            onChange={(e) => setMpName(e.target.value.slice(0, 20))}
            placeholder="Your name"
            style={{
              flex: 1, padding: "10px 14px", fontSize: 14, fontWeight: 600,
              background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8, color: "white", outline: "none", letterSpacing: 1,
            }}
          />
          <span style={{ fontSize: 11, color: mpConnected ? "#7CFC9A" : "rgba(255,255,255,0.4)", letterSpacing: 1, minWidth: 110, textAlign: "right" }}>
            {mpConnected ? `● ONLINE · ${mpPlayerCount + 1}` : "○ OFFLINE"}
          </span>
        </div>

        <div style={{ marginTop: 14, display: "flex", gap: 12 }}>
          <button
            onClick={startGame}
            style={{
              padding: "14px 36px", fontSize: 16, fontWeight: 800,
              color: "white", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8,
              cursor: "pointer", letterSpacing: 2, textTransform: "uppercase",
              transition: "transform 0.1s ease",
            }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "scale(1.04)"; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            Solo (Bots)
          </button>
          <button
            onClick={playMultiplayer}
            style={{
              padding: "14px 48px", fontSize: 18, fontWeight: 800,
              color: "#0a0a1a", background: "#ffe066", border: "none", borderRadius: 8,
              cursor: "pointer", letterSpacing: 2, textTransform: "uppercase",
              boxShadow: "0 0 40px rgba(255,224,102,0.4), 0 4px 16px rgba(0,0,0,0.4)",
              transition: "transform 0.1s ease, box-shadow 0.1s ease",
            }}
            onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.transform = "scale(1.04)"; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            Play Online
          </button>
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 16, color: "rgba(255,255,255,0.35)", fontSize: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <span><strong style={{ color: "rgba(255,255,255,0.6)" }}>WASD</strong> Move</span>
          <span><strong style={{ color: "rgba(255,255,255,0.6)" }}>SPACE</strong> Jump</span>
          <span><strong style={{ color: "rgba(255,255,255,0.6)" }}>Click</strong> Shoot</span>
          <span><strong style={{ color: "rgba(255,255,255,0.6)" }}>Shift</strong> Aim</span>
          <span><strong style={{ color: "rgba(255,255,255,0.6)" }}>R</strong> Reload</span>
        </div>
      </div>
    </div>
  );
}
