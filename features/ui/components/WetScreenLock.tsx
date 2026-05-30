import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Vibration } from "react-native";
import { Lock, Unlock, Clock, Navigation } from "lucide-react-native";
import { useColores, useEsDeck } from "@/lib/tema";
import { decir } from "@/lib/voz/servicio";

type Props = {
  activo: boolean;
  onDesbloquear: () => void;
  sog: number;
  cog: number;
  vmg?: number;
  vmc?: number;
  distanciaBoya?: number;
  rumboBoya?: number;
};

export function WetScreenLock({
  activo,
  onDesbloquear,
  sog,
  cog,
  vmg,
  vmc,
  distanciaBoya,
  rumboBoya,
}: Props) {
  const c = useColores();
  const esDeck = useEsDeck();
  const [tiempoPresionado, setTiempoPresionado] = useState(0);
  const [horaActual, setHoraActual] = useState("");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Actualizar hora cada segundo
  useEffect(() => {
    const actualizarHora = () => {
      const ahora = new Date();
      setHoraActual(
        ahora.toLocaleTimeString("es-CL", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    actualizarHora();
    const interval = setInterval(actualizarHora, 1000);
    return () => clearInterval(interval);
  }, []);

  // Manejar la presión larga de 2 segundos para desbloqueo seguro
  const handlePressIn = () => {
    if (pressTimerRef.current) clearInterval(pressTimerRef.current);
    
    setTiempoPresionado(0);
    const start = Date.now();

    pressTimerRef.current = setInterval(() => {
      const delta = (Date.now() - start) / 2000; // Fracción de 2 segundos
      if (delta >= 1.0) {
        // Desbloquear!
        if (pressTimerRef.current) clearInterval(pressTimerRef.current);
        setTiempoPresionado(0);
        Vibration.vibrate(100);
        decir("Pantalla desbloqueada");
        onDesbloquear();
      } else {
        setTiempoPresionado(delta);
      }
    }, 50);
  };

  const handlePressOut = () => {
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setTiempoPresionado(0);
  };

  if (!activo) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: "#000000" }]}>
      {/* Indicador de Estado Bloqueado */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Lock size={18} color="#dc2626" />
          <Text style={styles.headerText}>MODO CUBIERTA - PANTALLA HÚMEDA BLOQUEADA</Text>
        </View>

        {/* Reloj de alta visibilidad */}
        <View style={styles.relojContainer}>
          <Clock size={16} color="#00FFE0" />
          <Text style={styles.relojText}>{horaActual}</Text>
        </View>
      </View>

      {/* Métricas Gigantes Glare-Proof */}
      <View style={styles.grid}>
        {/* Velocidad SOG */}
        <View style={[styles.card, { borderColor: "#EAFB00" }]}>
          <Text style={styles.label}>BSP / SOG (VELOCIDAD)</Text>
          <Text style={[styles.valorGigante, { color: "#EAFB00" }]}>
            {sog.toFixed(1)}
          </Text>
          <Text style={styles.sublabel}>NUDOS</Text>
        </View>

        {/* Rumbo COG */}
        <View style={[styles.card, { borderColor: "#00FFE0" }]}>
          <Text style={styles.label}>COG (RUMBO)</Text>
          <Text style={[styles.valorGigante, { color: "#00FFE0" }]}>
            {Math.round(cog)}°
          </Text>
          <Text style={styles.sublabel}>GRADOS</Text>
        </View>

        {/* VMG al Viento */}
        <View style={[styles.card, { borderColor: vmg && vmg >= 0 ? "#2EF07A" : "#dc2626" }]}>
          <Text style={styles.label}>VMG AL VIENTO</Text>
          <Text style={[styles.valorGigante, { color: vmg && vmg >= 0 ? "#2EF07A" : "#dc2626" }]}>
            {vmg != null ? vmg.toFixed(1) : "—"}
          </Text>
          <Text style={styles.sublabel}>NUDOS</Text>
        </View>

        {/* VMC o Waypoint */}
        <View style={[styles.card, { borderColor: "#c084fc" }]}>
          <Text style={styles.label}>
            {distanciaBoya != null ? "DISTANCIA A BOYA" : "VMC (A CURSO)"}
          </Text>
          {distanciaBoya != null ? (
            <Text style={[styles.valorGigante, { color: "#c084fc", fontSize: 54 }]}>
              {distanciaBoya >= 1000
                ? `${(distanciaBoya / 1852).toFixed(2)} NM`
                : `${distanciaBoya.toFixed(0)}m`}
            </Text>
          ) : (
            <Text style={[styles.valorGigante, { color: "#c084fc" }]}>
              {vmc != null ? vmc.toFixed(1) : "—"}
            </Text>
          )}
          <Text style={styles.sublabel}>
            {distanciaBoya != null && rumboBoya != null
              ? `RUMBO: ${Math.round(rumboBoya)}°`
              : "NUDOS"}
          </Text>
        </View>
      </View>

      {/* Botón de desbloqueo circular progresivo */}
      <View style={styles.footer}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            styles.unlockButton,
            {
              backgroundColor: pressed ? "rgba(220, 38, 38, 0.2)" : "rgba(255, 255, 255, 0.08)",
              borderColor: tiempoPresionado > 0 ? "#22c55e" : "#ff3a4a",
            },
          ]}
        >
          <View style={styles.unlockButtonContent}>
            <Unlock size={28} color={tiempoPresionado > 0 ? "#22c55e" : "#ff3a4a"} />
            <Text style={styles.unlockButtonText}>
              {tiempoPresionado > 0
                ? "MANTÉN PRESIONADO..."
                : "MANTÉN PRESIONADO 2S PARA DESBLOQUEAR"}
            </Text>
          </View>

          {/* Barra de progreso visual */}
          {tiempoPresionado > 0 && (
            <View
              style={[
                styles.progressBar,
                {
                  width: `${tiempoPresionado * 100}%`,
                  backgroundColor: "#22c55e",
                },
              ]}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    padding: 16,
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1.5,
    borderBottomColor: "#1e293b",
    paddingBottom: 10,
    marginTop: 8,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerText: {
    fontSize: 10,
    fontFamily: "Inter-Bold",
    color: "#ff3a4a",
    letterSpacing: 0.5,
  },
  relojContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0f172a",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#00FFE0",
  },
  relojText: {
    fontSize: 13,
    fontFamily: "Inter-Bold",
    color: "#00FFE0",
  },
  grid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginVertical: 20,
    alignContent: "center",
    justifyContent: "center",
  },
  card: {
    width: "47%",
    height: "43%",
    borderWidth: 2,
    borderRadius: 16,
    backgroundColor: "#0A0F18",
    padding: 12,
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 9,
    fontFamily: "Inter-Bold",
    color: "#94a3b8",
    textAlign: "center",
  },
  valorGigante: {
    fontSize: 60,
    fontFamily: "Inter-ExtraBold",
    textAlign: "center",
    lineHeight: 64,
  },
  sublabel: {
    fontSize: 10,
    fontFamily: "Inter-Bold",
    color: "#94a3b8",
    textAlign: "center",
  },
  footer: {
    alignItems: "center",
    marginBottom: 10,
  },
  unlockButton: {
    width: "100%",
    height: 64,
    borderRadius: 14,
    borderWidth: 2,
    overflow: "hidden",
    justifyContent: "center",
    position: "relative",
  },
  unlockButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    zIndex: 2,
  },
  unlockButtonText: {
    fontSize: 12,
    fontFamily: "Inter-Bold",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  progressBar: {
    position: "absolute",
    left: 0,
    bottom: 0,
    top: 0,
    zIndex: 1,
    opacity: 0.35,
  },
});
