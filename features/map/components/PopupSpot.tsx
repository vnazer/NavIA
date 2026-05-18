// Contenido HTML del popup que aparece al tappear un marcador de spot.
// Importante: este componente renderiza dentro de un L.Popup de Leaflet,
// que usa DOM nativo (NO React Native). Por eso usamos <div>, <h3>, etc.,
// y NO los primitivos de RN. Funciona solo en web.

import { useRouter } from "expo-router";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import type { PropsMarcador } from "../types";

export function PopupSpot({ spot, esActual }: PropsMarcador) {
  const router = useRouter();
  const setSpotId = useSpotStore((s) => s.setSpotId);

  const seleccionar = () => {
    setSpotId(spot.id);
    // Volver a la pantalla principal para ver el pronóstico actualizado
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
