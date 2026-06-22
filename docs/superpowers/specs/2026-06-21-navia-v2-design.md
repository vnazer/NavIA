# NavIA v2 — Mejoras web + app watchOS para Laser/ILCA

**Fecha:** 2026-06-21
**Branch:** `feat/navia-v2-laser-watch`
**Spec de diseño** — entrada para `writing-plans`.

---

## 1. Contexto y estado inicial

`vnazer/NavIA` (main) es una app Expo SDK 52 + Expo Router v4 (web + iOS) de
apoyo táctico para regatas de vela en la costa central de Chile. Estado actual
relevante para este spec:

- **Ya existe y funciona:** `calcularVMG`, `calcularLayline`, `detectarShift`,
  `interpolarPolar`, cronómetro de regata completo (hook + store + fases + voz),
  starting bias (`calcularFavoredEnd`, distance-to-line, time-to-burn).
- **Parcial:** solo existe polar de **ILCA 7** (falta ILCA 4 y 6).
- **Existe pero es mínimo:** target `ios/NavIAWatch/` Swift/SwiftUI con 3 views
  (Timer, Telemetry, Tactica) + `GPSManager`.
- **Falta totalmente:** paquetes `@navia/*` compartidos, tests (cero archivos
  `*.test.ts`, sin Jest), funcionalidades Laser avanzadas (banda activa auto,
  beat target, modo entreno, wakeshed), complications/haptics/WatchConnectivity
  del watch, deploy a Hostinger por SSH, y carpeta `/docs`.
- **Hay 16 archivos modificados sin commitear** en `main` (package.json,
  package-lock.json, project.pbxproj, icono, 8 .tsx).

El prompt original describe este trabajo como un solo mega-PR. Esto se
**descompone en 5 fases** (cada una con su spec → plan → commit atómico), bajo
una única branch `feat/navia-v2-laser-watch` y un PR draft que se marca ready al
final.

---

## 2. Decisiones tomadas en brainstorming

| Decisión | Elegida |
|---|---|
| Alcance | Todo, por fases (1→5) |
| Git previo | Stash de los 16 archivos locales en branch `wip/local-changes`, `main` limpio |
| Estructura | npm workspaces (`packages/*`) |
| Polares ILCA 4/6 | Datos publicados de la clase, fuente documentada |
| watchOS | Ampliar target Swift existente (Opción A del prompt) |
| Deploy | Workflow SSH nuevo `deploy-hostinger.yml` (sin tocar el actual) |
| Tests | Jest + ts-jest en los paquetes, cobertura ≥80% en `nav-utils`/`polars` |

El usuario delegó las decisiones de detalle ("haz lo que recomiendes") salvo en
el alcance general y la estructura de git.

---

## 3. Arquitectura objetivo

```
NavIA/
├── package.json              ← root, npm workspaces
├── packages/
│   ├── shared-types/         ← tipos TS puros (Regata, Sesion, LecturaSensor,
│   │                            ConfiguracionUsuario, PuntoTrack, Polar, Boya…)
│   ├── polars/               ← data/ilca4.ts, ilca6.ts, ilca7.ts +
│   │                            getPolarTarget(rig, twa, tws, condicion)
│   └── nav-utils/            ← funciones puras testeadas
├── app/                      ← Expo Router (rutas sin cambios)
├── features/                 ← Expo app (consume @navia/* por workspace)
├── lib/, components/
├── ios/
│   └── NavIAWatch/           ← target Swift ampliado a 5 views + Complications/
│   │                            + Managers (Haptics, Motion, Barometer, Health,
│   │                            WatchSync) + Models (Polar, Nautica, WindSnapshot)
├── docs/                     ← nueva carpeta (6 archivos + este spec)
└── .github/workflows/
    ├── deploy-web-build.yml  ← actual (publica branch web-build), intacto
    └── deploy-hostinger.yml  ← nuevo (SSH a public_html)
```

### Reglas de dependencia (estrictas)

- `shared-types` → no depende de nada.
- `polars` → depende de `shared-types`.
- `nav-utils` → depende de `shared-types` + `polars`.
- `app/`, `features/`, `lib/` (Expo) → consumen los tres vía
  `"@navia/xxx": "*"` en npm workspaces.
