// Componente interno que carga leaflet. Se monta solo en cliente
// (cargado vía dynamic import desde MapaSpots.web.tsx) porque leaflet
// accede a `window` al evaluar sus módulos y rompería el SSR estático
// que hace Expo Router con `output: static`.
//
// MODIFICADO EN PROMPT 3.6: agrega modo edición de spots (arrastre).
// MODIFICADO EN PROMPT 7: agrega capa de boyas race-day. Click derecho
// (web) o long-press (mobile) abre modal para agregar una boya en esas
// coordenadas. Las boyas aparecen como markers con icono propio por tipo.

import "leaflet/dist/leaflet.css";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { useBoyasStore } from "@/features/boyas/store/useBoyasStore";
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
import { iconoBoya } from "@/features/boyas/components/iconoBoya";
import { PopupBoya } from "@/features/boyas/components/PopupBoya";
import { ModalAgregarBoya } from "@/features/boyas/components/ModalAgregarBoya.web";
import type { TipoBoya } from "@/features/boyas/types";
import { useTacticaStore } from "@/features/regata/store/useTacticaStore";
import { useRainviewerFrames } from "../hooks/useRainviewerFrames";
import { CapaLluviaTiles } from "./CapaLluviaTiles.web";
import { IndicadorLluvia } from "./IndicadorLluvia";
import { ToggleLluvia } from "./ToggleLluvia";

const LONG_PRESS_MS = 600;

type CoordsPendientes = { lat: number; lon: number } | null;

/**
 * Captura long-press en el mapa para abrir el modal de agregar boya.
 *
 * - Web: contextmenu (click derecho) dispara inmediato
 * - Mobile/touch: mousedown inicia un timer de 600ms; si pasa el tiempo
 *   sin que el usuario suelte / arrastre / haga zoom, dispara como long-press.
 *
 * Está dentro del MapContainer porque useMapEvents requiere ese contexto.
 */
