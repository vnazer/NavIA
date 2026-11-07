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
 *
 * @param olasMt  Ola del pronóstico (m). null = sin dato → no se aplica la regla de olas.
 * @param cog     COG en grados; null si el GPS no tiene rumbo válido.
 * @param esIlca  true para ILCA (vela única, sin tripulación): los consejos de
 *                trimado usan vang/cunningham/outhaul/escota/banda en vez de
 *                rizo, foque, spinnaker o tripulación.
 */
export function evaluarHeuristicaLocal(
  rendimiento: Rendimiento | null,
  tws: number,
  twd: number,
  olasMt: number | null = null,
  cog: number | null = null,
  esIlca: boolean = false,
): AIResponse {
  // Caso sin rendimiento/GPS activo (sin voz: no tiene sentido repetirlo)
  if (!rendimiento) {
    return {
      consejoTactico: "Inicia la sesión de regata para activar el copiloto táctico.",
      ajustePolar: "Sin telemetría en vivo.",
      mensajeVoz: "",
      nivelAlerta: "info",
    };
  }

  const { porcentajePolar, twa, bspActual, bspEsperado, headingToWaypoint, distanciaToWaypoint } = rendimiento;
  
  // 1. Alertas de Seguridad Extremas
  if (tws >= 22) {
    if (esIlca) {
      return {
        consejoTactico: `Viento extremo de ${Math.round(tws)} kt. Despotencia la vela y prioriza el control.`,
        ajustePolar: "Trim: Cunningham y vang a fondo, outhaul firme. Banda al máximo y fila escota en las rachas.",
        mensajeVoz: `Alerta: rachas fuertes de ${Math.round(tws)} nudos. Cunningham y vang a fondo, banda al máximo.`,
        nivelAlerta: "urgente",
        alertaSeguridad: "Condición extrema: viento fuerte y riesgo de volcar.",
      };
    }
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
      ajustePolar: esIlca
        ? "Planifica la virada o trasluchada y deja vang y cunningham listos para el nuevo rumbo."
        : "Prepara escotas y tripulación en posiciones de virada o arriada.",
      mensajeVoz: `Aproximación a boya. ${Math.round(distanciaToWaypoint)} metros. Alista maniobra.`,
      nivelAlerta: "urgente",
    };
  }

  // 4. Deriva o Abatimiento importante hacia la boya
  if (headingToWaypoint != null && cog != null) {
    // Diferencia con signo entre el rumbo a la boya y el COG, en (-180, 180]:
    // positiva = la boya queda a estribor (corregir a la derecha).
    const conSigno = ((headingToWaypoint - cog + 540) % 360) - 180;
    const desviacion = Math.abs(conSigno);
    const lado = conSigno > 0 ? "estribor" : "babor";
    if (desviacion > 15 && desviacion < 90 && bspActual > 2) {
      return {
        consejoTactico: `Abatimiento de ${Math.round(desviacion)}° respecto a la boya. Corrige hacia ${lado}.`,
        ajustePolar: "Sugerencia: apunta más arriba de la boya para compensar la deriva de corriente/viento.",
        mensajeVoz: `Desviación de ${Math.round(desviacion)} grados respecto a la boya. Corrige hacia ${lado}.`,
        nivelAlerta: "alerta",
      };
    }
  }

  // 5. Gestión del Mar / Olas (solo si el pronóstico trae altura de ola)
  if (olasMt != null && olasMt >= 1.2 && twa < 75) {
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
      ajustePolar: esIlca
        ? "Fila un poco la escota y recupera arrancada antes de volver a orzar."
        : "Filas un poco las escotas y recupera arrancada antes de volver a orzar.",
      mensajeVoz: "Estás pinchando el viento. Abre el rumbo tres grados.",
      nivelAlerta: "alerta",
    };
  }

  // 7. Rendimiento Polar Bajo
  if (porcentajePolar < 88) {
    const recomendacionTrim = esIlca
      ? twa < 50
        ? "Escota a dos bloques, vang y cunningham según viento, y barco plano con la banda."
        : twa > 130
          ? "Suelta cunningham, vang medio, outhaul más suelto y fila escota."
          : "Ajusta escota y outhaul; mantén el barco plano."
      : twa < 50
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
      ajustePolar: esIlca
        ? "Trim: Escota a dos bloques, vang firme y banda para mantener el barco plano."
        : "Trim: Carro al centro, mayor bien cazada y foque templado.",
      mensajeVoz: "Ceñida estable. Prioriza ganancia al viento.",
      nivelAlerta: "info",
    };
  }

  if (twa > 130) {
    return {
      consejoTactico: `Rumbo portante (popa/a un largo). Evita navegar excesivamente aproado al viento de popa.`,
      ajustePolar: esIlca
        ? "Trim: Suelta cunningham, outhaul medio y vang suave; trabaja las olas con el timón y la escota."
        : "Trim: Suelta retenida, fila escotas y estabiliza el spinnaker/gennaker.",
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
