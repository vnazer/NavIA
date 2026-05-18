// Store de estado táctico durante una regata.
// Maneja dos modos exclusivos:
//   - waypoint: navegando a una boya específica
//   - prestart: línea de salida con committee + pin definidos

import { create } from "zustand";

type ModoTactico = "off" | "waypoint" | "prestart";

type Estado = {
  modoActivo: ModoTactico;
  boyaWaypointId: string | null;
  boyaCommitteeId: string | null;
  boyaPinId: string | null;
  /** Si no es null, sobreescribe el viento del pronóstico para los cálculos. */
  vientoOverrideGrados: number | null;
};

type Acciones = {
  activarWaypoint: (boyaId: string) => void;
  desactivarWaypoint: () => void;
  setLineaSalida: (committeeId: string, pinId: string) => void;
  limpiarLineaSalida: () => void;
  setVientoOverride: (grados: number | null) => void;
};

export const useTacticaStore = create<Estado & Acciones>((set) => ({
  modoActivo: "off",
  boyaWaypointId: null,
  boyaCommitteeId: null,
  boyaPinId: null,
  vientoOverrideGrados: null,

  activarWaypoint: (boyaId) =>
    set({ modoActivo: "waypoint", boyaWaypointId: boyaId }),

  desactivarWaypoint: () =>
    set({ modoActivo: "off", boyaWaypointId: null }),

  setLineaSalida: (committeeId, pinId) =>
    set({
      modoActivo: "prestart",
      boyaCommitteeId: committeeId,
      boyaPinId: pinId,
    }),

  limpiarLineaSalida: () =>
    set({
      modoActivo: "off",
      boyaCommitteeId: null,
      boyaPinId: null,
    }),

  setVientoOverride: (grados) => set({ vientoOverrideGrados: grados }),
}));
