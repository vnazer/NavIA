// Popup que se abre al tappear un marker de spot en el mapa.
// MODIFICADO EN PROMPT 3.2: muestra datos de viento si el spot es el actual
// (y por ende tenemos su pronóstico cargado).

import { useRouter } from "expo-router";
import { beaufortDesdeNudos } from "@/lib/beaufort";
import { formatearDireccion } from "@/lib/nautica";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import type { Spot } from "@/features/spots/types";
import type { PuntoPronostico } from "@/features/wind/types";

type Props = {
  spot: Spot;
  esActual: boolean;
  /** Punto del pronóstico para la hora del slider. Solo se pasa para el spot actual. */
  punto?: PuntoPronostico | null;
};

export function PopupSpot({ spot, esActual, punto }: Props) {
  const router = useRouter();
  const setSpotId = useSpotStore((s) => s.setSpotId);
  const beaufort = punto ? beaufortDesdeNudos(punto.velocidadNudos) : null;

  const seleccionar = () => {
    setSpotId(spot.id);
    router.back();
  };

  return (
    <div style={{ minWidth: 220, fontFamily: "system-ui, sans-serif" }}>
      <h3 style={{
        margin: 0,
        fontWeight: 600,
        fontSize: 16,
        color: "#0f172a",
      }}>
        {spot.nombre}
      </h3>

      {spot.club && (
        <p style={{
          margin: "4px 0 0",
          fontSize: 12,
          color: "#64748b",
        }}>
          {spot.club}
        </p>
      )}

      {spot.notas && (
        <p style={{
          margin: "10px 0 0",
          fontSize: 12,
          color: "#334155",
          lineHeight: 1.5,
        }}>
          {spot.notas}
        </p>
      )}

      {/* Bloque de viento - solo si tenemos datos (spot actual) */}
      {esActual && punto && beaufort && (
        <div
          style={{
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "baseline",
            gap: 4,
          }}>
            <span style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#0f172a",
            }}>
              {Math.round(punto.velocidadNudos)}
            </span>
            <span style={{ fontSize: 12, color: "#64748b" }}>kt</span>
            <span style={{ fontSize: 11, color: "#64748b", marginLeft: 6 }}>
              · Rachas {Math.round(punto.rachasNudos)} kt
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#334155", marginTop: 2 }}>
            {formatearDireccion(punto.direccionGrados)}
          </div>
          <div style={{
            fontSize: 11,
            color: "#64748b",
            marginTop: 2,
            fontStyle: "italic",
          }}>
            Fuerza {beaufort.fuerza} · {beaufort.nombre}
          </div>
        </div>
      )}

      {esActual ? (
        <p style={{
          margin: "12px 0 0",
          fontSize: 11,
          color: "#0a4d7a",
          fontWeight: 600,
        }}>
          ✓ Spot actualmente seleccionado
        </p>
      ) : (
        <button
          onClick={seleccionar}
          style={{
            marginTop: 12,
            padding: "8px 14px",
            backgroundColor: "#0a4d7a",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            width: "100%",
          }}
        >
          Seleccionar este spot
        </button>
      )}
    </div>
  );
}
