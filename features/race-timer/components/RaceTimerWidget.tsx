// Widget compacto del race timer: display grande + botones 5/4/1/sync/stop.
// Pensado para insertarse en /tactica y /regata como una card.

import { View, Text, Pressable } from "react-native";
import { Play, RotateCcw, Square } from "lucide-react-native";
import { useRaceTimerStore } from "../store/useRaceTimerStore";
import { useRaceTimer, formatearTiempoTimer } from "../hooks/useRaceTimer";

const COLOR_POR_FASE: Record<string, string> = {
  off: "#94a3b8",
  warning: "#64748b",
  preparatory: "#0a4d7a",
  onemin: "#ea580c",
  start: "#dc2626",
  racing: "#16a34a",
};

export function RaceTimerWidget() {
  const iniciar = useRaceTimerStore((s) => s.iniciar);
  const sincronizar = useRaceTimerStore((s) => s.sincronizar);
  const detener = useRaceTimerStore((s) => s.detener);
  const { tiempoRestanteMs, fase, activo } = useRaceTimer();

  const color = COLOR_POR_FASE[fase] ?? "#94a3b8";

  return (
    <View className="gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold uppercase text-slate-700">
          Race Timer
        </Text>
        {activo && (
          <View
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: `${color}20` }}
          >
            <Text
              className="text-xs font-semibold uppercase"
              style={{ color }}
            >
              {fase}
            </Text>
          </View>
        )}
      </View>

      {/* Display grande */}
      <View className="items-center py-2">
        <Text
          className="text-6xl font-bold tabular-nums"
          style={{ color: activo ? color : "#94a3b8" }}
        >
          {activo ? formatearTiempoTimer(tiempoRestanteMs) : "—:—"}
        </Text>
      </View>

      {/* Botones de control */}
      {!activo ? (
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => iniciar(5 * 60)}
            className="flex-1 flex-row items-center justify-center gap-1 rounded-xl bg-mar-500 p-3"
          >
            <Play size={14} color="white" />
            <Text className="text-sm font-semibold text-white">5 min</Text>
          </Pressable>
          <Pressable
            onPress={() => iniciar(4 * 60)}
            className="flex-1 flex-row items-center justify-center gap-1 rounded-xl bg-mar-500 p-3"
          >
            <Play size={14} color="white" />
            <Text className="text-sm font-semibold text-white">4 min</Text>
          </Pressable>
          <Pressable
            onPress={() => iniciar(60)}
            className="flex-1 flex-row items-center justify-center gap-1 rounded-xl bg-mar-500 p-3"
          >
            <Play size={14} color="white" />
            <Text className="text-sm font-semibold text-white">1 min</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-row gap-2">
          <Pressable
            onPress={sincronizar}
            className="flex-1 flex-row items-center justify-center gap-1 rounded-xl bg-amber-500 p-3"
          >
            <RotateCcw size={14} color="white" />
            <Text className="text-sm font-semibold text-white">Sync</Text>
          </Pressable>
          <Pressable
            onPress={detener}
            className="flex-1 flex-row items-center justify-center gap-1 rounded-xl bg-red-600 p-3"
          >
            <Square size={14} color="white" />
            <Text className="text-sm font-semibold text-white">Stop</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
