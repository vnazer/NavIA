// Root app — state, navigation, simulated GPS data, modals.

const { useState, useEffect, useReducer, useRef } = React;

// ============================ Initial state =================================
const initialState = {
  tab: "home",
  theme: "deck",         // "deck" | "light"
  prevTab: null,

  wind: {
    speed: 14,
    dir: 285,
    gust: 17,
    next: [14, 15, 16, 14, 12, 11],
  },

  layers: {
    viento: true,
    lluvia: false,
    laylines: true,
    ais: false,
    profundidad: false,
  },

  raceTimer: {
    active: false,
    startMs: 0,
    totalSec: 300,
  },

  tracking: {
    active: false,
    startMs: 0,
    elapsedSec: 0,
    sog: 6.8,
    cog: 285,
    twa: -42,           // negative = port
    polar: 94,
    layline: 140,
    dtl: 48,
    shift: { kind: "lift", deg: 8, spark: "0,32 12,30 24,28 36,24 48,20 60,16 72,18 84,12 96,10 108,6 120,4" },
  },

  modal: null,           // null | "boya" | "settings" | "iniciar" | "session" | "spots" | "boya-quick" | "ocs"
  selectedSession: null,

  sessions: [
    { id: "s1", dateLabel: "16 MAY · DOM", title: "Regata Liga · 02",    spot: "Algarrobo",   dist: "14.2", wind: "12.8", max: "8.4", polar: 91, duration: "1h 42m" },
    { id: "s2", dateLabel: "12 MAY · MIÉ", title: "Entrenamiento solo",  spot: "Higuerillas", dist: "8.1",  wind: "9.4",  max: "7.2", polar: 84, duration: "1h 12m" },
    { id: "s3", dateLabel: "08 MAY · SÁB", title: "Regata Liga · 01",    spot: "Algarrobo",   dist: "16.7", wind: "15.2", max: "9.1", polar: 88, duration: "2h 04m" },
    { id: "s4", dateLabel: "04 MAY · MAR", title: "Entreno tripulación", spot: "Quintero",    dist: "5.4",  wind: "8.0",  max: "6.4", polar: 79, duration: "0h 58m" },
  ],

  clock: "14:32",
};

// ============================ Reducer =======================================
function reducer(state, action) {
  switch (action.type) {
    case "navTab":         return { ...state, tab: action.tab, prevTab: state.tab };
    case "setTheme":       return { ...state, theme: action.theme };
    case "toggleLayer":    return { ...state, layers: { ...state.layers, [action.id]: !state.layers[action.id] } };
    case "openModal":      return { ...state, modal: action.id, selectedSession: action.payload || state.selectedSession };
    case "closeModal":     return { ...state, modal: null };
    case "raceTimerStart": return { ...state, raceTimer: { active: true, startMs: Date.now(), totalSec: action.totalSec } };
    case "raceTimerStop":  return { ...state, raceTimer: { ...state.raceTimer, active: false } };
    case "raceTimerSync": {
      // Snap remaining to nearest minute boundary above (classic sailing sync)
      const rem = state.raceTimer.totalSec - (Date.now() - state.raceTimer.startMs) / 1000;
      const newTotal = Math.ceil(rem / 60) * 60;
      return { ...state, raceTimer: { ...state.raceTimer, startMs: Date.now(), totalSec: newTotal } };
    }
    case "trackingStart":  return { ...state, tracking: { ...state.tracking, active: true, startMs: Date.now(), elapsedSec: 0 } };
    case "trackingStop":   return { ...state, tracking: { ...state.tracking, active: false } };
    case "tick":           return { ...state, ...action.patch };
    default: return state;
  }
}

