// Store de sesiones de regata. Persistido en AsyncStorage.
// Una sesión activa por vez. Las terminadas se acumulan en historial.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PuntoGPS, SesionRegata } from "../types";

type RegataState = {
  sesionActiva: SesionRegata | null;
  historial: SesionRegata[];

  iniciarSesion: (params: {
    nombre: string;
    barcoId: string;
    spotId: string;
  }) => void;
  agregarPunto: (punto: PuntoGPS) => void;
  terminarSesion: () => void;
  borrarSesion: (id: string) => void;
};

export const useRegataStore = create<RegataState>()(
  persist(
    (set, get) => ({
      sesionActiva: null,
      historial: [],

      iniciarSesion: ({ nombre, barcoId, spotId }) => {
        const sesion: SesionRegata = {
          id: `regata-${Date.now()}`,
          nombre,
          iniciadaEn: Date.now(),
          terminadaEn: null,
          barcoId,
          spotId,
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
        const cerrada: SesionRegata = {
          ...actual,
          terminadaEn: Date.now(),
        };
        set({
          sesionActiva: null,
          historial: [cerrada, ...get().historial],
        });
      },

      borrarSesion: (id) => {
        set({ historial: get().historial.filter((s) => s.id !== id) });
      },
    }),
    {
      name: "navia-regata",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
