// Tipos del feature de viento.

export type PuntoPronostico = {
  /** ISO 8601 timestamp local */
  hora: string;
  /** Velocidad de viento sostenido a 10m en nudos */
  velocidadNudos: number;
  /** Rachas en nudos */
  rachasNudos: number;
  /** Dirección de donde viene el viento en grados (0 = N) */
  direccionGrados: number;
  /** Temperatura del aire a 2m en °C */
  temperaturaC: number;
};

export type Pronostico = {
  spotId: string;
  generadoEn: string; // ISO timestamp de cuando se hizo el fetch
  puntos: PuntoPronostico[];
};
