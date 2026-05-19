// Card de performance: muestra el cálculo de polar para el viento de la
// hora seleccionada en la pantalla principal.
// Renderiza: barco actual + ángulos y velocidades óptimas en ceñida y empopada.

import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { TrendingUp, Wind } from "lucide-react-native";
import { useMemo } from "react";
import { useBarcoStore } from "../store/useBarcoStore";
import { calcularOptimos } from "../lib/calculos";
import { SelectorBarco } from "./SelectorBarco";
import type { PuntoPronostico } from "@/features/wind/types";

type Props = {
  punto: PuntoPronostico | null;
};

export function CardPerformance({ punto }: Props) {
  const barco = useBarcoStore((s) => s.getBarcoActual());

  const optimos = useMemo(() => {
    if (!punto) return null;
    return calcularOptimos(barco.polar, punto.velocidadNudos);
  }, [punto?.velocidadNudos, barco.polar]);

  if (!punto) return null;

  return (
    <View
      className="gap-3 rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-sm"
      style={{ zIndex: 10 }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <TrendingUp size={18} color="#0a4d7a" />
          <Text className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
            Performance esperada
          </Text>
        </View>
        <SelectorBarco />
      </View>

      {optimos && (
        <View className="gap-3">
          {/* Ceñida */}
          <View className="flex-row items-center justify-between rounded-xl bg-mar-50 dark:bg-mar-900 p-3">
            <View>
              <Text className="text-xs font-semibold uppercase text-mar-700 dark:text-mar-100">
                Ceñida
              </Text>
              <Text className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {Math.round(optimos.twaOptimoCenida)}°
              </Text>
              <Text className="text-xs text-slate-600 dark:text-slate-300">
                ángulo al viento
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                {optimos.bspCenida.toFixed(1)}
              </Text>
              <Text className="text-xs text-slate-600 dark:text-slate-300">kt esperados</Text>
              <Text className="mt-1 text-xs text-mar-700 dark:text-mar-100">
                VMG: {optimos.vmgCenida.toFixed(1)} kt
              </Text>
            </View>
          </View>

          {/* Empopada */}
          <View className="flex-row items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
            <View>
              <Text className="text-xs font-semibold uppercase text-slate-700 dark:text-slate-200">
                Empopada
              </Text>
              <Text className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {Math.round(optimos.twaOptimoEmpopada)}°
              </Text>
              <Text className="text-xs text-slate-600 dark:text-slate-300">
                ángulo al viento
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                {optimos.bspEmpopada.toFixed(1)}
              </Text>
              <Text className="text-xs text-slate-600 dark:text-slate-300">kt esperados</Text>
              <Text className="mt-1 text-xs text-slate-700 dark:text-slate-200">
                VMG: {optimos.vmgEmpopada.toFixed(1)} kt
              </Text>
            </View>
          </View>

          {/* Link a visualización completa */}
          <Link href="/polar" asChild>
            <Pressable className="flex-row items-center justify-center gap-2 rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
              <Wind size={14} color="#334155" />
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Ver diagrama polar completo
              </Text>
            </Pressable>
          </Link>
        </View>
      )}
    </View>
  );
}
