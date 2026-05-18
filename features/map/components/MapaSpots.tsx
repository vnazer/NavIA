// Placeholder para iOS y Android.
// La implementación real con react-native-maps llega en Prompt 5.
// Metro Bundler usa este archivo SOLO en mobile; en web usa MapaSpots.web.tsx.

import { View, Text } from "react-native";
import { Map } from "lucide-react-native";

export function MapaSpots() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-100 p-8">
      <Map size={48} color="#94a3b8" />
      <Text className="mt-4 text-center text-base font-semibold text-slate-700">
        Mapa interactivo
      </Text>
      <Text className="mt-2 text-center text-sm text-slate-500">
        El mapa con cartas náuticas de OpenSeaMap está disponible solo en
        navegador web por ahora.
      </Text>
      <Text className="mt-1 text-center text-xs text-slate-400">
        Próximamente en iOS y Android.
      </Text>
    </View>
  );
}
