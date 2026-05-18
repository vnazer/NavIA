// Cálculo de distancia y rumbo desde la posición del barco a una boya.

import { distanciaMetros } from "@/features/regata/lib/geo";
import type { Boya } from "../types";

/**
 * Rumbo inicial desde (lat1, lon1) hacia (lat2, lon2), en grados 0-360.
 * Fórmula del "initial bearing" (forward azimuth).
 */
export function rumboHacia(
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

export type InfoBoya = {
  boya: Boya;
  distanciaMetros: number;
  rumboGrados: number;
};

/** Calcula distancia y rumbo desde una posición a cada boya, ordenado por distancia. */
export function infoBoyasDesde(
  boyas: Boya[],
  lat: number,
  lon: number,
): InfoBoya[] {
  return boyas
    .map((b) => ({
      boya: b,
      distanciaMetros: distanciaMetros(lat, lon, b.lat, b.lon),
      rumboGrados: rumboHacia(lat, lon, b.lat, b.lon),
    }))
    .sort((a, b) => a.distanciaMetros - b.distanciaMetros);
}
