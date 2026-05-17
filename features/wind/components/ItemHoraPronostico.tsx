// Tarjeta chica para un punto del pronóstico (una hora).
// Pensada para ir en lista horizontal.
import { View, Text } from "react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { beaufortDesdeNudos } from "@/lib/beaufort";
import { gradosACardinal } from "@/lib/nautica";
import type { PuntoPronostico } from "../types";

type Props = { punto: PuntoPronostico };

export function ItemHoraPronostico({ punto }: Props) {
  const beaufort = beaufortDesdeNudos(punto.velocidadNudos);
  const fecha = new Date(punto.hora);
  const horaTexto = format(fecha, "HH'h'", { locale: es });
  const diaTexto = format(fecha, "EEE", { locale: es });

  return (
    <View className={`mr-2 w-20 rounded-xl p-3 ${beaufort.colorTw}`}>
      <Text className={`text-xs uppercase opacity-80 ${beaufort.textoTw}`}>
        {diaTexto}
      </Text>
      <Text className={`text-sm font-semibold ${beaufort.textoTw}`}>
        {horaTexto}
      </Text>
      <Text className={`mt-2 text-2xl font-bold ${beaufort.textoTw}`}>
        {Math.round(punto.velocidadNudos)}
      </Text>
      <Text className={`text-xs ${beaufort.textoTw}`}>
        {gradosACardinal(punto.direccionGrados)}
      </Text>
    </View>
  );
}
