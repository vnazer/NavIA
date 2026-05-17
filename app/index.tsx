// Pantalla principal: muestra condición actual y pronóstico del spot seleccionado.
import { ScrollView, View, Text, Pressable, ActivityIndicator } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, RefreshCw } from "lucide-react-native";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { usePronosticoViento } from "@/features/wind/hooks/usePronosticoViento";
import { TarjetaCondicionActual } from "@/features/wind/components/TarjetaCondicionActual";
import { ListaPronostico } from "@/features/wind/components/ListaPronostico";

export default function PantallaPrincipal() {
  const spot = useSpotStore((s) => s.getSpotActual());
  const { pronostico, cargando, error, recargar } = usePronosticoViento();

  // El primer punto con hora >= (ahora - 1h) = "ahora" en términos prácticos
  const ahora = pronostico?.puntos.find(
    (p) => new Date(p.hora) >= new Date(Date.now() - 60 * 60 * 1000),
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={["bottom"]}>
      <ScrollView contentContainerClassName="p-4 gap-4">
        {/* Header con spot actual */}
        <Link href="/spots" asChild>
          <Pressable className="flex-row items-center justify-between rounded-xl bg-white p-4 shadow-sm">
            <View className="flex-row items-center gap-3">
              <MapPin size={20} color="#0a4d7a" />
              <View>
                <Text className="text-lg font-semibold text-slate-900">
                  {spot.nombre}
                </Text>
                {spot.club && (
                  <Text className="text-xs text-slate-500">{spot.club}</Text>
                )}
              </View>
            </View>
            <Text className="text-sm text-mar-500">Cambiar</Text>
          </Pressable>
        </Link>

        {/* Estado: error */}
        {error && (
          <View className="rounded-xl bg-red-50 p-4">
            <Text className="text-sm text-red-700">{error}</Text>
            <Pressable
              onPress={recargar}
              className="mt-3 flex-row items-center gap-2 self-start rounded-lg bg-red-600 px-3 py-2"
            >
              <RefreshCw size={14} color="#fff" />
              <Text className="text-sm font-semibold text-white">Reintentar</Text>
            </Pressable>
          </View>
        )}

        {/* Estado: cargando sin datos previos */}
        {cargando && !pronostico && (
          <View className="items-center p-8">
            <ActivityIndicator size="large" color="#0a4d7a" />
            <Text className="mt-2 text-sm text-slate-500">
              Cargando pronóstico…
            </Text>
          </View>
        )}

        {/* Estado: con datos */}
        {ahora && <TarjetaCondicionActual punto={ahora} />}
        {pronostico && <ListaPronostico puntos={pronostico.puntos} />}

        {/* Footer con timestamp */}
        {pronostico && (
          <Text className="mt-2 text-center text-xs text-slate-400">
            Actualizado:{" "}
            {new Date(pronostico.generadoEn).toLocaleString("es-CL")}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
