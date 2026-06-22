// Cliente Open-Meteo para consultar múltiples puntos en un solo request.
// Reduce 25 puntos a 1 round-trip HTTP. Open-Meteo soporta hasta 1000 puntos.

import axios from "axios";
import type { PuntoGrid } from "../data/grid";
import type { PuntoPronostico } from "../types";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";
const BASE_URL_MARINE = "https://marine-api.open-meteo.com/v1/marine";

// Cuando se piden múltiples puntos, Open-Meteo devuelve un array de objetos.
type RespuestaUnPunto = {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_gusts_10m: number[];
    temperature_2m?: number[];
    precipitation_probability?: number[];
  };
};

type RespuestaMarineGrid = {
  latitude: number;
  longitude: number;
  hourly: {
    time: string[];
    wave_height?: number[];
    wave_period?: number[];
    wave_direction?: number[];
    swell_wave_height?: number[];
    swell_wave_period?: number[];
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
 * Obtiene pronóstico horario completo (viento, olas, clima) para todos los puntos del grid.
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
    hourly: "wind_speed_10m,wind_direction_10m,wind_gusts_10m,temperature_2m,precipitation_probability",
    wind_speed_unit: "kn",
    timezone: "America/Santiago",
    forecast_days: dias,
  };

  const paramsMarine = {
    latitude: latitudes,
    longitude: longitudes,
    hourly:
      "wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period",
    timezone: "America/Santiago",
    forecast_days: dias,
  };

  // Forecast principal + marine en paralelo para el grid de 25 puntos
  const [resForecast, resMarine] = await Promise.allSettled([
    axios.get<RespuestaUnPunto[]>(BASE_URL, { params }),
    axios.get<RespuestaMarineGrid[]>(BASE_URL_MARINE, { params: paramsMarine }),
  ]);

  if (resForecast.status === "rejected") {
    throw resForecast.reason;
  }

  const dataForecast = resForecast.value.data;
  const dataMarine = resMarine.status === "fulfilled" ? resMarine.value.data : [];

  const arrayForecast = Array.isArray(dataForecast) ? dataForecast : [dataForecast];
  const arrayMarine = Array.isArray(dataMarine) ? dataMarine : [dataMarine];

  // BUG FIX: Originalmente se correlacionaba por proximidad geográfica con
  // Math.abs < 0.05, pero la grilla interna de la Forecast API (~4 km) y la
  // Marine API (~9 km, 0.0833°) NO se alinean. Las diferencias pueden llegar
  // a 0.22° (24 km), haciendo que el find() falle y olaMt quede undefined en
  // varios puntos del grid. Ambas APIs respetan el ORDEN de los puntos del
  // input, así que correlacionamos por índice.
  const puntos: PronosticoPuntoGrid[] = arrayForecast.map((resp, i) => {
    const respMarine = arrayMarine[i];
    const olas = respMarine?.hourly?.wave_height ?? [];
    const periodos = respMarine?.hourly?.wave_period ?? [];
    const dirsOla = respMarine?.hourly?.wave_direction ?? [];
    const swellH = respMarine?.hourly?.swell_wave_height ?? [];
    const swellP = respMarine?.hourly?.swell_wave_period ?? [];

    return {
      lat: grid[i].lat,
      lon: grid[i].lon,
      puntos: resp.hourly.time.map((hora, idx) => ({
        hora,
        velocidadNudos: resp.hourly.wind_speed_10m[idx],
        rachasNudos: resp.hourly.wind_gusts_10m[idx],
        direccionGrados: resp.hourly.wind_direction_10m[idx],
        temperaturaC: resp.hourly.temperature_2m?.[idx] ?? 0,
        probLluvia: resp.hourly.precipitation_probability?.[idx],
        olaMt: olas[idx],
        olaPeriodoSeg: periodos[idx],
        olaDireccionGrados: dirsOla[idx],
        swellMt: swellH[idx],
        swellPeriodoSeg: swellP[idx],
      })),
    };
  });

  return {
    generadoEn: new Date().toISOString(),
    puntos,
  };
}
