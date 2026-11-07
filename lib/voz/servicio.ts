// Servicio de voz para anuncios tácticos durante la regata.
// Web usa Web Speech API; nativo usa expo-speech (lazy require).

import { Platform } from "react-native";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from "expo-av";

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

let webDesbloqueada = false;

/**
 * Desbloquea el motor de voz en navegadores que requieren user gesture
 * (Safari, Chrome móvil). Debe llamarse desde un onPress/onClick directo.
 * Hace un utterance silencioso de 1 caracter; después de esto, subsiguientes
 * calls funcionan sin gesto del usuario.
 */
export function desbloquearVoz(): void {
  if (Platform.OS !== "web") return;
  if (webDesbloqueada) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    u.rate = 10;
    window.speechSynthesis.speak(u);
    webDesbloqueada = true;
  } catch {
    // ignore
  }
}

// Prioridad de anuncios ------------------------------------------------------
// Los anuncios del cronómetro (y MOB) son prioritarios: cortan lo que esté
// sonando. Los consejos del copiloto NO cortan un anuncio prioritario en curso.
let prioridadHasta = 0;
let idPrioridad = 0;

/** Marca un anuncio prioritario y devuelve el callback que lo libera. */
function marcarPrioridad(texto: string): () => void {
  // Respaldo por si no llega onDone: ~90 ms por carácter + 1.5 s
  prioridadHasta = Date.now() + 1500 + texto.length * 90;
  const id = ++idPrioridad;
  // Solo libera si sigue siendo el anuncio vigente (el stop() del anterior
  // dispara su onStopped después de marcar el nuevo).
  return () => {
    if (id === idPrioridad) prioridadHasta = 0;
  };
}

/** true mientras suena (o debería sonar) un anuncio prioritario. */
export function vozOcupadaConPrioridad(): boolean {
  return Date.now() < prioridadHasta;
}

// Nativo (expo-speech) -------------------------------------------------------

type ModuloSpeech = typeof import("expo-speech");

function moduloSpeech(): ModuloSpeech | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Speech = require("expo-speech") as ModuloSpeech;
    // Interop: según el bundler el módulo puede venir en .default
    const conDefault = Speech as unknown as { speak?: unknown; default?: ModuloSpeech };
    return conDefault.speak ? Speech : (conDefault.default ?? null);
  } catch {
    return null; // expo-speech unavailable (e.g., web fallback path)
  }
}

// iOS no siempre trae "es-419": por defecto es-MX y, si hay voces instaladas,
// elegimos la mejor voz española disponible (preferimos es-CL / es-MX).
let idiomaNativo = "es-MX";
let vozNativa: string | undefined;
let vocesBuscadas = false;

function elegirVozNativa(Speech: ModuloSpeech): void {
  if (vocesBuscadas) return;
  vocesBuscadas = true;
  Speech.getAvailableVoicesAsync()
    .then((voces) => {
      const es = voces.filter((v) => v.language?.toLowerCase().startsWith("es"));
      if (es.length === 0) return;
      const preferencia = ["es-cl", "es-mx", "es-us", "es-419", "es-es"];
      const puntaje = (lang: string) => {
        const i = preferencia.indexOf(lang.toLowerCase());
        return i === -1 ? preferencia.length : i;
      };
      es.sort(
        (a, b) =>
          puntaje(a.language) - puntaje(b.language) ||
          (b.quality === "Enhanced" ? 1 : 0) - (a.quality === "Enhanced" ? 1 : 0),
      );
      idiomaNativo = es[0].language;
      vozNativa = es[0].identifier;
    })
    .catch(() => {
      // sin lista de voces: seguimos con es-MX
    });
}

function decirNativo(texto: string, prioridad: boolean): void {
  const Speech = moduloSpeech();
  if (!Speech) return;
  elegirVozNativa(Speech);
  const liberar = prioridad ? marcarPrioridad(texto) : undefined;
  try {
    void Speech.stop();
    Speech.speak(texto, {
      language: idiomaNativo,
      voice: vozNativa,
      rate: 1.1,
      onDone: liberar,
      onStopped: liberar,
      onError: liberar,
    });
  } catch {
    liberar?.();
  }
}

function decirWeb(texto: string, prioridad: boolean): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texto);
  u.lang = "es-419";
  u.rate = 1.1;
  if (prioridad) {
    const liberar = marcarPrioridad(texto);
    u.onend = liberar;
    u.onerror = liberar;
  }
  window.speechSynthesis.speak(u);
}

/**
 * Habla un texto. Con `prioridad` (cronómetro, MOB) corta lo que esté sonando;
 * sin prioridad, NO interrumpe un anuncio prioritario en curso (se descarta).
 */
export function decir(texto: string, opciones?: { prioridad?: boolean }): void {
  if (!vozActiva()) return;
  const prioridad = opciones?.prioridad ?? false;
  if (!prioridad && vozOcupadaConPrioridad()) return;
  if (Platform.OS === "web") {
    decirWeb(texto, prioridad);
  } else {
    decirNativo(texto, prioridad);
  }
}

/**
 * Configura la sesión de audio nativa para que la voz suene aunque el
 * interruptor de silencio del iPhone esté activado y siga con la pantalla
 * bloqueada (requiere "audio" en UIBackgroundModes). Llamar una vez al arrancar.
 */
export async function configurarAudioNativo(): Promise<void> {
  if (Platform.OS === "web") return;
  const modo = {
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    allowsRecordingIOS: false,
    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
    shouldDuckAndroid: true,
    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
    playThroughEarpieceAndroid: false,
  };
  try {
    await Audio.setAudioModeAsync(modo);
  } catch {
    // expo-av rechaza staysActiveInBackground si falta "audio" en
    // UIBackgroundModes: al menos dejamos la voz sonando en modo silencio.
    try {
      await Audio.setAudioModeAsync({ ...modo, staysActiveInBackground: false });
    } catch {
      // Si falla, la voz sigue funcionando (solo no sonará en modo silencio)
    }
  }
}

// Anuncios específicos de regata ------------------------------------------------

// Los anuncios del cronómetro son prioritarios (no los corta el copiloto).
const PRIORITARIO = { prioridad: true } as const;

export function anunciarMinuto(minutosRestantes: number): void {
  if (minutosRestantes === 5) decir("Señal de atención. 5 minutos.", PRIORITARIO);
  else if (minutosRestantes === 4) decir("4 minutos.", PRIORITARIO);
  else if (minutosRestantes === 3) decir("3 minutos.", PRIORITARIO);
  else if (minutosRestantes === 2) decir("2 minutos.", PRIORITARIO);
  else if (minutosRestantes === 1) decir("1 minuto.", PRIORITARIO);
}

export function anunciarCountdownFinal(segundos: number): void {
  if (segundos >= 1 && segundos <= 10) {
    decir(String(segundos), PRIORITARIO);
  }
}

export function anunciarStart(): void {
  decir("Start!", PRIORITARIO);
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
