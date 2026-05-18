// Tipos del feature de spots de regata.
// Spot = punto geográfico donde el usuario puede consultar pronóstico.
// MODIFICADO EN PROMPT 3.6: campo `descripcion` (antes era `notas`)
// + tipo CoordenadaOverride para correcciones persistidas.

export type Spot = {
  /** ID estable, usado para persistencia */
  id: string;
  /** Nombre legible para UI */
  nombre: string;
  /** Club o referencia náutica asociada */
  club?: string;
  /** Latitud decimal (negativa en hemisferio sur) */
  lat: number;
  /** Longitud decimal (negativa al oeste de Greenwich) */
  lon: number;
  /** Notas locales: viento dominante, peligros, etc. */
  descripcion?: string;
};

/**
 * Override de coordenadas para un spot específico, persistido en AsyncStorage.
 * El usuario puede corregir la ubicación arrastrando el marcador en modo edición.
 */
export type CoordenadaOverride = {
  lat: number;
  lon: number;
};
