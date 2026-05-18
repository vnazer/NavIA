// Íconos custom para los marcadores del mapa.
// Spot actualmente seleccionado: pin grande, color navy.
// Otros spots: pin chico, color gris-azulado.
// Usamos divIcon con HTML inline para evitar tener que servir SVG/PNG.

import L from "leaflet";

const HTML_PIN_ACTUAL = `
  <div style="
    background-color: #0a4d7a;
    width: 26px;
    height: 26px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.35);
  "></div>
`;

const HTML_PIN_NORMAL = `
  <div style="
    background-color: #64748b;
    width: 20px;
    height: 20px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 2px solid white;
    box-shadow: 0 1px 3px rgba(0,0,0,0.25);
  "></div>
`;

/**
 * Genera un ícono de Leaflet para marcador de spot.
 * @param esActual true si es el spot actualmente seleccionado por el usuario.
 */
export function iconoSpot(esActual: boolean): L.DivIcon {
  return L.divIcon({
    className: "navia-marcador-spot",
    html: esActual ? HTML_PIN_ACTUAL : HTML_PIN_NORMAL,
    iconSize: esActual ? [26, 26] : [20, 20],
    iconAnchor: esActual ? [13, 26] : [10, 20],
    popupAnchor: [0, esActual ? -26 : -20],
  });
}
