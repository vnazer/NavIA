// Botón flotante en esquina superior derecha del mapa para encender/apagar
// la capa de flechas de viento. Útil para ver cartas náuticas sin obstrucción.

import { Wind } from "lucide-react-native";

type Props = {
  activa: boolean;
  onToggle: () => void;
};

export function ControlCapaViento({ activa, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      title={activa ? "Apagar capa de viento" : "Encender capa de viento"}
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        zIndex: 1000,
        backgroundColor: activa ? "#0a4d7a" : "rgba(255, 255, 255, 0.95)",
        color: activa ? "white" : "#334155",
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
      <Wind size={16} color={activa ? "white" : "#334155"} />
      <span>Viento</span>
    </button>
  );
}
