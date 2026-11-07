#!/bin/bash
# Compila NavIA en Release (con la app del reloj embebida) y la instala en el
# iPhone conectado por cable. Requiere Apple ID en Xcode → Ajustes → Cuentas.
set -euo pipefail
cd "$(dirname "$0")/../ios"
export LANG=en_US.UTF-8

[ -d Pods ] || pod install

# Primer iPhone físico conectado y disponible.
DISPOSITIVO=$(xcrun devicectl list devices --json-output /dev/stdout 2>/dev/null | python3 -c '
import json, sys
datos = json.loads(sys.stdin.read() or "{}")
for d in datos.get("result", {}).get("devices", []):
    hw = d.get("hardwareProperties", {})
    if hw.get("platform") == "iOS" and hw.get("reality") == "physical":
        print(hw.get("udid", d.get("identifier")))
        break
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
