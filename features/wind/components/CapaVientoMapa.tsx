// Capa que renderiza el grid de flechas de viento sobre el MapaSpots.
// Recibe el índice de hora a mostrar (0 = ahora, 1 = +1h, etc.).
// Si la capa está apagada, no renderiza nada.
// MODIFICADO EN PROMPT 3.1: pasa rachasNudos y hora a las flechas para el popup.

import { FlechaViento } from "./FlechaViento";
import type { PronosticoGrid } from "../services/openMeteoGrid";

type Props = {
  pronostico: PronosticoGrid | null;
  indiceHora: number;
  visible: boolean;
};

export function CapaVientoMapa({ pronostico, indiceHora, visible }: Props) {
  if (!visible || !pronostico) return null;

  return (
    <>
      {pronostico.puntos.map((puntoGrid, i) => {
        const pronosticoHora = puntoGrid.puntos[indiceHora];
        if (!pronosticoHora) return null;

        return (
          <FlechaViento
            key={`${puntoGrid.lat}-${puntoGrid.lon}-${i}`}
            lat={puntoGrid.lat}
            lon={puntoGrid.lon}
            velocidadNudos={pronosticoHora.velocidadNudos}
            direccionGrados={pronosticoHora.direccionGrados}
            rachasNudos={pronosticoHora.rachasNudos}
            hora={pronosticoHora.hora}
          />
        );
      })}
    </>
  );
}
