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
  // Un solo recorrido (Math.min(...arr) con miles de puntos puede reventar
  // el límite de argumentos)
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;
  for (const p of puntos) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lon < minLon) minLon = p.lon;
    if (p.lon > maxLon) maxLon = p.lon;
  }
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

/** Máximo de vértices a dibujar: con 1 punto/s una regata de 2 h son 7200. */
const MAX_PUNTOS_MAPA = 1500;

type Tramo = {
  id: string;
  color: string;
  coordinates: { latitude: number; longitude: number }[];
};

/**
 * Simplifica el track (1 de cada N puntos, conservando el último) y agrupa
 * los segmentos consecutivos del mismo color en una sola Polyline.
 * Antes: una Polyline por segmento (miles de vistas nativas).
 */
function construirTramos(puntos: PuntoAnalizado[]): Tramo[] {
  if (puntos.length < 2) return [];
  const paso = Math.max(1, Math.ceil(puntos.length / MAX_PUNTOS_MAPA));
  const muestra: PuntoAnalizado[] = [];
  for (let i = 0; i < puntos.length; i += paso) muestra.push(puntos[i]);
  if (muestra[muestra.length - 1] !== puntos[puntos.length - 1]) {
    muestra.push(puntos[puntos.length - 1]);
  }

  const tramos: Tramo[] = [];
  let actual: Tramo | null = null;
  for (let i = 1; i < muestra.length; i++) {
    const p1 = muestra[i - 1];
    const p2 = muestra[i];
    const color = colorPorPerformance(p2.porcentajePolar);
    if (actual && actual.color === color) {
      actual.coordinates.push({ latitude: p2.lat, longitude: p2.lon });
    } else {
      // Nuevo tramo: arranca en p1 para que no queden huecos entre colores
      actual = {
        id: `${p1.ts}-${i}`,
        color,
        coordinates: [
          { latitude: p1.lat, longitude: p1.lon },
          { latitude: p2.lat, longitude: p2.lon },
        ],
      };
      tramos.push(actual);
    }
  }
  return tramos;
}

export function MapaTrack({ puntos }: Props) {
  const region = useMemo(() => calcularRegion(puntos), [puntos]);

  const segments = useMemo(() => construirTramos(puntos), [puntos]);

  if (puntos.length < 2) {
    return null;
  }

  const inicio = puntos[0];
  const fin = puntos[puntos.length - 1];

  return (
    <View style={styles.contenedor}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={region} mapType="none">
        {/* shouldReplaceMapContent: en iOS mapType="none" no existe; así OSM
            reemplaza el mapa de Apple (sin etiquetas duplicadas) */}
        <UrlTile
          urlTemplate={TILES_NATIVO.base}
          maximumZ={19}
          zIndex={1}
          shouldReplaceMapContent
        />
        {/* OpenSeaMap solo renderiza desde zoom 12 (debajo: placeholder) */}
        <UrlTile
          urlTemplate={TILES_NATIVO.seamark}
          minimumZ={12}
          maximumZ={19}
          zIndex={2}
        />

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
