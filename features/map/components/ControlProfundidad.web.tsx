// Toggle de la capa de batimetría. Web-only por usar HTML/inline styles.

import { Waves } from "lucide-react-native";

type Props = {
  visible: boolean;
  onToggle: () => void;
};

export function ControlProfundidad({ visible, onToggle }: Props) {
  return (
    <button
      onClick={onToggle}
      title={visible ? "Ocultar profundidad" : "Mostrar profundidad"}
      style={{
        position: "absolute",
        top: 208, // debajo de Lluvia (160)
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
      <Waves size={16} color={visible ? "white" : "#334155"} />
      <span>Profundidad</span>
    </button>
  );
}
