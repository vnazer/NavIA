// Tipos para tracking GPS y sesiones de regata.

export type PuntoGPS = {
  timestamp: number; // ms unix
  lat: number;
  lon: number;
  /** Velocidad sobre fondo en nudos (Speed Over Ground). null si no disponible. */
  sog: number | null;
  /** Rumbo sobre fondo en grados (Course Over Ground), 0-360. null si parado. */
  cog: number | null;
  /** Precisión horizontal en metros. */
  precisionMetros: number | null;
};

export type SesionRegata = {
  id: string;
  nombre: string;
  /** ms unix al iniciar */
  iniciadaEn: number;
  /** ms unix al terminar. null si está activa. */
  terminadaEn: number | null;
  /** Snapshot del barco activo al momento de iniciar */
  barcoId: string;
  /** Snapshot del spot activo */
  spotId: string;
  puntos: PuntoGPS[];
};

/** Cálculo de eficiencia respecto al polar. */
export type Rendimiento = {
  /** Ángulo al viento real (TWA) estimado, 0-180 */
  twa: number;
  /** Velocidad esperada según polar (kt) */
  bspEsperado: number;
  /** Velocidad actual (kt) */
  bspActual: number;
  /** Porcentaje del polar (>100 = mejor que polar) */
  porcentajePolar: number;
};
