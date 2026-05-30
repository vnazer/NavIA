// Mini-mapa nativo para la pantalla /regata: barco + boyas + cartas OSM.

import { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import MapView, { UrlTile, Marker } from "react-native-maps";
import Svg, { Polygon } from "react-native-svg";
import { TILES_NATIVO } from "@/features/map/data/config";
import { BOYA_META, type Boya } from "../types";

type Props = {
  posBarco: { lat: number; lon: number; cog?: number } | null;
  boyas: Boya[];
  fallback: { lat: number; lon: number };
};

function MarcadorBarco({ cog }: { cog?: number }) {
  const rotacion = cog ?? 0;
  return (
    <View style={{ transform: [{ rotate: `${rotacion}deg` }] }}>
      <Svg width={22} height={22} viewBox="0 0 20 20">
        <Polygon
          points="10,2 16,18 10,14 4,18"
          fill="#0a4d7a"
          stroke="#FFFFFF"
          strokeWidth={1.5}
        />
      </Svg>
    </View>
  );
}

function MarcadorBoya({ tipo }: { tipo: Boya["tipo"] }) {
  const meta = BOYA_META[tipo];
  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: meta.color,
        borderWidth: 2,
        borderColor: "#FFFFFF",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 12 }}>{meta.emoji}</Text>
    </View>
  );
}

function calcularRegion(
  centro: { lat: number; lon: number },
  boyas: Boya[],
) {
  const lats = [centro.lat, ...boyas.map((b) => b.lat)];
  const lons = [centro.lon, ...boyas.map((b) => b.lon)];
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const δLat = Math.max(maxLat - minLat, 0.005);
  const δLon = Math.max(maxLon - minLon, 0.005);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: δLat * 1.3,
    longitudeDelta: δLon * 1.3,
  };
}

export function MapaRegata({ posBarco, boyas, fallback }: Props) {
  const centro = posBarco ?? fallback;
  const region = useMemo(
    () => calcularRegion(centro, boyas),
    [centro, boyas],
  );

  return (
    <View style={styles.contenedor}>
      <MapView style={StyleSheet.absoluteFill} region={region} mapType="none">
        <UrlTile urlTemplate={TILES_NATIVO.base} maximumZ={19} zIndex={1} />
        <UrlTile urlTemplate={TILES_NATIVO.seamark} maximumZ={19} zIndex={2} />

        {posBarco && (
          <Marker
            coordinate={{
              latitude: posBarco.lat,
              longitude: posBarco.lon,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <MarcadorBarco cog={posBarco.cog} />
          </Marker>
        )}

        {boyas.map((b) => (
          <Marker
            key={b.id}
            coordinate={{ latitude: b.lat, longitude: b.lon }}
            title={BOYA_META[b.tipo].nombre}
            tracksViewChanges={false}
          >
            <MarcadorBoya tipo={b.tipo} />
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    height: 300,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
});
