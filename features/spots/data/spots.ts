// 6 spots de la costa central de Chile.
// Coordenadas apuntan a la ubicación del CLUB NÁUTICO / MUELLE, no al centro
// de la ciudad. Validadas contra Google Maps en Prompt 3.4.
import type { Spot } from "../types";

export const SPOTS: Spot[] = [
  {
    id: "papudo",
    nombre: "Papudo",
    club: "Club de Yates de Papudo",
    lat: -32.5106,
    lon: -71.4467,
    notas:
      "Bahía abierta al SW. Punto de partida tradicional para regatas oceánicas al norte.",
  },
  {
    id: "quintero",
    nombre: "Quintero",
    club: "Club de Yates de Quintero",
    lat: -32.7833,
    lon: -71.5333,
    notas:
      "Bahía protegida del SW. Térmico fuerte en verano por la tarde.",
  },
  {
    id: "higuerillas",
    nombre: "Higuerillas",
    club: "Cofradía Náutica del Pacífico Austral",
    lat: -32.9347,
    lon: -71.5483,
    notas:
      "Concón. Spot base de la flota IRC central. Térmico SW marcado en verano.",
  },
  {
    id: "recreo",
    nombre: "Recreo",
    club: "Club de Yates de Chile",
    lat: -33.0294,
    lon: -71.5664,
    notas:
      "Caleta Abarca, sector Recreo. Agua protegida ideal para clases. Spot base del usuario.",
  },
  {
    id: "valparaiso",
    nombre: "Valparaíso (Bahía)",
    club: "Club de Yates de Valparaíso",
    lat: -33.0322,
    lon: -71.6321,
    notas:
      "Bahía abierta al norte. Swell del SW frecuente. Tráfico mercante: precaución.",
  },
  {
    id: "algarrobo",
    nombre: "Algarrobo",
    club: "Club de Yates de Algarrobo",
    lat: -33.3680,
    lon: -71.6680,
    notas:
      "Bahía cerrada de aguas planas. Térmico SW limpio en verano. Sede tradicional de regata.",
  },
];

/** Spot por defecto si el usuario nunca eligió uno. */
export const SPOT_POR_DEFECTO_ID = "recreo";

/** Helper para obtener un spot por id. */
export function obtenerSpotPorId(id: string): Spot | undefined {
  return SPOTS.find((s) => s.id === id);
}
