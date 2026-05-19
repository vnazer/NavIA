// Hook que retorna el estado vivo del race timer.
// Recalcula cada 250ms sin guardar nada en store (eso vendría a costar).

import { useEffect, useRef, useState } from "react";
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

  // Rastrear segundos y minutos ya anunciados para no repetir
  const minutosAnunciados = useRef(new Set<number>());
  const segundosAnunciados = useRef(new Set<number>());
  const startAnunciado = useRef(false);

  // Resetear registros cuando cambia el startTs
  useEffect(() => {
    minutosAnunciados.current = new Set();
    segundosAnunciados.current = new Set();
    startAnunciado.current = false;
  }, [startTs]);

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
  const seg = Math.ceil(restante / 1000);

  // Anuncios por minuto (5, 4, 3, 2, 1)
  for (const min of [5, 4, 3, 2, 1]) {
    const umbralMs = min * 60 * 1000;
    if (
      restante <= umbralMs + 500 &&
      restante > umbralMs - 500 &&
      !minutosAnunciados.current.has(min)
    ) {
      minutosAnunciados.current.add(min);
      anunciarMinuto(min);
    }
  }

  // Cuenta regresiva final: 10 → 1
  if (seg >= 1 && seg <= 10 && !segundosAnunciados.current.has(seg)) {
    segundosAnunciados.current.add(seg);
    anunciarCountdownFinal(seg);
  }

  // Start!
  if (restante <= 0 && restante > -1000 && !startAnunciado.current) {
    startAnunciado.current = true;
    anunciarStart();
  }

  return {
    tiempoRestanteMs: restante,
    fase: calcularFase(restante),
    activo: true,
  };
}

/** Formatea ms como "M:SS" (o "-M:SS" si negativo) */
export function formatearTiempoTimer(ms: number): string {
  const negativo = ms < 0;
  const totalSeg = Math.floor(Math.abs(ms) / 1000);
  const m = Math.floor(totalSeg / 60);
  const s = totalSeg % 60;
  return `${negativo ? "-" : ""}${m}:${s.toString().padStart(2, "0")}`;
}
