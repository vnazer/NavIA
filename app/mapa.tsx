// Pantalla del mapa interactivo de spots de regata.
// Render: en web carga MapaSpots.web.tsx (react-leaflet),
// en iOS/Android carga MapaSpots.tsx (placeholder).

import { View } from "react-native";
import { MapaSpots } from "@/features/map/components/MapaSpots";

export default function PantallaMapa() {
  return (
    <View className="flex-1">
      <MapaSpots />
    </View>
  );
}