- `ios/NavIAWatch` → **no comparte código TS**. Reimplementa los cálculos en
  Swift (funciones puras pequeñas) para no acoplar el binario del reloj a
  Metro/bundler.

### Estrategia de migración (sin romper nada)

Mover código existente de `features/polar/lib/` y `features/regata/lib/` a
`packages/*`. Dejar **re-exports** en los paths originales
(`export * from '@navia/nav-utils'`) durante una release para que ningún import
de la app se rompa. Al final de la Fase 1 se limpian los re-exports y los
imports de la app migran al alias `@navia/*`.

---

## 4. FASE 1 — Paquetes compartidos + tests + ILCA 4/6

### 4.1 `packages/shared-types` (puro TS, sin runtime)

Migrar tipos de dominio ya existentes desde `features/regata/types.ts`,
`features/polar/types.ts`, `features/boyas/types.ts`. Añadir los del prompt:

- `ConfiguracionUsuario`: rig preferido (`'ilca4'|'ilca6'|'ilca7'`), club,
  polar seleccionada, unidades (`'imperial'|'metrico'`).
- `LecturaSensor`: `{ ts, lat, lon, sogKts, cogGrados, twd?, tws?, hr?, presionHpa? }`.
- Consolidar `Regata`/`Sesion` (existe `Sesion`; se enriquece con `config`).
- Re-exportar los ya existentes: `PuntoTrack`, `Rendimiento`, `Polar`, `Barco`,
  `Boya`.

Entrada: `src/index.ts`.

### 4.2 `packages/polars`

- `data/ilca7.ts`: migrado del existente (referencia canónica).
- `data/ilca4.ts` y `data/ilca6.ts`: **datos publicados** de la clase ILCA.
  - ILCA 4 = vela 4.7 m² (ex Laser 4.7 / Radial 4.7).
  - ILCA 6 = vela 5.76 m² (ex Laser Radial).
  - ILCA 7 = vela 7.06 m² (ex Laser Standard), ya existe.
  - Mismo formato que `ilca7.ts` (matriz TWS × TWA → BSP).
  - **Fuente concreta a buscar en la fase de plan:** tablas polares
    publicadas (ej. ilca.org, manuales de la clase, VPP comunitarios como
    PolarView/xcbot). Se documenta URL y fecha de descarga en `docs/POLARES.md`.
    Si no se halla una fuente autoritativa para 4/6, se cae al escalado desde
    ILCA 7 por área de vela con TODO de reemplazo (decisión del plan).
- `getPolarTarget(rig, twa, tws, condicion)`:
  - `rig: 'ilca4'|'ilca6'|'ilca7'`
  - `condicion: 'plana'|'ola'|'media'` aplica factor a BSP
    (`plana` 1.0, `media` 0.95, `ola` 0.85).
  - Internamente usa `interpolarPolar` de `nav-utils`.

### 4.3 `packages/nav-utils` (funciones puras, todas testeadas)

| Función | Origen | Notas |
|---|---|---|
| `calcularVMG(twa, bsp)` | `polar/lib/calculos.ts` | Mover + firmas upwind/downwind |
| `interpolarPolar(polar, tws, twa)` | `polar/lib/interpolacion.ts` | Mover |
| `calcularLayline(marca, twd, ota, dist)` | `regata/lib/laylines.ts` | Mover, renombrar singular |
| `detectarShift(puntos, umbral)` | `regata/lib/windShifts.ts` | Mover, renombrar `detectarShifts`→`detectarShift` |
| `calcularStartingBias(committee, pin, twd)` | `regata/lib/geometria-linea.ts` | Mover `calcularFavoredEnd` + añadir `biasGrados` y recomendación textual |
| `shiftDesdeSesion`, `otaOptima`, `deltaAngular` | existentes | Mover |

### 4.4 Re-exports backward-compat

`features/polar/lib/calculos.ts`,
`features/regata/lib/{windShifts,laylines,calculosNavegacion,geometria-linea}.ts`
quedan como re-exports para no romper imports de la app:

- `export * from '@navia/nav-utils'` para funciones con mismo nombre.
- Mapeo explícito para las renombradas: `features/regata/lib/windShifts.ts`
  exporta `export { detectarShift as detectarShifts } from '@navia/nav-utils'`.

Se limpia al final de la fase migrando los imports de la app al alias
`@navia/nav-utils`.

