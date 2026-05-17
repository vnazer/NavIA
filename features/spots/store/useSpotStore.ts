// Store global del spot actualmente seleccionado.
// Persiste en AsyncStorage para sobrevivir al cierre de la app.
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SPOTS,
  SPOT_POR_DEFECTO_ID,
  obtenerSpotPorId,
} from "../data/spots";
import type { Spot } from "../types";

type SpotState = {
  spotIdSeleccionado: string;
  setSpotId: (id: string) => void;
  getSpotActual: () => Spot;
};

export const useSpotStore = create<SpotState>()(
  persist(
    (set, get) => ({
      spotIdSeleccionado: SPOT_POR_DEFECTO_ID,
      setSpotId: (id) => set({ spotIdSeleccionado: id }),
      getSpotActual: () => {
        const id = get().spotIdSeleccionado;
        return obtenerSpotPorId(id) ?? SPOTS[0];
      },
    }),
    {
      name: "navia-spot-seleccionado",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
