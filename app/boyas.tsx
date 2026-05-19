// Pantalla de gestión de boyas race-day. Lista todas las boyas activas
// agrupadas por tipo. Permite:
// - Agregar pegando coordenadas (formato náutico del juez por WhatsApp)
// - Eliminar boyas individuales
// - Limpiar todas (botón rojo)
//
// El otro flujo de agregar boyas es desde el mapa: click derecho / long-press
// (ver MapaSpotsInterno.web.tsx).

import { useState } from "react";
import {
  ScrollView,
  View,
  Text,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ChevronLeft,
  Trash2,
  Eraser,
  MapPin,
  ClipboardPaste,
} from "lucide-react-native";
import { useBoyasStore } from "@/features/boyas/store/useBoyasStore";
import { BOYA_META } from "@/features/boyas/types";
import { MenuRapido } from "@/components/MenuRapido";
import { ModalPegarCoordenadas } from "@/features/boyas/components/ModalPegarCoordenadas";

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
  const boyas = useBoyasStore((s) => s.boyas);
  const eliminar = useBoyasStore((s) => s.eliminarBoya);
  const limpiar = useBoyasStore((s) => s.limpiarTodas);

  const [modalPegarVisible, setModalPegarVisible] = useState(false);

  const handleLimpiar = () => {
    confirmar(
      `¿Eliminar las ${boyas.length} boyas? Esta acción no se puede deshacer.`,
      limpiar,
    );
  };

  const handleEliminar = (id: string) => {
    confirmar("¿Eliminar esta boya?", () => eliminar(id));
  };

  // Ordenar por tipo según ordenSugerido, después por fechaCreacion
  const boyasOrdenadas = [...boyas].sort((a, b) => {
    const diff =
      BOYA_META[a.tipo].ordenSugerido - BOYA_META[b.tipo].ordenSugerido;
    return diff !== 0 ? diff : a.fechaCreacion - b.fechaCreacion;
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="flex-row items-center justify-between gap-3 bg-mar-700 p-4">
        <View className="flex-1 flex-row items-center gap-3">
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ChevronLeft size={24} color="white" />
          </Pressable>
          <View>
            <Text className="text-base font-semibold text-white">
              Boyas race-day
            </Text>
            <Text className="text-xs text-white opacity-80">
              {boyas.length} activa{boyas.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>
        {boyas.length > 0 && (
          <Pressable
            onPress={handleLimpiar}
            className="flex-row items-center gap-1 rounded-lg bg-red-600 px-3 py-2"
          >
            <Eraser size={14} color="white" />
            <Text className="text-xs font-semibold text-white">Limpiar</Text>
          </Pressable>
        )}
        <MenuRapido />
      </View>

      <ScrollView contentContainerClassName="p-4 gap-3">
        {/* Acción: pegar coords del juez */}
        <Pressable
          onPress={() => setModalPegarVisible(true)}
          className="flex-row items-center justify-center gap-2 rounded-xl bg-mar-500 p-3"
        >
          <ClipboardPaste size={16} color="white" />
          <Text className="text-sm font-semibold text-white">
            Pegar coordenadas del juez
          </Text>
        </Pressable>

        <Text className="px-2 text-center text-xs text-slate-500 dark:text-slate-400">
          O entrá al{" "}
          <Text
            onPress={() => router.push("/mapa")}
            className="font-semibold text-mar-700 dark:text-mar-100"
          >
            mapa
          </Text>{" "}
          y hacé click derecho (web) o mantené tocado (mobile) sobre el agua
          para marcar una boya en ese punto.
        </Text>

        {boyas.length === 0 ? (
          <View className="mt-2 items-center gap-3 rounded-2xl bg-white dark:bg-slate-800 p-6">
            <MapPin size={32} color="#94a3b8" />
            <Text className="text-base font-semibold text-slate-800 dark:text-slate-100">
              No hay boyas marcadas
            </Text>
            <Text className="text-center text-xs text-slate-500 dark:text-slate-400">
              Cuando el juez envía las coords, las pegás acá. O las marcás en
              el mapa.
            </Text>
          </View>
        ) : (
          boyasOrdenadas.map((b) => {
            const meta = BOYA_META[b.tipo];
            return (
              <View
                key={b.id}
                className="flex-row items-center gap-3 rounded-xl bg-white dark:bg-slate-800 p-3"
              >
                <View
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${meta.color}20` }}
                >
                  <Text style={{ fontSize: 18 }}>{meta.emoji}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-slate-800 dark:text-slate-100">
                    {meta.nombre}
                    {b.label ? ` · ${b.label}` : ""}
                  </Text>
                  <Text className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {b.lat.toFixed(5)}, {b.lon.toFixed(5)}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleEliminar(b.id)}
                  className="p-2"
                  hitSlop={8}
                >
                  <Trash2 size={18} color="#dc2626" />
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>

      <ModalPegarCoordenadas
        visible={modalPegarVisible}
        onClose={() => setModalPegarVisible(false)}
      />
    </SafeAreaView>
  );
}
