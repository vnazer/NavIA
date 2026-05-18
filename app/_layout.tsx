// Layout raíz de la app. Importa estilos globales y configura SafeArea.
import "../global.css";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
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
      </Stack>
    </SafeAreaProvider>
  );
}
