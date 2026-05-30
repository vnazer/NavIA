// Component library. Each component is shown in both light + deck variants.

// =========== Primitives ====================================================
function MetricCard({ theme = "l", label, value, unit, trend, big = false, sub, color }) {
  const isL = theme === "l";
  const bg = isL ? "#FFFFFF" : "#0A0F18";
  const border = isL ? "#E0E6EE" : "#1E2839";
  const textMuted = isL ? "#475266" : "#D6DEE8";
  const labelC = isL ? "#8392A6" : "#8FA0B6";
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, padding: big ? 20 : 14, display: "flex", flexDirection: "column", gap: big ? 8 : 4, minWidth: big ? 180 : 120 }}>
      <div className="label" style={{ color: labelC, display: "flex", alignItems: "center", gap: 6 }}>
        <span>{label}</span>
        {trend && <span style={{ color: trend === "up" ? (isL?"#15A34A":"#2EF07A") : trend === "dn" ? (isL?"#E03A2C":"#FF5447") : labelC, fontSize: 12 }}>{trend === "up" ? "▲" : trend === "dn" ? "▼" : "—"}</span>}
      </div>
      <div className="num" style={{ ...NUM, fontSize: big ? 56 : 32, fontWeight: 700, lineHeight: 1, color: color || (isL ? "#0B1320" : "#FFFFFF") }}>{value}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        {unit && <div style={{ fontSize: 11, color: textMuted, fontWeight: 500, letterSpacing: "0.02em" }}>{unit}</div>}
        {sub && <div className="num" style={{ fontSize: 11, color: labelC }}>{sub}</div>}
      </div>
    </div>
  );
}

