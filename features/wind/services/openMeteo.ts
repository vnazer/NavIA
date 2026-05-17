// Cliente del API Open-Meteo (gratis, sin API key).
// Docs: https://open-meteo.com/en/docs
import axios from "axios";
import type { Pronostico, PuntoPronostico } from "../types";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

type RespuestaOpenMeteo = {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_gusts_10m: number[];
    temperature_2m: number[];
  };
};

/**
 * Obtiene pronóstico horario de viento para una coordenada.
 * @param lat Latitud decimal.
 * @param lon Longitud decimal.
 * @param spotId Id del spot, para etiquetar el resultado.
 * @param dias Cantidad de días a pronosticar (default 3).
 */
export async function obtenerPronosticoViento(
  lat: number,
  lon: number,
  spotId: string,
  dias: number = 3,
): Promise<Pronostico> {
  const params = {
    latitude: lat,
    longitude: lon,
    hourly: "wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_2m",
    wind_speed_unit: "kn",
    timezone: "America/Santiago",
    forecast_days: dias,
  };

  const { data } = await axios.get<RespuestaOpenMeteo>(BASE_URL, { params });

  const puntos: PuntoPronostico[] = data.hourly.time.map((hora, i) => ({
    hora,
    velocidadNudos: data.hourly.wind_speed_10m[i],
    rachasNudos: data.hourly.wind_gusts_10m[i],
    direccionGrados: data.hourly.wind_direction_10m[i],
    temperaturaC: data.hourly.temperature_2m[i],
  }));

  return {
    spotId,
    generadoEn: new Date().toISOString(),
    puntos,
  };
}
