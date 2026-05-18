// Render del track GPS sobre Leaflet (web). Cargado lazy desde MapaTrack.web.tsx
// para no romper el SSR estático de Expo Router (leaflet accede a window
// en el import).

import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { TILES } from "@/features/map/data/config";
import type { PuntoAnalizado } from "../lib/analitica";

type Props = {
  puntos: PuntoAnalizado[];
};

function iconoCirculo(color: string): L.DivIcon {
  return L.divIcon({
    className: "navia-track-marker",
    html: `<div style="
      width: 14px;
      height: 14px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function calcularBounds(puntos: PuntoAnalizado[]): {
  centro: [number, number];
  bounds: L.LatLngBoundsExpression;
} {
  const lats = puntos.map((p) => p.lat);
  const lons = puntos.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  // Si el track es muy pequeño (degenerado), agregar padding mínimo
  const δLat = Math.max(maxLat - minLat, 0.001);
  const δLon = Math.max(maxLon - minLon, 0.001);
  return {
    centro: [(minLat + maxLat) / 2, (minLon + maxLon) / 2],
    bounds: [
      [minLat - δLat * 0.1, minLon - δLon * 0.1],
      [maxLat + δLat * 0.1, maxLon + δLon * 0.1],
    ],
  };
}

export default function MapaTrackInterno({ puntos }: Props) {
  const { centro, bounds } = calcularBounds(puntos);
  const positions: [number, number][] = puntos.map((p) => [p.lat, p.lon]);
  const inicio = puntos[0];
  const fin = puntos[puntos.length - 1];

  return (
    <MapContainer
      center={centro}
      bounds={bounds}
      boundsOptions={{ padding: [20, 20] }}
      style={{ height: 360, width: "100%", borderRadius: 12 }}
      scrollWheelZoom={true}
    >
      <TileLayer url={TILES.base.url} attribution={TILES.base.atribucion} />
      <TileLayer
        url={TILES.seamark.url}
        attribution={TILES.seamark.atribucion}
      />
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#0a4d7a",
          weight: 3,
          opacity: 0.85,
        }}
      />
      <Marker
        position={[inicio.lat, inicio.lon]}
        icon={iconoCirculo("#10b981")}
      >
        <Popup>Inicio</Popup>
      </Marker>
      <Marker
        position={[fin.lat, fin.lon]}
        icon={iconoCirculo("#dc2626")}
      >
        <Popup>Fin</Popup>
      </Marker>
    </MapContainer>
  );
}
