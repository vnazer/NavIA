// Pantalla de selección de spot. Tap selecciona y vuelve atrás.
import { ScrollView, Pressable, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { SPOTS } from "@/features/spots/data/spots";
import { useSpotStore } from "@/features/spots/store/useSpotStore";

export default function PantallaSpots() {
  const router = useRouter();
  const spotIdActual = useSpotStore((s) => s.spotIdSeleccionado);
  const seleccionarSpot = useSpotStore((s) => s.seleccionarSpot);

  const seleccionar = (id: string) => {
    seleccionarSpot(id);
    router.back();
  };

  return (
    <ScrollView contentContainerClassName="p-4 gap-2 bg-slate-50">
      {SPOTS.map((spot) => {
        const esActual = spot.id === spotIdActual;
        return (
          <Pressable
            key={spot.id}
            onPress={() => seleccionar(spot.id)}
            className={`flex-row items-center justify-between rounded-xl p-4 ${
              esActual ? "bg-mar-500" : "bg-white"
            }`}
          >
            <View className="flex-1">
              <Text
                className={`text-base font-semibold ${
                  esActual ? "text-white" : "text-slate-900"
                }`}
              >
                {spot.nombre}
              </Text>
              {spot.club && (
                <Text
                  className={`text-xs ${
                    esActual ? "text-mar-100" : "text-slate-500"
                  }`}
                >
                  {spot.club}
                </Text>
              )}
              {spot.descripcion && (
                <Text
                  className={`mt-1 text-xs ${
                    esActual ? "text-mar-100" : "text-slate-600"
                  }`}
                >
                  {spot.descripcion}
                </Text>
              )}
            </View>
            {esActual && <Check size={20} color="#fff" />}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
