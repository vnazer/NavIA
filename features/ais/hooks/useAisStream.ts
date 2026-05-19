// WebSocket cliente para aisstream.io. Se conecta solo cuando `activo`
// y mantiene un Map de barcos vistos en el bbox suministrado. Combina
// PositionReport (lat/lon/sog/cog) con ShipStaticData (nombre/destino/tipo).
//
// Cleanup: cierra el WS al desactivar, limpia barcos sin update >5 min.

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

type Props = {
  activo: boolean;
  /** [[latMin, lonMin], [latMax, lonMax]] */
  bbox: [[number, number], [number, number]];
};

export function useAisStream({ activo, bbox }: Props) {
  const [barcos, setBarcos] = useState<Map<string, BarcoAis>>(new Map());
  const wsRef = useRef<WebSocket | null>(null);

  const [latMin, lonMin] = bbox[0];
  const [latMax, lonMax] = bbox[1];

  // Debounce del bbox: solo reabrimos el WS si los límites se quedan
  // estables 800 ms (evita reconectar al hacer pan/zoom continuo, lo
  // que aisstream.io podría bloquear como abuso).
  const [bboxDebounced, setBboxDebounced] = useState({
    latMin,
    lonMin,
    latMax,
    lonMax,
  });
  useEffect(() => {
    const t = setTimeout(
      () => setBboxDebounced({ latMin, lonMin, latMax, lonMax }),
      800,
    );
    return () => clearTimeout(t);
  }, [latMin, lonMin, latMax, lonMax]);

  useEffect(() => {
    if (!activo) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setBarcos(new Map());
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
      ws.send(
        JSON.stringify({
          Apikey: apiKey,
          BoundingBoxes: [
            [
              [bboxDebounced.latMin, bboxDebounced.lonMin],
              [bboxDebounced.latMax, bboxDebounced.lonMax],
            ],
          ],
          FilterMessageTypes: ["PositionReport", "ShipStaticData"],
        }),
      );
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const tipo = msg.MessageType;
        const mmsi = String(msg.MetaData?.MMSI ?? "");
        if (!mmsi) return;

        setBarcos((prev) => {
          const nuevo = new Map(prev);
          const existente = nuevo.get(mmsi);

          if (tipo === "PositionReport") {
            const pr = msg.Message.PositionReport;
            nuevo.set(mmsi, {
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
            nuevo.set(mmsi, {
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
          return nuevo;
        });
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

    const intervalCleanup = setInterval(() => {
      setBarcos((prev) => {
        const ahora = Date.now();
        const filtrado = new Map<string, BarcoAis>();
        for (const [k, v] of prev) {
          if (ahora - v.ultimaActualizacion < 5 * 60 * 1000 && v.lat !== 0) {
            filtrado.set(k, v);
          }
        }
        return filtrado;
      });
    }, 30000);

    return () => {
      ws.close();
      clearInterval(intervalCleanup);
    };
  }, [
    activo,
    bboxDebounced.latMin,
    bboxDebounced.lonMin,
    bboxDebounced.latMax,
    bboxDebounced.lonMax,
  ]);

  const barcosArray = useMemo(() => Array.from(barcos.values()), [barcos]);
  return { barcos: barcosArray };
}
