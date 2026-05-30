// Configuración por defecto del mapa de spots.
// El centro y zoom inicial están calculados para mostrar toda la costa central
// desde Papudo (norte) hasta Algarrobo (sur).

export const MAPA_CONFIG = {
  centroInicial: {
    lat: -32.95, // Punto medio aproximado entre Papudo y Algarrobo
    lon: -71.55,
  },
  zoomInicial: 9,  // Vista regional que muestra los 6 spots
  zoomMin: 7,      // Lo suficientemente alejado para ver toda la zona central
  zoomMax: 16,     // Lo suficientemente cercano para ver detalles náuticos
};

export const TILES = {
  /** Tiles base topográficos de OpenStreetMap. */
  base: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    atribucion:
      '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  /** Overlay náutico de OpenSeaMap (boyas, marcas, profundidades).
   *  El servidor solo renderiza seamarks a partir de zoom 12; por debajo
   *  devuelve un PNG placeholder "Zoom Level Not Supported". */
  seamark: {
    url: "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png",
    atribucion:
      '&copy; <a href="https://openseamap.org">OpenSeaMap</a>',
    minZoom: 12,
  },
  /** Overlay de batimetría: Esri World Ocean Reference.
   *  Cobertura global con contornos de profundidad y toponimia submarina.
   *  Overlay transparente — va encima de OSM sin tapar el mapa base.
   *  Nota: Esri usa orden {z}/{y}/{x} en la ruta (no {x}/{y}). */
  bathymetry: {
    url: "https://services.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}",
    atribucion:
      '&copy; <a href="https://www.esri.com">Esri</a> World Ocean Reference',
  },
};

/** Plantillas de tiles para react-native-maps (UrlTile). */
export const TILES_NATIVO = {
  base: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  seamark: "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png",
};
