// Special states: OCS alert, no GPS, T-10 final countdown, voice cue notification.

// ============================================================================
// OCS — Critical alert (deck mode obligatorio para que se entienda la prioridad)
// ============================================================================
function StateOCS({ theme = "d" }) {
  const isL = theme === "l";
  const text3 = isL ? "#8392A6" : "#8FA0B6";
  const header = isL ? "#E03A2C" : "#FF5447";

  // Full bleed alert
  return (
    <div style={{ background: isL?"#FEE2E2":"#1A0606", flex: 1, display: "flex", flexDirection: "column", color: isL?"#0B1320":"#FFFFFF", position: "relative", overflow: "hidden" }}>
      {/* huge background mark */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: isL ? 0.08 : 0.18 }}>
        <svg width="700" height="700" viewBox="0 0 24 24">
          <path d="M12 3 L1 22 L23 22 Z" fill="none" stroke={header} strokeWidth="0.4"/>
        </svg>
      </div>

      <div style={{ padding: "8px 20px 12px", display: "flex", justifyContent: "space-between", position: "relative" }}>
        <div className="label" style={{ color: header }}>● ALERT · CRITICAL</div>
        <div className="num" style={{ fontSize: 11, fontWeight: 700, color: header }}>T+00:02</div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px", position: "relative", gap: 16 }}>
        <div style={{ color: header, display: "flex" }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={header} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 L1 22 L23 22 Z"/>
            <path d="M12 10 v5"/>
            <circle cx="12" cy="19" r="0.8" fill={header} stroke="none"/>
          </svg>
        </div>
        <div className="num" style={{ fontSize: 96, fontWeight: 800, color: header, lineHeight: 0.9, letterSpacing: "-0.04em" }}>OCS</div>
        <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.15 }}>
          Cruzaste la línea hace <span className="num" style={{ color: header }}>2 s</span>
        </div>
        <div style={{ fontSize: 16, color: isL?"#475266":"#D6DEE8", fontWeight: 500 }}>
          Regresa a sotavento del committee antes de tu próxima maniobra.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          <div style={{ background: isL?"#FFFFFF":"#000", border: `1.5px solid ${header}`, padding: 12 }}>
            <div className="label" style={{ color: header }}>DISTANCIA OCS</div>
            <div className="num" style={{ fontSize: 32, fontWeight: 800, color: header, marginTop: 2 }}>−14<span style={{ fontSize: 14, fontWeight: 500 }}> m</span></div>
          </div>
          <div style={{ background: isL?"#FFFFFF":"#000", border: `1.5px solid ${header}`, padding: 12 }}>
            <div className="label" style={{ color: header }}>SOG ACTUAL</div>
            <div className="num" style={{ fontSize: 32, fontWeight: 800, color: header, marginTop: 2 }}>5.2<span style={{ fontSize: 14, fontWeight: 500 }}> kt</span></div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
        <button style={{ background: header, color: "#FFFFFF", border: "none", padding: 20, fontSize: 16, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          He vuelto · Acuso recibo
        </button>
        <div style={{ textAlign: "center", fontSize: 11, color: text3, fontWeight: 500 }}>
          También sonará por voz: <span style={{ fontWeight: 700 }}>“OCS — regresa”</span>
        </div>
      </div>

      <ScreenTabBar theme={theme} active="regata" />
    </div>
  );
}

