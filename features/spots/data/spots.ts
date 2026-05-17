// Spots de la costa central de Chile relevantes para regatas de vela.
// Coordenadas aproximadas en bahía/zona de regateo, no en muelle de zarpe.
// Orden: norte a sur.
import type { Spot } from "../types";

export const SPOTS: Spot[] = [
  {
    id: "papudo",
    nombre: "Papudo",
    club: "Club de Yates Papudo",
    lat: -32.5083,
    lon: -71.4500,
    notas: "Bahía abierta. Térmico SW fuerte de tarde en verano.",
  },
  {
    id: "quintero",
    nombre: "Quintero",
    club: "Club de Yates Quintero",
    lat: -32.7833,
    lon: -71.5333,
    notas: "Bahía protegida del SW. Cuidado con tráfico de buques.",
  },
  {
    id: "higuerillas",
    nombre: "Higuerillas",
    club: "Cofradía Náutica de Higuerillas (Concón)",
    lat: -32.9333,
    lon: -71.5333,
    notas: "Sede frecuente de regatas IRC. Virazón fuerte de tarde.",
  },
  {
    id: "recreo",
    nombre: "Recreo",
    club: "Club de Yates de Chile",
    lat: -33.0214,
    lon: -71.5500,
    notas: "Agua protegida ideal para clases. Spot base del usuario.",
  },
  {
    id: "valparaiso",
    nombre: "Valparaíso (Bahía)",
    club: "Club de Yates de Valparaíso",
    lat: -33.0322,
    lon: -71.6293,
    notas: "Bahía abierta al norte. Swell del SW frecuente.",
  },
  {
    id: "algarrobo",
    nombre: "Algarrobo",
    club: "Cofradía Náutica del Pacífico Austral",
    lat: -33.3667,
    lon: -71.6667,
    notas: "Cuna de la vela chilena. Térmico SW estable en verano.",
  },
];

/** Spot por defecto si el usuario nunca eligió uno. */
export const SPOT_POR_DEFECTO_ID = "recreo";

/** Helper para obtener un spot por id. */
export function obtenerSpotPorId(id: string): Spot | undefined {
  return SPOTS.find((s) => s.id === id);
}
