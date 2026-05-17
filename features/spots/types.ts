// Tipos del feature de spots de regata.
// Spot = punto geográfico donde el usuario puede consultar pronóstico.
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
  notas?: string;
};
