// Tiles batimétricos de OpenSeaMap (GEBCO). Se monta dentro del MapContainer.

import { TileLayer } from "react-leaflet";
import { TILES } from "../data/config";

type Props = {
  visible: boolean;
};

export function CapaProfundidad({ visible }: Props) {
  if (!visible) return null;
  return (
    <TileLayer
      url={TILES.bathymetry.url}
      attribution={TILES.bathymetry.atribucion}
      opacity={0.6}
      maxZoom={14}
    />
  );
}
