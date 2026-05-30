// Pantalla principal del modo táctico.
// Muestra race timer, viento usado, y el modo activo (waypoint o prestart)
// o el selector si no hay ninguno.

import { useMemo, useState } from "react";
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
import { MenuRapido } from "@/components/MenuRapido";
import { useTema, useColores } from "@/lib/tema";
import { useBarcoStore } from "@/features/polar/store/useBarcoStore";
import { calcularRendimiento } from "@/features/regata/lib/calculosNavegacion";
import { useCopilotoStore } from "@/features/regata/store/useCopilotoStore";
import { NavIACopilotCard } from "@/features/regata/components/NavIACopilotCard";
import { MOBOverlay } from "@/features/seguridad/components/MOBOverlay";
import { PanelSeguridadBotones } from "@/features/seguridad/components/PanelSeguridadBotones";
import { useEffect } from "react";
import { WetScreenLock } from "@/features/ui/components/WetScreenLock";

export default function PantallaTactica() {
  const router = useRouter();
  const modoActivo = useTacticaStore((s) => s.modoActivo);
  const [screenLockActivo, setScreenLockActivo] = useState(false);
  const activarWaypoint = useTacticaStore((s) => s.activarWaypoint);
  const vientoOverride = useTacticaStore((s) => s.vientoOverrideGrados);
  const c = useColores();
  const alternarTema = useTema((s) => s.alternar);
  const modoTema = useTema((s) => s.modo);

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

  const barco = useBarcoStore((s) => s.getBarcoActual());
  const boyaWaypointId = useTacticaStore((s) => s.boyaWaypointId);
  const waypointActivo = useMemo(() => {
    if (modoActivo !== "waypoint" || !boyaWaypointId) return null;
    return boyas.find((b) => b.id === boyaWaypointId) ?? null;
  }, [modoActivo, boyaWaypointId, boyas]);

  const rendimiento = useMemo(() => {
    if (!ultimoPunto) return null;
    return calcularRendimiento(
      barco.polar,
      ultimoPunto.cogGrados,
      ultimoPunto.sogKts,
      vientoGrados,
      vientoKts,
      ultimoPunto ? { lat: ultimoPunto.lat, lon: ultimoPunto.lon } : null,
      waypointActivo ? { lat: waypointActivo.lat, lon: waypointActivo.lon } : null,
    );
  }, [ultimoPunto, vientoGrados, vientoKts, barco.polar, waypointActivo]);

  const procesarTelemetria = useCopilotoStore((s) => s.procesarTelemetria);
  const trackingActivo = sesion != null;

  useEffect(() => {
    if (trackingActivo) {
      procesarTelemetria(
        rendimiento,
        vientoKts,
        vientoGrados,
        1.2, // Olas default
        ultimoPunto?.cogGrados ?? 0
      );
    }
  }, [rendimiento, vientoKts, vientoGrados, ultimoPunto, trackingActivo, procesarTelemetria]);

  // Segundos al start (positivo = falta; negativo = ya pasó)
  const segundosAlStart = timerActivo ? Math.max(0, tiempoRestanteMs / 1000) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.navy, padding: 16 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={24} color="white" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontFamily: "Inter-Bold", color: "white" }}>Táctica</Text>
          <Text style={{ fontSize: 11, color: "white", opacity: 0.8 }}>
            {modoActivo === "waypoint"
              ? "Modo waypoint"
              : modoActivo === "prestart"
                ? "Modo prestart"
                : "Selector"}
          </Text>
        </View>

        {/* Toggle de Modo Deck / Cubierta */}
        <Pressable
          onPress={alternarTema}
          style={{
            backgroundColor: modoTema === "deck_extremo" ? "#EAFB00" : "rgba(255,255,255,0.18)",
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontFamily: "Inter-Bold",
              color: modoTema === "deck_extremo" ? "#000000" : "#FFFFFF",
            }}
          >
            {modoTema === "light" ? "☀️ Light" : modoTema === "deck" ? "🌙 Dark" : "⚡ Deck!"}
          </Text>
        </Pressable>

        {/* Botón de Bloqueo de Pantalla Húmeda */}
        <Pressable
          onPress={() => {
            setScreenLockActivo(true);
            decir("Modo cubierta bloqueado");
          }}
          style={{
            backgroundColor: "rgba(255,255,255,0.18)",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 6,
          }}
        >
          <Text style={{ fontSize: 11, fontFamily: "Inter-Bold", color: "#FFFFFF" }}>
            🔒 Bloquear
          </Text>
        </Pressable>

        <MenuRapido />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        {/* Hombre al Agua (MOB) - Prioridad 1 */}
        <MOBOverlay />

        {/* Botones de Activación de Seguridad MOB/SOS */}
        <PanelSeguridadBotones />

        {/* NavIA Copilot Tactical Card */}
        <NavIACopilotCard />

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
          <View className="items-center gap-3 rounded-2xl bg-white dark:bg-slate-800 p-6">
            <Flag size={32} color="#94a3b8" />
            <Text className="text-base font-semibold text-slate-800 dark:text-slate-100">
              Sin boyas marcadas
            </Text>
            <Text className="text-center text-xs text-slate-500 dark:text-slate-400">
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
            <Text className="mt-2 text-sm font-semibold uppercase text-slate-600 dark:text-slate-300">
              Ir a una boya
            </Text>
            {boyas.map((b) => {
              const meta = BOYA_META[b.tipo];
              return (
                <Pressable
                  key={b.id}
                  onPress={() => activarWaypoint(b.id)}
                  className="flex-row items-center gap-3 rounded-xl bg-white dark:bg-slate-800 p-3"
                >
                  <View
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${meta.color}20` }}
                  >
                    <Text style={{ fontSize: 18 }}>{meta.emoji}</Text>
                  </View>
                  <Text className="flex-1 font-semibold text-slate-900 dark:text-white">
                    {meta.nombre}
                    {b.label ? ` · ${b.label}` : ""}
                  </Text>
                  <Compass size={18} color="#0a4d7a" />
                </Pressable>
              );
            })}

            <Text className="mt-3 text-sm font-semibold uppercase text-slate-600 dark:text-slate-300">
              Línea de salida
            </Text>
            <SelectorLineaSalida />
          </View>
        )}
      </ScrollView>

      {/* Pantalla Bloqueada - Modo Cubierta / Wet Screen Lock */}
      <WetScreenLock
        activo={screenLockActivo}
        onDesbloquear={() => setScreenLockActivo(false)}
        sog={ultimoPunto?.sogKts ?? 0}
        cog={ultimoPunto?.cogGrados ?? 0}
        vmg={rendimiento?.vmg}
        vmc={rendimiento?.vmc}
        distanciaBoya={rendimiento?.distanciaToWaypoint}
        rumboBoya={rendimiento?.headingToWaypoint}
      />
    </SafeAreaView>
  );
}
