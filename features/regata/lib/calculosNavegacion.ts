// Cálculo de rendimiento en vivo: TWA real desde COG + viento, comparación
// contra polar. Para análisis post-sesión ver features/bitacora/lib/analitica.ts.

import type { Polar } from "@/features/polar/types";
import { consultarPolar } from "@/features/polar/lib/interpolacion";
import { diferenciaRumboNormalizada } from "./geo";
import type { Rendimiento } from "../types";

/**
 * Calcula el rendimiento comparando velocidad actual con polar.
 * Si tws muy bajo o sog 0, retorna null.
 */
export function calcularRendimiento(
  polar: Polar,
  cogGrados: number,
  sogKts: number,
  twd: number,
  tws: number,
): Rendimiento | null {
  if (sogKts <= 0 || tws < 1) return null;

  const twa = diferenciaRumboNormalizada(cogGrados, twd);
  const bspEsperado = consultarPolar(polar, tws, twa);
  const porcentajePolar =
    bspEsperado > 0.1 ? (sogKts / bspEsperado) * 100 : 0;

  return {
    twa,
    bspEsperado,
    bspActual: sogKts,
    porcentajePolar,
  };
}
