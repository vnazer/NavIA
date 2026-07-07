// Detección de shifts de viento a partir de una serie temporal de TWD.

import { deltaAngular } from "./geo";

export type TendenciaViento = "veer" | "back" | "estable";

export type ShiftDetectado = {
  ts: number;
  twd: number;
  /** Grados girados desde el baseline previo (+veer, -back). */
  deltaGrados: number;
  tendencia: TendenciaViento;
};

/**
 * Detecta shifts significativos en una serie de observaciones TWD.
 * Cada shift resetea el baseline para el siguiente.
 */
export function detectarShifts(
  puntos: Array<{ ts: number; twd: number }>,
  umbralGrados = 5,
): ShiftDetectado[] {
  if (puntos.length < 2) return [];
  const shifts: ShiftDetectado[] = [];
  let baseline = puntos[0].twd;

  for (let i = 1; i < puntos.length; i++) {
    const delta = deltaAngular(baseline, puntos[i].twd);
    if (Math.abs(delta) >= umbralGrados) {
      shifts.push({
        ts: puntos[i].ts,
        twd: puntos[i].twd,
        deltaGrados: delta,
        tendencia: delta > 0 ? "veer" : "back",
      });
      baseline = puntos[i].twd;
    }
  }
  return shifts;
}

/**
 * Retorna la diferencia entre el TWD actual y el baseline de la sesión.
 */
export function shiftDesdeSesion(
  twdBaseline: number,
  twdActual: number,
): { deltaGrados: number; tendencia: TendenciaViento } {
  const delta = deltaAngular(twdBaseline, twdActual);
  const tendencia: TendenciaViento =
    Math.abs(delta) < 3 ? "estable" : delta > 0 ? "veer" : "back";
  return { deltaGrados: delta, tendencia };
}
