// Polar aproximado del ILCA 6 (ex Laser Radial).
// Datos derivados del ILCA 7 escalados por ratio de área de vela:
//   ILCA 6: 5.76 m² vs ILCA 7: 7.06 m² → factor ~0.82
// Ajustado para piloto liviano 65-75 kg. En popada con viento >14 kts
// el ILCA 6 planea antes que el ILCA 7 (menor lastre), lo que
// compensa parcialmente la menor área de vela.
// Para condiciones de ola sustancial, las velocidades reales en
// empopada pueden ser hasta 8% mayores (planeo).

import type { Polar } from "../types";

export const POLAR_ILCA6: Polar = {
  // Filas: TWS (intensidad de viento real en nudos)
  tws: [4, 6, 8, 10, 12, 14, 16, 18, 20],

  // Columnas: TWA (ángulo al viento real en grados)
  twa: [35, 40, 45, 52, 60, 75, 90, 110, 130, 150, 170],

  // Matriz BSP[fila_tws][columna_twa] en nudos
  bsp: [
    // 35°  40°  45°  52°  60°  75°  90°  110° 130° 150° 170°
    [ 1.8, 2.2, 2.5, 2.7, 2.8, 2.7, 2.5, 2.3, 2.1, 1.7, 1.4 ], // TWS 4
    [ 2.4, 2.9, 3.2, 3.5, 3.6, 3.5, 3.3, 3.1, 2.9, 2.4, 2.0 ], // TWS 6
    [ 3.0, 3.5, 3.8, 4.1, 4.2, 4.1, 4.0, 3.8, 3.5, 3.1, 2.5 ], // TWS 8
    [ 3.3, 3.8, 4.2, 4.5, 4.6, 4.6, 4.5, 4.4, 4.2, 3.7, 3.1 ], // TWS 10
    [ 3.5, 4.0, 4.4, 4.7, 4.8, 4.9, 4.9, 4.8, 4.6, 4.2, 3.5 ], // TWS 12
    [ 3.6, 4.1, 4.5, 4.8, 5.0, 5.1, 5.1, 5.1, 5.0, 4.6, 4.0 ], // TWS 14
    [ 3.7, 4.2, 4.6, 4.9, 5.1, 5.2, 5.3, 5.4, 5.3, 5.0, 4.4 ], // TWS 16
    [ 3.8, 4.3, 4.7, 5.0, 5.2, 5.4, 5.5, 5.6, 5.6, 5.4, 4.8 ], // TWS 18
    [ 3.8, 4.3, 4.7, 5.0, 5.2, 5.5, 5.6, 5.7, 5.8, 5.6, 5.1 ], // TWS 20
  ],
};
