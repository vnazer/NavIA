// Detalle de una sesión específica de la bitácora.
// Muestra mapa, métricas, gráfico y análisis táctico.

import { useMemo } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Trash2, Download } from "lucide-react-native";
import { exportarGpx } from "@/lib/gpx/exportar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRegataStore } from "@/features/regata/store/useRegataStore";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { SPOTS } from "@/features/spots/data/spots";
import { BARCOS } from "@/features/polar/data/barcos";
import {
  analizarSesion,
  calcularMetricasSesion,
  formatearDuracion,
} from "@/features/bitacora/lib/analitica";
import { MapaTrack } from "@/features/bitacora/components/MapaTrack";
import { GraficoSOG } from "@/features/bitacora/components/GraficoSOG";
import { MenuRapido } from "@/components/MenuRapido";

function confirmar(mensaje: string, onAceptar: () => void) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(mensaje)) onAceptar();
  } else {
    Alert.alert("Confirmar", mensaje, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: onAceptar },
    ]);
  }
}

export default function PantallaDetalleSesion() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const getSesion = useRegataStore((s) => s.getSesion);
  const eliminarSesion = useRegataStore((s) => s.eliminarSesion);

  const customSpots = useSpotStore((s) => s.customSpots);
  const sesion = getSesion(id);
  const spot = sesion
    ? (SPOTS.find((s) => s.id === sesion.spotId) ??
      customSpots.find((s) => s.id === sesion.spotId) ??
      null)
    : null;
  const barco = sesion ? BARCOS.find((b) => b.id === sesion.barcoId) : null;

  const puntosAnalizados = useMemo(() => {
    if (!sesion || !barco) return [];
    return analizarSesion(sesion, barco.polar);
  }, [sesion, barco]);

  const metricas = useMemo(() => {
    if (!sesion || !barco) return null;
    return calcularMetricasSesion(sesion, barco.polar);
  }, [sesion, barco]);

  if (!sesion || !barco || !metricas) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
        <View className="flex-row items-center gap-3 bg-mar-700 p-4">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ChevronLeft size={24} color="white" />
          </Pressable>
          <Text className="text-xl font-semibold text-white">Sesión</Text>
        </View>
        <View className="p-6">
          <Text className="text-base text-slate-700 dark:text-slate-200">
            No se encontró la sesión solicitada.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const fecha = format(
    new Date(sesion.fechaInicio),
    "EEE d MMM yyyy, HH:mm",
    { locale: es },
  );

  const handleEliminar = () => {
    confirmar("¿Eliminar esta sesión permanentemente?", () => {
      eliminarSesion(sesion.id);
      router.back();
    });
  };

  const handleExportar = async () => {
    const res = await exportarGpx(sesion);
    if (res.ok) return; // éxito: web ya inicia descarga, nativo ya abre share sheet
    if (Platform.OS === "web") {
      if (typeof window !== "undefined") window.alert(res.mensaje);
    } else {
      Alert.alert("No se pudo exportar", res.mensaje);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="flex-row items-center justify-between gap-3 bg-mar-700 p-4">
        <View className="flex-1 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ChevronLeft size={24} color="white" />
          </Pressable>
          <View>
            <Text className="text-base font-semibold text-white">
              {spot?.nombre ?? "Spot"}
            </Text>
            <Text className="text-xs text-white opacity-80">{fecha}</Text>
          </View>
        </View>
        <View className="flex-row items-center gap-3">
          <Pressable onPress={handleExportar} hitSlop={12}>
            <Download size={20} color="white" />
          </Pressable>
          <Pressable onPress={handleEliminar} hitSlop={12}>
            <Trash2 size={20} color="white" />
          </Pressable>
          <MenuRapido />
        </View>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-4">
        {/* Métricas top */}
        <View className="flex-row flex-wrap gap-2">
          <View className="min-w-[140px] flex-1 rounded-xl bg-white dark:bg-slate-800 p-3">
            <Text className="text-xs uppercase text-slate-500 dark:text-slate-400">Duración</Text>
            <Text className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {formatearDuracion(metricas.duracionMs)}
            </Text>
          </View>
          <View className="min-w-[140px] flex-1 rounded-xl bg-white dark:bg-slate-800 p-3">
            <Text className="text-xs uppercase text-slate-500 dark:text-slate-400">Distancia</Text>
            <Text className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {metricas.distanciaMn.toFixed(2)} MN
            </Text>
          </View>
          <View className="min-w-[140px] flex-1 rounded-xl bg-white dark:bg-slate-800 p-3">
            <Text className="text-xs uppercase text-slate-500 dark:text-slate-400">SOG prom</Text>
            <Text className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {metricas.sogPromedio.toFixed(1)} kt
            </Text>
          </View>
          <View className="min-w-[140px] flex-1 rounded-xl bg-white dark:bg-slate-800 p-3">
            <Text className="text-xs uppercase text-slate-500 dark:text-slate-400">SOG máx</Text>
            <Text className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              {metricas.sogMax.toFixed(1)} kt
            </Text>
          </View>
        </View>

        {/* Performance promedio */}
        <View className="rounded-2xl bg-mar-700 p-5">
          <Text className="text-xs font-semibold uppercase text-white opacity-80">
            Performance promedio vs polar
          </Text>
          <View className="mt-2 flex-row items-baseline gap-2">
            <Text className="text-5xl font-bold text-white">
              {Math.round(metricas.performancePromedio)}
            </Text>
            <Text className="text-xl text-white">%</Text>
          </View>
          <Text className="mt-2 text-xs text-white opacity-80">
            Calculado con polar de {barco.nombre} y viento snapshot del inicio
          </Text>
        </View>

        {/* Distribución de tiempo */}
        <View className="gap-2 rounded-2xl bg-white dark:bg-slate-800 p-4">
          <Text className="text-sm font-semibold uppercase text-slate-700 dark:text-slate-200">
            Distribución de performance
          </Text>
          <View className="mt-2 h-3 flex-row overflow-hidden rounded-full">
            <View
              style={{ flex: metricas.pctTiempoSobrePolar }}
              className="bg-emerald-500"
            />
            <View
              style={{ flex: metricas.pctTiempoEnPolar }}
              className="bg-amber-400"
            />
            <View
              style={{ flex: metricas.pctTiempoBajoPolar }}
              className="bg-red-500"
            />
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-emerald-700">
              ≥100%: {Math.round(metricas.pctTiempoSobrePolar)}%
            </Text>
            <Text className="text-xs text-amber-700">
              90-100%: {Math.round(metricas.pctTiempoEnPolar)}%
            </Text>
            <Text className="text-xs text-red-700">
              &lt;90%: {Math.round(metricas.pctTiempoBajoPolar)}%
            </Text>
          </View>
        </View>

        {/* Ángulos promedio */}
        <View className="flex-row gap-2">
          <View className="flex-1 rounded-xl bg-mar-50 dark:bg-mar-900 p-3">
            <Text className="text-xs font-semibold uppercase text-mar-700 dark:text-mar-100">
              Ceñida (real)
            </Text>
            {metricas.twaPromedioCenida !== null ? (
              <>
                <Text className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {Math.round(metricas.twaPromedioCenida)}°
                </Text>
                <Text className="text-xs text-slate-600 dark:text-slate-300">
                  {metricas.sogPromedioCenida?.toFixed(1)} kt prom
                </Text>
              </>
            ) : (
              <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sin tiempo upwind
              </Text>
            )}
          </View>
          <View className="flex-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
            <Text className="text-xs font-semibold uppercase text-slate-700 dark:text-slate-200">
              Empopada (real)
            </Text>
            {metricas.twaPromedioEmpopada !== null ? (
              <>
                <Text className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                  {Math.round(metricas.twaPromedioEmpopada)}°
                </Text>
                <Text className="text-xs text-slate-600 dark:text-slate-300">
                  {metricas.sogPromedioEmpopada?.toFixed(1)} kt prom
                </Text>
              </>
            ) : (
              <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Sin tiempo downwind
              </Text>
            )}
          </View>
        </View>

        {/* Mapa del track */}
        <View className="gap-2 rounded-2xl bg-white dark:bg-slate-800 p-4">
          <Text className="text-sm font-semibold uppercase text-slate-700 dark:text-slate-200">
            Track recorrido
          </Text>
          <MapaTrack puntos={puntosAnalizados} />
        </View>

        {/* Gráfico SOG vs tiempo */}
        <View className="gap-2 rounded-2xl bg-white dark:bg-slate-800 p-4">
          <Text className="text-sm font-semibold uppercase text-slate-700 dark:text-slate-200">
            SOG real vs BSP teórico
          </Text>
          <GraficoSOG puntos={puntosAnalizados} />
        </View>

        {/* Viento snapshot */}
        {sesion.vientoSnapshot && (
          <View className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3">
            <Text className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
              Viento de referencia (inicio sesión)
            </Text>
            <Text className="mt-1 text-sm text-slate-800 dark:text-slate-100">
              {Math.round(sesion.vientoSnapshot.velocidadNudos)} kt ·{" "}
              {Math.round(sesion.vientoSnapshot.direccionGrados)}°
            </Text>
          </View>
        )}

        <Text className="px-4 text-center text-xs text-slate-500 dark:text-slate-400">
          Análisis basado en polar de referencia. Valores reales pueden variar
          por mar, calibración del barco y tripulación.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
