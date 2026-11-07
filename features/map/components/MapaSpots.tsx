// Mapa interactivo de spots para iOS y Android con react-native-maps.
// En web Metro usa MapaSpots.web.tsx (Leaflet) automáticamente.

import { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import MapView, { UrlTile, Marker, Polyline } from "react-native-maps";
import { MapPin } from "lucide-react-native";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { useBoyasStore } from "@/features/boyas/store/useBoyasStore";
import { SPOTS } from "@/features/spots/data/spots";
import { usePronosticoViento } from "@/features/wind/hooks/usePronosticoViento";
import { useVientoActual } from "@/features/wind/lib/vientoActual";
import { MAPA_CONFIG, TILES_NATIVO } from "../data/config";
import { ModalAgregarBoya } from "@/features/boyas/components/ModalAgregarBoya";
import { BOYA_META, type TipoBoya } from "@/features/boyas/types";
import { useTacticaStore } from "@/features/regata/store/useTacticaStore";
import { useColores } from "@/lib/tema";
import { beaufortDesdeNudos } from "@/lib/beaufort";
import { hexDesdeTailwind } from "@/lib/colores";
import { formatearDireccion } from "@/lib/nautica";
import type { Spot } from "@/features/spots/types";
import type { PuntoPronostico } from "@/features/wind/types";

type CoordsPendientes = { lat: number; lon: number } | null;

const REGION_INICIAL = {
  latitude: MAPA_CONFIG.centroInicial.lat,
  longitude: MAPA_CONFIG.centroInicial.lon,
  latitudeDelta: 1.2,
  longitudeDelta: 1.2,
};

function MarcadorSpot({ esActual }: { esActual: boolean }) {
  const size = esActual ? 26 : 20;
  return (
    <View
      style={{
        width: size,
        height: size,
        backgroundColor: esActual ? "#0a4d7a" : "#64748b",
        borderRadius: size / 2,
        borderWidth: esActual ? 3 : 2,
        borderColor: "#FFFFFF",
        transform: [{ rotate: "45deg" }],
      }}
    />
  );
}

function MarcadorBoya({ tipo, label }: { tipo: TipoBoya; label?: string }) {
  const meta = BOYA_META[tipo];
  return (
    <View style={{ alignItems: "center" }}>
      {label ? (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            paddingHorizontal: 6,
            paddingVertical: 2,
            marginBottom: 4,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter-Bold",
              fontSize: 10,
              color: "#0f172a",
            }}
          >
            {label}
          </Text>
        </View>
      ) : null}
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: meta.color,
          borderWidth: 3,
          borderColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 14 }}>{meta.emoji}</Text>
      </View>
    </View>
  );
}

