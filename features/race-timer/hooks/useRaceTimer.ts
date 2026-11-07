// Hook que retorna el estado vivo del race timer.
// Recalcula cada 250ms sin guardar nada en store (eso vendría a costar).
// Los anuncios de voz/vibración NO van acá (este hook puede estar montado en
// varias pantallas a la vez): viven en useAnunciosRaceTimer, montado una vez.

import { useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { useRaceTimerStore } from "../store/useRaceTimerStore";
import {
  anunciarMinuto,
  anunciarCountdownFinal,
  anunciarStart,
} from "@/lib/voz/servicio";

export type FaseRegata =
  | "off" // timer no activo
  | "warning" // > 4 min al start (5min phase típicamente)
  | "preparatory" // 4 min al start
  | "onemin" // último minuto
  | "start" // 0 → -10s (gun)
  | "racing"; // post-start

export type EstadoTimer = {
  /** ms hasta el start. Negativo = post-start. 0 si timer apagado. */
  tiempoRestanteMs: number;
  /** Fase actual de la cuenta regresiva. */
  fase: FaseRegata;
  activo: boolean;
};

function calcularFase(restanteMs: number): FaseRegata {
  const s = restanteMs / 1000;
  if (s > 240) return "warning"; // > 4 min
  if (s > 60) return "preparatory"; // 4 - 1 min
  if (s > 0) return "onemin"; // 1 min - 0
  if (s > -10) return "start"; // 0 → -10s
  return "racing";
}

export function useRaceTimer(): EstadoTimer {
  const startTs = useRaceTimerStore((s) => s.startTs);
  const [, setTick] = useState(0);

  // Forzar re-render cada 250ms cuando timer activo
  useEffect(() => {
    if (!startTs) return;
    const id = setInterval(() => setTick((t) => t + 1), 250);
    return () => clearInterval(id);
  }, [startTs]);

  if (!startTs) {
    return {
      tiempoRestanteMs: 0,
      fase: "off",
      activo: false,
    };
  }

  const restante = startTs - Date.now();

  return {
    tiempoRestanteMs: restante,
    fase: calcularFase(restante),
    activo: true,
  };
}

/** Vibración de respaldo (por si no se escucha la voz). No-op en web. */
function vibrar(tipo: "minuto" | "segundo" | "start"): void {
  if (Platform.OS === "web") return;
  const p =
    tipo === "minuto"
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      : tipo === "segundo"
        ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        : Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  p.catch(() => {
    // sin motor háptico: ignorar
  });
}

/**
 * Anuncios de voz + vibración del race timer (5/4/3/2/1 min, 10→1 s y start).
 * Montar UNA sola vez (layout raíz): así no se duplican aunque haya varias
 * instancias de useRaceTimer, y suenan aunque el widget no esté en pantalla.
 * Corre en un efecto (no durante el render).
 */
export function useAnunciosRaceTimer(): void {
  const startTs = useRaceTimerStore((s) => s.startTs);

  useEffect(() => {
    if (!startTs) return;
    // Registro de lo ya anunciado para este startTs (se reinicia si cambia)
    const minutosAnunciados = new Set<number>();
    const segundosAnunciados = new Set<number>();
    let startAnunciado = false;

    const revisar = () => {
      const restante = startTs - Date.now();
      const seg = Math.ceil(restante / 1000);

      // Anuncios por minuto (5, 4, 3, 2, 1)
      for (const min of [5, 4, 3, 2, 1]) {
        const umbralMs = min * 60 * 1000;
        if (
          restante <= umbralMs + 500 &&
          restante > umbralMs - 500 &&
          !minutosAnunciados.has(min)
        ) {
          minutosAnunciados.add(min);
          anunciarMinuto(min);
          vibrar("minuto");
        }
      }

      // Cuenta regresiva final: 10 → 1
      if (seg >= 1 && seg <= 10 && !segundosAnunciados.has(seg)) {
        segundosAnunciados.add(seg);
        anunciarCountdownFinal(seg);
        vibrar("segundo");
      }

      // Start!
      if (restante <= 0 && restante > -1000 && !startAnunciado) {
        startAnunciado = true;
        anunciarStart();
        vibrar("start");
      }

      // Pasado el start ya no hay nada que anunciar
      if (restante < -2000) clearInterval(id);
    };

    const id = setInterval(revisar, 250);
    revisar();
    return () => clearInterval(id);
  }, [startTs]);
}

/** Formatea ms como "M:SS" (o "-M:SS" si negativo) */
export function formatearTiempoTimer(ms: number): string {
  const negativo = ms < 0;
  const totalSeg = Math.floor(Math.abs(ms) / 1000);
  const m = Math.floor(totalSeg / 60);
  const s = totalSeg % 60;
  return `${negativo ? "-" : ""}${m}:${s.toString().padStart(2, "0")}`;
}
