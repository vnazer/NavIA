// Mapeo de clases Tailwind a colores hex.
// Necesario porque NativeWind en runtime no resuelve clases a valores hex,
// y en SVG/inline styles necesitamos el hex directamente.
// Este mapeo cubre las clases usadas por la escala Beaufort.

export const HEX_DESDE_TAILWIND: Record<string, string> = {
  "bg-slate-200":   "#e2e8f0",
  "bg-sky-200":     "#bae6fd",
  "bg-sky-300":     "#7dd3fc",
  "bg-emerald-400": "#34d399",
  "bg-emerald-500": "#10b981",
  "bg-amber-400":   "#fbbf24",
  "bg-orange-500":  "#f97316",
  "bg-red-500":     "#ef4444",
  "bg-red-700":     "#b91c1c",
  "bg-red-800":     "#991b1b",
  "bg-purple-700":  "#7e22ce",
  "bg-purple-900":  "#581c87",
  "bg-black":       "#000000",
};

const FALLBACK = "#0a4d7a"; // Mar 700 (color marca)

/**
 * Devuelve el hex correspondiente a una clase Tailwind bg-*.
 * Si la clase no está en el mapeo, devuelve el color de marca.
 */
export function hexDesdeTailwind(claseTw: string): string {
  return HEX_DESDE_TAILWIND[claseTw] ?? FALLBACK;
}

/**
 * Devuelve un color de texto que contrasta bien con el fondo dado.
 * Útil para asegurar legibilidad sobre paletas de Beaufort.
 */
export function colorTextoSobre(claseTw: string): string {
  // Categorías oscuras donde necesitamos texto blanco
  const oscuras = [
    "bg-emerald-500", "bg-orange-500", "bg-red-500", "bg-red-700",
    "bg-red-800", "bg-purple-700", "bg-purple-900", "bg-black",
  ];
  return oscuras.includes(claseTw) ? "#ffffff" : "#0f172a";
}