function TimerHero({ theme = "l", phase = "preparatory", time = "04:32" }) {
  const isL = theme === "l";
  const phases = {
    off:        { c: isL?"#8392A6":"#8FA0B6", label: "OFF" },
    warning:    { c: isL?"#475266":"#D6DEE8", label: "5 MIN" },
    preparatory:{ c: isL?"#0E6BA8":"#00C2FF", label: "PREP" },
    onemin:     { c: isL?"#D97706":"#FFB020", label: "1 MIN" },
    start:      { c: isL?"#E03A2C":"#FF5447", label: "START" },
    racing:     { c: isL?"#15A34A":"#2EF07A", label: "RACING" },
  };
  const p = phases[phase];
  return (
    <div style={{ background: isL ? "#FFFFFF" : "#0A0F18", border: `1px solid ${isL?"#E0E6EE":"#1E2839"}`, padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: 320 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div className="label" style={{ color: isL?"#8392A6":"#8FA0B6" }}>RACE TIMER</div>
        <div style={{ background: p.c + "22", color: p.c, fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", padding: "4px 10px" }}>{p.label}</div>
      </div>
      <div className="num" style={{ ...NUM, fontSize: 92, fontWeight: 800, color: p.c, lineHeight: 1 }}>{time}</div>
      <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
        {[5,4,3,2,1].map((m, i) => {
          const active = (phase === "preparatory" && m <= 4) || (phase === "onemin" && m === 1) || phase === "warning";
          return <div key={m} style={{ width: 32, height: 4, background: active ? p.c : (isL?"#E0E6EE":"#1E2839") }} />;
        })}
      </div>
    </div>
  );
}

function ShiftBadge({ theme = "l", kind = "lift", deg = 8 }) {
  const isL = theme === "l";
  const c = kind === "lift" ? (isL?"#15A34A":"#2EF07A") : (isL?"#E03A2C":"#FF5447");
  const bg = kind === "lift" ? (isL?"#DCFCE7":"#0B2418") : (isL?"#FEE2E2":"#260A0A");
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: bg, padding: "8px 14px", color: c }}>
      {kind === "lift" ? I.arrowUp : I.arrowDn}
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em" }}>{kind.toUpperCase()}</span>
      <span className="num" style={{ ...NUM, fontSize: 16, fontWeight: 700 }}>{deg}°</span>
    </div>
  );
}

function LayerToggle({ theme = "l", icon, label, active = false }) {
  const isL = theme === "l";
  const c = active ? (isL?"#0E2A4E":"#00C2FF") : (isL?"#475266":"#8FA0B6");
  const bg = active ? (isL?"#0E2A4E":"#00C2FF") : (isL?"#FFFFFF":"#0A0F18");
  const fg = active ? "#FFFFFF" : c;
  const border = isL?"#E0E6EE":"#1E2839";
  return (
    <div style={{ background: bg, border: `1px solid ${active ? "transparent" : border}`, padding: "10px 14px", display: "inline-flex", alignItems: "center", gap: 8, color: fg, fontSize: 12, fontWeight: 600 }}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function BoyaMarker({ kind, size = 36, theme = "l" }) {
  const colors = { committee: "#D11A2A", pin: "#F59E0B", windward: "#16A34A", leeward: "#1E6FE0", gate: "#8B5CF6", custom: "#64748B" };
  const labels = { committee: "C", pin: "P", windward: "W", leeward: "L", gate: "G", custom: "•" };
  const c = colors[kind] || "#64748B";
  return (
    <div style={{ position: "relative", width: size, height: size + 6, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={size} height={size + 6} viewBox="0 0 36 42">
        <path d="M18 0 C 8 0, 0 7, 0 17 C 0 27, 12 35, 18 42 C 24 35, 36 27, 36 17 C 36 7, 28 0, 18 0 Z" fill={c} stroke={theme === "l" ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.2)"} strokeWidth="1"/>
        <circle cx="18" cy="17" r="9" fill={theme === "l" ? "#FFFFFF" : "#0A0F18"}/>
      </svg>
      <div className="num" style={{ position: "absolute", top: 9, left: 0, right: 0, textAlign: "center", color: c, fontSize: 13, fontWeight: 800 }}>{labels[kind]}</div>
    </div>
  );
}

function DataPill({ theme = "l", label, value, color }) {
  const isL = theme === "l";
  const bg = isL ? "#F6F8FB" : "#121925";
  return (
    <div style={{ background: bg, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11 }}>
      <span style={{ color: isL?"#8392A6":"#8FA0B6", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 9 }}>{label}</span>
      <span className="num" style={{ ...NUM, color: color || (isL?"#0B1320":"#FFFFFF"), fontWeight: 700 }}>{value}</span>
    </div>
  );
}

function AlertBanner({ theme = "l", kind = "danger", title, body }) {
  const isL = theme === "l";
  const colors = {
    danger:  { c: isL?"#E03A2C":"#FF5447", bg: isL?"#FEE2E2":"#1A0606" },
    warn:    { c: isL?"#D97706":"#FFB020", bg: isL?"#FEF3C7":"#1A1206" },
    info:    { c: isL?"#0E6BA8":"#00C2FF", bg: isL?"#DBEAFE":"#001A26" },
    success: { c: isL?"#15A34A":"#2EF07A", bg: isL?"#DCFCE7":"#001A0C" },
  };
  const k = colors[kind];
  return (
    <div style={{ background: k.bg, borderLeft: `3px solid ${k.c}`, padding: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
      <div style={{ color: k.c, flexShrink: 0, marginTop: 1 }}>{I.alert}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: k.c, letterSpacing: "0.05em", textTransform: "uppercase" }}>{title}</div>
        {body && <div style={{ fontSize: 13, fontWeight: 500, color: isL?"#0B1320":"#FFFFFF", marginTop: 4 }}>{body}</div>}
      </div>
    </div>
  );
}

function ActionButton({ theme = "l", variant = "primary", icon, children, large = false }) {
  const isL = theme === "l";
  const styles = {
    primary:   { bg: isL?"#0E2A4E":"#00C2FF", fg: isL?"#FFFFFF":"#000000" },
    secondary: { bg: isL?"#FFFFFF":"#121925", fg: isL?"#0B1320":"#FFFFFF", border: isL?"#0E2A4E":"#2C3A52" },
    danger:    { bg: isL?"#E03A2C":"#FF5447", fg: isL?"#FFFFFF":"#000000" },
    ghost:     { bg: "transparent", fg: isL?"#475266":"#D6DEE8" },
  };
  const s = styles[variant];
  return (
    <button style={{
      background: s.bg, color: s.fg,
      border: s.border ? `1.5px solid ${s.border}` : "none",
      padding: large ? "18px 24px" : "12px 18px",
      fontSize: large ? 16 : 13,
      fontWeight: 700,
      letterSpacing: "0.02em",
      display: "inline-flex", alignItems: "center", gap: 8,
      minHeight: large ? 56 : 48,
      cursor: "pointer",
      fontFamily: "Inter, sans-serif",
    }}>
      {icon}
      {children}
    </button>
  );
}

function Sheet({ theme = "l", title, children }) {
  const isL = theme === "l";
  return (
    <div style={{ width: 320, background: isL?"#FFFFFF":"#0A0F18", border: `1px solid ${isL?"#E0E6EE":"#1E2839"}`, borderRadius: "16px 16px 0 0", padding: 16 }}>
      <div style={{ width: 36, height: 4, background: isL?"#C9D2DE":"#2C3A52", margin: "0 auto 12px" }} />
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
}

function Segmented({ theme = "l", options, active = 0 }) {
  const isL = theme === "l";
  return (
    <div style={{ display: "inline-flex", background: isL?"#F6F8FB":"#121925", padding: 2, gap: 2 }}>
      {options.map((o, i) => (
        <div key={o} style={{
          padding: "8px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase",
          background: i === active ? (isL?"#FFFFFF":"#1A2333") : "transparent",
          color: i === active ? (isL?"#0B1320":"#FFFFFF") : (isL?"#8392A6":"#8FA0B6"),
          boxShadow: i === active ? (isL ? "0 1px 2px rgba(11,19,32,0.08)" : "inset 0 0 0 1px #2C3A52") : "none",
        }}>{o}</div>
      ))}
    </div>
  );
}

// =========== Library board ================================================
function ComponentsBoard({ theme = "l" }) {
  const isL = theme === "l";
  const bg = isL ? "#FFFFFF" : "#000000";
  const sub = isL ? "#475266" : "#D6DEE8";
  const labelC = isL ? "#8392A6" : "#8FA0B6";

  const Section = ({ title, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="label" style={{ color: labelC }}>{title}</div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-start" }}>{children}</div>
    </div>
  );

  return (
    <div style={{ width: 1120, height: 1280, background: bg, color: isL?"#0B1320":"#FFFFFF", padding: 36, display: "flex", flexDirection: "column", gap: 24 }}>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <div className="label" style={{ color: labelC }}>COMPONENTES — {theme === "l" ? "LIGHT" : "DECK"}</div>
          <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>Librería</div>
        </div>
        <div style={{ fontSize: 12, color: sub, maxWidth: 320, textAlign: "right" }}>Componentes átomicos del sistema. Todos siguen reglas de touch-target 48 px+ y números tabulares.</div>
      </div>

      <Section title="01 · METRIC CARD">
        <MetricCard theme={theme} label="SOG" value="6.8" unit="nudos" big trend="up" sub="ø 5.9" />
        <MetricCard theme={theme} label="COG" value="285°" unit="rumbo" big />
        <MetricCard theme={theme} label="TWA" value="42°" unit="port · ceñida" big sub="opt 38°" />
        <MetricCard theme={theme} label="%POLAR" value="94" unit="% objetivo" big trend="up" color={isL?"#15A34A":"#2EF07A"} />
        <MetricCard theme={theme} label="VIENTO" value="14.2" unit="kt · 285°" sub="rachas 17" />
        <MetricCard theme={theme} label="DTL" value="48" unit="metros" />
      </Section>

      <Section title="02 · TIMER HERO (FASES)">
        <TimerHero theme={theme} phase="warning" time="04:58" />
        <TimerHero theme={theme} phase="preparatory" time="03:12" />
        <TimerHero theme={theme} phase="onemin" time="00:42" />
        <TimerHero theme={theme} phase="racing" time="12:08" />
      </Section>

      <Section title="03 · SHIFT BADGE">
        <ShiftBadge theme={theme} kind="lift" deg={8} />
        <ShiftBadge theme={theme} kind="lift" deg={14} />
        <ShiftBadge theme={theme} kind="header" deg={6} />
        <ShiftBadge theme={theme} kind="header" deg={12} />
      </Section>

      <Section title="04 · LAYER TOGGLES (FLOTANTES SOBRE MAPA)">
        <LayerToggle theme={theme} icon={I.wind} label="Viento" active />
        <LayerToggle theme={theme} icon={I.layers} label="Lluvia" />
        <LayerToggle theme={theme} icon={I.compass} label="Laylines" active />
        <LayerToggle theme={theme} icon={I.satellite} label="AIS" />
        <LayerToggle theme={theme} icon={I.map} label="Profundidad" />
      </Section>

      <Section title="05 · BOYA MARKERS">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><BoyaMarker theme={theme} kind="committee" /><div style={{ fontSize: 10, color: labelC }}>committee</div></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><BoyaMarker theme={theme} kind="pin" /><div style={{ fontSize: 10, color: labelC }}>pin</div></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><BoyaMarker theme={theme} kind="windward" /><div style={{ fontSize: 10, color: labelC }}>windward</div></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><BoyaMarker theme={theme} kind="leeward" /><div style={{ fontSize: 10, color: labelC }}>leeward</div></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><BoyaMarker theme={theme} kind="gate" /><div style={{ fontSize: 10, color: labelC }}>gate</div></div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}><BoyaMarker theme={theme} kind="custom" /><div style={{ fontSize: 10, color: labelC }}>custom</div></div>
      </Section>

      <Section title="06 · DATA PILL (metadata densa)">
        <DataPill theme={theme} label="TWS" value="14kt" />
        <DataPill theme={theme} label="TWD" value="285°" />
        <DataPill theme={theme} label="HDG" value="280°" />
        <DataPill theme={theme} label="DEPTH" value="42m" />
        <DataPill theme={theme} label="DRIFT" value="0.4kt" />
        <DataPill theme={theme} label="POLAR" value="94%" color={isL?"#15A34A":"#2EF07A"} />
      </Section>

      <Section title="07 · ALERT BANNER">
        <div style={{ width: 460, display: "flex", flexDirection: "column", gap: 10 }}>
          <AlertBanner theme={theme} kind="danger" title="OCS — REGRESA" body="Cruzaste la línea hace 2 s. Vuelve a sotavento del committee." />
          <AlertBanner theme={theme} kind="warn" title="HEADER SOSTENIDO" body="Header de 12° hace 18 s. Considera virar." />
          <AlertBanner theme={theme} kind="info" title="PRESIÓN CAYENDO" body="3 hPa en la última hora — racha de viento entrando." />
        </div>
      </Section>

      <Section title="08 · ACTION BUTTONS">
        <ActionButton theme={theme} variant="primary" icon={I.play}>Iniciar regata</ActionButton>
        <ActionButton theme={theme} variant="secondary" icon={I.compass}>Modo táctico</ActionButton>
        <ActionButton theme={theme} variant="danger" icon={I.stop}>Stop tracking</ActionButton>
        <ActionButton theme={theme} variant="ghost" icon={I.refresh}>Reintentar</ActionButton>
        <ActionButton theme={theme} variant="primary" icon={I.marker} large>Marcar boya aquí</ActionButton>
      </Section>

      <Section title="09 · SHEET (DESPLEGABLE INFERIOR)">
        <Sheet theme={theme} title="Tracking activo">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            <MetricCard theme={theme} label="SOG" value="6.8" unit="kt" />
            <MetricCard theme={theme} label="COG" value="285°" />
            <MetricCard theme={theme} label="TWA" value="42°" />
          </div>
        </Sheet>
      </Section>

      <Section title="10 · SEGMENTED CONTROL">
        <Segmented theme={theme} options={["Ahora","+3h","+12h","+24h","+48h"]} active={1} />
      </Section>

    </div>
  );
}

Object.assign(window, { MetricCard, TimerHero, ShiftBadge, LayerToggle, BoyaMarker, DataPill, AlertBanner, ActionButton, Sheet, Segmented, ComponentsBoard });
