import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";

export type ContactoAyuda = {
  id: string;
  nombre: string;
  telefono: string;
};

/**
 * Posición del MOB. lat/lon null = todavía sin posición GPS.
 * confirmada=false → el mensaje SOS dice "POSICIÓN NO CONFIRMADA".
 * (Datos persistidos antiguos no traen `confirmada`: se tratan como confirmados.)
 */
export type PosicionMOB = {
  lat: number | null;
  lon: number | null;
  ts: number;
  confirmada?: boolean;
};

type SeguridadEstado = {
  contactosAyuda: ContactoAyuda[];
  mobCoordenadas: PosicionMOB | null;
  SOSActivo: boolean;
};

type SeguridadAcciones = {
  /** Activa MOB. Sin coordenadas (null) queda "no confirmada" hasta que llegue un fix. */
  activarMOB: (lat: number | null, lon: number | null, confirmada?: boolean) => void;
  /** Completa la posición de un MOB activo que aún no estaba confirmada. */
  actualizarPosicionMOB: (lat: number, lon: number) => void;
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
    (set, get) => ({
      contactosAyuda: CONTACTOS_PREDETERMINADOS,
      mobCoordenadas: null,
      SOSActivo: false,

      activarMOB: (lat, lon, confirmada = true) => {
        set({
          mobCoordenadas: {
            lat,
            lon,
            ts: Date.now(),
            confirmada: confirmada && lat != null && lon != null,
          },
        });
      },

      actualizarPosicionMOB: (lat, lon) => {
        const actual = get().mobCoordenadas;
        // Solo si el MOB sigue activo y no tenía posición confirmada
        if (!actual || actual.confirmada !== false) return;
        set({ mobCoordenadas: { ...actual, lat, lon, confirmada: true } });
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

/**
 * Sin punto GPS en vivo: intenta obtener la posición real del MOB.
 * 1) última posición conocida reciente (≤ 30 s, ≤ 50 m), 2) fix actual con
 * timeout. Si todo falla, el MOB queda como "POSICIÓN NO CONFIRMADA".
 * Nunca usa las coordenadas del spot como si fueran la posición real.
 */
export async function localizarMOB(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return false;

    const ultima = await Location.getLastKnownPositionAsync({
      maxAge: 30_000,
      requiredAccuracy: 50,
    });
    if (ultima) {
      useSeguridadStore
        .getState()
        .actualizarPosicionMOB(ultima.coords.latitude, ultima.coords.longitude);
      return true;
    }

    const actual = await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 15_000)),
    ]);
    if (actual) {
      useSeguridadStore
        .getState()
        .actualizarPosicionMOB(actual.coords.latitude, actual.coords.longitude);
      return true;
    }
  } catch {
    // sin GPS disponible: queda no confirmada
  }
  return false;
}
