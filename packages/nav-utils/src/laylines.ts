// Cálculo de laylines y OTA (Optimal Tacking Angle).

import type { Polar } from "@navia/shared-types";
import { consultarPolar } from "@navia/polars";
import { puntoDestino } from "./geo";

export type Laylines = {
  estribor: [[number, number], [number, number]];
  babor: [[number, number], [number, number]];
};

/**
 * Estima el TWA óptimo de ceñida maximizando el VMG upwind.
 * Prueba ángulos cada 1° entre 25° y 80°.
 */
export function otaOptima(polar: Polar, tws: number): number {
  let mejorVmg = -Infinity;
  let mejorTwa = 42;
  for (let twa = 25; twa <= 80; twa++) {
    const bsp = consultarPolar(polar, tws, twa);
    const vmg = bsp * Math.cos((twa * Math.PI) / 180);
    if (vmg > mejorVmg) {
      mejorVmg = vmg;
      mejorTwa = twa;
    }
  }
  return mejorTwa;
}

/**
 * Calcula las laylines de estribor y babor desde la marca de barlovento.
 */
export function calcularLaylines(
  marca: { lat: number; lon: number },
  twdGrados: number,
  otaGrados = 42,
  distMetros = 2000,
): Laylines {
  const mark: [number, number] = [marca.lat, marca.lon];
  const bEstribor = ((twdGrados + 180 - otaGrados) % 360 + 360) % 360;
  const bBabor = (twdGrados + 180 + otaGrados) % 360;

  return {
    estribor: [mark, puntoDestino(marca.lat, marca.lon, bEstribor, distMetros)],
    babor: [mark, puntoDestino(marca.lat, marca.lon, bBabor, distMetros)],
  };
}
