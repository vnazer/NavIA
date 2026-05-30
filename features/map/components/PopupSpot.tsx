// Popup que se abre al tappear un marker de spot en el mapa.
// MODIFICADO EN PROMPT 3.6: muestra badge si el spot tiene coordenada personalizada
// y botón para resetear al default.

import { beaufortDesdeNudos } from "@/lib/beaufort";
import { formatearDireccion } from "@/lib/nautica";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import type { Spot } from "@/features/spots/types";
import type { PuntoPronostico } from "@/features/wind/types";

type Props = {
  spot: Spot;
  esActual: boolean;
  punto?: PuntoPronostico | null;
};

export function PopupSpot({ spot, esActual, punto }: Props) {
  const seleccionar = useSpotStore((s) => s.seleccionarSpot);
  const tieneOverride = useSpotStore((s) => s.tieneOverride(spot.id));
  const resetOverride = useSpotStore((s) => s.resetOverride);
  const beaufort = punto ? beaufortDesdeNudos(punto.velocidadNudos) : null;

  return (
    <div style={{ minWidth: 220, fontFamily: "system-ui, sans-serif" }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
        {spot.nombre}
      </div>
      {spot.club && (
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
          {spot.club}
        </div>
      )}
      {spot.descripcion && (
        <div style={{
          fontSize: 12,
          color: "#475569",
          marginTop: 8,
          lineHeight: 1.4,
        }}>
          {spot.descripcion}
        </div>
      )}

      {/* Bloque de viento (solo spot actual con datos) */}
      {esActual && punto && beaufort && (
        <div style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: "1px solid #e2e8f0",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#0f172a" }}>
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

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "8px 12px",
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px dashed #e2e8f0",
          }}>
            {punto.olaMt !== undefined && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#334155" }}>
                <span style={{ fontSize: 14 }}>🌊</span>
                <span><strong>{punto.olaMt.toFixed(1)}m</strong> olas</span>
              </div>
            )}
            {punto.temperaturaC !== undefined && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#334155" }}>
                <span style={{ fontSize: 14 }}>🌡️</span>
                <span><strong>{Math.round(punto.temperaturaC)}°C</strong> temp</span>
              </div>
            )}
            {punto.probLluvia !== undefined && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#334155", gridColumn: "span 2" }}>
                <span style={{ fontSize: 14 }}>🌧️</span>
                <span>Prob. lluvia: <strong>{punto.probLluvia}%</strong></span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Coordenadas + estado de personalización */}
      <div style={{
        marginTop: 10,
        paddingTop: 10,
        borderTop: "1px solid #e2e8f0",
        fontSize: 11,
        color: "#64748b",
        fontFamily: "monospace",
      }}>
        {spot.lat.toFixed(4)}, {spot.lon.toFixed(4)}
        {tieneOverride && (
          <span style={{
            marginLeft: 8,
            padding: "2px 6px",
            backgroundColor: "#fef3c7",
            color: "#92400e",
            borderRadius: 4,
            fontFamily: "system-ui",
            fontWeight: 600,
          }}>
            personalizada
          </span>
        )}
      </div>

      {/* Acciones */}
      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {esActual ? (
          <span style={{
            fontSize: 12,
            color: "#0a4d7a",
            fontWeight: 600,
            alignSelf: "center",
          }}>
            ✓ Seleccionado
          </span>
        ) : (
          <button
            onClick={() => seleccionar(spot.id)}
            style={{
              backgroundColor: "#0a4d7a",
              color: "white",
              border: "none",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Seleccionar
          </button>
        )}
        {tieneOverride && (
          <button
            onClick={() => resetOverride(spot.id)}
            style={{
              backgroundColor: "#f3f4f6",
              color: "#374151",
              border: "1px solid #d1d5db",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Resetear a default
          </button>
        )}
      </div>
    </div>
  );
}
