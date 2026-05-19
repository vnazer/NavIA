// Toggle de laylines en el mapa. Web-only (HTML/inline styles).

import { GitBranch } from "lucide-react-native";

type Props = {
  visible: boolean;
  onToggle: () => void;
  /** Posición top en px (default 164 = bajo ToggleLluvia en 116+48) */
  top?: number;
};

export function ControlLaylines({ visible, onToggle, top = 164 }: Props) {
  return (
    <button
      onClick={onToggle}
      title={visible ? "Ocultar laylines" : "Mostrar laylines"}
      style={{
        position: "absolute",
        top,
        right: 16,
        zIndex: 1000,
        backgroundColor: visible ? "#16a34a" : "rgba(255,255,255,0.95)",
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
      <GitBranch size={16} color={visible ? "white" : "#334155"} />
      <span>Laylines</span>
    </button>
  );
}
