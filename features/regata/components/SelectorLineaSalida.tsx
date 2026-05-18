// Selector de committee + pin para activar el modo prestart.
// Auto-detecta boyas tipo "committee" y "pin" si existen.

import { useState, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useBoyasStore } from "@/features/boyas/store/useBoyasStore";
import { useTacticaStore } from "../store/useTacticaStore";
import { BOYA_META } from "@/features/boyas/types";

export function SelectorLineaSalida() {
  const boyas = useBoyasStore((s) => s.boyas);
  const setLinea = useTacticaStore((s) => s.setLineaSalida);

  // Auto-detección inicial
  const autoCommittee = useMemo(
    () => boyas.find((b) => b.tipo === "committee"),
    [boyas],
  );
  const autoPin = useMemo(
    () => boyas.find((b) => b.tipo === "pin"),
    [boyas],
  );

  const [committeeSel, setCommitteeSel] = useState<string | null>(
    autoCommittee?.id ?? null,
  );
  const [pinSel, setPinSel] = useState<string | null>(autoPin?.id ?? null);

  if (boyas.length < 2) {
    return (
      <View className="rounded-xl border border-amber-200 bg-amber-50 p-3">
        <Text className="text-sm text-amber-800">
          Necesitás al menos 2 boyas para definir la línea de salida.
        </Text>
      </View>
    );
  }

  const renderChip = (
    boyaId: string,
    seleccionado: string | null,
    onPress: () => void,
    disabled = false,
  ) => {
    const b = boyas.find((x) => x.id === boyaId)!;
    const meta = BOYA_META[b.tipo];
    const activo = seleccionado === b.id;
    return (
      <Pressable
        key={b.id}
        onPress={onPress}
        disabled={disabled}
        className="flex-row items-center gap-1 rounded-lg px-3 py-2"
        style={{
          backgroundColor: activo ? meta.color : "#f1f5f9",
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <Text>{meta.emoji}</Text>
        <Text
          className="text-sm"
          style={{
            color: activo ? "white" : "#334155",
            fontWeight: activo ? "600" : "400",
          }}
        >
          {meta.nombre.split(" ")[0]}
          {b.label ? ` (${b.label})` : ""}
        </Text>
      </Pressable>
    );
  };

  return (
    <View className="gap-3 rounded-xl bg-white p-3">
      <View>
        <Text className="mb-2 text-xs uppercase text-slate-500">
          Committee boat
        </Text>
        <View className="flex-row flex-wrap gap-2">
          {boyas.map((b) =>
            renderChip(b.id, committeeSel, () => setCommitteeSel(b.id)),
          )}
        </View>
      </View>

      <View>
        <Text className="mb-2 text-xs uppercase text-slate-500">Pin end</Text>
        <View className="flex-row flex-wrap gap-2">
          {boyas
            .filter((b) => b.id !== committeeSel)
            .map((b) =>
              renderChip(b.id, pinSel, () => setPinSel(b.id)),
            )}
        </View>
      </View>

      <Pressable
        disabled={!committeeSel || !pinSel}
        onPress={() =>
          committeeSel && pinSel && setLinea(committeeSel, pinSel)
        }
        className="items-center rounded-lg p-3"
        style={{
          backgroundColor: committeeSel && pinSel ? "#0a4d7a" : "#cbd5e1",
        }}
      >
        <Text className="font-semibold text-white">
          Activar modo prestart
        </Text>
      </Pressable>
    </View>
  );
}
