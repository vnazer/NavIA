// Modal React Native para agregar una boya desde long-press en el mapa nativo.

import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
} from "react-native";
import { BOYA_META, type TipoBoya } from "../types";
import { useColores } from "@/lib/tema";

type Props = {
  lat: number;
  lon: number;
  visible: boolean;
  onConfirmar: (tipo: TipoBoya, label?: string) => void;
  onCancelar: () => void;
};

const TIPOS_ORDENADOS: TipoBoya[] = [
  "committee",
  "pin",
  "windward",
  "leeward",
  "gate_l",
  "gate_r",
  "custom",
];

export function ModalAgregarBoya({
  lat,
  lon,
  visible,
  onConfirmar,
  onCancelar,
}: Props) {
  const c = useColores();
  const [tipoSeleccionado, setTipoSeleccionado] =
    useState<TipoBoya>("windward");
  const [label, setLabel] = useState("");

  const handleConfirmar = () => {
    onConfirmar(tipoSeleccionado, label.trim() || undefined);
    setLabel("");
    setTipoSeleccionado("windward");
  };

  const handleCancelar = () => {
    onCancelar();
    setLabel("");
    setTipoSeleccionado("windward");
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          justifyContent: "center",
          padding: 20,
        }}
        onPress={handleCancelar}
      >
        <Pressable
          style={{
            backgroundColor: c.surface,
            borderWidth: 1,
            borderColor: c.border,
            padding: 20,
            maxHeight: "85%",
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            style={{
              fontFamily: "Inter-Bold",
              fontSize: 18,
              color: c.text,
            }}
          >
            Agregar boya
          </Text>
          <Text
            style={{
              fontFamily: "Inter-Regular",
              fontSize: 12,
              color: c.text3,
              marginTop: 4,
              marginBottom: 16,
            }}
          >
            {lat.toFixed(5)}, {lon.toFixed(5)}
          </Text>

          <Text
            style={{
              fontFamily: "Inter-Bold",
              fontSize: 13,
              color: c.text2,
              marginBottom: 8,
            }}
          >
            Tipo
          </Text>
          <ScrollView style={{ maxHeight: 220 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {TIPOS_ORDENADOS.map((t) => {
                const meta = BOYA_META[t];
                const activo = t === tipoSeleccionado;
                return (
                  <Pressable
                    key={t}
                    onPress={() => setTipoSeleccionado(t)}
                    style={{
                      width: "47%",
                      padding: 12,
                      borderWidth: activo ? 2 : 1,
                      borderColor: activo ? meta.color : c.border,
                      backgroundColor: activo ? meta.color + "22" : c.surface2,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{meta.emoji}</Text>
                    <Text
                      style={{
                        fontFamily: activo ? "Inter-Bold" : "Inter-Regular",
                        fontSize: 13,
                        color: c.text,
                        flexShrink: 1,
                      }}
                    >
                      {meta.nombre}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <Text
            style={{
              fontFamily: "Inter-Bold",
              fontSize: 13,
              color: c.text2,
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            Label (opcional)
          </Text>
          <TextInput
            value={label}
            onChangeText={setLabel}
            placeholder="Ej: W1, Lay K3"
            placeholderTextColor={c.text3}
            maxLength={10}
            style={{
              borderWidth: 1,
              borderColor: c.border,
              backgroundColor: c.surface2,
              padding: 10,
              fontFamily: "Inter-Regular",
              fontSize: 14,
              color: c.text,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 20,
            }}
          >
            <Pressable
              onPress={handleCancelar}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderWidth: 1,
                borderColor: c.border,
                minHeight: 48,
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: "Inter-Regular", color: c.text2 }}>
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={handleConfirmar}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: c.navy,
                minHeight: 48,
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter-Bold",
                  color: "#FFFFFF",
                }}
              >
                Agregar
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
