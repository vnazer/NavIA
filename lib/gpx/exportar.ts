// Exporta una sesión de regata como GPX 1.1.
// En web: descarga vía Blob. En nativo: usa expo-sharing.

import { Platform } from "react-native";
import type { Sesion } from "@/features/regata/types";

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

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="NavIA"
  xmlns="http://www.topografix.com/GPX/1/1"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">
  <metadata>
    <name>${sesion.nombre}</name>
    <time>${new Date(sesion.fechaInicio).toISOString()}</time>
  </metadata>
  <trk>
    <name>${sesion.nombre}</name>
    <trkseg>
${trkpts}
    </trkseg>
  </trk>
</gpx>`;
}

function exportarWeb(gpx: string, nombre: string): void {
  const blob = new Blob([gpx], { type: "application/gpx+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function exportarNativo(gpx: string, nombre: string): Promise<void> {
  // Lazy require avoids bundling native modules in web builds
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
    Sharing.isAvailableAsync ?? (Sharing as unknown as { default: typeof Sharing }).default?.isAvailableAsync;
  const shareAsync =
    Sharing.shareAsync ?? (Sharing as unknown as { default: typeof Sharing }).default?.shareAsync;

  if (isAvailable && (await isAvailable())) {
    await shareAsync(uri, {
      mimeType: "application/gpx+xml",
      dialogTitle: "Exportar track GPX",
    });
  }
}

export async function exportarGpx(sesion: Sesion): Promise<void> {
  if (sesion.puntos.length === 0) return;
  const gpx = generarGpx(sesion);
  const fecha = new Date(sesion.fechaInicio)
    .toISOString()
    .slice(0, 16)
    .replace(/[T:]/g, "-");
  const nombre = `navia-${fecha}.gpx`;

  if (Platform.OS === "web") {
    exportarWeb(gpx, nombre);
  } else {
    await exportarNativo(gpx, nombre);
  }
}
