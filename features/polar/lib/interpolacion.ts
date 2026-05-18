// Interpolación bilineal sobre una tabla polar.
// Dado un (tws, twa) cualquiera, encuentra los 4 puntos más cercanos en la
// matriz y hace interpolación lineal en ambas dimensiones.

import type { Polar, BSP, TWS, TWA } from "../types";

/**
 * Encuentra los índices del rango que contiene un valor dado en un array ordenado.
 * Si el valor está fuera del rango, clampea a los extremos.
 * Devuelve [indiceInferior, indiceSuperior, fraccion] donde:
 * - fraccion = 0 → valor coincide con indiceInferior
 * - fraccion = 1 → valor coincide con indiceSuperior
 */
function encontrarRango(
  arr: number[],
  valor: number,
): { iInf: number; iSup: number; frac: number } {
  if (valor <= arr[0]) {
    return { iInf: 0, iSup: 0, frac: 0 };
  }
  if (valor >= arr[arr.length - 1]) {
    const idx = arr.length - 1;
    return { iInf: idx, iSup: idx, frac: 0 };
  }
  for (let i = 0; i < arr.length - 1; i++) {
    if (valor >= arr[i] && valor <= arr[i + 1]) {
      const frac = (valor - arr[i]) / (arr[i + 1] - arr[i]);
      return { iInf: i, iSup: i + 1, frac };
    }
  }
  // Defensive (no debería llegar acá)
  return { iInf: 0, iSup: 0, frac: 0 };
}

/**
 * Consulta la velocidad esperada (BSP) para un (TWS, TWA) dado.
 * Si los valores caen entre dos celdas, usa interpolación bilineal.
 * Si están fuera del rango del polar, usa el valor más cercano (clamp).
 */
export function consultarPolar(polar: Polar, tws: TWS, twa: TWA): BSP {
  // Trabajar con valor absoluto del TWA (simetría port-starboard)
  const twaAbs = Math.abs(twa);

  const filaTws = encontrarRango(polar.tws, tws);
  const colTwa = encontrarRango(polar.twa, twaAbs);

  // Los 4 puntos cuadrantes
  const v00 = polar.bsp[filaTws.iInf][colTwa.iInf];
  const v01 = polar.bsp[filaTws.iInf][colTwa.iSup];
  const v10 = polar.bsp[filaTws.iSup][colTwa.iInf];
  const v11 = polar.bsp[filaTws.iSup][colTwa.iSup];

  // Interpolar en TWA primero (cada fila TWS)
  const vInf = v00 + (v01 - v00) * colTwa.frac;
  const vSup = v10 + (v11 - v10) * colTwa.frac;

  // Interpolar en TWS
  return vInf + (vSup - vInf) * filaTws.frac;
}
