# NavIA UI Kit — Instrucciones de instalación

Sistema de diseño NavIA en componentes React Native + NativeWind.
Diseñado para regata costera: alto contraste bajo sol, números heroicos,
modo cubierta (deck) y modo en tierra (light).

---

## 📦 Contenido

```
repo-files/
├── lib/
│   └── tema.ts                       ← Store Zustand (modo deck/light)
├── features/
│   └── ui/
│       ├── colores.ts                ← Tokens hex de la paleta
│       ├── index.tsx                 ← Todos los componentes
│       └── Wordmark.tsx              ← Logo NAVIA
├── app/
│   └── regata.tsx.example            ← Ejemplo de pantalla migrada
└── tailwind.config.diff.js           ← DIFF a aplicar sobre tu config
```

---

## 🚀 Instalación paso a paso

### 1. Clonar y copiar archivos

Desde la carpeta de tu repo NavIA:

```bash
git checkout -b design/sistema-navia

# Copiar archivos del kit (asumí que descargaste o tenés acceso al folder repo-files/)
cp repo-files/lib/tema.ts                lib/tema.ts
mkdir -p features/ui
cp repo-files/features/ui/colores.ts     features/ui/colores.ts
cp repo-files/features/ui/index.tsx      features/ui/index.tsx
cp repo-files/features/ui/Wordmark.tsx   features/ui/Wordmark.tsx
```

### 2. Instalar dependencias faltantes

`react-native-svg` ya viene con Expo pero verificá:

```bash
npx expo install react-native-svg @react-native-async-storage/async-storage zustand expo-font
```

### 3. Aplicar el diff a `tailwind.config.js`

Abrí `tailwind.config.js` y dentro del bloque `theme.extend` agregá las
claves de `repo-files/tailwind.config.diff.js`. **No reemplaces todo el archivo
— mezclá con el que ya tenés.** Conservá tu escala `mar`.

### 4. Instalar las fuentes

Descargá los TTF y dejá en `assets/fonts/`:

- [Inter-Regular.ttf](https://fonts.google.com/specimen/Inter)
- Inter-Medium.ttf
- Inter-Bold.ttf
- [JetBrainsMono-Bold.ttf](https://fonts.google.com/specimen/JetBrains+Mono)
- JetBrainsMono-ExtraBold.ttf

Cargalas en `app/_layout.tsx` antes del primer render:

```tsx
import { useFonts } from "expo-font";

export default function RootLayout() {
  const [loaded] = useFonts({
    "Inter-Regular":           require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium":            require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-Bold":              require("../assets/fonts/Inter-Bold.ttf"),
    "JetBrainsMono-Bold":      require("../assets/fonts/JetBrainsMono-Bold.ttf"),
    "JetBrainsMono-ExtraBold": require("../assets/fonts/JetBrainsMono-ExtraBold.ttf"),
  });
  if (!loaded) return null;
  // ... resto del layout
}
```

### 5. Probar el modo deck/light

En cualquier pantalla:

```tsx
import { useTema, useColores } from "@/lib/tema";

const alternar = useTema((s) => s.alternar);
const c = useColores();

<View style={{ backgroundColor: c.bg }}>
  <Pressable onPress={alternar}>
    <Text style={{ color: c.text }}>Alternar modo</Text>
  </Pressable>
</View>
```

### 6. Migrar una pantalla de ejemplo

Mirá `app/regata.tsx.example` — es una versión completa de tu pantalla
de regata reescrita con el kit. Comparalo con tu archivo actual y migrá
las secciones que te sirvan.

Renombralo a `app/regata.tsx` solo cuando estés listo para reemplazar.

---

## 🎨 Cómo usar el kit

Importá desde un solo punto:

```tsx
import {
  MetricCard,
  TimerHero,
  ShiftBadge,
  Boya,
  DataPill,
  AlertBanner,
  ActionButton,
  LayerToggle,
  TabBar,
  SegmentedControl,
  fuenteNum,
  fuenteNumGigante,
  estiloLabel,
} from "@/features/ui";
import { Wordmark } from "@/features/ui/Wordmark";
import { useColores, useTema, useEsDeck } from "@/lib/tema";
```

### Ejemplos rápidos

**Métrica grande (SOG):**
```tsx
<MetricCard label="SOG" valor="6.8" unidad="nudos" tamaño="hero" />
```

**Race timer:**
```tsx
<TimerHero tiempoMs={273000} fase="prep" />
```

**Boya tipada:**
```tsx
<Boya tipo="windward" tamaño={32} />
```

**Alerta OCS:**
```tsx
<AlertBanner
  kind="danger"
  titulo="OCS — REGRESA"
  cuerpo="Cruzaste la línea hace 2 segundos."
/>
```

**Botón primario:**
```tsx
<ActionButton variante="primary" grande onPress={iniciar}>
  Iniciar regata
</ActionButton>
```

---

## 📐 Reglas del sistema (recordatorio)

1. **Números siempre en `fuenteNum` o `fuenteNumGigante`** — tabular-nums
   para que los dígitos no salten cuando cambian.
2. **Touch targets mínimo 48 px** — dedos mojados, barco escorado.
3. **Botones críticos 56-64 px** — marcar boya, stop tracking.
4. **Modo deck = alto contraste bajo sol**. No es "dark mode bonito".
5. **Sin sombras en deck mode** — reemplazar por borde 1 px.
6. **Sin fuentes weight < 400** — texto delgado bajo sol es invisible.
7. **Color por semántica**: verde = lift/bueno, rojo coral = header/OCS,
   ámbar = warning, cyan = info/marca.

---

## ⚙️ Próximos pasos sugeridos

Una vez instalado el kit, migrá las pantallas en este orden:

1. ✅ `app/_layout.tsx` — root + carga de fuentes + tema
2. ⏭ `app/regata.tsx` — la más visible (mirá el `.example`)
3. ⏭ `app/tactica.tsx` — incorporar visualización schemática de línea
4. ⏭ `app/mapa.tsx` — layer toggles flotantes + FAB de marcar boya
5. ⏭ `app/index.tsx` — grid 2×2 de acciones + atmósfera
6. ⏭ `app/bitacora/*` — lista con mini-track + detalle modal

Cada pantalla debería tomar 30-60 min de migración una vez que el kit
esté instalado. El cambio se ve mucho con poco código.

---

## 🐛 Troubleshooting

**“No se cargan las fuentes”**
→ Verificá que `useFonts` esté en el `_layout.tsx` raíz y que `return null`
mientras cargan. Si usás `SplashScreen.preventAutoHideAsync()`, llamá a
`hideAsync()` después de `loaded`.

**“react-native-svg no renderiza”**
→ Para iOS, `cd ios && pod install` después del `expo install`.

**“El modo no se persiste”**
→ Asegurate de tener `@react-native-async-storage/async-storage` instalado
y linkeado. Es la dependencia que usa Zustand para persistir.

**“Las clases Tailwind no aplican”**
→ Revisá que el archivo del kit esté incluido en `content` de tu
`tailwind.config.js`:

```js
content: [
  "./app/**/*.{js,jsx,ts,tsx}",
  "./features/**/*.{js,jsx,ts,tsx}",
  "./lib/**/*.{js,jsx,ts,tsx}",
]
```

---

¡Listo para regatear con UI seria! 🌊
