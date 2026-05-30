// Pantalla de configuración: voz, tema y preferencias de la app.

import { View, Text, Pressable, Switch, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ChevronLeft, Volume2, Moon, Plus, Trash2, ShieldAlert } from "lucide-react-native";
import { useVozStore, desbloquearVoz, decir } from "@/lib/voz/servicio";
import { useTemaStore } from "@/lib/tema/store";
import { MenuRapido } from "@/components/MenuRapido";
import { useSeguridadStore } from "@/features/seguridad/store/useSeguridadStore";
import { useState } from "react";

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

  const { contactosAyuda, agregarContacto, eliminarContacto } = useSeguridadStore();
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoTelefono, setNuevoTelefono] = useState("");

  const handleAgregar = () => {
    if (!nuevoNombre.trim() || !nuevoTelefono.trim()) {
      alert("Por favor ingresa un nombre y teléfono válidos.");
      return;
    }
    agregarContacto(nuevoNombre.trim(), nuevoTelefono.trim());
    setNuevoNombre("");
    setNuevoTelefono("");
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-900">
      <View className="flex-row items-center gap-3 bg-mar-700 p-4">
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <ChevronLeft size={24} color="white" />
        </Pressable>
        <Text className="flex-1 text-xl font-semibold text-white">Configuración</Text>
        <MenuRapido />
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
          onToggle={() => {
            const nuevo = !vozActiva;
            setVozActiva(nuevo);
            if (nuevo) {
              desbloquearVoz();
              // Test inmediato para confirmar que funciona en este navegador
              setTimeout(() => decir("Voz activada"), 50);
            }
          }}
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

        <Text className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Contactos de Emergencia SOS
        </Text>
        
        <View className="rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800 gap-3">
          <View className="flex-row items-center gap-2 border-b border-slate-100 pb-2 dark:border-slate-700">
            <ShieldAlert size={18} color="#dc2626" />
            <Text className="text-sm font-bold text-slate-900 dark:text-white">
              Contactos Guardados ({contactosAyuda.length})
            </Text>
          </View>
          
          {contactosAyuda.map((contacto) => (
            <View key={contacto.id} className="flex-row items-center justify-between border-b border-slate-50 py-2 dark:border-slate-700/50">
              <View className="flex-1">
                <Text className="text-sm font-semibold text-slate-800 dark:text-slate-100">{contacto.nombre}</Text>
                <Text className="text-xs text-slate-500 dark:text-slate-400">{contacto.telefono}</Text>
              </View>
              {/* No permitir borrar el número 137 nacional de emergencias */}
              {contacto.id !== "137" && (
                <Pressable
                  onPress={() => eliminarContacto(contacto.id)}
                  hitSlop={12}
                  className="rounded-lg bg-red-50 p-2 dark:bg-red-950/30"
                >
                  <Trash2 size={16} color="#ef4444" />
                </Pressable>
              )}
            </View>
          ))}
          
          {/* Formulario Agregar Nuevo */}
          <View className="mt-2 border-t border-slate-100 pt-3 dark:border-slate-700 gap-2">
            <Text className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Agregar Contacto Nuevo
            </Text>
            <View className="flex-row gap-2">
              <TextInput
                value={nuevoNombre}
                onChangeText={setNuevoNombre}
                placeholder="Nombre (ej: Marina)"
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
              />
              <TextInput
                value={nuevoTelefono}
                onChangeText={setNuevoTelefono}
                placeholder="Teléfono (ej: +569...)"
                keyboardType="phone-pad"
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                placeholderTextColor="#94a3b8"
              />
              <Pressable
                onPress={handleAgregar}
                className="items-center justify-center rounded-lg bg-mar-700 px-3 py-2"
              >
                <Plus size={16} color="white" />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
