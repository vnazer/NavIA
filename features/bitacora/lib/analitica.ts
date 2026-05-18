// Análisis post-sesión: cálculo de métricas agregadas y series temporales.

import { consultarPolar } from "@/features/polar/lib/interpolacion";
import {
  diferenciaRumboNormalizada,
  distanciaTotalTrack,
  metrosAMillasNauticas,
} from "@/features/regata/lib/geo";
import type { Polar } from "@/features/polar/types";
import type { PuntoTrack, Sesion } from "@/features/regata/types";

export type PuntoAnalizado = PuntoTrack & {
  /** Segundos desde el inicio de la sesión */
  offsetSeg: number;
  /** TWA calculado a partir de COG y viento snapshot */
  twa: number;
  /** BSP teórico esperado para ese TWA y TWS */
  bspTeorico: number;
  /** Performance: sogKts / bspTeorico × 100 */
  porcentajePolar: number;
};

export type MetricasSesion = {
  duracionMs: number;
  distanciaMn: number;
  sogPromedio: number;
  sogMax: number;
  performancePromedio: number;
  porcentajeTiempoNavegando: number;
  pctTiempoSobrePolar: number;
  pctTiempoEnPolar: number;
  pctTiempoBajoPolar: number;
  twaPromedioCenida: number | null;
  sogPromedioCenida: number | null;
  twaPromedioEmpopada: number | null;
  sogPromedioEmpopada: number | null;
};

export function analizarSesion(
  sesion: Sesion,
  polar: Polar,
): PuntoAnalizado[] {
  const viento = sesion.vientoSnapshot;
  return sesion.puntos.map((p) => {
    let twa = 0;
    let bspTeorico = 0;
    let porcentajePolar = 0;
    if (viento) {
      twa = diferenciaRumboNormalizada(p.cogGrados, viento.direccionGrados);
      bspTeorico = consultarPolar(polar, viento.velocidadNudos, twa);
      porcentajePolar = bspTeorico > 0 ? (p.sogKts / bspTeorico) * 100 : 0;
    }
    return {
      ...p,
      offsetSeg: Math.round((p.ts - sesion.fechaInicio) / 1000),
      twa,
      bspTeorico,
      porcentajePolar,
    };
  });
}

export function calcularMetricasSesion(
  sesion: Sesion,
  polar: Polar,
): MetricasSesion {
  const puntos = analizarSesion(sesion, polar);
  if (puntos.length === 0) {
    return {
      duracionMs: 0,
      distanciaMn: 0,
      sogPromedio: 0,
      sogMax: 0,
      performancePromedio: 0,
      porcentajeTiempoNavegando: 0,
      pctTiempoSobrePolar: 0,
      pctTiempoEnPolar: 0,
      pctTiempoBajoPolar: 0,
      twaPromedioCenida: null,
      sogPromedioCenida: null,
      twaPromedioEmpopada: null,
      sogPromedioEmpopada: null,
    };
  }

  const duracionMs =
    (sesion.fechaFin ?? puntos[puntos.length - 1].ts) - sesion.fechaInicio;
  const distanciaMt = distanciaTotalTrack(puntos);
  const distanciaMn = metrosAMillasNauticas(distanciaMt);

  const sogs = puntos.map((p) => p.sogKts);
  const sogPromedio = sogs.reduce((a, b) => a + b, 0) / sogs.length;
  const sogMax = Math.max(...sogs);

  const navegando = puntos.filter((p) => p.sogKts > 0.5);
  const porcentajeTiempoNavegando =
    (navegando.length / puntos.length) * 100;

  const conPolar = navegando.filter((p) => p.bspTeorico > 0);
  const performancePromedio =
    conPolar.length > 0
      ? conPolar.reduce((a, b) => a + b.porcentajePolar, 0) / conPolar.length
      : 0;

  const sobrePolar = conPolar.filter((p) => p.porcentajePolar >= 100).length;
  const enPolar = conPolar.filter(
    (p) => p.porcentajePolar >= 90 && p.porcentajePolar < 100,
  ).length;
  const bajoPolar = conPolar.filter((p) => p.porcentajePolar < 90).length;
  const totalPolar = conPolar.length || 1;
  const pctTiempoSobrePolar = (sobrePolar / totalPolar) * 100;
  const pctTiempoEnPolar = (enPolar / totalPolar) * 100;
  const pctTiempoBajoPolar = (bajoPolar / totalPolar) * 100;

  const upwind = navegando.filter((p) => p.twa < 90);
  const downwind = navegando.filter((p) => p.twa >= 90);

  const twaPromedioCenida =
    upwind.length > 0
      ? upwind.reduce((a, b) => a + b.twa, 0) / upwind.length
      : null;
  const sogPromedioCenida =
    upwind.length > 0
      ? upwind.reduce((a, b) => a + b.sogKts, 0) / upwind.length
      : null;
  const twaPromedioEmpopada =
    downwind.length > 0
      ? downwind.reduce((a, b) => a + b.twa, 0) / downwind.length
      : null;
  const sogPromedioEmpopada =
    downwind.length > 0
      ? downwind.reduce((a, b) => a + b.sogKts, 0) / downwind.length
      : null;

  return {
    duracionMs,
    distanciaMn,
    sogPromedio,
    sogMax,
    performancePromedio,
    porcentajeTiempoNavegando,
    pctTiempoSobrePolar,
    pctTiempoEnPolar,
    pctTiempoBajoPolar,
    twaPromedioCenida,
    sogPromedioCenida,
    twaPromedioEmpopada,
    sogPromedioEmpopada,
  };
}

/** Formatea una duración en ms como "1h 23m 45s" */
export function formatearDuracion(ms: number): string {
  const segs = Math.floor(ms / 1000);
  const h = Math.floor(segs / 3600);
  const m = Math.floor((segs % 3600) / 60);
  const s = segs % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  return `${m}m ${s}s`;
}
