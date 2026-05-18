// Componente interno que carga leaflet. Se monta solo en cliente
// (cargado vía dynamic import desde MapaSpots.web.tsx) porque leaflet
// accede a `window` al evaluar sus módulos y rompería el SSR estático
// que hace Expo Router con `output: static`.
//
// MODIFICADO EN PROMPT 3.6: agrega modo edición. Cuando está activo, los
// marcadores de spots son arrastrables. Al soltar, se guarda la coordenada
// como override en AsyncStorage.

import "leaflet/dist/leaflet.css";
import { useState, useMemo, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
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
import { ControlModoEdicion } from "./ControlModoEdicion";
import { CardVientoSpot } from "./CardVientoSpot";

export default function MapaSpotsInterno() {
  const spotIdActual = useSpotStore((s) => s.spotIdSeleccionado);
  const overrides = useSpotStore((s) => s.overrides);
  const setOverride = useSpotStore((s) => s.setOverride);

  // Derivar spots con overrides aplicados (memo en deps primitivas para
  // evitar loops infinitos — el selector que retorna array nuevo causa
  // "Maximum update depth exceeded" porque Zustand compara por Object.is).
  const todosLosSpots = useMemo(
    () =>
      SPOTS.map((s) => {
        const ov = overrides[s.id];
        return ov ? { ...s, lat: ov.lat, lon: ov.lon } : s;
      }),
    [overrides],
  );

  const spotActual = useMemo(
    () => todosLosSpots.find((s) => s.id === spotIdActual) ?? todosLosSpots[0],
    [todosLosSpots, spotIdActual],
  );

  const { pronostico: pronosticoGrid } = usePronosticoGrid();
  const { pronostico: pronosticoSpot } = usePronosticoViento();

  const [indiceHora, setIndiceHora] = useState<number | null>(null);
  const [capaVientoVisible, setCapaVientoVisible] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);

  const indiceAhora = useMemo(() => {
    if (!pronosticoGrid?.puntos[0]?.puntos.length) return null;
    const ahoraTs = Date.now() - 60 * 60 * 1000;
    const idx = pronosticoGrid.puntos[0].puntos.findIndex(
      (p) => new Date(p.hora).getTime() >= ahoraTs,
    );
    return idx === -1 ? 0 : idx;
  }, [pronosticoGrid]);

  useEffect(() => {
    if (indiceAhora !== null && indiceHora === null) {
      setIndiceHora(indiceAhora);
    }
  }, [indiceAhora, indiceHora]);

  const maximoHoras = pronosticoGrid?.puntos[0]?.puntos.length
    ? pronosticoGrid.puntos[0].puntos.length - 1
    : 47;

  const indiceHoraSeguro = indiceHora ?? indiceAhora ?? 0;

  const timestampSeleccionado =
    pronosticoGrid?.puntos[0]?.puntos[indiceHoraSeguro]?.hora;

  const puntoSpotEnHora = (() => {
    if (!pronosticoSpot || !timestampSeleccionado) return null;
    return (
      pronosticoSpot.puntos.find((p) => p.hora === timestampSeleccionado) ??
      pronosticoSpot.puntos[indiceHoraSeguro] ??
      null
    );
  })();

  const esAhora =
    indiceAhora !== null && indiceHoraSeguro === indiceAhora;

  // Handler para cuando se suelta un marcador arrastrado
  const handleDragEnd = (spotId: string) => (e: L.LeafletEvent) => {
    const target = e.target as L.Marker;
    const { lat, lng } = target.getLatLng();
    setOverride(spotId, lat, lng);
  };

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <MapContainer
        center={[MAPA_CONFIG.centroInicial.lat, MAPA_CONFIG.centroInicial.lon]}
        zoom={MAPA_CONFIG.zoomInicial}
        minZoom={MAPA_CONFIG.zoomMin}
        maxZoom={MAPA_CONFIG.zoomMax}
        style={{ height: "100%", width: "100%", minHeight: 500 }}
        scrollWheelZoom={true}
      >
        <TileLayer url={TILES.base.url} attribution={TILES.base.atribucion} />
        <TileLayer url={TILES.seamark.url} attribution={TILES.seamark.atribucion} />

        <CapaVientoMapa
          pronostico={pronosticoGrid}
          indiceHora={indiceHoraSeguro}
          visible={capaVientoVisible && !modoEdicion}
        />

        {todosLosSpots.map((spot) => {
          const esActual = spot.id === spotIdActual;
          return (
            <Marker
              key={spot.id}
              position={[spot.lat, spot.lon]}
              icon={iconoSpot(esActual)}
              draggable={modoEdicion}
              eventHandlers={{
                dragend: handleDragEnd(spot.id),
              }}
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

      <ControlModoEdicion
        activo={modoEdicion}
        onToggle={() => setModoEdicion(!modoEdicion)}
      />

      {/* Banner instructivo cuando modo edición está activo */}
      {modoEdicion && (
        <div style={{
          position: "absolute",
          top: 16,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          backgroundColor: "#dc2626",
          color: "white",
          padding: "8px 16px",
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 600,
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}>
          🎯 Arrastrá cada marcador a la ubicación correcta del club
        </div>
      )}

      {!modoEdicion && (
        <CardVientoSpot
          spot={spotActual}
          punto={puntoSpotEnHora}
          esAhora={esAhora}
        />
      )}

      {!esAhora && indiceAhora !== null && !modoEdicion && (
        <button
          onClick={() => setIndiceHora(indiceAhora)}
          style={{
            position: "absolute",
            bottom: 110,
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

      {pronosticoGrid &&
        capaVientoVisible &&
        indiceHora !== null &&
        !modoEdicion && (
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
