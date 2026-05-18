// Pantalla con visualización completa del polar del barco seleccionado.
// Acceso desde la pantalla principal vía link "Ver diagrama polar completo".

import { useMemo } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SPOTS } from "@/features/spots/data/spots";
import { useBarcoStore } from "@/features/polar/store/useBarcoStore";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { usePronosticoViento } from "@/features/wind/hooks/usePronosticoViento";
import { VisualizadorPolar } from "@/features/polar/components/VisualizadorPolar";
import { SelectorBarco } from "@/features/polar/components/SelectorBarco";
import { calcularOptimos } from "@/features/polar/lib/calculos";

export default function PantallaPolar() {
  const router = useRouter();
  const barco = useBarcoStore((s) => s.getBarcoActual());

  // Derivar spot desde primitivos para evitar loop infinito (mismo patrón
  // que app/index.tsx — getSpotActual hace spread con overrides).
  const spotId = useSpotStore((s) => s.spotIdSeleccionado);
  const overrides = useSpotStore((s) => s.overrides);
  const spot = useMemo(() => {
    const base = SPOTS.find((s) => s.id === spotId) ?? SPOTS[0];
    const ov = overrides[base.id];
    return ov ? { ...base, lat: ov.lat, lon: ov.lon } : base;
  }, [spotId, overrides]);

  const { pronostico } = usePronosticoViento();

  // TWS actual: viento del primer punto futuro del pronóstico
  const twsActual = useMemo(() => {
    if (!pronostico) return 10; // default razonable
    const ahora = Date.now();
    const punto = pronostico.puntos.find(
      (p) => new Date(p.hora).getTime() >= ahora,
    );
    return punto?.velocidadNudos ?? pronostico.puntos[0]?.velocidadNudos ?? 10;
  }, [pronostico]);

  const optimos = useMemo(
    () => calcularOptimos(barco.polar, twsActual),
    [barco.polar, twsActual],
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center gap-3 bg-mar-700 p-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={24} color="white" />
        </Pressable>
        <Text className="text-xl font-semibold text-white">
          Diagrama polar
        </Text>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-4">
        {/* Selector de barco arriba */}
        <View
          className="flex-row items-center justify-between rounded-xl bg-white p-4"
          style={{ zIndex: 10 }}
        >
          <View>
            <Text className="text-xs uppercase text-slate-500">Barco</Text>
            <Text className="mt-1 text-base font-semibold text-slate-900">
              {barco.nombre}
            </Text>
            <Text className="text-xs text-slate-500">{barco.clase}</Text>
          </View>
          <SelectorBarco />
        </View>

        {/* Contexto: viento actual del spot */}
        <View className="rounded-xl bg-mar-50 p-4">
          <Text className="text-xs uppercase text-mar-700">Calculado para</Text>
          <Text className="mt-1 text-base font-semibold text-slate-900">
            {spot.nombre} · {Math.round(twsActual)} kt
          </Text>
        </View>

        {/* SVG del polar */}
        <View className="items-center rounded-2xl bg-white p-4 shadow-sm">
          <VisualizadorPolar polar={barco.polar} twsActual={twsActual} size={360} />
        </View>

        {/* Tabla de óptimos */}
        <View className="gap-2 rounded-2xl bg-white p-5 shadow-sm">
          <Text className="mb-1 text-sm font-semibold uppercase text-slate-700">
            Óptimos para {Math.round(twsActual)} kt
          </Text>

          <View className="flex-row gap-2">
            <View className="flex-1 rounded-xl bg-mar-50 p-3">
              <Text className="text-xs font-semibold uppercase text-mar-700">
                Ceñida
              </Text>
              <Text className="mt-1 text-2xl font-bold text-slate-900">
                {Math.round(optimos.twaOptimoCenida)}°
              </Text>
              <Text className="text-sm text-slate-700">
                {optimos.bspCenida.toFixed(1)} kt
              </Text>
              <Text className="mt-1 text-xs text-mar-700">
                VMG {optimos.vmgCenida.toFixed(1)} kt
              </Text>
            </View>

            <View className="flex-1 rounded-xl bg-slate-100 p-3">
              <Text className="text-xs font-semibold uppercase text-slate-700">
                Empopada
              </Text>
              <Text className="mt-1 text-2xl font-bold text-slate-900">
                {Math.round(optimos.twaOptimoEmpopada)}°
              </Text>
              <Text className="text-sm text-slate-700">
                {optimos.bspEmpopada.toFixed(1)} kt
              </Text>
              <Text className="mt-1 text-xs text-slate-700">
                VMG {optimos.vmgEmpopada.toFixed(1)} kt
              </Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <Text className="px-4 text-center text-xs text-slate-500">
          Polar genérico de referencia. Los valores reales del barco pueden
          variar según peso de tripulación, estado del casco, velas y mar.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
