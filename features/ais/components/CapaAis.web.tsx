// Capa de markers AIS. Bbox del viewport se ajusta en moveend.
// Bbox arranca null para evitar llamar map.getBounds() durante el render inicial
// (puede romper la hidratación si el map todavía no está inicializado).

import { useMap, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import { useAisStream } from "../hooks/useAisStream";
import { iconoBarcoAis } from "../iconoBarco";

type Bbox = [[number, number], [number, number]];

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
  const [bbox, setBbox] = useState<Bbox | null>(null);

  useEffect(() => {
    if (!visible) return;
    const actualizar = () => {
      const b = map.getBounds();
      setBbox([
        [b.getSouth(), b.getWest()],
        [b.getNorth(), b.getEast()],
      ]);
    };
    actualizar();
    map.on("moveend", actualizar);
    return () => {
      map.off("moveend", actualizar);
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
              </div>
            </Popup>
          </Marker>
        ))}
    </>
  );
}
