# NavIA — Kit de diseño completo

Este folder es **autocontenido**. Pegalo en la raíz de tu repo bajo el
nombre `_design-system/` y dale el archivo `MIGRATION_PROMPT.md` a Claude
Code para que haga toda la migración.

## Contenido

```
_design-system/
├── MIGRATION_PROMPT.md           ← Pegale ESTE a Claude Code
├── README.md                      ← Instrucciones manuales (este archivo y el otro)
├── repo-files/                    ← Solo dejado por compatibilidad; el prompt usa este folder directo
├── NavIA Design System.html       ← Sistema de diseño visual (abrir en navegador)
├── NavIA Prototipo.html           ← Prototipo interactivo de las 5 pantallas
├── ds-*.jsx, proto-*.jsx          ← Source de los HTMLs (no tocar)
├── lib/tema.ts                    ← Store de modo deck/light
├── features/ui/
│   ├── colores.ts                 ← Tokens hex de la paleta
│   ├── index.tsx                  ← Todos los componentes RN
│   └── Wordmark.tsx               ← Logo NAVIA
├── tailwind.config.diff.js        ← DIFF para aplicar a tailwind.config.js
└── app/regata.tsx.example         ← Ejemplo de pantalla migrada (referencia)
```

## Instrucciones rápidas

```bash
# En tu repo NavIA, después de mergear features pendientes:
cd ruta/a/NavIA
git checkout main && git pull
git checkout -b design/sistema-navia

# Descomprimir este zip dentro del repo como _design-system/
unzip ~/Downloads/navia-design-kit.zip -d _design-system/

# Abrir Claude Code en la raíz del repo
claude

# Pegar el contenido de _design-system/MIGRATION_PROMPT.md como primer mensaje
```

Claude Code va a:
1. Leer los HTMLs de referencia
2. Copiar los archivos del kit a su lugar
3. Migrar las pantallas una por una con un commit por paso
4. Verificar con `npx tsc --noEmit` entre pasos
5. Reportarte el progreso

## Si querés migrar a mano

Mirá `_design-system/repo-files/README.md` (versión técnica detallada
con todos los pasos y troubleshooting).

## Materiales visuales

Abrí en tu navegador para ver:
- **`NavIA Design System.html`** — canvas con tokens, componentes y todas
  las pantallas en modo light y deck lado a lado
- **`NavIA Prototipo.html`** — las 5 pantallas funcionando con datos
  simulados en vivo

Estos dos archivos son la **fuente de verdad visual** de la migración.
