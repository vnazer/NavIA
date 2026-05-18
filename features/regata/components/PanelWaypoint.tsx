// Modo waypoint: mostrar bearing/distancia/ETA desde el barco a una boya.
// Lee la posición del barco del store global useGpsStore (poblado por
// useTrackingGPS cuando hay subscription activa en alguna pantalla).

import { View, Text, Pressable } from "react-native";
import { X } from "lucide-react-native";
import { useTacticaStore } from "../store/useTacticaStore";
import { useGpsStore } from "../store/useGpsStore";
import { useBoyasStore } from "@/features/boyas/store/useBoyasStore";
import { calcularBearingYDistancia } from "../lib/geometria-linea";
import { BOYA_META } from "@/features/boyas/types";

export function PanelWaypoint() {
  const boyaId = useTacticaStore((s) => s.boyaWaypointId);
  const desactivar = useTacticaStore((s) => s.desactivarWaypoint);
  const boyas = useBoyasStore((s) => s.boyas);
  const boya = boyas.find((b) => b.id === boyaId);
  const ultimoPunto = useGpsStore((s) => s.ultimoPunto);

  if (!boya) {
    return (
      <View className="rounded-xl bg-amber-50 p-4">
        <Text className="text-amber-800">
          La boya seleccionada ya no existe.
        </Text>
      </View>
    );
  }

  const meta = BOYA_META[boya.tipo];

  if (!ultimoPunto) {
    return (
      <View className="items-center rounded-2xl bg-white p-6">
        <Text className="text-slate-500">
          Esperando GPS — andá a /regata e iniciá tracking.
        </Text>
        <Pressable onPress={desactivar} className="mt-3 p-2">
          <Text className="text-sm font-semibold text-slate-600">Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  const { bearingGrados, distanciaMt, distanciaMn } = calcularBearingYDistancia(
    ultimoPunto.lat,
    ultimoPunto.lon,
    boya.lat,
    boya.lon,
  );

  // Diferencia entre tu COG y el bearing hacia la marca (signed: + = girar a derecha)
  const diferenciaCog =
    ultimoPunto.cogGrados > 0
      ? ((bearingGrados - ultimoPunto.cogGrados + 540) % 360) - 180
      : null;

  const etaSegundos =
    ultimoPunto.sogKts > 0.3 ? distanciaMt / (ultimoPunto.sogKts * 0.5144) : null;

  const colorDelta =
    diferenciaCog == null
      ? "#f1f5f9"
      : Math.abs(diferenciaCog) < 5
        ? "#dcfce7"
        : Math.abs(diferenciaCog) < 15
          ? "#fef3c7"
          : "#fee2e2";

  return (
    <View className="gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text style={{ fontSize: 20 }}>{meta.emoji}</Text>
          <Text className="text-base font-semibold text-slate-900">
            Ir a: {meta.nombre}
            {boya.label ? ` · ${boya.label}` : ""}
          </Text>
        </View>
        <Pressable onPress={desactivar} hitSlop={8} className="p-2">
          <X size={20} color="#64748b" />
        </Pressable>
      </View>

      {/* Distancia grande */}
      <View className="my-2 items-center">
        <Text className="text-6xl font-bold text-slate-800">
          {distanciaMn < 1 ? distanciaMt.toFixed(0) : distanciaMn.toFixed(2)}
        </Text>
        <Text className="text-sm text-slate-500">
          {distanciaMn < 1 ? "metros" : "millas náuticas"}
        </Text>
      </View>

      {/* Bearing + COG + delta */}
      <View className="flex-row gap-2">
        <View className="flex-1 rounded-lg bg-slate-50 p-3">
          <Text className="text-xs uppercase text-slate-500">Bearing</Text>
          <Text className="text-xl font-bold text-slate-900">
            {bearingGrados.toFixed(0)}°
          </Text>
        </View>
        <View className="flex-1 rounded-lg bg-slate-50 p-3">
          <Text className="text-xs uppercase text-slate-500">Tu COG</Text>
          <Text className="text-xl font-bold text-slate-900">
            {ultimoPunto.cogGrados > 0
              ? `${ultimoPunto.cogGrados.toFixed(0)}°`
              : "—"}
          </Text>
        </View>
        <View
          className="flex-1 rounded-lg p-3"
          style={{ backgroundColor: colorDelta }}
        >
          <Text className="text-xs uppercase text-slate-500">Δ</Text>
          <Text className="text-xl font-bold text-slate-900">
            {diferenciaCog != null
              ? `${diferenciaCog > 0 ? "+" : ""}${diferenciaCog.toFixed(0)}°`
              : "—"}
          </Text>
        </View>
      </View>

      {/* ETA */}
      {etaSegundos != null && (
        <View className="rounded-lg bg-mar-50 p-3">
          <Text className="text-xs uppercase text-mar-700">
            ETA con tu SOG actual
          </Text>
          <Text className="text-lg font-bold text-slate-900">
            {etaSegundos < 60
              ? `${etaSegundos.toFixed(0)} seg`
              : `${(etaSegundos / 60).toFixed(1)} min`}
          </Text>
        </View>
      )}
    </View>
  );
}
