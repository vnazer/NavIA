// Lista horizontal scrolleable con los próximos N puntos del pronóstico.
// MODIFICADO EN PROMPT 3.1: cards tappables, marca la hora seleccionada.

import { ScrollView, View, Text, Pressable } from "react-native";
import { ItemHoraPronostico } from "./ItemHoraPronostico";
import type { PuntoPronostico } from "../types";

type Props = {
  puntos: PuntoPronostico[];
  horas?: number;
  /** Índice de la hora actualmente "seleccionada" en la lista (relativa a `puntos`) */
  indiceSeleccionado: number;
  /** Callback cuando el usuario tappea una card */
  onSeleccionar: (indiceEnPuntosOriginal: number) => void;
};

export function ListaPronostico({
  puntos,
  horas = 48,
  indiceSeleccionado,
  onSeleccionar,
}: Props) {
  // Filtrar solo puntos futuros desde el momento actual
  const ahora = new Date();
  const indiceFuturoInicial = puntos.findIndex(
    (p) => new Date(p.hora) >= ahora,
  );
  const inicioReal = indiceFuturoInicial === -1 ? 0 : indiceFuturoInicial;

  const futuros = puntos.slice(inicioReal, inicioReal + horas);

  return (
    <View>
      <Text className="mb-2 text-base font-semibold text-slate-700">
        Próximas {horas}h
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {futuros.map((p, idxRelativo) => {
          const indiceAbsoluto = inicioReal + idxRelativo;
          const esSeleccionado = indiceAbsoluto === indiceSeleccionado;
          return (
            <Pressable
              key={p.hora}
              onPress={() => onSeleccionar(indiceAbsoluto)}
              style={{
                opacity: esSeleccionado ? 1 : 0.85,
                transform: esSeleccionado ? [{ scale: 1.05 }] : [{ scale: 1 }],
              }}
            >
              <ItemHoraPronostico
                punto={p}
                destacado={esSeleccionado}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
