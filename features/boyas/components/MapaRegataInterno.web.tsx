// Mini-mapa para la pantalla /regata: barco (triángulo orientado al COG)
// + boyas (con sus iconos por tipo). Cargado lazy desde MapaRegata.web
// para no romper SSR de Expo Router.

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { TILES } from "@/features/map/data/config";
import { iconoBoya } from "./iconoBoya";
import { BOYA_META, type Boya } from "../types";

type Props = {
  posBarco: { lat: number; lon: number; cog?: number } | null;
  boyas: Boya[];
  /** Fallback si no hay posBarco — típicamente el spot. */
  fallback: { lat: number; lon: number };
};

function iconoBarco(cog: number | undefined): L.DivIcon {
  const rotacion = cog ?? 0;
  return L.divIcon({
    className: "navia-barco-marker",
    html: `<div style="
      width: 20px;
      height: 20px;
      transform: rotate(${rotacion}deg);
    ">
      <svg viewBox="0 0 20 20" width="20" height="20">
        <polygon points="10,2 16,18 10,14 4,18" fill="#0a4d7a" stroke="white" stroke-width="1.5"/>
      </svg>
    </div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function calcularBounds(
  centro: { lat: number; lon: number },
  boyas: Boya[],
): L.LatLngBoundsExpression {
  const lats = [centro.lat, ...boyas.map((b) => b.lat)];
  const lons = [centro.lon, ...boyas.map((b) => b.lon)];
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const δLat = Math.max(maxLat - minLat, 0.005);
  const δLon = Math.max(maxLon - minLon, 0.005);
  return [
    [minLat - δLat * 0.15, minLon - δLon * 0.15],
    [maxLat + δLat * 0.15, maxLon + δLon * 0.15],
  ];
}

export default function MapaRegataInterno({
  posBarco,
  boyas,
  fallback,
}: Props) {
  const centro = posBarco ?? fallback;
  const bounds = calcularBounds(centro, boyas);

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [20, 20] }}
      style={{ height: 300, width: "100%", borderRadius: 12 }}
      scrollWheelZoom={true}
    >
      <TileLayer url={TILES.base.url} attribution={TILES.base.atribucion} />
      <TileLayer
        url={TILES.seamark.url}
        attribution={TILES.seamark.atribucion}
      />
      {posBarco && (
        <Marker
          position={[posBarco.lat, posBarco.lon]}
          icon={iconoBarco(posBarco.cog)}
        >
          <Popup>Tu posición</Popup>
        </Marker>
      )}
      {boyas.map((b) => {
        const meta = BOYA_META[b.tipo];
        return (
          <Marker
            key={b.id}
            position={[b.lat, b.lon]}
            icon={iconoBoya(b.tipo, b.label)}
          >
            <Popup>
              <strong>
                {meta.emoji} {meta.nombre}
                {b.label ? ` · ${b.label}` : ""}
              </strong>
              <br />
              <span style={{ fontFamily: "monospace", fontSize: 11 }}>
                {b.lat.toFixed(5)}, {b.lon.toFixed(5)}
              </span>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
