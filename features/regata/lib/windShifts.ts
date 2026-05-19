// Detección de shifts de viento a partir de una serie temporal de TWD.
//
// Terminología:
//   veer  = rotación horaria del viento (favorable en estribor, desfavorable en babor)
//   back  = rotación antihoraria (favorable en babor, desfavorable en estribor)
//   shift = cualquier cambio ≥ umbral relativo al baseline anterior

export type TendenciaViento = "veer" | "back" | "estable";

export type ShiftDetectado = {
  ts: number;
  twd: number;
  /** Grados girados desde el baseline previo (+veer, -back). */
  deltaGrados: number;
  tendencia: TendenciaViento;
};

/** Diferencia angular con signo: positivo = b está en sentido horario respecto a a. */
function deltaAngular(a: number, b: number): number {
  return ((b - a + 540) % 360) - 180;
}

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
 * El baseline es el TWD en la hora más cercana al inicio de la sesión.
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

/**
 * Encuentra el TWD más cercano al timestamp de inicio de sesión en el pronóstico.
 */
export function twdBaseline(
  puntosPron: Array<{ hora: string; direccionGrados: number }>,
  fechaInicioMs: number,
): number | null {
  if (puntosPron.length === 0) return null;
  let mejorIdx = 0;
  let menorDiff = Infinity;
  for (let i = 0; i < puntosPron.length; i++) {
    const diff = Math.abs(
      new Date(puntosPron[i].hora).getTime() - fechaInicioMs,
    );
    if (diff < menorDiff) {
      menorDiff = diff;
      mejorIdx = i;
    }
  }
  return puntosPron[mejorIdx].direccionGrados;
}
