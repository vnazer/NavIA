// Escala Beaufort adaptada a nudos, con paleta de colores para UI.
// Referencia: https://www.metoffice.gov.uk/weather/guides/coast-and-sea/beaufort-scale
//
// FIX en Prompt 3.1:
// - Validación explícita de input null/undefined/NaN/negativo (default a Calma)
// - Rangos continuos sin huecos (antes había gap entre 0 y 1 que caía a Huracán)
// - Función robusta para valores decimales que devuelve Open-Meteo

export type CategoriaBeaufort = {
  fuerza: number;
  nombre: string;
  rangoNudos: [number, number]; // [min, max) - inclusive min, exclusive max
  colorTw: string;
  textoTw: string;
};

const CATEGORIAS: CategoriaBeaufort[] = [
  { fuerza: 0,  nombre: "Calma",          rangoNudos: [0, 1],     colorTw: "bg-slate-200",   textoTw: "text-slate-900" },
  { fuerza: 1,  nombre: "Ventolina",      rangoNudos: [1, 4],     colorTw: "bg-sky-200",     textoTw: "text-slate-900" },
  { fuerza: 2,  nombre: "Brisa muy débil",rangoNudos: [4, 7],     colorTw: "bg-sky-300",     textoTw: "text-slate-900" },
  { fuerza: 3,  nombre: "Brisa débil",    rangoNudos: [7, 11],    colorTw: "bg-emerald-400", textoTw: "text-slate-900" },
  { fuerza: 4,  nombre: "Brisa moderada", rangoNudos: [11, 17],   colorTw: "bg-emerald-500", textoTw: "text-white" },
  { fuerza: 5,  nombre: "Brisa fresca",   rangoNudos: [17, 22],   colorTw: "bg-amber-400",   textoTw: "text-slate-900" },
  { fuerza: 6,  nombre: "Brisa fuerte",   rangoNudos: [22, 28],   colorTw: "bg-orange-500",  textoTw: "text-white" },
  { fuerza: 7,  nombre: "Viento fuerte",  rangoNudos: [28, 34],   colorTw: "bg-red-500",     textoTw: "text-white" },
  { fuerza: 8,  nombre: "Viento duro",    rangoNudos: [34, 41],   colorTw: "bg-red-700",     textoTw: "text-white" },
  { fuerza: 9,  nombre: "Muy duro",       rangoNudos: [41, 48],   colorTw: "bg-red-800",     textoTw: "text-white" },
  { fuerza: 10, nombre: "Temporal",       rangoNudos: [48, 56],   colorTw: "bg-purple-700",  textoTw: "text-white" },
  { fuerza: 11, nombre: "Borrasca",       rangoNudos: [56, 64],   colorTw: "bg-purple-900",  textoTw: "text-white" },
  { fuerza: 12, nombre: "Huracán",        rangoNudos: [64, 9999], colorTw: "bg-black",       textoTw: "text-white" },
];

/**
 * Devuelve la categoría Beaufort correspondiente a una velocidad en nudos.
 * Robusto ante input inválido (null, undefined, NaN, negativo) y valores
 * decimales. Los rangos son INCLUSIVE en el mínimo y EXCLUSIVE en el máximo,
 * excepto la última categoría (Huracán) que captura todo lo superior.
 */
export function beaufortDesdeNudos(nudos: number): CategoriaBeaufort {
  // Validación defensiva: cualquier input inválido → Calma
  if (typeof nudos !== "number" || isNaN(nudos) || nudos < 0) {
    return CATEGORIAS[0];
  }

  // Iterar en orden: el primer rango que matchea gana
  for (const cat of CATEGORIAS) {
    if (nudos >= cat.rangoNudos[0] && nudos < cat.rangoNudos[1]) {
      return cat;
    }
  }

  // Si supera todos los rangos (improbable salvo error en data): última categoría
  return CATEGORIAS[CATEGORIAS.length - 1];
}
