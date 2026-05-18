// Gráfico SVG simple de SOG vs tiempo para una sesión.
// Línea sólida azul = SOG real
// Línea punteada gris = BSP teórico esperado del polar

import { View, Text } from "react-native";
import type { PuntoAnalizado } from "../lib/analitica";

type Props = {
  puntos: PuntoAnalizado[];
  width?: number;
  height?: number;
};

export function GraficoSOG({ puntos, width = 600, height = 220 }: Props) {
  if (puntos.length < 2) {
    return (
      <View className="rounded-xl bg-slate-100 p-4">
        <Text className="text-sm text-slate-600">
          Track demasiado corto para graficar.
        </Text>
      </View>
    );
  }

  const padding = { top: 16, right: 16, bottom: 30, left: 36 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const tMax = Math.max(puntos[puntos.length - 1].offsetSeg, 1);
  const sogMax = Math.max(
    ...puntos.map((p) => p.sogKts),
    ...puntos.map((p) => p.bspTeorico),
    1,
  );
  const sogTope = Math.max(Math.ceil(sogMax / 2) * 2, 2);

  const xFromT = (t: number) => padding.left + (t / tMax) * plotW;
  const yFromSog = (s: number) =>
    padding.top + plotH - (s / sogTope) * plotH;

  const puntosReal = puntos
    .map(
      (p) =>
        `${xFromT(p.offsetSeg).toFixed(1)},${yFromSog(p.sogKts).toFixed(1)}`,
    )
    .join(" ");

  const puntosTeorico = puntos
    .map(
      (p) =>
        `${xFromT(p.offsetSeg).toFixed(1)},${yFromSog(p.bspTeorico).toFixed(1)}`,
    )
    .join(" ");

  const ticksY: number[] = [];
  for (let s = 0; s <= sogTope; s += 2) ticksY.push(s);

  const numTicksX = 5;
  const ticksX: number[] = [];
  for (let i = 0; i <= numTicksX; i++) ticksX.push((tMax / numTicksX) * i);

  const formatearTiempo = (seg: number): string => {
    const m = Math.floor(seg / 60);
    const s = Math.round(seg % 60);
    if (m === 0) return `${s}s`;
    return `${m}m`;
  };

  return (
    <View>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x={padding.left}
          y={padding.top}
          width={plotW}
          height={plotH}
          fill="#f8fafc"
          stroke="#e2e8f0"
        />

        {ticksY.map((s) => (
          <g key={`y-${s}`}>
            <line
              x1={padding.left}
              x2={padding.left + plotW}
              y1={yFromSog(s)}
              y2={yFromSog(s)}
              stroke="#e2e8f0"
              strokeDasharray="2,3"
            />
            <text
              x={padding.left - 6}
              y={yFromSog(s) + 4}
              fontSize="10"
              fill="#64748b"
              textAnchor="end"
              fontFamily="system-ui"
            >
              {s}
            </text>
          </g>
        ))}

        {ticksX.map((t) => (
          <g key={`x-${t}`}>
            <line
              x1={xFromT(t)}
              x2={xFromT(t)}
              y1={padding.top + plotH}
              y2={padding.top + plotH + 4}
              stroke="#94a3b8"
            />
            <text
              x={xFromT(t)}
              y={padding.top + plotH + 18}
              fontSize="10"
              fill="#64748b"
              textAnchor="middle"
              fontFamily="system-ui"
            >
              {formatearTiempo(t)}
            </text>
          </g>
        ))}

        <text
          x={padding.left - 28}
          y={padding.top - 4}
          fontSize="10"
          fill="#475569"
          fontFamily="system-ui"
          fontWeight="600"
        >
          kt
        </text>

        <polyline
          points={puntosTeorico}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeDasharray="4,3"
        />

        <polyline
          points={puntosReal}
          fill="none"
          stroke="#0a4d7a"
          strokeWidth="2"
        />

        <g transform={`translate(${padding.left + 8}, ${padding.top + 8})`}>
          <line x1="0" y1="0" x2="18" y2="0" stroke="#0a4d7a" strokeWidth="2" />
          <text
            x="22"
            y="3"
            fontSize="10"
            fill="#0f172a"
            fontWeight="600"
            fontFamily="system-ui"
          >
            SOG real
          </text>
          <line
            x1="0"
            y1="16"
            x2="18"
            y2="16"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4,3"
          />
          <text
            x="22"
            y="19"
            fontSize="10"
            fill="#475569"
            fontFamily="system-ui"
          >
            BSP teórico (polar)
          </text>
        </g>
      </svg>
    </View>
  );
}
