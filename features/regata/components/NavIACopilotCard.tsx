import React from "react";
import { View, Text, Pressable } from "react-native";
import { Brain, Volume2, VolumeX, Sparkles, AlertTriangle } from "lucide-react-native";
import { useCopilotoStore } from "../store/useCopilotoStore";
import { useColores } from "@/lib/tema";

export function NavIACopilotCard() {
  const {
    copilotoActivo,
    modoVoz,
    ultimoConsejo,
    setCopilotoActivo,
    setModoVoz,
    forzarAnuncioVoz,
  } = useCopilotoStore();

  const c = useColores();

  if (!copilotoActivo) {
    return (
      <View
        style={{
          backgroundColor: c.surface,
          borderColor: c.border,
          borderWidth: 1.5,
          borderRadius: 16,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
          <View style={{ backgroundColor: `${c.text3}15`, padding: 8, borderRadius: 10 }}>
            <Brain size={20} color={c.text3} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontFamily: "Inter-Bold", color: c.text }}>
              NavIA Copilot
            </Text>
            <Text style={{ fontSize: 11, color: c.text3, marginTop: 1 }}>
              Asistente táctico offline apagado
            </Text>
          </View>
        </View>
        <Pressable
          onPress={() => setCopilotoActivo(true)}
          style={{
            backgroundColor: c.accent,
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 11, fontFamily: "Inter-Bold", color: "#000000" }}>
            Activar
          </Text>
        </Pressable>
      </View>
    );
  }

  // Colores reactivos por nivel de alerta
  const colorBorde =
    !ultimoConsejo
      ? c.border
      : ultimoConsejo.nivelAlerta === "urgente"
      ? c.header
      : ultimoConsejo.nivelAlerta === "alerta"
      ? c.warn
      : c.accent;

  const bgAlerta =
    !ultimoConsejo
      ? c.surface
      : ultimoConsejo.nivelAlerta === "urgente"
      ? `${c.header}10`
      : ultimoConsejo.nivelAlerta === "alerta"
      ? `${c.warn}10`
      : `${c.accent}08`;

  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderColor: colorBorde,
        borderWidth: 2,
        borderRadius: 16,
        padding: 14,
        gap: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Cabecera del Copiloto */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Sparkles size={16} color={colorBorde} />
          <Text style={{ fontSize: 12, fontFamily: "Inter-Bold", color: colorBorde, textTransform: "uppercase", letterSpacing: 0.5 }}>
            NavIA Copilot Tactician
          </Text>
        </View>

        {/* Botones de Control */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* Toggle de Silencio */}
          <Pressable
            onPress={() => setModoVoz(!modoVoz)}
            style={{
              padding: 6,
              borderRadius: 6,
              backgroundColor: modoVoz ? `${c.accent}15` : `${c.text3}15`,
            }}
          >
            {modoVoz ? (
              <Volume2 size={15} color={c.accent} />
            ) : (
              <VolumeX size={15} color={c.text3} />
            )}
          </Pressable>

          {/* Botón de Apagar */}
          <Pressable
            onPress={() => setCopilotoActivo(false)}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              backgroundColor: `${c.text3}10`,
            }}
          >
            <Text style={{ fontSize: 10, fontFamily: "Inter-Medium", color: c.text2 }}>
              Desactivar
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Contenido del Consejo */}
      <View
        style={{
          backgroundColor: bgAlerta,
          borderRadius: 10,
          padding: 12,
          gap: 6,
        }}
      >
        <Text style={{ fontSize: 14, fontFamily: "Inter-Medium", color: c.text, lineHeight: 20 }}>
          {ultimoConsejo?.consejoTactico ?? "Esperando telemetría de navegación..."}
        </Text>
        {ultimoConsejo?.ajustePolar && (
          <Text style={{ fontSize: 12, color: c.text2, fontStyle: "italic", borderTopColor: `${c.text3}20`, borderTopWidth: 0.5, paddingTop: 4, marginTop: 2 }}>
            {ultimoConsejo.ajustePolar}
          </Text>
        )}
      </View>

      {/* Alerta de Seguridad Adicional */}
      {ultimoConsejo?.alertaSeguridad && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: `${c.header}15`, padding: 8, borderRadius: 8 }}>
          <AlertTriangle size={14} color={c.header} />
          <Text style={{ fontSize: 11, fontFamily: "Inter-Bold", color: c.header, flex: 1 }}>
            {ultimoConsejo.alertaSeguridad}
          </Text>
        </View>
      )}

      {/* Pie con botón Hablar */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4 }}>
        <Text style={{ fontSize: 10, color: c.text3 }}>
          {ultimoConsejo ? `Alerta: ${ultimoConsejo.nivelAlerta}` : "Modo Autónomo"}
        </Text>
        {ultimoConsejo && (
          <Pressable
            onPress={forzarAnuncioVoz}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: `${c.accent}15`,
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 6,
            }}
          >
            <Volume2 size={13} color={c.accent} />
            <Text style={{ fontSize: 10, fontFamily: "Inter-Bold", color: c.accent }}>
              Escuchar ahora
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
