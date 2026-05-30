# Migración al sistema de diseño NavIA

En la carpeta `_design-system/` de la raíz del repo hay un kit de UI nuevo
y referencias visuales. Tu trabajo es integrarlo al codebase Expo + RN +
NativeWind existente, en commits pequeños y verificables.

## Materiales

- `_design-system/repo-files/` → archivos del kit (TypeScript + RN listo)
- `_design-system/NavIA Design System.html` → tokens, paleta, type, componentes (abrir en navegador para referencia visual)
- `_design-system/NavIA Prototipo.html` → 5 pantallas interactivas, fuente de verdad visual
- `_design-system/repo-files/README.md` → instrucciones técnicas del kit
- `_design-system/repo-files/tailwind.config.diff.js` → tokens a sumar a Tailwind
- `_design-system/repo-files/app/regata.tsx.example` → cómo migrar una pantalla

## Restricciones críticas

1. **Idioma:** todo el código nuevo y existente debe estar en **español
   neutro** (forma "tú"). NO usar argentinismos ("dale", "vos", "tenés",
   "iniciá", "regresá", "considerá", "verificá", "andá", "fijate"). Si encontrás
   argentinismos en código existente, reemplazalos.
2. **No reescribir lógica de negocio.** Stores Zustand, hooks (useTrackingGPS,
   useRaceTimer, calcularRendimiento, etc.) se mantienen iguales. Solo
   cambia el JSX/styling de las pantallas.
3. **Modo deck por defecto** — la app arranca en modo cubierta (alto
   contraste). El toggle queda en `/configuracion`.
4. **Touch targets mínimo 48 px**, críticos 56–64 px.
5. **Sin sombras en deck mode** — usar borde 1 px en su lugar.
6. **Verificá entre pasos** con `npx tsc --noEmit` y el linter del repo
   si existe. Si algo rompe, arreglalo antes de seguir.
7. **Un commit por paso.** No mezcles pasos.

## Plan de ejecución

### Paso 1 — Instalar el kit
**Commit:** `feat(ui): kit de diseño NavIA`

- Copiar `_design-system/repo-files/lib/tema.ts` → `lib/tema.ts`
- Copiar `_design-system/repo-files/features/ui/colores.ts` → `features/ui/colores.ts`
- Copiar `_design-system/repo-files/features/ui/index.tsx` → `features/ui/index.tsx`
- Copiar `_design-system/repo-files/features/ui/Wordmark.tsx` → `features/ui/Wordmark.tsx`
- Instalar dependencias faltantes:
  ```
  npx expo install react-native-svg @react-native-async-storage/async-storage zustand expo-font
  ```
- Verificar: `npx tsc --noEmit` debe pasar. Los componentes pueden
  referenciar fuentes que aún no están cargadas — ignorá warnings de
  fuente faltante por ahora.

### Paso 2 — Tokens en Tailwind
**Commit:** `feat(ui): tokens de paleta y tipografía`

- Aplicar el contenido de `_design-system/repo-files/tailwind.config.diff.js`
  al `tailwind.config.js` actual. **MEZCLAR, no reemplazar.** Conservar
  la escala `mar` existente.
- Verificar: build no debe romper.

### Paso 3 — Fuentes
**Commit:** `feat(ui): cargar Inter y JetBrains Mono`

- Crear `assets/fonts/` y poner las TTF:
  - Inter-Regular.ttf
  - Inter-Medium.ttf
  - Inter-Bold.ttf
  - JetBrainsMono-Bold.ttf
  - JetBrainsMono-ExtraBold.ttf
- Si no las podés descargar, dejá un README en `assets/fonts/` indicando
  al usuario las URLs (Google Fonts: Inter + JetBrains Mono).
- Modificar `app/_layout.tsx` para usar `useFonts` de `expo-font` y
  bloquear el render hasta que carguen:
  ```tsx
  const [loaded] = useFonts({
    "Inter-Regular":           require("../assets/fonts/Inter-Regular.ttf"),
    "Inter-Medium":            require("../assets/fonts/Inter-Medium.ttf"),
    "Inter-Bold":              require("../assets/fonts/Inter-Bold.ttf"),
    "JetBrainsMono-Bold":      require("../assets/fonts/JetBrainsMono-Bold.ttf"),
    "JetBrainsMono-ExtraBold": require("../assets/fonts/JetBrainsMono-ExtraBold.ttf"),
  });
  if (!loaded) return null;
  ```

