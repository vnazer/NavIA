// Pantalla de configuración: voz, tema y preferencias de la app.

import { View, Text, Pressable, Switch, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Volume2, Moon } from "lucide-react-native";
import { useVozStore } from "@/lib/voz/servicio";
import { useTemaStore } from "@/lib/tema/store";

function FilaConfig({
  icono,
  titulo,
  descripcion,
  valor,
  onToggle,
}: {
  icono: React.ReactNode;
  titulo: string;
  descripcion: string;
  valor: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800">
      <View className="rounded-lg bg-mar-50 p-2 dark:bg-mar-900">{icono}</View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-slate-900 dark:text-white">
          {titulo}
        </Text>
        <Text className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {descripcion}
        </Text>
      </View>
      <Switch
        value={valor}
        onValueChange={onToggle}
        trackColor={{ true: "#0e6ba8" }}
      />
    </View>
  );
}

export default function PantallaConfiguracion() {
  const router = useRouter();
  const vozActiva = useVozStore((s) => s.activo);
  const setVozActiva = useVozStore((s) => s.setActivo);
  const oscuro = useTemaStore((s) => s.oscuro);
  const toggleOscuro = useTemaStore((s) => s.toggleOscuro);

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="flex-row items-center gap-3 bg-mar-700 p-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={24} color="white" />
        </Pressable>
        <Text className="text-xl font-semibold text-white">Configuración</Text>
      </View>

      <ScrollView contentContainerClassName="p-4 gap-3">
        <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Voz
        </Text>
        <FilaConfig
          icono={<Volume2 size={18} color="#0a4d7a" />}
          titulo="Anuncios de voz"
          descripcion="Minutos, cuenta regresiva y alertas tácticas por voz."
          valor={vozActiva}
          onToggle={() => setVozActiva(!vozActiva)}
        />

        <Text className="mb-1 mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Apariencia
        </Text>
        <FilaConfig
          icono={<Moon size={18} color="#0a4d7a" />}
          titulo="Modo oscuro"
          descripcion="Reduce el brillo de pantalla en condiciones de poca luz."
          valor={oscuro}
          onToggle={toggleOscuro}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
