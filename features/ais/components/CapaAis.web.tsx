// Capa de markers AIS. Se monta dentro del MapContainer; el bbox se ajusta
// al viewport actual y dispara la suscripción al WebSocket con esos límites.

import { useMap, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { useAisStream } from "../hooks/useAisStream";
import { iconoBarcoAis } from "../iconoBarco";

type Props = {
  visible: boolean;
  onCountChange?: (n: number) => void;
};

const TIPOS_NOMBRES: Record<number, string> = {
  30: "Pesca",
  31: "Remolcador",
  32: "Remolcador",
  33: "Dragado",
  35: "Militar",
  36: "Velero",
  37: "Recreación",
  60: "Pasajeros",
  70: "Carga",
  80: "Tanker",
  90: "Otro",
};

export function CapaAis({ visible, onCountChange }: Props) {
  const map = useMap();
  const [bbox, setBbox] = useState<[[number, number], [number, number]]>(() => {
    const b = map.getBounds();
    return [
      [b.getSouth(), b.getWest()],
      [b.getNorth(), b.getEast()],
    ];
  });

  useEffect(() => {
    if (!visible) return;
    const actualizarBbox = () => {
      const b = map.getBounds();
      setBbox([
        [b.getSouth(), b.getWest()],
        [b.getNorth(), b.getEast()],
      ]);
    };
    actualizarBbox();
    map.on("moveend", actualizarBbox);
    return () => {
      map.off("moveend", actualizarBbox);
    };
  }, [visible, map]);

  const { barcos } = useAisStream({ activo: visible, bbox });

  useEffect(() => {
    onCountChange?.(barcos.length);
  }, [barcos.length, onCountChange]);

  if (!visible) return null;

  return (
    <>
      {barcos
        .filter((b) => b.lat !== 0 || b.lon !== 0)
        .map((b) => (
        <Marker
          key={b.mmsi}
          position={[b.lat, b.lon]}
          icon={iconoBarcoAis(b.cogGrados, b.tipoBarco)}
        >
          <Popup>
            <div style={{ minWidth: 180, fontSize: 12 }}>
              <strong style={{ fontSize: 14 }}>
                {b.nombre || `MMSI ${b.mmsi}`}
              </strong>
              <div>MMSI: {b.mmsi}</div>
              {b.tipoBarco != null && (
                <div>Tipo: {TIPOS_NOMBRES[b.tipoBarco] || b.tipoBarco}</div>
              )}
              {b.sogKts != null && <div>SOG: {b.sogKts.toFixed(1)} kts</div>}
              {b.cogGrados != null && (
                <div>COG: {b.cogGrados.toFixed(0)}°</div>
              )}
              {b.destino && <div>→ {b.destino}</div>}
              <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 4 }}>
                hace {Math.round((Date.now() - b.ultimaActualizacion) / 1000)}s
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
