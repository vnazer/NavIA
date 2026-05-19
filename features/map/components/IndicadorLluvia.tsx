// Pequeño overlay HTML que muestra la hora del frame de RainViewer actual
// + label "pronóstico" si es nowcast. Se monta FUERA del MapContainer
// (sino leaflet lo come).

type Props = {
  timestampSeg: number;
  esNowcast: boolean;
};

export function IndicadorLluvia({ timestampSeg, esNowcast }: Props) {
  const hora = new Date(timestampSeg * 1000).toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: 16,
        zIndex: 1000,
        background: "rgba(255,255,255,0.95)",
        padding: "6px 10px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 600,
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        color: esNowcast ? "#dc2626" : "#0a4d7a",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {hora}
      {esNowcast && " · pronóstico"}
    </div>
  );
}
