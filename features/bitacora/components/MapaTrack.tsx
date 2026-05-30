// Mapa nativo del track GPS analizado (Polyline + inicio/fin).

import { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { UrlTile, Marker, Polyline } from "react-native-maps";
import { TILES_NATIVO } from "@/features/map/data/config";
import type { PuntoAnalizado } from "../lib/analitica";

type Props = {
  puntos: PuntoAnalizado[];
};

function MarcadorCirculo({ color }: { color: string }) {
  return (
    <View
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: color,
        borderWidth: 2,
        borderColor: "#FFFFFF",
      }}
    />
  );
}

function calcularRegion(puntos: PuntoAnalizado[]) {
  const lats = puntos.map((p) => p.lat);
  const lons = puntos.map((p) => p.lon);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const δLat = Math.max(maxLat - minLat, 0.001);
  const δLon = Math.max(maxLon - minLon, 0.001);
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLon + maxLon) / 2,
    latitudeDelta: δLat * 1.2,
    longitudeDelta: δLon * 1.2,
  };
}

function colorPorPerformance(pct: number): string {
  if (pct >= 95) return "#16a34a"; // Verde (Excelente / Óptimo)
  if (pct >= 80) return "#f59e0b"; // Naranja / Amarillo (Buen ritmo)
  return "#dc2626"; // Rojo (Subóptimo)
}

export function MapaTrack({ puntos }: Props) {
  const region = useMemo(() => calcularRegion(puntos), [puntos]);

  const segments = useMemo(() => {
    if (puntos.length < 2) return [];
    const list = [];
    for (let i = 1; i < puntos.length; i++) {
      const p1 = puntos[i - 1];
      const p2 = puntos[i];
      list.push({
        id: `${p1.ts}-${p2.ts}-${i}`,
        coordinates: [
          { latitude: p1.lat, longitude: p1.lon },
          { latitude: p2.lat, longitude: p2.lon },
        ],
        color: colorPorPerformance(p2.porcentajePolar),
      });
    }
    return list;
  }, [puntos]);

  if (puntos.length < 2) {
    return null;
  }

  const inicio = puntos[0];
  const fin = puntos[puntos.length - 1];

  return (
    <View style={styles.contenedor}>
      <MapView style={StyleSheet.absoluteFill} region={region} mapType="none">
        <UrlTile urlTemplate={TILES_NATIVO.base} maximumZ={19} zIndex={1} />
        <UrlTile urlTemplate={TILES_NATIVO.seamark} maximumZ={19} zIndex={2} />

        {segments.map((seg) => (
          <Polyline
            key={seg.id}
            coordinates={seg.coordinates}
            strokeColor={seg.color}
            strokeWidth={4}
          />
        ))}

        <Marker
          coordinate={{ latitude: inicio.lat, longitude: inicio.lon }}
          title="Inicio"
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <MarcadorCirculo color="#10b981" />
        </Marker>

        <Marker
          coordinate={{ latitude: fin.lat, longitude: fin.lon }}
          title="Fin"
          anchor={{ x: 0.5, y: 0.5 }}
          tracksViewChanges={false}
        >
          <MarcadorCirculo color="#dc2626" />
        </Marker>
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    height: 360,
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
  },
});
