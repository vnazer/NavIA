// Pantalla de regata activa: inicia tracking GPS, muestra SOG/COG en vivo
// y rendimiento vs polar según viento del spot.

import { useMemo, useCallback, useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable, Alert, Platform } from "react-native";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Play,
  Square,
  Navigation,
  Edit3,
  MapPin,
  Compass,
} from "lucide-react-native";
import { SPOTS } from "@/features/spots/data/spots";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { useBarcoStore } from "@/features/polar/store/useBarcoStore";
import { useRegataStore } from "@/features/regata/store/useRegataStore";
import { useTrackingGPS } from "@/features/regata/hooks/useTrackingGPS";
import { usePronosticoViento } from "@/features/wind/hooks/usePronosticoViento";
import { useVientoActual } from "@/features/wind/lib/vientoActual";
import { calcularRendimiento } from "@/features/regata/lib/calculosNavegacion";
import { CardRendimiento } from "@/features/regata/components/CardRendimiento";
import { PanelShifts } from "@/features/regata/components/PanelShifts";
import { useBoyasStore } from "@/features/boyas/store/useBoyasStore";
import { MapaRegata } from "@/features/boyas/components/MapaRegata";
import { ListaBoyasNavegacion } from "@/features/boyas/components/ListaBoyasNavegacion";
import { MenuRapido } from "@/components/MenuRapido";
import { useTacticaStore } from "@/features/regata/store/useTacticaStore";
import { useColorPorTema } from "@/lib/tema/colores";
import { useTema, useColores } from "@/lib/tema";
import { decir } from "@/lib/voz/servicio";
import { NavIACopilotCard } from "@/features/regata/components/NavIACopilotCard";
import { MOBOverlay } from "@/features/seguridad/components/MOBOverlay";
import { PanelSeguridadBotones } from "@/features/seguridad/components/PanelSeguridadBotones";
import { useCopilotoStore } from "@/features/regata/store/useCopilotoStore";
import { WetScreenLock } from "@/features/ui/components/WetScreenLock";

