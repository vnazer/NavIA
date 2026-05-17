// Tarjeta destacada con la condición de viento de la próxima hora pronosticada.
import { View, Text } from "react-native";
import { beaufortDesdeNudos } from "@/lib/beaufort";
import { formatearDireccion, formatearNudos } from "@/lib/nautica";
import type { PuntoPronostico } from "../types";

type Props = { punto: PuntoPronostico };

export function TarjetaCondicionActual({ punto }: Props) {
  const beaufort = beaufortDesdeNudos(punto.velocidadNudos);

  return (
    <View className={`rounded-2xl p-6 ${beaufort.colorTw}`}>
      <Text className={`text-sm font-semibold opacity-80 ${beaufort.textoTw}`}>
        AHORA
      </Text>
      <View className="mt-2 flex-row items-baseline gap-2">
        <Text className={`text-6xl font-bold ${beaufort.textoTw}`}>
          {Math.round(punto.velocidadNudos)}
        </Text>
        <Text className={`text-xl ${beaufort.textoTw}`}>kt</Text>
      </View>
      <Text className={`mt-1 text-base ${beaufort.textoTw}`}>
        Rachas {formatearNudos(punto.rachasNudos)}
      </Text>
      <Text className={`mt-3 text-base ${beaufort.textoTw}`}>
        {formatearDireccion(punto.direccionGrados)}
      </Text>
      <Text className={`mt-2 text-sm opacity-90 ${beaufort.textoTw}`}>
        Fuerza {beaufort.fuerza} · {beaufort.nombre}
      </Text>
    </View>
  );
}
