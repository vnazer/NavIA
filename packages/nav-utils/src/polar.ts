// Cálculos derivados del polar: VMG, óptimos de ceñida/empopada.

import type { Polar, OptimosPolar } from "@navia/shared-types";
import { consultarPolar } from "@navia/polars";

const DEG_TO_RAD = Math.PI / 180;

/** VMG hacia barlovento dado TWA y BSP. Positivo = buen VMG de ceñida. */
export function vmgUpwind(twa: number, bsp: number): number {
  return bsp * Math.cos(twa * DEG_TO_RAD);
}

/** VMG hacia sotavento dado TWA y BSP. Positivo = buen VMG de empopada. */
export function vmgDownwind(twa: number, bsp: number): number {
  return -bsp * Math.cos(twa * DEG_TO_RAD);
}

/** Encuentra TWA/BSP óptimos en zona upwind para una TWS dada. */
function calcularOptimoCenida(
  polar: Polar, tws: number,
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

/** Encuentra TWA/BSP óptimos en zona downwind para una TWS dada. */
function calcularOptimoEmpopada(
  polar: Polar, tws: number,
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

/** Calcula todos los óptimos (ceñida + empopada) para un polar y TWS dados. */
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

// Alias de compatibilidad: el spec pide calcularVMG como nombre público
export const calcularVMG = vmgUpwind;
