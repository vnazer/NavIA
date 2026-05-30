import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ContactoAyuda = {
  id: string;
  nombre: string;
  telefono: string;
};

type SeguridadEstado = {
  contactosAyuda: ContactoAyuda[];
  mobCoordenadas: { lat: number; lon: number; ts: number } | null;
  SOSActivo: boolean;
};

type SeguridadAcciones = {
  activarMOB: (lat: number, lon: number) => void;
  desactivarMOB: () => void;
  agregarContacto: (nombre: string, telefono: string) => void;
  eliminarContacto: (id: string) => void;
  setSOSActivo: (activo: boolean) => void;
};

const CONTACTOS_PREDETERMINADOS: ContactoAyuda[] = [
  { id: "137", nombre: "Emergencias Marítimas Directo", telefono: "137" },
  { id: "cap-algarrobo", nombre: "Capitanía Puerto Algarrobo", telefono: "+56352481264" },
  { id: "cap-valpo", nombre: "Capitanía Puerto Valparaíso", telefono: "+56322208600" },
  { id: "cap-quintero", nombre: "Capitanía Puerto Quintero", telefono: "+56322930057" },
];

export const useSeguridadStore = create<SeguridadEstado & SeguridadAcciones>()(
  persist(
    (set) => ({
      contactosAyuda: CONTACTOS_PREDETERMINADOS,
      mobCoordenadas: null,
      SOSActivo: false,

      activarMOB: (lat, lon) => {
        set({
          mobCoordenadas: {
            lat,
            lon,
            ts: Date.now(),
          },
        });
      },

      desactivarMOB: () => {
        set({ mobCoordenadas: null, SOSActivo: false });
      },

      agregarContacto: (nombre, telefono) => {
        set((state) => ({
          contactosAyuda: [
            ...state.contactosAyuda,
            {
              id: Math.random().toString(36).substring(2, 9),
              nombre,
              telefono,
            },
          ],
        }));
      },

      eliminarContacto: (id) => {
        set((state) => ({
          contactosAyuda: state.contactosAyuda.filter((c) => c.id !== id),
        }));
      },

      setSOSActivo: (activo) => set({ SOSActivo: activo }),
    }),
    {
      name: "navia-seguridad",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
