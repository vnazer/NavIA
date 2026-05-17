// Hook para consumir pronóstico del spot actualmente seleccionado.
// Implementa cache simple en memoria + AsyncStorage para uso offline.
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSpotStore } from "@/features/spots/store/useSpotStore";
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
  return `navia-pronostico-${spotId}`;
}

export function usePronosticoViento(): EstadoHook {
  const spot = useSpotStore((s) => s.getSpotActual());
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
        // Cache vieja: muéstrala mientras refrescamos
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
