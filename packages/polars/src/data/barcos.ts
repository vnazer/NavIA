// Registro de barcos disponibles con su polar asociado.

import type { Barco, RigId, CondicionMar } from "@navia/shared-types";
import { POLAR_ILCA4 } from "./ilca4";
import { POLAR_ILCA6 } from "./ilca6";
import { POLAR_ILCA7 } from "./ilca7";

/** Mapa de rig → polar. */
export const POLARES: Record<RigId, import("@navia/shared-types").Polar> = {
  ilca4: POLAR_ILCA4,
  ilca6: POLAR_ILCA6,
  ilca7: POLAR_ILCA7,
};

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
    id: "ilca6",
    nombre: "ILCA 6",
    clase: "Monotipo olímpico (Radial)",
    descripcion:
      "Ex Laser Radial. Vela única 5.76 m². Para piloto 65-75 kg.",
    polar: POLAR_ILCA6,
  },
  {
    id: "ilca4",
    nombre: "ILCA 4",
    clase: "Monotipo juvenil (4.7)",
    descripcion:
      "Ex Laser 4.7. Vela única 4.70 m². Para piloto 45-60 kg.",
    polar: POLAR_ILCA4,
  },
];

export const BARCO_DEFAULT_ID: RigId = "ilca7";

/** Factor de ajuste de BSP según condición del mar. */
export const FACTOR_CONDICION: Record<CondicionMar, number> = {
  plana: 1.0,
  media: 0.95,
  ola: 0.85,
};
