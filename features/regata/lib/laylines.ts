// Cálculo geométrico de laylines para regata de ceñida.
//
// Las laylines salen desde la marca de barlovento y representan las dos
// trayectorias óptimas de ceñida (estribor y babor) que llevan al barco
// directamente a la marca sin necesidad de virar al llegar.
//
// TWD = dirección DE DONDE viene el viento (0 = del Norte).
// OTA = Optimal Tacking Angle (típicamente 40-45°, derivado del polar).

import type { Polar } from "@/features/polar/types";
import { consultarPolar } from "@/features/polar/lib/interpolacion";

export type Laylines = {
  /** [posición marca, extremo lejano] en lat/lon */
  estribor: [[number, number], [number, number]];
  babor: [[number, number], [number, number]];
};

/** Mueve un punto sobre la esfera: bearing en grados (0=N), distancia en metros. */
function puntoDestino(
  lat: number,
  lon: number,
  rumboGrados: number,
  distanciaMetros: number,
): [number, number] {
  const R = 6371000;
  const δ = distanciaMetros / R;
  const θ = (rumboGrados * Math.PI) / 180;
  const φ1 = (lat * Math.PI) / 180;
  const λ1 = (lon * Math.PI) / 180;

  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ),
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
    );

  return [(φ2 * 180) / Math.PI, (((λ2 * 180) / Math.PI) % 360 + 540) % 360 - 180];
}

/**
 * Estima el TWA óptimo de ceñida maximizando el VMG upwind = BSP × cos(TWA).
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
 *
 * @param marca       Posición de la marca de barlovento.
 * @param twdGrados   Dirección del viento verdadero (FROM), 0-360.
 * @param otaGrados   Ángulo óptimo de ceñida (por defecto 42°).
 * @param distMetros  Longitud de cada layline en metros (por defecto 2 km).
 */
export function calcularLaylines(
  marca: { lat: number; lon: number },
  twdGrados: number,
  otaGrados = 42,
  distMetros = 2000,
): Laylines {
  const mark: [number, number] = [marca.lat, marca.lon];

  // Bearing desde la marca hacia el área donde estará el barco en ceñida:
  //   estribor: mark → TWD + 180 − OTA  (barcos que llegan navegando al NW)
  //   babor:    mark → TWD + 180 + OTA  (barcos que llegan navegando al NE)
  const bEstribor = ((twdGrados + 180 - otaGrados) % 360 + 360) % 360;
  const bBabor = (twdGrados + 180 + otaGrados) % 360;

  return {
    estribor: [mark, puntoDestino(marca.lat, marca.lon, bEstribor, distMetros)],
    babor: [mark, puntoDestino(marca.lat, marca.lon, bBabor, distMetros)],
  };
}
