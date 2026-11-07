import { create } from "zustand";
import { persist } from "zustand/middleware";
import { evaluarHeuristicaLocal, type AIResponse } from "../lib/heuristicaIaLocal";
import type { Rendimiento } from "../types";
import { decir, vozOcupadaConPrioridad } from "@/lib/voz/servicio";
import { crearPersistenciaDiferida } from "@/lib/persistenciaDiferida";

type CopilotoEstado = {
  copilotoActivo: boolean;
  modoVoz: boolean;
  ultimoConsejo: AIResponse | null;
  ultimoMensajeVozAnunciado: string;
  ultimoTsAnuncio: number;
};

/** Datos que entrega la pantalla en foco (regata o táctica) cada punto GPS. */
export type TelemetriaCopiloto = {
  rendimiento: Rendimiento | null;
  tws: number;
  twd: number;
  /** Ola del pronóstico real (m). null/undefined = sin dato → no se aplica la regla de olas. */
  olasMt?: number | null;
  /** COG en grados; null si el GPS no entrega rumbo válido. */
  cog: number | null;
  /** true si el barco seleccionado es un ILCA (consejos de trimado de ILCA). */
  esIlca: boolean;
};

type CopilotoAcciones = {
  setCopilotoActivo: (activo: boolean) => void;
  setModoVoz: (v: boolean) => void;
  procesarTelemetria: (t: TelemetriaCopiloto) => void;
  forzarAnuncioVoz: () => void;
};

type Preferencias = Pick<CopilotoEstado, "copilotoActivo" | "modoVoz">;

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

      procesarTelemetria: ({ rendimiento, tws, twd, olasMt = null, cog, esIlca }) => {
        const { copilotoActivo, modoVoz, ultimoMensajeVozAnunciado, ultimoTsAnuncio } = get();
        if (!copilotoActivo) return;

        const consejo = evaluarHeuristicaLocal(rendimiento, tws, twd, olasMt, cog, esIlca);
        set({ ultimoConsejo: consejo });

        // Control de repeticiones y throttle de la voz
        if (modoVoz && consejo.mensajeVoz) {
          // Los anuncios del cronómetro tienen prioridad: no los cortamos ni
          // los tapamos. El consejo se reintenta en el próximo punto GPS.
          if (vozOcupadaConPrioridad()) return;

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
      // Solo persistimos preferencias; el último consejo es estado de runtime
      // (antes se escribía en AsyncStorage con cada punto GPS).
      storage: crearPersistenciaDiferida<Preferencias>(2_000),
      partialize: (s): Preferencias => ({
        copilotoActivo: s.copilotoActivo,
        modoVoz: s.modoVoz,
      }),
    },
  ),
);
