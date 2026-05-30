// Tipos para tracking GPS y sesiones de regata.

import type { PuntoPronostico } from "@/features/wind/types";
import type { Boya } from "@/features/boyas/types";

export type PuntoTrack = {
  /** Timestamp en ms unix */
  ts: number;
  lat: number;
  lon: number;
  /** Velocidad sobre fondo en nudos (Speed Over Ground). 0 si parado. */
  sogKts: number;
  /** Rumbo sobre fondo en grados (Course Over Ground), 0-360. 0 si parado. */
  cogGrados: number;
  /** Precisión horizontal en metros. */
  precisionMetros: number | null;
};

export type Sesion = {
  id: string;
  nombre: string;
  /** ms unix al iniciar */
  fechaInicio: number;
  /** ms unix al terminar. null si está activa. */
  fechaFin: number | null;
  /** Snapshot del barco activo al momento de iniciar */
  barcoId: string;
  /** Snapshot del spot activo */
  spotId: string;
  /** Snapshot del viento al iniciar la sesión, para análisis posterior. */
  vientoSnapshot: PuntoPronostico | null;
  /** Boyas del cuadro de regata al iniciar (copia editable del set del spot). */
  boyasSnapshot: Boya[];
  puntos: PuntoTrack[];
};

/** Cálculo de eficiencia respecto al polar (en vivo durante la regata). */
export type Rendimiento = {
  /** Ángulo al viento real (TWA) estimado, 0-180 */
  twa: number;
  /** Velocidad esperada según polar (kt) */
  bspEsperado: number;
  /** Velocidad actual (kt) */
  bspActual: number;
  /** Porcentaje del polar (>100 = mejor que polar) */
  porcentajePolar: number;
  /** VMG (Velocity Made Good) al viento en nudos (ceñida/popa) */
  vmg?: number;
  /** VMC (Velocity Made Good to Course/Waypoint) en nudos */
  vmc?: number;
  /** Rumbo directo a la boya o waypoint activo en grados */
  headingToWaypoint?: number;
  /** Distancia en metros a la boya o waypoint activo */
  distanciaToWaypoint?: number;
};