### 4.5 Tests (Jest + ts-jest, ≥80% en `nav-utils` y `polars`)

- `jest.config.ts` por paquete.
- Cobertura: interpolación esquinas/bordes, VMG signo, laylines estribor/babor,
  detección de shift con series sintéticas (veer/back/estable), starting bias
  con líneas sesgadas, `getPolarTarget` con condiciones.
- Snapshot de los datos ILCA 4/6/7 para detectar regresión.
- `npm test --workspaces` corre todos desde la raíz.

### 4.6 Selector de rig en la app

Ampliar `features/polar/data/barcos.ts` con `ilca4` e `ilca6`.
`SelectorBarco.tsx` ya los muestra automáticamente.

### 4.7 Configuración npm workspaces

`package.json` raíz añade:

```json
"workspaces": ["packages/*"],
"scripts": {
  "test": "npm test --workspaces",
  "build:web": "npx expo export --platform web"
}
```

`tsconfig.json` raíz con paths:

```json
"paths": {
  "@navia/shared-types": ["./packages/shared-types/src"],
  "@navia/polars": ["./packages/polars/src"],
  "@navia/nav-utils": ["./packages/nav-utils/src"]
}
```

Cada `packages/*/package.json` con `"name": "@navia/xxx"`, `"main": "src/index.ts"`.

---

## 5. FASE 2 — Funcionalidades Laser faltantes

Todo en `packages/nav-utils`, funciones puras testeables, consumidas por la app
Expo y replicadas en Swift para el watch.

1. **Banda activa auto-detección** — `calcularBandaActiva(cog, twd)` →
   `{ banda: 'babor'|'estribor', amura: number }`. Lógica: `amura = |deltaAngular(twd, cog)|`,
   signo decide banda.

2. **Starting bias completo** — ampliar `calcularStartingBias` con
   `biasGrados` (ángulo línea vs perpendicular al viento) + recomendación
   textual (`"Pin favorecido, salí por el pin"`).

3. **Beat target** — `calcularBeatTarget(marca, posBarco, twd, polar, tws)` →
   `{ distanciaMt, laylineCercana: 'estribor'|'babor', tacksEstimados }`.
   Usa `calcularLayline` + proyección de posición sobre layline más cercana.

4. **Modo entreno** — `EntrenamientoTracker` (clase con estado, la única no
   pura de nav-utils): `registrarTack(ts, tipo)` acumula; `resumen()` →
   `{ viradasPorMinuto, tiempoMedioBordadaS, pctBabor, pctEstribor }`.

5. **Velas de cierre (wakeshed)** — `calcularWakeshed(miPos, miHeading,
   rivalPos, twd)` → `{ tapaViento: boolean, distanciaMt, anguloRival }`.
   Cono de 2-3 largos a sotavento del rival, ~30° por lado.

**Integración app Expo:** nuevas cards en `app/regata.tsx`:
`PanelBandaActiva`, `PanelBeatTarget`, `PanelEntrenamiento`, `PanelWakeshed`.
La selección de rig en la app controla qué polar alimenta todos estos cálculos.

---

## 6. FASE 3 — watchOS completo

Sobre el target `NavIAWatch` Swift existente.

### 6.1 Estructura nueva en `ios/NavIAWatch/`

```
NavIAWatch/
├── NavIAWatchApp.swift            ← @main (existe)
├── Managers/
│   ├── GPSManager.swift           ← existe, ampliar
│   ├── MotionManager.swift        ← NUEVO CMMotionManager (tacks/gybes)
│   ├── BarometerManager.swift     ← NUEVO CMAltimeter (presión local)
│   ├── HapticsManager.swift       ← NUEVO singleton (WKInterfaceDevice.play)
│   ├── HealthManager.swift        ← NUEVO HKHealthStore HR opcional
│   └── WatchSyncManager.swift     ← NUEVO WCSession con iPhone
├── Models/
│   ├── Polar.swift                ← NUEVO: polar ILCA en Swift
│   ├── Nautica.swift              ← NUEVO: réplicas Swift de nav-utils
│   └── WindSnapshot.swift         ← NUEVO: struct viento + forecast cacheado
├── Views/
│   ├── MainTabView.swift          ← existe, 5 tabs swipe
│   ├── VientoAhoraView.swift      ← NUEVO P1
│   ├── ShiftView.swift            ← NUEVO P2
│   ├── CronometroRegataView.swift ← NUEVO P3 (amplía TimerView)
│   ├── HeadingVMGView.swift       ← NUEVO P4 (amplía TelemetryView)
│   └── LaylineView.swift          ← NUEVO P5
├── Complications/                 ← NUEVO
│   ├── VientoComplication.swift
│   ├── TimerRegataComplication.swift
│   ├── PresionComplication.swift
│   └── ShiftComplication.swift
└── Assets.xcassets/
```

