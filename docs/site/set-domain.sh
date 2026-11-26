#!/bin/sh
# ---------------------------------------------------------------------------
# THE ONE PLACE TO CHANGE THE SITE DOMAIN / ALAN ADINI DEĞİŞTİRMEK İÇİN TEK YER
#
# ORIGIN is the domain currently written into the site (canonical, hreflang,
# og:url, og:image, JSON-LD url, robots.txt, sitemap.xml). Static HTML needs
# absolute URLs in each file, so this script rewrites them all at once.
#
# Usage:  sh docs/site/set-domain.sh https://your-domain.com
# ---------------------------------------------------------------------------
ORIGIN="https://dingin.app"

NEW="${1%/}"
[ -n "$NEW" ] || { echo "usage: sh set-domain.sh https://new-domain.com"; exit 1; }
DIR="$(cd "$(dirname "$0")" && pwd)"
for f in "$DIR/index.html" "$DIR/en/index.html" "$DIR/robots.txt" "$DIR/sitemap.xml" "$DIR/set-domain.sh"; do
  sed -i.bak "s#$ORIGIN#$NEW#g" "$f" && rm -f "$f.bak"
done
echo "Domain changed: $ORIGIN -> $NEW"
