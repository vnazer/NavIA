import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Linking, Platform } from "react-native";
import { AlertOctagon, Navigation, Share2, Phone, X, AlertTriangle } from "lucide-react-native";
import { useSeguridadStore } from "../store/useSeguridadStore";
import { useGpsStore } from "@/features/regata/store/useGpsStore";
import { useColores, useEsDeck } from "@/lib/tema";
import { decir } from "@/lib/voz/servicio";
import { distanciaMetros, calcularRumbo, metrosAMillasNauticas } from "@/features/regata/lib/geo";

export function MOBOverlay() {
  const { mobCoordenadas, contactosAyuda, desactivarMOB, setSOSActivo, SOSActivo } = useSeguridadStore();
  const ultimoPunto = useGpsStore((s) => s.ultimoPunto);
  const c = useColores();
  const esDeck = useEsDeck();
  const timerAnuncioRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [distancia, setDistancia] = useState<number>(0);
  const [bearing, setBearing] = useState<number>(0);

  // Loop de Anuncios de Voz de Emergencia cada 15 segundos
  useEffect(() => {
    if (!mobCoordenadas) return;

    // Primer anuncio inmediato
    decir("Alerta: Hombre al agua. Vira de inmediato para retornar.");

    timerAnuncioRef.current = setInterval(() => {
      decir("Hombre al agua. Regresa al rumbo.");
    }, 15000);

    return () => {
      if (timerAnuncioRef.current) {
        clearInterval(timerAnuncioRef.current);
      }
    };
  }, [mobCoordenadas]);

  // Recalcular distancia y rumbo en vivo
  useEffect(() => {
    if (!mobCoordenadas || !ultimoPunto) return;

    const d = distanciaMetros(
      ultimoPunto.lat,
      ultimoPunto.lon,
      mobCoordenadas.lat,
      mobCoordenadas.lon
    );
    const b = calcularRumbo(
      ultimoPunto.lat,
      ultimoPunto.lon,
      mobCoordenadas.lat,
      mobCoordenadas.lon
    );

    setDistancia(d);
    setBearing(b);
  }, [ultimoPunto, mobCoordenadas]);

  if (!mobCoordenadas) return null;

  // Formatear mensaje SOS
  const latStr = mobCoordenadas.lat.toFixed(6);
  const lonStr = mobCoordenadas.lon.toFixed(6);
  const mapLink = `https://www.openstreetmap.org/?mlat=${latStr}&mlon=${lonStr}#map=18`;
  const mensajeSOS = `¡NavIA SOS! HOMBRE AL AGUA. Coordenadas: Lat ${latStr}, Lon ${lonStr}. Distancia de retorno: ${distancia.toFixed(0)}m, Rumbo: ${bearing.toFixed(0)}°. Mapa: ${mapLink}`;

  // Gatillar SMS de Emergencia
  const enviarSOSSms = (telefono: string) => {
    const separator = Platform.OS === "ios" ? "&" : "?";
    const url = `sms:${telefono}${separator}body=${encodeURIComponent(mensajeSOS)}`;
    Linking.openURL(url).catch(() => {
      // Fallback a share genérico
      alert("No se pudo abrir la app de mensajería.");
    });
  };

  // Llamar contacto/Guardacostas
  const llamarTelefono = (telefono: string) => {
    Linking.openURL(`tel:${telefono}`).catch(() => {
      alert("No se pudo iniciar la llamada.");
    });
  };

  // Calcular diferencia de rumbo relativa para la flecha
  const rumboActualBarco = ultimoPunto?.cogGrados ?? 0;
  const difRumboRelativa = (bearing - rumboActualBarco + 360) % 360;

  return (
    <View
      style={{
        backgroundColor: "#000000",
        borderColor: "#dc2626",
        borderWidth: esDeck ? 3 : 2,
        borderRadius: 20,
        padding: 16,
        gap: 14,
        marginVertical: 10,
        shadowColor: "#dc2626",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
      }}
    >
      {/* Cabecera Roja de Emergencia */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <AlertOctagon size={28} color="#dc2626" />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 18, fontFamily: "Inter-Bold", color: "#FFFFFF" }}>
            🚨 HOMBRE AL AGUA (M.O.B.)
          </Text>
          <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
            Coordenadas bloqueadas en el GPS al instante
          </Text>
        </View>
        <Pressable
          onPress={desactivarMOB}
          style={{
            backgroundColor: "#22c55e",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
          }}
        >
          <Text style={{ fontSize: 12, fontFamily: "Inter-Bold", color: "#000000" }}>
            A SALVO
          </Text>
        </Pressable>
      </View>

      {/* Información del Retorno */}
      <View
        style={{
          flexDirection: "row",
          gap: 12,
          backgroundColor: "#111827",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        {/* Indicador de Rumbo de Retorno */}
        <View
          style={{
            width: 70,
            height: 70,
            borderRadius: 35,
            borderWidth: 2,
            borderColor: "#dc2626",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#000000",
          }}
        >
          <Navigation
            size={32}
            color="#dc2626"
            style={{
              transform: [{ rotate: `${difRumboRelativa}deg` }],
            }}
          />
        </View>

        {/* Datos en Vivo */}
        <View style={{ flex: 1, gap: 4 }}>
          <View>
            <Text style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>Distancia a Víctima</Text>
            <Text style={{ fontSize: 22, fontFamily: "Inter-Bold", color: "#FFFFFF" }}>
              {distancia >= 1000
                ? `${metrosAMillasNauticas(distancia).toFixed(2)} NM`
                : `${distancia.toFixed(0)} metros`}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View>
              <Text style={{ fontSize: 10, color: "#94a3b8" }}>Rumbo Retorno</Text>
              <Text style={{ fontSize: 15, fontFamily: "Inter-Bold", color: "#FFFFFF" }}>
                {bearing.toFixed(0)}°
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 10, color: "#94a3b8" }}>Rumbo Barco</Text>
              <Text style={{ fontSize: 15, fontFamily: "Inter-Bold", color: "#dc2626" }}>
                {rumboActualBarco.toFixed(0)}°
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Panel SOS / Alerta a Contactos */}
      <View
        style={{
          backgroundColor: "#1e1b4b",
          borderColor: "#4338ca",
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <AlertTriangle size={15} color="#e0e7ff" />
          <Text style={{ fontSize: 12, fontFamily: "Inter-Bold", color: "#e0e7ff" }}>
            ENVÍO DE ALERTA SOS Y COORDENADAS
          </Text>
        </View>
        <Text style={{ fontSize: 11, color: "#c7d2fe" }}>
          Informa a tus contactos de auxilio o capitanías con un link a tu posición GPS en vivo.
        </Text>

        {/* Lista de Contactos para Enviar SOS */}
        <View style={{ gap: 8, marginTop: 4 }}>
          {contactosAyuda.map((contacto) => (
            <View
              key={contacto.id}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "#000000",
                padding: 10,
                borderRadius: 8,
                borderColor: "#312e81",
                borderWidth: 1,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, fontFamily: "Inter-Bold", color: "#FFFFFF" }}>
                  {contacto.nombre}
                </Text>
                <Text style={{ fontSize: 10, color: "#94a3b8" }}>
                  {contacto.telefono}
                </Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => enviarSOSSms(contacto.telefono)}
                  style={{
                    backgroundColor: "#4f46e5",
                    padding: 8,
                    borderRadius: 6,
                  }}
                >
                  <Share2 size={14} color="white" />
                </Pressable>
                <Pressable
                  onPress={() => llamarTelefono(contacto.telefono)}
                  style={{
                    backgroundColor: "#10b981",
                    padding: 8,
                    borderRadius: 6,
                  }}
                >
                  <Phone size={14} color="white" />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
