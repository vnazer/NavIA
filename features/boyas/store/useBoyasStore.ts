// Store de boyas persistidas por spot. Lo que está acá es el "set predeterminado"
// del spot. Al iniciar una regata, este set se copia al boyasSnapshot de la
// sesión y se puede editar sin afectar el set del spot.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Boya } from "../types";

type BoyasState = {
  /** Map de spotId → array de boyas. */
  boyasPorSpot: Record<string, Boya[]>;

  getBoyasDeSpot: (spotId: string) => Boya[];
  setBoyasDeSpot: (spotId: string, boyas: Boya[]) => void;
  agregarBoya: (spotId: string, boya: Boya) => void;
  eliminarBoya: (spotId: string, boyaId: string) => void;
  limpiarSpot: (spotId: string) => void;
};

export const useBoyasStore = create<BoyasState>()(
  persist(
    (set, get) => ({
      boyasPorSpot: {},

      getBoyasDeSpot: (spotId) => get().boyasPorSpot[spotId] ?? [],

      setBoyasDeSpot: (spotId, boyas) => {
        set({
          boyasPorSpot: {
            ...get().boyasPorSpot,
            [spotId]: boyas,
          },
        });
      },

      agregarBoya: (spotId, boya) => {
        const actuales = get().boyasPorSpot[spotId] ?? [];
        set({
          boyasPorSpot: {
            ...get().boyasPorSpot,
            [spotId]: [...actuales, boya],
          },
        });
      },

      eliminarBoya: (spotId, boyaId) => {
        const actuales = get().boyasPorSpot[spotId] ?? [];
        set({
          boyasPorSpot: {
            ...get().boyasPorSpot,
            [spotId]: actuales.filter((b) => b.id !== boyaId),
          },
        });
      },

      limpiarSpot: (spotId) => {
        const copia = { ...get().boyasPorSpot };
        delete copia[spotId];
        set({ boyasPorSpot: copia });
      },
    }),
    {
      name: "navia-boyas",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
