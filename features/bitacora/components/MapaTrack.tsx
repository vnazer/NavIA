// Fallback mobile: por ahora placeholder. El mapa con react-native-maps
// queda para una iteración futura — la bitácora se ve mejor en web.

import { View, Text } from "react-native";
import type { PuntoAnalizado } from "../lib/analitica";

type Props = {
  puntos: PuntoAnalizado[];
};

export function MapaTrack(_props: Props) {
  return (
    <View className="items-center justify-center rounded-xl bg-slate-100 p-8">
      <Text className="text-sm text-slate-600">
        Mapa del track disponible en web.
      </Text>
      <Text className="mt-1 text-xs text-slate-500">
        En mobile se agregará en próxima versión.
      </Text>
    </View>
  );
}
