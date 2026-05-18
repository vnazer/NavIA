// Card flotante en esquina inferior izquierda del mapa.
// Muestra siempre el nombre del spot seleccionado y su viento para la hora
// del slider. Es la solución a "no veo viento cuando hago zoom in al spot".
// Web-only: usa estilos inline porque está fuera del MapContainer de Leaflet.

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { beaufortDesdeNudos } from "@/lib/beaufort";
import { hexDesdeTailwind, colorTextoSobre } from "@/lib/colores";
import { formatearDireccion } from "@/lib/nautica";
import type { Spot } from "@/features/spots/types";
import type { PuntoPronostico } from "@/features/wind/types";

type Props = {
  spot: Spot;
  punto: PuntoPronostico | null;
  esAhora: boolean;
};

export function CardVientoSpot({ spot, punto, esAhora }: Props) {
  if (!punto) return null;

  const beaufort = beaufortDesdeNudos(punto.velocidadNudos);
  const bgColor = hexDesdeTailwind(beaufort.colorTw);
  const txtColor = colorTextoSobre(beaufort.colorTw);

  const labelTiempo = esAhora
    ? "Ahora"
    : format(new Date(punto.hora), "EEE HH:mm", { locale: es });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: 16,
        zIndex: 1000,
        backgroundColor: bgColor,
        color: txtColor,
        padding: "14px 18px",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.18)",
        minWidth: 200,
        maxWidth: 260,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          fontWeight: 600,
          letterSpacing: 0.4,
          opacity: 0.85,
        }}
      >
        {spot.nombre}
      </div>
      <div
        style={{
          fontSize: 12,
          fontWeight: 600,
          marginTop: 2,
          opacity: 0.9,
        }}
      >
        {labelTiempo}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 4,
          marginTop: 8,
        }}
      >
        <span style={{ fontSize: 36, fontWeight: 700, lineHeight: 1 }}>
          {Math.round(punto.velocidadNudos)}
        </span>
        <span style={{ fontSize: 14, opacity: 0.85 }}>kt</span>
      </div>
      <div style={{ fontSize: 13, marginTop: 4 }}>
        Rachas {Math.round(punto.rachasNudos)} kt
      </div>
      <div style={{ fontSize: 13, marginTop: 4, fontWeight: 600 }}>
        {formatearDireccion(punto.direccionGrados)}
      </div>
      <div
        style={{
          fontSize: 11,
          marginTop: 6,
          opacity: 0.85,
          fontStyle: "italic",
        }}
      >
        Fuerza {beaufort.fuerza} · {beaufort.nombre}
      </div>
    </div>
  );
}
