// Tokens de color del sistema NavIA — modo "deck" (cubierta, alto contraste)
// y "light" (en tierra, planificando).

export type Modo = "deck" | "light" | "deck_extremo";

export const COLORES_DECK = {
  bg:        "#000000",
  surface:   "#0A0F18",
  surface2:  "#121925",
  surface3:  "#1A2333",
  text:      "#FFFFFF",
  text2:     "#D6DEE8",
  text3:     "#8FA0B6",
  border:    "#1E2839",
  border2:   "#2C3A52",
  navy:      "#0E2A4E",
  accent:    "#00C2FF",
  lift:      "#2EF07A",
  header:    "#FF5447",
  warn:      "#FFB020",
  info:      "#00C2FF",
  bCommittee: "#FF3A4A",
  bPin:       "#FFB020",
  bWindward:  "#2EF07A",
  bLeeward:   "#3B95FF",
  bGate:      "#A78BFA",
} as const;

export const COLORES_DECK_EXTREMO = {
  bg:        "#000000",
  surface:   "#000000",
  surface2:  "#0A0F18",
  surface3:  "#121925",
  text:      "#EAFB00", // Amarillo neón de alto contraste
  text2:     "#00FFE0", // Cian eléctrico
  text3:     "#FFFFFF",
  border:    "#EAFB00",
  border2:   "#00FFE0",
  navy:      "#000000",
  accent:    "#00FFE0",
  lift:      "#2EF07A",
  header:    "#FF5447",
  warn:      "#FFB020",
  info:      "#00FFE0",
  bCommittee: "#FF3A4A",
  bPin:       "#FFB020",
  bWindward:  "#2EF07A",
  bLeeward:   "#3B95FF",
  bGate:      "#A78BFA",
} as const;

export const COLORES_LIGHT = {
  bg:        "#EEF2F7",
  surface:   "#FFFFFF",
  surface2:  "#F6F8FB",
  surface3:  "#ECF0F5",
  text:      "#0B1320",
  text2:     "#475266",
  text3:     "#8392A6",
  border:    "#E0E6EE",
  border2:   "#C9D2DE",
  navy:      "#0E2A4E",
  accent:    "#0E6BA8",
  lift:      "#15A34A",
  header:    "#E03A2C",
  warn:      "#D97706",
  info:      "#0E6BA8",
  bCommittee: "#D11A2A",
  bPin:       "#F59E0B",
  bWindward:  "#16A34A",
  bLeeward:   "#1E6FE0",
  bGate:      "#8B5CF6",
} as const;

export type Colores = Record<keyof typeof COLORES_DECK, string>;

export function paletaDe(modo: Modo): Colores {
  if (modo === "deck_extremo") return COLORES_DECK_EXTREMO;
  return modo === "deck" ? COLORES_DECK : COLORES_LIGHT;
}
