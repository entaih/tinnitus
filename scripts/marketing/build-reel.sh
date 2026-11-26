#!/usr/bin/env bash
# Renders the Dingin promo reel: docs/marketing/dingin-reels.mp4 (1080x1920, 30 fps, 30 s) and a cover image.
# Needs the raw app screens from build-store-assets.sh (scripts/marketing/out/raw/), Playwright, Python 3 + numpy + Pillow, ffmpeg.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
OUT="$HERE/out"
[ -f "$OUT/raw/ios-2-neden.png" ] || bash "$HERE/build-store-assets.sh"
rm -rf "$OUT/reel-frames"
node "$HERE/reel/render.js" "$OUT/reel-frames" 30
python3 "$HERE/reel/audio.py" "$OUT/reel-audio.wav"
mkdir -p "$ROOT/docs/marketing"
# Video first, then measure loudness and set the gain so the mix lands at -14 LUFS (Instagram / TikTok norm).
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i "$OUT/reel-frames/f%04d.png" \
  -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -profile:v high -level 4.2 -r 30 "$OUT/reel-video.mp4"
LUFS=$(ffmpeg -hide_banner -nostats -i "$OUT/reel-audio.wav" -af ebur128 -f null - 2>&1 | awk '/^ +I:/{v=$2} END{print v}')
GAIN=$(python3 -c "print(round(-14 - float('$LUFS'), 2))")
ffmpeg -hide_banner -loglevel error -y -i "$OUT/reel-video.mp4" -i "$OUT/reel-audio.wav" -map 0:v -map 1:a -c:v copy \
  -af "volume=${GAIN}dB" -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest "$ROOT/docs/marketing/dingin-reels.mp4"
python3 -c "from PIL import Image; Image.open('$OUT/reel-frames/f0140.png').convert('RGB').save('$ROOT/docs/marketing/dingin-reels-kapak.jpg', quality=92)"
echo "reel written to docs/marketing/dingin-reels.mp4 (audio gain ${GAIN} dB)"
