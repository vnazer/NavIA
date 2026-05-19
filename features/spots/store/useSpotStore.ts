// Store de spots con persistencia en AsyncStorage.
// MODIFICADO EN PROMPT 3.6: agrega sistema de "overrides" de coordenadas.
// EXTENSIÓN: ahora también guarda spots custom creados por el usuario.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SPOTS, SPOT_POR_DEFECTO_ID } from "../data/spots";
import type { Spot, CoordenadaOverride } from "../types";

type SpotStore = {
  spotIdSeleccionado: string;
  overrides: Record<string, CoordenadaOverride>;
  customSpots: Spot[];

  seleccionarSpot: (id: string) => void;

  /** Aplicar nueva coordenada al spot (lo guarda como override). */
  setOverride: (id: string, lat: number, lon: number) => void;

  /** Volver a la coordenada default del spot (elimina el override). */
  resetOverride: (id: string) => void;

  /** ¿Este spot tiene una coordenada personalizada? */
  tieneOverride: (id: string) => boolean;

  /** Agrega un spot custom (genera id único basado en timestamp). */
  agregarSpotCustom: (data: {
    nombre: string;
    lat: number;
    lon: number;
    club?: string;
    descripcion?: string;
  }) => Spot;

  /** Elimina un spot custom por id. Si era el seleccionado, vuelve al default. */
  eliminarSpotCustom: (id: string) => void;

  /** Devuelve el spot actual con override aplicado si existe. */
  getSpotActual: () => Spot;

  /** Devuelve TODOS los spots (built-in + custom), con overrides aplicados. */
  getTodosLosSpots: () => Spot[];
};

export const useSpotStore = create<SpotStore>()(
  persist(
    (set, get) => ({
      spotIdSeleccionado: SPOT_POR_DEFECTO_ID,
      overrides: {},
      customSpots: [],

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

      agregarSpotCustom: ({ nombre, lat, lon, club, descripcion }) => {
        const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const nuevo: Spot = {
          id,
          nombre,
          lat,
          lon,
          club,
          descripcion,
          custom: true,
        };
        set((state) => ({ customSpots: [...state.customSpots, nuevo] }));
        return nuevo;
      },

      eliminarSpotCustom: (id) =>
        set((state) => {
          const customSpots = state.customSpots.filter((s) => s.id !== id);
          const overrides = { ...state.overrides };
          delete overrides[id];
          const spotIdSeleccionado =
            state.spotIdSeleccionado === id
              ? SPOT_POR_DEFECTO_ID
              : state.spotIdSeleccionado;
          return { customSpots, overrides, spotIdSeleccionado };
        }),

      getSpotActual: () => {
        const state = get();
        const todos = [...SPOTS, ...state.customSpots];
        const base =
          todos.find((s) => s.id === state.spotIdSeleccionado) ?? SPOTS[0];
        const override = state.overrides[base.id];
        return override ? { ...base, ...override } : base;
      },

      getTodosLosSpots: () => {
        const { overrides, customSpots } = get();
        const aplicarOverride = (s: Spot): Spot => {
          const o = overrides[s.id];
          return o ? { ...s, ...o } : s;
        };
        return [...SPOTS.map(aplicarOverride), ...customSpots.map(aplicarOverride)];
      },
    }),
    {
      name: "navia-spots",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
