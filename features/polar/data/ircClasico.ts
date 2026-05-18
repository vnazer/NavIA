// Polar genérico para IRC Clásico ~40 pies (TCC aprox 0.85-0.95).
// Tipo S&S 39, Swan 38, Ohlson 38, etc. — barco de desplazamiento de los
// años 60-80 con velas convencionales y spi simétrico.
//
// IMPORTANTE: este es un polar GENÉRICO. Para usar en regata real, hay que
// reemplazarlo con datos del barco específico (ORCi VPP o mediciones GPS
// del propio barco). Para el barco IKE específico del usuario, ajustar con
// datos de regatas previas y reemplazar este archivo o crear uno custom.

import type { Polar } from "../types";

export const POLAR_IRC_CLASICO: Polar = {
  tws: [4, 6, 8, 10, 12, 14, 16, 18, 20],

  twa: [35, 40, 45, 52, 60, 75, 90, 110, 130, 150, 165, 180],

  bsp: [
    // 35°  40°  45°  52°  60°  75°  90°  110° 130° 150° 165° 180°
    [ 2.8, 3.3, 3.7, 4.1, 4.4, 4.7, 4.7, 4.5, 4.2, 3.5, 2.8, 2.2 ], // TWS 4
    [ 3.7, 4.3, 4.7, 5.2, 5.5, 5.8, 5.8, 5.7, 5.4, 4.7, 3.9, 3.1 ], // TWS 6
    [ 4.5, 5.1, 5.5, 5.9, 6.2, 6.5, 6.5, 6.4, 6.2, 5.6, 4.8, 3.9 ], // TWS 8
    [ 5.1, 5.7, 6.0, 6.4, 6.7, 7.0, 7.0, 7.0, 6.8, 6.3, 5.5, 4.5 ], // TWS 10
    [ 5.5, 6.0, 6.4, 6.7, 7.0, 7.3, 7.4, 7.4, 7.3, 6.9, 6.1, 5.1 ], // TWS 12
    [ 5.8, 6.3, 6.6, 6.9, 7.2, 7.5, 7.6, 7.7, 7.7, 7.4, 6.6, 5.6 ], // TWS 14
    [ 6.0, 6.4, 6.7, 7.0, 7.3, 7.6, 7.7, 7.9, 8.0, 7.8, 7.1, 6.0 ], // TWS 16
    [ 6.1, 6.5, 6.8, 7.1, 7.4, 7.7, 7.8, 8.0, 8.2, 8.1, 7.5, 6.4 ], // TWS 18
    [ 6.2, 6.6, 6.9, 7.2, 7.5, 7.8, 7.9, 8.1, 8.3, 8.3, 7.8, 6.8 ], // TWS 20
  ],
};
