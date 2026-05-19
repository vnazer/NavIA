// Botón flotante para encender/apagar la capa de FLECHAS de viento por spot
// (CapaVientoMapa). Va debajo del toggle de streamlines (CapaViento / Prompt 10).

import { ArrowUpRight } from "lucide-react-native";

type Props = {
  activa: boolean;
  onToggle: () => void;
};

export function ControlCapaViento({ activa, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      title={activa ? "Apagar flechas de viento" : "Encender flechas de viento"}
      style={{
        position: "absolute",
        top: 64,
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
      <ArrowUpRight size={16} color={activa ? "white" : "#334155"} />
      <span>Flechas</span>
    </button>
  );
}
