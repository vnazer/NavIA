// Cálculo de rendimiento en vivo: TWA real desde COG + viento, comparación
// contra polar, VMG al viento y VMC al waypoint.

import type { Polar } from "@/features/polar/types";
import { consultarPolar } from "@/features/polar/lib/interpolacion";
import { diferenciaRumboNormalizada, calcularRumbo, distanciaMetros } from "./geo";
import type { Rendimiento } from "../types";

/**
 * Calcula el rendimiento comparando velocidad actual con polar.
 * Si tws muy bajo o sog 0, retorna null.
 * Opcionalmente calcula el VMC si se provee la boya/waypoint activa.
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
  const porcentajePolar =
    bspEsperado > 0.1 ? (sogKts / bspEsperado) * 100 : 0;

  // 1. VMG (Velocity Made Good) al viento
  // VMG = SOG * cos(TWA)
  const twaRad = (twa * Math.PI) / 180;
  const vmg = sogKts * Math.cos(twaRad);

  // 2. VMC (Velocity Made Good to Course/Waypoint)
  let vmc: number | undefined;
  let headingToWaypoint: number | undefined;
  let distanciaToWaypoint: number | undefined;

  if (posBarco?.lat != null && posBarco?.lon != null && activeWaypoint?.lat != null && activeWaypoint?.lon != null) {
    headingToWaypoint = calcularRumbo(
      posBarco.lat,
      posBarco.lon,
      activeWaypoint.lat,
      activeWaypoint.lon,
    );
    distanciaToWaypoint = distanciaMetros(
      posBarco.lat,
      posBarco.lon,
      activeWaypoint.lat,
      activeWaypoint.lon,
    );
    // VMC = SOG * cos(COG - Rumbo a Boya)
    const diffRumboRad = ((cogGrados - headingToWaypoint) * Math.PI) / 180;
    vmc = sogKts * Math.cos(diffRumboRad);
  }

  return {
    twa,
    bspEsperado,
    bspActual: sogKts,
    porcentajePolar,
    vmg,
    vmc,
    headingToWaypoint,
    distanciaToWaypoint,
  };
}
