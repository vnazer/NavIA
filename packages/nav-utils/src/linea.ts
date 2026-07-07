// Cálculos geométricos para la línea de salida y starting bias.

import { calcularRumbo, distanciaHaversineMt } from "./geo";

// ─── Coordenadas locales ───────────────────────────────────────────

function aXYLocal(
  lat: number, lon: number, origenLat: number, origenLon: number,
): { x: number; y: number } {
  const R = 6371000;
  const dLat = ((lat - origenLat) * Math.PI) / 180;
  const dLon = ((lon - origenLon) * Math.PI) / 180;
  return {
    x: dLon * R * Math.cos((origenLat * Math.PI) / 180),
    y: dLat * R,
  };
}

// ─── OCS / distancia perpendicular ────────────────────────────────

export function distanciaPerpendicularALinea(
  barcoLat: number, barcoLon: number,
  committeeLat: number, committeeLon: number,
  pinLat: number, pinLon: number,
  vientoDeGrados: number,
): { distanciaMt: number; estaOcs: boolean } {
  const B = aXYLocal(barcoLat, barcoLon, committeeLat, committeeLon);
  const P = aXYLocal(pinLat, pinLon, committeeLat, committeeLon);
  const lineaLen = Math.sqrt(P.x ** 2 + P.y ** 2);
  if (lineaLen < 0.001) return { distanciaMt: 0, estaOcs: false };

  const normalAx = -P.y / lineaLen;
  const normalAy = P.x / lineaLen;
  const vientoRad = (vientoDeGrados * Math.PI) / 180;
  const dot = normalAx * Math.sin(vientoRad) + normalAy * Math.cos(vientoRad);
  const normalX = dot >= 0 ? normalAx : -normalAx;
  const normalY = dot >= 0 ? normalAy : -normalAy;
  const proy = B.x * normalX + B.y * normalY;

  return { distanciaMt: Math.abs(proy), estaOcs: proy > 0 };
}

// ─── Favored end / Starting bias ───────────────────────────────────

export function calcularFavoredEnd(
  committeeLat: number, committeeLon: number,
  pinLat: number, pinLon: number,
  vientoDeGrados: number,
): { favorecido: "committee" | "pin" | "neutro"; ventajaMt: number } {
  const P = aXYLocal(pinLat, pinLon, committeeLat, committeeLon);
  const vientoRad = (vientoDeGrados * Math.PI) / 180;
  const proy = P.x * Math.sin(vientoRad) + P.y * Math.cos(vientoRad);

  if (Math.abs(proy) < 5) return { favorecido: "neutro", ventajaMt: 0 };
  return { favorecido: proy > 0 ? "pin" : "committee", ventajaMt: Math.abs(proy) };
}

/**
 * Starting bias completo: favored end + ángulo de la línea vs perpendicular
 * al viento + recomendación textual.
 */
export function calcularStartingBias(
  committeeLat: number, committeeLon: number,
  pinLat: number, pinLon: number,
  twdGrados: number,
): {
  favorecido: "committee" | "pin" | "neutro";
  ventajaMt: number;
  biasGrados: number;
  recomendacion: string;
} {
  const { favorecido, ventajaMt } = calcularFavoredEnd(
    committeeLat, committeeLon, pinLat, pinLon, twdGrados,
  );

  // Ángulo de la línea (committee → pin) vs perpendicular al viento
  const rumboLinea = calcularRumbo(committeeLat, committeeLon, pinLat, pinLon);
  const perpendicularAlViento = (twdGrados + 90 + 360) % 360;
  const biasGrados = Math.abs(
    ((rumboLinea - perpendicularAlViento + 540) % 360) - 180,
  );

  let recomendacion: string;
  if (favorecido === "neutro") {
    recomendacion = "Línea pareja. Salí por committee o pin.";
  } else {
    const extremo = favorecido === "pin" ? "pin" : "committee";
    recomendacion = `${extremo.charAt(0).toUpperCase() + extremo.slice(1)} favorecido (+${Math.round(ventajaMt)}m). Salí por el ${extremo}.`;
  }

  return { favorecido, ventajaMt, biasGrados, recomendacion };
}

// ─── Time to burn ──────────────────────────────────────────────────

export function calcularTimeToBurn(
  distanciaALineaMt: number,
  sogKnots: number,
  segundosAlStart: number,
): number | null {
  if (sogKnots < 0.3) return null;
  const sogMps = sogKnots * 0.5144;
  return segundosAlStart - distanciaALineaMt / sogMps;
}

// ─── Bearing y distancia ──────────────────────────────────────────

export function calcularBearingYDistancia(
  desdeLat: number, desdeLon: number,
  hastaLat: number, hastaLon: number,
): { bearingGrados: number; distanciaMt: number; distanciaMn: number } {
  const distanciaMt = distanciaHaversineMt(desdeLat, desdeLon, hastaLat, hastaLon);
  return {
    bearingGrados: calcularRumbo(desdeLat, desdeLon, hastaLat, hastaLon),
    distanciaMt,
    distanciaMn: distanciaMt / 1852,
  };
}
