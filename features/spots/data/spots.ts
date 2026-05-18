// 6 spots de la costa central de Chile.
// Estas son las coordenadas INICIALES (punto de partida). El usuario puede
// corregir cada una en modo edición arrastrando el marcador, y las correcciones
// se guardan en AsyncStorage como overrides persistentes.

import type { Spot } from "../types";

export const SPOTS: Spot[] = [
  {
    id: "papudo",
    nombre: "Papudo",
    club: "Club de Yates de Papudo",
    lat: -32.5067,
    lon: -71.4392,
    descripcion:
      "Bahía abierta al SW. Punto de partida tradicional para regatas oceánicas al norte.",
  },
  {
    id: "quintero",
    nombre: "Quintero",
    club: "Club de Yates de Quintero",
    lat: -32.7755,
    lon: -71.5295,
    descripcion:
      "Bahía protegida del SW. Térmico fuerte en verano por la tarde.",
  },
  {
    id: "higuerillas",
    nombre: "Higuerillas",
    club: "Cofradía Náutica del Pacífico Austral",
    lat: -32.9275,
    lon: -71.5510,
    descripcion:
      "Concón. Spot base de la flota IRC central. Térmico SW marcado en verano.",
  },
  {
    id: "recreo",
    nombre: "Recreo",
    club: "Club de Yates de Chile",
    // Av. Escuadra Libertadora 1800. Coordenadas aproximadas — corregir en modo edición.
    lat: -33.0315,
    lon: -71.5985,
    descripcion:
      "Caleta Abarca, sector Recreo. Agua protegida ideal para clases. Spot base del usuario.",
  },
  {
    id: "valparaiso",
    nombre: "Valparaíso (Bahía)",
    club: "Club de Yates de Valparaíso",
    lat: -33.0339,
    lon: -71.6334,
    descripcion:
      "Bahía abierta al norte. Swell del SW frecuente. Tráfico mercante: precaución.",
  },
  {
    id: "algarrobo",
    nombre: "Algarrobo",
    club: "Club de Yates de Algarrobo",
    lat: -33.3650,
    lon: -71.6717,
    descripcion:
      "Bahía cerrada de aguas planas. Térmico SW limpio en verano. Sede tradicional de regata.",
  },
];

/** Spot por defecto si el usuario nunca eligió uno. */
export const SPOT_POR_DEFECTO_ID = "recreo";

/** Helper para obtener un spot por id. */
export function obtenerSpotPorId(id: string): Spot | undefined {
  return SPOTS.find((s) => s.id === id);
}
