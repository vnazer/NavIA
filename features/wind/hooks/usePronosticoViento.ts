// Hook para consumir pronóstico del spot actualmente seleccionado.
// Implementa cache simple en memoria + AsyncStorage para uso offline.
//
// FIX en Prompt 3.6.1: suscripción a `spotIdSeleccionado` + `overrides` por
// separado y derivación con useMemo. Usar `useSpotStore(s => s.getSpotActual())`
// devolvía un objeto nuevo en cada render (por el spread con override),
// disparando "Maximum update depth exceeded" en React.

import { useEffect, useState, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
import { SPOTS } from "@/features/spots/data/spots";
import { obtenerPronosticoViento } from "../services/openMeteo";
import type { Pronostico } from "../types";

type EstadoHook = {
  pronostico: Pronostico | null;
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
};

const TTL_MINUTOS = 30;

function clavePersistencia(spotId: string) {
  // v2 (Prompt 9): nuevos campos atmosféricos en el shape de Pronostico.
  // El cache v1 queda huérfano en AsyncStorage pero no rompe (los users
  // simplemente refetchean al primer load).
  return `navia-pronostico-v2-${spotId}`;
}

export function usePronosticoViento(): EstadoHook {
  // Suscripción a primitivos del store (estables entre renders)
  const spotId = useSpotStore((s) => s.spotIdSeleccionado);
  const overrides = useSpotStore((s) => s.overrides);

  // Derivar spot con override aplicado (memo: solo cambia si cambian deps)
  const spot = useMemo(() => {
    const base = SPOTS.find((s) => s.id === spotId) ?? SPOTS[0];
    const ov = overrides[base.id];
    return ov ? { ...base, lat: ov.lat, lon: ov.lon } : base;
  }, [spotId, overrides]);

  const [pronostico, setPronostico] = useState<Pronostico | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    // 1. Intentar leer cache local
    try {
      const cacheRaw = await AsyncStorage.getItem(clavePersistencia(spot.id));
      if (cacheRaw) {
        const cache = JSON.parse(cacheRaw) as Pronostico;
        const edadMs = Date.now() - new Date(cache.generadoEn).getTime();
        if (edadMs < TTL_MINUTOS * 60_000) {
          setPronostico(cache);
          setCargando(false);
          return;
        }
        setPronostico(cache);
      }
    } catch {
      // Cache corrupta: ignorar, seguir con fetch
    }

    // 2. Fetch fresco
    try {
      const fresco = await obtenerPronosticoViento(spot.lat, spot.lon, spot.id);
      setPronostico(fresco);
      await AsyncStorage.setItem(
        clavePersistencia(spot.id),
        JSON.stringify(fresco),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setError(`No se pudo obtener el pronóstico: ${msg}`);
    } finally {
      setCargando(false);
    }
  }, [spot.id, spot.lat, spot.lon]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { pronostico, cargando, error, recargar: cargar };
}
