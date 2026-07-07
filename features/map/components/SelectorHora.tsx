// Slider temporal flotante que se sobrepone al mapa.
// Permite al usuario recorrer las próximas 48 horas para ver cómo evoluciona el viento.
// Web-only: usa <input type="range">.

import { format } from "date-fns";
import { es } from "date-fns/locale/es";

type Props = {
  /** Índice actual: 0 = ahora, 47 = +47h */
  indice: number;
  /** Máximo del slider (cantidad de puntos del pronóstico - 1) */
  maximo: number;
  /** Timestamp ISO del punto actualmente seleccionado */
  timestampActual?: string;
  onCambio: (nuevoIndice: number) => void;
};

export function SelectorHora({
  indice,
  maximo,
  timestampActual,
  onCambio,
}: Props) {
  const label = timestampActual
    ? format(new Date(timestampActual), "EEE HH:mm", { locale: es })
    : `+${indice}h`;

  const labelAhora = indice === 0 ? "Ahora" : label;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        padding: "12px 20px",
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        minWidth: 320,
        maxWidth: "90vw",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          fontSize: 13,
          color: "#334155",
          fontWeight: 600,
        }}
      >
        <span>Viento previsto</span>
        <span style={{ color: "#0a4d7a" }}>{labelAhora}</span>
      </div>
      <input
        type="range"
        min={0}
        max={maximo}
        value={indice}
        onChange={(e) => onCambio(Number(e.target.value))}
        style={{
          width: "100%",
          accentColor: "#0a4d7a",
          cursor: "pointer",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 10,
          color: "#94a3b8",
          marginTop: 2,
        }}
      >
        <span>Ahora</span>
        <span>+{maximo}h</span>
      </div>
    </div>
  );
}