`TimerView.swift`, `TelemetryView.swift`, `TacticaView.swift` migran/refactorizan
hacia los nuevos P3/P4/P2 respectivamente.

### 6.2 Las 5 pantallas glance (especificación del prompt)

- **P1 VientoAhora:** velocidad 56pt bold, flecha cardinal rotada, rachas, fondo
  por Beaufort (verde ≤F3, amarillo F4-5, rojo ≥F6).
- **P2 Shift:** TWD grande, ▲ verde/▼ roja, Δ° vs promedio 5min, haptics
  automáticos >8° (1 toque header, 2 lift).
- **P3 CronometroRegata:** MM:SS bold, color amarillo/verde/rojo por fase,
  digital crown ±1min, botón lateral Start/Stop/Sync, haptics fuertes en
  1:00/0:30/0:10/0:00.
- **P4 HeadingVMG:** heading magnético arriba, VMG actual + ▲/▼ vs polar
  objetivo, banda activa ⬅/➡ auto-detectada.
- **P5 Layline:** distancia a layline en metros, flecha ←/→ "ya puede virar",
  color por proximidad.

### 6.3 Sensores

`CLLocationManager` (GPS `kCLLocationAccuracyBestForNavigation` + bg location),
`CMMotionManager` (tacks/gybes por umbral angular+aceleración), `CMAltimeter`
(presión), `HKHealthStore` (HR opcional).

### 6.4 WatchConnectivity (WatchSyncManager + PhoneSyncManager)

- iPhone→Watch: configuración (rig, club, regata, polar seleccionada) vía
  `transferUserInfo`.
- Watch→iPhone: track GPS, eventos detectados, sesión de regata vía
  `transferUserInfo`/`sendMessage`.
- `PhoneSyncManager` vive en el target iOS principal (módulo nativo Expo).

### 6.5 Offline-first

Polares ILCA embebidas en bundle Swift (JSON en Assets), último forecast
cacheado con timestamp de validez (aviso si stale), configuración de regata en
UserDefaults. Cálculos 100% locales. Sync en background cuando hay iPhone cerca.

### 6.6 Límite de verificación en este entorno

No puedo ejecutar Xcode/simulador Watch ni haptics reales aquí. Verifico
sintaxis con `swiftc`/`xcodebuild` si Xcode está instalado; si no, revisión
manual. **La validación visual y de haptics queda como paso manual del usuario**
— documentado en `docs/WATCH_APP.md`.

---

## 7. FASE 4 — Deploy Hostinger (CI/CD)

### 7.1 Workflow nuevo `.github/workflows/deploy-hostinger.yml`

**Sin tocar** `deploy-web-build.yml`. Trigger: push a `main` + `workflow_dispatch`.

Steps:
1. checkout, setup Node 20, `npm install --legacy-peer-deps`.
2. `npm test --workspaces` (Jest paquetes). Al principio de la Fase 4 los tests
   aún pueden estar en progreso → el step lleva `continue-on-error: true`;
   una vez consolidada la Fase 1 se quita ese flag y pasa a ser bloqueante.
3. `npx expo export --platform web` → `dist/` con `.htaccess` (mismo patrón actual).
4. **Backup en servidor** vía SSH: `cp -r public_html public_html.backup.$(date +%Y%m%d)`.
5. **Upload** vía `appleboy/scp-action`: `dist/` → `${{ secrets.HOSTINGER_PATH }}`.
6. **Permisos** vía SSH: dirs 755, archivos 644.
7. **Validar** `.htaccess` SPA rewrite.

### 7.2 Secrets necesarios

`HOSTINGER_HOST`, `HOSTINGER_USER`, `HOSTINGER_SSH_KEY` (private key),
`HOSTINGER_PATH`, y `EXPO_PUBLIC_AISSTREAM_API_KEY` (ya existe como `API`).
Documentados en `docs/DEPLOYMENT.md`.

