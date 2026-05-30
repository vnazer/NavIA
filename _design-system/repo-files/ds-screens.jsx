// The 5 critical screens. Each renders inside <Phone theme={theme}>.
// All screens are designed at 393×852 (iPhone 15 Pro).

// ============================================================================
// 1. RACE LIVE — la más importante
// ============================================================================
function ScreenRaceLive({ theme = "l" }) {
  const isL = theme === "l";
  const text = isL ? "#0B1320" : "#FFFFFF";
  const text2 = isL ? "#475266" : "#D6DEE8";
  const text3 = isL ? "#8392A6" : "#8FA0B6";
  const bg = isL ? "#EEF2F7" : "#000000";
  const surface = isL ? "#FFFFFF" : "#0A0F18";
  const surface2 = isL ? "#F6F8FB" : "#121925";
  const border = isL ? "#E0E6EE" : "#1E2839";
  const navy = isL ? "#0E2A4E" : "#00C2FF";
  const lift = isL ? "#15A34A" : "#2EF07A";
  const header = isL ? "#E03A2C" : "#FF5447";

  return (
    <div style={{ background: bg, flex: 1, display: "flex", flexDirection: "column", color: text }}>

      {/* Sub-header */}
      <div style={{ padding: "8px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: 99, background: lift }} />
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: text2 }}>REC · ALGARROBO · ILCA 7</div>
        </div>
        <div style={{ display: "flex", gap: 14, color: text2 }}>
          <span style={{ display: "flex" }}>{I.signal}</span>
          <span style={{ display: "flex" }}>{I.more}</span>
        </div>
      </div>

      {/* Timer hero strip */}
      <div style={{ background: surface, borderTop: `1px solid ${border}`, borderBottom: `1px solid ${border}`, padding: "12px 20px", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12 }}>
        <div>
          <div className="label" style={{ color: text3 }}>RACE · RACING</div>
          <div className="num" style={{ ...NUM, fontSize: 38, fontWeight: 800, color: lift, lineHeight: 1, marginTop: 2 }}>12:08</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <div style={{ width: 44, height: 44, border: `1.5px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: text2 }}>{I.pause}</div>
          <div style={{ width: 44, height: 44, border: `1.5px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: header }}>{I.stop}</div>
        </div>
      </div>

      {/* SOG hero */}
      <div style={{ padding: "18px 20px 8px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="label" style={{ color: text3 }}>SOG · NUDOS</div>
          <div className="num" style={{ ...NUM, fontSize: 110, fontWeight: 800, lineHeight: 0.9, color: text, letterSpacing: "-0.04em", marginTop: 6 }}>6.8</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, paddingBottom: 12 }}>
          <div style={{ fontSize: 11, color: text3, fontWeight: 600 }}>%POLAR</div>
          <div className="num" style={{ ...NUM, fontSize: 30, fontWeight: 800, color: lift, lineHeight: 1 }}>94</div>
          <div style={{ width: 120, height: 4, background: surface2, position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, width: "94%", background: lift }} />
            <div style={{ position: "absolute", top: -4, bottom: -4, left: "100%", width: 1.5, background: text3 }} />
          </div>
          <div style={{ fontSize: 10, color: text3 }} className="num">target 7.2 kt</div>
        </div>
      </div>

      {/* COG / TWA / Wind row */}
      <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div style={{ background: surface, border: `1px solid ${border}`, padding: 12 }}>
          <div className="label" style={{ color: text3 }}>COG</div>
          <div className="num" style={{ ...NUM, fontSize: 30, fontWeight: 700, color: text, lineHeight: 1, marginTop: 2 }}>285°</div>
          <div style={{ fontSize: 10, color: text3, marginTop: 2 }}>WSW</div>
        </div>
        <div style={{ background: surface, border: `1px solid ${border}`, padding: 12 }}>
          <div className="label" style={{ color: text3 }}>TWA</div>
          <div className="num" style={{ ...NUM, fontSize: 30, fontWeight: 700, color: text, lineHeight: 1, marginTop: 2 }}>42°</div>
          <div style={{ fontSize: 10, color: lift, marginTop: 2, fontWeight: 600 }}>port · ceñida</div>
        </div>
        <div style={{ background: surface, border: `1px solid ${border}`, padding: 12 }}>
          <div className="label" style={{ color: text3 }}>VIENTO</div>
          <div className="num" style={{ ...NUM, fontSize: 30, fontWeight: 700, color: text, lineHeight: 1, marginTop: 2 }}>14</div>
          <div style={{ fontSize: 10, color: text3, marginTop: 2 }} className="num">kt · 285°</div>
        </div>
      </div>

      {/* Wind shift bar */}
      <div style={{ margin: "12px 20px 0", background: surface, border: `1px solid ${border}`, padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="label" style={{ color: text3 }}>WIND SHIFT · ÚLTIMOS 60 S</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <div style={{ background: lift + "22", color: lift, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                {I.arrowUp}
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em" }}>LIFT</span>
              </div>
              <span className="num" style={{ ...NUM, fontSize: 22, fontWeight: 700 }}>+8°</span>
            </div>
          </div>
          {/* Tiny shift sparkline */}
          <svg width="120" height="40" viewBox="0 0 120 40">
            <line x1="0" y1="20" x2="120" y2="20" stroke={text3} strokeOpacity="0.3" strokeDasharray="2 3"/>
            <polyline fill="none" stroke={lift} strokeWidth="2"
              points="0,28 12,26 24,30 36,22 48,18 60,12 72,15 84,8 96,10 108,6 120,4"/>
          </svg>
        </div>
      </div>

      {/* Distance to layline */}
      <div style={{ margin: "8px 20px 0", padding: "12px 14px", background: surface2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="label" style={{ color: text3 }}>LAYLINE · STBD</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: text, marginTop: 4 }}>W1 windward</div>
        </div>
        <div className="num" style={{ ...NUM, fontSize: 28, fontWeight: 700, color: navy }}>140<span style={{ fontSize: 14, color: text3, marginLeft: 2 }}>m</span></div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Floating action FAB-style bar */}
      <div style={{ padding: "0 20px 20px", display: "grid", gridTemplateColumns: "1fr 56px", gap: 8 }}>
        <button style={{ background: navy, color: isL?"#FFF":"#000", border: "none", padding: "16px", fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {I.marker} Marcar boya
        </button>
        <button style={{ background: surface, border: `1.5px solid ${border}`, color: text, display: "flex", alignItems: "center", justifyContent: "center" }}>{I.map}</button>
      </div>

      {/* Tab bar */}
      <ScreenTabBar theme={theme} active="regata" />
    </div>
  );
}

// ============================================================================
// 2. PRESTART — Distance to line + Time to burn
// ============================================================================
function ScreenPrestart({ theme = "l" }) {
  const isL = theme === "l";
  const text = isL ? "#0B1320" : "#FFFFFF";
  const text2 = isL ? "#475266" : "#D6DEE8";
  const text3 = isL ? "#8392A6" : "#8FA0B6";
  const bg = isL ? "#EEF2F7" : "#000000";
  const surface = isL ? "#FFFFFF" : "#0A0F18";
  const surface2 = isL ? "#F6F8FB" : "#121925";
  const border = isL ? "#E0E6EE" : "#1E2839";
  const navy = isL ? "#0E2A4E" : "#00C2FF";
  const lift = isL ? "#15A34A" : "#2EF07A";
  const warn = isL ? "#D97706" : "#FFB020";
  const header = isL ? "#E03A2C" : "#FF5447";

  return (
    <div style={{ background: bg, flex: 1, display: "flex", flexDirection: "column", color: text }}>
      {/* Top */}
      <div style={{ padding: "8px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ color: text2, display: "flex" }}>{I.back}</div>
          <div className="label" style={{ color: text2 }}>TÁCTICA · PRESTART</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: 99, background: warn }} />
          <span style={{ fontSize: 11, color: text3, fontWeight: 600 }} className="num">T-01:47</span>
        </div>
      </div>

      {/* Timer dial */}
      <div style={{ padding: "0 20px 8px" }}>
        <div style={{ background: surface, border: `1px solid ${border}`, padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
          <div>
            <div className="label" style={{ color: text3 }}>RACE TIMER · 1 MIN</div>
            <div className="num" style={{ ...NUM, fontSize: 44, fontWeight: 800, color: warn, lineHeight: 1, marginTop: 2 }}>01:47</div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {[5,4,3,2,1].map((m, i) => (
              <div key={m} style={{ width: 20, height: 4, background: (i >= 3) ? warn : border }} />
            ))}
          </div>
        </div>
      </div>

      {/* DTL HERO + start-line visual */}
      <div style={{ padding: "12px 20px 0", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: surface, border: `1px solid ${border}`, padding: 18, display: "flex", flexDirection: "column" }}>
          <div className="label" style={{ color: text3, textAlign: "center" }}>DISTANCIA A LÍNEA</div>
          <div className="num" style={{ ...NUM, fontSize: 96, fontWeight: 800, color: text, lineHeight: 0.95, textAlign: "center", letterSpacing: "-0.04em", marginTop: 4 }}>
            48<span style={{ fontSize: 28, color: text3, fontWeight: 500, marginLeft: 6 }}>m</span>
          </div>

          {/* Start line schematic */}
          <div style={{ marginTop: 14, height: 100, position: "relative" }}>
            <svg width="100%" height="100%" viewBox="0 0 320 100" preserveAspectRatio="none">
              {/* wind arrow */}
              <g transform="translate(160, 10)">
                <line x1="0" y1="-2" x2="0" y2="14" stroke={navy} strokeWidth="1.5" strokeDasharray="3 2"/>
                <polygon points="0,14 -4,9 4,9" fill={navy}/>
                <text x="0" y="-5" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" fill={navy} textAnchor="middle">285°</text>
              </g>
              {/* start line */}
              <line x1="40" y1="60" x2="280" y2="60" stroke={text2} strokeWidth="2"/>
              {/* committee (right) */}
              <rect x="272" y="52" width="16" height="16" fill="#D11A2A"/>
              <text x="280" y="84" fontFamily="Inter" fontSize="9" fontWeight="700" fill={text2} textAnchor="middle">COMMITTEE</text>
              {/* pin (left) */}
              <circle cx="40" cy="60" r="7" fill="#F59E0B"/>
              <text x="40" y="84" fontFamily="Inter" fontSize="9" fontWeight="700" fill={text2} textAnchor="middle">PIN ★</text>
              {/* favored zone shading */}
              <rect x="40" y="46" width="80" height="28" fill={lift} opacity="0.16"/>
              {/* boat */}
              <g transform="translate(140, 88) rotate(-15)">
                <polygon points="0,-8 5,8 -5,8" fill={navy}/>
              </g>
              {/* distance bracket */}
              <line x1="140" y1="60" x2="140" y2="88" stroke={text3} strokeWidth="1" strokeDasharray="2 2"/>
            </svg>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: text3, fontWeight: 600 }}>
            <span>← PIN favorecido <span style={{ color: lift, fontWeight: 700 }} className="num">+22m</span></span>
            <span>COMMITTEE →</span>
          </div>
        </div>

        {/* Time to burn */}
        <div style={{ background: lift, color: isL?"#FFFFFF":"#000000", padding: 16, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
          <div>
            <div className="label" style={{ opacity: 0.85 }}>TIME TO BURN</div>
            <div className="num" style={{ ...NUM, fontSize: 44, fontWeight: 800, lineHeight: 1, marginTop: 2 }}>+3s</div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, opacity: 0.9 }}>Timing perfecto</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 600, opacity: 0.9 }}>
            <div className="num">SOG 4.2 kt</div>
            <div className="num">t- 1:47</div>
          </div>
        </div>

        {/* small data row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div style={{ background: surface, border: `1px solid ${border}`, padding: 12 }}>
            <div className="label" style={{ color: text3 }}>FAVORED END</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <BoyaMarker theme={theme} kind="pin" size={20} />
              <span style={{ fontSize: 16, fontWeight: 700 }}>Pin</span>
              <span className="num" style={{ ...NUM, fontSize: 14, color: lift, fontWeight: 700 }}>+22m</span>
            </div>
          </div>
          <div style={{ background: surface, border: `1px solid ${border}`, padding: 12 }}>
            <div className="label" style={{ color: text3 }}>LÍNEA BIAS</div>
            <div className="num" style={{ ...NUM, fontSize: 22, fontWeight: 700, marginTop: 2 }}>+8°</div>
            <div style={{ fontSize: 10, color: text3 }}>port end up</div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: 20, display: "grid", gridTemplateColumns: "1fr 56px", gap: 8 }}>
        <button style={{ background: navy, color: isL?"#FFF":"#000", border: "none", padding: 16, fontSize: 14, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Cambiar a mapa
        </button>
        <button style={{ background: surface, border: `1.5px solid ${border}`, color: text, display: "flex", alignItems: "center", justifyContent: "center" }}>{I.refresh}</button>
      </div>

      <ScreenTabBar theme={theme} active="tactica" />
    </div>
  );
}

// ============================================================================
// 3. MAP — floating UI over a chart
// ============================================================================
function ScreenMap({ theme = "l" }) {
  const isL = theme === "l";
  const text = isL ? "#0B1320" : "#FFFFFF";
  const text2 = isL ? "#475266" : "#D6DEE8";
  const text3 = isL ? "#8392A6" : "#8FA0B6";
  const surface = isL ? "#FFFFFF" : "#0A0F18";
  const border = isL ? "#E0E6EE" : "#1E2839";
  const navy = isL ? "#0E2A4E" : "#00C2FF";
  const lift = isL ? "#15A34A" : "#2EF07A";

  return (
    <div style={{ flex: 1, position: "relative", display: "flex", flexDirection: "column" }}>
      {/* Map */}
      <MapPlaceholder theme={theme} style={{ position: "absolute", inset: 0 }}>
        {/* Wind streamlines */}
        <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} viewBox="0 0 400 800" preserveAspectRatio="none">
          {[...Array(28)].map((_, i) => {
            const y = 30 + i * 28;
            const phase = (i % 3) * 40;
            return (
              <path key={i}
                d={`M ${-20 + phase} ${y} C 80 ${y-12}, 180 ${y+18}, 280 ${y-8} S 440 ${y+10}, 460 ${y}`}
                fill="none"
                stroke={isL?"rgba(14,107,168,0.30)":"rgba(0,194,255,0.45)"}
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* Boyas */}
        <div style={{ position: "absolute", top: 200, left: 80 }}><BoyaMarker theme={theme} kind="committee" size={32} /></div>
        <div style={{ position: "absolute", top: 230, left: 220 }}><BoyaMarker theme={theme} kind="pin" size={32} /></div>
        <div style={{ position: "absolute", top: 380, left: 160 }}><BoyaMarker theme={theme} kind="windward" size={36} /></div>
        {/* start line */}
        <svg style={{ position: "absolute", top: 0, left: 0 }} width="393" height="600">
          <line x1="96" y1="218" x2="236" y2="248" stroke={text2} strokeWidth="2" strokeDasharray="4 3"/>
          {/* laylines */}
          <line x1="176" y1="396" x2="80" y2="600" stroke={lift} strokeWidth="1.5" strokeDasharray="6 4"/>
          <line x1="176" y1="396" x2="280" y2="600" stroke={lift} strokeWidth="1.5" strokeDasharray="6 4"/>
        </svg>

        {/* Boat */}
        <div style={{ position: "absolute", top: 500, left: 180 }}>
          <svg width="28" height="36">
            <polygon points="14,0 22,30 14,26 6,30" fill={navy} stroke={isL?"#fff":"#000"} strokeWidth="1.5"/>
          </svg>
        </div>
      </MapPlaceholder>

      {/* Top floating bar */}
      <div style={{ position: "relative", padding: "8px 16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 2 }}>
        <div style={{ background: surface, padding: "8px 14px", display: "flex", alignItems: "center", gap: 8, border: `1px solid ${border}` }}>
          <span style={{ color: navy, display: "flex" }}>{I.compass}</span>
          <div style={{ fontSize: 12, fontWeight: 700 }}>Algarrobo</div>
          <div className="num" style={{ fontSize: 11, color: text3 }}>−33.36° −71.67°</div>
        </div>
        <div style={{ background: surface, width: 40, height: 40, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color: text2 }}>{I.settings}</div>
      </div>

      {/* Layer toggles vertical right side */}
      <div style={{ position: "absolute", right: 16, top: 110, display: "flex", flexDirection: "column", gap: 6, zIndex: 2 }}>
        <div style={{ background: navy, color: isL?"#fff":"#000", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${navy}` }}>{I.wind}</div>
        <div style={{ background: surface, color: text2, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${border}` }}>{I.layers}</div>
        <div style={{ background: navy, color: isL?"#fff":"#000", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>{I.compass}</div>
        <div style={{ background: surface, color: text2, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${border}` }}>{I.satellite}</div>
        <div style={{ background: surface, color: text2, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${border}` }}>{I.map}</div>
      </div>

      {/* Wind callout floating left top */}
      <div style={{ position: "absolute", left: 16, top: 64, background: surface, border: `1px solid ${border}`, padding: "8px 12px", zIndex: 2 }}>
        <div className="label" style={{ color: text3 }}>VIENTO</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span className="num" style={{ ...NUM, fontSize: 22, fontWeight: 800 }}>14</span>
          <span style={{ fontSize: 11, color: text3 }} className="num">kt · 285°</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* FAB — marcar boya */}
      <div style={{ position: "absolute", right: 16, bottom: 200, zIndex: 3 }}>
        <button style={{ background: isL?"#E03A2C":"#FF5447", color: "#fff", width: 64, height: 64, border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: isL?"0 8px 20px rgba(224,58,44,0.4)":"none" }}>
          {I.marker}
        </button>
      </div>

      {/* Bottom sheet (expanded) */}
      <div style={{ position: "relative", background: surface, border: `1px solid ${border}`, borderBottom: "none", padding: 16, zIndex: 2 }}>
        <div style={{ width: 36, height: 4, background: isL?"#C9D2DE":"#2C3A52", margin: "0 auto 12px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div className="label" style={{ color: text3 }}>TRACKING ACTIVO · 12:08</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>Sesión #14</div>
          </div>
          <div style={{ background: lift + "22", color: lift, padding: "4px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.14em" }}>● REC</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginTop: 12 }}>
          <div><div className="label" style={{ color: text3 }}>SOG</div><div className="num" style={{ ...NUM, fontSize: 22, fontWeight: 700 }}>6.8</div></div>
          <div><div className="label" style={{ color: text3 }}>COG</div><div className="num" style={{ ...NUM, fontSize: 22, fontWeight: 700 }}>285°</div></div>
          <div><div className="label" style={{ color: text3 }}>TWA</div><div className="num" style={{ ...NUM, fontSize: 22, fontWeight: 700 }}>42°</div></div>
          <div><div className="label" style={{ color: text3 }}>POL</div><div className="num" style={{ ...NUM, fontSize: 22, fontWeight: 700, color: lift }}>94%</div></div>
        </div>
      </div>

      <ScreenTabBar theme={theme} active="mapa" />
    </div>
  );
}

// ============================================================================
// 4. HOME / DASHBOARD
// ============================================================================
function ScreenHome({ theme = "l" }) {
  const isL = theme === "l";
  const text = isL ? "#0B1320" : "#FFFFFF";
  const text2 = isL ? "#475266" : "#D6DEE8";
  const text3 = isL ? "#8392A6" : "#8FA0B6";
  const bg = isL ? "#EEF2F7" : "#000000";
  const surface = isL ? "#FFFFFF" : "#0A0F18";
  const surface2 = isL ? "#F6F8FB" : "#121925";
  const border = isL ? "#E0E6EE" : "#1E2839";
  const navy = isL ? "#0E2A4E" : "#00C2FF";
  const lift = isL ? "#15A34A" : "#2EF07A";
  const warn = isL ? "#D97706" : "#FFB020";

  const Quick = ({ icon, label, accent }) => (
    <div style={{ background: surface, border: `1px solid ${border}`, padding: 14, display: "flex", flexDirection: "column", gap: 8, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -8, top: -8, width: 36, height: 36, background: accent, opacity: 0.12 }} />
      <div style={{ color: accent, display: "flex" }}>{icon}</div>
      <div style={{ fontSize: 13, fontWeight: 700, color: text }}>{label}</div>
    </div>
  );

  return (
    <div style={{ background: bg, flex: 1, display: "flex", flexDirection: "column", color: text, overflow: "hidden" }}>
      {/* greeting */}
      <div style={{ padding: "8px 20px 4px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 13, color: text3, fontWeight: 500 }}>Hola, Felipe</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
            Algarrobo
            <span style={{ fontSize: 12, color: text3, fontWeight: 500 }}>· Cofradía</span>
          </div>
        </div>
        <Wordmark size={26} color={navy} />
      </div>

      <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: 12, overflow: "auto" }}>

        {/* Condición ahora */}
        <div style={{ background: surface, border: `1px solid ${border}`, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div className="label" style={{ color: text3 }}>CONDICIÓN · AHORA · 14:32</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MiniCompass size={28} heading={285} theme={theme} />
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginTop: 8 }}>
            <div>
              <div className="num" style={{ ...NUM, fontSize: 72, fontWeight: 800, lineHeight: 0.95, color: text }}>14</div>
              <div style={{ fontSize: 12, color: text3, marginTop: 2 }}>nudos · WSW 285°</div>
            </div>
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: text3, marginBottom: 4 }}>
                <span>RACHAS</span><span className="num">17 kt</span>
              </div>
              <div style={{ height: 4, background: surface2, position: "relative", marginBottom: 8 }}>
                <div style={{ position: "absolute", inset: 0, width: "70%", background: lift }} />
                <div style={{ position: "absolute", inset: 0, left: "70%", width: "15%", background: warn }} />
              </div>
              {/* next 3 hours mini-bars */}
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 36 }}>
                {[14, 15, 16, 14, 12, 11].map((v, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ width: "100%", height: v * 1.8, background: i === 0 ? navy : (isL?"#C9D2DE":"#2C3A52") }} />
                    <div className="num" style={{ fontSize: 9, color: text3 }}>{14+i}h</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Atmósfera */}
        <div style={{ background: surface, border: `1px solid ${border}`, padding: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4 }}>
          {[
            { l: "UV", v: "7", s: "alto", c: warn },
            { l: "VIS", v: "12", s: "km" },
            { l: "LLUVIA", v: "8", s: "% prob" },
            { l: "PRES", v: "1014", s: "hPa ↓" },
          ].map((m, i) => (
            <div key={i} style={{ padding: "4px 8px", borderRight: i < 3 ? `1px solid ${border}` : "none" }}>
              <div className="label" style={{ color: text3, fontSize: 9 }}>{m.l}</div>
              <div className="num" style={{ ...NUM, fontSize: 20, fontWeight: 700, color: m.c || text, lineHeight: 1, marginTop: 2 }}>{m.v}</div>
              <div style={{ fontSize: 9, color: text3, marginTop: 1 }}>{m.s}</div>
            </div>
          ))}
        </div>

        {/* 4 quick actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <Quick icon={I.map} label="Mapa" accent={navy} />
          <Quick icon={I.play} label="Regata" accent={lift} />
          <Quick icon={I.compass} label="Táctica" accent={isL?"#0E6BA8":"#00C2FF"} />
          <Quick icon={I.book} label="Bitácora" accent={text2} />
        </div>

        {/* última sesión */}
        <div style={{ background: surface, border: `1px solid ${border}`, padding: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <div className="label" style={{ color: text3 }}>ÚLTIMA SESIÓN · DOM 16 MAY</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>Regata Liga · 02</div>
            </div>
            <div className="num" style={{ fontSize: 11, color: text3 }}>1h 42m</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 10 }}>
            <div><div className="label" style={{ color: text3 }}>DIST</div><div className="num" style={{ ...NUM, fontSize: 18, fontWeight: 700 }}>14.2<span style={{ fontSize: 10, color: text3 }}>nm</span></div></div>
            <div><div className="label" style={{ color: text3 }}>VIENTO</div><div className="num" style={{ ...NUM, fontSize: 18, fontWeight: 700 }}>12.8<span style={{ fontSize: 10, color: text3 }}>kt</span></div></div>
            <div><div className="label" style={{ color: text3 }}>MAX</div><div className="num" style={{ ...NUM, fontSize: 18, fontWeight: 700 }}>8.4<span style={{ fontSize: 10, color: text3 }}>kt</span></div></div>
            <div><div className="label" style={{ color: text3 }}>POLAR</div><div className="num" style={{ ...NUM, fontSize: 18, fontWeight: 700, color: lift }}>91%</div></div>
          </div>
        </div>

      </div>

      <ScreenTabBar theme={theme} active="home" />
    </div>
  );
}

// ============================================================================
// 5. BITÁCORA — sessions list
// ============================================================================
function ScreenBitacora({ theme = "l" }) {
  const isL = theme === "l";
  const text = isL ? "#0B1320" : "#FFFFFF";
  const text2 = isL ? "#475266" : "#D6DEE8";
  const text3 = isL ? "#8392A6" : "#8FA0B6";
  const bg = isL ? "#EEF2F7" : "#000000";
  const surface = isL ? "#FFFFFF" : "#0A0F18";
  const surface2 = isL ? "#F6F8FB" : "#121925";
  const border = isL ? "#E0E6EE" : "#1E2839";
  const navy = isL ? "#0E2A4E" : "#00C2FF";
  const lift = isL ? "#15A34A" : "#2EF07A";

  const sessions = [
    { d: "16 MAY · DOM", t: "Regata Liga · 02", dist: "14.2", wind: "12.8", polar: 91, dur: "1h 42m", spot: "Algarrobo" },
    { d: "12 MAY · MIÉ", t: "Entreno solo", dist: "8.1", wind: "9.4", polar: 84, dur: "1h 12m", spot: "Higuerillas" },
    { d: "08 MAY · SÁB", t: "Regata Liga · 01", dist: "16.7", wind: "15.2", polar: 88, dur: "2h 04m", spot: "Algarrobo" },
    { d: "04 MAY · MAR", t: "Entreno tripulación", dist: "5.4", wind: "8.0", polar: 79, dur: "0h 58m", spot: "Quintero" },
  ];

  return (
    <div style={{ background: bg, flex: 1, display: "flex", flexDirection: "column", color: text }}>
      <div style={{ padding: "8px 20px 12px" }}>
        <div className="label" style={{ color: text3 }}>BITÁCORA</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 2 }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>14 sesiones</div>
          <button style={{ background: navy, color: isL?"#fff":"#000", border: "none", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {I.download} GPX
          </button>
        </div>
      </div>

      {/* totals strip */}
      <div style={{ margin: "0 20px", background: surface, border: `1px solid ${border}`, padding: 12, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        <div><div className="label" style={{ color: text3 }}>HORAS</div><div className="num" style={{ ...NUM, fontSize: 24, fontWeight: 700 }}>32.4</div></div>
        <div style={{ borderLeft: `1px solid ${border}`, paddingLeft: 12 }}><div className="label" style={{ color: text3 }}>MILLAS</div><div className="num" style={{ ...NUM, fontSize: 24, fontWeight: 700 }}>184</div></div>
        <div style={{ borderLeft: `1px solid ${border}`, paddingLeft: 12 }}><div className="label" style={{ color: text3 }}>POLAR Ø</div><div className="num" style={{ ...NUM, fontSize: 24, fontWeight: 700, color: lift }}>87%</div></div>
      </div>

      {/* filters */}
      <div style={{ padding: "12px 20px 8px", display: "flex", gap: 6, overflow: "auto" }}>
        {["Todo", "Mayo", "Algarrobo", "Higuerillas", "Quintero"].map((f, i) => (
          <div key={f} style={{
            padding: "6px 12px", fontSize: 11, fontWeight: 700,
            background: i === 0 ? navy : surface,
            color: i === 0 ? (isL?"#fff":"#000") : text2,
            border: i === 0 ? "none" : `1px solid ${border}`,
            whiteSpace: "nowrap"
          }}>{f}</div>
        ))}
      </div>

      {/* list */}
      <div style={{ padding: "0 20px", display: "flex", flexDirection: "column", gap: 8, flex: 1, overflow: "auto" }}>
        {sessions.map((s, i) => (
          <div key={i} style={{ background: surface, border: `1px solid ${border}`, padding: 14, display: "grid", gridTemplateColumns: "1fr 86px", gap: 12 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div className="label" style={{ color: text3 }}>{s.d}</div>
                <div className="num" style={{ fontSize: 10, color: text3 }}>{s.dur}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{s.t}</div>
              <div style={{ fontSize: 11, color: text3, marginTop: 2 }}>{s.spot}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "baseline" }}>
                <div><span className="num" style={{ fontSize: 14, fontWeight: 700 }}>{s.dist}</span><span style={{ fontSize: 10, color: text3 }} className="num"> nm</span></div>
                <div><span className="num" style={{ fontSize: 14, fontWeight: 700 }}>{s.wind}</span><span style={{ fontSize: 10, color: text3 }} className="num"> kt</span></div>
                <div><span className="num" style={{ fontSize: 14, fontWeight: 700, color: s.polar >= 85 ? lift : text }}>{s.polar}%</span></div>
              </div>
            </div>
            {/* mini track */}
            <div style={{ background: surface2, position: "relative", overflow: "hidden" }}>
              <svg width="100%" height="100%" viewBox="0 0 86 80" preserveAspectRatio="none">
                <path d={`M 8 ${60-i*5} Q 30 ${20+i*3}, 50 ${40-i*2} T 78 ${20+i*3}`} fill="none" stroke={navy} strokeWidth="2"/>
                <circle cx={8} cy={60-i*5} r="2.5" fill={lift}/>
                <circle cx={78} cy={20+i*3} r="2.5" fill={isL?"#E03A2C":"#FF5447"}/>
              </svg>
            </div>
          </div>
        ))}
      </div>

      <ScreenTabBar theme={theme} active="bitacora" />
    </div>
  );
}

// ============================================================================
// Tab bar component (reused)
// ============================================================================
function ScreenTabBar({ theme, active }) {
  const isL = theme === "l";
  const surface = isL ? "#FFFFFF" : "#0A0F18";
  const border = isL ? "#E0E6EE" : "#1E2839";
  const navy = isL ? "#0E2A4E" : "#00C2FF";
  const muted = isL ? "#8392A6" : "#8FA0B6";

  const tabs = [
    { id: "home", icon: I.compass, label: "Home" },
    { id: "mapa", icon: I.map, label: "Mapa" },
    { id: "regata", icon: I.play, label: "Regata" },
    { id: "tactica", icon: I.flag, label: "Táctica" },
    { id: "bitacora", icon: I.book, label: "Bitácora" },
  ];
  return (
    <div style={{ background: surface, borderTop: `1px solid ${border}`, padding: "8px 8px 28px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", flexShrink: 0 }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <div key={t.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, color: isActive ? navy : muted }}>
            <div style={{ display: "flex" }}>{t.icon}</div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em" }}>{t.label}</div>
            {isActive && <div style={{ width: 16, height: 2, background: navy, marginTop: -2 }} />}
          </div>
        );
      })}
    </div>
  );
}

Object.assign(window, { ScreenRaceLive, ScreenPrestart, ScreenMap, ScreenHome, ScreenBitacora, ScreenTabBar });
