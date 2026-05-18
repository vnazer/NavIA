// Hook que retorna el estado vivo del race timer.
// Recalcula cada 250ms sin guardar nada en store (eso vendría a costar).

import { useEffect, useState } from "react";
import { useRaceTimerStore } from "../store/useRaceTimerStore";

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

/** Formatea ms como "M:SS" (o "-M:SS" si negativo) */
export function formatearTiempoTimer(ms: number): string {
  const negativo = ms < 0;
  const totalSeg = Math.floor(Math.abs(ms) / 1000);
  const m = Math.floor(totalSeg / 60);
  const s = totalSeg % 60;
  return `${negativo ? "-" : ""}${m}:${s.toString().padStart(2, "0")}`;
}
