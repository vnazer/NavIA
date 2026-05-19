// Toggle del tráfico AIS. Muestra contador de barcos visibles cuando está activo.

import { Ship } from "lucide-react-native";

type Props = {
  visible: boolean;
  cantidadBarcos: number;
  onToggle: () => void;
};

export function ControlAis({ visible, cantidadBarcos, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      title={visible ? "Ocultar AIS" : "Mostrar tráfico AIS"}
      style={{
        position: "absolute",
        top: 256, // debajo de Profundidad (208)
        right: 16,
        zIndex: 1000,
        backgroundColor: visible ? "#0a4d7a" : "rgba(255,255,255,0.95)",
        color: visible ? "white" : "#334155",
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
      <Ship size={16} color={visible ? "white" : "#334155"} />
      <span>
        AIS{visible && cantidadBarcos > 0 ? ` (${cantidadBarcos})` : ""}
      </span>
    </button>
  );
}
