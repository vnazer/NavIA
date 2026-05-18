// Componente que renderiza UNA flecha de viento sobre el mapa como L.divIcon.
// Recibe velocidad y dirección, genera el SVG con rotación y color Beaufort.
// IMPORTANTE: la flecha apunta DESDE donde viene el viento (convención náutica).
// Viento de 180° (sur) → flecha apunta al sur (abajo en el mapa).

import { Marker } from "react-leaflet";
import L from "leaflet";
import { beaufortDesdeNudos } from "@/lib/beaufort";

type Props = {
  lat: number;
  lon: number;
  velocidadNudos: number;
  direccionGrados: number;
};

/**
 * Mapea velocidad a longitud visual de la flecha en píxeles.
 * Rango: 10 px (calma) a 36 px (viento fuerte).
 */
function largoFlecha(nudos: number): number {
  const minPx = 10;
  const maxPx = 36;
  const escalaMax = 30; // nudos a partir de los cuales se satura el largo
  return minPx + Math.min(nudos / escalaMax, 1) * (maxPx - minPx);
}

/**
 * Mapeo manual de clases Tailwind a hex porque NativeWind no resuelve
 * clases en tiempo de runtime (solo en build).
 */
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
  // SVG default: flecha vertical apuntando al norte (arriba).
  // Origen de rotación: centro del SVG.
  // Cabeza de flecha en (0, -largo/2), cola en (0, largo/2).
  const w = 16;
  const h = largoPx;
  const mid = w / 2;
  return `
    <div style="
      width: ${w}px;
      height: ${h}px;
      transform: rotate(${rotacionGrados}deg);
      transform-origin: center center;
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
}: Props) {
  const beaufort = beaufortDesdeNudos(velocidadNudos);
  const color = COLORES[beaufort.colorTw] ?? "#0a4d7a";
  const largo = largoFlecha(velocidadNudos);
  const html = generarSVG(largo, direccionGrados, color);

  const icon = L.divIcon({
    className: "navia-flecha-viento",
    html,
    iconSize: [16, largo],
    iconAnchor: [8, largo / 2], // Anclar al centro de la flecha
  });

  return <Marker position={[lat, lon]} icon={icon} interactive={false} />;
}
