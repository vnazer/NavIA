// Store de sesiones de regata. Persistido en AsyncStorage con escritura
// diferida (ver lib/persistenciaDiferida): con 1 punto GPS/s no queremos
// serializar todo el historial en cada punto.
// Una sesión activa por vez. Las terminadas se acumulan en historial.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PuntoPronostico } from "@/features/wind/types";
import type { Boya } from "@/features/boyas/types";
import { useBoyasStore } from "@/features/boyas/store/useBoyasStore";
import {
  crearPersistenciaDiferida,
  flushPersistenciaDiferida,
} from "@/lib/persistenciaDiferida";
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
        void flushPersistenciaDiferida();
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
        // Guardar ya: no esperar al timer de escritura diferida
        void flushPersistenciaDiferida();
      },

      eliminarSesion: (id) => {
        set({
          sesionesHistoricas: get().sesionesHistoricas.filter(
            (s) => s.id !== id,
          ),
        });
        void flushPersistenciaDiferida();
      },

      getSesion: (id) => {
        const state = get();
        if (state.sesionActiva?.id === id) return state.sesionActiva;
        return state.sesionesHistoricas.find((s) => s.id === id) ?? null;
      },
    }),
    {
      name: "navia-regata",
      // Escribe como máximo cada 12 s (+ flush en background / fin de sesión)
      storage: crearPersistenciaDiferida<Partial<RegataState>>(12_000),
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

// Las pantallas /boyas, /mapa y /tactica editan el store global de boyas.
// Si hay sesión activa, replicamos esos cambios en su snapshot para que
// /regata (que muestra sesion.boyasSnapshot) y la bitácora queden al día.
useBoyasStore.subscribe((estado, previo) => {
  if (estado.boyas === previo.boyas) return;
  if (!useRegataStore.getState().sesionActiva) return;
  useRegataStore.getState().actualizarBoyasSesion(estado.boyas);
});
