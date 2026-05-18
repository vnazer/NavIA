// Wrapper WEB del mapa de track. Carga el componente real con leaflet vía
// dynamic import + guard de cliente porque Expo Router con `output: static`
// hace render server-side y leaflet rompe sin window.

import { lazy, Suspense, useEffect, useState } from "react";
import { View, Text } from "react-native";
import type { PuntoAnalizado } from "../lib/analitica";

const MapaTrackInterno = lazy(() => import("./MapaTrackInterno.web"));

type Props = {
  puntos: PuntoAnalizado[];
};

export function MapaTrack({ puntos }: Props) {
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  if (puntos.length < 2) {
    return (
      <View className="items-center rounded-xl bg-slate-100 p-6">
        <Text className="text-sm text-slate-600">
          Track demasiado corto para mostrar.
        </Text>
      </View>
    );
  }

  if (!montado) {
    return (
      <View
        className="rounded-xl bg-slate-100"
        style={{ height: 360 }}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <View
          className="rounded-xl bg-slate-100"
          style={{ height: 360 }}
        />
      }
    >
      <MapaTrackInterno puntos={puntos} />
    </Suspense>
  );
}
