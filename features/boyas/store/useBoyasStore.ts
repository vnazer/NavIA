// Store global de boyas race-day. Persistido en AsyncStorage.
// Las boyas son ephemeral: típicamente se cargan al inicio de una regata y
// se limpian al final con limpiarTodas(). No están asociadas a un spot.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Boya, TipoBoya } from "../types";

type Estado = {
  boyas: Boya[];
};

type Acciones = {
  agregarBoya: (
    tipo: TipoBoya,
    lat: number,
    lon: number,
    label?: string,
  ) => string;
  /** Inserta varias de una sola pasada (usado por el parser de coords pegadas). */
  agregarMultiples: (entradas: Array<Omit<Boya, "id" | "fechaCreacion">>) => void;
  actualizarBoya: (id: string, cambios: Partial<Omit<Boya, "id">>) => void;
  moverBoya: (id: string, lat: number, lon: number) => void;
  eliminarBoya: (id: string) => void;
  limpiarTodas: () => void;
};

function generarId(): string {
  return `boya_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useBoyasStore = create<Estado & Acciones>()(
  persist(
    (set) => ({
      boyas: [],

      agregarBoya: (tipo, lat, lon, label) => {
        const id = generarId();
        const nueva: Boya = {
          id,
          tipo,
          lat,
          lon,
          label,
          fechaCreacion: Date.now(),
        };
        set((s) => ({ boyas: [...s.boyas, nueva] }));
        return id;
      },

      agregarMultiples: (entradas) => {
        const nuevas: Boya[] = entradas.map((e, i) => ({
          id: `boya_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
          fechaCreacion: Date.now(),
          ...e,
        }));
        set((s) => ({ boyas: [...s.boyas, ...nuevas] }));
      },

      actualizarBoya: (id, cambios) =>
        set((s) => ({
          boyas: s.boyas.map((b) => (b.id === id ? { ...b, ...cambios } : b)),
        })),

      moverBoya: (id, lat, lon) =>
        set((s) => ({
          boyas: s.boyas.map((b) => (b.id === id ? { ...b, lat, lon } : b)),
        })),

      eliminarBoya: (id) =>
        set((s) => ({ boyas: s.boyas.filter((b) => b.id !== id) })),

      limpiarTodas: () => set({ boyas: [] }),
    }),
    {
      name: "navia-boyas",
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      // v1 (anterior): { boyasPorSpot: Record<string, { id, nombre, lat, lon }[]> }
      // v2 (nueva):    { boyas: Boya[] global con tipo + label }
      // Aplanamos boyas viejas como tipo "custom" con label = nombre.
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2 && persistedState && typeof persistedState === "object") {
          const old = persistedState as {
            boyasPorSpot?: Record<
              string,
              Array<{ id: string; nombre: string; lat: number; lon: number }>
            >;
          };
          const aplanadas: Boya[] = [];
          for (const spotId in old.boyasPorSpot ?? {}) {
            const list = old.boyasPorSpot?.[spotId];
            if (list) {
              for (const b of list) {
                aplanadas.push({
                  id: b.id,
                  tipo: "custom",
                  lat: b.lat,
                  lon: b.lon,
                  label: b.nombre,
                  fechaCreacion: Date.now(),
                });
              }
            }
          }
          return { boyas: aplanadas } as Partial<Estado & Acciones>;
        }
        return persistedState as Partial<Estado & Acciones>;
      },
    },
  ),
);
