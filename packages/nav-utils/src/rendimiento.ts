// Cálculo de rendimiento en vivo: TWA real, comparación contra polar, VMG/VMC.

import type { Polar, Rendimiento } from "@navia/shared-types";
import { consultarPolar } from "@navia/polars";
import { diferenciaRumboNormalizada, calcularRumbo, distanciaMetros } from "./geo";

/**
 * Calcula el rendimiento comparando velocidad actual con polar.
 * Si tws muy bajo o sog 0, retorna null.
 */
export function calcularRendimiento(
  polar: Polar,
  cogGrados: number,
  sogKts: number,
  twd: number,
  tws: number,
  posBarco?: { lat: number; lon: number } | null,
  activeWaypoint?: { lat: number; lon: number } | null,
): Rendimiento | null {
  if (sogKts <= 0 || tws < 1) return null;

  const twa = diferenciaRumboNormalizada(cogGrados, twd);
  const bspEsperado = consultarPolar(polar, tws, twa);
  const porcentajePolar = bspEsperado > 0.1 ? (sogKts / bspEsperado) * 100 : 0;

  const twaRad = (twa * Math.PI) / 180;
  const vmg = sogKts * Math.cos(twaRad);

  let vmc: number | undefined;
  let headingToWaypoint: number | undefined;
  let distanciaToWaypoint: number | undefined;

  if (
    posBarco?.lat != null && posBarco?.lon != null &&
    activeWaypoint?.lat != null && activeWaypoint?.lon != null
  ) {
    headingToWaypoint = calcularRumbo(
      posBarco.lat, posBarco.lon,
      activeWaypoint.lat, activeWaypoint.lon,
    );
    distanciaToWaypoint = distanciaMetros(
      posBarco.lat, posBarco.lon,
      activeWaypoint.lat, activeWaypoint.lon,
    );
    const diffRumboRad = ((cogGrados - headingToWaypoint) * Math.PI) / 180;
    vmc = sogKts * Math.cos(diffRumboRad);
  }

  return { twa, bspEsperado, bspActual: sogKts, porcentajePolar, vmg, vmc, headingToWaypoint, distanciaToWaypoint };
}
