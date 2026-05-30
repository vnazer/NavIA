// Shared primitives, icons, and the phone frame.
// All other ds-* files depend on this.

const NUM = { fontFamily: "JetBrains Mono, ui-monospace, monospace", fontVariantNumeric: "tabular-nums", fontFeatureSettings: '"tnum" 1' };

// --- SVG icons (stroke 1.75, lucide-ish but original) -----------------------
const Icon = ({ d, size = 18, stroke = 1.75, fill = "none", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>{d}</svg>
);
const I = {
  wind:     <Icon d={<><path d="M3 8h11a3 3 0 1 0-3-3"/><path d="M3 12h17a3 3 0 1 1-3 3"/><path d="M3 16h9"/></>} />,
  compass:  <Icon d={<><circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z" fill="currentColor" stroke="none"/></>} />,
  map:      <Icon d={<><path d="M9 4 3 7v13l6-3 6 3 6-3V4l-6 3z"/><path d="M9 4v13"/><path d="M15 7v13"/></>} />,
  flag:     <Icon d={<><path d="M4 21V4"/><path d="M4 4h13l-2 4 2 4H4"/></>} />,
  book:     <Icon d={<><path d="M4 4h12a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3z"/><path d="M4 17a3 3 0 0 1 3-3h12"/></>} />,
  play:     <Icon d={<><path d="M7 4v16l13-8z" fill="currentColor"/></>} />,
  pause:    <Icon d={<><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></>} />,
  stop:     <Icon d={<><rect x="5" y="5" width="14" height="14" rx="1" fill="currentColor"/></>} />,
  arrowUp:  <Icon d={<><path d="M12 5v14"/><path d="m6 11 6-6 6 6"/></>} />,
  arrowDn:  <Icon d={<><path d="M12 19V5"/><path d="m6 13 6 6 6-6"/></>} />,
  layers:   <Icon d={<><path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/></>} />,
  plus:     <Icon d={<><path d="M12 5v14"/><path d="M5 12h14"/></>} />,
  back:     <Icon d={<><path d="M15 6 9 12l6 6"/></>} />,
  marker:   <Icon d={<><path d="M12 22s7-6.5 7-12a7 7 0 1 0-14 0c0 5.5 7 12 7 12Z"/><circle cx="12" cy="10" r="2.5"/></>} />,
  bell:     <Icon d={<><path d="M6 17h12l-1.5-3V10a4.5 4.5 0 0 0-9 0v4z"/><path d="M10 20a2 2 0 0 0 4 0"/></>} />,
  mic:      <Icon d={<><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0"/><path d="M12 18v3"/></>} />,
  alert:    <Icon d={<><path d="M12 3 2 21h20z"/><path d="M12 10v4"/><circle cx="12" cy="17.5" r=".7" fill="currentColor" stroke="none"/></>} />,
  satellite:<Icon d={<><path d="M5 11a7 7 0 0 1 7-7"/><path d="M5 16a2 2 0 0 1 0-4l1 1"/><path d="M11 21a2 2 0 0 1 0-4l1 1"/><path d="m13 9 4-4 4 4-4 4z"/><path d="m9 13-4 4"/></>} />,
  settings: <Icon d={<><circle cx="12" cy="12" r="3"/><path d="M19 12h2M3 12h2M12 3v2M12 19v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></>} />,
  refresh:  <Icon d={<><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></>} />,
  signal:   <Icon d={<><path d="M4 19h2"/><path d="M9 19v-4"/><path d="M14 19v-8"/><path d="M19 19V5"/></>} />,
  more:     <Icon d={<><circle cx="6" cy="12" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="18" cy="12" r="1.2" fill="currentColor"/></>} />,
  check:    <Icon d={<><path d="m5 12 5 5 9-11"/></>} />,
  x:        <Icon d={<><path d="M5 5l14 14M19 5 5 19"/></>} />,
  download: <Icon d={<><path d="M12 4v12"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></>} />,
};

// --- Brand wordmark ---------------------------------------------------------
function Wordmark({ size = 40, color = "currentColor", subtitle = false }) {
  // NAVIA in heavy mono with a leading wedge (bow / heading indicator)
  const h = size;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: h * 0.28, color }}>
      <svg width={h * 0.7} height={h} viewBox="0 0 14 20" style={{ display: "block" }}>
        <path d="M2 18 L12 10 L2 2 L2 6 L8 10 L2 14 Z" fill={color} />
      </svg>
      <div style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: h * 0.6, letterSpacing: "-0.02em", lineHeight: 1 }}>
        NAVIA{subtitle ? <span style={{ opacity: 0.5 }}>.</span> : null}
      </div>
    </div>
  );
}

