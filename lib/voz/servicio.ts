// Servicio de voz para anuncios tácticos durante la regata.
// Web usa Web Speech API; nativo usa expo-speech (lazy require).

import { Platform } from "react-native";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ConfigVoz = {
  activo: boolean;
  setActivo: (v: boolean) => void;
};

export const useVozStore = create<ConfigVoz>()(
  persist(
    (set) => ({
      activo: true,
      setActivo: (v) => set({ activo: v }),
    }),
    {
      name: "navia-voz",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

function vozActiva(): boolean {
  return useVozStore.getState().activo;
}

function decirNativo(texto: string): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Speech = require("expo-speech") as typeof import("expo-speech");
    const speak = Speech.speak ?? (Speech as unknown as { default: typeof Speech }).default?.speak;
    const stop = Speech.stop ?? (Speech as unknown as { default: typeof Speech }).default?.stop;
    stop?.();
    speak?.(texto, { language: "es-419", rate: 1.1 });
  } catch {
    // expo-speech unavailable (e.g., web fallback path)
  }
}

function decirWeb(texto: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = "es-419";
  u.rate = 1.1;
  window.speechSynthesis.speak(u);
}

export function decir(texto: string): void {
  if (!vozActiva()) return;
  if (Platform.OS === "web") {
    decirWeb(texto);
  } else {
    decirNativo(texto);
  }
}

// Anuncios específicos de regata ------------------------------------------------

export function anunciarMinuto(minutosRestantes: number): void {
  if (minutosRestantes === 5) decir("Señal de atención. 5 minutos.");
  else if (minutosRestantes === 4) decir("4 minutos.");
  else if (minutosRestantes === 3) decir("3 minutos.");
  else if (minutosRestantes === 2) decir("2 minutos.");
  else if (minutosRestantes === 1) decir("1 minuto.");
}

export function anunciarCountdownFinal(segundos: number): void {
  if (segundos >= 1 && segundos <= 10) {
    decir(String(segundos));
  }
}

export function anunciarStart(): void {
  decir("Start!");
}

export function anunciarLift(ladoFavorecido: "estribor" | "babor"): void {
  decir(
    `Lift de ${ladoFavorecido === "estribor" ? "estribor" : "babor"}. Seguir este bordo.`,
  );
}

export function anunciarEnLayline(lado: "estribor" | "babor"): void {
  decir(
    `En layline de ${lado === "estribor" ? "estribor" : "babor"}. Listo para virar.`,
  );
}

export function anunciarShift(tendencia: "veer" | "back", grados: number): void {
  decir(`${tendencia} de ${Math.abs(Math.round(grados))} grados.`);
}
