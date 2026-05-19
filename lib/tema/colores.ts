// Helper para colores de íconos que respetan modo claro/oscuro.
// Los componentes de lucide-react-native usan prop `color` (string) y no
// las clases de Tailwind, así que necesitamos resolverlas en runtime.

import { useColorScheme } from "nativewind";

/**
 * Retorna `light` cuando el tema está claro y `dark` cuando está oscuro.
 * Pensado para íconos de lucide-react-native sobre fondos que cambian.
 */
export function useColorPorTema(light: string, dark: string): string {
  const { colorScheme } = useColorScheme();
  return colorScheme === "dark" ? dark : light;
}
