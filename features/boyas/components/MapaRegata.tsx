// Fallback mobile del mini-mapa.

import { View, Text } from "react-native";
import type { Boya } from "../types";

type Props = {
  posBarco: { lat: number; lon: number; cog?: number } | null;
  boyas: Boya[];
  fallback: { lat: number; lon: number };
};

export function MapaRegata(_props: Props) {
  return (
    <View className="items-center justify-center rounded-xl bg-slate-100 p-6">
      <Text className="text-sm text-slate-600">
        Mapa disponible en web.
      </Text>
    </View>
  );
}
