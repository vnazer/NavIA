#!/bin/bash
# Compila NavIA en Release (con la app del reloj embebida) y la instala en el
# iPhone conectado por cable. Requiere Apple ID en Xcode → Ajustes → Cuentas.
set -euo pipefail
cd "$(dirname "$0")/../ios"
export LANG=en_US.UTF-8

[ -d Pods ] || pod install

# iPhone físico conectado. Con varios, NAVIA_IPHONE elige por nombre o UDID
# (p. ej. NAVIA_IPHONE="iPhone de Victor"); si no, el modelo más nuevo.
DISPOSITIVO=$(xcrun devicectl list devices --json-output /dev/stdout 2>/dev/null | NAVIA_IPHONE="${NAVIA_IPHONE:-}" python3 -c '
import json, os, re, sys
datos = json.loads(sys.stdin.read() or "{}")
iphones = []
for d in datos.get("result", {}).get("devices", []):
    hw = d.get("hardwareProperties", {})
    if hw.get("platform") == "iOS" and hw.get("reality") == "physical":
        udid = hw.get("udid", d.get("identifier"))
        nombre = d.get("deviceProperties", {}).get("name", "")
        modelo = [int(n) for n in re.findall(r"\d+", hw.get("productType", ""))] or [0]
        iphones.append((modelo, udid, nombre))
pedido = os.environ.get("NAVIA_IPHONE", "")
if pedido:
    iphones = [i for i in iphones if pedido in (i[1], i[2])]
if len(iphones) > 1:
    print("Hay varios iPhone conectados: " + ", ".join(i[2] for i in iphones) + ". Uso el más nuevo; elige otro con NAVIA_IPHONE=\"nombre\".", file=sys.stderr)
if iphones:
    print(max(iphones)[1])
' || true)

if [ -z "$DISPOSITIVO" ]; then
  echo "No encuentro un iPhone conectado. Conéctalo por cable, desbloquéalo y acepta 'Confiar'." >&2
  exit 1
fi
echo "iPhone: $DISPOSITIVO"

EQUIPO_ARG=()
[ -n "${NAVIA_TEAM:-}" ] && EQUIPO_ARG=(DEVELOPMENT_TEAM="$NAVIA_TEAM")

xcodebuild -workspace NavIA.xcworkspace -scheme NavIA -configuration Release \
  -destination "id=$DISPOSITIVO" -derivedDataPath build/dispositivo \
  -allowProvisioningUpdates "${EQUIPO_ARG[@]}" build | grep -E "error:|warning: .*signing|BUILD (SUCCEEDED|FAILED)" || true

APP=build/dispositivo/Build/Products/Release-iphoneos/NavIA.app
[ -d "$APP" ] || { echo "La compilación falló; revisa la firma en Xcode (esquema NavIA → Signing)." >&2; exit 1; }

xcrun devicectl device install app --device "$DISPOSITIVO" "$APP"
echo "Instalada. La app del reloj se instala sola en el Watch enlazado (puede tardar unos minutos)."
