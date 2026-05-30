import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { evaluarHeuristicaLocal, type AIResponse } from "../lib/heuristicaIaLocal";
import type { Rendimiento } from "../types";
import { decir } from "@/lib/voz/servicio";

type CopilotoEstado = {
  copilotoActivo: boolean;
  modoVoz: boolean;
  ultimoConsejo: AIResponse | null;
  ultimoMensajeVozAnunciado: string;
  ultimoTsAnuncio: number;
};

type CopilotoAcciones = {
  setCopilotoActivo: (activo: boolean) => void;
  setModoVoz: (v: boolean) => void;
  procesarTelemetria: (
    rendimiento: Rendimiento | null,
    tws: number,
    twd: number,
    olasMt?: number,
    cog?: number
  ) => void;
  forzarAnuncioVoz: () => void;
};

export const useCopilotoStore = create<CopilotoEstado & CopilotoAcciones>()(
  persist(
    (set, get) => ({
      copilotoActivo: true,
      modoVoz: true,
      ultimoConsejo: null,
      ultimoMensajeVozAnunciado: "",
      ultimoTsAnuncio: 0,

      setCopilotoActivo: (activo) => {
        set({ copilotoActivo: activo });
        if (!activo) {
          set({ ultimoConsejo: null });
        }
      },

      setModoVoz: (v) => set({ modoVoz: v }),

      procesarTelemetria: (rendimiento, tws, twd, olasMt = 0.5, cog = 0) => {
        const { copilotoActivo, modoVoz, ultimoMensajeVozAnunciado, ultimoTsAnuncio } = get();
        if (!copilotoActivo) return;

        const consejo = evaluarHeuristicaLocal(rendimiento, tws, twd, olasMt, cog);
        set({ ultimoConsejo: consejo });

        // Control de repeticiones y throttle de la voz
        if (modoVoz && consejo.mensajeVoz) {
          const ahora = Date.now();
          const esDiferente = consejo.mensajeVoz !== ultimoMensajeVozAnunciado;
          const tiempoSuficiente = ahora - ultimoTsAnuncio > 60000; // mínimo 1 minuto de diferencia

          // Las alertas urgentes saltan con un intervalo más rápido (30s)
          const esUrgente = consejo.nivelAlerta === "urgente";
          const tiempoUrgenteSuficiente = esUrgente && ahora - ultimoTsAnuncio > 30000;

          if (esDiferente || tiempoSuficiente || tiempoUrgenteSuficiente) {
            decir(consejo.mensajeVoz);
            set({
              ultimoMensajeVozAnunciado: consejo.mensajeVoz,
              ultimoTsAnuncio: ahora,
            });
          }
        }
      },

      forzarAnuncioVoz: () => {
        const { ultimoConsejo } = get();
        if (ultimoConsejo && ultimoConsejo.mensajeVoz) {
          decir(ultimoConsejo.mensajeVoz);
          set({ ultimoTsAnuncio: Date.now() });
        }
      },
    }),
    {
      name: "navia-copiloto",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
