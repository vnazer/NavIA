// Visualización del polar como gráfico radial SVG.
// - Centro: barco
// - Eje radial: BSP (con círculos concéntricos cada 2 nudos)
// - Eje angular: TWA (0° arriba = viento por proa, 180° abajo = viento por popa)
// - Una curva cerrada por cada TWS de la tabla
// - La curva del TWS actual se destaca

import Svg, {
  Rect,
  Circle,
  Line,
  Polyline,
  G,
  Text as SvgText,
} from "react-native-svg";
import type { Polar } from "../types";
import { consultarPolar } from "../lib/interpolacion";

type Props = {
  polar: Polar;
  /** TWS actual destacado (resaltado en la visualización) */
  twsActual: number;
  /** Tamaño en píxeles (cuadrado) */
  size?: number;
};

// Colores para las curvas de TWS (más oscuro = más viento)
const COLORES_TWS = [
  "#bae6fd", // 4 kt
  "#7dd3fc", // 6 kt
  "#38bdf8", // 8 kt
  "#0ea5e9", // 10 kt
  "#0284c7", // 12 kt
  "#0369a1", // 14 kt
  "#075985", // 16 kt
  "#0c4a6e", // 18 kt
  "#082f49", // 20 kt
];

/**
 * Convierte (TWA, BSP) a coordenadas (x, y) en el SVG.
 * - TWA 0 → arriba (viento por proa)
 * - TWA 90 → derecha
 * - TWA 180 → abajo (viento por popa)
 */
function polarAXY(
  twa: number,
  bsp: number,
  centro: number,
  escala: number,
): [number, number] {
  // Rotar -90° para que 0° apunte arriba
  const rad = (twa - 90) * (Math.PI / 180);
  const x = centro + Math.cos(rad) * bsp * escala;
  const y = centro + Math.sin(rad) * bsp * escala;
  return [x, y];
}

export function VisualizadorPolar({
  polar,
  twsActual,
  size = 400,
}: Props) {
  const centro = size / 2;
  const padding = 40;
  const maxBsp = 9; // hasta 9 kt cabe holgadamente para ambos barcos
  const escala = (centro - padding) / maxBsp;

  // Anillos concéntricos cada 2 kt
  const anillos = [2, 4, 6, 8];

  // Ángulos de referencia para las radiales (0, 45, 90, 135, 180)
  const radiales = [0, 45, 90, 135, 180];

  // Generar puntos de cada curva TWS. Para mostrar simetría, espejamos
  // sobre el eje vertical (lado=-1 → babor, lado=1 → starboard).
  const generarCurvaSimetrica = (tws: number, lado: 1 | -1): string => {
    const puntos: string[] = [];
    for (let twa = 0; twa <= 180; twa += 5) {
      const bsp = consultarPolar(polar, tws, twa);
      const [x, y] = polarAXY(twa, bsp, centro, escala);
      const xFinal = lado === 1 ? x : 2 * centro - x;
      puntos.push(`${xFinal.toFixed(1)},${y.toFixed(1)}`);
    }
    return puntos.join(" ");
  };

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* Fondo */}
      <Rect width={size} height={size} fill="#f8fafc" rx={12} />

      {/* Anillos concéntricos (BSP) */}
      {anillos.map((bsp) => (
        <G key={`anillo-${bsp}`}>
          <Circle
            cx={centro}
            cy={centro}
            r={bsp * escala}
            fill="none"
            stroke="#cbd5e1"
            strokeWidth={1}
            strokeDasharray="3,3"
          />
          <SvgText
            x={centro + 4}
            y={centro - bsp * escala + 4}
            fontSize={10}
            fill="#94a3b8"
            fontFamily="system-ui"
          >
            {bsp} kt
          </SvgText>
        </G>
      ))}

      {/* Radiales (TWA de referencia) */}
      {radiales.map((twa) => {
        const [x, y] = polarAXY(twa, maxBsp + 0.5, centro, escala);
        const [xLabel, yLabel] = polarAXY(twa, maxBsp + 1.2, centro, escala);
        return (
          <G key={`radial-${twa}`}>
            <Line
              x1={centro}
              y1={centro}
              x2={x}
              y2={y}
              stroke="#cbd5e1"
              strokeWidth={1}
            />
            <SvgText
              x={xLabel}
              y={yLabel + 3.5}
              fontSize={11}
              fill="#475569"
              textAnchor="middle"
              fontFamily="system-ui"
              fontWeight="600"
            >
              {twa}°
            </SvgText>
            {/* Espejo en lado izquierdo */}
            {twa !== 0 && twa !== 180 && (
              <G key={`radial-mirror-${twa}`}>
                <Line
                  x1={centro}
                  y1={centro}
                  x2={2 * centro - x}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth={1}
                />
                <SvgText
                  x={2 * centro - xLabel}
                  y={yLabel + 3.5}
                  fontSize={11}
                  fill="#475569"
                  textAnchor="middle"
                  fontFamily="system-ui"
                  fontWeight="600"
                >
                  {twa}°
                </SvgText>
              </G>
            )}
          </G>
        );
      })}

      {/* Indicador "VIENTO" arriba */}
      <SvgText
        x={centro}
        y={20}
        fontSize={11}
        fill="#0a4d7a"
        textAnchor="middle"
        fontFamily="system-ui"
        fontWeight="700"
      >
        ↑ VIENTO
      </SvgText>

      {/* Curvas de cada TWS (excepto la actual, que va al final para destacar) */}
      {polar.tws.map((tws, i) => {
        const esActual = Math.abs(tws - twsActual) < 1;
        if (esActual) return null;
        const color = COLORES_TWS[i] ?? "#0a4d7a";
        return (
          <G key={`curva-${tws}`}>
            <Polyline
              points={generarCurvaSimetrica(tws, 1)}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              opacity={0.7}
            />
            <Polyline
              points={generarCurvaSimetrica(tws, -1)}
              fill="none"
              stroke={color}
              strokeWidth={1.5}
              opacity={0.7}
            />
          </G>
        );
      })}

      {/* Curva del TWS actual destacada en rojo */}
      <G>
        <Polyline
          points={generarCurvaSimetrica(twsActual, 1)}
          fill="none"
          stroke="#dc2626"
          strokeWidth={3}
        />
        <Polyline
          points={generarCurvaSimetrica(twsActual, -1)}
          fill="none"
          stroke="#dc2626"
          strokeWidth={3}
        />
      </G>

      {/* Leyenda */}
      <G transform={`translate(10, ${size - 80})`}>
        <Rect width={120} height={70} fill="white" rx={6} opacity={0.95} />
        <SvgText x={8} y={16} fontSize={10} fill="#334155" fontWeight="700">
          Intensidad viento
        </SvgText>
        <Line x1={8} y1={30} x2={28} y2={30} stroke="#dc2626" strokeWidth={3} />
        <SvgText x={34} y={33} fontSize={10} fill="#0f172a" fontWeight="600">
          {Math.round(twsActual)} kt (actual)
        </SvgText>
        <Line x1={8} y1={48} x2={28} y2={48} stroke="#0284c7" strokeWidth={1.5} opacity={0.7} />
        <SvgText x={34} y={51} fontSize={10} fill="#475569">
          Otras intensidades
        </SvgText>
      </G>
    </Svg>
  );
}
