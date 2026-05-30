export type ModoCapa = "viento" | "olas" | "clima" | "off";

type Props = {
  modo: ModoCapa;
  onChange: (modo: ModoCapa) => void;
};

export function ControlCapaViento({ modo, onChange }: Props) {
  const opciones: { id: ModoCapa; label: string; icon: string }[] = [
    { id: "viento", label: "Viento", icon: "💨" },
    { id: "olas", label: "Olas", icon: "🌊" },
    { id: "clima", label: "Clima", icon: "🌡️" },
    { id: "off", label: "Off", icon: "❌" },
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 64,
        right: 16,
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 8,
        padding: 4,
        display: "flex",
        gap: 2,
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {opciones.map((opt) => {
        const activa = opt.id === modo;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            title={`Visualización: ${opt.label}`}
            style={{
              backgroundColor: activa ? "#0a4d7a" : "transparent",
              color: activa ? "white" : "#334155",
              border: "none",
              borderRadius: 6,
              padding: "6px 10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.15s ease",
            }}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
