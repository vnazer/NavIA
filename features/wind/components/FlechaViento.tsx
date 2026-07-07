// Componente que renderiza UNA flecha de viento sobre el mapa como L.divIcon.
// MODIFICADO EN PROMPT 3.1: ahora es tappable y muestra popup con datos completos.

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { beaufortDesdeNudos } from "@/lib/beaufort";
import { formatearDireccion } from "@/lib/nautica";
import { hexDesdeTailwind } from "@/lib/colores";

type Props = {
  lat: number;
  lon: number;
  velocidadNudos: number;
  direccionGrados: number;
  rachasNudos: number;
  hora: string; // ISO timestamp
};

function largoFlecha(nudos: number): number {
  const minPx = 10;
  const maxPx = 36;
  const escalaMax = 30;
  return minPx + Math.min(nudos / escalaMax, 1) * (maxPx - minPx);
}

function generarSVG(
  largoPx: number,
  rotacionGrados: number,
  colorHex: string,
): string {
  const w = 16;
  const h = largoPx;
  const mid = w / 2;
  return `
    <div style="
      width: ${w}px;
      height: ${h}px;
      transform: rotate(${rotacionGrados}deg);
      transform-origin: center center;
      cursor: pointer;
    ">
      <svg
        width="${w}"
        height="${h}"
        viewBox="0 0 ${w} ${h}"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="${mid}" y1="${h - 2}"
          x2="${mid}" y2="6"
          stroke="${colorHex}"
          stroke-width="2.5"
          stroke-linecap="round"
        />
        <polyline
          points="${mid - 4},10 ${mid},2 ${mid + 4},10"
          fill="none"
          stroke="${colorHex}"
          stroke-width="2.5"
          stroke-linejoin="round"
          stroke-linecap="round"
        />
      </svg>
    </div>
  `;
}

export function FlechaViento({
  lat,
  lon,
  velocidadNudos,
  direccionGrados,
  rachasNudos,
  hora,
}: Props) {
  const beaufort = beaufortDesdeNudos(velocidadNudos);
  const color = hexDesdeTailwind(beaufort.colorTw);
  const largo = largoFlecha(velocidadNudos);
  const html = generarSVG(largo, direccionGrados, color);

  const icon = L.divIcon({
    className: "navia-flecha-viento",
    html,
    iconSize: [16, largo],
    iconAnchor: [8, largo / 2],
  });

  const horaFormateada = format(new Date(hora), "EEE HH:mm", { locale: es });

  return (
    <Marker position={[lat, lon]} icon={icon}>
      <Popup>
        <div style={{ minWidth: 180, fontFamily: "system-ui, sans-serif" }}>
          <div style={{
            fontSize: 11,
            color: "#64748b",
            textTransform: "uppercase",
            fontWeight: 600,
            letterSpacing: 0.5,
          }}>
            Viento previsto
          </div>
          <div style={{
            marginTop: 4,
            fontSize: 13,
            color: "#0a4d7a",
            fontWeight: 600,
          }}>
            {horaFormateada}
          </div>
          <div style={{
            display: "flex",
            alignItems: "baseline",
            gap: 4,
            marginTop: 8,
          }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: "#0f172a" }}>
              {Math.round(velocidadNudos)}
            </span>
            <span style={{ fontSize: 14, color: "#64748b" }}>kt</span>
          </div>
          <div style={{ fontSize: 12, color: "#334155", marginTop: 2 }}>
            Rachas {Math.round(rachasNudos)} kt
          </div>
          <div style={{ fontSize: 12, color: "#334155", marginTop: 4 }}>
            {formatearDireccion(direccionGrados)}
          </div>
          <div style={{
            fontSize: 11,
            color: "#64748b",
            marginTop: 6,
            fontStyle: "italic",
          }}>
            Fuerza {beaufort.fuerza} · {beaufort.nombre}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
