// Card que muestra rendimiento en vivo: TWA, BSP actual vs polar, % eficiencia.

import { View, Text } from "react-native";
import { Gauge } from "lucide-react-native";
import type { Rendimiento } from "../types";

type Props = {
  rendimiento: Rendimiento | null;
  tws: number;
};

export function CardRendimiento({ rendimiento, tws }: Props) {
  return (
    <View className="gap-3 rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-sm">
      <View className="flex-row items-center gap-2">
        <Gauge size={18} color="#0a4d7a" />
        <Text className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          Rendimiento vs polar
        </Text>
      </View>

      {!rendimiento ? (
        <Text className="text-sm text-slate-500 dark:text-slate-400">
          Esperando GPS estable y barco en movimiento…
        </Text>
      ) : (
        <View className="gap-3">
          <View className="flex-row justify-between">
            <View>
              <Text className="text-xs uppercase text-slate-500 dark:text-slate-400">
                TWA estimado
              </Text>
              <Text className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {Math.round(rendimiento.twa)}°
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs uppercase text-slate-500 dark:text-slate-400">
                Eficiencia
              </Text>
              <Text
                className={`mt-1 text-3xl font-bold ${colorEficiencia(rendimiento.porcentajePolar)}`}
              >
                {Math.round(rendimiento.porcentajePolar)}%
              </Text>
            </View>
          </View>

          <View className="flex-row gap-2">
            <View className="flex-1 rounded-xl bg-mar-50 dark:bg-mar-900 p-3">
              <Text className="text-xs uppercase text-mar-700 dark:text-mar-100">Actual</Text>
              <Text className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {rendimiento.bspActual.toFixed(1)} kt
              </Text>
            </View>
            <View className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
              <Text className="text-xs uppercase text-slate-700 dark:text-slate-200">
                Polar @{Math.round(tws)}kt
              </Text>
              <Text className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                {rendimiento.bspEsperado.toFixed(1)} kt
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function colorEficiencia(pct: number): string {
  if (pct >= 95) return "text-green-600";
  if (pct >= 80) return "text-mar-700 dark:text-mar-100";
  if (pct >= 60) return "text-amber-600";
  return "text-red-600";
}
