// Shared icons + small UI primitives used across screens.

// ============================ Icons =========================================
const ic = (paths, fill = "none") => ({ size = 22, color = "currentColor", stroke = 1.8, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {paths}
  </svg>
);
const Ic = {
  wind:     ic(<><path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h17a3 3 0 1 1-3 3"/><path d="M3 16h9"/></>),
  compass:  ic(<><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z" fill="currentColor" stroke="none"/></>),
  map:      ic(<><path d="M9 4 3 7v13l6-3 6 3 6-3V4l-6 3z"/><path d="M9 4v13"/><path d="M15 7v13"/></>),
  flag:     ic(<><path d="M4 21V4"/><path d="M4 4h13l-2 4 2 4H4"/></>),
  book:     ic(<><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h12"/></>),
  play:     ic(<><path d="M7 4v16l13-8z" fill="currentColor"/></>),
  pause:    ic(<><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></>),
  stop:     ic(<><rect x="5" y="5" width="14" height="14" rx="1" fill="currentColor"/></>),
  arrowUp:  ic(<><path d="M12 5v14"/><path d="m6 11 6-6 6 6"/></>),
  arrowDn:  ic(<><path d="M12 19V5"/><path d="m6 13 6 6 6-6"/></>),
  layers:   ic(<><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></>),
  plus:     ic(<><path d="M12 5v14"/><path d="M5 12h14"/></>),
  back:     ic(<><path d="M15 6 9 12l6 6"/></>),
  marker:   ic(<><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></>),
  mic:      ic(<><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></>),
  alert:    ic(<><path d="M12 3 2 21h20z"/><path d="M12 10v4"/><circle cx="12" cy="17.5" r=".7" fill="currentColor" stroke="none"/></>),
  satellite:ic(<><path d="M5 11a7 7 0 0 1 7-7"/><path d="M5 16a2 2 0 0 1 0-4l1 1"/><path d="M11 21a2 2 0 0 1 0-4l1 1"/><path d="m13 9 4-4 4 4-4 4z"/><path d="m9 13-4 4"/></>),
  settings: ic(<><circle cx="12" cy="12" r="3"/><path d="M19 12h2M3 12h2M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></>),
  refresh:  ic(<><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>),
  signal:   ic(<><path d="M4 19h2"/><path d="M9 19v-4"/><path d="M14 19v-8"/><path d="M19 19V5"/></>),
  more:     ic(<><circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/></>),
  check:    ic(<><path d="m5 12 5 5 9-11"/></>),
  x:        ic(<><path d="M5 5l14 14M19 5 5 19"/></>),
  download: ic(<><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></>),
  chevR:    ic(<><path d="m9 6 6 6-6 6"/></>),
  chevD:    ic(<><path d="m6 9 6 6 6-6"/></>),
  drop:     ic(<><path d="M12 3s7 7.5 7 13a7 7 0 0 1-14 0c0-5.5 7-13 7-13z"/></>),
  sun:      ic(<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></>),
  moon:     ic(<><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></>),
  eye:      ic(<><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></>),
  pressure: ic(<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>),
  edit:     ic(<><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z"/></>),
  share:    ic(<><circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="m9 11 6-4M9 13l6 4"/></>),
  trash:    ic(<><path d="M4 7h16"/><path d="M9 7V4h6v3"/><path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7"/></>),
  speaker:  ic(<><path d="M5 9v6h4l5 4V5L9 9z"/><path d="M16 8a5 5 0 0 1 0 8"/></>),
};

// ============================ Wordmark ======================================
function Wordmark({ size = 28, color = "currentColor" }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.28, color, lineHeight: 1 }}>
      <svg width={size * 0.7} height={size} viewBox="0 0 14 20">
        <path d="M2 18 L12 10 L2 2 L2 6 L8 10 L2 14 Z" fill={color} />
      </svg>
      <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: size * 0.58, letterSpacing: "-0.02em" }}>
        NAVIA
      </div>
    </div>
  );
}

// ============================ Boya Marker ===================================
function Boya({ kind, size = 32 }) {
  const colors = {
    committee: "var(--b-committee)",
    pin:       "var(--b-pin)",
    windward:  "var(--b-windward)",
    leeward:   "var(--b-leeward)",
    gate:      "var(--b-gate)",
    custom:    "var(--text-3)",
  };
  const letters = { committee: "C", pin: "P", windward: "W", leeward: "L", gate: "G", custom: "•" };
  return (
    <div style={{ position: "relative", width: size, height: size * 1.17, display: "flex", justifyContent: "center" }}>
      <svg width={size} height={size * 1.17} viewBox="0 0 36 42">
        <path d="M18 0 C 8 0, 0 7, 0 17 C 0 27, 12 35, 18 42 C 24 35, 36 27, 36 17 C 36 7, 28 0, 18 0 Z" fill={colors[kind]} stroke="rgba(0,0,0,0.18)" strokeWidth="1"/>
        <circle cx="18" cy="17" r="8.5" fill="rgba(0,0,0,0.18)"/>
      </svg>
      <div className="num" style={{ position: "absolute", top: size * 0.22, fontWeight: 800, fontSize: size * 0.42, color: "#fff" }}>{letters[kind]}</div>
    </div>
  );
}

// ============================ Mini compass ==================================
function MiniCompass({ size = 60, heading = 285 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="none" stroke="var(--border-2)" strokeWidth="1"/>
      {[...Array(36)].map((_, i) => {
        const a = i * 10, long = a % 90 === 0;
        const r1 = 22, r2 = long ? 27 : 25;
        const rad = (a - 90) * Math.PI / 180;
        return <line key={i} x1={30 + Math.cos(rad)*r1} y1={30 + Math.sin(rad)*r1} x2={30 + Math.cos(rad)*r2} y2={30 + Math.sin(rad)*r2} stroke="var(--border-2)" strokeWidth={long ? 1.5 : 1}/>;
      })}
      <text x="30" y="9" textAnchor="middle" fill="var(--text)" fontSize="7" fontWeight="700" fontFamily="JetBrains Mono">N</text>
      <g transform={`rotate(${heading} 30 30)`}>
        <polygon points="30,8 33,30 30,28 27,30" fill="var(--accent)"/>
        <polygon points="30,52 33,30 30,32 27,30" fill="var(--text)" opacity="0.3"/>
      </g>
      <circle cx="30" cy="30" r="1.5" fill="var(--text)"/>
    </svg>
  );
}

// ============================ Map placeholder ===============================
function ChartBg({ style, children }) {
  return (
    <div style={{
      position: "relative",
      background: "linear-gradient(135deg, var(--surface-2), var(--surface-3))",
      overflow: "hidden",
      ...style
    }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} preserveAspectRatio="none" viewBox="0 0 400 800">
        {[...Array(20)].map((_, i) => (
          <path key={i} d={`M-20 ${i*44 + (i%2?12:0)} C 100 ${i*44 - 16}, 260 ${i*44 + 24}, 420 ${i*44 - 8}`} fill="none" stroke="var(--border)" strokeOpacity="0.5" strokeWidth="1"/>
        ))}
        <path d="M280 80 C 310 130, 290 220, 330 290 C 360 340, 350 460, 380 600 L 400 800 L 400 0 L 320 0 Z" fill="var(--surface-3)" opacity="0.6"/>
      </svg>
      {children}
    </div>
  );
}

// ============================ Status bar (frame only) =======================
function StatusBar({ time }) {
  return (
    <div className="statusbar">
      <div className="num" style={{ fontWeight: 600 }}>{time}</div>
      <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
        <svg width="18" height="11" viewBox="0 0 18 11"><path d="M1 9h2v1H1zM5 7h2v3H5zM9 5h2v5H9zM13 3h2v7h-2z" fill="currentColor"/></svg>
        <svg width="16" height="11" viewBox="0 0 16 11"><path d="M8 3a8 8 0 0 1 5 1.7l-1 1.2A6 6 0 0 0 8 4.5a6 6 0 0 0-4 1.4l-1-1.2A8 8 0 0 1 8 3Z" fill="currentColor"/><circle cx="8" cy="8.5" r="1.4" fill="currentColor"/></svg>
        <svg width="26" height="12" viewBox="0 0 26 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke="currentColor" opacity="0.5" fill="none"/><rect x="2" y="2" width="14" height="8" rx="1.5" fill="currentColor"/><path d="M23.5 4v4" stroke="currentColor" opacity="0.5"/></svg>
      </div>
    </div>
  );
}

// ============================ Tab bar =======================================
function TabBar({ active, onNav }) {
  const tabs = [
    { id: "home",     label: "Inicio",   Ico: Ic.compass },
    { id: "mapa",     label: "Mapa",     Ico: Ic.map },
    { id: "regata",   label: "Regata",   Ico: Ic.play },
    { id: "tactica",  label: "Táctica",  Ico: Ic.flag },
    { id: "bitacora", label: "Bitácora", Ico: Ic.book },
  ];
  return (
    <div className="tabbar-pad" style={{
      background: "var(--surface)",
      borderTop: "1px solid var(--border)",
      padding: "8px 4px",
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      flexShrink: 0,
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button key={t.id} className="tap" onClick={() => onNav(t.id)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "6px 0", color: isActive ? "var(--accent)" : "var(--text-3)" }}>
            <t.Ico size={22} />
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.04em" }}>{t.label}</div>
            <div style={{ width: 16, height: 2, background: isActive ? "var(--accent)" : "transparent" }} />
          </button>
        );
      })}
    </div>
  );
}

// ============================ Reusable bits =================================
function Pill({ children, color }) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", background: (color || "var(--text-3)") + "22", color: color || "var(--text-3)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>{children}</span>;
}

function Hair() { return <div style={{ height: 1, background: "var(--border)" }} />; }

// Format helpers
const fmtClock = (sec) => {
  const sign = sec < 0 ? "-" : "";
  const s = Math.abs(Math.round(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${sign}${String(m).padStart(2,"0")}:${String(r).padStart(2,"0")}`;
};

Object.assign(window, { Ic, Wordmark, Boya, MiniCompass, ChartBg, StatusBar, TabBar, Pill, Hair, fmtClock });
