// Helpers únicos para elegir el "viento actual" del pronóstico horario.
// Antes cada pantalla usaba su propio criterio (regata/táctica: la siguiente
// hora >= ahora; inicio: ahora − 1 h) y el useMemo no avanzaba con el reloj.
// Acá: la hora MÁS CERCANA a ahora, recalculada periódicamente.

import { useEffect, useMemo, useState } from "react";
import type { Pronostico, PuntoPronostico } from "../types";

/** Índice del punto cuya hora está más cerca de `ahoraMs`. -1 si no hay puntos. */
export function indicePuntoMasCercano(
  puntos: PuntoPronostico[],
  ahoraMs: number = Date.now(),
): number {
  let mejor = -1;
  let mejorDif = Infinity;
  for (let i = 0; i < puntos.length; i++) {
    const dif = Math.abs(new Date(puntos[i].hora).getTime() - ahoraMs);
    if (dif < mejorDif) {
      mejorDif = dif;
      mejor = i;
    }
  }
  return mejor;
}

/** Punto del pronóstico más cercano a `ahoraMs` (o null si no hay datos). */
export function puntoMasCercano(
  puntos: PuntoPronostico[],
  ahoraMs: number = Date.now(),
): PuntoPronostico | null {
  const i = indicePuntoMasCercano(puntos, ahoraMs);
  return i === -1 ? null : puntos[i];
}

/** Timestamp que se actualiza cada `intervaloMs` (por defecto 1 min). */
export function useAhora(intervaloMs: number = 60_000): number {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), intervaloMs);
    return () => clearInterval(id);
  }, [intervaloMs]);
  return ahora;
}

/**
 * Índice del punto "ahora" del pronóstico, recalculado cada minuto.
 * Devuelve null mientras no hay pronóstico.
 */
export function useIndiceAhora(pronostico: Pronostico | null): number | null {
  const ahora = useAhora();
  return useMemo(() => {
    if (!pronostico || pronostico.puntos.length === 0) return null;
    return indicePuntoMasCercano(pronostico.puntos, ahora);
  }, [pronostico, ahora]);
}

/**
 * Viento "actual" (hora más cercana a ahora) del pronóstico.
 * La referencia del objeto solo cambia cuando cambia la hora elegida.
 */
export function useVientoActual(pronostico: Pronostico | null): PuntoPronostico | null {
  const indice = useIndiceAhora(pronostico);
  return useMemo(
    () => (pronostico && indice != null ? pronostico.puntos[indice] ?? null : null),
    [pronostico, indice],
  );
}

/**
 * Racha alineada con la misma hora que el viento medio.
 *
 * Open-Meteo entrega `wind_gusts_10m` como el MÁXIMO DE LA HORA PRECEDENTE
 * (ventana (H−1, H]), mientras `wind_speed_10m` es el valor instantáneo a la
 * hora H. Cuando el viento viene cayendo, la racha "de las 20:00" es en
 * realidad la de 19–20 h con viento más fuerte (así aparecía "13 kt, rachas
 * 34"). Para que la racha corresponda a la misma hora usamos la ventana
 * centrada en H: promedio de la racha de (H−1, H] y la de (H, H+1].
 * Nunca menor que el viento medio de esa hora.
 */
export function rachaAlineada(
  rachas: (number | null | undefined)[],
  velocidades: (number | null | undefined)[],
  i: number,
): number {
  const actual = rachas[i];
  const siguiente = rachas[i + 1];
  const media = velocidades[i] ?? 0;
  let racha: number;
  if (actual != null && siguiente != null) racha = (actual + siguiente) / 2;
  else racha = actual ?? siguiente ?? media;
  return Math.max(racha, media);
}
