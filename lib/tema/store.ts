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
      // Clave propia: lib/tema.ts (modo deck/light) usa "navia-tema" y ambos
      // stores se pisaban al persistir en la misma clave.
      name: "navia-tema-oscuro",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
