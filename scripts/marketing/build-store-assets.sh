#!/usr/bin/env bash
# Regenerates docs/store-assets/ (App Store + Google Play) from the current app build.
# Needs: node, npx tsx, Playwright with Chromium, Python 3 with Pillow, the Inter font.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
OUT="$HERE/out"
mkdir -p "$OUT/raw"
cd "$ROOT"
npx tsx "$HERE/seed.ts" "$OUT/seed.json"
rm -rf "$OUT/web" && npx expo export --platform web --output-dir "$OUT/web" > /dev/null
node "$HERE/serve.js" "$OUT/web" 8099 > "$OUT/serve.log" 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
sleep 1
SEED="$OUT/seed.json" OUT="$OUT" node "$HERE/capture.js" 430 932 ios
SEED="$OUT/seed.json" OUT="$OUT" node "$HERE/capture.js" 360 720 play
python3 "$HERE/compose.py"
