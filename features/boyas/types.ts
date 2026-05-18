// Tipos para las boyas del cuadro de regata.

export type Boya = {
  id: string;
  /** Nombre corto: "1", "2", "Barlovento", "BL", etc. */
  nombre: string;
  lat: number;
  lon: number;
  /** Color opcional para diferenciar en el mapa. Por defecto naranja. */
  color?: string;
};

/** Conjunto de boyas guardadas para un spot específico. */
export type SetBoyasSpot = {
  spotId: string;
  /** Última edición — para detectar boyas viejas vs recién cargadas. */
  actualizadoEn: number;
  boyas: Boya[];
};
