// Exporta una sesión de regata como GPX 1.1.
// En web: descarga vía Blob (con fallback a data URL si el navegador bloquea).
// En nativo: usa expo-sharing.

import { Platform } from "react-native";
import type { Sesion } from "@/features/regata/types";

export type ResultadoExport =
  | { ok: true; mensaje: string }
  | { ok: false; mensaje: string };

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function generarGpx(sesion: Sesion): string {
  const trkpts = sesion.puntos
    .map((p) => {
      const t = new Date(p.ts).toISOString();
      return `    <trkpt lat="${p.lat}" lon="${p.lon}">
      <time>${t}</time>
      <extensions>
        <speed>${(p.sogKts * 0.514444).toFixed(2)}</speed>
        <course>${p.cogGrados.toFixed(1)}</course>
      </extensions>
    </trkpt>`;
    })
    .join("\n");

  const nombre = escapeXml(sesion.nombre);

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="NavIA"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${nombre}</name>
    <time>${new Date(sesion.fechaInicio).toISOString()}</time>
  </metadata>
  <trk>
    <name>${nombre}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

function descargarBlob(gpx: string, nombre: string): boolean {
  try {
    const blob = new Blob([gpx], { type: "application/gpx+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        // ignore
      }
    }, 500);
    return true;
  } catch {
    return false;
  }
}

function descargarDataUrl(gpx: string, nombre: string): boolean {
  try {
    // Fallback para navegadores que bloquean blob: URLs (CSP/extensiones)
    const dataUrl =
      "data:application/gpx+xml;charset=utf-8," + encodeURIComponent(gpx);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = nombre;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
      } catch {
        // ignore
      }
    }, 500);
    return true;
  } catch {
    return false;
  }
}

function abrirEnNuevaPestana(gpx: string): boolean {
  try {
    const dataUrl =
      "data:application/gpx+xml;charset=utf-8," + encodeURIComponent(gpx);
    const w = window.open(dataUrl, "_blank");
    return w != null;
  } catch {
    return false;
  }
}

function exportarWeb(gpx: string, nombre: string): ResultadoExport {
  if (typeof document === "undefined") {
    return { ok: false, mensaje: "Entorno sin DOM, no se puede descargar." };
  }
  if (descargarBlob(gpx, nombre)) {
    return { ok: true, mensaje: `Descargando ${nombre}` };
  }
  if (descargarDataUrl(gpx, nombre)) {
    return { ok: true, mensaje: `Descargando ${nombre}` };
  }
  if (abrirEnNuevaPestana(gpx)) {
    return {
      ok: true,
      mensaje: "Abrí el archivo en una nueva pestaña. Guardalo con Cmd+S / Ctrl+S.",
    };
  }
  return {
    ok: false,
    mensaje: "El navegador bloqueó la descarga. Probá desactivar bloqueadores.",
  };
}

async function exportarNativo(
  gpx: string,
  nombre: string,
): Promise<ResultadoExport> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const FileSystem = require("expo-file-system") as typeof import("expo-file-system");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Sharing = require("expo-sharing") as typeof import("expo-sharing");

    const cacheDir: string =
      // @ts-expect-error legacy property available at runtime on native
      FileSystem.cacheDirectory ?? FileSystem.default?.cacheDirectory ?? "";
    const uri = `${cacheDir}${nombre}`;

    const writeAsync =
      // @ts-expect-error legacy function available at runtime on native
      FileSystem.writeAsStringAsync ?? FileSystem.default?.writeAsStringAsync;
    await writeAsync(uri, gpx, { encoding: "utf8" });

    const isAvailable =
      Sharing.isAvailableAsync ??
      (Sharing as unknown as { default: typeof Sharing }).default?.isAvailableAsync;
    const shareAsync =
      Sharing.shareAsync ??
      (Sharing as unknown as { default: typeof Sharing }).default?.shareAsync;

    if (isAvailable && (await isAvailable())) {
      await shareAsync(uri, {
        mimeType: "application/gpx+xml",
        dialogTitle: "Exportar track GPX",
      });
      return { ok: true, mensaje: "Compartiendo GPX…" };
    }
    return { ok: true, mensaje: `Archivo guardado en ${uri}` };
  } catch (e) {
    return {
      ok: false,
      mensaje: `Error al exportar: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}

export async function exportarGpx(sesion: Sesion): Promise<ResultadoExport> {
  if (!sesion.puntos || sesion.puntos.length === 0) {
    return {
      ok: false,
      mensaje:
        "Esta sesión no tiene puntos GPS grabados. No hay nada que exportar.",
    };
  }
  const gpx = generarGpx(sesion);
  const fecha = new Date(sesion.fechaInicio)
    .toISOString()
    .slice(0, 16)
    .replace(/[T:]/g, "-");
  const nombre = `navia-${fecha}.gpx`;

  if (Platform.OS === "web") {
    return exportarWeb(gpx, nombre);
  }
  return exportarNativo(gpx, nombre);
}
