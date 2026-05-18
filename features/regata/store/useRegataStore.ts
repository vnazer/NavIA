// Store de sesiones de regata. Persistido en AsyncStorage.
// Una sesión activa por vez. Las terminadas se acumulan en historial.

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PuntoPronostico } from "@/features/wind/types";
import type { Boya } from "@/features/boyas/types";
import type { PuntoTrack, Sesion } from "../types";

type RegataState = {
  sesionActiva: Sesion | null;
  sesionesHistoricas: Sesion[];

  iniciarSesion: (params: {
    nombre: string;
    barcoId: string;
    spotId: string;
    vientoSnapshot: PuntoPronostico | null;
    boyasSnapshot: Boya[];
  }) => void;
  agregarPunto: (punto: PuntoTrack) => void;
  /** Edita las boyas de la sesión activa (no afecta el set del spot). */
  actualizarBoyasSesion: (boyas: Boya[]) => void;
  terminarSesion: () => void;
  eliminarSesion: (id: string) => void;
  getSesion: (id: string) => Sesion | null;
};

export const useRegataStore = create<RegataState>()(
  persist(
    (set, get) => ({
      sesionActiva: null,
      sesionesHistoricas: [],

      iniciarSesion: ({
        nombre,
        barcoId,
        spotId,
        vientoSnapshot,
        boyasSnapshot,
      }) => {
        const sesion: Sesion = {
          id: `regata-${Date.now()}`,
          nombre,
          fechaInicio: Date.now(),
          fechaFin: null,
          barcoId,
          spotId,
          vientoSnapshot,
          boyasSnapshot,
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

      actualizarBoyasSesion: (boyas) => {
        const actual = get().sesionActiva;
        if (!actual) return;
        set({
          sesionActiva: { ...actual, boyasSnapshot: boyas },
        });
      },

      terminarSesion: () => {
        const actual = get().sesionActiva;
        if (!actual) return;
        const cerrada: Sesion = {
          ...actual,
          fechaFin: Date.now(),
        };
        set({
          sesionActiva: null,
          sesionesHistoricas: [cerrada, ...get().sesionesHistoricas],
        });
      },

      eliminarSesion: (id) => {
        set({
          sesionesHistoricas: get().sesionesHistoricas.filter(
            (s) => s.id !== id,
          ),
        });
      },

      getSesion: (id) => {
        const state = get();
        if (state.sesionActiva?.id === id) return state.sesionActiva;
        return state.sesionesHistoricas.find((s) => s.id === id) ?? null;
      },
    }),
    {
      name: "navia-regata",
      storage: createJSONStorage(() => AsyncStorage),
      version: 3,
      // Migrations:
      //  v1 → v2: agrega boyasSnapshot: [] si falta
      //  v2 → v3: boyasSnapshot ahora tiene shape { id, tipo, lat, lon, label?,
      //           fechaCreacion }. Las viejas { id, nombre, lat, lon } se
      //           normalizan a tipo "custom" con label = nombre.
      migrate: (persistedState: unknown, _version: number) => {
        const state = persistedState as RegataState | null;
        if (!state)
          return {
            sesionActiva: null,
            sesionesHistoricas: [],
          } as Partial<RegataState>;

        type BoyaVieja = {
          id?: string;
          nombre?: string;
          tipo?: string;
          lat: number;
          lon: number;
          label?: string;
          fechaCreacion?: number;
        };

        const normalizarBoya = (b: BoyaVieja) => ({
          id: b.id ?? `migrado_${Math.random().toString(36).slice(2, 8)}`,
          tipo: (b.tipo as "custom") ?? "custom",
          lat: b.lat,
          lon: b.lon,
          label: b.label ?? b.nombre,
          fechaCreacion: b.fechaCreacion ?? Date.now(),
        });

        const normalizarSesion = (s: Sesion | null): Sesion | null => {
          if (!s) return null;
          const snapshot = Array.isArray(s.boyasSnapshot) ? s.boyasSnapshot : [];
          return {
            ...s,
            boyasSnapshot: snapshot.map((b) =>
              normalizarBoya(b as unknown as BoyaVieja),
            ) as Sesion["boyasSnapshot"],
          };
        };

        return {
          ...state,
          sesionActiva: normalizarSesion(state.sesionActiva),
          sesionesHistoricas: (state.sesionesHistoricas ?? []).map(
            (s) => normalizarSesion(s) as Sesion,
          ),
        } as Partial<RegataState>;
      },
    },
  ),
);
