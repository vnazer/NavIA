// TileLayer de RainViewer. DEBE ir dentro del MapContainer porque react-leaflet
// registra este componente via context al map. El indicador con la hora del
// frame está en IndicadorLluvia.tsx (se monta fuera del map).

import { TileLayer } from "react-leaflet";
import { urlTileRainViewer } from "../data/rainviewer";
import type { FrameRainViewer } from "../data/rainviewer";

type Props = {
  host: string;
  frame: FrameRainViewer;
};

export function CapaLluviaTiles({ host, frame }: Props) {
  return (
    <TileLayer
      key={frame.path}
      url={urlTileRainViewer(host, frame.path)}
      opacity={0.7}
      attribution='Radar &copy; <a href="https://rainviewer.com">RainViewer</a>'
      maxNativeZoom={12}
      maxZoom={18}
    />
  );
}
