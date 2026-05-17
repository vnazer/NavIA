// Escala Beaufort adaptada a nudos, con paleta de colores para UI.
// Referencia: https://www.metoffice.gov.uk/weather/guides/coast-and-sea/beaufort-scale

export type CategoriaBeaufort = {
  fuerza: number;               // 0-12
  nombre: string;               // Nombre náutico chileno
  rangoNudos: [number, number]; // [min, max] inclusive
  colorTw: string;              // Clase Tailwind bg-*
  textoTw: string;              // Clase Tailwind text-* para contraste
};

const CATEGORIAS: CategoriaBeaufort[] = [
  { fuerza: 0,  nombre: "Calma",          rangoNudos: [0, 0],     colorTw: "bg-slate-200",  textoTw: "text-slate-900" },
  { fuerza: 1,  nombre: "Ventolina",      rangoNudos: [1, 3],     colorTw: "bg-sky-200",    textoTw: "text-slate-900" },
  { fuerza: 2,  nombre: "Brisa muy débil",rangoNudos: [4, 6],     colorTw: "bg-sky-300",    textoTw: "text-slate-900" },
  { fuerza: 3,  nombre: "Brisa débil",    rangoNudos: [7, 10],    colorTw: "bg-emerald-400",textoTw: "text-slate-900" },
  { fuerza: 4,  nombre: "Brisa moderada", rangoNudos: [11, 16],   colorTw: "bg-emerald-500",textoTw: "text-white"     },
  { fuerza: 5,  nombre: "Brisa fresca",   rangoNudos: [17, 21],   colorTw: "bg-amber-400",  textoTw: "text-slate-900" },
  { fuerza: 6,  nombre: "Brisa fuerte",   rangoNudos: [22, 27],   colorTw: "bg-orange-500", textoTw: "text-white"     },
  { fuerza: 7,  nombre: "Viento fuerte",  rangoNudos: [28, 33],   colorTw: "bg-red-500",    textoTw: "text-white"     },
  { fuerza: 8,  nombre: "Viento duro",    rangoNudos: [34, 40],   colorTw: "bg-red-700",    textoTw: "text-white"     },
  { fuerza: 9,  nombre: "Muy duro",       rangoNudos: [41, 47],   colorTw: "bg-red-800",    textoTw: "text-white"     },
  { fuerza: 10, nombre: "Temporal",       rangoNudos: [48, 55],   colorTw: "bg-purple-700", textoTw: "text-white"     },
  { fuerza: 11, nombre: "Borrasca",       rangoNudos: [56, 63],   colorTw: "bg-purple-900", textoTw: "text-white"     },
  { fuerza: 12, nombre: "Huracán",        rangoNudos: [64, 999],  colorTw: "bg-black",      textoTw: "text-white"     },
];

/** Devuelve la categoría Beaufort correspondiente a una velocidad en nudos. */
export function beaufortDesdeNudos(nudos: number): CategoriaBeaufort {
  for (const cat of CATEGORIAS) {
    if (nudos >= cat.rangoNudos[0] && nudos <= cat.rangoNudos[1]) return cat;
  }
  return CATEGORIAS[CATEGORIAS.length - 1];
}
