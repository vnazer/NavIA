// Menú rápido global: botón con hamburguesa que abre un sheet con links
// a todas las pantallas principales. Pensado para incluir en el header de
// cualquier pantalla.

import { useState } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { useRouter } from "expo-router";
import { useTemaStore } from "@/lib/tema/store";
import {
  Menu,
  X,
  Home,
  MapPin,
  Map,
  Play,
  BookOpen,
  Compass,
  Anchor,
  Settings,
  Sailboat,
} from "lucide-react-native";

type Destino = {
  href: string;
  titulo: string;
  Icono: typeof Home;
};

const DESTINOS: Destino[] = [
  { href: "/", titulo: "Inicio · Pronóstico", Icono: Home },
  { href: "/spots", titulo: "Spots", Icono: MapPin },
  { href: "/mapa", titulo: "Mapa", Icono: Map },
  { href: "/regata", titulo: "Regata", Icono: Play },
  { href: "/tactica", titulo: "Modo táctico", Icono: Compass },
  { href: "/boyas", titulo: "Boyas", Icono: Anchor },
  { href: "/polar", titulo: "Polar del barco", Icono: Sailboat },
  { href: "/bitacora", titulo: "Bitácora", Icono: BookOpen },
  { href: "/configuracion", titulo: "Configuración", Icono: Settings },
];

type Props = {
  /** Color del ícono del botón (depende del header). Default: white. */
  color?: string;
};

export function MenuRapido({ color = "white" }: Props) {
  const router = useRouter();
  const oscuro = useTemaStore((s) => s.oscuro);
  const [abierto, setAbierto] = useState(false);
  const colorCerrar = oscuro ? "#cbd5e1" : "#475569";

  const ir = (href: string) => {
    setAbierto(false);
    // Pequeño delay para que cierre el modal antes de navegar
    setTimeout(() => router.push(href as never), 80);
  };

  return (
    <>
      <Pressable
        onPress={() => setAbierto(true)}
        hitSlop={12}
        accessibilityLabel="Abrir menú de navegación"
        accessibilityRole="button"
      >
        <Menu size={24} color={color} />
      </Pressable>

      <Modal
        visible={abierto}
        transparent
        animationType="fade"
        onRequestClose={() => setAbierto(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setAbierto(false)}
        >
          <Pressable
            className="ml-auto h-full w-72 bg-white dark:bg-slate-800 p-4 dark:bg-slate-900"
            onPress={(e) => e.stopPropagation()}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-slate-900 dark:text-white">
                Navegación
              </Text>
              <Pressable
                onPress={() => setAbierto(false)}
                hitSlop={12}
                accessibilityLabel="Cerrar menú"
                accessibilityRole="button"
              >
                <X size={22} color={colorCerrar} />
              </Pressable>
            </View>

            <View className="gap-1">
              {DESTINOS.map(({ href, titulo, Icono }) => (
                <Pressable
                  key={href}
                  onPress={() => ir(href)}
                  className="flex-row items-center gap-3 rounded-lg p-3 active:bg-slate-100 dark:active:bg-slate-800"
                >
                  <Icono size={18} color="#0a4d7a" />
                  <Text className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {titulo}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
