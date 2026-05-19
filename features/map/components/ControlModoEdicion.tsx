// Botón flotante en esquina superior derecha del mapa, debajo del toggle Viento.
// Al activarse, los marcadores de spots se vuelven arrastrables.

import { Edit3 } from "lucide-react-native";

type Props = {
  activo: boolean;
  onToggle: () => void;
};

export function ControlModoEdicion({ activo, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      title={
        activo
          ? "Salir del modo edición"
          : "Modo edición: arrastrá los marcadores"
      }
      style={{
        position: "absolute",
        top: 112, // Debajo de Viento (16) y Flechas (64)
        right: 16,
        zIndex: 1000,
        backgroundColor: activo ? "#dc2626" : "rgba(255, 255, 255, 0.95)",
        color: activo ? "white" : "#334155",
        border: "none",
        borderRadius: 8,
        padding: "10px 12px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
      }}
    >
      <Edit3 size={16} color={activo ? "white" : "#334155"} />
      <span>{activo ? "Editando" : "Editar"}</span>
    </button>
  );
}