function CapturadorLongPress({
  onLongPress,
}: {
  onLongPress: (lat: number, lon: number) => void;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelar = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useMapEvents({
    contextmenu(e) {
      // Click derecho desktop — prevenimos el menú del browser
      e.originalEvent.preventDefault();
      onLongPress(e.latlng.lat, e.latlng.lng);
    },
    mousedown(e) {
      cancelar();
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;
      timerRef.current = setTimeout(() => {
        onLongPress(lat, lon);
        timerRef.current = null;
      }, LONG_PRESS_MS);
    },
    mouseup: cancelar,
    dragstart: cancelar,
    drag: cancelar,
    movestart: cancelar,
    zoom: cancelar,
    zoomstart: cancelar,
  });

  return null;
}

export default function MapaSpotsInterno() {
  const spotIdActual = useSpotStore((s) => s.spotIdSeleccionado);
  const overrides = useSpotStore((s) => s.overrides);
  const setOverride = useSpotStore((s) => s.setOverride);

  // Boyas race-day (store global, persistido)
  const boyas = useBoyasStore((s) => s.boyas);
  const agregarBoya = useBoyasStore((s) => s.agregarBoya);

  // Línea de salida del modo táctico (reactivo)
  const modoTactico = useTacticaStore((s) => s.modoActivo);
  const committeeId = useTacticaStore((s) => s.boyaCommitteeId);
  const pinId = useTacticaStore((s) => s.boyaPinId);
  const lineaSalida = useMemo(() => {
    if (modoTactico !== "prestart") return null;
    const c = boyas.find((b) => b.id === committeeId);
    const p = boyas.find((b) => b.id === pinId);
    if (!c || !p) return null;
    return {
      committee: [c.lat, c.lon] as [number, number],
      pin: [p.lat, p.lon] as [number, number],
    };
  }, [modoTactico, committeeId, pinId, boyas]);

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
  const [coordsPendientes, setCoordsPendientes] =
    useState<CoordsPendientes>(null);
  const [lluviaVisible, setLluviaVisible] = useState(false);

  // Frames de RainViewer animados (Prompt 9)
  const lluvia = useRainviewerFrames(lluviaVisible);

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

  const esAhora = indiceAhora !== null && indiceHoraSeguro === indiceAhora;

  // Handler para cuando se suelta un marcador arrastrado
  const handleDragEnd = (spotId: string) => (e: L.LeafletEvent) => {
    const target = e.target as L.Marker;
    const { lat, lng } = target.getLatLng();
    setOverride(spotId, lat, lng);
  };

  const handleLongPress = (lat: number, lon: number) => {
    // En modo edición no queremos agregar boyas
    if (modoEdicion) return;
    setCoordsPendientes({ lat, lon });
  };

  const handleConfirmarBoya = (tipo: TipoBoya, label?: string) => {
    if (!coordsPendientes) return;
    agregarBoya(tipo, coordsPendientes.lat, coordsPendientes.lon, label);
    setCoordsPendientes(null);
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

        {/* Capa lluvia radar (Prompt 9) — va antes que seamark para que las
            marcas náuticas queden visibles por encima del radar. */}
        {lluviaVisible && lluvia.host && lluvia.frameActual && (
          <CapaLluviaTiles host={lluvia.host} frame={lluvia.frameActual} />
        )}

        {/* OpenSeaMap solo renderiza seamarks a partir de zoom ~10. Pedir
            tiles por debajo de eso devuelve PNGs "Zoom Level Not Supported"
            que tapan el mapa. Limitamos con minZoom para evitarlo. */}
        <TileLayer
          url={TILES.seamark.url}
          attribution={TILES.seamark.atribucion}
          minZoom={TILES.seamark.minZoom}
          maxZoom={MAPA_CONFIG.zoomMax}
        />

        <CapturadorLongPress onLongPress={handleLongPress} />

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

        {/* Markers de boyas race-day (NUEVO Prompt 7) */}
        {boyas.map((b) => (
          <Marker
            key={b.id}
            position={[b.lat, b.lon]}
            icon={iconoBoya(b.tipo, b.label)}
          >
            <Popup>
              <PopupBoya boya={b} />
            </Popup>
          </Marker>
        ))}

        {/* Línea de salida durante modo prestart (NUEVO Prompt 8) */}
        {lineaSalida && (
          <Polyline
            positions={[lineaSalida.committee, lineaSalida.pin]}
            pathOptions={{
              color: "#dc2626",
              weight: 3,
              dashArray: "6 6",
              opacity: 0.9,
            }}
          />
        )}
      </MapContainer>

      <ControlCapaViento
        activa={capaVientoVisible}
        onToggle={() => setCapaVientoVisible(!capaVientoVisible)}
      />

      <ControlModoEdicion
        activo={modoEdicion}
        onToggle={() => setModoEdicion(!modoEdicion)}
      />

      <ToggleLluvia
        activo={lluviaVisible}
        onToggle={() => setLluviaVisible(!lluviaVisible)}
      />

      {/* Indicador con la hora del frame de RainViewer (Prompt 9) */}
      {lluviaVisible && lluvia.frameActual && (
        <IndicadorLluvia
          timestampSeg={lluvia.frameActual.time}
          esNowcast={lluvia.esNowcast}
        />
      )}

      {/* Banner instructivo cuando modo edición está activo */}
      {modoEdicion && (
        <div
          style={{
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
          }}
        >
          🎯 Arrastrá cada marcador a la ubicación correcta del club
        </div>
      )}

      {/* Hint para agregar boyas — solo cuando no hay boyas y no estás editando */}
      {!modoEdicion && boyas.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            backgroundColor: "rgba(15, 23, 42, 0.85)",
            color: "white",
            padding: "6px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 500,
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          Click derecho (o mantené tocado) sobre el mapa para marcar una boya
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

      {/* Modal flotante para agregar boya (montado fuera del MapContainer) */}
      {coordsPendientes && (
        <ModalAgregarBoya
          lat={coordsPendientes.lat}
          lon={coordsPendientes.lon}
          onConfirmar={handleConfirmarBoya}
          onCancelar={() => setCoordsPendientes(null)}
        />
      )}
    </div>
  );
}
