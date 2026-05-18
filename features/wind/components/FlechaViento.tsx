// Componente que renderiza UNA flecha de viento sobre el mapa como L.divIcon.
// MODIFICADO EN PROMPT 3.1: ahora es tappable y muestra popup con datos completos.

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { beaufortDesdeNudos } from "@/lib/beaufort";
import { formatearDireccion } from "@/lib/nautica";

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

const COLORES: Record<string, string> = {
  "bg-slate-200":   "#e2e8f0",
  "bg-sky-200":     "#bae6fd",
  "bg-sky-300":     "#7dd3fc",
  "bg-emerald-400": "#34d399",
  "bg-emerald-500": "#10b981",
  "bg-amber-400":   "#fbbf24",
  "bg-orange-500":  "#f97316",
  "bg-red-500":     "#ef4444",
  "bg-red-700":     "#b91c1c",
  "bg-red-800":     "#991b1b",
  "bg-purple-700":  "#7e22ce",
  "bg-purple-900":  "#581c87",
  "bg-black":       "#000000",
};

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
  const color = COLORES[beaufort.colorTw] ?? "#0a4d7a";
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
