// Pantalla principal del modo táctico.
// Muestra race timer, viento usado, y el modo activo (waypoint o prestart)
// o el selector si no hay ninguno.

import { useMemo } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Compass, Flag, Wind } from "lucide-react-native";
import { useTacticaStore } from "@/features/regata/store/useTacticaStore";
import { useBoyasStore } from "@/features/boyas/store/useBoyasStore";
import { useGpsStore } from "@/features/regata/store/useGpsStore";
import { useRegataStore } from "@/features/regata/store/useRegataStore";
import { usePronosticoViento } from "@/features/wind/hooks/usePronosticoViento";
import { useRaceTimer } from "@/features/race-timer/hooks/useRaceTimer";
import { RaceTimerWidget } from "@/features/race-timer/components/RaceTimerWidget";
import { PanelWaypoint } from "@/features/regata/components/PanelWaypoint";
import { PanelPrestart } from "@/features/regata/components/PanelPrestart";
import { SelectorLineaSalida } from "@/features/regata/components/SelectorLineaSalida";
import { BOYA_META } from "@/features/boyas/types";

export default function PantallaTactica() {
  const router = useRouter();
  const modoActivo = useTacticaStore((s) => s.modoActivo);
  const activarWaypoint = useTacticaStore((s) => s.activarWaypoint);
  const vientoOverride = useTacticaStore((s) => s.vientoOverrideGrados);

  const boyas = useBoyasStore((s) => s.boyas);
  const ultimoPunto = useGpsStore((s) => s.ultimoPunto);
  const sesion = useRegataStore((s) => s.sesionActiva);
  const { pronostico } = usePronosticoViento();
  const { tiempoRestanteMs, activo: timerActivo } = useRaceTimer();

  // El viento usado para cálculos: override > snapshot de sesión > pronóstico
  const vientoActual = useMemo(() => {
    if (!pronostico) return null;
    const ahora = Date.now();
    return (
      pronostico.puntos.find((p) => new Date(p.hora).getTime() >= ahora) ??
      pronostico.puntos[0] ??
      null
    );
  }, [pronostico]);

  const vientoGrados =
    vientoOverride ??
    sesion?.vientoSnapshot?.direccionGrados ??
    vientoActual?.direccionGrados ??
    270;
  const vientoKts =
    sesion?.vientoSnapshot?.velocidadNudos ??
    vientoActual?.velocidadNudos ??
    10;

  // Segundos al start (positivo = falta; negativo = ya pasó)
  const segundosAlStart = timerActivo ? Math.max(0, tiempoRestanteMs / 1000) : 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center gap-3 bg-mar-700 p-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={24} color="white" />
        </Pressable>
        <View>
          <Text className="text-base font-semibold text-white">Táctica</Text>
          <Text className="text-xs text-white opacity-80">
            {modoActivo === "waypoint"
              ? "Modo waypoint"
              : modoActivo === "prestart"
                ? "Modo prestart"
                : "Selector"}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-3">
        {/* Race timer */}
        <RaceTimerWidget />

        {/* Estado del viento usado */}
        <View className="flex-row items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
          <Wind size={16} color="#1e40af" />
          <Text className="text-sm text-blue-900">
            Viento usado:{" "}
            <Text className="font-semibold">
              {vientoGrados.toFixed(0)}° · {vientoKts.toFixed(1)} kt
            </Text>
            {vientoOverride !== null && " (manual)"}
          </Text>
        </View>

        {/* Estado GPS */}
        {!ultimoPunto && (
          <View className="flex-row items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <Text className="flex-1 text-sm text-amber-900">
              Sin tracking GPS activo. Para datos en vivo, andá a Regata e
              iniciá la sesión.
            </Text>
          </View>
        )}

        {/* Sin boyas */}
        {boyas.length === 0 && (
          <View className="items-center gap-3 rounded-2xl bg-white p-6">
            <Flag size={32} color="#94a3b8" />
            <Text className="text-base font-semibold text-slate-800">
              Sin boyas marcadas
            </Text>
            <Text className="text-center text-xs text-slate-500">
              Andá al mapa y marcá al menos una boya (click derecho) para
              activar el modo táctico.
            </Text>
          </View>
        )}

        {/* Modo waypoint activo */}
        {modoActivo === "waypoint" && <PanelWaypoint />}

        {/* Modo prestart activo */}
        {modoActivo === "prestart" && (
          <PanelPrestart
            vientoGrados={vientoGrados}
            segundosAlStart={segundosAlStart}
          />
        )}

        {/* Selector cuando no hay modo activo */}
        {modoActivo === "off" && boyas.length > 0 && (
          <View className="gap-3">
            <Text className="mt-2 text-sm font-semibold uppercase text-slate-600">
              Ir a una boya
            </Text>
            {boyas.map((b) => {
              const meta = BOYA_META[b.tipo];
              return (
                <Pressable
                  key={b.id}
                  onPress={() => activarWaypoint(b.id)}
                  className="flex-row items-center gap-3 rounded-xl bg-white p-3"
                >
                  <View
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${meta.color}20` }}
                  >
                    <Text style={{ fontSize: 18 }}>{meta.emoji}</Text>
                  </View>
                  <Text className="flex-1 font-semibold text-slate-900">
                    {meta.nombre}
                    {b.label ? ` · ${b.label}` : ""}
                  </Text>
                  <Compass size={18} color="#0a4d7a" />
                </Pressable>
              );
            })}

            <Text className="mt-3 text-sm font-semibold uppercase text-slate-600">
              Línea de salida
            </Text>
            <SelectorLineaSalida />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
