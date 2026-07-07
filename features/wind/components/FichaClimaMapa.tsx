// Componente que renderiza una ficha de clima (temperatura y prob. lluvia) sobre el mapa.
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

type Props = {
  lat: number;
  lon: number;
  temperaturaC: number;
  probLluvia?: number;
  hora: string;
};

function selectorEmoji(probLluvia: number): string {
  if (probLluvia > 50) return "🌧️";
  if (probLluvia > 20) return "☁️";
  return "☀️";
}

function generarHTML(temp: number, probLluvia: number): string {
  const emoji = selectorEmoji(probLluvia);
  return `
    <div style="
      background-color: rgba(245, 158, 11, 0.95);
      color: white;
      border: 1.5px solid #FFFFFF;
      border-radius: 999px;
      padding: 4px 8px;
      font-family: 'Inter-Bold', system-ui, sans-serif;
      font-size: 11px;
      font-weight: 700;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      white-space: nowrap;
      min-width: 52px;
    ">
      <span>${emoji}</span>
      <span>${Math.round(temp)}°C</span>
    </div>
  `;
}

export function FichaClimaMapa({ lat, lon, temperaturaC, probLluvia, hora }: Props) {
  const prob = probLluvia ?? 0;
  const emoji = selectorEmoji(prob);
  const html = generarHTML(temperaturaC, prob);

  const icon = L.divIcon({
    className: "navia-ficha-clima",
    html,
    iconSize: [60, 22],
    iconAnchor: [30, 11],
  });

  const horaFormateada = format(new Date(hora), "EEE HH:mm", { locale: es });

  return (
    <Marker position={[lat, lon]} icon={icon}>
      <Popup>
        <div style={{ minWidth: 150, fontFamily: "system-ui, sans-serif" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            Clima previsto
          </div>
          <div style={{ marginTop: 2, fontSize: 12, color: "#d97706", fontWeight: 700 }}>
            {horaFormateada}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
              {emoji} {Math.round(temperaturaC)}°C
            </span>
          </div>
          <div style={{ fontSize: 11, color: "#334155", marginTop: 4 }}>
            Probabilidad lluvia: <strong>{prob}%</strong>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
