// Componente interno que carga leaflet. Se monta solo en cliente
// (cargado vía dynamic import desde MapaSpots.web.tsx) porque leaflet
// accede a `window` al evaluar sus módulos y rompería el SSR estático
// que hace Expo Router con `output: static`.
//
// MODIFICADO EN PROMPT 3.3: el slider arranca en el índice "AHORA" real
// (primer punto futuro del pronóstico), no en el índice 0 que es 00:00 del día.
// Agrega botón flotante "Volver a AHORA" cuando el usuario se desvía del momento actual.

import "leaflet/dist/leaflet.css";
import { useState, useMemo, useEffect } from "react";
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

  const { pronostico: pronosticoGrid } = usePronosticoGrid();
  const { pronostico: pronosticoSpot } = usePronosticoViento();

  // Slider: empieza en null hasta que sepamos el índice "AHORA" del pronóstico
  const [indiceHora, setIndiceHora] = useState<number | null>(null);
  const [capaVientoVisible, setCapaVientoVisible] = useState(true);

  // Calcular el índice del primer punto futuro del pronóstico del grid.
  // El array empieza desde las 00:00 del día actual, así que si son las 21:00
  // el "ahora real" es el índice 21. Restamos 1 hora para incluir el punto
  // que ya está corriendo (no descartar la hora en curso).
  const indiceAhora = useMemo(() => {
    if (!pronosticoGrid?.puntos[0]?.puntos.length) return null;
    const ahoraTs = Date.now() - 60 * 60 * 1000;
    const idx = pronosticoGrid.puntos[0].puntos.findIndex(
      (p) => new Date(p.hora).getTime() >= ahoraTs,
    );
    return idx === -1 ? 0 : idx;
  }, [pronosticoGrid]);

  // Cuando llega el pronóstico, inicializar el slider en "AHORA"
  useEffect(() => {
    if (indiceAhora !== null && indiceHora === null) {
      setIndiceHora(indiceAhora);
    }
  }, [indiceAhora, indiceHora]);

  const maximoHoras = pronosticoGrid?.puntos[0]?.puntos.length
    ? pronosticoGrid.puntos[0].puntos.length - 1
    : 47;

  // Valor seguro para usar en componentes que esperan number
  const indiceHoraSeguro = indiceHora ?? indiceAhora ?? 0;

  const timestampSeleccionado =
    pronosticoGrid?.puntos[0]?.puntos[indiceHoraSeguro]?.hora;

  // Buscar el punto del pronóstico del spot por timestamp (más robusto que por índice)
  const puntoSpotEnHora = (() => {
    if (!pronosticoSpot || !timestampSeleccionado) return null;
    return (
      pronosticoSpot.puntos.find((p) => p.hora === timestampSeleccionado) ??
      pronosticoSpot.puntos[indiceHoraSeguro] ??
      null
    );
  })();

  // "Es ahora" = el índice coincide con el índice de la hora actual real
  const esAhora =
    indiceAhora !== null && indiceHoraSeguro === indiceAhora;

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
          indiceHora={indiceHoraSeguro}
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

      <ControlCapaViento
        activa={capaVientoVisible}
        onToggle={() => setCapaVientoVisible(!capaVientoVisible)}
      />

      <CardVientoSpot
        spot={spotActual}
        punto={puntoSpotEnHora}
        esAhora={esAhora}
      />

      {/* Botón "Volver a AHORA" - solo visible cuando se desvió del momento actual */}
      {!esAhora && indiceAhora !== null && (
        <button
          onClick={() => setIndiceHora(indiceAhora)}
          style={{
            position: "absolute",
            bottom: 110, // arriba del slider
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            color: "#334155",
            border: "none",
            borderRadius: 999,
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        >
          ← Volver a AHORA
        </button>
      )}

      {pronosticoGrid && capaVientoVisible && indiceHora !== null && (
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
