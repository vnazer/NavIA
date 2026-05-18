// Cálculos derivados del polar: VMG, ángulos óptimos de ceñida y empopada.

import type { Polar, OptimosPolar } from "../types";
import { consultarPolar } from "./interpolacion";

const DEG_TO_RAD = Math.PI / 180;

/**
 * VMG hacia barlovento dado TWA y BSP.
 * VMG_upwind = BSP × cos(TWA), válido para TWA < 90°.
 */
export function vmgUpwind(twa: number, bsp: number): number {
  return bsp * Math.cos(twa * DEG_TO_RAD);
}

/**
 * VMG hacia sotavento dado TWA y BSP.
 * VMG_downwind = -BSP × cos(TWA) = BSP × cos(180° - TWA).
 * El signo se ajusta para que valores positivos sean "buen VMG abajo".
 */
export function vmgDownwind(twa: number, bsp: number): number {
  return -bsp * Math.cos(twa * DEG_TO_RAD);
}

/**
 * Encuentra el TWA y BSP óptimos en zona upwind (ceñida) para una TWS dada.
 * Barre TWA de 30° a 89° en pasos de 0.5° y elige el que maximiza VMG.
 */
function calcularOptimoCenida(
  polar: Polar,
  tws: number,
): { twa: number; bsp: number; vmg: number } {
  let mejorTwa = 45;
  let mejorBsp = 0;
  let mejorVmg = -Infinity;

  for (let twa = 30; twa < 90; twa += 0.5) {
    const bsp = consultarPolar(polar, tws, twa);
    const vmg = vmgUpwind(twa, bsp);
    if (vmg > mejorVmg) {
      mejorVmg = vmg;
      mejorTwa = twa;
      mejorBsp = bsp;
    }
  }

  return { twa: mejorTwa, bsp: mejorBsp, vmg: mejorVmg };
}

/**
 * Encuentra el TWA y BSP óptimos en zona downwind (empopada) para una TWS dada.
 * Barre TWA de 91° a 180° en pasos de 0.5° y elige el que maximiza VMG.
 */
function calcularOptimoEmpopada(
  polar: Polar,
  tws: number,
): { twa: number; bsp: number; vmg: number } {
  let mejorTwa = 150;
  let mejorBsp = 0;
  let mejorVmg = -Infinity;

  for (let twa = 91; twa <= 180; twa += 0.5) {
    const bsp = consultarPolar(polar, tws, twa);
    const vmg = vmgDownwind(twa, bsp);
    if (vmg > mejorVmg) {
      mejorVmg = vmg;
      mejorTwa = twa;
      mejorBsp = bsp;
    }
  }

  return { twa: mejorTwa, bsp: mejorBsp, vmg: mejorVmg };
}

/**
 * Calcula todos los óptimos (ceñida + empopada) para un polar y una TWS dadas.
 */
export function calcularOptimos(polar: Polar, tws: number): OptimosPolar {
  const cenida = calcularOptimoCenida(polar, tws);
  const empopada = calcularOptimoEmpopada(polar, tws);

  return {
    twsConsultado: tws,
    twaOptimoCenida: cenida.twa,
    bspCenida: cenida.bsp,
    vmgCenida: cenida.vmg,
    twaOptimoEmpopada: empopada.twa,
    bspEmpopada: empopada.bsp,
    vmgEmpopada: empopada.vmg,
  };
}
