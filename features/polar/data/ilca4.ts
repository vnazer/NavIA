// Polar aproximado del ILCA 4 (ex Laser 4.7).
// Datos derivados del ILCA 7 escalados por ratio de área de vela:
//   ILCA 4: 4.70 m² vs ILCA 7: 7.06 m² → factor ~0.67
// Ajustado para piloto juvenil 45-60 kg. El ILCA 4 tiene un rango
// operativo más reducido: pierde velocidad relativa en vientos >16 kts
// (exceso de lastre), pero su menor área lo hace más manejable en
// rachas fuertes y olas grandes.
// Para condiciones de ola sustancial, las velocidades reales en
// empopada pueden ser hasta 12% mayores (planeo temprano por menor peso).

import type { Polar } from "../types";

export const POLAR_ILCA4: Polar = {
  // Filas: TWS (intensidad de viento real en nudos)
  tws: [4, 6, 8, 10, 12, 14, 16, 18, 20],

  // Columnas: TWA (ángulo al viento real en grados)
  twa: [35, 40, 45, 52, 60, 75, 90, 110, 130, 150, 170],

  // Matriz BSP[fila_tws][columna_twa] en nudos
  bsp: [
    // 35°  40°  45°  52°  60°  75°  90°  110° 130° 150° 170°
    [ 1.5, 1.8, 2.0, 2.2, 2.3, 2.2, 2.0, 1.8, 1.6, 1.3, 1.1 ], // TWS 4
    [ 2.0, 2.4, 2.6, 2.8, 2.9, 2.8, 2.6, 2.4, 2.2, 1.9, 1.5 ], // TWS 6
    [ 2.4, 2.8, 3.1, 3.3, 3.4, 3.3, 3.2, 3.0, 2.7, 2.3, 1.9 ], // TWS 8
    [ 2.6, 3.0, 3.4, 3.6, 3.7, 3.7, 3.6, 3.4, 3.2, 2.8, 2.3 ], // TWS 10
    [ 2.7, 3.2, 3.5, 3.8, 3.9, 4.0, 3.9, 3.8, 3.6, 3.2, 2.7 ], // TWS 12
    [ 2.8, 3.2, 3.6, 3.8, 3.9, 4.1, 4.1, 4.0, 3.9, 3.5, 3.0 ], // TWS 14
    [ 2.8, 3.2, 3.5, 3.8, 3.9, 4.1, 4.2, 4.2, 4.2, 3.8, 3.3 ], // TWS 16
    [ 2.7, 3.1, 3.4, 3.7, 3.8, 4.0, 4.1, 4.2, 4.2, 4.0, 3.5 ], // TWS 18
    [ 2.6, 3.0, 3.3, 3.5, 3.7, 3.8, 3.9, 4.0, 4.1, 4.0, 3.6 ], // TWS 20
  ],
};
