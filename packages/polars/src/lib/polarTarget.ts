// getPolarTarget: lookup de velocidad objetivo para un rig, TWA, TWS
// y condición del mar.

import type { RigId, CondicionMar, BSP } from "@navia/shared-types";
import { consultarPolar } from "./interpolacion";
import { POLARES, FACTOR_CONDICION } from "../data/barcos";

/**
 * Obtiene la velocidad objetivo (BSP) para un rig dado, ajustada por
 * condición del mar.
 *
 * @param rig        Identificador del barco (ilca4, ilca6, ilca7)
 * @param twa        Ángulo al viento real en grados
 * @param tws        Velocidad del viento real en nudos
 * @param condicion  Condición del mar (plana, media, ola)
 * @returns BSP ajustado en nudos
 */
export function getPolarTarget(
  rig: RigId,
  twa: number,
  tws: number,
  condicion: CondicionMar = "plana",
): BSP {
  const polar = POLARES[rig];
  if (!polar) return 0;
  const bsp = consultarPolar(polar, tws, twa);
  return bsp * FACTOR_CONDICION[condicion];
}
