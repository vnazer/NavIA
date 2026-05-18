// Catálogo de barcos disponibles con sus polares asociados.
// El usuario selecciona uno desde la app y se persiste en AsyncStorage.

import type { Barco } from "../types";
import { POLAR_ILCA7 } from "./ilca7";
import { POLAR_IRC_CLASICO } from "./ircClasico";

export const BARCOS: Barco[] = [
  {
    id: "ilca7",
    nombre: "ILCA 7",
    clase: "Monotipo olímpico",
    descripcion:
      "Ex Laser Standard. Vela única 7.06 m². Para piloto 78-85 kg en aguas planas.",
    polar: POLAR_ILCA7,
  },
  {
    id: "irc-clasico",
    nombre: "IRC Clásico (genérico)",
    clase: "IRC ~40 pies, casco clásico",
    descripcion:
      "Polar genérico tipo S&S/Swan/Ohlson de los 70-80. Reemplazar con datos del barco real para uso de regata.",
    polar: POLAR_IRC_CLASICO,
  },
];

export const BARCO_DEFAULT_ID = "ilca7";
