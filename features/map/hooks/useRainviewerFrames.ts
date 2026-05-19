// Hook que orquesta la animación de frames de RainViewer.
// Cuando `activo`, fetchea los frames una vez y cicla cada 600ms.
// Devuelve el frame actual + flag de "es nowcast" para que la UI pueda
// renderizar el TileLayer (dentro del mapa) y un indicador (fuera).

import { useEffect, useState, useRef } from "react";
import {
  fetchFramesRainViewer,
  type DatosRainViewer,
  type FrameRainViewer,
} from "../data/rainviewer";

const INTERVALO_FRAME_MS = 600;

export type EstadoRainviewer = {
  cargando: boolean;
  error: string | null;
  host: string | null;
  frameActual: FrameRainViewer | null;
  esNowcast: boolean;
  totalFrames: number;
  indiceFrame: number;
};

export function useRainviewerFrames(activo: boolean): EstadoRainviewer {
  const [datos, setDatos] = useState<DatosRainViewer | null>(null);
  const [indiceFrame, setIndiceFrame] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch frames cuando se activa
  useEffect(() => {
    if (!activo) return;
    let cancelado = false;
    setCargando(true);
    setError(null);
    fetchFramesRainViewer()
      .then((d) => {
        if (cancelado) return;
        setDatos(d);
        setIndiceFrame(d.past.length - 1); // arrancar en "ahora" (último frame pasado)
      })
      .catch((e) => {
        if (cancelado) return;
        setError(e instanceof Error ? e.message : "Error RainViewer");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [activo]);

  // Animar avanzando de frame
  useEffect(() => {
    if (!activo || !datos) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    const total = datos.past.length + datos.nowcast.length;
    if (total === 0) return;
    intervalRef.current = setInterval(() => {
      setIndiceFrame((i) => (i + 1) % total);
    }, INTERVALO_FRAME_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [activo, datos]);

  if (!activo || !datos) {
    return {
      cargando,
      error,
      host: null,
      frameActual: null,
      esNowcast: false,
      totalFrames: 0,
      indiceFrame: 0,
    };
  }

  const todos = [...datos.past, ...datos.nowcast];
  const frame = todos[indiceFrame] ?? null;
  const esNowcast = indiceFrame >= datos.past.length;

  return {
    cargando,
    error,
    host: datos.host,
    frameActual: frame,
    esNowcast,
    totalFrames: todos.length,
    indiceFrame,
  };
}
