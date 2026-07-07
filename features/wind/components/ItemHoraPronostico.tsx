// Tarjeta chica para un punto del pronóstico (una hora).
// MODIFICADO EN PROMPT 3.1: prop opcional "destacado" para indicar selección.
// MODIFICADO EN PROMPT 9: muestra mini-indicadores de presión (hPa) y UV
// con color si UV es alto, debajo del dato de viento.

import { View, Text } from "react-native";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";

import { beaufortDesdeNudos } from "@/lib/beaufort";
import { gradosACardinal } from "@/lib/nautica";
import type { PuntoPronostico } from "../types";

type Props = {
  punto: PuntoPronostico;
  destacado?: boolean;
};

function colorUV(uv: number): string {
  if (uv >= 8) return "#fecaca"; // muy alto / extremo — rojo claro
  if (uv >= 6) return "#fed7aa"; // alto — naranja claro
  return "rgba(255,255,255,0.7)"; // bajo / moderado — neutro
}

export function ItemHoraPronostico({ punto, destacado = false }: Props) {
  const beaufort = beaufortDesdeNudos(punto.velocidadNudos);
  const fecha = new Date(punto.hora);
  const horaTexto = format(fecha, "HH'h'", { locale: es });
  const diaTexto = format(fecha, "EEE", { locale: es });

  const borderClass = destacado ? "border-2 border-mar-700" : "";

  return (
    <View
      className={`mr-2 w-20 rounded-xl p-3 ${beaufort.colorTw} ${borderClass}`}
    >
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

      {/* Mini-indicadores Prompt 9: presión, UV, lluvia */}
      {(punto.presionHpa != null ||
        punto.uv != null ||
        (punto.probLluvia ?? 0) > 0) && (
        <View className="mt-2 gap-0.5 border-t border-white/30 pt-1">
          {punto.presionHpa != null && (
            <Text
              className={`text-[10px] opacity-80 ${beaufort.textoTw}`}
              style={{ fontVariant: ["tabular-nums"] }}
            >
              {punto.presionHpa.toFixed(0)} hPa
            </Text>
          )}
          {punto.uv != null && (
            <Text
              className={`text-[10px] font-semibold ${beaufort.textoTw}`}
              style={{ color: punto.uv >= 6 ? colorUV(punto.uv) : undefined }}
            >
              UV {punto.uv.toFixed(1)}
            </Text>
          )}
          {(punto.probLluvia ?? 0) > 0 && (
            <Text className={`text-[10px] opacity-80 ${beaufort.textoTw}`}>
              💧 {Math.round(punto.probLluvia!)}%
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
