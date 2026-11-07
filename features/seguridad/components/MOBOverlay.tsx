import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Linking, Platform } from "react-native";
// Navigation2 apunta hacia arriba (Navigation de lucide apunta 45° a la derecha)
import { AlertOctagon, Navigation2, Share2, Phone, X, AlertTriangle } from "lucide-react-native";
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

  const [distancia, setDistancia] = useState<number | null>(null);
  const [bearing, setBearing] = useState<number | null>(null);

  // Loop de Anuncios de Voz de Emergencia cada 15 segundos
  useEffect(() => {
    if (!mobCoordenadas) return;

    // Primer anuncio inmediato (prioritario: no lo tapa el copiloto)
    decir("Alerta: Hombre al agua. Vira de inmediato para retornar.", { prioridad: true });

    timerAnuncioRef.current = setInterval(() => {
      decir("Hombre al agua. Regresa al rumbo.", { prioridad: true });
    }, 15000);

    return () => {
      if (timerAnuncioRef.current) {
        clearInterval(timerAnuncioRef.current);
      }
    };
    // Solo al activar/desactivar (no reiniciar el loop cuando llega la posición)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobCoordenadas?.ts]);

  const mobLat = mobCoordenadas?.lat ?? null;
  const mobLon = mobCoordenadas?.lon ?? null;

  // Recalcular distancia y rumbo en vivo
  useEffect(() => {
    if (mobLat == null || mobLon == null || !ultimoPunto) {
      setDistancia(null);
      setBearing(null);
      return;
    }

    const d = distanciaMetros(ultimoPunto.lat, ultimoPunto.lon, mobLat, mobLon);
    const b = calcularRumbo(ultimoPunto.lat, ultimoPunto.lon, mobLat, mobLon);

    setDistancia(d);
    setBearing(b);
  }, [ultimoPunto, mobLat, mobLon]);

  if (!mobCoordenadas) return null;

  // Sin coordenadas, o datos de un fix no confirmado → se avisa explícitamente
  const confirmada =
    mobCoordenadas.confirmada !== false && mobLat != null && mobLon != null;

  // Formatear mensaje SOS
  const latStr = mobLat != null ? mobLat.toFixed(6) : null;
  const lonStr = mobLon != null ? mobLon.toFixed(6) : null;
  const mapLink =
    latStr && lonStr
      ? `https://www.openstreetmap.org/?mlat=${latStr}&mlon=${lonStr}#map=18`
      : null;
  const textoPosicion =
    latStr && lonStr
      ? `Coordenadas: Lat ${latStr}, Lon ${lonStr}.`
      : "Sin coordenadas GPS.";
  const textoRetorno =
    distancia != null && bearing != null
      ? ` Distancia de retorno: ${distancia.toFixed(0)}m, Rumbo: ${bearing.toFixed(0)}°.`
      : "";
  const mensajeSOS = `¡NavIA SOS! HOMBRE AL AGUA.${confirmada ? "" : " POSICIÓN NO CONFIRMADA."} ${textoPosicion}${textoRetorno}${mapLink ? ` Mapa: ${mapLink}` : ""}`;

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

  // Flecha de retorno: relativa a la proa (bearing − COG) si hay COG válido;
  // sin COG (barco parado) mostramos el rumbo absoluto con el norte arriba.
  const rumboActualBarco = ultimoPunto?.cogGrados ?? null;
  const rotacionFlecha =
    bearing == null
      ? null
      : rumboActualBarco != null
        ? (bearing - rumboActualBarco + 360) % 360
        : bearing;

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
          <Text
            style={{
              fontSize: 11,
              color: confirmada ? "#94a3b8" : "#fbbf24",
              fontFamily: confirmada ? undefined : "Inter-Bold",
              marginTop: 2,
            }}
          >
            {confirmada
              ? "Coordenadas bloqueadas en el GPS al instante"
              : "POSICIÓN NO CONFIRMADA — buscando señal GPS"}
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
          {rotacionFlecha != null ? (
            <Navigation2
              size={32}
              color="#dc2626"
              style={{
                transform: [{ rotate: `${rotacionFlecha}deg` }],
              }}
            />
          ) : (
            <Text style={{ fontSize: 22, fontFamily: "Inter-Bold", color: "#dc2626" }}>?</Text>
          )}
        </View>

        {/* Datos en Vivo */}
        <View style={{ flex: 1, gap: 4 }}>
          <View>
            <Text style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase" }}>Distancia a Víctima</Text>
            <Text style={{ fontSize: 22, fontFamily: "Inter-Bold", color: "#FFFFFF" }}>
              {distancia == null
                ? "—"
                : distancia >= 1000
                  ? `${metrosAMillasNauticas(distancia).toFixed(2)} NM`
                  : `${distancia.toFixed(0)} metros`}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View>
              <Text style={{ fontSize: 10, color: "#94a3b8" }}>Rumbo Retorno</Text>
              <Text style={{ fontSize: 15, fontFamily: "Inter-Bold", color: "#FFFFFF" }}>
                {bearing != null ? `${bearing.toFixed(0)}°` : "—"}
              </Text>
            </View>
            <View>
              <Text style={{ fontSize: 10, color: "#94a3b8" }}>Rumbo Barco</Text>
              <Text style={{ fontSize: 15, fontFamily: "Inter-Bold", color: "#dc2626" }}>
                {rumboActualBarco != null ? `${rumboActualBarco.toFixed(0)}°` : "—"}
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
