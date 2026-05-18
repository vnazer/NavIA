// Componente interno que carga leaflet. Se monta solo en cliente
// (cargado vía dynamic import desde MapaSpots.web.tsx) porque leaflet
// accede a `window` al evaluar sus módulos y rompería el SSR estático
// que hace Expo Router con `output: static`.
//
// MODIFICADO EN PROMPT 3.2: agrega card flotante con viento del spot seleccionado
// y enriquece el popup del spot actual con datos de viento. Usa dos hooks de
// pronóstico: uno para el grid de flechas, otro puntual para el spot actual.

import "leaflet/dist/leaflet.css";
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { SPOTS } from "@/features/spots/data/spots";
import { usePronosticoGrid } from "@/features/wind/hooks/usePronosticoGrid";
import { usePronosticoViento } from "@/features/wind/hooks/usePronosticoViento";
import { CapaVientoMapa } from "@/features/wind/components/CapaVientoMapa";
import { MAPA_CONFIG, TILES } from "../data/config";
import { iconoSpot } from "./iconos";
import { PopupSpot } from "./PopupSpot";
import { SelectorHora } from "./SelectorHora";
import { ControlCapaViento } from "./ControlCapaViento";
import { CardVientoSpot } from "./CardVientoSpot";

export default function MapaSpotsInterno() {
  const spotIdActual = useSpotStore((s) => s.spotIdSeleccionado);
  const spotActual = useSpotStore((s) => s.getSpotActual());

  // Pronóstico GRID para las flechas distribuidas
  const { pronostico: pronosticoGrid } = usePronosticoGrid();

  // Pronóstico PUNTUAL del spot actual para la card flotante y el popup
  const { pronostico: pronosticoSpot } = usePronosticoViento();

  const [indiceHora, setIndiceHora] = useState(0);
  const [capaVientoVisible, setCapaVientoVisible] = useState(true);

  const maximoHoras = pronosticoGrid?.puntos[0]?.puntos.length
    ? pronosticoGrid.puntos[0].puntos.length - 1
    : 47;

  // Timestamp seleccionado por el slider (referencia: punto 0 del grid)
  const timestampSeleccionado =
    pronosticoGrid?.puntos[0]?.puntos[indiceHora]?.hora;

  // Buscar el punto del pronóstico del spot que matchee el timestamp del slider.
  // Por seguridad usamos timestamp en vez de índice (los arrays deberían
  // alinearse pero esto es robusto a discrepancias).
  const puntoSpotEnHora = (() => {
    if (!pronosticoSpot || !timestampSeleccionado) return null;
    return (
      pronosticoSpot.puntos.find((p) => p.hora === timestampSeleccionado) ??
      pronosticoSpot.puntos[indiceHora] ??
      null
    );
  })();

  const esAhora = indiceHora === 0;

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
        <TileLayer
          url={TILES.base.url}
          attribution={TILES.base.atribucion}
        />
        <TileLayer
          url={TILES.seamark.url}
          attribution={TILES.seamark.atribucion}
        />

        <CapaVientoMapa
          pronostico={pronosticoGrid}
          indiceHora={indiceHora}
          visible={capaVientoVisible}
        />

        {SPOTS.map((spot) => {
          const esActual = spot.id === spotIdActual;
          return (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lon]}
              icon={iconoSpot(esActual)}
            >
              <Popup>
                <PopupSpot
                  spot={spot}
                  esActual={esActual}
                  punto={esActual ? puntoSpotEnHora : null}
                />
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

      {/* Card flotante: siempre visible con el viento del spot seleccionado */}
      <CardVientoSpot
        spot={spotActual}
        punto={puntoSpotEnHora}
        esAhora={esAhora}
      />

      {/* Slider temporal */}
      {pronosticoGrid && capaVientoVisible && (
        <SelectorHora
          indice={indiceHora}
          maximo={maximoHoras}
          timestampActual={timestampSeleccionado}
          onCambio={setIndiceHora}
        />
      )}
    </div>
  );
}
