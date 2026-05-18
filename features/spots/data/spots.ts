// 6 spots de la costa central de Chile.
// Coordenadas verificadas en Prompt 3.5 contra datos oficiales de la Armada
// de Chile (Directemar) y sitios oficiales de los clubes náuticos.
// Apuntan al MUELLE/CLUB, no al centro de la ciudad.
//
// Convención: lat/lon en grados decimales, sur y oeste negativos.
import type { Spot } from "../types";

export const SPOTS: Spot[] = [
  {
    id: "papudo",
    nombre: "Papudo",
    club: "Club de Yates de Papudo",
    // Av. Yrarrázaval 0201, sobre la playa este de la bahía
    lat: -32.5067,
    lon: -71.4392,
    notas:
      "Bahía abierta al SW. Punto de partida tradicional para regatas oceánicas al norte.",
  },
  {
    id: "quintero",
    nombre: "Quintero",
    club: "Club de Yates de Quintero",
    // Av. 21 de Mayo 1215, extremo norte del istmo de Quintero
    lat: -32.7755,
    lon: -71.5295,
    notas:
      "Bahía protegida del SW. Térmico fuerte en verano por la tarde.",
  },
  {
    id: "higuerillas",
    nombre: "Higuerillas",
    club: "Cofradía Náutica del Pacífico Austral",
    // Av. Borgoño s/n, Caleta Higuerillas (Concón sur)
    lat: -32.9275,
    lon: -71.5510,
    notas:
      "Concón. Spot base de la flota IRC central. Térmico SW marcado en verano.",
  },
  {
    id: "recreo",
    nombre: "Recreo",
    club: "Club de Yates de Chile",
    // OFICIAL Armada (C.P. (V.) Ord. 12600/150): lon 071°35'59"W = -71.5997°
    // Av. Escuadra Libertadora 1800, Caleta Abarca
    lat: -33.0314,
    lon: -71.5997,
    notas:
      "Caleta Abarca, sector Recreo. Agua protegida ideal para clases. Spot base del usuario.",
  },
  {
    id: "valparaiso",
    nombre: "Valparaíso (Bahía)",
    club: "Club de Yates de Valparaíso",
    // Sector Muelle Prat / Puerto de Valparaíso
    lat: -33.0339,
    lon: -71.6334,
    notas:
      "Bahía abierta al norte. Swell del SW frecuente. Tráfico mercante: precaución.",
  },
  {
    id: "algarrobo",
    nombre: "Algarrobo",
    club: "Club de Yates de Algarrobo",
    // OFICIAL Armada (C.P. RBO. Ord. 12.600/19): lon 071°40'18"W = -71.6717°
    // Av. Carlos Alessandri 2447, Rada de Algarrobo
    lat: -33.3650,
    lon: -71.6717,
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
