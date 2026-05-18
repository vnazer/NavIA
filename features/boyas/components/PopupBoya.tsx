// Popup que se muestra al click en un marker de boya en el mapa.
// Usa HTML nativo (no React Native) porque vive dentro de react-leaflet Popup.

import { BOYA_META, type Boya } from "../types";
import { useBoyasStore } from "../store/useBoyasStore";

type Props = {
  boya: Boya;
};

export function PopupBoya({ boya }: Props) {
  const eliminar = useBoyasStore((s) => s.eliminarBoya);
  const meta = BOYA_META[boya.tipo];

  const handleEliminar = () => {
    if (
      typeof window !== "undefined" &&
      window.confirm("¿Eliminar esta boya?")
    ) {
      eliminar(boya.id);
    }
  };

  return (
    <div style={{ minWidth: 180, fontFamily: "system-ui, sans-serif" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <span style={{ fontSize: 18 }}>{meta.emoji}</span>
        <strong style={{ color: meta.color }}>{meta.nombre}</strong>
      </div>
      {boya.label && (
        <div style={{ fontSize: 13, marginBottom: 4 }}>
          <strong>Label:</strong> {boya.label}
        </div>
      )}
      <div
        style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: "#64748b",
          marginBottom: 8,
        }}
      >
        {boya.lat.toFixed(5)}, {boya.lon.toFixed(5)}
      </div>
      <button
        onClick={handleEliminar}
        style={{
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: 4,
          padding: "6px 10px",
          fontSize: 12,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Eliminar
      </button>
    </div>
  );
}
