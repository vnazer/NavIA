// Mini-mapa nativo para la pantalla /regata: barco + boyas + cartas OSM.
// Región NO controlada (initialRegion): el usuario puede hacer zoom/pan.
// El botón "Seguir barco" re-centra con animateToRegion en cada punto GPS
// y se desactiva solo cuando el usuario arrastra el mapa.

import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MapView, { UrlTile, Marker, type Region } from 'react-native-maps';
import { Crosshair } from 'lucide-react-native';
import Svg, { Polygon } from 'react-native-svg';
import { TILES_NATIVO } from '@/features/map/data/config';
import { BOYA_META, type Boya } from '../types';

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
        <Polygon points="10,2 16,18 10,14 4,18" fill="#0a4d7a" stroke="#FFFFFF" strokeWidth={1.5} />
      </Svg>
    </View>
  );
}

function MarcadorBoya({ tipo }: { tipo: Boya['tipo'] }) {
  const meta = BOYA_META[tipo];
  return (
    <View
      style={{
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: meta.color,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 12 }}>{meta.emoji}</Text>
    </View>
  );
}

function calcularRegion(centro: { lat: number; lon: number }, boyas: Boya[]): Region {
  let minLat = centro.lat;
  let maxLat = centro.lat;
  let minLon = centro.lon;
  let maxLon = centro.lon;
  for (const b of boyas) {
    minLat = Math.min(minLat, b.lat);
    maxLat = Math.max(maxLat, b.lat);
    minLon = Math.min(minLon, b.lon);
    maxLon = Math.max(maxLon, b.lon);
  }
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
  const mapaRef = useRef<MapView>(null);
  // Región inicial: se calcula una sola vez (barco/spot + boyas)
  const [regionInicial] = useState(() => calcularRegion(posBarco ?? fallback, boyas));
  // Último zoom del usuario, para conservarlo al seguir al barco
  const deltaRef = useRef({
    latitudeDelta: regionInicial.latitudeDelta,
    longitudeDelta: regionInicial.longitudeDelta,
  });
  const [seguir, setSeguir] = useState(false);

  // Dependencias primitivas: posBarco puede ser un objeto nuevo en cada render
  const latBarco = posBarco?.lat;
  const lonBarco = posBarco?.lon;
  useEffect(() => {
    if (!seguir || latBarco == null || lonBarco == null) return;
    mapaRef.current?.animateToRegion(
      { latitude: latBarco, longitude: lonBarco, ...deltaRef.current },
      400,
    );
  }, [seguir, latBarco, lonBarco]);

  return (
    <View style={styles.contenedor}>
      {/* Al tocar el mapa el usuario toma el control: dejamos de seguir al
          barco (onPanDrag no dispara en iOS con scroll habilitado). */}
      <View style={StyleSheet.absoluteFill} onTouchStart={() => setSeguir(false)}>
        <MapView
          ref={mapaRef}
          style={StyleSheet.absoluteFill}
          initialRegion={regionInicial}
          mapType="none"
          onRegionChangeComplete={(r) => {
            deltaRef.current = {
              latitudeDelta: r.latitudeDelta,
              longitudeDelta: r.longitudeDelta,
            };
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
          <UrlTile urlTemplate={TILES_NATIVO.seamark} minimumZ={12} maximumZ={19} zIndex={2} />

          {posBarco && (
            <Marker
              // tracksViewChanges=false congela la vista en iOS: re-montamos
              // el marcador cada 5° de cambio de COG para que gire
              key={`barco-${Math.round((posBarco.cog ?? 0) / 5)}`}
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

      {posBarco && (
        <Pressable
          onPress={() => setSeguir((v) => !v)}
          hitSlop={8}
          style={[
            styles.botonSeguir,
            { backgroundColor: seguir ? '#0a4d7a' : 'rgba(255,255,255,0.92)' },
          ]}
        >
          <Crosshair size={16} color={seguir ? '#FFFFFF' : '#0a4d7a'} />
          <Text
            style={{
              fontFamily: 'Inter-Bold',
              fontSize: 12,
              color: seguir ? '#FFFFFF' : '#0a4d7a',
            }}
          >
            {seguir ? 'Siguiendo' : 'Seguir barco'}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    height: 300,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  botonSeguir: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
