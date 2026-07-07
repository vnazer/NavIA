// Barrel del paquete @navia/nav-utils.
// Funciones puras de navegación: geo, polar, shifts, laylines, línea, rendimiento.

export {
  distanciaMetros,
  distanciaHaversineMt,
  metrosAMn,
  calcularRumbo,
  diferenciaRumboNormalizada,
  deltaAngular,
  puntoDestino,
} from "./geo";

export {
  vmgUpwind,
  vmgDownwind,
  calcularOptimos,
  calcularVMG,
} from "./polar";

export {
  detectarShifts,
  shiftDesdeSesion,
  type TendenciaViento,
  type ShiftDetectado,
} from "./shifts";

export {
  otaOptima,
  calcularLaylines,
  type Laylines,
} from "./laylines";

export {
  distanciaPerpendicularALinea,
  calcularFavoredEnd,
  calcularStartingBias,
  calcularTimeToBurn,
  calcularBearingYDistancia,
} from "./linea";

export { calcularRendimiento } from "./rendimiento";
