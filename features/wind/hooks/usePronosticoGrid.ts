// Hook para obtener el pronóstico del grid completo.
// Implementa cache en AsyncStorage con TTL de 30 min para uso offline.

import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GRID_PUNTOS } from "../data/grid";
import {
  obtenerPronosticoGrid,
  type PronosticoGrid,
} from "../services/openMeteoGrid";

type EstadoHook = {
  pronostico: PronosticoGrid | null;
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
};

const CLAVE_CACHE = "navia-pronostico-grid";
const TTL_MINUTOS = 30;

export function usePronosticoGrid(): EstadoHook {
  const [pronostico, setPronostico] = useState<PronosticoGrid | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);

    // 1. Intentar leer cache local
    try {
      const cacheRaw = await AsyncStorage.getItem(CLAVE_CACHE);
      if (cacheRaw) {
        const cache = JSON.parse(cacheRaw) as PronosticoGrid;
        const edadMs = Date.now() - new Date(cache.generadoEn).getTime();
        if (edadMs < TTL_MINUTOS * 60_000) {
          setPronostico(cache);
          setCargando(false);
          return;
        }
        // Cache vieja: mostrarla mientras refrescamos
        setPronostico(cache);
      }
    } catch {
      // Cache corrupta: ignorar, seguir con fetch
    }

    // 2. Fetch fresco
    try {
      const fresco = await obtenerPronosticoGrid(GRID_PUNTOS);
      setPronostico(fresco);
      await AsyncStorage.setItem(CLAVE_CACHE, JSON.stringify(fresco));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      setError(`No se pudo obtener el grid de viento: ${msg}`);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { pronostico, cargando, error, recargar: cargar };
}
