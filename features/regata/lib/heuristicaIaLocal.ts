import type { Rendimiento } from "../types";

export interface AIResponse {
  consejoTactico: string;
  ajustePolar: string;
  mensajeVoz: string;
  nivelAlerta: "info" | "alerta" | "urgente";
  alertaSeguridad?: string;
}

/**
 * Motor local de reglas heurísticas tácticas para NavIA Copilot.
 * Funciona de forma 100% autónoma y offline en alta mar.
 */
export function evaluarHeuristicaLocal(
  rendimiento: Rendimiento | null,
  tws: number,
  twd: number,
  olasMt: number = 0.5,
  cog: number = 0,
): AIResponse {
  // Caso sin rendimiento/GPS activo
  if (!rendimiento) {
    return {
      consejoTactico: "Inicia la sesión de regata para activar el copiloto táctico.",
      ajustePolar: "Sin telemetría en vivo.",
      mensajeVoz: "Esperando telemetría del GPS y sensores de viento.",
      nivelAlerta: "info",
    };
  }

  const { porcentajePolar, twa, bspActual, bspEsperado, headingToWaypoint, distanciaToWaypoint } = rendimiento;
  
  // 1. Alertas de Seguridad Extremas
  if (tws >= 22) {
    return {
      consejoTactico: `Viento extremo de ${Math.round(tws)} kt. Considera achicar vela inmediatamente.`,
      ajustePolar: "Trim: Toma el primer rizo en la mayor y cambia a foque chico.",
      mensajeVoz: `Alerta: rachas fuertes de ${Math.round(tws)} nudos. Alista rizo en la mayor.`,
      nivelAlerta: "urgente",
      alertaSeguridad: "Condición extrema: viento fuerte y riesgo de escorada excesiva.",
    };
  }

  // 2. Hombre al agua (esto es manejado prioritariamente, pero por si acaso)
  
  // 3. Aproximación a Boya
  if (distanciaToWaypoint != null && distanciaToWaypoint < 150) {
    return {
      consejoTactico: `Aproximación a la boya: a ${Math.round(distanciaToWaypoint)} metros. ¡Prepara la maniobra!`,
      ajustePolar: "Prepara escotas y tripulación en posiciones de virada o arriada.",
      mensajeVoz: `Aproximación a boya. ${Math.round(distanciaToWaypoint)} metros. Alista maniobra.`,
      nivelAlerta: "urgente",
    };
  }

  // 4. Deriva o Abatimiento importante hacia la boya
  if (headingToWaypoint != null && cog > 0) {
    const diff = Math.abs(((cog - headingToWaypoint + 540) % 360) - 180);
    const desviacion = 180 - diff;
    if (desviacion > 15 && desviacion < 90 && bspActual > 2) {
      return {
        consejoTactico: `Abatimiento de ${Math.round(desviacion)}° respecto a la boya. Corrige rumbo.`,
        ajustePolar: "Sugerencia: Orza ligeramente para compensar la deriva de corriente/viento.",
        mensajeVoz: `Desviación hacia boya de ${Math.round(desviacion)} grados. Orza para corregir.`,
        nivelAlerta: "alerta",
      };
    }
  }

  // 5. Gestión del Mar / Olas
  if (olasMt >= 1.2 && twa < 75) {
    return {
      consejoTactico: `Oleaje alto de ${olasMt.toFixed(1)}m de proa. Timonea abriendo el rumbo en la ola.`,
      ajustePolar: "Orza en la subida, abre y cae en la bajada para mantener arrancada.",
      mensajeVoz: `Mar de proa. Timonea abriendo el rumbo en la cresta para no pinchar la velocidad.`,
      nivelAlerta: "alerta",
    };
  }

  // 6. Pinchado en Ceñida
  if (twa < 35 && bspActual < bspEsperado * 0.85) {
    return {
      consejoTactico: `Estás muy al viento (${Math.round(twa)}°). Cae 3-5 grados para ganar velocidad.`,
      ajustePolar: "Filas un poco las escotas y recupera arrancada antes de volver a orzar.",
      mensajeVoz: "Estás pinchando el viento. Abre el rumbo tres grados.",
      nivelAlerta: "alerta",
    };
  }

  // 7. Rendimiento Polar Bajo
  if (porcentajePolar < 88) {
    const recomendacionTrim = twa < 50 
      ? "Caza driza de mayor 2cm y tensiona el cunningham." 
      : twa > 130 
      ? "Fila escotas y dale torsión (twist) a la baluma." 
      : "Ajusta escotas para buscar el 100% de eficiencia.";

    return {
      consejoTactico: `Velocidad baja al ${Math.round(porcentajePolar)}% del polar. Revisa el trimado de velas.`,
      ajustePolar: `Trim: ${recomendacionTrim}`,
      mensajeVoz: `Eficiencia polar baja, al ${Math.round(porcentajePolar)} por ciento. Revisa velas.`,
      nivelAlerta: "alerta",
    };
  }

  // 8. Excelente Rendimiento
  if (porcentajePolar >= 96) {
    return {
      consejoTactico: `¡Excelente ritmo! Navegando al ${Math.round(porcentajePolar)}% de la polar teórica.`,
      ajustePolar: "Sigue así. Mantén el ángulo y concentración al timón.",
      mensajeVoz: `Excelente ritmo: ${Math.round(porcentajePolar)} por ciento del polar.`,
      nivelAlerta: "info",
    };
  }

  // 9. Consejos Generales de Ceñida / Popa
  if (twa < 50) {
    return {
      consejoTactico: `Ceñida estable con viento de ${Math.round(tws)} kt. Prioriza el ángulo de subida (VMG).`,
      ajustePolar: "Trim: Carro al centro, mayor bien cazada y foque templado.",
      mensajeVoz: "Ceñida estable. Prioriza ganancia al viento.",
      nivelAlerta: "info",
    };
  }

  if (twa > 130) {
    return {
      consejoTactico: `Rumbo portante (popa/a un largo). Evita navegar excesivamente aproado al viento de popa.`,
      ajustePolar: "Trim: Suelta retenida, fila escotas y estabiliza el spinnaker/gennaker.",
      mensajeVoz: "Rumbo portante. Optimiza VMG en la bajada.",
      nivelAlerta: "info",
    };
  }

  // Por defecto
  return {
    consejoTactico: `Rumbo estable. Velocidad ${bspActual.toFixed(1)} kt (${Math.round(porcentajePolar)}% polar).`,
    ajustePolar: "Velocidad y rumbo correctos para las condiciones actuales.",
    mensajeVoz: `Rumbo correcto, a ${bspActual.toFixed(1)} nudos.`,
    nivelAlerta: "info",
  };
}
