// Hook de tracking GPS continuo usando expo-location.
// Devuelve último punto + estado del permiso. Acepta callback para
// persistir cada punto en el store.

import { useEffect, useState, useRef } from "react";
import * as Location from "expo-location";
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

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelado) return;
        if (status !== "granted") {
          setPermiso("denegado");
          setError("Permiso de ubicación denegado");
          return;
        }
        setPermiso("concedido");
        setError(null);

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (loc) => {
            // speed viene en m/s, convertir a nudos (1 m/s = 1.9438 kt)
            const sogKts =
              loc.coords.speed != null && loc.coords.speed >= 0
                ? loc.coords.speed * 1.9438
                : 0;
            // heading viene en grados 0-360, -1 si no disponible
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
            onPuntoRef.current?.(punto);
          },
        );
      } catch (err) {
        if (!cancelado) {
          setError(
            err instanceof Error ? err.message : "Error desconocido GPS",
          );
        }
      }
    })();

    return () => {
      cancelado = true;
      // En web (expo-location 18), watchPositionAsync puede devolver un
      // objeto sin método remove si la subscription aún no se materializó
      // (StrictMode mount/unmount rápido). Cleanup defensivo.
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
