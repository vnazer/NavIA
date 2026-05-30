// Layout raíz de la app. Importa estilos globales, carga fuentes y configura SafeArea.
import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useTemaStore } from "@/lib/tema/store";
import { useVozStore } from "@/lib/voz/servicio";
import { View } from "react-native";
import { MenuRapido } from "@/components/MenuRapido";
import { useFonts } from "expo-font";

const headerConMenu = {
  headerRight: () => (
    <View style={{ paddingRight: 12 }}>
      <MenuRapido />
    </View>
  ),
};

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const oscuro = useTemaStore((s) => s.oscuro);

  const [loaded] = useFonts({
    "Inter-Regular": require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium": require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-Bold": require("../assets/fonts/Inter-Bold.ttf"),
    "JetBrainsMono-Bold": require("../assets/fonts/JetBrainsMono-Bold.ttf"),
    "JetBrainsMono-ExtraBold": require("../assets/fonts/JetBrainsMono-ExtraBold.ttf"),
  });

  // Sincronizar tema con NativeWind al arrancar y cuando cambia
  useEffect(() => {
    setColorScheme(oscuro ? "dark" : "light");
  }, [oscuro, setColorScheme]);

  // Inicializar stores (hidrata AsyncStorage) al arrancar
  useEffect(() => {
    useTemaStore.persist.rehydrate();
    useVozStore.persist.rehydrate();
  }, []);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style={oscuro ? "light" : "auto"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: oscuro ? "#0A0F18" : "#0a4d7a" },
          headerTintColor: "#ffffff",
          headerTitleStyle: { fontWeight: "600", fontFamily: "Inter-Bold" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "NavIA", ...headerConMenu }}
        />
        <Stack.Screen
          name="spots"
          options={{ title: "Elegir spot", ...headerConMenu }}
        />
        <Stack.Screen
          name="mapa"
          options={{ title: "Mapa de spots", ...headerConMenu }}
        />
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
