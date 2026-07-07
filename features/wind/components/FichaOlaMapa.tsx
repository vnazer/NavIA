// Componente que renderiza una ficha de ola (altura en m) sobre el mapa.
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

type Props = {
  lat: number;
  lon: number;
  olaMt?: number;
  hora: string;
};

function generarHTML(ola: number): string {
  return `
    <div style="
      background-color: rgba(14, 165, 233, 0.95);
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
      min-width: 44px;
    ">
      <span>🌊</span>
      <span>${ola.toFixed(1)}m</span>
    </div>
  `;
}

export function FichaOlaMapa({ lat, lon, olaMt, hora }: Props) {
  const ola = olaMt ?? 0;
  const html = generarHTML(ola);

  const icon = L.divIcon({
    className: "navia-ficha-ola",
    html,
    iconSize: [52, 22],
    iconAnchor: [26, 11],
  });

  const horaFormateada = format(new Date(hora), "EEE HH:mm", { locale: es });

  return (
    <Marker position={[lat, lon]} icon={icon}>
      <Popup>
        <div style={{ minWidth: 150, fontFamily: "system-ui, sans-serif" }}>
          <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
            Oleaje previsto
          </div>
          <div style={{ marginTop: 2, fontSize: 12, color: "#0ea5e9", fontWeight: 700 }}>
            {horaFormateada}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 6 }}>
            <span style={{ fontSize: 24, fontWeight: 700, color: "#0f172a" }}>
              {ola.toFixed(1)}
            </span>
            <span style={{ fontSize: 13, color: "#64748b" }}>metros</span>
          </div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
            Altura de ola significativa
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
