// Panel de shifts de viento: muestra el giro acumulado desde el inicio
// de la sesión y la historia de shifts detectados en el pronóstico.
// Componente nativo (funciona en iOS, Android y Web).

import { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { TrendingUp, TrendingDown, Minus } from "lucide-react-native";
import type { Pronostico } from "@/features/wind/types";
import {
  detectarShifts,
  shiftDesdeSesion,
  twdBaseline,
  type TendenciaViento,
} from "../lib/windShifts";

type Props = {
  pronostico: Pronostico | null;
  sesionFechaInicio: number | null;
  twdActual: number | null;
};

function etiquetaTendencia(t: TendenciaViento): string {
  if (t === "veer") return "Veer ↻";
  if (t === "back") return "Back ↺";
  return "Estable";
}

function colorTendencia(t: TendenciaViento): string {
  if (t === "veer") return "#16a34a";
  if (t === "back") return "#dc2626";
  return "#64748b";
}

function IconoTendencia({
  t,
  size = 14,
}: {
  t: TendenciaViento;
  size?: number;
}) {
  const color = colorTendencia(t);
  if (t === "veer") return <TrendingUp size={size} color={color} />;
  if (t === "back") return <TrendingDown size={size} color={color} />;
  return <Minus size={size} color={color} />;
}

export function PanelShifts({ pronostico, sesionFechaInicio, twdActual }: Props) {
  const baseline = useMemo(() => {
    if (!pronostico || sesionFechaInicio == null) return null;
    return twdBaseline(pronostico.puntos, sesionFechaInicio);
  }, [pronostico, sesionFechaInicio]);

  const shiftActualInfo = useMemo(() => {
    if (baseline == null || twdActual == null) return null;
    return shiftDesdeSesion(baseline, twdActual);
  }, [baseline, twdActual]);

  const shifts = useMemo(() => {
    if (!pronostico) return [];
    const pron = pronostico.puntos.map((p) => ({
      ts: new Date(p.hora).getTime(),
      twd: p.direccionGrados,
    }));
    return detectarShifts(pron, 5).slice(-5).reverse(); // últimos 5, más reciente primero
  }, [pronostico]);

  const tacticaFavorecida = useMemo(() => {
    if (!shiftActualInfo) return null;
    if (shiftActualInfo.tendencia === "estable") return null;
    // Veer favorece estribor (la gira hacia estribor, amplía el ángulo de ceñida)
    return shiftActualInfo.tendencia === "veer" ? "Estribor" : "Babor";
  }, [shiftActualInfo]);

  return (
    <View className="rounded-xl bg-white p-4 shadow-sm">
      {/* Header */}
      <View className="mb-3 flex-row items-center gap-2">
        <Text className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Shifts de Viento
        </Text>
      </View>

      {/* Shift actual vs baseline */}
      {shiftActualInfo ? (
        <View className="mb-3 rounded-lg bg-slate-50 p-3">
          <Text className="mb-1 text-xs uppercase text-slate-500">
            Cambio desde inicio de sesión
          </Text>
          <View className="flex-row items-center gap-2">
            <IconoTendencia t={shiftActualInfo.tendencia} size={18} />
            <Text
              style={{ color: colorTendencia(shiftActualInfo.tendencia) }}
              className="text-xl font-bold"
            >
              {shiftActualInfo.deltaGrados > 0 ? "+" : ""}
              {Math.round(shiftActualInfo.deltaGrados)}°
            </Text>
            <Text
              style={{ color: colorTendencia(shiftActualInfo.tendencia) }}
              className="text-sm font-semibold"
            >
              {etiquetaTendencia(shiftActualInfo.tendencia)}
            </Text>
          </View>
          {tacticaFavorecida && (
            <Text className="mt-1 text-xs text-slate-600">
              Favorece{" "}
              <Text className="font-semibold text-mar-700">
                {tacticaFavorecida}
              </Text>
            </Text>
          )}
          {baseline != null && twdActual != null && (
            <Text className="mt-1 text-xs text-slate-400">
              Base {Math.round(baseline)}° → Ahora {Math.round(twdActual)}°
            </Text>
          )}
        </View>
      ) : (
        <Text className="mb-3 text-xs text-slate-400">
          Iniciá una sesión para ver el shift vs baseline.
        </Text>
      )}

      {/* Historia de shifts */}
      {shifts.length > 0 && (
        <>
          <Text className="mb-2 text-xs font-semibold uppercase text-slate-500">
            Historia pronóstico
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {shifts.map((s, i) => (
                <View
                  key={i}
                  className="items-center rounded-lg bg-slate-50 px-3 py-2"
                >
                  <IconoTendencia t={s.tendencia} size={12} />
                  <Text
                    style={{ color: colorTendencia(s.tendencia) }}
                    className="mt-0.5 text-sm font-bold"
                  >
                    {s.deltaGrados > 0 ? "+" : ""}
                    {Math.round(s.deltaGrados)}°
                  </Text>
                  <Text className="text-xs text-slate-400">
                    {new Date(s.ts).toLocaleTimeString("es-CL", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
}
