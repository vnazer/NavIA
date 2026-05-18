// Hook de tracking GPS continuo usando expo-location.
// Mantiene API original (devuelve permiso/ultimoPunto/error) PERO también
// escribe al store global useGpsStore para que otros componentes lean sin
// abrir su propia subscription (evita doble drain de batería y conflictos
// de permisos).

import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
import { useGpsStore } from "../store/useGpsStore";
import type { PuntoTrack } from "../types";

type EstadoPermiso = "pendiente" | "concedido" | "denegado";

type Opciones = {
  /** Si está activo, el hook subscribe al GPS. */
  activo: boolean;
  /** Callback llamado cada vez que llega un punto nuevo. */
  onPunto?: (p: PuntoTrack) => void;
};

export function useTrackingGPS({ activo, onPunto }: Opciones) {
  const [permiso, setPermiso] = useState<EstadoPermiso>("pendiente");
  const [ultimoPunto, setUltimoPunto] = useState<PuntoTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const onPuntoRef = useRef(onPunto);
  onPuntoRef.current = onPunto;

  useEffect(() => {
    if (!activo) return;

    let subscription: Location.LocationSubscription | null = null;
    let cancelado = false;

    // Refcount global: si ya hay otra subscription activa, no spawneamos otra
    useGpsStore.getState().incrementarRef();

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelado) return;
        if (status !== "granted") {
          setPermiso("denegado");
          setError("Permiso de ubicación denegado");
          useGpsStore.setState({
            permiso: "denegado",
            error: "Permiso de ubicación denegado",
          });
          return;
        }
        setPermiso("concedido");
        setError(null);
        useGpsStore.setState({ permiso: "concedido", error: null });

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (loc) => {
            const sogKts =
              loc.coords.speed != null && loc.coords.speed >= 0
                ? loc.coords.speed * 1.9438
                : 0;
            const cogGrados =
              loc.coords.heading != null && loc.coords.heading >= 0
                ? loc.coords.heading
                : 0;

            const punto: PuntoTrack = {
              ts: loc.timestamp,
              lat: loc.coords.latitude,
              lon: loc.coords.longitude,
              sogKts,
              cogGrados,
              precisionMetros: loc.coords.accuracy ?? null,
            };
            setUltimoPunto(punto);
            useGpsStore.getState().setUltimoPunto(punto);
            onPuntoRef.current?.(punto);
          },
        );
      } catch (err) {
        if (!cancelado) {
          const msg =
            err instanceof Error ? err.message : "Error desconocido GPS";
          setError(msg);
          useGpsStore.setState({ error: msg });
        }
      }
    })();

    return () => {
      cancelado = true;
      useGpsStore.getState().decrementarRef();
      try {
        if (subscription && typeof subscription.remove === "function") {
          subscription.remove();
        }
      } catch {
        // ignorar — la subscription no estaba completamente inicializada
      }
    };
  }, [activo]);

  return { permiso, ultimoPunto, error };
}
