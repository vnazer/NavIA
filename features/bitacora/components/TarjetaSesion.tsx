// Tarjeta de resumen de una sesión, mostrada en la lista de bitácora.

import { View, Text } from "react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import { MapPin, Sailboat, TrendingUp, Clock } from "lucide-react-native";
import { SPOTS } from "@/features/spots/data/spots";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { BARCOS } from "@/features/polar/data/barcos";
import { calcularMetricasSesion, formatearDuracion } from "../lib/analitica";
import type { Sesion } from "@/features/regata/types";

type Props = {
  sesion: Sesion;
};

export function TarjetaSesion({ sesion }: Props) {
  const customSpots = useSpotStore((s) => s.customSpots);
  const spot =
    SPOTS.find((s) => s.id === sesion.spotId) ??
    customSpots.find((s) => s.id === sesion.spotId);
  const barco = BARCOS.find((b) => b.id === sesion.barcoId);

  if (!barco) {
    return (
      <View className="rounded-xl bg-white dark:bg-slate-800 p-4">
        <Text className="text-sm text-slate-700 dark:text-slate-200">
          Sesión del{" "}
          {format(new Date(sesion.fechaInicio), "PPP", { locale: es })}
        </Text>
        <Text className="mt-1 text-xs text-red-600">
          Barco no encontrado (id: {sesion.barcoId})
        </Text>
      </View>
    );
  }

  const m = calcularMetricasSesion(sesion, barco.polar);
  const fecha = format(
    new Date(sesion.fechaInicio),
    "EEE d MMM yyyy, HH:mm",
    { locale: es },
  );

  return (
    <View className="gap-2 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-slate-900 dark:text-white">
            {spot?.nombre ?? "Spot desconocido"}
          </Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">{fecha}</Text>
        </View>
        <View className="rounded-full bg-mar-50 dark:bg-mar-900 px-2 py-1">
          <Text className="text-xs font-semibold text-mar-700 dark:text-mar-100">
            {barco.nombre}
          </Text>
        </View>
      </View>

      <View className="mt-1 flex-row flex-wrap gap-4">
        <View className="flex-row items-center gap-1">
          <Clock size={12} color="#64748b" />
          <Text className="text-xs text-slate-600 dark:text-slate-300">
            {formatearDuracion(m.duracionMs)}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <MapPin size={12} color="#64748b" />
          <Text className="text-xs text-slate-600 dark:text-slate-300">
            {m.distanciaMn.toFixed(2)} MN
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Sailboat size={12} color="#64748b" />
          <Text className="text-xs text-slate-600 dark:text-slate-300">
            {m.sogPromedio.toFixed(1)} kt prom
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <TrendingUp size={12} color="#64748b" />
          <Text className="text-xs text-slate-600 dark:text-slate-300">
            {Math.round(m.performancePromedio)}% polar
          </Text>
        </View>
      </View>
    </View>
  );
}
