// Selector de barco. Pequeño dropdown que cambia el barco activo y persiste.

import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { ChevronDown } from "lucide-react-native";
import { useBarcoStore } from "../store/useBarcoStore";
import { BARCOS } from "../data/barcos";

export function SelectorBarco() {
  const barcoActual = useBarcoStore((s) => s.getBarcoActual());
  const seleccionar = useBarcoStore((s) => s.seleccionarBarco);
  const [abierto, setAbierto] = useState(false);

  return (
    <View className="relative" style={{ zIndex: abierto ? 9999 : 0 }}>
      <Pressable
        onPress={() => setAbierto(!abierto)}
        className="flex-row items-center gap-2 rounded-lg bg-slate-100 px-3 py-2"
      >
        <Text className="text-sm font-semibold text-slate-800">
          {barcoActual.nombre}
        </Text>
        <ChevronDown size={14} color="#334155" />
      </Pressable>

      {abierto && (
        <View
          className="absolute right-0 top-12 w-64 rounded-xl bg-white p-2 shadow-lg"
          style={{ elevation: 8, zIndex: 9999 }}
        >
          {BARCOS.map((b) => (
            <Pressable
              key={b.id}
              onPress={() => {
                seleccionar(b.id);
                setAbierto(false);
              }}
              className={`rounded-lg p-3 ${
                b.id === barcoActual.id ? "bg-mar-50" : ""
              }`}
            >
              <Text className="text-sm font-semibold text-slate-900">
                {b.nombre}
              </Text>
              <Text className="text-xs text-slate-500">{b.clase}</Text>
              {b.descripcion && (
                <Text className="mt-1 text-xs text-slate-600">
                  {b.descripcion}
                </Text>
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
