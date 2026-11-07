// Storage para zustand/persist con escritura diferida.
// Problema: persist escribe TODO el estado en AsyncStorage en cada set(). Con
// un punto GPS por segundo eso es serializar sesionActiva + historial completo
// cada ~1 s (CPU, batería y desgaste de flash).
// Solución: guardamos en memoria el último valor y lo escribimos como máximo
// cada `esperaMs`. Se hace flush inmediato al pasar la app a background
// (AppState) y cuando el store lo pide (p. ej. al finalizar una sesión).

import { AppState } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PersistStorage, StorageValue } from "zustand/middleware";

type Pendiente = {
  valor: StorageValue<unknown>;
  timer: ReturnType<typeof setTimeout> | null;
};

const pendientes = new Map<string, Pendiente>();

async function escribir(nombre: string): Promise<void> {
  const p = pendientes.get(nombre);
  if (!p) return;
  if (p.timer) clearTimeout(p.timer);
  pendientes.delete(nombre);
  try {
    // La serialización ocurre recién acá, no en cada set()
    await AsyncStorage.setItem(nombre, JSON.stringify(p.valor));
  } catch {
    // Si falla la escritura no rompemos la app; el próximo set reintenta
  }
}

/** Escribe de inmediato todo lo pendiente (background, fin de sesión). */
export async function flushPersistenciaDiferida(): Promise<void> {
  await Promise.all([...pendientes.keys()].map((n) => escribir(n)));
}

/**
 * Crea un PersistStorage para zustand que escribe como máximo cada `esperaMs`.
 * No reinicia el timer en cada set (si no, con 1 punto/s nunca escribiría):
 * el primer set programa la escritura y los siguientes solo actualizan el valor.
 */
export function crearPersistenciaDiferida<S>(esperaMs: number): PersistStorage<S> {
  return {
    getItem: async (nombre) => {
      const p = pendientes.get(nombre);
      if (p) return p.valor as StorageValue<S>;
      const raw = await AsyncStorage.getItem(nombre);
      return raw ? (JSON.parse(raw) as StorageValue<S>) : null;
    },
    setItem: (nombre, valor) => {
      const p = pendientes.get(nombre);
      if (p) {
        p.valor = valor as StorageValue<unknown>;
        return;
      }
      const timer = setTimeout(() => void escribir(nombre), esperaMs);
      pendientes.set(nombre, { valor: valor as StorageValue<unknown>, timer });
    },
    removeItem: async (nombre) => {
      const p = pendientes.get(nombre);
      if (p?.timer) clearTimeout(p.timer);
      pendientes.delete(nombre);
      await AsyncStorage.removeItem(nombre);
    },
  };
}

// Flush al salir a background/inactive: iOS puede suspender o matar la app
// sin avisar, así que no esperamos al timer.
AppState.addEventListener("change", (estado) => {
  if (estado !== "active") void flushPersistenciaDiferida();
});
