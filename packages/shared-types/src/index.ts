// Tipos TypeScript compartidos para NavIA.
// Puros, sin dependencias de runtime, sin imports de React/Expo.
//
// Este paquete es el cimiento: polars y nav-utils dependen de él.

// ─── Polar ──────────────────────────────────────────────────────────

/** Velocidad de viento real, en nudos. */
export type TWS = number;

/** Ángulo al viento real, en grados (0=viento por la proa, 180=por la popa). */
export type TWA = number;

/** Velocidad del barco, en nudos. */
export type BSP = number;

/**
 * Polar de un barco: matriz de TWS × TWA → BSP.
 * Los valores TWS y TWA están ordenados de menor a mayor.
 */
export type Polar = {
  /** Valores de TWS en los que está definida la tabla (eje vertical). */
  tws: TWS[];
  /** Valores de TWA en los que está definida la tabla (eje horizontal). */
  twa: TWA[];
  /** Matriz de BSP[i][j] correspondiente a tws[i] × twa[j]. */
  bsp: BSP[][];
};

/** Resultado de cálculo de óptimos para una intensidad de viento dada. */
export type OptimosPolar = {
  twsConsultado: TWS;
  twaOptimoCenida: TWA;
  bspCenida: BSP;
  vmgCenida: number;
  twaOptimoEmpopada: TWA;
  bspEmpopada: BSP;
  vmgEmpopada: number;
};

/** Definición de un barco con su polar asociado. */
export type Barco = {
  id: string;
  nombre: string;
  clase: string;
  descripcion?: string;
  polar: Polar;
};

/** Identificador de rig (barco ILCA). */
export type RigId = "ilca4" | "ilca6" | "ilca7";

/** Condición del mar para ajuste de polar. */
export type CondicionMar = "plana" | "media" | "ola";

// ─── Boyas ──────────────────────────────────────────────────────────

export type TipoBoya =
  | "committee"
  | "pin"
  | "windward"
  | "leeward"
  | "gate_l"
  | "gate_r"
  | "custom";

export type Boya = {
  id: string;
  tipo: TipoBoya;
  lat: number;
  lon: number;
  label?: string;
  fechaCreacion: number;
};

// ─── Sesion / Regata ────────────────────────────────────────────────

export type PuntoTrack = {
  ts: number;
  lat: number;
  lon: number;
  sogKts: number;
  cogGrados: number;
  precisionMetros: number | null;
};

export type Sesion = {
  id: string;
  nombre: string;
  fechaInicio: number;
  fechaFin: number | null;
  barcoId: string;
  spotId: string;
  boyasSnapshot: Boya[];
  puntos: PuntoTrack[];
};

/** Cálculo de eficiencia respecto al polar (en vivo durante la regata). */
export type Rendimiento = {
  twa: number;
  bspEsperado: number;
  bspActual: number;
  porcentajePolar: number;
  vmg?: number;
  vmc?: number;
  headingToWaypoint?: number;
  distanciaToWaypoint?: number;
};

// ─── Viento / Pronóstico ────────────────────────────────────────────

export type PuntoPronostico = {
  hora: string;
  velocidadNudos: number;
  rachasNudos: number;
  direccionGrados: number;
  temperaturaC: number;
  presionHpa?: number;
  uv?: number;
  precipitacionMm?: number;
  probLluvia?: number;
  visibilidadMt?: number;
  nubosidad?: number;
  cape?: number;
  olaMt?: number;
  olaPeriodoSeg?: number;
  olaDireccionGrados?: number;
  swellMt?: number;
  swellPeriodoSeg?: number;
};

// ─── AIS ────────────────────────────────────────────────────────────

export type BarcoAis = {
  mmsi: string;
  nombre?: string;
  destino?: string;
  tipoBarco?: number;
  lat: number;
  lon: number;
  sogKts: number;
  cogGrados: number;
  ultimaActualizacion: number;
};

// ─── Sensor / Telemetría ────────────────────────────────────────────

export type LecturaSensor = {
  ts: number;
  lat: number;
  lon: number;
  sogKts: number;
  cogGrados: number;
  /** Dirección del viento real (from), si hay anemómetro. */
  twd?: number;
  /** Velocidad del viento real, si hay anemómetro. */
  tws?: number;
  /** Frecuencia cardíaca (bpm), si hay sensor. */
  hr?: number;
  /** Presión barométrica (hPa), si hay barómetro. */
  presionHpa?: number;
};

// ─── Usuario ────────────────────────────────────────────────────────

export type ConfiguracionUsuario = {
  rigPreferido: RigId;
  club: string;
  polarPersonalizadaId?: string;
  unidades: "metrico" | "imperial";
};
