// Cliente del API Open-Meteo (gratis, sin API key).
// Docs: https://open-meteo.com/en/docs
// Marine API (olas): https://marine-api.open-meteo.com/v1/marine
//
// MODIFICADO EN PROMPT 9: agrega presión, UV, lluvia, visibilidad, nubosidad,
// CAPE, y olas (marine-api en paralelo). Las nuevas variables son opcionales
// porque algunas coordenadas/zonas pueden no devolverlas.

import axios from "axios";
import type { Pronostico, PuntoPronostico } from "../types";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";

const HOURLY_VARS = [
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
  "temperature_2m",
  // Prompt 9
  "pressure_msl",
  "uv_index",
  "precipitation",
  "precipitation_probability",
  "visibility",
  "cloud_cover",
  "cape",
].join(",");

type RespuestaOpenMeteo = {
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_gusts_10m: number[];
    temperature_2m: number[];
    pressure_msl?: number[];
    uv_index?: number[];
    precipitation?: number[];
    precipitation_probability?: number[];
    visibility?: number[];
    cloud_cover?: number[];
    cape?: number[];
  };
};

type RespuestaMarine = {
  hourly: {
    time: string[];
    wave_height?: number[];
  };
};

/**
 * Obtiene pronóstico horario completo para una coordenada.
 * Hace 2 requests en paralelo: forecast (atmosférico) + marine (olas).
 * Si marine falla, sigue sin olas (no crítico).
 */
export async function obtenerPronosticoViento(
  lat: number,
  lon: number,
  spotId: string,
  dias: number = 3,
): Promise<Pronostico> {
  const paramsForecast = {
    latitude: lat,
    longitude: lon,
    hourly: HOURLY_VARS,
    wind_speed_unit: "kn",
    timezone: "America/Santiago",
    forecast_days: dias,
  };

  const paramsMarine = {
    latitude: lat,
    longitude: lon,
    hourly: "wave_height",
    timezone: "America/Santiago",
    forecast_days: dias,
  };

  // Forecast principal + marine en paralelo. Marine puede fallar en algunas
  // coords (ej. muy lejos de la costa o zona no cubierta) — no es crítico.
  const [resForecast, resMarine] = await Promise.allSettled([
    axios.get<RespuestaOpenMeteo>(BASE_URL, { params: paramsForecast }),
    axios.get<RespuestaMarine>(MARINE_URL, { params: paramsMarine }),
  ]);

  if (resForecast.status === "rejected") {
    throw resForecast.reason;
  }

  const data = resForecast.value.data;
  const olas =
    resMarine.status === "fulfilled"
      ? (resMarine.value.data.hourly?.wave_height ?? [])
      : [];

  const puntos: PuntoPronostico[] = data.hourly.time.map((hora, i) => ({
    hora,
    velocidadNudos: data.hourly.wind_speed_10m[i],
    rachasNudos: data.hourly.wind_gusts_10m[i],
    direccionGrados: data.hourly.wind_direction_10m[i],
    temperaturaC: data.hourly.temperature_2m[i],
    presionHpa: data.hourly.pressure_msl?.[i],
    uv: data.hourly.uv_index?.[i],
    precipitacionMm: data.hourly.precipitation?.[i],
    probLluvia: data.hourly.precipitation_probability?.[i],
    visibilidadMt: data.hourly.visibility?.[i],
    nubosidad: data.hourly.cloud_cover?.[i],
    cape: data.hourly.cape?.[i],
    olaMt: olas[i],
  }));

  return {
    spotId,
    generadoEn: new Date().toISOString(),
    puntos,
  };
}
