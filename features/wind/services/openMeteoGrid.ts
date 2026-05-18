// Cliente Open-Meteo para consultar múltiples puntos en un solo request.
// Reduce 25 puntos a 1 round-trip HTTP. Open-Meteo soporta hasta 1000 puntos.

import axios from "axios";
import type { PuntoGrid } from "../data/grid";
import type { PuntoPronostico } from "../types";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

// Cuando se piden múltiples puntos, Open-Meteo devuelve un array de objetos.
type RespuestaUnPunto = {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_gusts_10m: number[];
  };
};

export type PronosticoPuntoGrid = {
  lat: number;
  lon: number;
  puntos: PuntoPronostico[];
};

export type PronosticoGrid = {
  generadoEn: string; // ISO timestamp del fetch
  puntos: PronosticoPuntoGrid[];
};

/**
 * Obtiene pronóstico horario de viento para todos los puntos del grid.
 * @param grid Array de {lat, lon} de los puntos a consultar.
 * @param dias Días a pronosticar (default 2 = 48 horas).
 */
export async function obtenerPronosticoGrid(
  grid: PuntoGrid[],
  dias: number = 2,
): Promise<PronosticoGrid> {
  // Open-Meteo acepta latitudes/longitudes separadas por comas
  const latitudes = grid.map((p) => p.lat).join(",");
  const longitudes = grid.map((p) => p.lon).join(",");

  const params = {
    latitude: latitudes,
    longitude: longitudes,
    hourly: "wind_speed_10m,wind_direction_10m,wind_gusts_10m",
    wind_speed_unit: "kn",
    timezone: "America/Santiago",
    forecast_days: dias,
  };

  const { data } = await axios.get<RespuestaUnPunto[]>(BASE_URL, { params });

  // Open-Meteo devuelve un array cuando hay múltiples puntos
  const arrayRespuesta = Array.isArray(data) ? data : [data];

  const puntos: PronosticoPuntoGrid[] = arrayRespuesta.map((resp, i) => ({
    lat: grid[i].lat,
    lon: grid[i].lon,
    puntos: resp.hourly.time.map((hora, idx) => ({
      hora,
      velocidadNudos: resp.hourly.wind_speed_10m[idx],
      rachasNudos: resp.hourly.wind_gusts_10m[idx],
      direccionGrados: resp.hourly.wind_direction_10m[idx],
      temperaturaC: 0, // No la pedimos en este endpoint, no aplica
    })),
  }));

  return {
    generadoEn: new Date().toISOString(),
    puntos,
  };
}