// ============================================================================
// No GPS — empty state
// ============================================================================
function StateNoGPS({ theme = "l" }) {
  const isL = theme === "l";
  const text = isL ? "#0B1320" : "#FFFFFF";
  const text2 = isL ? "#475266" : "#D6DEE8";
  const text3 = isL ? "#8392A6" : "#8FA0B6";
  const bg = isL ? "#EEF2F7" : "#000000";
  const surface = isL ? "#FFFFFF" : "#0A0F18";
  const border = isL ? "#E0E6EE" : "#1E2839";
  const navy = isL ? "#0E2A4E" : "#00C2FF";
  const warn = isL ? "#D97706" : "#FFB020";

  return (
    <div style={{ background: bg, flex: 1, display: "flex", flexDirection: "column", color: text }}>
      <div style={{ padding: "8px 20px 12px", display: "flex", justifyContent: "space-between" }}>
        <div className="label" style={{ color: text2 }}>REGATA</div>
        <div className="label" style={{ color: warn }}>● SIN GPS</div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, gap: 18, textAlign: "center" }}>
        {/* Satellite scanning animation (static) */}
        <div style={{ position: "relative", width: 140, height: 140 }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            {[60, 45, 30].map((r, i) => (
              <circle key={r} cx="70" cy="70" r={r} fill="none" stroke={warn} strokeOpacity={0.15 + i * 0.1} strokeWidth="1" strokeDasharray="3 4"/>
            ))}
            <circle cx="70" cy="70" r="6" fill={warn}/>
            <g transform="translate(118, 22)" stroke={warn} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="m-4 0 4-4 4 4-4 4z M-7 -7 4 -4 M-7 7 4 4"/>
            </g>
          </svg>
        </div>

        <div style={{ fontSize: 22, fontWeight: 700 }}>Buscando satélites…</div>
        <div style={{ fontSize: 14, color: text2, fontWeight: 500, maxWidth: 280, lineHeight: 1.5 }}>
          No detectamos posición. Verifica que la app tenga permiso de ubicación y que estés en cubierta — no bajo cubierta.
        </div>

        {/* Diagnostic data */}
        <div style={{ background: surface, border: `1px solid ${border}`, padding: 14, width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
          <div className="label" style={{ color: text3 }}>DIAGNÓSTICO</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: text2 }}>Permiso ubicación</span>
            <span style={{ color: warn, fontWeight: 700 }}>Solicitando…</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: text2 }}>Satélites visibles</span>
            <span className="num" style={{ fontWeight: 700 }}>0 / 24</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
            <span style={{ color: text2 }}>Última posición</span>
            <span className="num" style={{ color: text3, fontWeight: 600 }}>hace 8 s</span>
          </div>
        </div>
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
        <button style={{ background: navy, color: isL?"#fff":"#000", border: "none", padding: 16, fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {I.refresh} Reintentar
        </button>
        <button style={{ background: "transparent", color: text2, border: `1.5px solid ${border}`, padding: 14, fontSize: 13, fontWeight: 600 }}>
          Continuar sin tracking
        </button>
      </div>

      <ScreenTabBar theme={theme} active="regata" />
    </div>
  );
}

