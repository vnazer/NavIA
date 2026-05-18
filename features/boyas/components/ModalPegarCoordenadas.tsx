// Modal para pegar coordenadas múltiples (formato del juez: WhatsApp).
// Parsea grados/min náutico + decimal y crea boyas en lote.
// Por defecto las crea como tipo "custom". El usuario puede cambiar el tipo
// global a aplicar a TODAS las pegadas con el selector de arriba.

import { useMemo, useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";
import { parsearTextoBoyas } from "../lib/parserCoordenadas";
import { useBoyasStore } from "../store/useBoyasStore";
import { BOYA_META, type TipoBoya } from "../types";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const EJEMPLO_PLACEHOLDER = `BL: 33°02.34'S 71°35.98'W
SO: 33°02.78'S 71°36.20'W
Lado 1: -33.0250, -71.6010
Lado 2: -33.0280, -71.5980`;

const TIPOS_ORDENADOS: TipoBoya[] = [
  "custom",
  "windward",
  "leeward",
  "committee",
  "pin",
  "gate_l",
  "gate_r",
];

export function ModalPegarCoordenadas({ visible, onClose }: Props) {
  const agregarMultiples = useBoyasStore((s) => s.agregarMultiples);
  const [texto, setTexto] = useState("");
  const [tipoGlobal, setTipoGlobal] = useState<TipoBoya>("custom");

  const previewLineas = useMemo(
    () => (texto.trim() ? parsearTextoBoyas(texto) : []),
    [texto],
  );

  // Reset al abrir
  useEffect(() => {
    if (visible) {
      setTexto("");
      setTipoGlobal("custom");
    }
  }, [visible]);

  const validas = previewLineas.filter((p) => p.resultado.ok);
  const erroresCount = previewLineas.length - validas.length;

  const handleAgregar = () => {
    if (validas.length === 0) return;
    agregarMultiples(
      validas.map((p) => ({
        tipo: tipoGlobal,
        lat: (p.resultado as { ok: true; lat: number; lon: number }).lat,
        lon: (p.resultado as { ok: true; lat: number; lon: number }).lon,
        label: p.nombre,
      })),
    );
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 p-4">
        <View className="max-h-[90%] w-full max-w-xl gap-4 rounded-2xl bg-white p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-slate-900">
              Pegar coordenadas
            </Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <X size={20} color="#64748b" />
            </Pressable>
          </View>

          <ScrollView contentContainerClassName="gap-4">
            <Text className="text-xs text-slate-500">
              Una boya por línea. Acepta &quot;33°02.34&apos;S 71°35.98&apos;W&quot;,
              decimal &quot;-33.039, -71.599&quot; o &quot;Nombre: coord&quot;.
            </Text>

            {/* Selector tipo global */}
            <View>
              <Text className="mb-2 text-xs font-semibold uppercase text-slate-600">
                Tipo a asignar a TODAS
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {TIPOS_ORDENADOS.map((t) => {
                  const meta = BOYA_META[t];
                  const activo = t === tipoGlobal;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => setTipoGlobal(t)}
                      className={`flex-row items-center gap-1 rounded-lg px-3 py-2 ${
                        activo ? "bg-mar-50" : "bg-slate-100"
                      }`}
                      style={
                        activo
                          ? { borderColor: meta.color, borderWidth: 2 }
                          : undefined
                      }
                    >
                      <Text style={{ fontSize: 14 }}>{meta.emoji}</Text>
                      <Text
                        className={`text-xs ${
                          activo
                            ? "font-semibold text-slate-900"
                            : "text-slate-700"
                        }`}
                      >
                        {meta.nombre}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <TextInput
              multiline
              value={texto}
              onChangeText={setTexto}
              placeholder={EJEMPLO_PLACEHOLDER}
              placeholderTextColor="#94a3b8"
              className="min-h-[140px] rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm text-slate-900"
              style={{ textAlignVertical: "top" }}
            />

            {previewLineas.length > 0 && (
              <View className="gap-1 rounded-xl bg-slate-50 p-3">
                <Text className="text-xs font-semibold uppercase text-slate-600">
                  Vista previa
                </Text>
                {previewLineas.map((p, i) => (
                  <View key={i} className="flex-row items-start gap-2">
                    <Text
                      className={
                        p.resultado.ok
                          ? "text-xs text-emerald-700"
                          : "text-xs text-red-600"
                      }
                    >
                      {p.resultado.ok ? "✓" : "✗"}
                    </Text>
                    <View className="flex-1">
                      <Text className="text-xs text-slate-700">
                        <Text className="font-semibold">{p.nombre}:</Text>{" "}
                        {p.resultado.ok
                          ? `${p.resultado.lat.toFixed(5)}, ${p.resultado.lon.toFixed(5)}`
                          : p.resultado.error}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {erroresCount > 0 && (
              <Text className="text-xs text-red-600">
                {erroresCount} línea{erroresCount !== 1 ? "s" : ""} con formato
                inválido — se ignorarán.
              </Text>
            )}
          </ScrollView>

          <View className="flex-row gap-2">
            <Pressable
              onPress={onClose}
              className="flex-1 rounded-xl bg-slate-100 p-3"
            >
              <Text className="text-center text-sm font-semibold text-slate-700">
                Cancelar
              </Text>
            </Pressable>
            <Pressable
              onPress={handleAgregar}
              disabled={validas.length === 0}
              className="flex-1 rounded-xl bg-mar-700 p-3"
              style={validas.length === 0 ? { opacity: 0.4 } : undefined}
            >
              <Text className="text-center text-sm font-semibold text-white">
                Agregar {validas.length || ""}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
