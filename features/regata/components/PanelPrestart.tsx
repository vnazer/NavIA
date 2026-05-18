// Modo prestart: línea de salida + distance-to-line + time-to-burn + favored end.
// Lee la posición del barco del store global useGpsStore.
// El time-to-burn usa el countdown del race timer.

import { View, Text, Pressable } from "react-native";
import { X, AlertTriangle, Check } from "lucide-react-native";
import { useTacticaStore } from "../store/useTacticaStore";
import { useGpsStore } from "../store/useGpsStore";
import { useBoyasStore } from "@/features/boyas/store/useBoyasStore";
import {
  distanciaPerpendicularALinea,
  calcularFavoredEnd,
  calcularTimeToBurn,
} from "../lib/geometria-linea";

type Props = {
  vientoGrados: number;
  segundosAlStart: number;
};

export function PanelPrestart({ vientoGrados, segundosAlStart }: Props) {
  const limpiar = useTacticaStore((s) => s.limpiarLineaSalida);
  const committeeId = useTacticaStore((s) => s.boyaCommitteeId);
  const pinId = useTacticaStore((s) => s.boyaPinId);
  const boyas = useBoyasStore((s) => s.boyas);
  const committee = boyas.find((b) => b.id === committeeId);
  const pin = boyas.find((b) => b.id === pinId);
  const ultimoPunto = useGpsStore((s) => s.ultimoPunto);

  if (!committee || !pin) {
    return (
      <View className="rounded-xl border border-amber-200 bg-amber-50 p-4">
        <Text className="text-amber-800">
          Falta committee o pin. Reconfigurá la línea.
        </Text>
        <Pressable onPress={limpiar} className="mt-2">
          <Text className="text-sm font-semibold text-amber-900">
            Volver al selector
          </Text>
        </Pressable>
      </View>
    );
  }

  const dtl = ultimoPunto
    ? distanciaPerpendicularALinea(
        ultimoPunto.lat,
        ultimoPunto.lon,
        committee.lat,
        committee.lon,
        pin.lat,
        pin.lon,
        vientoGrados,
      )
    : { distanciaMt: 0, estaOcs: false };

  const fav = calcularFavoredEnd(
    committee.lat,
    committee.lon,
    pin.lat,
    pin.lon,
    vientoGrados,
  );

  const ttb = calcularTimeToBurn(
    dtl.distanciaMt,
    ultimoPunto?.sogKts ?? 0,
    segundosAlStart,
  );

  const colorTtb =
    ttb == null
      ? "#f1f5f9"
      : ttb < -2
        ? "#fee2e2"
        : ttb < 5
          ? "#dcfce7"
          : ttb < 15
            ? "#fef3c7"
            : "#fee2e2";

  const textoTtb =
    ttb == null
      ? "Necesitás más SOG"
      : ttb < -2
        ? "Vas a llegar tarde — acelerá"
        : ttb < 5
          ? "Timing perfecto"
          : ttb < 15
            ? "Demasiado rápido — frená"
            : "Muy lejos o muy lento";

  return (
    <View className="gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <View className="flex-row items-center justify-between">
        <Text className="text-base font-semibold text-slate-900">
          Línea de salida
        </Text>
        <Pressable onPress={limpiar} hitSlop={8} className="p-2">
          <X size={20} color="#64748b" />
        </Pressable>
      </View>

      {/* Estado sin GPS */}
      {!ultimoPunto && (
        <View className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <Text className="text-sm text-slate-600">
            Iniciá el tracking GPS en /regata para ver distance-to-line.
          </Text>
        </View>
      )}

      {/* OCS warning */}
      {ultimoPunto && dtl.estaOcs && (
        <View className="flex-row items-center gap-2 rounded-lg border border-red-300 bg-red-100 p-3">
          <AlertTriangle size={18} color="#dc2626" />
          <Text className="flex-1 font-semibold text-red-800">
            OCS — cruzaste la línea, regresá ya
          </Text>
        </View>
      )}

      {/* Distance to line */}
      {ultimoPunto && (
        <View className="my-1 items-center">
          <Text className="text-xs uppercase text-slate-500">
            Distancia a línea
          </Text>
          <Text className="text-5xl font-bold text-slate-800">
            {dtl.distanciaMt.toFixed(0)}
          </Text>
          <Text className="text-sm text-slate-500">metros</Text>
        </View>
      )}

      {/* Time to burn */}
      {ultimoPunto && (
        <View
          className="items-center rounded-lg p-3"
          style={{ backgroundColor: colorTtb }}
        >
          <Text className="text-xs uppercase text-slate-600">Time to burn</Text>
          <Text className="text-3xl font-bold text-slate-900">
            {ttb == null
              ? "—"
              : `${ttb > 0 ? "+" : ""}${ttb.toFixed(0)}s`}
          </Text>
          <Text className="text-xs text-slate-700">{textoTtb}</Text>
        </View>
      )}

      {/* Favored end */}
      <View className="rounded-lg bg-slate-50 p-3">
        <Text className="text-xs uppercase text-slate-500">
          Lado favorecido (viento {vientoGrados.toFixed(0)}°)
        </Text>
        <View className="mt-1 flex-row items-center gap-2">
          {fav.favorecido === "neutro" ? (
            <Text className="font-semibold text-slate-700">
              Línea neutra — sin ventaja clara
            </Text>
          ) : (
            <>
              <Check size={18} color="#16a34a" />
              <Text className="font-semibold text-slate-900">
                {fav.favorecido === "pin" ? "Pin end" : "Committee boat"}
              </Text>
              <Text className="text-slate-500">
                · ventaja {fav.ventajaMt.toFixed(0)}m
              </Text>
            </>
          )}
        </View>
      </View>

      {/* SOG / segundos al start */}
      <View className="flex-row gap-2">
        <View className="flex-1 items-center rounded-lg bg-slate-50 p-2">
          <Text className="text-xs text-slate-500">SOG</Text>
          <Text className="text-lg font-bold text-slate-900">
            {ultimoPunto ? `${ultimoPunto.sogKts.toFixed(1)} kt` : "—"}
          </Text>
        </View>
        <View className="flex-1 items-center rounded-lg bg-slate-50 p-2">
          <Text className="text-xs text-slate-500">Al start</Text>
          <Text className="text-lg font-bold text-slate-900">
            {Math.max(0, Math.round(segundosAlStart))}s
          </Text>
        </View>
      </View>
    </View>
  );
}
