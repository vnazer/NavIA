// Polar aproximado del ILCA 7 (ex Laser Standard).
// Datos compilados de mediciones de flota internacional, piloto adulto
// 78-85 kg, aguas planas. Para condiciones de ola/swell sustancial,
// las velocidades reales en empopada son hasta 10% mayores (planeo).
// Para personalizar, el usuario puede agregar polar custom en el futuro.

import type { Polar } from "../types";

export const POLAR_ILCA7: Polar = {
  // Filas: TWS (intensidad de viento real en nudos)
  tws: [4, 6, 8, 10, 12, 14, 16, 18, 20],

  // Columnas: TWA (ángulo al viento real en grados)
  twa: [35, 40, 45, 52, 60, 75, 90, 110, 130, 150, 170],

  // Matriz BSP[fila_tws][columna_twa] en nudos
  bsp: [
    // 35°  40°  45°  52°  60°  75°  90°  110° 130° 150° 170°
    [ 2.1, 2.6, 2.9, 3.1, 3.2, 3.1, 2.9, 2.7, 2.4, 2.0, 1.6 ], // TWS 4
    [ 2.8, 3.4, 3.7, 4.0, 4.1, 4.0, 3.8, 3.6, 3.3, 2.8, 2.3 ], // TWS 6
    [ 3.4, 4.0, 4.3, 4.6, 4.7, 4.6, 4.5, 4.3, 4.0, 3.5, 2.9 ], // TWS 8
    [ 3.7, 4.3, 4.7, 5.0, 5.1, 5.1, 5.0, 4.9, 4.6, 4.1, 3.4 ], // TWS 10
    [ 3.9, 4.5, 4.9, 5.2, 5.3, 5.4, 5.3, 5.2, 5.0, 4.5, 3.8 ], // TWS 12
    [ 4.1, 4.6, 5.0, 5.3, 5.4, 5.5, 5.5, 5.5, 5.3, 4.9, 4.2 ], // TWS 14
    [ 4.2, 4.7, 5.1, 5.4, 5.5, 5.7, 5.7, 5.8, 5.7, 5.3, 4.7 ], // TWS 16
    [ 4.3, 4.8, 5.2, 5.5, 5.6, 5.8, 5.9, 6.0, 6.0, 5.7, 5.1 ], // TWS 18
    [ 4.3, 4.8, 5.2, 5.5, 5.6, 5.8, 6.0, 6.1, 6.2, 6.0, 5.4 ], // TWS 20
  ],
};
