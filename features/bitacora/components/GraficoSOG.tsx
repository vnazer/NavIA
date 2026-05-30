// Gráfico SVG simple de SOG vs tiempo para una sesión.
// Línea sólida azul = SOG real
// Línea punteada gris = BSP teórico esperado del polar

import { View, Text } from "react-native";
import Svg, {
  Rect,
  Line,
  Polyline,
  G,
  Text as SvgText,
} from "react-native-svg";
import type { PuntoAnalizado } from "../lib/analitica";

type Props = {
  puntos: PuntoAnalizado[];
  width?: number;
  height?: number;
};

export function GraficoSOG({ puntos, width = 600, height = 220 }: Props) {
  if (puntos.length < 2) {
    return (
      <View style={{ borderRadius: 12, backgroundColor: "#f1f5f9", padding: 16 }}>
        <Text style={{ fontSize: 14, color: "#475569" }}>
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
      <Svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        <Rect
          x={padding.left}
          y={padding.top}
          width={plotW}
          height={plotH}
          fill="#f8fafc"
          stroke="#e2e8f0"
        />

        {ticksY.map((s) => (
          <G key={`y-${s}`}>
            <Line
              x1={padding.left}
              x2={padding.left + plotW}
              y1={yFromSog(s)}
              y2={yFromSog(s)}
              stroke="#e2e8f0"
              strokeDasharray="2,3"
            />
            <SvgText
              x={padding.left - 6}
              y={yFromSog(s) + 4}
              fontSize={10}
              fill="#64748b"
              textAnchor="end"
              fontFamily="system-ui"
            >
              {s}
            </SvgText>
          </G>
        ))}

        {ticksX.map((t) => (
          <G key={`x-${t}`}>
            <Line
              x1={xFromT(t)}
              x2={xFromT(t)}
              y1={padding.top + plotH}
              y2={padding.top + plotH + 4}
              stroke="#94a3b8"
            />
            <SvgText
              x={xFromT(t)}
              y={padding.top + plotH + 18}
              fontSize={10}
              fill="#64748b"
              textAnchor="middle"
              fontFamily="system-ui"
            >
              {formatearTiempo(t)}
            </SvgText>
          </G>
        ))}

        <SvgText
          x={padding.left - 28}
          y={padding.top - 4}
          fontSize={10}
          fill="#475569"
          fontFamily="system-ui"
          fontWeight="600"
        >
          kt
        </SvgText>

        <Polyline
          points={puntosTeorico}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={1.5}
          strokeDasharray="4,3"
        />

        <Polyline
          points={puntosReal}
          fill="none"
          stroke="#0a4d7a"
          strokeWidth={2}
        />

        <G transform={`translate(${padding.left + 8}, ${padding.top + 8})`}>
          <Line x1={0} y1={0} x2={18} y2={0} stroke="#0a4d7a" strokeWidth={2} />
          <SvgText
            x={22}
            y={3}
            fontSize={10}
            fill="#0f172a"
            fontWeight="600"
            fontFamily="system-ui"
          >
            SOG real
          </SvgText>
          <Line
            x1={0}
            y1={16}
            x2={18}
            y2={16}
            stroke="#94a3b8"
            strokeWidth={1.5}
            strokeDasharray="4,3"
          />
          <SvgText
            x={22}
            y={19}
            fontSize={10}
            fill="#475569"
            fontFamily="system-ui"
          >
            BSP teórico (polar)
          </SvgText>
        </G>
      </Svg>
    </View>
  );
}
