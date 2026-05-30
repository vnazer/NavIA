// Pantalla principal: pronóstico de viento del spot seleccionado.
// MODIFICADO EN PROMPT 3.1: ahora permite "viajar en el tiempo" tappeando
// las cards de Próximas 48h. El bloque AHORA se actualiza con la hora elegida.

import { useState, useMemo, useEffect } from "react";
import { SPOTS } from "@/features/spots/data/spots";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, RefreshCw, Map, Play, BookOpen, Settings } from "lucide-react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { useColorPorTema } from "@/lib/tema/colores";
import { usePronosticoViento } from "@/features/wind/hooks/usePronosticoViento";
import { TarjetaCondicionActual } from "@/features/wind/components/TarjetaCondicionActual";
import { TarjetaAtmosfera } from "@/features/wind/components/TarjetaAtmosfera";
import { ListaPronostico } from "@/features/wind/components/ListaPronostico";
import { CardPerformance } from "@/features/polar/components/CardPerformance";

export default function PantallaPrincipal() {
  const colorSettings = useColorPorTema("#334155", "#e2e8f0");
  // Derivar el spot actual desde primitivos del store para evitar loops
  // de re-render (un selector que devuelve {...spread} causa Maximum
  // update depth exceeded porque Zustand compara por Object.is).
  const spotId = useSpotStore((s) => s.spotIdSeleccionado);
  const overrides = useSpotStore((s) => s.overrides);
  const customSpots = useSpotStore((s) => s.customSpots);
  const spot = useMemo(() => {
    const todos = [...SPOTS, ...customSpots];
    const base = todos.find((s) => s.id === spotId) ?? SPOTS[0];
    const ov = overrides[base.id];
    return ov ? { ...base, lat: ov.lat, lon: ov.lon } : base;
  }, [spotId, overrides, customSpots]);

  const { pronostico, cargando, error, recargar } = usePronosticoViento();

  // Estado: índice de la hora seleccionada en el array de puntos.
  // Se inicializa cuando llegan los datos al primer punto futuro.
  const [indiceSeleccionado, setIndiceSeleccionado] = useState<number | null>(
    null,
  );

  // Calcular el índice "ahora" cuando llega el pronóstico
  const indiceAhora = useMemo(() => {
    if (!pronostico) return null;
    const ahoraTs = Date.now() - 60 * 60 * 1000;
    const idx = pronostico.puntos.findIndex(
      (p) => new Date(p.hora).getTime() >= ahoraTs,
    );
    return idx === -1 ? 0 : idx;
  }, [pronostico]);

  // Cuando llega el pronóstico, inicializar selección en "ahora"
  useEffect(() => {
    if (indiceAhora !== null && indiceSeleccionado === null) {
      setIndiceSeleccionado(indiceAhora);
    }
  }, [indiceAhora, indiceSeleccionado]);

  // Si se cambió de spot, resetear selección a "ahora" del nuevo pronóstico
  useEffect(() => {
    if (indiceAhora !== null) {
      setIndiceSeleccionado(indiceAhora);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spot.id]);

  const puntoSeleccionado =
    pronostico && indiceSeleccionado !== null
      ? pronostico.puntos[indiceSeleccionado]
      : null;

  const esAhora =
    indiceSeleccionado !== null && indiceSeleccionado === indiceAhora;

  // Label del bloque destacado
  const labelBloque = esAhora
    ? "AHORA"
    : puntoSeleccionado
      ? format(new Date(puntoSeleccionado.hora), "EEE HH:mm 'hrs'", {
          locale: es,
        }).toUpperCase()
      : "AHORA";

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900" edges={["bottom"]}>
      <ScrollView contentContainerClassName="p-4 gap-4">
        {/* Header con spot actual + botón mapa */}
        <View className="gap-2">
          <Link href="/spots" asChild>
            <Pressable className="flex-row items-center justify-between rounded-xl bg-white dark:bg-slate-800 p-4 shadow-sm">
              <View className="flex-row items-center gap-3">
                <MapPin size={20} color="#0a4d7a" />
                <View>
                  <Text className="text-lg font-semibold text-slate-900 dark:text-white">
                    {spot.nombre}
                  </Text>
                  {spot.club && (
                    <Text className="text-xs text-slate-500 dark:text-slate-400">{spot.club}</Text>
                  )}
                </View>
              </View>
              <Text className="text-sm text-mar-500">Cambiar</Text>
            </Pressable>
          </Link>

          <View className="flex-row gap-2">
            <Link href="/mapa" asChild>
              <Pressable className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-mar-500 p-3">
                <Map size={16} color="#ffffff" />
                <Text className="text-xs font-semibold text-white">Mapa</Text>
              </Pressable>
            </Link>
            <Link href="/regata" asChild>
              <Pressable className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-600 p-3">
                <Play size={16} color="#ffffff" />
                <Text className="text-xs font-semibold text-white">
                  Regata
                </Text>
              </Pressable>
            </Link>
            <Link href="/bitacora" asChild>
              <Pressable className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-slate-700 p-3">
                <BookOpen size={16} color="#ffffff" />
                <Text className="text-xs font-semibold text-white">
                  Bitácora
                </Text>
              </Pressable>
            </Link>
            <Link href={"/configuracion" as never} asChild>
              <Pressable className="flex-row items-center justify-center rounded-xl bg-slate-200 p-3 dark:bg-slate-700">
                <Settings size={16} color={colorSettings} />
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Error */}
        {error && (
          <View className="rounded-xl bg-red-50 p-4">
            <Text className="text-sm text-red-700">{error}</Text>
            <Pressable
              onPress={recargar}
              className="mt-3 flex-row items-center gap-2 self-start rounded-lg bg-red-600 px-3 py-2"
            >
              <RefreshCw size={14} color="#fff" />
              <Text className="text-sm font-semibold text-white">
                Reintentar
              </Text>
            </Pressable>
          </View>
        )}

        {/* Cargando */}
        {cargando && !pronostico && (
          <View className="items-center p-8">
            <ActivityIndicator size="large" color="#0a4d7a" />
            <Text className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Cargando pronóstico…
            </Text>
          </View>
        )}

        {/* Bloque destacado: AHORA o hora seleccionada */}
        {puntoSeleccionado && (
          <TarjetaCondicionActual
            punto={puntoSeleccionado}
            label={labelBloque}
          />
        )}

        {/* NUEVO en Prompt 9: condiciones atmosféricas extra */}
        {puntoSeleccionado && pronostico && indiceSeleccionado !== null && (
          <TarjetaAtmosfera
            punto={puntoSeleccionado}
            proximas3hr={pronostico.puntos.slice(
              indiceSeleccionado,
              indiceSeleccionado + 4,
            )}
          />
        )}

        {/* NUEVO en Prompt 4: card de performance del barco */}
        {puntoSeleccionado && <CardPerformance punto={puntoSeleccionado} />}

        {/* Botón "volver a ahora" si la selección no es ahora */}
        {!esAhora && indiceAhora !== null && (
          <Pressable
            onPress={() => setIndiceSeleccionado(indiceAhora)}
            className="self-center rounded-full bg-slate-200 px-4 py-2"
          >
            <Text className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              ← Volver a AHORA
            </Text>
          </Pressable>
        )}

        {/* Lista tappable */}
        {pronostico && indiceSeleccionado !== null && (
          <ListaPronostico
            puntos={pronostico.puntos}
            indiceSeleccionado={indiceSeleccionado}
            onSeleccionar={setIndiceSeleccionado}
          />
        )}

        {/* Footer */}
        {pronostico && (
          <Text className="mt-2 text-center text-xs text-slate-400 dark:text-slate-500">
            Actualizado:{" "}
            {new Date(pronostico.generadoEn).toLocaleString("es-CL")}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
