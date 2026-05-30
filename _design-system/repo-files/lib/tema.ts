// lib/tema.ts
//
// Store de tema (modo deck vs light) persistido con AsyncStorage.
// Usá `useTema(s => s.modo)` en cualquier componente para reaccionar a cambios.
//
// Helper expuesto: useColores() — devuelve la paleta hex del modo activo,
// útil para SVG, iconos lucide-react-native, y style inline.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Modo,
  Colores,
  paletaDe,
  COLORES_DECK,
  COLORES_LIGHT,
} from "@/features/ui/colores";

type EstadoTema = {
  modo: Modo;
  alternar: () => void;
  setModo: (m: Modo) => void;
};

export const useTema = create<EstadoTema>()(
  persist(
    (set) => ({
      modo: "deck", // por defecto: arrancamos en cubierta (es donde se usa)
      alternar: () =>
        set((s) => ({ modo: s.modo === "deck" ? "light" : "deck" })),
      setModo: (m) => set({ modo: m }),
    }),
    {
      name: "navia-tema",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

/** Devuelve la paleta hex correspondiente al modo activo (reactivo). */
export function useColores(): Colores {
  const modo = useTema((s) => s.modo);
  return paletaDe(modo);
}

/** True si estamos en modo cubierta (alto contraste). */
export function useEsDeck(): boolean {
  return useTema((s) => s.modo === "deck");
}

/**
 * Helper para concatenar clases Tailwind condicionales por modo.
 *   className={tw(esDeck, "bg-white", "bg-deck-surface")}
 */
export function tw(deck: boolean, light: string, dark: string): string {
  return deck ? dark : light;
}

// Re-export para conveniencia
export { COLORES_DECK, COLORES_LIGHT };
export type { Modo, Colores };
