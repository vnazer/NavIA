// Store de sesiones de regata. Persistido en AsyncStorage.
// Una sesión activa por vez. Las terminadas se acumulan en historial.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PuntoPronostico } from "@/features/wind/types";
import type { PuntoTrack, Sesion } from "../types";

type RegataState = {
  sesionActiva: Sesion | null;
  sesionesHistoricas: Sesion[];

  iniciarSesion: (params: {
    nombre: string;
    barcoId: string;
    spotId: string;
    vientoSnapshot: PuntoPronostico | null;
  }) => void;
  agregarPunto: (punto: PuntoTrack) => void;
  terminarSesion: () => void;
  eliminarSesion: (id: string) => void;
  getSesion: (id: string) => Sesion | null;
};

export const useRegataStore = create<RegataState>()(
  persist(
    (set, get) => ({
      sesionActiva: null,
      sesionesHistoricas: [],

      iniciarSesion: ({ nombre, barcoId, spotId, vientoSnapshot }) => {
        const sesion: Sesion = {
          id: `regata-${Date.now()}`,
          nombre,
          fechaInicio: Date.now(),
          fechaFin: null,
          barcoId,
          spotId,
          vientoSnapshot,
          puntos: [],
        };
        set({ sesionActiva: sesion });
      },

      agregarPunto: (punto) => {
        const actual = get().sesionActiva;
        if (!actual) return;
        set({
          sesionActiva: {
            ...actual,
            puntos: [...actual.puntos, punto],
          },
        });
      },

      terminarSesion: () => {
        const actual = get().sesionActiva;
        if (!actual) return;
        const cerrada: Sesion = {
          ...actual,
          fechaFin: Date.now(),
        };
        set({
          sesionActiva: null,
          sesionesHistoricas: [cerrada, ...get().sesionesHistoricas],
        });
      },

      eliminarSesion: (id) => {
        set({
          sesionesHistoricas: get().sesionesHistoricas.filter(
            (s) => s.id !== id,
          ),
        });
      },

      getSesion: (id) => {
        const state = get();
        if (state.sesionActiva?.id === id) return state.sesionActiva;
        return state.sesionesHistoricas.find((s) => s.id === id) ?? null;
      },
    }),
    {
      name: "navia-regata",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
