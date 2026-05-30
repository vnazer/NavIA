// tailwind.config.js — DIFF a aplicar sobre el archivo actual.
// Pegá el `extend` adentro del que ya existe. NO reemplaces todo el archivo —
// conservá `content`, `presets`, etc.

module.exports = {
  // ...
  theme: {
    extend: {
      colors: {
        // === Conservar 'mar' actual ===
        mar: {
          50:  "#e6f1f7",
          100: "#cce3ef",
          500: "#0e6ba8",
          700: "#0a4d7a",
          900: "#062a45",
        },

        // === NUEVO: marca y neutros profundos ===
        navy: {
          DEFAULT: "#0E2A4E",
          50:  "#EEF2F7",
          900: "#0B1320",
        },

        // === NUEVO: semántica con par light/deck ===
        // Usalas como `text-lift-deck`, `bg-header-light`, etc.
        lift:   { light: "#15A34A", deck: "#2EF07A" },
        header: { light: "#E03A2C", deck: "#FF5447" },
        warn:   { light: "#D97706", deck: "#FFB020" },
        info:   { light: "#0E6BA8", deck: "#00C2FF" },

        // === NUEVO: superficies deck mode ===
        deck: {
          bg:      "#000000",
          surface: "#0A0F18",
          s2:      "#121925",
          s3:      "#1A2333",
          border:  "#1E2839",
          border2: "#2C3A52",
          text:    "#FFFFFF",
          text2:   "#D6DEE8",
          text3:   "#8FA0B6",
        },

        // === NUEVO: boyas (consistente en ambos modos) ===
        boya: {
          committee: "#D11A2A",
          pin:       "#F59E0B",
          windward:  "#16A34A",
          leeward:   "#1E6FE0",
          gate:      "#8B5CF6",
        },
      },

      fontFamily: {
        sans: ["Inter-Regular", "system-ui"],
        "sans-medium": ["Inter-Medium"],
        "sans-bold":   ["Inter-Bold"],
        mono:          ["JetBrainsMono-Bold", "ui-monospace"],
        "mono-black":  ["JetBrainsMono-ExtraBold"],
      },

      fontSize: {
        // Tipos heroicos para Race Live / Timer
        hero:    ["96px", { lineHeight: "0.9", fontWeight: "800" }],
        metric:  ["56px", { lineHeight: "1",   fontWeight: "700" }],
        metricm: ["32px", { lineHeight: "1",   fontWeight: "700" }],
      },
    },
  },
};
