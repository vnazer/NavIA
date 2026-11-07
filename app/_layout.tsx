// Layout raíz de la app. Importa estilos globales, carga fuentes y configura SafeArea.
import "../global.css";
import { useEffect } from "react";
import { Stack, type ErrorBoundaryProps } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { useTemaStore } from "@/lib/tema/store";
import { configurarAudioNativo, useVozStore } from "@/lib/voz/servicio";
import { View, Text, Pressable } from "react-native";
import { MenuRapido } from "@/components/MenuRapido";
import { useFonts } from "expo-font";
import { useAnunciosRaceTimer } from "@/features/race-timer/hooks/useRaceTimer";

const headerConMenu = {
  headerRight: () => (
    <View style={{ paddingRight: 12 }}>
      <MenuRapido />
    </View>
  ),
};

/**
 * Pantalla de error de expo-router: se muestra si una pantalla lanza una
 * excepción durante el render, en vez de dejar la app en blanco.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 12,
        backgroundColor: "#0A0F18",
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "700", color: "#FFFFFF", textAlign: "center" }}>
        Algo salió mal
      </Text>
      <Text style={{ fontSize: 14, color: "#D6DEE8", textAlign: "center" }}>
        La pantalla tuvo un error inesperado. Tus sesiones guardadas no se
        pierden. Intenta de nuevo.
      </Text>
      <Text style={{ fontSize: 11, color: "#8FA0B6", textAlign: "center" }}>
        {error.message}
      </Text>
      <Pressable
        onPress={retry}
        style={{
          marginTop: 8,
          backgroundColor: "#0e6ba8",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 10,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}>
          Reintentar
        </Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const oscuro = useTemaStore((s) => s.oscuro);

  // Si las fuentes fallan (error), seguimos igual con la fuente del sistema
  // en vez de quedar en pantalla en blanco para siempre.
  const [loaded, error] = useFonts({
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
    // Voz audible con el interruptor de silencio y con pantalla bloqueada
    void configurarAudioNativo();
  }, []);

  // Anuncios de voz/vibración del race timer: un solo lugar para toda la app
  useAnunciosRaceTimer();

  if (!loaded && !error) return null;

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
