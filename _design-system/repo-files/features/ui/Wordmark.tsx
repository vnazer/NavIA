// features/ui/Wordmark.tsx
//
// Marca NAVIA — glifo de proa + wordmark mono.
// Usá esto en headers, login screen, splash, etc.

import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useColores } from "@/lib/tema";

export function Wordmark({
  tamaño = 32,
  color,
}: {
  tamaño?: number;
  color?: string;
}) {
  const c = useColores();
  const col = color ?? c.text;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: tamaño * 0.28,
      }}
    >
      <Svg width={tamaño * 0.7} height={tamaño} viewBox="0 0 14 20">
        <Path d="M2 18 L12 10 L2 2 L2 6 L8 10 L2 14 Z" fill={col} />
      </Svg>
      <Text
        style={{
          fontFamily: "JetBrainsMono-ExtraBold",
          fontSize: tamaño * 0.58,
          letterSpacing: -0.6,
          color: col,
          lineHeight: tamaño,
        }}
      >
        NAVIA
      </Text>
    </View>
  );
}
