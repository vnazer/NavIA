// Parser flexible de coordenadas náuticas. Acepta:
// - Decimal:           -33.039, -71.599
// - Decimal etiquetado: 33.039 S, 71.599 W
// - Grados/min:        33°02.34'S 71°35.98'W
// - Grados/min (espacios): 33 02.34 S 71 35.98 W
// - Múltiples puntos en líneas separadas o con separadores ;|

export type ResultadoParser =
  | { ok: true; lat: number; lon: number }
  | { ok: false; error: string };

const RE_DECIMAL_SIMPLE =
  /^\s*(-?\d{1,3}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/;

// 33°02.34'S 71°35.98'W  o  33 02.34 S 71 35.98 W
const RE_GRADOS_MIN =
  /(\d{1,3})[°\s]+(\d{1,2}(?:\.\d+)?)['′\s]*\s*([NSns])\s*[,;\s]+(\d{1,3})[°\s]+(\d{1,2}(?:\.\d+)?)['′\s]*\s*([EWewOo])/;

// 33.039 S 71.599 W
const RE_DECIMAL_ETIQUETADO =
  /(\d{1,3}(?:\.\d+)?)\s*([NSns])\s*[,;\s]+(\d{1,3}(?:\.\d+)?)\s*([EWewOo])/;

function signoLat(letra: string): number {
  return letra.toUpperCase() === "S" ? -1 : 1;
}

function signoLon(letra: string): number {
  // O y W son lo mismo (Oeste/West)
  const u = letra.toUpperCase();
  return u === "W" || u === "O" ? -1 : 1;
}

/** Convierte grados + minutos decimales a grados decimales. */
function gradosMinADecimal(grados: number, minutos: number): number {
  return grados + minutos / 60;
}

export function parsearCoordenada(input: string): ResultadoParser {
  const trim = input.trim();
  if (!trim) return { ok: false, error: "Vacío" };

  // 1. Grados/minutos con etiqueta N/S/E/W (formato náutico)
  const m1 = trim.match(RE_GRADOS_MIN);
  if (m1) {
    const lat =
      signoLat(m1[3]) * gradosMinADecimal(parseFloat(m1[1]), parseFloat(m1[2]));
    const lon =
      signoLon(m1[6]) * gradosMinADecimal(parseFloat(m1[4]), parseFloat(m1[5]));
    if (validarRango(lat, lon)) return { ok: true, lat, lon };
  }

  // 2. Decimal etiquetado: 33.039 S 71.599 W
  const m2 = trim.match(RE_DECIMAL_ETIQUETADO);
  if (m2) {
    const lat = signoLat(m2[2]) * parseFloat(m2[1]);
    const lon = signoLon(m2[4]) * parseFloat(m2[3]);
    if (validarRango(lat, lon)) return { ok: true, lat, lon };
  }

  // 3. Decimal simple: -33.039, -71.599
  const m3 = trim.match(RE_DECIMAL_SIMPLE);
  if (m3) {
    const lat = parseFloat(m3[1]);
    const lon = parseFloat(m3[2]);
    if (validarRango(lat, lon)) return { ok: true, lat, lon };
  }

  return {
    ok: false,
    error:
      "Formato no reconocido. Probá: '33°02.34'S 71°35.98'W' o '-33.039, -71.599'",
  };
}

function validarRango(lat: number, lon: number): boolean {
  return (
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

export type LineaParseada = {
  linea: string;
  nombre: string;
  resultado: ResultadoParser;
};

/**
 * Parsea un texto multilínea donde cada línea es una boya.
 * Formatos por línea:
 *   - "Nombre: coordenada"
 *   - "Nombre = coordenada"
 *   - solo "coordenada" (asigna nombre automático "1", "2", …)
 * Líneas vacías y que empiezan con # se ignoran.
 */
export function parsearTextoBoyas(texto: string): LineaParseada[] {
  const lineas = texto
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  let contador = 1;
  return lineas.map((linea) => {
    // Separador nombre/coord: ':' o '='
    const sep = linea.match(/^([^:=]{1,30})\s*[:=]\s*(.+)$/);
    let nombre: string;
    let resto: string;
    if (sep) {
      nombre = sep[1].trim();
      resto = sep[2].trim();
    } else {
      nombre = String(contador++);
      resto = linea;
    }
    return {
      linea,
      nombre,
      resultado: parsearCoordenada(resto),
    };
  });
}
