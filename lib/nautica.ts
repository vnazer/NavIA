// Helpers de conversión y formato náutico.

/**
 * Convierte grados de dirección (0-360) a punto cardinal de 16 puntos, en
 * español (Oeste = O): N, NNE, NE, ENE, E, ESE, SE, SSE, S, SSO, SO, OSO,
 * O, ONO, NO, NNO.
 * @param grados Dirección en grados (0 = N, 90 = E, 180 = S, 270 = O).
 */
export function gradosACardinal(grados: number): string {
  const puntos = [
    "N", "NNE", "NE", "ENE",
    "E", "ESE", "SE", "SSE",
    "S", "SSO", "SO", "OSO",
    "O", "ONO", "NO", "NNO",
  ];
  const normalizado = ((grados % 360) + 360) % 360;
  const idx = Math.round(normalizado / 22.5) % 16;
  return puntos[idx];
}

/** Formatea velocidad en nudos con 0 decimales. */
export function formatearNudos(nudos: number): string {
  return `${Math.round(nudos)} kt`;
}

/** Formatea dirección en formato "240° (OSO)". */
export function formatearDireccion(grados: number): string {
  return `${Math.round(grados)}° (${gradosACardinal(grados)})`;
}