### Paso 4 — Pantalla Regata Live
**Commit:** `design(regata): aplicar sistema NavIA`

- Referencia: pantalla "Regata" del `NavIA Prototipo.html` + el archivo
  `_design-system/repo-files/app/regata.tsx.example`.
- Mantener TODOS los hooks y stores existentes intactos.
- Reemplazar solo el JSX:
  - Sub-header con indicador EN VIVO + dot pulsante verde
  - Race timer compacto con `<TimerHero>`
  - SOG hero gigante (110 px, JetBrainsMono-ExtraBold)
  - Row de COG / TWA / Viento con `<MetricCard tamaño="medio">`
  - Wind shift con `<ShiftBadge>`
  - CTA Stop con `<ActionButton variante="danger">`
- Cambio radical visual, comportamiento idéntico.

### Paso 5 — Pantalla Táctica / Prestart
**Commit:** `design(tactica): aplicar sistema NavIA`

- Referencia: pantalla "Táctica" del prototipo.
- DTL hero gigante (96 px), Time-to-burn en card verde grande,
  schemática de línea con SVG (mirá el `<svg viewBox="0 0 340 110">`
  del prototipo).
- Conservar `PanelPrestart`, `PanelWaypoint`, `useTacticaStore`.

### Paso 6 — Pantalla Mapa
**Commit:** `design(mapa): UI flotante sobre cartas`

- Referencia: pantalla "Mapa" del prototipo.
- Layer toggles verticales a la derecha con `<LayerToggle>` (Viento,
  Lluvia, Laylines, AIS, Profundidad).
- FAB rojo de "marcar boya" abajo-derecha (64 px).
- Wind callout flotante arriba-izquierda.
- Bottom sheet con tracking state si está activo.

### Paso 7 — Pantalla Inicio / Home
**Commit:** `design(home): dashboard NavIA`

- Referencia: pantalla "Inicio" del prototipo.
- Grid 2×2 de quick actions, card de condición actual, atmósfera
  (UV/vis/lluvia/presión), card de última sesión.

### Paso 8 — Pantalla Bitácora
**Commit:** `design(bitacora): lista + detalle`

- Lista con mini-track SVG, totales arriba, filtros chip.
- Detalle como modal o ruta separada con mini mapa + stats + botón GPX.

### Paso 9 — TabBar inferior
**Commit:** `design(layout): tab bar inferior`

- Reemplazar la navegación actual por el `<TabBar>` del kit en `app/_layout.tsx`.
- 5 tabs: Inicio, Mapa, Regata, Táctica, Bitácora.

### Paso 10 — Configuración con toggle de modo
**Commit:** `design(config): toggle modo cubierta/tierra`

- En `/configuracion`, agregar el toggle deck/light usando `useTema().alternar`.
- Mostrar las dos opciones como cards grandes tappeables con icono
  (luna para deck, sol para light), tal como aparece en el modal de
  Configuración del prototipo.

### Paso 11 — Limpieza
**Commit:** `chore: remover folder _design-system`

- Borrar `_design-system/` de la raíz.
- Verificar que `npx tsc --noEmit` y la build pasan.

## Después de cada commit

1. `npx tsc --noEmit`
2. Si hay tests: `npm test`
3. Levantar la app: `npx expo start` y verificar visualmente la pantalla migrada
4. Si algo rompe, **arreglá antes de seguir al siguiente paso**
5. Push al branch al final del día

## Reemplazos rápidos válidos (argentinismos → neutro)

- "iniciá" → "inicia"
- "andá" → "ve"
- "fijate" → "fíjate"
- "considerá" → "considera"
- "regresá" → "regresa"
- "verificá" → "verifica"
- "tenés" → "tienes"
- "podés" → "puedes"
- "querés" → "quieres"
- "dale" → "vamos" o eliminar
- "vos sabés" → "sabes"

## Reportá progreso

Al final de cada paso decime:
- ✅ Paso N completado
- Archivos modificados
- Decisiones que tomaste por tu cuenta
- Cualquier cosa que rompiste y arreglaste

## Si tenés dudas

Cuando dudes entre dos opciones de implementación, **siempre priorizá**:
1. Legibilidad bajo sol (alto contraste)
2. Touch targets grandes (48 px+)
3. Comportamiento idéntico al actual

En ese orden. Si una decisión estética compromete legibilidad, descartala.
