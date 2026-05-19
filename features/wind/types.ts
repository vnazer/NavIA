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
  // === Prompt 9: variables atmosféricas adicionales ===
  /** Presión a nivel del mar en hPa (pressure_msl) */
  presionHpa?: number;
  /** Índice UV (uv_index, escala 0-11+) */
  uv?: number;
  /** Precipitación acumulada en mm */
  precipitacionMm?: number;
  /** Probabilidad de precipitación en % */
  probLluvia?: number;
  /** Visibilidad horizontal en metros */
  visibilidadMt?: number;
  /** Cobertura nubosa en % */
  nubosidad?: number;
  /** CAPE (Convective Available Potential Energy) J/kg — alta = inestabilidad atmosférica */
  cape?: number;
  /** Altura de ola significativa en metros (marine-api) */
  olaMt?: number;
};

export type Pronostico = {
  spotId: string;
  generadoEn: string; // ISO timestamp de cuando se hizo el fetch
  puntos: PuntoPronostico[];
};