export default function PantallaRegata() {
  // Pantalla encendida mientras esta pantalla está montada: si iOS bloquea la
  // pantalla, el GPS en primer plano se detiene y la sesión pierde puntos.
  useKeepAwake("navia-regata", { suppressDeactivateWarnings: true });
  const router = useRouter();
  // Foco: si /tactica está encima, esta pantalla sigue montada (y grabando),
  // pero el copiloto solo lo procesa la pantalla visible.
  const [enFoco, setEnFoco] = useState(true);
  useFocusEffect(
    useCallback(() => {
      setEnFoco(true);
      return () => setEnFoco(false);
    }, []),
  );
  const barco = useBarcoStore((s) => s.getBarcoActual());
  const [screenLockActivo, setScreenLockActivo] = useState(false);
  const colorIconoClaro = useColorPorTema("#334155", "#e2e8f0");
  const c = useColores();
  const alternarTema = useTema((s) => s.alternar);
  const modoTema = useTema((s) => s.modo);

  const spotId = useSpotStore((s) => s.spotIdSeleccionado);
  const overrides = useSpotStore((s) => s.overrides);
  const customSpots = useSpotStore((s) => s.customSpots);
  const spot = useMemo(() => {
    const todos = [...SPOTS, ...customSpots];
    const base = todos.find((s) => s.id === spotId) ?? SPOTS[0];
    const ov = overrides[base.id];
    return ov ? { ...base, lat: ov.lat, lon: ov.lon } : base;
  }, [spotId, overrides, customSpots]);

  const { pronostico } = usePronosticoViento();
  // pronostico también se pasa to PanelShifts para histórico de shifts
  // Selectores finos: sesionActiva cambia de referencia con cada punto GPS;
  // así esta pantalla no depende del objeto completo.
  const sesionId = useRegataStore((s) => s.sesionActiva?.id ?? null);
  const sesionNombre = useRegataStore((s) => s.sesionActiva?.nombre ?? "");
  const sesionFechaInicio = useRegataStore((s) => s.sesionActiva?.fechaInicio ?? null);
  const sesionCantidadPuntos = useRegataStore((s) => s.sesionActiva?.puntos.length ?? 0);
  const boyasSesion = useRegataStore((s) => s.sesionActiva?.boyasSnapshot ?? null);
  const iniciarSesion = useRegataStore((s) => s.iniciarSesion);
  const terminarSesion = useRegataStore((s) => s.terminarSesion);
  const agregarPunto = useRegataStore((s) => s.agregarPunto);
  // Boyas race-day (store global, no por spot). Si hay sesión activa,
  // mostramos su snapshot (que se mantiene sincronizado con las ediciones
  // hechas en /boyas, /mapa o /tactica); sino, las del store.
  const boyasGlobales = useBoyasStore((s) => s.boyas);
  const boyasActivas = boyasSesion ?? boyasGlobales;

  // Viento del momento: hora del pronóstico más cercana a ahora (se recalcula)
  const vientoActual = useVientoActual(pronostico);

  const trackingActivo = sesionId != null;
  const { permiso, ultimoPunto, error } = useTrackingGPS({
    activo: trackingActivo,
    onPunto: agregarPunto,
  });

  const modoTactico = useTacticaStore((s) => s.modoActivo);
  const boyaWaypointId = useTacticaStore((s) => s.boyaWaypointId);
  const waypointActivo = useMemo(() => {
    if (modoTactico !== "waypoint" || !boyaWaypointId) return null;
    return boyasActivas.find((b) => b.id === boyaWaypointId) ?? null;
  }, [modoTactico, boyaWaypointId, boyasActivas]);

  const rendimiento = useMemo(() => {
    if (!ultimoPunto || !vientoActual) return null;
    return calcularRendimiento(
      barco.polar,
      ultimoPunto.cogGrados,
      ultimoPunto.sogKts,
      vientoActual.direccionGrados,
      vientoActual.velocidadNudos,
      ultimoPunto ? { lat: ultimoPunto.lat, lon: ultimoPunto.lon } : null,
      waypointActivo ? { lat: waypointActivo.lat, lon: waypointActivo.lon } : null,
    );
  }, [ultimoPunto, vientoActual, barco.polar, waypointActivo]);

  // Procesar Telemetría con NavIA Copilot (solo si esta pantalla está en foco,
  // para no procesar/anunciar doble cuando /tactica está montada encima)
  const procesarTelemetria = useCopilotoStore((s) => s.procesarTelemetria);
  const esIlca = barco.id.startsWith("ilca");
  useEffect(() => {
    if (enFoco && trackingActivo && vientoActual) {
      procesarTelemetria({
        rendimiento,
        tws: vientoActual.velocidadNudos,
        twd: vientoActual.direccionGrados,
        olasMt: vientoActual.olaMt ?? null, // ola real del pronóstico (si existe)
        cog: ultimoPunto?.cogGrados ?? null,
        esIlca,
      });
    }
  }, [rendimiento, vientoActual, ultimoPunto, trackingActivo, procesarTelemetria, enFoco, esIlca]);

  const handleIniciar = useCallback(() => {
    iniciarSesion({
      nombre: `Regata ${new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}`,
      barcoId: barco.id,
      spotId: spot.id,
      vientoSnapshot: vientoActual,
      boyasSnapshot: boyasGlobales,
    });
  }, [iniciarSesion, barco.id, spot.id, vientoActual, boyasGlobales]);

  const handleFinalizar = useCallback(() => {
    const titulo = "¿Finalizar regata?";
    const mensaje = "Se detiene el tracking GPS y la sesión se guarda en la bitácora.";
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm(`${titulo}\n\n${mensaje}`)) {
        terminarSesion();
      }
      return;
    }
    Alert.alert(titulo, mensaje, [
      { text: "Seguir navegando", style: "cancel" },
      { text: "Finalizar y guardar", style: "destructive", onPress: terminarSesion },
    ]);
  }, [terminarSesion]);

  // Memo con dependencias primitivas: el mapa recibe una referencia estable
  const latBarco = ultimoPunto?.lat ?? null;
  const lonBarco = ultimoPunto?.lon ?? null;
  const cogBarco = ultimoPunto?.cogGrados ?? null;
  const posBarco = useMemo(
    () =>
      latBarco != null && lonBarco != null
        ? { lat: latBarco, lon: lonBarco, cog: cogBarco ?? undefined }
        : null,
    [latBarco, lonBarco, cogBarco],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: c.navy, padding: 16 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={24} color="white" />
        </Pressable>
        <Text style={{ flex: 1, fontSize: 18, fontFamily: "Inter-Bold", color: "white" }}>
          Regata
        </Text>
        
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

      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Hombre al Agua (MOB) - Prioridad 1 */}
        <MOBOverlay />

        {/* Botones de Activación de Seguridad MOB/SOS */}
        <PanelSeguridadBotones />

        {/* NavIA Copilot Tactical Card */}
        <NavIACopilotCard />
        <View className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm">
          <Text className="text-xs uppercase text-slate-500 dark:text-slate-400">Spot · Barco</Text>
          <Text className="mt-1 text-base font-semibold text-slate-900 dark:text-white">
            {spot.nombre} · {barco.nombre}
          </Text>
          {vientoActual && (
            <Text className="mt-1 text-xs text-mar-700 dark:text-mar-100">
              Viento: {Math.round(vientoActual.velocidadNudos)} kt desde{" "}
              {Math.round(vientoActual.direccionGrados)}°
            </Text>
          )}
        </View>

        {/* Boyas del cuadro de regata */}
        <View className="gap-3 rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MapPin size={16} color="#ea580c" />
              <Text className="text-sm font-semibold uppercase text-slate-700 dark:text-slate-200">
                Boyas ({boyasActivas.length})
              </Text>
            </View>
            <Link href="/boyas" asChild>
              <Pressable className="flex-row items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5">
                <Edit3 size={12} color={colorIconoClaro} />
                <Text className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  Editar
                </Text>
              </Pressable>
            </Link>
          </View>

          {boyasActivas.length > 0 ? (
            <>
              <MapaRegata
                posBarco={posBarco}
                boyas={boyasActivas}
                fallback={{ lat: spot.lat, lon: spot.lon }}
              />
              <ListaBoyasNavegacion
                boyas={boyasActivas}
                posBarco={posBarco}
              />
              {trackingActivo && (
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  Los cambios que hagas en las boyas se aplican también a la
                  sesión activa.
                </Text>
              )}
            </>
          ) : (
            <Text className="text-sm text-slate-500 dark:text-slate-400">
              No hay boyas cargadas. Toca &quot;Editar&quot; para pegar las
              coordenadas que envió el juez.
            </Text>
          )}
        </View>

        {/* Acceso al modo táctico (waypoint + prestart) */}
        <Link href={"/tactica" as never} asChild>
          <Pressable className="flex-row items-center justify-center gap-2 rounded-xl bg-mar-700 p-3">
            <Compass size={16} color="white" />
            <Text className="text-sm font-semibold text-white">
              Modo táctico (timer · waypoint · prestart)
            </Text>
          </Pressable>
        </Link>

        {/* Botón iniciar/detener */}
        {!trackingActivo ? (
          <Pressable
            onPress={handleIniciar}
            className="flex-row items-center justify-center gap-2 rounded-xl bg-mar-500 p-4"
          >
            <Play size={20} color="white" />
            <Text className="text-base font-semibold text-white">
              Iniciar regata
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleFinalizar}
            className="flex-row items-center justify-center gap-2 rounded-xl bg-red-600 p-4"
          >
            <Square size={18} color="white" />
            <Text className="text-base font-semibold text-white">
              Finalizar y guardar
            </Text>
          </Pressable>
        )}

        {/* Estado del GPS */}
        {trackingActivo && (
          <View className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm">
            <View className="flex-row items-center gap-2">
              <Navigation size={16} color="#0a4d7a" />
              <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Tracking GPS
              </Text>
            </View>
            {permiso === "pendiente" && (
              <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Solicitando permiso de ubicación…
              </Text>
            )}
            {error && (
              <Text className="mt-2 text-sm text-red-600">{error}</Text>
            )}
            {ultimoPunto && (
              <View className="mt-3 flex-row gap-2">
                <View className="flex-1 rounded-lg bg-mar-50 dark:bg-mar-900 p-3">
                  <Text className="text-xs uppercase text-mar-700 dark:text-mar-100">SOG</Text>
                  <Text className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                    {ultimoPunto.sogKts.toFixed(1)}
                  </Text>
                  <Text className="text-xs text-slate-600 dark:text-slate-300">nudos</Text>
                </View>
                <View className="flex-1 rounded-lg bg-mar-50 dark:bg-mar-900 p-3">
                  <Text className="text-xs uppercase text-mar-700 dark:text-mar-100">COG</Text>
                  <Text className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                    {ultimoPunto.cogGrados != null
                      ? `${Math.round(ultimoPunto.cogGrados)}°`
                      : "—"}
                  </Text>
                  <Text className="text-xs text-slate-600 dark:text-slate-300">rumbo</Text>
                </View>
                <View className="flex-1 rounded-lg bg-slate-100 dark:bg-slate-800 p-3">
                  <Text className="text-xs uppercase text-slate-700 dark:text-slate-200">±</Text>
                  <Text className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                    {ultimoPunto.precisionMetros != null
                      ? Math.round(ultimoPunto.precisionMetros)
                      : "—"}
                  </Text>
                  <Text className="text-xs text-slate-600 dark:text-slate-300">m</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Rendimiento vs polar */}
        {trackingActivo && vientoActual && (
          <CardRendimiento
            rendimiento={rendimiento}
            tws={vientoActual.velocidadNudos}
          />
        )}

        {/* Shifts de viento: siempre visible cuando hay pronóstico */}
        {pronostico && (
          <PanelShifts
            pronostico={pronostico}
            sesionFechaInicio={sesionFechaInicio}
            twdActual={vientoActual?.direccionGrados ?? null}
          />
        )}

        {/* Resumen de la sesión activa */}
        {trackingActivo && sesionFechaInicio != null && (
          <View className="rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm">
            <Text className="text-xs uppercase text-slate-500 dark:text-slate-400">Sesión</Text>
            <Text className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
              {sesionNombre}
            </Text>
            <Text className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {sesionCantidadPuntos} puntos GPS registrados ·{" "}
              {duracionMinutos(sesionFechaInicio)} min
            </Text>
          </View>
        )}

        {!trackingActivo && (
          <Text className="px-4 text-center text-xs text-slate-500 dark:text-slate-400">
            Inicia una regata para registrar tu tracking GPS y comparar tu
            performance contra el polar del barco en tiempo real.
          </Text>
        )}
      </ScrollView>

      {/* Pantalla Bloqueada - Modo Cubierta / Wet Screen Lock */}
      <WetScreenLock
        activo={screenLockActivo}
        onDesbloquear={() => setScreenLockActivo(false)}
        sog={ultimoPunto?.sogKts ?? 0}
        cog={ultimoPunto?.cogGrados ?? null}
        vmg={rendimiento?.vmg}
        vmc={rendimiento?.vmc}
        distanciaBoya={rendimiento?.distanciaToWaypoint}
        rumboBoya={rendimiento?.headingToWaypoint}
      />
    </SafeAreaView>
  );
}

function duracionMinutos(desdeMs: number): number {
  return Math.floor((Date.now() - desdeMs) / 60000);
}
