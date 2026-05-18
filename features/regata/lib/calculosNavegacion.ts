// Cálculos de navegación: TWA real desde COG y dirección del viento,
// comparación con polar para % de eficiencia.

import type { Polar } from "@/features/polar/types";
import { consultarPolar } from "@/features/polar/lib/interpolacion";
import type { Rendimiento } from "../types";

/**
 * Calcula el TWA (True Wind Angle) a partir del rumbo del barco (COG)
 * y la dirección del viento (TWD).
 *
 * TWD = dirección DE DONDE viene el viento (convención meteorológica).
 * COG = rumbo HACIA DONDE va el barco.
 *
 * TWA = ángulo agudo entre el barco y el viento, 0° = proa al viento,
 * 180° = popa al viento. Siempre positivo (no distinguimos babor/starboard).
 */
export function calcularTWA(cog: number, twd: number): number {
  // Diferencia bruta normalizada a [-180, 180]
  let diff = ((cog - twd + 540) % 360) - 180;
  return Math.abs(diff);
}

/**
 * Calcula el rendimiento comparando velocidad actual con polar.
 * Si cog/sog son null o tws muy bajo, retorna null.
 */
export function calcularRendimiento(
  polar: Polar,
  cog: number | null,
  sog: number | null,
  twd: number,
  tws: number,
): Rendimiento | null {
  if (cog == null || sog == null || tws < 1) return null;

  const twa = calcularTWA(cog, twd);
  const bspEsperado = consultarPolar(polar, tws, twa);
  // Evitar división por cero
  const porcentajePolar =
    bspEsperado > 0.1 ? (sog / bspEsperado) * 100 : 0;

  return {
    twa,
    bspEsperado,
    bspActual: sog,
    porcentajePolar,
  };
}

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
