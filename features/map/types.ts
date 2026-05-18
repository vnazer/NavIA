// Tipos compartidos del feature de mapa.
// Por ahora simple, se expandirá cuando agreguemos capa de viento (Prompt 4).

import type { Spot } from "@/features/spots/types";

export type PropsMarcador = {
  spot: Spot;
  esActual: boolean;
};
