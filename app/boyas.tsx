// Editor de boyas del spot actual. Acepta pegar el formato típico de
// los jueces (grados/minutos con N/S/E/W) o decimal. Cada línea es una
// boya, opcionalmente con "Nombre: coord".
//
// Las boyas guardadas acá son el "set predeterminado" del spot. Al
// iniciar una regata se copian al snapshot editable de la sesión.

import { useMemo, useState, useEffect } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, Trash2, Plus, MapPin } from "lucide-react-native";
import { SPOTS } from "@/features/spots/data/spots";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { useBoyasStore } from "@/features/boyas/store/useBoyasStore";
import { parsearTextoBoyas } from "@/features/boyas/lib/parserCoordenadas";
import type { Boya } from "@/features/boyas/types";

const EJEMPLO_PLACEHOLDER = `BL: 33°02.34'S 71°35.98'W
SO: 33°02.78'S 71°36.20'W
Lado 1: -33.0250, -71.6010
Lado 2: -33.0280, -71.5980`;

function confirmar(mensaje: string, onAceptar: () => void) {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.confirm(mensaje)) onAceptar();
  } else {
    Alert.alert("Confirmar", mensaje, [
      { text: "Cancelar", style: "cancel" },
      { text: "Aceptar", style: "destructive", onPress: onAceptar },
    ]);
  }
}

export default function PantallaBoyas() {
  const router = useRouter();
  const spotId = useSpotStore((s) => s.spotIdSeleccionado);
  const spot = useMemo(
    () => SPOTS.find((s) => s.id === spotId) ?? SPOTS[0],
    [spotId],
  );

  const boyasGuardadas = useBoyasStore((s) => s.boyasPorSpot[spot.id] ?? []);
  const setBoyas = useBoyasStore((s) => s.setBoyasDeSpot);
  const eliminarBoya = useBoyasStore((s) => s.eliminarBoya);

  const [texto, setTexto] = useState("");
  const [previewLineas, setPreviewLineas] = useState<
    ReturnType<typeof parsearTextoBoyas>
  >([]);

  // Parse en vivo mientras escribe
  useEffect(() => {
    setPreviewLineas(texto.trim() ? parsearTextoBoyas(texto) : []);
  }, [texto]);

  const handleAgregar = () => {
    const validas: Boya[] = previewLineas
      .filter((p) => p.resultado.ok)
      .map((p) => ({
        id: `boya-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        nombre: p.nombre,
        lat: (p.resultado as { ok: true; lat: number; lon: number }).lat,
        lon: (p.resultado as { ok: true; lat: number; lon: number }).lon,
      }));
    if (validas.length === 0) return;
    setBoyas(spot.id, [...boyasGuardadas, ...validas]);
    setTexto("");
  };

  const handleReemplazar = () => {
    confirmar(
      `¿Reemplazar todas las boyas de ${spot.nombre} por las nuevas?`,
      () => {
        const validas: Boya[] = previewLineas
          .filter((p) => p.resultado.ok)
          .map((p) => ({
            id: `boya-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            nombre: p.nombre,
            lat: (p.resultado as { ok: true; lat: number; lon: number }).lat,
            lon: (p.resultado as { ok: true; lat: number; lon: number }).lon,
          }));
        setBoyas(spot.id, validas);
        setTexto("");
      },
    );
  };

  const handleEliminar = (boyaId: string) => {
    confirmar("¿Eliminar esta boya?", () => eliminarBoya(spot.id, boyaId));
  };

  const validasCount = previewLineas.filter((p) => p.resultado.ok).length;
  const erroresCount = previewLineas.filter((p) => !p.resultado.ok).length;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center gap-3 bg-mar-700 p-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={24} color="white" />
        </Pressable>
        <View>
          <Text className="text-base font-semibold text-white">
            Boyas · {spot.nombre}
          </Text>
          <Text className="text-xs text-white opacity-80">
            {boyasGuardadas.length} guardada
            {boyasGuardadas.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-4">
        {/* Boyas actuales */}
        {boyasGuardadas.length > 0 && (
          <View className="gap-2 rounded-2xl bg-white p-4">
            <Text className="text-sm font-semibold uppercase text-slate-700">
              Set actual
            </Text>
            {boyasGuardadas.map((b) => (
              <View
                key={b.id}
                className="flex-row items-center justify-between rounded-xl bg-slate-50 p-3"
              >
                <View className="flex-row items-center gap-2">
                  <MapPin size={16} color="#ea580c" />
                  <View>
                    <Text className="text-sm font-semibold text-slate-900">
                      {b.nombre}
                    </Text>
                    <Text className="font-mono text-xs text-slate-500">
                      {b.lat.toFixed(5)}, {b.lon.toFixed(5)}
                    </Text>
                  </View>
                </View>
                <Pressable
                  onPress={() => handleEliminar(b.id)}
                  hitSlop={12}
                  className="rounded-lg p-2"
                >
                  <Trash2 size={16} color="#dc2626" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* Editor */}
        <View className="gap-3 rounded-2xl bg-white p-4">
          <View>
            <Text className="text-sm font-semibold uppercase text-slate-700">
              Pegá las coordenadas
            </Text>
            <Text className="mt-1 text-xs text-slate-500">
              Una boya por línea. Acepta &quot;33°02.34&apos;S 71°35.98&apos;W&quot;,
              decimal &quot;-33.039, -71.599&quot; o &quot;Nombre: coord&quot;.
            </Text>
          </View>

          <TextInput
            multiline
            value={texto}
            onChangeText={setTexto}
            placeholder={EJEMPLO_PLACEHOLDER}
            placeholderTextColor="#94a3b8"
            className="min-h-[140px] rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900"
            style={{ textAlignVertical: "top" }}
          />

          {/* Preview */}
          {previewLineas.length > 0 && (
            <View className="gap-1 rounded-xl bg-slate-50 p-3">
              <Text className="text-xs font-semibold uppercase text-slate-600">
                Vista previa
              </Text>
              {previewLineas.map((p, i) => (
                <View key={i} className="flex-row items-start gap-2">
                  <Text
                    className={
                      p.resultado.ok
                        ? "text-xs text-emerald-700"
                        : "text-xs text-red-600"
                    }
                  >
                    {p.resultado.ok ? "✓" : "✗"}
                  </Text>
                  <View className="flex-1">
                    <Text className="text-xs text-slate-700">
                      <Text className="font-semibold">{p.nombre}:</Text>{" "}
                      {p.resultado.ok
                        ? `${p.resultado.lat.toFixed(5)}, ${p.resultado.lon.toFixed(5)}`
                        : p.resultado.error}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Acciones */}
          {validasCount > 0 && (
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleAgregar}
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-mar-500 p-3"
              >
                <Plus size={16} color="white" />
                <Text className="text-sm font-semibold text-white">
                  Agregar {validasCount}
                </Text>
              </Pressable>
              {boyasGuardadas.length > 0 && (
                <Pressable
                  onPress={handleReemplazar}
                  className="flex-1 rounded-xl bg-slate-200 p-3"
                >
                  <Text className="text-center text-sm font-semibold text-slate-800">
                    Reemplazar todas
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {erroresCount > 0 && (
            <Text className="text-xs text-red-600">
              {erroresCount} línea{erroresCount !== 1 ? "s" : ""} con formato
              inválido — se ignorarán.
            </Text>
          )}
        </View>

        {boyasGuardadas.length === 0 && previewLineas.length === 0 && (
          <Text className="px-4 text-center text-xs text-slate-500">
            Las boyas se guardan por spot. Al iniciar una regata se copian a la
            sesión y podés editarlas ahí sin afectar este set.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