// ============================================================================
// Final 10 seconds — full bleed countdown
// ============================================================================
function StateFinalCountdown({ theme = "d" }) {
  const isL = theme === "l";
  const text = isL ? "#0B1320" : "#FFFFFF";
  const text3 = isL ? "#8392A6" : "#8FA0B6";
  const lift = isL ? "#15A34A" : "#2EF07A";
  const warn = isL ? "#D97706" : "#FFB020";
  const header = isL ? "#E03A2C" : "#FF5447";
  const bg = isL ? "#FEF3C7" : "#000000";

  return (
    <div style={{ background: bg, flex: 1, display: "flex", flexDirection: "column", color: text, position: "relative", overflow: "hidden" }}>
      {/* faint horizon grid */}
      <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: isL ? 0.4 : 1 }} />

      {/* Top strip */}
      <div style={{ padding: "8px 20px 12px", display: "flex", justifyContent: "space-between", position: "relative" }}>
        <div className="label" style={{ color: warn }}>● PRESTART · ÚLTIMOS 10 S</div>
        <div className="label" style={{ color: text3 }}>SOG 4.2</div>
      </div>

      {/* Giant countdown */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div className="label" style={{ color: warn, marginBottom: 8 }}>T MINUS</div>
        <div className="num" style={{
          fontSize: 320, fontWeight: 800, color: warn, lineHeight: 0.9, letterSpacing: "-0.08em",
          textShadow: isL ? "none" : `0 0 60px ${warn}55`
        }}>7</div>
        <div className="num" style={{ fontSize: 14, color: text3, marginTop: -4 }}>SEC</div>

        {/* DTL + TTB inline */}
        <div style={{ display: "flex", gap: 24, marginTop: 32, position: "relative" }}>
          <div style={{ textAlign: "center" }}>
            <div className="label" style={{ color: text3 }}>DTL</div>
            <div className="num" style={{ fontSize: 36, fontWeight: 800, color: text }}>32<span style={{ fontSize: 14, color: text3 }}>m</span></div>
          </div>
          <div style={{ width: 1, background: isL?"#C9D2DE":"#2C3A52" }} />
          <div style={{ textAlign: "center" }}>
            <div className="label" style={{ color: text3 }}>TTB</div>
            <div className="num" style={{ fontSize: 36, fontWeight: 800, color: lift }}>+1<span style={{ fontSize: 14, color: text3 }}>s</span></div>
          </div>
        </div>

        <div style={{ marginTop: 24, padding: "8px 16px", background: lift + "22", color: lift, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", position: "relative" }}>
          ✓ Timing perfecto
        </div>
      </div>

      {/* progress ticks */}
      <div style={{ padding: "0 20px 20px", display: "flex", gap: 4, position: "relative" }}>
        {[...Array(10)].map((_, i) => (
          <div key={i} style={{ flex: 1, height: 6, background: i < 3 ? warn : (isL?"#E0E6EE":"#1E2839") }} />
        ))}
      </div>

      <ScreenTabBar theme={theme} active="tactica" />
    </div>
  );
}

// ============================================================================
// Voice cue notification overlay
// ============================================================================
function StateVoiceCue({ theme = "d" }) {
  const isL = theme === "l";
  const text = isL ? "#0B1320" : "#FFFFFF";
  const text3 = isL ? "#8392A6" : "#8FA0B6";
  const surface = isL ? "#FFFFFF" : "#0A0F18";
  const border = isL ? "#E0E6EE" : "#1E2839";
  const navy = isL ? "#0E2A4E" : "#00C2FF";
  const lift = isL ? "#15A34A" : "#2EF07A";
  const bg = isL ? "#EEF2F7" : "#000000";

  // Render the race-live underneath then a voice toast on top
  return (
    <div style={{ background: bg, flex: 1, display: "flex", flexDirection: "column", color: text, position: "relative", overflow: "hidden" }}>

      {/* Backdrop content (dimmed live view) */}
      <div style={{ opacity: 0.35, pointerEvents: "none", display: "flex", flexDirection: "column", flex: 1 }}>
        <div style={{ padding: "8px 20px 12px" }}>
          <div className="label" style={{ color: text3 }}>● REC · ALGARROBO</div>
        </div>
        <div style={{ padding: "0 20px" }}>
          <div className="label" style={{ color: text3 }}>SOG · NUDOS</div>
          <div className="num" style={{ ...NUM, fontSize: 110, fontWeight: 800, lineHeight: 0.9, color: text }}>6.8</div>
        </div>
      </div>

      {/* Voice cue card — centered toast */}
      <div style={{ position: "absolute", top: 110, left: 16, right: 16, background: surface, border: `1px solid ${border}`, padding: 18, boxShadow: isL ? "0 12px 40px rgba(11,19,32,0.18)" : "0 0 0 1px " + navy }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* speaker icon with bars */}
          <div style={{ position: "relative", color: navy, display: "flex" }}>
            {I.mic}
          </div>
          <div style={{ flex: 1 }}>
            <div className="label" style={{ color: navy }}>● VOZ ACTIVA</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4, color: text }}>
              “Header sostenido 8°. Considera virar.”
            </div>
          </div>
        </div>

        {/* waveform */}
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 14, height: 28 }}>
          {[10, 16, 24, 18, 22, 14, 26, 20, 12, 18, 22, 16, 24, 18, 10, 14, 22, 18, 12, 24, 16, 20, 14, 22, 18, 10].map((h, i) => (
            <div key={i} style={{ width: 4, height: h, background: i < 10 ? navy : (isL?"#C9D2DE":"#2C3A52") }} />
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
          <div className="num" style={{ fontSize: 10, color: text3 }}>14:32:08 · ES-CL</div>
          <div style={{ fontSize: 11, color: text3, fontWeight: 600 }}>Tap para silenciar 60 s</div>
        </div>
      </div>

      {/* Settings preview at bottom */}
      <div style={{ position: "absolute", bottom: 96, left: 16, right: 16, background: surface, border: `1px solid ${border}`, padding: 14 }}>
        <div className="label" style={{ color: text3, marginBottom: 10 }}>CUES ACTIVOS · ESTA SESIÓN</div>
        {[
          { l: "Header / Lift sostenido > 6°", on: true },
          { l: "OCS / cruzaste la línea", on: true },
          { l: "5/4/1 min countdown", on: true },
          { l: "%Polar bajo 80%", on: false },
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderTop: i > 0 ? `1px solid ${border}` : "none" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: text }}>{c.l}</span>
            <div style={{ width: 36, height: 20, background: c.on ? lift : (isL?"#E0E6EE":"#1E2839"), borderRadius: 99, position: "relative" }}>
              <div style={{ width: 16, height: 16, borderRadius: 99, background: "#fff", position: "absolute", top: 2, left: c.on ? 18 : 2 }} />
            </div>
          </div>
        ))}
      </div>

      <ScreenTabBar theme={theme} active="regata" />
    </div>
  );
}

Object.assign(window, { StateOCS, StateNoGPS, StateFinalCountdown, StateVoiceCue });
