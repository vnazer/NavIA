// RainViewer: API pública de radar meteorológico mundial.
// Gratis, sin API key. Da tiles slippy estándar (formato Leaflet).
// Doc: https://www.rainviewer.com/api.html
//
// El JSON de la API devuelve frames de los últimos ~2hr + nowcast 30min.

export type FrameRainViewer = {
  /** Ej: "/v2/radar/1700000000" */
  path: string;
  /** Unix timestamp en segundos */
  time: number;
};

export type DatosRainViewer = {
  /** Host de tiles, ej "https://tilecache.rainviewer.com" */
  host: string;
  /** Frames pasados (últimas ~2hr, intervalos de 10 min) */
  past: FrameRainViewer[];
  /** Frames de nowcast (próximos 30 min, intervalos de 10 min) */
  nowcast: FrameRainViewer[];
};

export async function fetchFramesRainViewer(): Promise<DatosRainViewer> {
  const res = await fetch(
    "https://api.rainviewer.com/public/weather-maps.json",
  );
  if (!res.ok) throw new Error("RainViewer API no responde");
  const data = await res.json();
  return {
    host: data.host,
    past: data.radar?.past ?? [],
    nowcast: data.radar?.nowcast ?? [],
  };
}

/**
 * Construye la URL de tile para un frame específico.
 * Formato RainViewer: {host}{path}/{size}/{z}/{x}/{y}/{color}/{options}.png
 * - size: 256 o 512
 * - color: 1 = clásico azul-verde-rojo (otros: 0/2/3/4...)
 * - options: smooth_snow → "1_1"
 */
export function urlTileRainViewer(host: string, framePath: string): string {
  return `${host}${framePath}/256/{z}/{x}/{y}/1/1_1.png`;
}
