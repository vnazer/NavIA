// Grid de puntos sobre el cual consultamos viento para la capa del mapa.
// El área cubre desde norte de Papudo hasta sur de Algarrobo, desde la costa
// hasta ~50 km mar adentro. Spacing aproximado: 12-25 km entre puntos.
// 5x5 = 25 puntos totales.

export type PuntoGrid = {
  lat: number;
  lon: number;
};

const LAT_NORTE = -32.4;   // Norte de Papudo
const LAT_SUR = -33.4;     // Sur de Algarrobo
const LON_OESTE = -71.95;  // Mar adentro
const LON_ESTE = -71.40;   // Costa

const FILAS = 5;
const COLUMNAS = 5;

/**
 * Genera el grid de puntos como un array plano de {lat, lon}.
 * El orden es: fila por fila, de norte a sur, de oeste a este.
 */
export function generarGrid(): PuntoGrid[] {
  const puntos: PuntoGrid[] = [];
  const stepLat = (LAT_SUR - LAT_NORTE) / (FILAS - 1);
  const stepLon = (LON_ESTE - LON_OESTE) / (COLUMNAS - 1);

  for (let i = 0; i < FILAS; i++) {
    for (let j = 0; j < COLUMNAS; j++) {
      puntos.push({
        lat: LAT_NORTE + i * stepLat,
        lon: LON_OESTE + j * stepLon,
      });
    }
  }

  return puntos;
}

export const GRID_PUNTOS = generarGrid();
