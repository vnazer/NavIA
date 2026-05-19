// Botón flotante para toggle de la capa de lluvia radar.
// Se monta fuera del MapContainer como overlay HTML.

import { CloudRain } from "lucide-react-native";

type Props = {
  activo: boolean;
  onToggle: () => void;
};

export function ToggleLluvia({ activo, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      title={activo ? "Ocultar lluvia" : "Mostrar lluvia"}
      style={{
        position: "absolute",
        top: 160, // debajo de Viento (16), Flechas (64), Editar (112)
        right: 16,
        zIndex: 1000,
        backgroundColor: activo ? "#0a4d7a" : "rgba(255,255,255,0.95)",
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
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <CloudRain size={16} color={activo ? "white" : "#334155"} />
      <span>Lluvia</span>
    </button>
  );
}
