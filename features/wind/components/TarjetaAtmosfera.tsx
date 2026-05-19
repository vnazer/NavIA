// Card de condiciones atmosféricas adicionales: presión (con tendencia),
// UV (con nivel), visibilidad, prob máx. de lluvia en las próximas 3 horas.
//
// Aparece debajo de TarjetaCondicionActual. Las variables vienen de Open-Meteo
// vía el campo expandido del Prompt 9.

import { View, Text } from "react-native";
import { Gauge, Sun, CloudRain, Eye, Waves } from "lucide-react-native";
import type { PuntoPronostico } from "../types";

type Props = {
  /** Punto del momento (típicamente el primer punto futuro) */
  punto: PuntoPronostico | null | undefined;
  /** Próximas 3 horas a partir de ahora (incluído) — para tendencia y lluvia */
  proximas3hr: PuntoPronostico[];
};

function tendenciaPresion(actual: number, proximaHora3: number): string {
  const diff = proximaHora3 - actual;
  if (Math.abs(diff) < 0.3) return "estable";
  return diff > 0 ? "subiendo" : "bajando";
}

function nivelUV(uv: number): { label: string; color: string } {
  if (uv < 3) return { label: "Bajo", color: "#16a34a" };
  if (uv < 6) return { label: "Moderado", color: "#ca8a04" };
  if (uv < 8) return { label: "Alto", color: "#ea580c" };
  if (uv < 11) return { label: "Muy alto", color: "#dc2626" };
  return { label: "Extremo", color: "#7c2d12" };
}

export function TarjetaAtmosfera({ punto, proximas3hr }: Props) {
  if (!punto) return null;

  const presion = punto.presionHpa;
  const uv = punto.uv;
  const visKm = punto.visibilidadMt != null ? punto.visibilidadMt / 1000 : null;
  const probabilidades = proximas3hr.map((p) => p.probLluvia ?? 0);
  const probLluviaMax =
    probabilidades.length > 0 ? Math.max(...probabilidades) : 0;
  const olaMt = punto.olaMt;

  const presionFutura = proximas3hr[proximas3hr.length - 1]?.presionHpa;
  const tendencia =
    presion != null && presionFutura != null
      ? tendenciaPresion(presion, presionFutura)
      : null;
  const caidaPresion =
    presion != null && presionFutura != null ? presion - presionFutura : 0;

  return (
    <View className="gap-3 rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-sm">
      <Text className="text-sm font-semibold uppercase text-slate-700 dark:text-slate-200">
        Atmósfera
      </Text>

      <View className="flex-row flex-wrap gap-2">
        {/* Presión */}
        <View className="min-w-[140px] flex-1 rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
          <View className="mb-1 flex-row items-center gap-1">
            <Gauge size={14} color="#64748b" />
            <Text className="text-xs uppercase text-slate-500 dark:text-slate-400">Presión</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            {presion != null ? presion.toFixed(0) : "—"}
          </Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">
            hPa{tendencia ? ` · ${tendencia}` : ""}
          </Text>
        </View>

        {/* UV */}
        <View className="min-w-[140px] flex-1 rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
          <View className="mb-1 flex-row items-center gap-1">
            <Sun size={14} color="#64748b" />
            <Text className="text-xs uppercase text-slate-500 dark:text-slate-400">UV</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            {uv != null ? uv.toFixed(1) : "—"}
          </Text>
          <Text
            className="text-xs font-semibold"
            style={{ color: uv != null ? nivelUV(uv).color : "#64748b" }}
          >
            {uv != null ? nivelUV(uv).label : "sin datos"}
          </Text>
        </View>

        {/* Visibilidad */}
        <View className="min-w-[140px] flex-1 rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
          <View className="mb-1 flex-row items-center gap-1">
            <Eye size={14} color="#64748b" />
            <Text className="text-xs uppercase text-slate-500 dark:text-slate-400">
              Visibilidad
            </Text>
          </View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            {visKm != null ? visKm.toFixed(0) : "—"}
          </Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">km</Text>
        </View>

        {/* Lluvia 3hr */}
        <View className="min-w-[140px] flex-1 rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
          <View className="mb-1 flex-row items-center gap-1">
            <CloudRain size={14} color="#64748b" />
            <Text className="text-xs uppercase text-slate-500 dark:text-slate-400">Lluvia 3hr</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-900 dark:text-white">
            {probLluviaMax.toFixed(0)}%
          </Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400">prob. máx.</Text>
        </View>

        {/* Ola (solo si marine API devolvió algo) */}
        {olaMt != null && (
          <View className="min-w-[140px] flex-1 rounded-lg bg-slate-50 dark:bg-slate-900 p-3">
            <View className="mb-1 flex-row items-center gap-1">
              <Waves size={14} color="#64748b" />
              <Text className="text-xs uppercase text-slate-500 dark:text-slate-400">Ola sig.</Text>
            </View>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">
              {olaMt.toFixed(1)}
            </Text>
            <Text className="text-xs text-slate-500 dark:text-slate-400">metros</Text>
          </View>
        )}
      </View>

      {/* Aviso si presión cae fuerte */}
      {tendencia === "bajando" && caidaPresion > 2 && (
        <View className="rounded-lg border border-amber-200 bg-amber-50 p-2">
          <Text className="text-xs text-amber-800">
            ⚠️ Caída de presión {caidaPresion.toFixed(1)} hPa en 3hr — posible
            frente o tormenta. Revisá pronóstico extendido.
          </Text>
        </View>
      )}
    </View>
  );
}
