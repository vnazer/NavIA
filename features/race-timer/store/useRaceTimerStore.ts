// Store del race timer (countdown hasta el start de la regata).
// El timer no se "ejecuta" — solo guarda startTs (timestamp del start) y
// duracionInicialSeg. El tiempo restante se calcula on-demand por el hook
// useRaceTimer cada 250 ms, así sobrevive a refresh y no consume cpu.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Estado = {
  /** Timestamp ms del momento del start (cuando llega a 0). null si timer no activo. */
  startTs: number | null;
  /** Duración inicial en segundos (para mostrar progreso). */
  duracionInicialSeg: number;
};

type Acciones = {
  /** Inicia un countdown de N segundos desde ahora. */
  iniciar: (segundos: number) => void;
  /** Sincroniza al minuto entero más cercano (arriba o abajo) — regla 5/4/1. */
  sincronizar: () => void;
  /** Detiene/limpia el timer. */
  detener: () => void;
};

export const useRaceTimerStore = create<Estado & Acciones>()(
  persist(
    (set, get) => ({
      startTs: null,
      duracionInicialSeg: 300,

      iniciar: (segundos) => {
        set({
          startTs: Date.now() + segundos * 1000,
          duracionInicialSeg: segundos,
        });
      },

      sincronizar: () => {
        // "Sync" en regla de regata: redondea al minuto entero más cercano
        // (típicamente al oír la señal de preparación, para alinear con la bocina).
        const startTs = get().startTs;
        if (!startTs) return;
        const ahora = Date.now();
        const restanteMs = startTs - ahora;
        if (restanteMs <= 0) return;
        // Math.round: al minuto MÁS CERCANO (4:40 → 5:00, 4:20 → 4:00).
        // Si redondea a 0 (quedan < 30 s), el start pasa a ser ahora.
        const minutosRestantes = Math.round(restanteMs / 60000);
        set({ startTs: ahora + minutosRestantes * 60000 });
      },

      detener: () => set({ startTs: null }),
    }),
    {
      name: "navia-race-timer",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