### 7.3 Límite honesto del deploy en este entorno

**No puedo ejecutar el deploy real a `navia.magama.cloud`** yo: necesito los
secrets de Hostinger del usuario, y no hay MCP Hostinger conectado en este
entorno. Lo que sí hago completo:

- Workflow CI/CD escrito y funcional.
- `expo export --platform web` ejecutado localmente, verificando que builddea.
- `.htaccess` SPA rewrite, scripts de backup/permisos.
- Toda la documentación.

El deploy real a producción requiere que el usuario conecte los secrets y de
merge a `main` (el workflow se dispara solo). Adicionalmente, **deploy es Fase 4
de 5** — antes de que tenga sentido deployar la "v2", Fases 1-3 deben existir.
Hoy `main` ya deploya vía el workflow existente; no hay nada nuevo que subir.

---

## 8. FASE 5 — Documentación `/docs`

1. `docs/ARQUITECTURA.md` — diagrama componentes (monorepo + Expo app + watch +
   flujos de datos).
2. `docs/MCP_SETUP.md` — configuración de MCPs (GitHub, Hostinger, Playwright,
   browser, ios/android sim). Documento los que no existen como tal con la mejor
   alternativa real disponible.
3. `docs/WATCH_APP.md` — guía de la app watchOS para usuarios Laser.
4. `docs/DEPLOYMENT.md` — runbook deploy Hostinger (secrets, manual y CI/CD,
   rollback con el backup).
5. `docs/POLARES.md` — formato de datos polares + fuente ILCA 4/6/7.
6. `README.md` actualizado — setup local, monorepo, watch en simulador, tests.

---

## 9. Plan de PRs y commits

Branch única `feat/navia-v2-laser-watch`, PR draft desde el inicio, ready al
finalizar. Título final del PR:
**"feat: NavIA v2 — mejoras web + app watchOS para Laser/ILCA"**.

Commits atómicos (Conventional Commits) por fase:

- `chore(git): stash local changes en wip, main limpio` (paso 0)
- `feat(nav-utils): extraer paquetes compartidos + tests + ILCA 4/6` (Fase 1)
- `feat(tactica): banda activa, beat target, modo entreno, wakeshed` (Fase 2)
- `feat(watch): 5 pantallas glance, complications, haptics, WatchConnectivity` (Fase 3)
- `ci(deploy): workflow deploy-hostinger por SSH` (Fase 4)
- `docs: arquitectura, mcp, watch, deployment, polares` (Fase 5)
- `docs(readme): setup local, monorepo, tests, watch` (Fase 5)

---

## 10. Criterios de aceptación

Mapeo del prompt original a verificación realista:

- [ ] App web builddea con `npx expo export --platform web` (verificable aquí).
- [ ] PWA manifest válido (verificable aquí).
- [ ] App watchOS compila con `xcodebuild -scheme NavIAWatch` si Xcode está
      disponible; si no, revisión manual de Swift.
- [ ] Las 5 pantallas glance implementadas en Swift (código escrito).
- [ ] HapticsManager con `.success`/`.warning`/`.retry`/`.notification`
      implementado (código escrito; **validación táctil manual del usuario**).
- [ ] Cálculos (VMG, layline, shift) pasan Jest con ≥80% cobertura en
      `nav-utils`/`polars` (verificable aquí).
- [ ] Modo offline del watch: datos embebidos + cálculos locales (código).
- [ ] Complications implementadas (código Swift; **validación en simulador
      manual del usuario**).
- [ ] PR abierto con todos los commits (verificable aquí vía `gh`).
- [ ] CI verde en el PR (verificable aquí tras push).
- [ ] Workflow `deploy-hostinger.yml` escrito y funcional; **deploy real a
      `navia.magama.cloud` requiere secrets del usuario**.
- [ ] Documentación completa en `/docs`.

---

## 11. Restricciones

- Idioma español (Chile) en toda la UI nueva.
- Backwards-compatible: no romper funcionalidad existente.
- Respetar estructura de carpetas y convenciones actuales.
- Commits atómicos, Conventional Commits.
- Si algún MCP del prompt no existe, documentar alternativa real.
