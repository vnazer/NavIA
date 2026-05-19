// Capa de viento estilo Windy usando leaflet-velocity. Renderiza streamlines
// animadas sobre canvas. Las streamlines se mueven hacia donde sopla el viento
// (no de donde viene). El color codifica intensidad.
//
// Se monta dentro del MapContainer porque usa useMap() para acceder al map.

import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-velocity/dist/leaflet-velocity.css";
import "leaflet-velocity";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import {
  fetchGridViento,
  gridAGribJson,
  type GridViento,
} from "@/lib/api/openMeteoGrid";

type Props = {
  visible: boolean;
  horasAdelante: number;
};

export function CapaViento({ visible, horasAdelante }: Props) {
  const map = useMap();
  const spot = useSpotStore((s) => s.getSpotActual());
  const layerRef = useRef<any>(null);

  useEffect(() => {
    let cancelado = false;

    const limpiar = () => {
      if (layerRef.current) {
        try {
          map.removeLayer(layerRef.current);
        } catch {
          /* layer ya removida */
        }
        layerRef.current = null;
      }
    };

    if (!visible || !spot) {
      limpiar();
      return;
    }

    fetchGridViento(spot.lat, spot.lon, horasAdelante)
      .then((grid: GridViento) => {
        if (cancelado) return;
        const gribJson = gridAGribJson(grid);

        limpiar();

        const velocityLayer = (L as any).velocityLayer({
          displayValues: true,
          displayOptions: {
            velocityType: "Viento",
            position: "bottomleft",
            emptyString: "Sin datos",
            speedUnit: "kt",
          },
          data: gribJson,
          maxVelocity: 20,
          velocityScale: 0.01,
          colorScale: [
            "rgb(36, 104, 180)",
            "rgb(60, 157, 194)",
            "rgb(128, 205, 193)",
            "rgb(151, 218, 168)",
            "rgb(198, 231, 181)",
            "rgb(238, 247, 217)",
            "rgb(255, 238, 159)",
            "rgb(252, 211, 117)",
            "rgb(245, 162, 92)",
            "rgb(232, 95, 76)",
            "rgb(204, 50, 50)",
          ],
          lineWidth: 1.5,
          particleAge: 60,
          particleMultiplier: 0.003,
        });

        velocityLayer.addTo(map);
        layerRef.current = velocityLayer;
      })
      .catch((e) => {
        if (!cancelado) console.error("CapaViento:", e);
      });

    return () => {
      cancelado = true;
      limpiar();
    };
  }, [visible, horasAdelante, spot, map]);

  return null;
}
