// Tipos para el módulo de polares.
// Un polar es una matriz que mapea (TWS, TWA) → BSP (velocidad del barco).

/** Velocidad de viento real, en nudos. */
export type TWS = number;

/** Ángulo al viento real, en grados (0=viento por la proa, 180=por la popa). */
export type TWA = number;

/** Velocidad del barco, en nudos. */
export type BSP = number;

/**
 * Polar de un barco: matriz de TWS × TWA → BSP.
 * Los valores TWS y TWA están ordenados de menor a mayor.
 */
export type Polar = {
  /** Valores de TWS en los que está definida la tabla (eje vertical). */
  tws: number[];
  /** Valores de TWA en los que está definida la tabla (eje horizontal). */
  twa: number[];
  /** Matriz de BSP[i][j] correspondiente a tws[i] × twa[j]. */
  bsp: number[][];
};

/** Resultado de cálculo de óptimos para una intensidad de viento dada. */
export type OptimosPolar = {
  twsConsultado: number;
  /** Mejor TWA en zona upwind (ceñida) */
  twaOptimoCenida: number;
  bspCenida: number;
  vmgCenida: number;
  /** Mejor TWA en zona downwind (empopada) */
  twaOptimoEmpopada: number;
  bspEmpopada: number;
  vmgEmpopada: number;
};

/** Definición de un barco con su polar asociado. */
export type Barco = {
  id: string;
  nombre: string;
  clase: string;
  descripcion?: string;
  polar: Polar;
};
