// Store del barco seleccionado, persistente en AsyncStorage.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BARCOS, BARCO_DEFAULT_ID } from "../data/barcos";
import type { Barco } from "../types";

type BarcoStore = {
  barcoId: string;
  seleccionarBarco: (id: string) => void;
  getBarcoActual: () => Barco;
};

export const useBarcoStore = create<BarcoStore>()(
  persist(
    (set, get) => ({
      barcoId: BARCO_DEFAULT_ID,
      seleccionarBarco: (id) => set({ barcoId: id }),
      getBarcoActual: () => {
        const id = get().barcoId;
        return BARCOS.find((b) => b.id === id) ?? BARCOS[0];
      },
    }),
    {
      name: "navia-barco",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
