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
  /** Capa de batimetría (profundidades) de OpenSeaMap basada en GEBCO.
   *  Cobertura global, resolución ~15 arcsec. Si el endpoint no responde,
   *  alternativas: EMODNet WMS (Europa) o servir GEBCO local con gdal2tiles. */
  bathymetry: {
    url: "https://tiles.openseamap.org/depth/{z}/{x}/{y}.png",
    atribucion:
      '&copy; <a href="https://openseamap.org">OpenSeaMap</a> Bathymetry (GEBCO)',
  },
};
