import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { LifeBuoy, AlertTriangle } from "lucide-react-native";
import { useSeguridadStore } from "../store/useSeguridadStore";
import { useGpsStore } from "@/features/regata/store/useGpsStore";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { SPOTS } from "@/features/spots/data/spots";
import { useColores } from "@/lib/tema";
import { decir } from "@/lib/voz/servicio";

export function PanelSeguridadBotones() {
  const { mobCoordenadas, activarMOB } = useSeguridadStore();
  const ultimoPunto = useGpsStore((s) => s.ultimoPunto);
  const spotId = useSpotStore((s) => s.spotIdSeleccionado);
  const customSpots = useSpotStore((s) => s.customSpots);
  const c = useColores();

  // No renderizar si MOB ya está activo (el MOBOverlay se encarga de mostrar la info completa)
  if (mobCoordenadas) return null;

  const handleActivarMOB = () => {
    let lat = 0;
    let lon = 0;

    if (ultimoPunto) {
      lat = ultimoPunto.lat;
      lon = ultimoPunto.lon;
    } else {
      // Fallback al spot seleccionado si no hay señal GPS en este instante
      const todos = [...SPOTS, ...customSpots];
      const spot = todos.find((s) => s.id === spotId) ?? SPOTS[0];
      lat = spot.lat;
      lon = spot.lon;
      decir("Advertencia: Sin señal GPS activa. Bloqueando posición estimada del puerto.");
    }

    activarMOB(lat, lon);
  };

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 12,
        marginVertical: 4,
      }}
    >
      {/* Botón Gigante de Hombre al Agua MOB */}
      <Pressable
        onPress={handleActivarMOB}
        style={{
          flex: 2,
          backgroundColor: "#dc2626",
          borderRadius: 16,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          borderWidth: 2,
          borderColor: "#ff8787",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        <LifeBuoy size={24} color="white" />
        <Text
          style={{
            fontSize: 15,
            fontFamily: "Inter-Bold",
            color: "white",
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Hombre al Agua
        </Text>
      </Pressable>

      {/* Botón Rápido de SOS manual */}
      <Pressable
        onPress={() => {
          Alert.alert(
            "Activar S.O.S de Emergencia",
            "¿Quieres forzar el estado de Hombre al Agua para transmitir coordenadas inmediatamente?",
            [
              { text: "Cancelar", style: "cancel" },
              {
                text: "Sí, SOS",
                style: "destructive",
                onPress: handleActivarMOB,
              },
            ]
          );
        }}
        style={{
          flex: 1,
          backgroundColor: "#7c3aed",
          borderRadius: 16,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          borderWidth: 1.5,
          borderColor: "#c084fc",
        }}
      >
        <AlertTriangle size={18} color="white" />
        <Text style={{ fontSize: 13, fontFamily: "Inter-Bold", color: "white" }}>
          S.O.S
        </Text>
      </Pressable>
    </View>
  );
}