// ============================ Live simulator ================================
// Smooth random walk for SOG / COG / TWA / polar / shift while tracking active.
function useLiveSimulation(state, dispatch) {
  const r = useRef({ sog: 6.8, cog: 285, twa: -42, polar: 94, shiftAccum: 0, shiftDir: 1, sparkPoints: [] });

  useEffect(() => {
    const id = setInterval(() => {
      // Clock always ticks
      const now = new Date();
      const clock = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

      const patch = { clock };

      if (state.tracking.active) {
        const t = r.current;
        // SOG random walk 5.5 - 7.4
        t.sog = clamp(t.sog + (Math.random() - 0.5) * 0.18, 5.4, 7.4);
        // COG drift around target
        t.cog = clamp(t.cog + (Math.random() - 0.5) * 1.2, 278, 292);
        // TWA stays in ceñida range
        t.twa = clamp(t.twa + (Math.random() - 0.5) * 0.8, -46, -38);
        // Polar derived from SOG (target 7.2)
        t.polar = clamp((t.sog / 7.2) * 100 + (Math.random() - 0.5) * 3, 78, 99);

        // Wind shift accumulator
        t.shiftAccum += (Math.random() - 0.5) * 0.6;
        if (t.shiftAccum > 12) { t.shiftDir = -1; }
        if (t.shiftAccum < -12) { t.shiftDir = 1; }
        const shiftDeg = Math.round(t.shiftAccum);
        const kind = shiftDeg >= 0 ? "lift" : "header";

        // Build sparkline
        t.sparkPoints.push(22 - shiftDeg * 1.2);
        if (t.sparkPoints.length > 11) t.sparkPoints.shift();
        const spark = t.sparkPoints.map((y, i) => `${i * 12},${y}`).join(" ");

        const elapsedSec = (Date.now() - state.tracking.startMs) / 1000;
        const dtl = Math.max(0, Math.round(48 - elapsedSec * 0.6));
        const layline = Math.max(80, Math.round(140 - elapsedSec * 0.3));

        patch.tracking = {
          ...state.tracking,
          sog: t.sog,
          cog: t.cog,
          twa: t.twa,
          polar: t.polar,
          dtl,
          layline,
          elapsedSec,
          shift: { kind, deg: Math.abs(shiftDeg), spark },
        };

        // Trigger a header alert simulation could go here
      }

      dispatch({ type: "tick", patch });
    }, 600);

    return () => clearInterval(id);
  }, [state.tracking.active, state.tracking.startMs]);
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// ============================ Modals ========================================
function BoyaModal({ onClose }) {
  const types = [
    { id: "committee", label: "Committee Boat",  desc: "Extremo de la línea (lado del comité)" },
    { id: "pin",       label: "Pin End",         desc: "Otro extremo de la línea de salida" },
    { id: "windward",  label: "Windward",        desc: "Marca de barlovento" },
    { id: "leeward",   label: "Leeward",         desc: "Marca de sotavento" },
    { id: "gate",      label: "Gate",            desc: "Boya de paso (puerta)" },
    { id: "custom",    label: "Custom",          desc: "Otra marca" },
  ];
  return (
    <Scrim onClose={onClose}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <div className="label" style={{ color: "var(--text-3)" }}>NUEVA BOYA</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>¿Qué tipo?</div>
          </div>
          <button className="tap" onClick={onClose} style={{ color: "var(--text-3)" }}><Ic.x size={20} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {types.map(t => (
            <button key={t.id} className="tap" onClick={onClose} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: 14, display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
              <Boya kind={t.id} size={36} />
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{t.label}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4 }}>{t.desc}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 14, padding: 12, background: "var(--surface-2)", display: "flex", gap: 10 }}>
          <Ic.alert size={18} color="var(--accent)" />
          <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.4 }}>
            Se marcará en tu posición GPS actual. También puedes pegar coordenadas desde Pop-Up.
          </div>
        </div>
      </div>
    </Scrim>
  );
}

