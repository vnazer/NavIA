// features/ui/index.tsx
//
// NavIA UI Kit — todos los componentes del sistema de diseño, listos para usar
// en React Native con NativeWind. Cada componente lee el modo actual (deck/light)
// desde useTema() y se autoadapta.
//
// USO:
//   import { MetricCard, TimerHero, Boya, AlertBanner } from "@/features/ui";
//
//   <MetricCard label="SOG" valor="6.8" unidad="nudos" tamaño="hero" />
//   <TimerHero tiempoMs={273000} fase="prep" />
//   <Boya tipo="windward" tamaño={32} />

import React from "react";
import { View, Text, Pressable, ViewStyle, TextStyle } from "react-native";
import Svg, {
  Path,
  Circle,
  Polygon,
  Rect,
  Line,
  G,
  Polyline,
} from "react-native-svg";
import { useColores, useEsDeck, Colores } from "@/lib/tema";

// =============================================================================
// 1 · ESTILOS BASE
// =============================================================================
// Inter para UI, JetBrains Mono para números (tabular-nums).

export const fuenteNum: TextStyle = {
  fontFamily: "JetBrainsMono-Bold",
  fontVariant: ["tabular-nums"] as TextStyle["fontVariant"],
};
export const fuenteNumGigante: TextStyle = {
  fontFamily: "JetBrainsMono-ExtraBold",
  fontVariant: ["tabular-nums"] as TextStyle["fontVariant"],
};
export const fuenteUI: TextStyle = { fontFamily: "Inter-Regular" };
export const fuenteUIBold: TextStyle = { fontFamily: "Inter-Bold" };

// Label uppercase tracked, para títulos de sección
export const estiloLabel: TextStyle = {
  fontFamily: "Inter-Bold",
  fontSize: 10,
  letterSpacing: 1.4,
  textTransform: "uppercase",
};

// =============================================================================
// 2 · METRIC CARD — número grande + label + unidad
// =============================================================================
type MetricCardProps = {
  label: string;
  valor: string | number;
  unidad?: string;
  sub?: string;
  tamaño?: "hero" | "grande" | "medio";
  color?: string;
  tendencia?: "up" | "dn" | "flat";
};

