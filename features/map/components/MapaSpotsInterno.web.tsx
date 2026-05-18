// Componente interno que carga leaflet. Se monta solo en cliente
// (cargado vía dynamic import desde MapaSpots.web.tsx) porque leaflet
// accede a `window` al evaluar sus módulos y rompería el SSR estático
// que hace Expo Router con `output: static`.

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { SPOTS } from "@/features/spots/data/spots";
import { MAPA_CONFIG, TILES } from "../data/config";
import { iconoSpot } from "./iconos";
import { PopupSpot } from "./PopupSpot";

export default function MapaSpotsInterno() {
  const spotIdActual = useSpotStore((s) => s.spotIdSeleccionado);

  return (
    <MapContainer
      center={[
        MAPA_CONFIG.centroInicial.lat,
        MAPA_CONFIG.centroInicial.lon,
      ]}
      zoom={MAPA_CONFIG.zoomInicial}
      minZoom={MAPA_CONFIG.zoomMin}
      maxZoom={MAPA_CONFIG.zoomMax}
      style={{ height: "100%", width: "100%", minHeight: 500 }}
      scrollWheelZoom={true}
    >
      {/* Capa base topográfica de OpenStreetMap */}
      <TileLayer
        url={TILES.base.url}
        attribution={TILES.base.atribucion}
      />

      {/* Capa náutica de OpenSeaMap (boyas, marcas, profundidades) */}
      <TileLayer
        url={TILES.seamark.url}
        attribution={TILES.seamark.atribucion}
      />

      {/* Marcadores de los 6 spots */}
      {SPOTS.map((spot) => {
        const esActual = spot.id === spotIdActual;
        return (
          <Marker
            key={spot.id}
            position={[spot.lat, spot.lon]}
            icon={iconoSpot(esActual)}
          >
            <Popup>
              <PopupSpot spot={spot} esActual={esActual} />
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
