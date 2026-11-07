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
/** Puntos con precisión peor que esto (m) no suman distancia (saltos de GPS). */
export const PRECISION_MAX_DISTANCIA_M = 25;

export function distanciaTotalTrack(puntos: PuntoTrack[]): number {
  if (puntos.length < 2) return 0;
  let total = 0;
  let anterior: PuntoTrack | null = null;
  for (const p of puntos) {
    // Descarta fixes imprecisos: el "zigzag" del ruido infla la distancia
    if (p.precisionMetros != null && p.precisionMetros > PRECISION_MAX_DISTANCIA_M) {
      continue;
    }
    if (anterior) {
      total += distanciaMetros(anterior.lat, anterior.lon, p.lat, p.lon);
    }
    anterior = p;
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

/**
 * Initial bearing (forward azimuth) desde (lat1, lon1) hacia (lat2, lon2),
 * en grados 0-360 (0 = norte verdadero).
 */
export function calcularRumbo(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return ((θ * 180) / Math.PI + 360) % 360;
}

/** Alias semántico de distanciaMetros (haversine, en metros). */
export const distanciaHaversineMt = distanciaMetros;
