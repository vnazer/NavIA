// Generador de divIcons de Leaflet para boyas race-day.
// Cada tipo tiene su color + emoji característicos. Si la boya tiene label,
// se renderiza como una etiqueta blanca flotando arriba del marker.

import L from "leaflet";
import { BOYA_META, type TipoBoya } from "../types";

export function iconoBoya(tipo: TipoBoya, label?: string): L.DivIcon {
  const meta = BOYA_META[tipo];
  const labelHtml = label
    ? `<div style="
        position: absolute;
        top: -22px;
        left: 50%;
        transform: translateX(-50%);
        background: white;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        color: #0f172a;
      ">${escapeHtml(label)}</div>`
    : "";

  return L.divIcon({
    className: "navia-marker-boya",
    html: `
      <div style="position: relative;">
        ${labelHtml}
        <div style="
          background-color: ${meta.color};
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          line-height: 1;
        ">${meta.emoji}</div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
