// Store de spots con persistencia en AsyncStorage.
// MODIFICADO EN PROMPT 3.6: agrega sistema de "overrides" de coordenadas.
// El usuario puede corregir la ubicación de cualquier spot arrastrando el
// marcador en modo edición; la corrección persiste entre sesiones.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SPOTS, SPOT_POR_DEFECTO_ID } from "../data/spots";
import type { Spot, CoordenadaOverride } from "../types";

type SpotStore = {
  spotIdSeleccionado: string;
  overrides: Record<string, CoordenadaOverride>;

  seleccionarSpot: (id: string) => void;

  /** Aplicar nueva coordenada al spot (lo guarda como override). */
  setOverride: (id: string, lat: number, lon: number) => void;

  /** Volver a la coordenada default del spot (elimina el override). */
  resetOverride: (id: string) => void;

  /** ¿Este spot tiene una coordenada personalizada? */
  tieneOverride: (id: string) => boolean;

  /** Devuelve el spot actual con override aplicado si existe. */
  getSpotActual: () => Spot;

  /** Devuelve TODOS los spots, con overrides aplicados a los que correspondan. */
  getTodosLosSpots: () => Spot[];
};

export const useSpotStore = create<SpotStore>()(
  persist(
    (set, get) => ({
      spotIdSeleccionado: SPOT_POR_DEFECTO_ID,
      overrides: {},

      seleccionarSpot: (id) => set({ spotIdSeleccionado: id }),

      setOverride: (id, lat, lon) =>
        set((state) => ({
          overrides: { ...state.overrides, [id]: { lat, lon } },
        })),

      resetOverride: (id) =>
        set((state) => {
          const nuevos = { ...state.overrides };
          delete nuevos[id];
          return { overrides: nuevos };
        }),

      tieneOverride: (id) => Boolean(get().overrides[id]),

      getSpotActual: () => {
        const state = get();
        const base =
          SPOTS.find((s) => s.id === state.spotIdSeleccionado) ?? SPOTS[0];
        const override = state.overrides[base.id];
        return override ? { ...base, ...override } : base;
      },

      getTodosLosSpots: () => {
        const overrides = get().overrides;
        return SPOTS.map((s) => {
          const override = overrides[s.id];
          return override ? { ...s, ...override } : s;
        });
      },
    }),
    {
      name: "navia-spots",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
