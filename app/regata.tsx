// Pantalla de regata activa: inicia tracking GPS, muestra SOG/COG en vivo
// y rendimiento vs polar según viento del spot.

import { useMemo, useCallback } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Play,
  Square,
  Navigation,
  Edit3,
  MapPin,
} from "lucide-react-native";
import { SPOTS } from "@/features/spots/data/spots";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { useBarcoStore } from "@/features/polar/store/useBarcoStore";
import { useRegataStore } from "@/features/regata/store/useRegataStore";
import { useTrackingGPS } from "@/features/regata/hooks/useTrackingGPS";
import { usePronosticoViento } from "@/features/wind/hooks/usePronosticoViento";
import { calcularRendimiento } from "@/features/regata/lib/calculosNavegacion";
import { CardRendimiento } from "@/features/regata/components/CardRendimiento";
import { useBoyasStore } from "@/features/boyas/store/useBoyasStore";
import { MapaRegata } from "@/features/boyas/components/MapaRegata";
import { ListaBoyasNavegacion } from "@/features/boyas/components/ListaBoyasNavegacion";

export default function PantallaRegata() {
  const router = useRouter();
  const barco = useBarcoStore((s) => s.getBarcoActual());

  const spotId = useSpotStore((s) => s.spotIdSeleccionado);
  const overrides = useSpotStore((s) => s.overrides);
  const spot = useMemo(() => {
    const base = SPOTS.find((s) => s.id === spotId) ?? SPOTS[0];
    const ov = overrides[base.id];
    return ov ? { ...base, lat: ov.lat, lon: ov.lon } : base;
  }, [spotId, overrides]);

  const { pronostico } = usePronosticoViento();
  const sesion = useRegataStore((s) => s.sesionActiva);
  const iniciarSesion = useRegataStore((s) => s.iniciarSesion);
  const terminarSesion = useRegataStore((s) => s.terminarSesion);
  const agregarPunto = useRegataStore((s) => s.agregarPunto);
  const boyasSpot = useBoyasStore((s) => s.boyasPorSpot[spot.id] ?? []);
  // Si hay sesión activa, usar las boyas snapshot (editables);
  // si no, mostrar las del spot como preview.
  const boyasActivas = sesion?.boyasSnapshot ?? boyasSpot;

  // Viento del momento (primer punto futuro del pronóstico)
  const vientoActual = useMemo(() => {
    if (!pronostico) return null;
    const ahora = Date.now();
    return (
      pronostico.puntos.find((p) => new Date(p.hora).getTime() >= ahora) ??
      pronostico.puntos[0] ??
      null
    );
  }, [pronostico]);

  const trackingActivo = sesion != null;
  const { permiso, ultimoPunto, error } = useTrackingGPS({
    activo: trackingActivo,
    onPunto: agregarPunto,
  });

  const rendimiento = useMemo(() => {
    if (!ultimoPunto || !vientoActual) return null;
    return calcularRendimiento(
      barco.polar,
      ultimoPunto.cogGrados,
      ultimoPunto.sogKts,
      vientoActual.direccionGrados,
      vientoActual.velocidadNudos,
    );
  }, [ultimoPunto, vientoActual, barco.polar]);

  const handleIniciar = useCallback(() => {
    iniciarSesion({
      nombre: `Regata ${new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}`,
      barcoId: barco.id,
      spotId: spot.id,
      vientoSnapshot: vientoActual,
      boyasSnapshot: boyasSpot,
    });
  }, [iniciarSesion, barco.id, spot.id, vientoActual, boyasSpot]);

  const posBarco = ultimoPunto
    ? { lat: ultimoPunto.lat, lon: ultimoPunto.lon, cog: ultimoPunto.cogGrados }
    : null;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center gap-3 bg-mar-700 p-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={24} color="white" />
        </Pressable>
        <Text className="text-xl font-semibold text-white">Regata</Text>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-4">
        {/* Estado */}
        <View className="rounded-xl bg-white p-4 shadow-sm">
          <Text className="text-xs uppercase text-slate-500">Spot · Barco</Text>
          <Text className="mt-1 text-base font-semibold text-slate-900">
            {spot.nombre} · {barco.nombre}
          </Text>
          {vientoActual && (
            <Text className="mt-1 text-xs text-mar-700">
              Viento: {Math.round(vientoActual.velocidadNudos)} kt desde{" "}
              {Math.round(vientoActual.direccionGrados)}°
            </Text>
          )}
        </View>

        {/* Boyas del cuadro de regata */}
        <View className="gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MapPin size={16} color="#ea580c" />
              <Text className="text-sm font-semibold uppercase text-slate-700">
                Boyas ({boyasActivas.length})
              </Text>
            </View>
            <Link href="/boyas" asChild>
              <Pressable className="flex-row items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5">
                <Edit3 size={12} color="#334155" />
                <Text className="text-xs font-semibold text-slate-700">
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
              {sesion && (
                <Text className="text-xs text-slate-500">
                  Editando snapshot de la sesión activa — no afecta las
                  predeterminadas del spot.
                </Text>
              )}
            </>
          ) : (
            <Text className="text-sm text-slate-500">
              No hay boyas cargadas. Tap &quot;Editar&quot; para pegar las
              coordenadas que envió el juez.
            </Text>
          )}
        </View>

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
            onPress={terminarSesion}
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
          <View className="rounded-xl bg-white p-4 shadow-sm">
            <View className="flex-row items-center gap-2">
              <Navigation size={16} color="#0a4d7a" />
              <Text className="text-sm font-semibold text-slate-700">
                Tracking GPS
              </Text>
            </View>
            {permiso === "pendiente" && (
              <Text className="mt-2 text-sm text-slate-500">
                Solicitando permiso de ubicación…
              </Text>
            )}
            {error && (
              <Text className="mt-2 text-sm text-red-600">{error}</Text>
            )}
            {ultimoPunto && (
              <View className="mt-3 flex-row gap-2">
                <View className="flex-1 rounded-lg bg-mar-50 p-3">
                  <Text className="text-xs uppercase text-mar-700">SOG</Text>
                  <Text className="mt-1 text-2xl font-bold text-slate-900">
                    {ultimoPunto.sogKts.toFixed(1)}
                  </Text>
                  <Text className="text-xs text-slate-600">nudos</Text>
                </View>
                <View className="flex-1 rounded-lg bg-mar-50 p-3">
                  <Text className="text-xs uppercase text-mar-700">COG</Text>
                  <Text className="mt-1 text-2xl font-bold text-slate-900">
                    {Math.round(ultimoPunto.cogGrados)}°
                  </Text>
                  <Text className="text-xs text-slate-600">rumbo</Text>
                </View>
                <View className="flex-1 rounded-lg bg-slate-100 p-3">
                  <Text className="text-xs uppercase text-slate-700">±</Text>
                  <Text className="mt-1 text-2xl font-bold text-slate-900">
                    {ultimoPunto.precisionMetros != null
                      ? Math.round(ultimoPunto.precisionMetros)
                      : "—"}
                  </Text>
                  <Text className="text-xs text-slate-600">m</Text>
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

        {/* Resumen de la sesión activa */}
        {sesion && (
          <View className="rounded-xl bg-white p-4 shadow-sm">
            <Text className="text-xs uppercase text-slate-500">Sesión</Text>
            <Text className="mt-1 text-sm font-semibold text-slate-900">
              {sesion.nombre}
            </Text>
            <Text className="mt-1 text-xs text-slate-600">
              {sesion.puntos.length} puntos GPS registrados ·{" "}
              {duracionMinutos(sesion.fechaInicio)} min
            </Text>
          </View>
        )}

        {!trackingActivo && (
          <Text className="px-4 text-center text-xs text-slate-500">
            Iniciá una regata para registrar tu tracking GPS y comparar tu
            performance contra el polar del barco en tiempo real.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function duracionMinutos(desdeMs: number): number {
  return Math.floor((Date.now() - desdeMs) / 60000);
}