function CardVientoSpotNativo({
  spot,
  punto,
}: {
  spot: Spot;
  punto: PuntoPronostico | null;
}) {
  const c = useColores();
  if (!punto) return null;

  const beaufort = beaufortDesdeNudos(punto.velocidadNudos);
  const bgColor = hexDesdeTailwind(beaufort.colorTw);

  return (
    <View
      style={{
        position: "absolute",
        bottom: 24,
        left: 16,
        backgroundColor: bgColor,
        padding: 16,
        width: 250,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
      }}
    >
      <Text
        style={{
          fontFamily: "Inter-Bold",
          fontSize: 10,
          color: "#FFFFFF",
          textTransform: "uppercase",
          opacity: 0.85,
          letterSpacing: 0.5,
        }}
      >
        {spot.nombre}
      </Text>
      
      {/* Viento Principal */}
      <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 4 }}>
        <Text
          style={{
            fontFamily: "JetBrainsMono-ExtraBold",
            fontSize: 34,
            color: "#FFFFFF",
          }}
        >
          {Math.round(punto.velocidadNudos)}
        </Text>
        <Text style={{ fontFamily: "Inter-Bold", fontSize: 14, color: "#FFFFFF", marginLeft: 2, opacity: 0.9 }}>
          kt
        </Text>
        <Text style={{ fontFamily: "Inter-Regular", fontSize: 11, color: "#FFFFFF", marginLeft: 8, opacity: 0.85 }}>
          Rachas {Math.round(punto.rachasNudos)}
        </Text>
      </View>

      <Text style={{ fontFamily: "Inter-Medium", fontSize: 12, color: "#FFFFFF", marginTop: 2 }}>
        {formatearDireccion(punto.direccionGrados)} · Fuerza {beaufort.fuerza}
      </Text>

      {/* Grid de Olas y Clima */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 12,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: "rgba(255, 255, 255, 0.25)",
        }}
      >
        {punto.olaMt != null && (
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 8, color: "#FFFFFF", opacity: 0.75, textTransform: "uppercase" }}>
              Olas
            </Text>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 13, color: "#FFFFFF", marginTop: 2 }}>
              🌊 {punto.olaMt.toFixed(1)}m
            </Text>
          </View>
        )}
        
        {punto.temperaturaC != null && (
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 8, color: "#FFFFFF", opacity: 0.75, textTransform: "uppercase" }}>
              Temp
            </Text>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 13, color: "#FFFFFF", marginTop: 2 }}>
              🌡️ {Math.round(punto.temperaturaC)}°C
            </Text>
          </View>
        )}

        {punto.probLluvia != null && (
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 8, color: "#FFFFFF", opacity: 0.75, textTransform: "uppercase" }}>
              Lluvia
            </Text>
            <Text style={{ fontFamily: "Inter-Bold", fontSize: 13, color: "#FFFFFF", marginTop: 2 }}>
              🌧️ {Math.round(punto.probLluvia)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function MapaSpots() {
  const c = useColores();
  const spotIdActual = useSpotStore((s) => s.spotIdSeleccionado);
  const overrides = useSpotStore((s) => s.overrides);
  const boyas = useBoyasStore((s) => s.boyas);
  const agregarBoya = useBoyasStore((s) => s.agregarBoya);

  const modoTactico = useTacticaStore((s) => s.modoActivo);
  const committeeId = useTacticaStore((s) => s.boyaCommitteeId);
  const pinId = useTacticaStore((s) => s.boyaPinId);

  const { pronostico: pronosticoSpot } = usePronosticoViento();

  const [seamarkVisible, setSeamarkVisible] = useState(true);
  const [coordsPendientes, setCoordsPendientes] =
    useState<CoordsPendientes>(null);

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

  const lineaSalida = useMemo(() => {
    if (modoTactico !== "prestart") return null;
    const committee = boyas.find((b) => b.id === committeeId);
    const pin = boyas.find((b) => b.id === pinId);
    if (!committee || !pin) return null;
    return { committee, pin };
  }, [modoTactico, committeeId, pinId, boyas]);

  // Hora del pronóstico más cercana a ahora (mismo criterio en toda la app)
  const puntoSpotAhora = useVientoActual(pronosticoSpot);

  const handleLongPress = (lat: number, lon: number) => {
    setCoordsPendientes({ lat, lon });
  };

  const handleConfirmarBoya = (tipo: TipoBoya, label?: string) => {
    if (!coordsPendientes) return;
    agregarBoya(tipo, coordsPendientes.lat, coordsPendientes.lon, label);
    setCoordsPendientes(null);
  };

  return (
    <View style={styles.contenedor}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={REGION_INICIAL}
        mapType="none"
        onLongPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          handleLongPress(latitude, longitude);
        }}
      >
        {/* shouldReplaceMapContent: en iOS mapType="none" no existe; así OSM
            reemplaza el mapa de Apple (sin etiquetas duplicadas) */}
        <UrlTile
          urlTemplate={TILES_NATIVO.base}
          maximumZ={19}
          zIndex={1}
          shouldReplaceMapContent
        />
        {/* OpenSeaMap solo renderiza desde zoom 12 (debajo: placeholder) */}
        {seamarkVisible && (
          <UrlTile
            urlTemplate={TILES_NATIVO.seamark}
            minimumZ={12}
            maximumZ={19}
            zIndex={2}
          />
        )}

        {todosLosSpots.map((spot) => (
          <Marker
            key={spot.id}
            coordinate={{ latitude: spot.lat, longitude: spot.lon }}
            title={spot.nombre}
            description={spot.club}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <MarcadorSpot esActual={spot.id === spotIdActual} />
          </Marker>
        ))}

        {boyas.map((b) => (
          <Marker
            key={b.id}
            coordinate={{ latitude: b.lat, longitude: b.lon }}
            title={BOYA_META[b.tipo].nombre}
            anchor={{ x: 0.5, y: 1 }}
            tracksViewChanges={false}
          >
            <MarcadorBoya tipo={b.tipo} label={b.label} />
          </Marker>
        ))}

        {lineaSalida && (
          <Polyline
            coordinates={[
              {
                latitude: lineaSalida.committee.lat,
                longitude: lineaSalida.committee.lon,
              },
              {
                latitude: lineaSalida.pin.lat,
                longitude: lineaSalida.pin.lon,
              },
            ]}
            strokeColor="#dc2626"
            strokeWidth={3}
            lineDashPattern={[6, 6]}
          />
        )}
      </MapView>

      <Pressable
        onPress={() => setSeamarkVisible(!seamarkVisible)}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: seamarkVisible ? c.navy : c.surface,
          borderWidth: 1,
          borderColor: c.border,
          paddingHorizontal: 12,
          paddingVertical: 10,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          minHeight: 48,
        }}
      >
        <MapPin size={16} color={seamarkVisible ? "#FFFFFF" : c.text2} />
        <Text
          style={{
            fontFamily: "Inter-Bold",
            fontSize: 13,
            color: seamarkVisible ? "#FFFFFF" : c.text2,
          }}
        >
          Cartas
        </Text>
      </Pressable>

      {/* Aviso debajo del botón "Cartas" (antes quedaba encima de él) */}
      {boyas.length === 0 && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: 76,
            left: 16,
            right: 16,
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.88)",
              paddingHorizontal: 14,
              paddingVertical: 8,
            }}
          >
            <Text
              style={{
                fontFamily: "Inter-Regular",
                fontSize: 12,
                color: "#FFFFFF",
              }}
            >
              Mantén presionado el mapa para marcar una boya
            </Text>
          </View>
        </View>
      )}

      <CardVientoSpotNativo spot={spotActual} punto={puntoSpotAhora} />

      {/* El aviso "Capa viento: solo web" se omite en nativo (tapaba "Cartas") */}
      <ModalAgregarBoya
        lat={coordsPendientes?.lat ?? 0}
        lon={coordsPendientes?.lon ?? 0}
        visible={coordsPendientes !== null}
        onConfirmar={handleConfirmarBoya}
        onCancelar={() => setCoordsPendientes(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
  },
});
