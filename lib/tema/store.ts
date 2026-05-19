// Store de tema (claro / oscuro) con persistencia.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type TemaStore = {
  oscuro: boolean;
  toggleOscuro: () => void;
  setOscuro: (v: boolean) => void;
};

export const useTemaStore = create<TemaStore>()(
  persist(
    (set) => ({
      oscuro: false,
      toggleOscuro: () => set((s) => ({ oscuro: !s.oscuro })),
      setOscuro: (v) => set({ oscuro: v }),
    }),
    {
      name: "navia-tema",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
