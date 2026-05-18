// Tipos del módulo de boyas race-day.
// Las boyas son ephemeral (cambian en cada regata) y representan las marcas
// que el Comité pone ese día. Distinto de los Spots, que son geográficos fijos.

export type TipoBoya =
  | "committee" // barco del comité (extremo derecho de línea de salida en general)
  | "pin" // pin end (extremo izquierdo de línea de salida)
  | "windward" // marca de barlovento
  | "leeward" // marca de sotavento
  | "gate_l" // gate izquierdo
  | "gate_r" // gate derecho
  | "custom"; // marca custom (offset, marca de cambio, etc.)

export type Boya = {
  id: string;
  tipo: TipoBoya;
  lat: number;
  lon: number;
  /** Opcional: "W1", "Lay K3", etc. */
  label?: string;
  /** Timestamp ms al crear. Permite ordenar y debuggear. */
  fechaCreacion: number;
};

/** Metadatos visuales por tipo de boya. */
export const BOYA_META: Record<
  TipoBoya,
  {
    nombre: string;
    color: string;
    emoji: string;
    ordenSugerido: number;
  }
> = {
  committee: {
    nombre: "Committee Boat",
    color: "#dc2626",
    emoji: "🚤",
    ordenSugerido: 1,
  },
  pin: { nombre: "Pin End", color: "#ea580c", emoji: "📍", ordenSugerido: 2 },
  windward: {
    nombre: "Windward",
    color: "#16a34a",
    emoji: "⬆️",
    ordenSugerido: 3,
  },
  leeward: {
    nombre: "Leeward",
    color: "#0284c7",
    emoji: "⬇️",
    ordenSugerido: 4,
  },
  gate_l: {
    nombre: "Gate Izq",
    color: "#9333ea",
    emoji: "◀️",
    ordenSugerido: 5,
  },
  gate_r: {
    nombre: "Gate Der",
    color: "#9333ea",
    emoji: "▶️",
    ordenSugerido: 6,
  },
  custom: {
    nombre: "Custom",
    color: "#64748b",
    emoji: "🔘",
    ordenSugerido: 7,
  },
};
