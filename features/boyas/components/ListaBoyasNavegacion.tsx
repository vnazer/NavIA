// Lista táctica de boyas: cada una con distancia y rumbo desde la posición
// actual del barco. Útil durante la regata para saber a qué boya apuntar.

import { View, Text } from "react-native";
import { Compass, MapPin } from "lucide-react-native";
import { infoBoyasDesde } from "../lib/navegacionBoyas";
import type { Boya } from "../types";

type Props = {
  boyas: Boya[];
  posBarco: { lat: number; lon: number } | null;
};

function formatearDistancia(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1852).toFixed(2)} MN`;
}

export function ListaBoyasNavegacion({ boyas, posBarco }: Props) {
  if (boyas.length === 0) {
    return (
      <View className="rounded-xl bg-slate-100 p-3">
        <Text className="text-sm text-slate-600">
          No hay boyas cargadas para esta regata.
        </Text>
      </View>
    );
  }

  if (!posBarco) {
    return (
      <View className="gap-2">
        {boyas.map((b) => (
          <View
            key={b.id}
            className="flex-row items-center gap-2 rounded-xl bg-slate-50 p-3"
          >
            <MapPin size={14} color="#ea580c" />
            <View>
              <Text className="text-sm font-semibold text-slate-900">
                {b.nombre}
              </Text>
              <Text className="font-mono text-xs text-slate-500">
                {b.lat.toFixed(5)}, {b.lon.toFixed(5)}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  }

  const info = infoBoyasDesde(boyas, posBarco.lat, posBarco.lon);

  return (
    <View className="gap-2">
      {info.map((i) => (
        <View
          key={i.boya.id}
          className="flex-row items-center justify-between rounded-xl bg-slate-50 p-3"
        >
          <View className="flex-row items-center gap-2">
            <MapPin size={16} color="#ea580c" />
            <Text className="text-sm font-semibold text-slate-900">
              {i.boya.nombre}
            </Text>
          </View>
          <View className="flex-row items-center gap-4">
            <Text className="text-sm font-semibold text-slate-800">
              {formatearDistancia(i.distanciaMetros)}
            </Text>
            <View className="flex-row items-center gap-1">
              <Compass size={14} color="#475569" />
              <Text className="text-sm font-semibold text-slate-700">
                {Math.round(i.rumboGrados)}°
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}
