// Solicita pronóstico de viento en un grid alrededor de un centro.
// Open-Meteo permite pasar múltiples coords en una sola request si las separas
// con comas. Devolvemos los datos en un formato neutro y aparte exponemos un
// helper que los traduce al GRIB JSON que espera leaflet-velocity.

export type CeldaViento = {
  lat: number;
  lon: number;
  velocidadKts: number;
  direccionGrados: number;
};

export type GridViento = {
  celdas: CeldaViento[];
  ancho: number;
  alto: number;
  latMin: number;
  latMax: number;
  lonMin: number;
  lonMax: number;
  hora: string;
};

const GRID_SIZE = 5;
const STEP_GRADOS = 0.15;

export async function fetchGridViento(
  centroLat: number,
  centroLon: number,
  horasAdelante: number = 0,
): Promise<GridViento> {
  const lats: number[] = [];
  const lons: number[] = [];
  const offset = Math.floor(GRID_SIZE / 2);

  // GRIB indexa de norte a sur (lat decreciente).
  for (let iy = 0; iy < GRID_SIZE; iy++) {
    const lat = centroLat + (offset - iy) * STEP_GRADOS;
    for (let ix = 0; ix < GRID_SIZE; ix++) {
      const lon = centroLon + (ix - offset) * STEP_GRADOS;
      lats.push(lat);
      lons.push(lon);
    }
  }

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lats.join(",")}` +
    `&longitude=${lons.join(",")}` +
    `&hourly=wind_speed_10m,wind_direction_10m&forecast_days=2&timezone=auto&windspeed_unit=kn`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo grid no responde: ${res.status}`);
  const data = await res.json();
  const arr = Array.isArray(data) ? data : [data];

  const celdas: CeldaViento[] = arr.map((p, idx) => {
    const i = Math.min(horasAdelante, (p.hourly?.time?.length ?? 1) - 1);
    return {
      lat: lats[idx],
      lon: lons[idx],
      velocidadKts: p.hourly?.wind_speed_10m?.[i] ?? 0,
      direccionGrados: p.hourly?.wind_direction_10m?.[i] ?? 0,
    };
  });

  const horaIso =
    arr[0]?.hourly?.time?.[horasAdelante] ?? new Date().toISOString();

  return {
    celdas,
    ancho: GRID_SIZE,
    alto: GRID_SIZE,
    latMin: centroLat - offset * STEP_GRADOS,
    latMax: centroLat + offset * STEP_GRADOS,
    lonMin: centroLon - offset * STEP_GRADOS,
    lonMax: centroLon + offset * STEP_GRADOS,
    hora: horaIso,
  };
}

/** Convierte un GridViento al formato GRIB JSON de leaflet-velocity. */
export function gridAGribJson(grid: GridViento) {
  const dx = (grid.lonMax - grid.lonMin) / (grid.ancho - 1);
  const dy = (grid.latMax - grid.latMin) / (grid.alto - 1);

  const uData: number[] = [];
  const vData: number[] = [];

  for (const celda of grid.celdas) {
    const velMs = celda.velocidadKts * 0.5144;
    const rad = (celda.direccionGrados * Math.PI) / 180;
    // Dirección meteo = "de dónde viene". U/V = "hacia dónde va".
    const u = -velMs * Math.sin(rad);
    const v = -velMs * Math.cos(rad);
    uData.push(u);
    vData.push(v);
  }

  const headerBase = {
    discipline: 0,
    disciplineName: "Meteorological products",
    refTime: new Date().toISOString(),
    parameterCategory: 2,
    parameterCategoryName: "Momentum",
    lo1: grid.lonMin,
    la1: grid.latMax,
    lo2: grid.lonMax,
    la2: grid.latMin,
    nx: grid.ancho,
    ny: grid.alto,
    dx,
    dy,
  };

  return [
    {
      header: {
        ...headerBase,
        parameterNumber: 2,
        parameterNumberName: "U-component_of_wind",
      },
      data: uData,
    },
    {
      header: {
        ...headerBase,
        parameterNumber: 3,
        parameterNumberName: "V-component_of_wind",
      },
      data: vData,
    },
  ];
}
