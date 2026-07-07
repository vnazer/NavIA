// Utilidades geográficas: distancias, rumbos, conversiones.

// ─── Haversine ───────────────────────────────────────────────────────

/** Distancia entre dos puntos GPS en metros (fórmula haversine). */
export function distanciaMetros(
  lat1: number, lon1: number, lat2: number, lon2: number,
): number {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Alias de distanciaMetros. */
export const distanciaHaversineMt = distanciaMetros;

/** Convierte metros a millas náuticas. */
export function metrosAMn(m: number): number {
  return m / 1852;
}

// ─── Rumbo / Bearing ────────────────────────────────────────────────

/**
 * Initial bearing (forward azimuth) desde (lat1, lon1) hacia (lat2, lon2),
 * en grados 0-360 (0 = norte verdadero).
 */
export function calcularRumbo(
  lat1: number, lon1: number, lat2: number, lon2: number,
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

/**
 * Diferencia angular normalizada [0, 180] entre dos rumbos en grados.
 * Útil para derivar TWA desde COG y TWD.
 */
export function diferenciaRumboNormalizada(
  rumbo1: number, rumbo2: number,
): number {
  const diff = ((rumbo1 - rumbo2 + 540) % 360) - 180;
  return Math.abs(diff);
}

/** Diferencia angular con signo: positivo = b en sentido horario respecto a a. */
export function deltaAngular(a: number, b: number): number {
  return ((b - a + 540) % 360) - 180;
}

// ─── Punto destino ─────────────────────────────────────────────────

/** Mueve un punto sobre la esfera: bearing en grados (0=N), distancia en metros. */
export function puntoDestino(
  lat: number, lon: number, rumboGrados: number, distanciaMetros: number,
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
