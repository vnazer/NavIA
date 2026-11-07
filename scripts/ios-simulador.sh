#!/bin/bash
# Compila NavIA en Release para el simulador y la abre (iPhone 17 por defecto).
set -euo pipefail
cd "$(dirname "$0")/../ios"
export LANG=en_US.UTF-8
SIMULADOR="${1:-iPhone 17}"

[ -d Pods ] || pod install
xcrun simctl boot "$SIMULADOR" 2>/dev/null || true
open -a Simulator 2>/dev/null || true

xcodebuild -workspace NavIA.xcworkspace -scheme NavIA -configuration Release \
  -destination "platform=iOS Simulator,name=$SIMULADOR" \
  -derivedDataPath build/dd CODE_SIGNING_ALLOWED=NO build | grep -E "error:|BUILD (SUCCEEDED|FAILED)" || true

xcrun simctl install "$SIMULADOR" build/dd/Build/Products/Release-iphonesimulator/NavIA.app
xcrun simctl launch "$SIMULADOR" cl.magama.navia
