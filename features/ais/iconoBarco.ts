// Icono SVG de barco para markers AIS. Rota según COG y colorea según tipo.
// Tipos según AIS spec ITU-R M.1371-5.

import L from "leaflet";

function colorPorTipo(tipo?: number): string {
  if (tipo == null) return "#64748b";
  if (tipo >= 30 && tipo <= 39) return "#0ea5e9"; // pesca
  if (tipo >= 60 && tipo <= 69) return "#16a34a"; // pasajeros
  if (tipo >= 70 && tipo <= 79) return "#dc2626"; // carga
  if (tipo >= 80 && tipo <= 89) return "#7c2d12"; // tanker
  if (tipo === 51 || tipo === 53 || tipo === 55) return "#9333ea"; // SAR / militar
  return "#64748b";
}

export function iconoBarcoAis(cogGrados?: number, tipo?: number): L.DivIcon {
  const color = colorPorTipo(tipo);
  const rotacion = cogGrados ?? 0;
  return L.divIcon({
    className: "navia-marker-ais",
    html: `
      <div style="
        transform: rotate(${rotacion}deg);
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 16 16">
          <polygon points="8,0 14,16 8,12 2,16" fill="${color}" stroke="white" stroke-width="1.5" />
        </svg>
      </div>
    `,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}
