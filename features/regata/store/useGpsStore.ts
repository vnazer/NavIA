// Store global del estado GPS. NO se persiste — es estado de runtime.
// El hook useTrackingGPS escribe acá cuando hay una subscription activa.
// Otros componentes (paneles tácticos) leen de acá sin abrir su propia
// subscription al GPS (evita conflictos de permisos / battery drain).

import { create } from "zustand";
import type { PuntoTrack } from "../types";

type EstadoPermiso = "pendiente" | "concedido" | "denegado";

type Estado = {
  ultimoPunto: PuntoTrack | null;
  permiso: EstadoPermiso;
  error: string | null;
  /** Cuántos consumidores tienen tracking activo (refcount). */
  refCount: number;
};

type Acciones = {
  setUltimoPunto: (p: PuntoTrack | null) => void;
  setPermiso: (p: EstadoPermiso) => void;
  setError: (e: string | null) => void;
  incrementarRef: () => void;
  decrementarRef: () => void;
};

export const useGpsStore = create<Estado & Acciones>((set) => ({
  ultimoPunto: null,
  permiso: "pendiente",
  error: null,
  refCount: 0,

  setUltimoPunto: (p) => set({ ultimoPunto: p }),
  setPermiso: (p) => set({ permiso: p }),
  setError: (e) => set({ error: e }),
  incrementarRef: () => set((s) => ({ refCount: s.refCount + 1 })),
  decrementarRef: () =>
    set((s) => ({ refCount: Math.max(0, s.refCount - 1) })),
}));
