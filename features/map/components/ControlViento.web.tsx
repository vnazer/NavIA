// Toggle + slider de horas para la capa de viento estilo Windy.
// Web-only: usa estilos inline porque vive fuera del MapContainer.

import { Wind } from "lucide-react-native";

type Props = {
  visible: boolean;
  horasAdelante: number;
  onToggleVisible: () => void;
  onChangeHoras: (h: number) => void;
};

const PRESETS_HORAS = [0, 1, 3, 6, 12, 24];

export function ControlViento({
  visible,
  horasAdelante,
  onToggleVisible,
  onChangeHoras,
}: Props) {
  return (
    <>
      <button
        onClick={onToggleVisible}
        style={{
          position: "absolute",
          top: 16,
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
        <Wind size={16} color={visible ? "white" : "#334155"} />
        <span>Viento</span>
      </button>

      {visible && (
        <div
          style={{
            position: "absolute",
            top: 64,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            background: "rgba(255,255,255,0.95)",
            padding: "8px 12px",
            borderRadius: 8,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            display: "flex",
            gap: 4,
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, color: "#64748b", marginRight: 4 }}>
            +
          </span>
          {PRESETS_HORAS.map((h) => (
            <button
              key={h}
              onClick={() => onChangeHoras(h)}
              style={{
                padding: "4px 10px",
                border: "none",
                borderRadius: 4,
                background: h === horasAdelante ? "#0a4d7a" : "transparent",
                color: h === horasAdelante ? "white" : "#334155",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: h === horasAdelante ? 600 : 400,
              }}
            >
              {h === 0 ? "ahora" : `${h}h`}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
