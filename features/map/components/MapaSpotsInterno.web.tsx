// Componente interno que carga leaflet. Se monta solo en cliente
// (cargado vía dynamic import desde MapaSpots.web.tsx) porque leaflet
// accede a `window` al evaluar sus módulos y rompería el SSR estático
// que hace Expo Router con `output: static`.
//
// MODIFICADO EN PROMPT 3: capa de viento (grid de flechas), slider temporal
// y toggle para encender/apagar.

import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { SPOTS } from "@/features/spots/data/spots";
import { usePronosticoGrid } from "@/features/wind/hooks/usePronosticoGrid";
import { CapaVientoMapa } from "@/features/wind/components/CapaVientoMapa";
import { MAPA_CONFIG, TILES } from "../data/config";
import { iconoSpot } from "./iconos";
import { PopupSpot } from "./PopupSpot";
import { SelectorHora } from "./SelectorHora";
import { ControlCapaViento } from "./ControlCapaViento";

export default function MapaSpotsInterno() {
  const spotIdActual = useSpotStore((s) => s.spotIdSeleccionado);
  const { pronostico } = usePronosticoGrid();

  // Estado UI: índice de hora seleccionada (0 = ahora) y visibilidad de capa
  const [indiceHora, setIndiceHora] = useState(0);
  const [capaVientoVisible, setCapaVientoVisible] = useState(true);

  // Calcular máximo del slider en base a las horas disponibles del primer punto
  const maximoHoras = pronostico?.puntos[0]?.puntos.length
    ? pronostico.puntos[0].puntos.length - 1
    : 47;

  // Timestamp del punto actualmente seleccionado (para mostrar en slider)
  const timestampActual =
    pronostico?.puntos[0]?.puntos[indiceHora]?.hora;

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer
        center={[
          MAPA_CONFIG.centroInicial.lat,
          MAPA_CONFIG.centroInicial.lon,
        ]}
        zoom={MAPA_CONFIG.zoomInicial}
        minZoom={MAPA_CONFIG.zoomMin}
        maxZoom={MAPA_CONFIG.zoomMax}
        style={{ height: "100%", width: "100%", minHeight: 500 }}
        scrollWheelZoom={true}
      >
        {/* Capa base topográfica */}
        <TileLayer
          url={TILES.base.url}
          attribution={TILES.base.atribucion}
        />

        {/* Capa náutica OpenSeaMap */}
        <TileLayer
          url={TILES.seamark.url}
          attribution={TILES.seamark.atribucion}
        />

        {/* Capa de viento (grid de flechas) */}
        <CapaVientoMapa
          pronostico={pronostico}
          indiceHora={indiceHora}
          visible={capaVientoVisible}
        />

        {/* Marcadores de los 6 spots */}
        {SPOTS.map((spot) => {
          const esActual = spot.id === spotIdActual;
          return (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lon]}
              icon={iconoSpot(esActual)}
            >
              <Popup>
                <PopupSpot spot={spot} esActual={esActual} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Toggle de capa de viento (esquina superior derecha) */}
      <ControlCapaViento
        activa={capaVientoVisible}
        onToggle={() => setCapaVientoVisible(!capaVientoVisible)}
      />

      {/* Slider temporal (parte inferior centrada) - solo si hay data */}
      {pronostico && capaVientoVisible && (
        <SelectorHora
          indice={indiceHora}
          maximo={maximoHoras}
          timestampActual={timestampActual}
          onCambio={setIndiceHora}
        />
      )}
    </div>
  );
}
