// Layout raíz de la app. Importa estilos globales y configura SafeArea.
import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useTemaStore } from "@/lib/tema/store";
import { useVozStore } from "@/lib/voz/servicio";

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const oscuro = useTemaStore((s) => s.oscuro);

  // Sincronizar tema con NativeWind al arrancar y cuando cambia
  useEffect(() => {
    setColorScheme(oscuro ? "dark" : "light");
  }, [oscuro, setColorScheme]);

  // Inicializar stores (hidrata AsyncStorage) al arrancar
  useEffect(() => {
    useTemaStore.persist.rehydrate();
    useVozStore.persist.rehydrate();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style={oscuro ? "light" : "auto"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0a4d7a" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "NavIA" }} />
        <Stack.Screen name="spots" options={{ title: "Elegir spot" }} />
        <Stack.Screen name="mapa" options={{ title: "Mapa de spots" }} />
        <Stack.Screen name="polar" options={{ headerShown: false }} />
        <Stack.Screen name="regata" options={{ headerShown: false }} />
        <Stack.Screen name="boyas" options={{ headerShown: false }} />
        <Stack.Screen name="tactica" options={{ headerShown: false }} />
        <Stack.Screen name="bitacora/index" options={{ headerShown: false }} />
        <Stack.Screen name="bitacora/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="configuracion" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
