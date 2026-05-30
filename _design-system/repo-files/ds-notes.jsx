// Implementation notes card.

function ImplementationNotes() {
  const Cell = ({ k, v }) => (
    <tr>
      <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono", fontSize: 11, fontWeight: 600, color: "#0B1320", borderBottom: "1px solid #E0E6EE", verticalAlign: "top", whiteSpace: "nowrap" }}>{k}</td>
      <td style={{ padding: "8px 12px", fontFamily: "JetBrains Mono", fontSize: 11, color: "#475266", borderBottom: "1px solid #E0E6EE" }}>{v}</td>
    </tr>
  );

  return (
    <div style={{ width: 1120, height: 800, background: "#FFFFFF", padding: 36, color: "#0B1320", display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <div className="label" style={{ color: "#8392A6" }}>SECCIÓN 5 · NOTAS PARA IMPLEMENTACIÓN</div>
        <div style={{ fontSize: 26, fontWeight: 700, marginTop: 6 }}>De Figma a NativeWind</div>
        <div style={{ fontSize: 13, color: "#475266", marginTop: 8, maxWidth: 720 }}>
          Lo que está acá calza con el stack actual (Expo + RN + NativeWind + Tailwind). Sin glass-morphism, sin filter blur, sin nada que NativeWind no resuelva a estilos planos.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, flex: 1 }}>

        {/* Tailwind config */}
        <div>
          <div className="label" style={{ color: "#8392A6", marginBottom: 8 }}>tailwind.config.js — EXTEND</div>
          <pre style={{ background: "#0A0F18", color: "#D6DEE8", fontFamily: "JetBrains Mono", fontSize: 11, padding: 16, lineHeight: 1.6, overflow: "auto" }}>
{`theme: {
  extend: {
    colors: {
      // Marca + neutros (overrides del 'mar' actual)
      navy:   { DEFAULT: "#0E2A4E", 50:"#EEF2F7", 900:"#0B1320" },
      mar:    { 500: "#0E6BA8" },        // existente — conservar
      cyan:   { instr: "#00C2FF" },      // deck mode

      // Semántica (par light/deck)
      lift:   { light:"#15A34A", deck:"#2EF07A" },
      header: { light:"#E03A2C", deck:"#FF5447" },
      warn:   { light:"#D97706", deck:"#FFB020" },

      // Boyas
      boya: {
        committee: "#D11A2A",
        pin:       "#F59E0B",
        windward:  "#16A34A",
        leeward:   "#1E6FE0",
        gate:      "#8B5CF6",
      },

      // Superficies
      deck: {
        bg:"#000000", surface:"#0A0F18",
        s2:"#121925", border:"#1E2839",
      },
    },
    fontFamily: {
      sans: ["Inter", "system-ui"],
      mono: ["JetBrainsMono", "ui-monospace"],
    },
    fontSize: {
      "hero":  ["96px", { lineHeight: "0.9", fontWeight: "800" }],
      "metric":["56px", { lineHeight: "1",   fontWeight: "700" }],
    },
  },
}`}
          </pre>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          <div>
            <div className="label" style={{ color: "#8392A6", marginBottom: 8 }}>FUENTES — EXPO-FONT, LOCAL</div>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#F6F8FB" }}>
              <tbody>
                <Cell k="Inter-Regular.ttf" v="400 — UI base" />
                <Cell k="Inter-Medium.ttf" v="500 — métricas secundarias" />
                <Cell k="Inter-SemiBold.ttf" v="600 — section titles" />
                <Cell k="Inter-Bold.ttf" v="700 — display & buttons" />
                <Cell k="JetBrainsMono-Bold.ttf" v="700 — números medios" />
                <Cell k="JetBrainsMono-ExtraBold.ttf" v="800 — héroes (SOG, timer)" />
              </tbody>
            </table>
            <div style={{ fontSize: 11, color: "#475266", marginTop: 6 }}>Cargar con <span className="num">expo-font</span> + <span className="num">useFonts</span>. NO usar Google Fonts CDN en mobile.</div>
          </div>

          <div>
            <div className="label" style={{ color: "#8392A6", marginBottom: 8 }}>TOGGLE DECK MODE EN NATIVEWIND</div>
            <pre style={{ background: "#0A0F18", color: "#D6DEE8", fontFamily: "JetBrains Mono", fontSize: 11, padding: 14, lineHeight: 1.6 }}>
{`// useColorScheme custom — NO confiar en system.
// El usuario alterna manual en /configuracion.
import { useTemaStore } from "@/lib/tema";

// En cada componente:
const deck = useTemaStore(s => s.modoDeck);

<View className={deck
  ? "bg-deck-surface border-deck-border"
  : "bg-white border-slate-200"} />

// Tip: definir helpers
const tw = (l, d) => deck ? d : l;`}
            </pre>
          </div>

        </div>
      </div>

      {/* Footer reglas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        {[
          { t: "MIN TOUCH", v: "48 px", n: "Dedos mojados, barco escorado." },
          { t: "MIN FONT", v: "13 px", n: "Sólo para data densa. UI 14 px+." },
          { t: "FONT WEIGHT", v: "≥ 400", n: "Nada de Light bajo sol." },
          { t: "DECK SHADOW", v: "none", n: "Reemplazá por border 1 px." },
        ].map((r, i) => (
          <div key={i} style={{ background: "#F6F8FB", borderLeft: "3px solid #0E2A4E", padding: 12 }}>
            <div className="label" style={{ color: "#8392A6" }}>{r.t}</div>
            <div className="num" style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{r.v}</div>
            <div style={{ fontSize: 10, color: "#475266", marginTop: 2 }}>{r.n}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ImplementationNotes });