function SettingsModal({ state, dispatch, onClose }) {
  const Row = ({ label, value, onClick, children }) => (
    <div className="tap" onClick={onClick} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
      {children || <span style={{ fontSize: 13, color: "var(--text-3)", fontWeight: 600 }}>{value}</span>}
    </div>
  );
  return (
    <Scrim onClose={onClose}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
          <div>
            <div className="label" style={{ color: "var(--text-3)" }}>CONFIGURACIÓN</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>Ajustes</div>
          </div>
          <button className="tap" onClick={onClose} style={{ color: "var(--text-3)" }}><Ic.x size={20} /></button>
        </div>

        {/* Theme toggle — the big one */}
        <div style={{ background: "var(--surface-2)", padding: 12, marginBottom: 12 }}>
          <div className="label" style={{ color: "var(--text-3)", marginBottom: 8 }}>MODO</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { id: "deck",  label: "Cubierta", desc: "Alto contraste · sol directo", Ico: Ic.moon },
              { id: "light", label: "En tierra", desc: "Planificando · interior",     Ico: Ic.sun },
            ].map(opt => {
              const isActive = state.theme === opt.id;
              return (
                <button key={opt.id} className="tap" onClick={() => dispatch({ type: "setTheme", theme: opt.id })} style={{
                  background: isActive ? "var(--accent)" : "var(--surface)",
                  color: isActive ? "var(--bg)" : "var(--text)",
                  padding: 14,
                  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 8,
                  border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
                  textAlign: "left",
                }}>
                  <opt.Ico size={20} />
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{opt.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.8, lineHeight: 1.3 }}>{opt.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <Row label="Avisos por voz · ES-CL"><div style={{ width: 38, height: 22, background: "var(--lift)", borderRadius: 99, position: "relative" }}><div style={{ width: 18, height: 18, background: "#fff", borderRadius: 99, position: "absolute", top: 2, left: 18 }} /></div></Row>
        <Row label="Unidades" value="Nudos · °" />
        <Row label="Idioma" value="Español" />
        <Row label="Exportar bitácora" />

        <button className="tap" onClick={onClose} style={{ marginTop: 14, width: "100%", background: "var(--accent)", color: "var(--bg)", padding: 14, fontSize: 14, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Listo</button>
      </div>
    </Scrim>
  );
}

function IniciarModal({ state, dispatch, onClose }) {
  const [step, setStep] = useState(0);
  const start = () => {
    dispatch({ type: "trackingStart" });
    dispatch({ type: "raceTimerStart", totalSec: 300 });
    dispatch({ type: "navTab", tab: "regata" });
    onClose();
  };

  return (
    <Scrim onClose={onClose}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div className="label" style={{ color: "var(--accent)" }}>● LISTO PARA REGATA</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>Confirma el inicio</div>
        <div style={{ fontSize: 13, color: "var(--text-2)", marginTop: 4, marginBottom: 14, lineHeight: 1.5 }}>
          Activaremos GPS, timer y avisos por voz al mismo tiempo. Después podrás sincronizar.
        </div>

        <div style={{ background: "var(--surface-2)", padding: 14, marginBottom: 12 }}>
          {[
            ["BARCO",  "ILCA 7 · Felipe"],
            ["SPOT",   "Algarrobo"],
            ["VIENTO", "14 kt · 285°"],
            ["BOYAS",  "3 marcadas"],
          ].map(([l, v], i) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? "1px solid var(--border)" : "none" }}>
              <span className="label" style={{ color: "var(--text-3)" }}>{l}</span>
              <span className="num" style={{ fontSize: 12, fontWeight: 700 }}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button className="tap" onClick={onClose} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: 16, fontSize: 14, fontWeight: 700, color: "var(--text-2)" }}>Cancelar</button>
          <button className="tap" onClick={start} style={{ background: "var(--lift)", color: "var(--bg)", padding: 16, fontSize: 14, fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Ic.play size={18} /> Iniciar
          </button>
        </div>
      </div>
    </Scrim>
  );
}

function SpotsModal({ onClose }) {
  const spots = [
    { name: "Algarrobo",   club: "Cofradía Náutica", active: true },
    { name: "Higuerillas", club: "Club de Yates",    active: false },
    { name: "Quintero",    club: "Club Naval",       active: false },
    { name: "Valparaíso",  club: "Audax",            active: false },
  ];
  return (
    <Scrim onClose={onClose}>
      <div className="sheet">
        <div className="sheet-handle" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <div className="label" style={{ color: "var(--text-3)" }}>CAMBIAR SPOT</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>Tus spots</div>
          </div>
          <button className="tap" onClick={onClose} style={{ color: "var(--text-3)" }}><Ic.x size={20} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {spots.map(s => (
            <button key={s.name} className="tap" onClick={onClose} style={{ background: "var(--surface-2)", border: `1px solid ${s.active ? "var(--accent)" : "var(--border)"}`, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left" }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{s.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{s.club}</div>
              </div>
              {s.active && <div style={{ color: "var(--accent)" }}><Ic.check size={20} /></div>}
            </button>
          ))}
        </div>
      </div>
    </Scrim>
  );
}

function SessionModal({ session, onClose }) {
  if (!session) return null;
  return (
    <Scrim onClose={onClose}>
      <div className="sheet" style={{ maxHeight: "85%", overflowY: "auto" }}>
        <div className="sheet-handle" />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
          <div>
            <div className="label" style={{ color: "var(--text-3)" }}>{session.dateLabel}</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{session.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>{session.spot} · {session.duration}</div>
          </div>
          <button className="tap" onClick={onClose} style={{ color: "var(--text-3)" }}><Ic.x size={20} /></button>
        </div>

        {/* Mini map */}
        <div style={{ height: 180, marginBottom: 12 }}>
          <ChartBg style={{ width: "100%", height: "100%" }}>
            <svg width="100%" height="100%" viewBox="0 0 320 180" style={{ position: "absolute", inset: 0 }}>
              <path d="M 30 140 Q 80 60, 130 100 T 230 60 T 290 80" fill="none" stroke="var(--accent)" strokeWidth="2.5"/>
              <circle cx="30" cy="140" r="5" fill="var(--lift)"/>
              <circle cx="290" cy="80" r="5" fill="var(--header)"/>
              <text x="30" y="158" fontFamily="Inter" fontSize="9" fontWeight="700" fill="var(--text-2)" textAnchor="middle">INICIO</text>
              <text x="290" y="98" fontFamily="Inter" fontSize="9" fontWeight="700" fill="var(--text-2)" textAnchor="middle">FIN</text>
            </svg>
          </ChartBg>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 12 }}>
          {[
            { l: "DIST",      v: session.dist,  u: "nm" },
            { l: "VIENTO Ø",  v: session.wind,  u: "kt" },
            { l: "SOG MAX",   v: session.max,   u: "kt" },
            { l: "POLAR Ø",   v: session.polar, u: "%", c: "var(--lift)" },
            { l: "VIRADAS",   v: "24",          u: "" },
            { l: "TRASLUCH.", v: "8",           u: "" },
          ].map((m, i) => (
            <div key={i} style={{ background: "var(--surface-2)", padding: 10 }}>
              <div className="label" style={{ color: "var(--text-3)" }}>{m.l}</div>
              <div className="num" style={{ fontSize: 22, fontWeight: 700, color: m.c || "var(--text)" }}>{m.v}{m.u && <span style={{ fontSize: 10, color: "var(--text-3)", marginLeft: 2 }}>{m.u}</span>}</div>
            </div>
          ))}
        </div>

        {/* SOG chart */}
        <div style={{ background: "var(--surface-2)", padding: 12, marginBottom: 12 }}>
          <div className="label" style={{ color: "var(--text-3)", marginBottom: 8 }}>SOG · TRACK COMPLETO</div>
          <svg width="100%" height="80" viewBox="0 0 320 80">
            <line x1="0" y1="60" x2="320" y2="60" stroke="var(--border)" strokeDasharray="2 3"/>
            <polyline fill="none" stroke="var(--accent)" strokeWidth="2"
              points="0,50 20,42 40,38 60,40 80,28 100,22 120,28 140,18 160,24 180,32 200,28 220,20 240,18 260,22 280,30 300,38 320,46"/>
            <polyline fill="var(--accent)" opacity="0.15" stroke="none"
              points="0,50 20,42 40,38 60,40 80,28 100,22 120,28 140,18 160,24 180,32 200,28 220,20 240,18 260,22 280,30 300,38 320,46 320,80 0,80"/>
          </svg>
        </div>

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 48px", gap: 8 }}>
          <button className="tap" style={{ background: "var(--accent)", color: "var(--bg)", padding: 14, fontSize: 13, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Ic.download size={16} /> GPX
          </button>
          <button className="tap" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: 14, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "var(--text)" }}>
            <Ic.share size={16} /> Compartir
          </button>
          <button className="tap" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: 14, color: "var(--header)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Ic.trash size={16} />
          </button>
        </div>
      </div>
    </Scrim>
  );
}

function Scrim({ onClose, children }) {
  return (
    <div className="scrim" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%" }}>{children}</div>
    </div>
  );
}

// ============================ Main App ======================================
function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useLiveSimulation(state, dispatch);

  // Set theme on root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  const nav = (tab) => dispatch({ type: "navTab", tab });
  const open = (id, payload) => dispatch({ type: "openModal", id, payload });
  const close = () => dispatch({ type: "closeModal" });

  const ScreenCmp = {
    home: ScreenHome,
    mapa: ScreenMapa,
    regata: ScreenRegata,
    tactica: ScreenTactica,
    bitacora: ScreenBitacora,
  }[state.tab];

  const selectedSession = state.sessions.find(s => s.id === state.selectedSession);

  return (
    <div className="stage" key={state.theme}>
      <div className="notch" />
      <StatusBar time={state.clock} />

      <div key={state.tab} style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <ScreenCmp state={state} dispatch={dispatch} nav={nav} open={open} />
      </div>

      <TabBar active={state.tab} onNav={nav} />

      {state.modal === "boya"      && <BoyaModal onClose={close} />}
      {state.modal === "boya-quick"&& <BoyaModal onClose={close} />}
      {state.modal === "settings"  && <SettingsModal state={state} dispatch={dispatch} onClose={close} />}
      {state.modal === "iniciar"   && <IniciarModal  state={state} dispatch={dispatch} onClose={close} />}
      {state.modal === "spots"     && <SpotsModal onClose={close} />}
      {state.modal === "session"   && <SessionModal session={selectedSession} onClose={close} />}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
