// WebSocket cliente para aisstream.io.
//
// Estrategia (anti-loop):
// - Una sola conexión WS mientras `activo`. NO se reabre al cambiar el bbox.
// - Cambios de bbox debouncean 1.5 s y se aplican como mensaje de re-suscripción
//   sobre la misma conexión (aisstream lo soporta).
// - Mensajes entrantes se acumulan en un ref y se flushean a state cada 1 s
//   (evita ~100 setState/seg que ahogan a React).

import { useEffect, useMemo, useRef, useState } from "react";

export type BarcoAis = {
  mmsi: string;
  nombre?: string;
  lat: number;
  lon: number;
  sogKts?: number;
  cogGrados?: number;
  tipoBarco?: number;
  destino?: string;
  ultimaActualizacion: number;
};

type Bbox = [[number, number], [number, number]];

type Props = {
  activo: boolean;
  bbox: Bbox | null;
};

function buildSuscripcion(apiKey: string, bbox: Bbox) {
  return JSON.stringify({
    Apikey: apiKey,
    BoundingBoxes: [
      [
        [bbox[0][0], bbox[0][1]],
        [bbox[1][0], bbox[1][1]],
      ],
    ],
    FilterMessageTypes: ["PositionReport", "ShipStaticData"],
  });
}

export function useAisStream({ activo, bbox }: Props) {
  const [barcos, setBarcos] = useState<Map<string, BarcoAis>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);
  const bufferRef = useRef<Map<string, BarcoAis>>(new Map());
  const bboxRef = useRef<Bbox | null>(bbox);
  bboxRef.current = bbox;

  // Debounce del bbox: solo dispara re-suscripción cuando se queda estable.
  const bboxKey = bbox ? `${bbox[0][0]},${bbox[0][1]},${bbox[1][0]},${bbox[1][1]}` : "";
  const [bboxKeyDebounced, setBboxKeyDebounced] = useState(bboxKey);
  useEffect(() => {
    const t = setTimeout(() => setBboxKeyDebounced(bboxKey), 1500);
    return () => clearTimeout(t);
  }, [bboxKey]);

  // Conexión WS — depende SOLO de `activo`. Bbox cambia ⇒ re-subscribe sin cerrar.
  useEffect(() => {
    if (!activo) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setBarcos(new Map());
      bufferRef.current = new Map();
      return;
    }

    const apiKey = process.env.EXPO_PUBLIC_AISSTREAM_API_KEY;
    if (!apiKey) {
      console.warn(
        "[AIS] No hay API key. Define EXPO_PUBLIC_AISSTREAM_API_KEY en .env.local",
      );
      return;
    }

    const ws = new WebSocket("wss://stream.aisstream.io/v0/stream");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[AIS] WebSocket conectado");
      const actual = bboxRef.current;
      if (actual) ws.send(buildSuscripcion(apiKey, actual));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const tipo = msg.MessageType;
        const mmsi = String(msg.MetaData?.MMSI ?? "");
        if (!mmsi) return;

        const buffer = bufferRef.current;
        const existente = buffer.get(mmsi);
        if (tipo === "PositionReport") {
          const pr = msg.Message.PositionReport;
          buffer.set(mmsi, {
            mmsi,
            nombre: existente?.nombre,
            destino: existente?.destino,
            tipoBarco: existente?.tipoBarco,
            lat: pr.Latitude,
            lon: pr.Longitude,
            sogKts: pr.Sog,
            cogGrados: pr.Cog,
            ultimaActualizacion: Date.now(),
          });
        } else if (tipo === "ShipStaticData") {
          const sd = msg.Message.ShipStaticData;
          buffer.set(mmsi, {
            ...existente,
            mmsi,
            lat: existente?.lat ?? 0,
            lon: existente?.lon ?? 0,
            nombre: sd.Name?.trim(),
            destino: sd.Destination?.trim(),
            tipoBarco: sd.Type,
            ultimaActualizacion: existente?.ultimaActualizacion ?? Date.now(),
          });
        }
      } catch (err) {
        console.error("[AIS] Error parseando mensaje:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("[AIS] WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("[AIS] WebSocket cerrado");
    };

    // Flush periódico del buffer al state (1 vez por segundo).
    const intervalFlush = setInterval(() => {
      const ahora = Date.now();
      const buffer = bufferRef.current;
      const limpio = new Map<string, BarcoAis>();
      for (const [k, v] of buffer) {
        if (ahora - v.ultimaActualizacion < 5 * 60 * 1000) {
          limpio.set(k, v);
        }
      }
      bufferRef.current = limpio;
      setBarcos(new Map(limpio));
    }, 1000);

    return () => {
      ws.close();
      wsRef.current = null;
      clearInterval(intervalFlush);
    };
  }, [activo]);

  // Re-suscribir cuando el bbox debounced cambia y el WS está abierto.
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const apiKey = process.env.EXPO_PUBLIC_AISSTREAM_API_KEY;
    const actual = bboxRef.current;
    if (!apiKey || !actual) return;
    ws.send(buildSuscripcion(apiKey, actual));
  }, [bboxKeyDebounced]);

  const barcosArray = useMemo(() => Array.from(barcos.values()), [barcos]);
  return { barcos: barcosArray };
}
