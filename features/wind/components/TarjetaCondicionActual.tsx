// Tarjeta destacada con condición de viento de una hora específica.
// MODIFICADO EN PROMPT 3.1: prop "label" para mostrar AHORA o una hora futura.

import { View, Text } from "react-native";
import { beaufortDesdeNudos } from "@/lib/beaufort";
import { formatearDireccion, formatearNudos } from "@/lib/nautica";
import type { PuntoPronostico } from "../types";

type Props = {
  punto: PuntoPronostico;
  label?: string; // Default "AHORA"
};

export function TarjetaCondicionActual({ punto, label = "AHORA" }: Props) {
  const beaufort = beaufortDesdeNudos(punto.velocidadNudos);

  return (
    <View className={`rounded-2xl p-6 ${beaufort.colorTw}`}>
      <Text className={`text-sm font-semibold opacity-80 ${beaufort.textoTw}`}>
        {label}
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
