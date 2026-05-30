// All screens for the prototype. Each one is a function taking
// ({ state, dispatch, nav }) and returning JSX.

// ─────────────────────────────────────────────────────────────────────────────
// 1 · INICIO (Home / Dashboard)
// ─────────────────────────────────────────────────────────────────────────────
function ScreenHome({ state, nav, open }) {
  const { wind, sessions } = state;

  return (
    <div className="screen" style={{ padding: "8px 20px 12px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <button className="tap" onClick={() => open("spots")} style={{ textAlign: "left" }}>
          <div style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 500 }}>Hola, Felipe</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
            Algarrobo
            <Ic.chevD size={18} color="var(--text-3)" />
          </div>
          <div style={{ fontSize: 12, color: "var(--text-3)", fontWeight: 500 }}>Cofradía Náutica · ILCA 7</div>
        </button>
        <button className="tap" onClick={() => open("settings")} style={{ color: "var(--text-2)", width: 40, height: 40, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ic.settings size={18} />
        </button>
      </div>

      {/* Condición ahora */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 18, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="label" style={{ color: "var(--text-3)" }}>CONDICIÓN · AHORA</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <MiniCompass size={32} heading={wind.dir} />
            <div className="num" style={{ fontSize: 11, color: "var(--text-3)" }}>{wind.dir}°</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginTop: 8 }}>
          <div>
            <div className="num" style={{ fontSize: 84, fontWeight: 800, lineHeight: 0.9, letterSpacing: "-0.04em" }}>{wind.speed.toFixed(0)}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>nudos · WSW</div>
          </div>
          <div style={{ flex: 1, paddingBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-3)", marginBottom: 6, fontWeight: 600, letterSpacing: "0.05em" }}>
              <span>RACHAS</span><span className="num">{wind.gust} kt</span>
            </div>
            <div style={{ height: 4, background: "var(--surface-2)", position: "relative", marginBottom: 12 }}>
              <div style={{ position: "absolute", inset: 0, width: `${(wind.speed / 25) * 100}%`, background: "var(--lift)" }} />
              <div style={{ position: "absolute", inset: 0, left: `${(wind.speed / 25) * 100}%`, width: `${((wind.gust - wind.speed) / 25) * 100}%`, background: "var(--warn)" }} />
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 40 }}>
              {wind.next.map((v, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: v * 2, background: i === 0 ? "var(--accent)" : "var(--border-2)" }} />
                  <div className="num" style={{ fontSize: 9, color: "var(--text-3)" }}>{14+i}h</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Atmósfera */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 12, marginBottom: 12, display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
        {[
          { l: "UV",     v: "7",    s: "alto",     C: "var(--warn)" },
          { l: "VIS",    v: "12",   s: "km",       C: null },
          { l: "LLUVIA", v: "8",    s: "% prob",   C: null },
          { l: "PRES",   v: "1014", s: "hPa ↓",    C: null },
        ].map((m, i) => (
          <div key={i} style={{ padding: "4px 10px", borderRight: i < 3 ? "1px solid var(--border)" : "none" }}>
            <div className="label" style={{ color: "var(--text-3)", fontSize: 9 }}>{m.l}</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 700, color: m.C || "var(--text)", lineHeight: 1, marginTop: 2 }}>{m.v}</div>
            <div style={{ fontSize: 9, color: "var(--text-3)", marginTop: 1 }}>{m.s}</div>
          </div>
        ))}
      </div>

      {/* 4 quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        {[
          { id: "mapa",    label: "Mapa",     Ico: Ic.map,     accent: "var(--accent)" },
          { id: "regata",  label: "Regata",   Ico: Ic.play,    accent: "var(--lift)" },
          { id: "tactica", label: "Táctica",  Ico: Ic.flag,    accent: "var(--info)" },
          { id: "bitacora",label: "Bitácora", Ico: Ic.book,    accent: "var(--text-2)" },
        ].map(q => (
          <button key={q.id} className="tap" onClick={() => nav(q.id)} style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 16, display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start", position: "relative", overflow: "hidden", textAlign: "left" }}>
            <div style={{ position: "absolute", right: -10, top: -10, width: 40, height: 40, background: q.accent, opacity: 0.14 }} />
            <q.Ico size={22} color={q.accent} />
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{q.label}</div>
          </button>
        ))}
      </div>

      {/* Última sesión */}
      {sessions[0] && (
        <button className="tap" onClick={() => { nav("bitacora"); open("session", sessions[0].id); }}
          style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 14, textAlign: "left", width: "100%", display: "block" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <div className="label" style={{ color: "var(--text-3)" }}>ÚLTIMA SESIÓN · {sessions[0].dateLabel}</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginTop: 4 }}>{sessions[0].title}</div>
            </div>
            <div className="num" style={{ fontSize: 11, color: "var(--text-3)" }}>{sessions[0].duration}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 10 }}>
            {[
              { l: "DIST",   v: sessions[0].dist + "nm" },
              { l: "VIENTO", v: sessions[0].wind + "kt" },
              { l: "MAX",    v: sessions[0].max + "kt" },
              { l: "POLAR",  v: sessions[0].polar + "%", c: "var(--lift)" },
            ].map((s, i) => (
              <div key={i}>
                <div className="label" style={{ color: "var(--text-3)" }}>{s.l}</div>
                <div className="num" style={{ fontSize: 18, fontWeight: 700, color: s.c || "var(--text)" }}>{s.v}</div>
              </div>
            ))}
          </div>
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 · MAPA (full-bleed, floating UI)
// ─────────────────────────────────────────────────────────────────────────────
function ScreenMapa({ state, open, dispatch }) {
  const { wind, tracking, layers } = state;

  return (
    <div className="screen" style={{ overflow: "hidden", padding: 0, position: "relative" }}>
      <ChartBg style={{ position: "absolute", inset: 0 }}>
        {/* Wind streamlines if active */}
        {layers.viento && (
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} viewBox="0 0 400 800" preserveAspectRatio="none">
            {[...Array(24)].map((_, i) => {
              const y = 40 + i * 32;
              const phase = (i % 3) * 40;
              return <path key={i} d={`M ${-20 + phase} ${y} C 80 ${y-12}, 180 ${y+18}, 280 ${y-8} S 440 ${y+10}, 460 ${y}`} fill="none" stroke="var(--accent)" strokeOpacity="0.4" strokeWidth="1"/>;
            })}
          </svg>
        )}

        {/* boyas */}
        <div style={{ position: "absolute", top: 240, left: 70 }}><Boya kind="committee" size={36} /></div>
        <div style={{ position: "absolute", top: 270, left: 240 }}><Boya kind="pin" size={36} /></div>
        <div style={{ position: "absolute", top: 460, left: 180 }}><Boya kind="windward" size={40} /></div>

        {/* start line + laylines */}
        <svg style={{ position: "absolute", top: 0, left: 0 }} width="100%" height="100%" viewBox="0 0 430 800" preserveAspectRatio="none">
          <line x1="100" y1="258" x2="260" y2="287" stroke="var(--text-2)" strokeWidth="2" strokeDasharray="5 4"/>
          {layers.laylines && (<>
            <line x1="200" y1="480" x2="80" y2="700" stroke="var(--lift)" strokeWidth="1.5" strokeDasharray="6 5"/>
            <line x1="200" y1="480" x2="320" y2="700" stroke="var(--lift)" strokeWidth="1.5" strokeDasharray="6 5"/>
          </>)}
        </svg>

        {/* boat */}
        {tracking.active && (
          <div style={{ position: "absolute", top: 590, left: 200, transform: "rotate(-15deg)" }}>
            <svg width="32" height="40"><polygon points="16,0 24,34 16,30 8,34" fill="var(--accent)" stroke="var(--bg)" strokeWidth="2"/></svg>
          </div>
        )}
      </ChartBg>

      {/* Top bar */}
      <div style={{ position: "absolute", top: 12, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-start", zIndex: 5 }}>
        <button className="tap" onClick={() => open("spots")} style={{ background: "var(--surface)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--border)" }}>
          <Ic.compass size={18} color="var(--accent)" />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>Algarrobo</div>
            <div className="num" style={{ fontSize: 10, color: "var(--text-3)" }}>−33.36° −71.67°</div>
          </div>
        </button>
        <button className="tap" onClick={() => open("settings")} style={{ background: "var(--surface)", width: 42, height: 42, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-2)" }}>
          <Ic.settings size={18} />
        </button>
      </div>

      {/* Wind callout */}
      <div style={{ position: "absolute", top: 70, left: 16, background: "var(--surface)", border: "1px solid var(--border)", padding: "8px 12px", zIndex: 4 }}>
        <div className="label" style={{ color: "var(--text-3)" }}>VIENTO</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span className="num" style={{ fontSize: 24, fontWeight: 800 }}>{wind.speed.toFixed(0)}</span>
          <span className="num" style={{ fontSize: 11, color: "var(--text-3)" }}>kt · {wind.dir}°</span>
        </div>
      </div>

      {/* Layer toggles */}
      <div style={{ position: "absolute", top: 70, right: 16, display: "flex", flexDirection: "column", gap: 6, zIndex: 4 }}>
        {[
          { id: "viento",   Ico: Ic.wind },
          { id: "lluvia",   Ico: Ic.drop },
          { id: "laylines", Ico: Ic.compass },
          { id: "ais",      Ico: Ic.satellite },
          { id: "profundidad", Ico: Ic.layers },
        ].map(l => {
          const isOn = layers[l.id];
          return (
            <button key={l.id} className="tap" onClick={() => dispatch({ type: "toggleLayer", id: l.id })}
              style={{
                width: 46, height: 46,
                background: isOn ? "var(--accent)" : "var(--surface)",
                color: isOn ? "var(--bg)" : "var(--text-2)",
                border: `1px solid ${isOn ? "var(--accent)" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
              <l.Ico size={20} />
            </button>
          );
        })}
      </div>

      {/* FAB — marcar boya */}
      <button className="tap" onClick={() => open("boya")}
        style={{
          position: "absolute", right: 16, bottom: 200, zIndex: 6,
          width: 68, height: 68,
          background: "var(--header)", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
          borderRadius: 0,
        }}>
        <Ic.marker size={28} />
      </button>

      {/* Bottom sheet */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--surface)", border: "1px solid var(--border)", borderBottom: "none", padding: "12px 16px 16px", zIndex: 3 }}>
        <div style={{ width: 36, height: 4, background: "var(--border-2)", margin: "0 auto 12px" }} />
        {tracking.active ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <div className="label" style={{ color: "var(--text-3)" }}>TRACKING · {fmtClock(tracking.elapsedSec)}</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>Sesión activa</div>
              </div>
              <div style={{ background: "var(--lift)22", color: "var(--lift)", padding: "4px 10px", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em" }}>
                <span className="rec-dot">●</span> REC
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginTop: 12 }}>
              <div><div className="label" style={{ color: "var(--text-3)" }}>SOG</div><div className="num" style={{ fontSize: 20, fontWeight: 700 }}>{tracking.sog.toFixed(1)}</div></div>
              <div><div className="label" style={{ color: "var(--text-3)" }}>COG</div><div className="num" style={{ fontSize: 20, fontWeight: 700 }}>{Math.round(tracking.cog)}°</div></div>
              <div><div className="label" style={{ color: "var(--text-3)" }}>TWA</div><div className="num" style={{ fontSize: 20, fontWeight: 700 }}>{Math.abs(Math.round(tracking.twa))}°</div></div>
              <div><div className="label" style={{ color: "var(--text-3)" }}>POL</div><div className="num" style={{ fontSize: 20, fontWeight: 700, color: tracking.polar >= 85 ? "var(--lift)" : "var(--warn)" }}>{tracking.polar.toFixed(0)}%</div></div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div className="label" style={{ color: "var(--text-3)" }}>SIN TRACKING</div>
                <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>3 boyas marcadas</div>
              </div>
            </div>
            <button className="tap" onClick={() => open("iniciar")} style={{ width: "100%", background: "var(--lift)", color: "var(--bg)", padding: 14, fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Ic.play size={18} /> Iniciar regata
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 · REGATA — Live race screen (or setup state)
// ─────────────────────────────────────────────────────────────────────────────
function ScreenRegata({ state, dispatch, open }) {
  const { tracking, raceTimer } = state;

  if (!tracking.active && !raceTimer.active) {
    return <RegataSetup state={state} open={open} dispatch={dispatch} />;
  }
  return <RegataLive state={state} dispatch={dispatch} open={open} />;
}

function RegataSetup({ open }) {
  return (
    <div className="screen" style={{ padding: "8px 20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ marginBottom: 4 }}>
        <div className="label" style={{ color: "var(--text-3)" }}>REGATA</div>
        <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", marginTop: 2 }}>Lista de control</div>
        <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4, lineHeight: 1.5 }}>
          Confirma estos cuatro datos antes de iniciar el tracking.
        </div>
      </div>

      {[
        { label: "BARCO", value: "ILCA 7 · Felipe", Ico: Ic.flag, sub: "Polar cargado · pesar 79 kg" },
        { label: "SPOT", value: "Algarrobo", Ico: Ic.compass, sub: "Cofradía Náutica" },
        { label: "VIENTO ACTUAL", value: "14 kt · 285°", Ico: Ic.wind, sub: "Pronóstico Open-Meteo · estable 2 h" },
        { label: "BOYAS", value: "3 marcadas", Ico: Ic.marker, sub: "Committee · Pin · Windward" },
      ].map((row, i) => (
        <button key={i} className="tap" style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 14, textAlign: "left", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "center" }}>
          <div style={{ color: "var(--accent)" }}><row.Ico size={20} /></div>
          <div>
            <div className="label" style={{ color: "var(--text-3)" }}>{row.label}</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginTop: 2 }}>{row.value}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{row.sub}</div>
          </div>
          <Ic.chevR size={18} color="var(--text-3)" />
        </button>
      ))}

      <div style={{ flex: 1 }} />

      <div style={{ background: "var(--surface)", borderLeft: "3px solid var(--accent)", padding: 12, display: "flex", gap: 10 }}>
        <Ic.alert size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.5 }}>
          Al iniciar, el GPS comienza a grabar la sesión y los avisos por voz quedan activos. Puedes pausar en cualquier momento.
        </div>
      </div>

      <button className="tap" onClick={() => open("iniciar")} style={{ background: "var(--lift)", color: "var(--bg)", padding: 20, fontSize: 16, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
        <Ic.play size={22} /> Iniciar regata
      </button>
    </div>
  );
}

function RegataLive({ state, dispatch, open }) {
  const { tracking, raceTimer, wind } = state;
  const phase = raceTimerPhase(raceTimer);
  const phaseColor = {
    off: "var(--text-3)",
    prep: "var(--accent)",
    onemin: "var(--warn)",
    start: "var(--header)",
    racing: "var(--lift)",
  }[phase];
  const phaseLabel = { off: "OFF", prep: "PREP", onemin: "1 MIN", start: "START", racing: "RACING" }[phase];

  const shift = tracking.shift; // {kind, deg}

  return (
    <div className="screen" style={{ display: "flex", flexDirection: "column" }}>
      {/* Sub-header */}
      <div style={{ padding: "8px 20px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="rec-dot" style={{ width: 8, height: 8, borderRadius: 99, background: "var(--lift)" }} />
          <div className="label" style={{ color: "var(--text-2)" }}>EN VIVO · ALGARROBO</div>
        </div>
        <div style={{ display: "flex", gap: 8, color: "var(--text-2)" }}>
          <button className="tap" style={{ padding: 6 }}><Ic.signal size={16} /></button>
          <button className="tap" onClick={() => open("settings")} style={{ padding: 6 }}><Ic.more size={16} /></button>
        </div>
      </div>

      {/* Timer strip */}
      <div style={{ margin: "0 20px", background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", gap: 12 }}>
        <div>
          <div className="label" style={{ color: "var(--text-3)" }}>RACE TIMER · {phaseLabel}</div>
          <div className="num" style={{ fontSize: 42, fontWeight: 800, color: phaseColor, lineHeight: 1, marginTop: 2 }}>
            {raceTimer.active ? fmtClock(raceTimerRemaining(raceTimer)) : "--:--"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {raceTimer.active ? (
            <>
              <button className="tap" onClick={() => dispatch({ type: "raceTimerSync" })} style={{ width: 42, height: 42, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--warn)" }}><Ic.refresh size={16} /></button>
              <button className="tap" onClick={() => dispatch({ type: "raceTimerStop" })} style={{ width: 42, height: 42, border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--header)" }}><Ic.stop size={16} /></button>
            </>
          ) : (
            <button className="tap" onClick={() => dispatch({ type: "raceTimerStart", totalSec: 300 })} style={{ padding: "0 12px", height: 42, border: "1px solid var(--accent)", color: "var(--accent)", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700 }}>
              <Ic.play size={14} /> 5 MIN
            </button>
          )}
        </div>
      </div>

      {/* SOG hero */}
      <div style={{ padding: "16px 20px 8px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div className="label" style={{ color: "var(--text-3)" }}>SOG · NUDOS</div>
          <div key={Math.floor(tracking.sog * 10)} className="num flicker" style={{ fontSize: 116, fontWeight: 800, lineHeight: 0.9, color: "var(--text)", letterSpacing: "-0.05em", marginTop: 4 }}>{tracking.sog.toFixed(1)}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, paddingBottom: 12 }}>
          <div style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, letterSpacing: "0.1em" }}>%POLAR</div>
          <div className="num" style={{ fontSize: 32, fontWeight: 800, color: tracking.polar >= 85 ? "var(--lift)" : "var(--warn)", lineHeight: 1 }}>{tracking.polar.toFixed(0)}</div>
          <div style={{ width: 110, height: 4, background: "var(--surface-2)", position: "relative" }}>
            <div style={{ position: "absolute", inset: 0, width: `${tracking.polar}%`, background: tracking.polar >= 85 ? "var(--lift)" : "var(--warn)", transition: "width 400ms ease" }} />
            <div style={{ position: "absolute", top: -4, bottom: -4, left: "100%", width: 1.5, background: "var(--text-3)" }} />
          </div>
          <div className="num" style={{ fontSize: 10, color: "var(--text-3)" }}>obj 7.2 kt</div>
        </div>
      </div>

      {/* COG / TWA / Viento */}
      <div style={{ padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 12 }}>
          <div className="label" style={{ color: "var(--text-3)" }}>COG</div>
          <div className="num" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, marginTop: 2 }}>{Math.round(tracking.cog)}°</div>
          <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>{cardinal(tracking.cog)}</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 12 }}>
          <div className="label" style={{ color: "var(--text-3)" }}>TWA</div>
          <div className="num" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, marginTop: 2 }}>{Math.abs(Math.round(tracking.twa))}°</div>
          <div style={{ fontSize: 10, color: "var(--lift)", marginTop: 2, fontWeight: 700 }}>{tracking.twa < 0 ? "babor" : "estribor"} · ceñida</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 12 }}>
          <div className="label" style={{ color: "var(--text-3)" }}>VIENTO</div>
          <div className="num" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, marginTop: 2 }}>{wind.speed.toFixed(0)}</div>
          <div className="num" style={{ fontSize: 10, color: "var(--text-3)", marginTop: 2 }}>kt · {wind.dir}°</div>
        </div>
      </div>

      {/* Wind shift */}
      <div style={{ margin: "12px 20px 0", background: "var(--surface)", border: "1px solid var(--border)", padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="label" style={{ color: "var(--text-3)" }}>WIND SHIFT · 60 S</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <div style={{ background: (shift.kind === "lift" ? "var(--lift)" : "var(--header)") + "22", color: shift.kind === "lift" ? "var(--lift)" : "var(--header)", padding: "5px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                {shift.kind === "lift" ? <Ic.arrowUp size={14} /> : <Ic.arrowDn size={14} />}
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em" }}>{shift.kind.toUpperCase()}</span>
              </div>
              <span className="num" style={{ fontSize: 22, fontWeight: 800 }}>{shift.deg > 0 ? "+" : ""}{shift.deg}°</span>
            </div>
          </div>
          <svg width="120" height="44" viewBox="0 0 120 44">
            <line x1="0" y1="22" x2="120" y2="22" stroke="var(--text-3)" strokeOpacity="0.3" strokeDasharray="2 3"/>
            <polyline fill="none" stroke={shift.kind === "lift" ? "var(--lift)" : "var(--header)"} strokeWidth="2"
              points={shift.spark}/>
          </svg>
        </div>
      </div>

      {/* Layline */}
      <div style={{ margin: "8px 20px 0", padding: "12px 14px", background: "var(--surface-2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="label" style={{ color: "var(--text-3)" }}>LAYLINE · ESTRIBOR</div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 4 }}>W1 windward</div>
        </div>
        <div className="num" style={{ fontSize: 28, fontWeight: 800, color: "var(--accent)" }}>{tracking.layline}<span style={{ fontSize: 14, color: "var(--text-3)", marginLeft: 2, fontWeight: 500 }}>m</span></div>
      </div>

      <div style={{ flex: 1, minHeight: 12 }} />

      {/* Bottom CTA */}
      <div style={{ padding: "12px 20px 12px", display: "grid", gridTemplateColumns: "1fr 56px 56px", gap: 8 }}>
        <button className="tap" onClick={() => open("boya-quick")} style={{ background: "var(--header)", color: "#fff", padding: 16, fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Ic.marker size={18} /> Marcar boya
        </button>
        <button className="tap" onClick={() => dispatch({ type: "navTab", tab: "mapa" })} style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic.map size={20} /></button>
        <button className="tap" onClick={() => dispatch({ type: "trackingStop" })} style={{ background: "var(--surface)", border: "1px solid var(--header)", color: "var(--header)", display: "flex", alignItems: "center", justifyContent: "center" }}><Ic.stop size={18} /></button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4 · TÁCTICA — Prestart
// ─────────────────────────────────────────────────────────────────────────────
function ScreenTactica({ state, dispatch }) {
  const { raceTimer, tracking, wind } = state;
  const remaining = raceTimer.active ? raceTimerRemaining(raceTimer) : 107;
  const dtl = tracking.active ? tracking.dtl : 48;
  const ttb = 3;

  return (
    <div className="screen" style={{ padding: "8px 20px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div className="label" style={{ color: "var(--text-3)" }}>TÁCTICA · PRESTART</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>Línea de salida</div>
        </div>
        <button className="tap" style={{ color: "var(--text-2)" }}><Ic.edit size={18} /></button>
      </div>

      {/* Timer compact */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: "12px 16px", display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div className="label" style={{ color: "var(--text-3)" }}>RACE TIMER · 1 MIN</div>
          <div className="num" style={{ fontSize: 40, fontWeight: 800, color: "var(--warn)", lineHeight: 1, marginTop: 2 }}>{fmtClock(remaining)}</div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {[5,4,3,2,1].map((m, i) => (
            <div key={m} style={{ width: 20, height: 4, background: i < 4 ? "var(--warn)" : "var(--border)" }} />
          ))}
        </div>
      </div>

      {/* DTL hero with start line */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 18, marginBottom: 12 }}>
        <div className="label" style={{ color: "var(--text-3)", textAlign: "center" }}>DISTANCIA A LÍNEA</div>
        <div className="num" style={{ fontSize: 96, fontWeight: 800, lineHeight: 0.95, textAlign: "center", letterSpacing: "-0.04em", marginTop: 4 }}>
          {dtl}<span style={{ fontSize: 28, color: "var(--text-3)", fontWeight: 500, marginLeft: 6 }}>m</span>
        </div>

        <div style={{ marginTop: 14, height: 110, position: "relative" }}>
          <svg width="100%" height="100%" viewBox="0 0 340 110" preserveAspectRatio="none">
            <g transform="translate(170, 8)">
              <line x1="0" y1="-2" x2="0" y2="14" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 2"/>
              <polygon points="0,14 -4,9 4,9" fill="var(--accent)"/>
              <text x="0" y="-5" fontFamily="JetBrains Mono" fontSize="9" fontWeight="700" fill="var(--accent)" textAnchor="middle">{wind.dir}°</text>
            </g>
            <line x1="40" y1="64" x2="300" y2="64" stroke="var(--text-2)" strokeWidth="2"/>
            <rect x="290" y="56" width="16" height="16" fill="var(--b-committee)"/>
            <text x="298" y="90" fontFamily="Inter" fontSize="9" fontWeight="700" fill="var(--text-2)" textAnchor="middle">COMMITTEE</text>
            <circle cx="40" cy="64" r="7" fill="var(--b-pin)"/>
            <text x="40" y="90" fontFamily="Inter" fontSize="9" fontWeight="700" fill="var(--text-2)" textAnchor="middle">PIN ★</text>
            <rect x="40" y="48" width="86" height="32" fill="var(--lift)" opacity="0.16"/>
            <g transform="translate(150, 96) rotate(-15)">
              <polygon points="0,-9 6,9 -6,9" fill="var(--accent)"/>
            </g>
            <line x1="150" y1="64" x2="150" y2="96" stroke="var(--text-3)" strokeWidth="1" strokeDasharray="2 2"/>
          </svg>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "var(--text-3)", fontWeight: 600 }}>
          <span>← PIN favorecido <span style={{ color: "var(--lift)", fontWeight: 700 }} className="num">+22m</span></span>
          <span>COMMITTEE →</span>
        </div>
      </div>

      {/* TTB */}
      <div style={{ background: "var(--lift)", color: "var(--bg)", padding: 16, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", marginBottom: 12 }}>
        <div>
          <div className="label" style={{ opacity: 0.85 }}>TIME TO BURN</div>
          <div className="num" style={{ fontSize: 42, fontWeight: 800, lineHeight: 1, marginTop: 2 }}>+{ttb}s</div>
          <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2, opacity: 0.9 }}>Timing perfecto</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 600, opacity: 0.9 }}>
          <div className="num">SOG {tracking.active ? tracking.sog.toFixed(1) : "4.2"} kt</div>
          <div className="num">t- {fmtClock(remaining)}</div>
        </div>
      </div>

      {/* Favored end + bias */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 12 }}>
          <div className="label" style={{ color: "var(--text-3)" }}>FAVORECIDO</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
            <Boya kind="pin" size={22} />
            <span style={{ fontSize: 16, fontWeight: 700 }}>Pin</span>
          </div>
          <div className="num" style={{ fontSize: 13, color: "var(--lift)", fontWeight: 700, marginTop: 2 }}>+22 m</div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 12 }}>
          <div className="label" style={{ color: "var(--text-3)" }}>BIAS DE LÍNEA</div>
          <div className="num" style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>+8°</div>
          <div style={{ fontSize: 10, color: "var(--text-3)" }}>babor arriba</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5 · BITÁCORA — list & detail
// ─────────────────────────────────────────────────────────────────────────────
function ScreenBitacora({ state, open }) {
  const { sessions } = state;
  const [filter, setFilter] = React.useState("Todo");
  const filtered = filter === "Todo" ? sessions : sessions.filter(s => s.spot === filter);

  return (
    <div className="screen" style={{ padding: "8px 20px 16px" }}>
      <div style={{ marginBottom: 12 }}>
        <div className="label" style={{ color: "var(--text-3)" }}>BITÁCORA</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 2 }}>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>{sessions.length} sesiones</div>
          <button className="tap" style={{ background: "var(--accent)", color: "var(--bg)", padding: "8px 12px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Ic.download size={14} /> GPX
          </button>
        </div>
      </div>

      {/* Totals */}
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 12, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
        <div><div className="label" style={{ color: "var(--text-3)" }}>HORAS</div><div className="num" style={{ fontSize: 22, fontWeight: 700 }}>32.4</div></div>
        <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 12 }}><div className="label" style={{ color: "var(--text-3)" }}>MILLAS</div><div className="num" style={{ fontSize: 22, fontWeight: 700 }}>184</div></div>
        <div style={{ borderLeft: "1px solid var(--border)", paddingLeft: 12 }}><div className="label" style={{ color: "var(--text-3)" }}>POLAR Ø</div><div className="num" style={{ fontSize: 22, fontWeight: 700, color: "var(--lift)" }}>87%</div></div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 10, paddingBottom: 4 }}>
        {["Todo", "Algarrobo", "Higuerillas", "Quintero"].map(f => (
          <button key={f} className="tap" onClick={() => setFilter(f)} style={{
            padding: "6px 12px", fontSize: 11, fontWeight: 700,
            background: f === filter ? "var(--accent)" : "var(--surface)",
            color: f === filter ? "var(--bg)" : "var(--text-2)",
            border: f === filter ? "none" : "1px solid var(--border)",
            whiteSpace: "nowrap"
          }}>{f}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((s, i) => (
          <button key={s.id} className="tap" onClick={() => open("session", s.id)}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", padding: 14, textAlign: "left", display: "grid", gridTemplateColumns: "1fr 90px", gap: 12 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div className="label" style={{ color: "var(--text-3)" }}>{s.dateLabel}</div>
                <div className="num" style={{ fontSize: 10, color: "var(--text-3)" }}>{s.duration}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{s.spot}</div>
              <div style={{ display: "flex", gap: 12, marginTop: 8, alignItems: "baseline" }}>
                <div><span className="num" style={{ fontSize: 14, fontWeight: 700 }}>{s.dist}</span><span className="num" style={{ fontSize: 10, color: "var(--text-3)" }}> nm</span></div>
                <div><span className="num" style={{ fontSize: 14, fontWeight: 700 }}>{s.wind}</span><span className="num" style={{ fontSize: 10, color: "var(--text-3)" }}> kt</span></div>
                <div><span className="num" style={{ fontSize: 14, fontWeight: 700, color: s.polar >= 85 ? "var(--lift)" : "var(--text)" }}>{s.polar}%</span></div>
              </div>
            </div>
            <div style={{ background: "var(--surface-2)", overflow: "hidden", position: "relative" }}>
              <svg width="100%" height="100%" viewBox="0 0 90 80" preserveAspectRatio="none">
                <path d={`M 8 ${62-i*4} Q 32 ${22+i*2}, 52 ${42-i*2} T 82 ${22+i*3}`} fill="none" stroke="var(--accent)" strokeWidth="2"/>
                <circle cx={8} cy={62-i*4} r="2.5" fill="var(--lift)"/>
                <circle cx={82} cy={22+i*3} r="2.5" fill="var(--header)"/>
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// Helpers — race timer math + cardinal
function raceTimerRemaining({ startMs, totalSec }) {
  const elapsedMs = Date.now() - startMs;
  return totalSec - elapsedMs / 1000;
}
function raceTimerPhase({ active, startMs, totalSec }) {
  if (!active) return "off";
  const rem = totalSec - (Date.now() - startMs) / 1000;
  if (rem <= 0) return "racing";
  if (rem <= 60) return "onemin";
  if (rem <= 5) return "start";
  return "prep";
}
function cardinal(deg) {
  const dirs = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  return dirs[Math.round(((deg % 360) / 22.5)) % 16];
}

Object.assign(window, {
  ScreenHome, ScreenMapa, ScreenRegata, ScreenTactica, ScreenBitacora,
  raceTimerRemaining, raceTimerPhase, cardinal,
});
