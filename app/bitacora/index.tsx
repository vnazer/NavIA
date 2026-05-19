// Pantalla lista de bitácora: muestra todas las sesiones guardadas.

import { ScrollView, View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, BookOpen } from "lucide-react-native";
import { useRegataStore } from "@/features/regata/store/useRegataStore";
import { TarjetaSesion } from "@/features/bitacora/components/TarjetaSesion";
import { MenuRapido } from "@/components/MenuRapido";

export default function PantallaBitacora() {
  const router = useRouter();
  const sesiones = useRegataStore((s) => s.sesionesHistoricas);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center gap-3 bg-mar-700 p-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={24} color="white" />
        </Pressable>
        <Text className="flex-1 text-xl font-semibold text-white">Bitácora</Text>
        <MenuRapido />
      </View>

      <ScrollView contentContainerClassName="p-4 gap-3">
        {sesiones.length === 0 && (
          <View className="items-center gap-3 rounded-2xl bg-white p-8">
            <BookOpen size={36} color="#94a3b8" />
            <Text className="text-base font-semibold text-slate-800">
              Aún no hay sesiones grabadas
            </Text>
            <Text className="text-center text-sm text-slate-500">
              Iniciá una regata desde la pantalla principal para empezar a
              registrar tus salidas.
            </Text>
          </View>
        )}

        {sesiones.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => router.push(`/bitacora/${s.id}` as never)}
          >
            <TarjetaSesion sesion={s} />
          </Pressable>
        ))}

        {sesiones.length > 0 && (
          <Text className="mt-2 text-center text-xs text-slate-400">
            {sesiones.length} sesión{sesiones.length !== 1 ? "es" : ""}{" "}
            registrada{sesiones.length !== 1 ? "s" : ""}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
