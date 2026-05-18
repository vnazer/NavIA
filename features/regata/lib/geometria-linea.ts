// Cálculos geométricos para la línea de salida (committee — pin) y posición
// del barco. Convierte coordenadas geográficas a un plano local en metros
// (aproximación válida en distancias chicas, < 10 km).

import { calcularRumbo, distanciaHaversineMt } from "./geo";

/** Convierte (lat, lon) a coordenadas planas (x, y) en metros, relativas a un origen. */
function aXYLocal(
  lat: number,
  lon: number,
  origenLat: number,
  origenLon: number,
): { x: number; y: number } {
  const R = 6371000;
  const dLat = ((lat - origenLat) * Math.PI) / 180;
  const dLon = ((lon - origenLon) * Math.PI) / 180;
  const x = dLon * R * Math.cos((origenLat * Math.PI) / 180);
  const y = dLat * R;
  return { x, y };
}

/**
 * Distancia perpendicular del barco a la línea (committee — pin), en metros.
 * También indica si el barco está OCS (Over the Course Side: cruzó la línea
 * hacia barlovento antes del start, falta para regresar).
 *
 * Lógica:
 *   - Construye un vector "normal" perpendicular a la línea, orientado
 *     hacia barlovento (de donde viene el viento)
 *   - Proyecta la posición del barco sobre esa normal
 *   - Si la proyección es positiva → barco está abajo (lado correcto pre-start)
 *   - Si la proyección es negativa → OCS
 */
export function distanciaPerpendicularALinea(
  barcoLat: number,
  barcoLon: number,
  committeeLat: number,
  committeeLon: number,
  pinLat: number,
  pinLon: number,
  vientoDeGrados: number,
): { distanciaMt: number; estaOcs: boolean } {
  const B = aXYLocal(barcoLat, barcoLon, committeeLat, committeeLon);
  const P = aXYLocal(pinLat, pinLon, committeeLat, committeeLon);

  // Vector de la línea (committee → pin)
  const lineaVx = P.x;
  const lineaVy = P.y;
  const lineaLen = Math.sqrt(lineaVx ** 2 + lineaVy ** 2);
  if (lineaLen < 0.001) {
    // committee y pin en el mismo punto: degenerate, sin línea válida
    return { distanciaMt: 0, estaOcs: false };
  }

  // Normal a la línea (perpendicular). Hay dos opciones; elegimos la que
  // apunta hacia barlovento (de donde viene el viento).
  const normalAx = -lineaVy / lineaLen;
  const normalAy = lineaVx / lineaLen;

  // Vector "hacia donde viene el viento" en coordenadas cartesianas
  // (náutica 0° = N = +y; 90° = E = +x).
  const vientoRad = (vientoDeGrados * Math.PI) / 180;
  const vientoVx = Math.sin(vientoRad);
  const vientoVy = Math.cos(vientoRad);

  // ¿La normal apunta hacia barlovento? Si dot > 0, sí. Si no, invertimos.
  const dot = normalAx * vientoVx + normalAy * vientoVy;
  const normalX = dot >= 0 ? normalAx : -normalAx;
  const normalY = dot >= 0 ? normalAy : -normalAy;

  // Proyección del barco sobre la normal (hacia barlovento).
  // Positivo = barco está sotaventeado a la línea (lado correcto pre-start).
  // Negativo = barco cruzó hacia barlovento → OCS.
  const proy = B.x * normalX + B.y * normalY;

  return {
    distanciaMt: Math.abs(proy),
    estaOcs: proy > 0, // si la normal apunta a barlovento y la proyección es +, barco cruzó
  };
}

/**
 * Determina qué extremo de la línea está más a barlovento ("favored end").
 * Devuelve el ganador y la ventaja en metros (proyección de la línea sobre
 * el eje del viento).
 */
export function calcularFavoredEnd(
  committeeLat: number,
  committeeLon: number,
  pinLat: number,
  pinLon: number,
  vientoDeGrados: number,
): { favorecido: "committee" | "pin" | "neutro"; ventajaMt: number } {
  const P = aXYLocal(pinLat, pinLon, committeeLat, committeeLon);

  const vientoRad = (vientoDeGrados * Math.PI) / 180;
  const vientoVx = Math.sin(vientoRad);
  const vientoVy = Math.cos(vientoRad);

  // Proyección del pin sobre el eje "hacia donde viene el viento".
  // Si > 0, pin está más a barlovento → pin favorecido.
  // Si < 0, committee está más a barlovento.
  const proy = P.x * vientoVx + P.y * vientoVy;

  const umbralNeutro = 5; // menos de 5m de ventaja es "iguales"
  if (Math.abs(proy) < umbralNeutro) {
    return { favorecido: "neutro", ventajaMt: 0 };
  }
  return {
    favorecido: proy > 0 ? "pin" : "committee",
    ventajaMt: Math.abs(proy),
  };
}

/**
 * Time to burn: segundos que sobran (o faltan) considerando tu distancia a
 * la línea, SOG actual y tiempo restante hasta el start.
 *
 * - Positivo: te sobra tiempo, llegás temprano → "matar tiempo"
 * - Cero: timing perfecto
 * - Negativo: vas a llegar tarde
 * - null: SOG demasiado baja para una predicción confiable
 */
export function calcularTimeToBurn(
  distanciaALineaMt: number,
  sogKnots: number,
  segundosAlStart: number,
): number | null {
  if (sogKnots < 0.3) return null;
  const sogMps = sogKnots * 0.5144;
  const segundosParaLlegar = distanciaALineaMt / sogMps;
  return segundosAlStart - segundosParaLlegar;
}

/** Bearing y distancia desde (lat1, lon1) hasta (lat2, lon2). */
export function calcularBearingYDistancia(
  desdeLat: number,
  desdeLon: number,
  hastaLat: number,
  hastaLon: number,
): { bearingGrados: number; distanciaMt: number; distanciaMn: number } {
  const distanciaMt = distanciaHaversineMt(
    desdeLat,
    desdeLon,
    hastaLat,
    hastaLon,
  );
  const bearingGrados = calcularRumbo(desdeLat, desdeLon, hastaLat, hastaLon);
  return {
    bearingGrados,
    distanciaMt,
    distanciaMn: distanciaMt / 1852,
  };
}