// --- Phone frame (light + deck variants share the chrome) -------------------
function Phone({ theme = "l", children, label, time = "14:32" }) {
  // iOS-ish status bar; tinted by theme
  const isLight = theme === "l";
  const fg = isLight ? "#0B1320" : "#FFFFFF";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
      <div className="phone" style={{ background: isLight ? "#fff" : "#000" }}>
        <div className={"phone-screen theme-" + theme}>
          <div className="notch" />
          <div className="statusbar" style={{ color: fg }}>
            <div className="num" style={{ fontWeight: 600 }}>{time}</div>
            <div className="right">
              <svg width="18" height="11" viewBox="0 0 18 11" fill="none">
                <path d="M1 9h2v1H1zM5 7h2v3H5zM9 5h2v5H9zM13 3h2v7h-2z" fill={fg}/>
              </svg>
              <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                <path d="M8 3a8 8 0 0 1 5 1.7l-1 1.2A6 6 0 0 0 8 4.5a6 6 0 0 0-4 1.4l-1-1.2A8 8 0 0 1 8 3Z" fill={fg}/>
                <circle cx="8" cy="8.5" r="1.4" fill={fg}/>
              </svg>
              <svg width="26" height="12" viewBox="0 0 26 12" fill="none">
                <rect x="0.5" y="0.5" width="22" height="11" rx="3" stroke={fg} opacity="0.5"/>
                <rect x="2" y="2" width="14" height="8" rx="1.5" fill={fg}/>
                <path d="M23.5 4v4" stroke={fg} opacity="0.5"/>
              </svg>
            </div>
          </div>
          {children}
        </div>
      </div>
      {label && <div style={{ color: "#8392A6", fontSize: 12, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" }}>{label}</div>}
    </div>
  );
}

// --- Helpers ----------------------------------------------------------------
function Hair({ theme = "l", style }) {
  const c = theme === "l" ? "#E0E6EE" : "#1E2839";
  return <div style={{ height: 1, background: c, ...style }} />;
}

// Compass rose mini (for header / instrument detail)
function MiniCompass({ size = 60, heading = 285, theme = "l" }) {
  const stroke = theme === "l" ? "#0B1320" : "#FFFFFF";
  const muted = theme === "l" ? "#C9D2DE" : "#2C3A52";
  const accent = theme === "l" ? "#E03A2C" : "#FF5447";
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <circle cx="30" cy="30" r="28" fill="none" stroke={muted} strokeWidth="1"/>
      {[...Array(36)].map((_, i) => {
        const a = i * 10;
        const long = a % 90 === 0;
        const r1 = 22, r2 = long ? 27 : 25;
        const rad = (a - 90) * Math.PI / 180;
        return <line key={i} x1={30 + Math.cos(rad)*r1} y1={30 + Math.sin(rad)*r1} x2={30 + Math.cos(rad)*r2} y2={30 + Math.sin(rad)*r2} stroke={muted} strokeWidth={long ? 1.5 : 1}/>;
      })}
      {/* N marker */}
      <text x="30" y="9" textAnchor="middle" fill={stroke} fontSize="7" fontWeight="700" fontFamily="JetBrains Mono">N</text>
      {/* heading needle */}
      <g transform={`rotate(${heading} 30 30)`}>
        <polygon points="30,8 33,30 30,28 27,30" fill={accent}/>
        <polygon points="30,52 33,30 30,32 27,30" fill={stroke} opacity="0.4"/>
      </g>
      <circle cx="30" cy="30" r="1.5" fill={stroke}/>
    </svg>
  );
}

// Tiny "map" placeholder w/ contour lines — used inside cards
function MapPlaceholder({ theme = "l", style, children }) {
  const bg1 = theme === "l" ? "#DCE5F0" : "#0B1422";
  const bg2 = theme === "l" ? "#C5D3E3" : "#13203A";
  const line = theme === "l" ? "rgba(11,19,32,0.08)" : "rgba(0,194,255,0.10)";
  return (
    <div style={{
      position: "relative",
      background: `linear-gradient(135deg, ${bg1}, ${bg2})`,
      overflow: "hidden",
      ...style
    }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }} preserveAspectRatio="none" viewBox="0 0 400 400">
        {[...Array(12)].map((_, i) => (
          <path key={i} d={`M-20 ${i*36 + (i%2?12:0)} C 100 ${i*36 - 16}, 260 ${i*36 + 24}, 420 ${i*36 - 8}`} fill="none" stroke={line} strokeWidth="1"/>
        ))}
        {/* coastline-ish shape */}
        <path d="M280 80 C 310 130, 290 200, 330 250 C 360 290, 350 360, 380 400 L 400 400 L 400 0 L 320 0 Z" fill={theme === "l" ? "#E8DFC4" : "#1A2030"} opacity="0.8"/>
      </svg>
      {children}
    </div>
  );
}

// Make available globally
Object.assign(window, { NUM, I, Icon, Wordmark, Phone, Hair, MiniCompass, MapPlaceholder });
