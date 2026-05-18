// Utilidades geográficas: distancias entre puntos GPS, conversiones,
// diferencia de rumbos.

import type { PuntoTrack } from "../types";

/** Distancia entre dos puntos GPS en metros (fórmula haversine). */
export function distanciaMetros(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371000; // radio terrestre en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Suma de distancias punto a punto a lo largo del track, en metros. */
export function distanciaTotalTrack(puntos: PuntoTrack[]): number {
  if (puntos.length < 2) return 0;
  let total = 0;
  for (let i = 1; i < puntos.length; i++) {
    total += distanciaMetros(
      puntos[i - 1].lat,
      puntos[i - 1].lon,
      puntos[i].lat,
      puntos[i].lon,
    );
  }
  return total;
}

/** Convierte metros a millas náuticas. */
export function metrosAMillasNauticas(m: number): number {
  return m / 1852;
}

/**
 * Calcula la diferencia angular normalizada [0, 180] entre dos rumbos
 * en grados. Se usa para derivar el TWA (True Wind Angle) a partir del
 * rumbo del barco (COG) y la dirección DE DONDE viene el viento (TWD).
 */
export function diferenciaRumboNormalizada(
  rumbo1: number,
  rumbo2: number,
): number {
  const diff = ((rumbo1 - rumbo2 + 540) % 360) - 180;
  return Math.abs(diff);
}