export function MetricCard({
  label,
  valor,
  unidad,
  sub,
  tamaño = "medio",
  color,
  tendencia,
}: MetricCardProps) {
  const c = useColores();
  const sizes = {
    hero:   { num: 96, label: 10, pad: 18 },
    grande: { num: 56, label: 10, pad: 16 },
    medio:  { num: 32, label: 10, pad: 14 },
  }[tamaño];

  const colorNum = color ?? c.text;
  const colorTend =
    tendencia === "up" ? c.lift : tendencia === "dn" ? c.header : c.text3;

  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.border,
        padding: sizes.pad,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Text style={[estiloLabel, { color: c.text3 }]}>{label}</Text>
        {tendencia && (
          <Text style={{ color: colorTend, fontSize: 12, lineHeight: 12 }}>
            {tendencia === "up" ? "▲" : tendencia === "dn" ? "▼" : "—"}
          </Text>
        )}
      </View>
      <Text
        style={[
          tamaño === "hero" ? fuenteNumGigante : fuenteNum,
          {
            fontSize: sizes.num,
            color: colorNum,
            lineHeight: sizes.num,
            letterSpacing: tamaño === "hero" ? -2 : 0,
            marginTop: 4,
          },
        ]}
      >
        {valor}
      </Text>
      {(unidad || sub) && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginTop: 2,
          }}
        >
          {unidad ? (
            <Text style={[fuenteUI, { fontSize: 11, color: c.text2 }]}>
              {unidad}
            </Text>
          ) : (
            <View />
          )}
          {sub && (
            <Text style={[fuenteNum, { fontSize: 11, color: c.text3 }]}>
              {sub}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

// =============================================================================
// 3 · TIMER HERO — countdown grande con fase visible
// =============================================================================
type Fase = "off" | "warning" | "prep" | "onemin" | "start" | "racing";

export function TimerHero({
  tiempoMs,
  fase,
}: {
  tiempoMs: number;
  fase: Fase;
}) {
  const c = useColores();
  const colorPorFase: Record<Fase, string> = {
    off:     c.text3,
    warning: c.text2,
    prep:    c.accent,
    onemin:  c.warn,
    start:   c.header,
    racing:  c.lift,
  };
  const labelPorFase: Record<Fase, string> = {
    off: "OFF",
    warning: "5 MIN",
    prep: "PREP",
    onemin: "1 MIN",
    start: "START",
    racing: "RACING",
  };
  const col = colorPorFase[fase];
  const activo = fase !== "off";

  // Formatear MM:SS
  const sec = Math.max(0, Math.round(tiempoMs / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  const display = activo
    ? `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : "--:--";

  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderWidth: 1,
        borderColor: c.border,
        padding: 20,
        alignItems: "center",
        gap: 8,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Text style={[estiloLabel, { color: c.text3 }]}>RACE TIMER</Text>
        <View style={{ backgroundColor: col + "33", paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={[estiloLabel, { color: col }]}>{labelPorFase[fase]}</Text>
        </View>
      </View>
      <Text
        style={[
          fuenteNumGigante,
          { fontSize: 92, color: col, lineHeight: 92, letterSpacing: -2 },
        ]}
      >
        {display}
      </Text>
      {/* Phase ticks 5/4/3/2/1 */}
      <View style={{ flexDirection: "row", gap: 4, marginTop: 4 }}>
        {[5, 4, 3, 2, 1].map((mn) => {
          const on = sec / 60 <= mn && activo;
          return (
            <View
              key={mn}
              style={{ width: 32, height: 4, backgroundColor: on ? col : c.border }}
            />
          );
        })}
      </View>
    </View>
  );
}

// =============================================================================
// 4 · SHIFT BADGE — pill con icono direccional y grados
// =============================================================================
export function ShiftBadge({
  tipo,
  grados,
}: {
  tipo: "lift" | "header";
  grados: number;
}) {
  const c = useColores();
  const color = tipo === "lift" ? c.lift : c.header;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: color + "22",
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
    >
      <Svg width={14} height={14} viewBox="0 0 24 24">
        {tipo === "lift" ? (
          <>
            <Path d="M12 5v14" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
            <Path d="m6 11 6-6 6 6" stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            <Path d="M12 19V5" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
            <Path d="m6 13 6 6 6-6" stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </>
        )}
      </Svg>
      <Text style={[estiloLabel, { color, fontSize: 11 }]}>{tipo.toUpperCase()}</Text>
      <Text style={[fuenteNum, { color, fontSize: 16 }]}>{grados}°</Text>
    </View>
  );
}

// =============================================================================
// 5 · BOYA MARKER — pin geográfico tipado
// =============================================================================
type TipoBoya = "committee" | "pin" | "windward" | "leeward" | "gate" | "custom";

const BOYA_COLOR: Record<TipoBoya, keyof Colores> = {
  committee: "bCommittee",
  pin:       "bPin",
  windward:  "bWindward",
  leeward:   "bLeeward",
  gate:      "bGate",
  custom:    "text3",
};
const BOYA_LETRA: Record<TipoBoya, string> = {
  committee: "C", pin: "P", windward: "W", leeward: "L", gate: "G", custom: "•",
};

export function Boya({ tipo, tamaño = 32 }: { tipo: TipoBoya; tamaño?: number }) {
  const c = useColores();
  const color = c[BOYA_COLOR[tipo]];
  return (
    <View style={{ width: tamaño, height: tamaño * 1.17, alignItems: "center" }}>
      <Svg width={tamaño} height={tamaño * 1.17} viewBox="0 0 36 42">
        <Path
          d="M18 0 C 8 0, 0 7, 0 17 C 0 27, 12 35, 18 42 C 24 35, 36 27, 36 17 C 36 7, 28 0, 18 0 Z"
          fill={color}
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="1"
        />
        <Circle cx="18" cy="17" r="8.5" fill="rgba(0,0,0,0.18)" />
      </Svg>
      <Text
        style={[
          fuenteNumGigante,
          {
            position: "absolute",
            top: tamaño * 0.22,
            color: "#fff",
            fontSize: tamaño * 0.42,
          },
        ]}
      >
        {BOYA_LETRA[tipo]}
      </Text>
    </View>
  );
}

// =============================================================================
// 6 · DATA PILL — chip pequeño con label + valor
// =============================================================================
export function DataPill({
  label,
  valor,
  color,
}: {
  label: string;
  valor: string;
  color?: string;
}) {
  const c = useColores();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: c.surface2,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}
    >
      <Text
        style={[
          estiloLabel,
          { color: c.text3, fontSize: 9, letterSpacing: 0.8 },
        ]}
      >
        {label}
      </Text>
      <Text style={[fuenteNum, { color: color ?? c.text, fontSize: 12 }]}>
        {valor}
      </Text>
    </View>
  );
}

// =============================================================================
// 7 · ALERT BANNER
// =============================================================================
type AlertKind = "danger" | "warn" | "info" | "success";

export function AlertBanner({
  kind,
  titulo,
  cuerpo,
}: {
  kind: AlertKind;
  titulo: string;
  cuerpo?: string;
}) {
  const c = useColores();
  const map: Record<AlertKind, { color: string }> = {
    danger:  { color: c.header },
    warn:    { color: c.warn },
    info:    { color: c.accent },
    success: { color: c.lift },
  };
  const k = map[kind];
  return (
    <View
      style={{
        backgroundColor: k.color + "1A",
        borderLeftWidth: 3,
        borderLeftColor: k.color,
        padding: 12,
        flexDirection: "row",
        gap: 10,
      }}
    >
      <Svg width={18} height={18} viewBox="0 0 24 24" style={{ marginTop: 2 }}>
        <Path d="M12 3 L2 21h20z" fill="none" stroke={k.color} strokeWidth="2" strokeLinejoin="round" />
        <Path d="M12 10v4" stroke={k.color} strokeWidth="2" strokeLinecap="round" />
        <Circle cx="12" cy="17.5" r="0.8" fill={k.color} />
      </Svg>
      <View style={{ flex: 1 }}>
        <Text style={[estiloLabel, { color: k.color }]}>{titulo}</Text>
        {cuerpo && (
          <Text style={[fuenteUI, { color: c.text, fontSize: 13, marginTop: 4 }]}>
            {cuerpo}
          </Text>
        )}
      </View>
    </View>
  );
}

// =============================================================================
// 8 · ACTION BUTTON
// =============================================================================
type Variante = "primary" | "secondary" | "danger" | "ghost";

export function ActionButton({
  variante = "primary",
  onPress,
  children,
  grande = false,
  icono,
}: {
  variante?: Variante;
  onPress?: () => void;
  children: React.ReactNode;
  grande?: boolean;
  icono?: React.ReactNode;
}) {
  const c = useColores();
  const esDeck = useEsDeck();

  const map: Record<Variante, { bg: string; fg: string; borde?: string }> = {
    primary:   { bg: esDeck ? c.accent : c.navy, fg: esDeck ? c.bg : "#FFFFFF" },
    secondary: { bg: c.surface, fg: c.text, borde: c.border2 },
    danger:    { bg: c.header, fg: esDeck ? c.bg : "#FFFFFF" },
    ghost:     { bg: "transparent", fg: c.text2 },
  };
  const v = map[variante];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: v.bg,
        borderWidth: v.borde ? 1.5 : 0,
        borderColor: v.borde,
        paddingHorizontal: grande ? 24 : 18,
        paddingVertical: grande ? 18 : 12,
        minHeight: grande ? 56 : 48,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {icono}
      <Text
        style={[
          fuenteUIBold,
          {
            color: v.fg,
            fontSize: grande ? 16 : 13,
            letterSpacing: 0.6,
            textTransform: "uppercase",
          },
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

// =============================================================================
// 9 · LAYER TOGGLE (botón flotante para mapa)
// =============================================================================
export function LayerToggle({
  icono,
  label,
  activo,
  onPress,
}: {
  icono: React.ReactNode;
  label: string;
  activo: boolean;
  onPress: () => void;
}) {
  const c = useColores();
  const esDeck = useEsDeck();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        backgroundColor: activo ? c.accent : c.surface,
        borderWidth: 1,
        borderColor: activo ? c.accent : c.border,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {icono}
      <Text
        style={[
          fuenteUIBold,
          {
            color: activo ? (esDeck ? c.bg : "#FFFFFF") : c.text2,
            fontSize: 12,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// =============================================================================
// 10 · TAB BAR — barra inferior de navegación
// =============================================================================
type Tab = { id: string; label: string; href: string; icono: React.ReactNode };

export function TabBar({
  tabs,
  activeId,
  onNav,
}: {
  tabs: Tab[];
  activeId: string;
  onNav: (id: string, href: string) => void;
}) {
  const c = useColores();
  return (
    <View
      style={{
        backgroundColor: c.surface,
        borderTopWidth: 1,
        borderTopColor: c.border,
        paddingTop: 8,
        paddingBottom: 28, // safe area
        paddingHorizontal: 4,
        flexDirection: "row",
      }}
    >
      {tabs.map((t) => {
        const isActive = t.id === activeId;
        return (
          <Pressable
            key={t.id}
            onPress={() => onNav(t.id, t.href)}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: "center",
              gap: 4,
              paddingVertical: 6,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            {t.icono}
            <Text
              style={[
                fuenteUIBold,
                { color: isActive ? c.accent : c.text3, fontSize: 10 },
              ]}
            >
              {t.label}
            </Text>
            <View
              style={{
                width: 16,
                height: 2,
                backgroundColor: isActive ? c.accent : "transparent",
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================================
// 11 · SEGMENTED CONTROL
// =============================================================================
export function SegmentedControl({
  opciones,
  activa,
  onChange,
}: {
  opciones: string[];
  activa: number;
  onChange: (i: number) => void;
}) {
  const c = useColores();
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: c.surface2,
        padding: 2,
        gap: 2,
        alignSelf: "flex-start",
      }}
    >
      {opciones.map((o, i) => {
        const on = i === activa;
        return (
          <Pressable
            key={o}
            onPress={() => onChange(i)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              backgroundColor: on ? c.surface : "transparent",
            }}
          >
            <Text
              style={[
                estiloLabel,
                { color: on ? c.text : c.text3, fontSize: 11 },
              ]}
            >
              {o}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================================
// Re-export útil
// =============================================================================
export { Svg, Path, Circle, Polygon, Rect, Line, G, Polyline };
