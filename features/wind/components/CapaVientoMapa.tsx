import { FlechaViento } from "./FlechaViento";
import { FichaOlaMapa } from "./FichaOlaMapa";
import { FichaClimaMapa } from "./FichaClimaMapa";
import type { PronosticoGrid } from "../services/openMeteoGrid";

type Props = {
  pronostico: PronosticoGrid | null;
  indiceHora: number;
  modo: "viento" | "olas" | "clima" | "off";
};

export function CapaVientoMapa({ pronostico, indiceHora, modo }: Props) {
  if (modo === "off" || !pronostico) return null;

  return (
    <>
      {pronostico.puntos.map((puntoGrid, i) => {
        const pronosticoHora = puntoGrid.puntos[indiceHora];
        if (!pronosticoHora) return null;

        if (modo === "viento") {
          return (
            <FlechaViento
              key={`wind-${puntoGrid.lat}-${puntoGrid.lon}-${i}`}
              lat={puntoGrid.lat}
              lon={puntoGrid.lon}
              velocidadNudos={pronosticoHora.velocidadNudos}
              direccionGrados={pronosticoHora.direccionGrados}
              rachasNudos={pronosticoHora.rachasNudos}
              hora={pronosticoHora.hora}
            />
          );
        }

        if (modo === "olas") {
          return (
            <FichaOlaMapa
              key={`waves-${puntoGrid.lat}-${puntoGrid.lon}-${i}`}
              lat={puntoGrid.lat}
              lon={puntoGrid.lon}
              olaMt={pronosticoHora.olaMt}
              hora={pronosticoHora.hora}
            />
          );
        }

        if (modo === "clima") {
          return (
            <FichaClimaMapa
              key={`weather-${puntoGrid.lat}-${puntoGrid.lon}-${i}`}
              lat={puntoGrid.lat}
              lon={puntoGrid.lon}
              temperaturaC={pronosticoHora.temperaturaC}
              probLluvia={pronosticoHora.probLluvia}
              hora={pronosticoHora.hora}
            />
          );
        }

        return null;
      })}
    </>
  );
}
