// Lista horizontal scrolleable con los próximos N puntos del pronóstico.
import { ScrollView, View, Text } from "react-native";
import { ItemHoraPronostico } from "./ItemHoraPronostico";
import type { PuntoPronostico } from "../types";

type Props = {
  puntos: PuntoPronostico[];
  /** Cuántas horas mostrar (default 48) */
  horas?: number;
};

export function ListaPronostico({ puntos, horas = 48 }: Props) {
  const ahora = new Date();
  const futuros = puntos
    .filter((p) => new Date(p.hora) >= ahora)
    .slice(0, horas);

  return (
    <View>
      <Text className="mb-2 text-base font-semibold text-slate-700">
        Próximas {horas}h
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {futuros.map((p) => (
          <ItemHoraPronostico key={p.hora} punto={p} />
        ))}
      </ScrollView>
    </View>
  );
}
