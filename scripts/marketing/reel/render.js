// Renders reel.html frame by frame. Usage: node render.js <outDir> [fps] [t1,t2,...]  (times → preview stills only)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const out = process.argv[2] || path.join(__dirname, '..', 'out', 'reel-frames');
  const fps = Number(process.argv[3] || 30);
  const times = process.argv[4] ? process.argv[4].split(',').map(Number) : null;
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, 'reel.html'));
  await p.waitForFunction(() => typeof window.render === 'function');
  await p.evaluate(() => document.fonts.ready);
  // preload all screenshots so cross-fades never show an empty frame
  await p.evaluate(async () => { await Promise.all(['../out/raw/ios-2-neden.png', '../out/raw/ios-4-bugun.png', '../out/raw/ios-5-egzersiz.png'].map((s) => new Promise((r) => { const i = new Image(); i.onload = r; i.onerror = r; i.src = s; }))); });
  const duration = await p.evaluate(() => window.DURATION);
  const list = times || Array.from({ length: Math.round(duration * fps) }, (_, i) => i / fps);
  let n = 0;
  for (const t of list) {
    await p.evaluate((t) => window.render(t), t);
    if (n === 0 || list.length < 50) await p.waitForTimeout(120); // image decode on the first frame / previews
    await p.screenshot({ path: path.join(out, times ? `t${String(t).padStart(5, '0')}.png` : `f${String(n).padStart(4, '0')}.png`) });
    n++;
  }
  await b.close();
  console.log('frames', n, 'in', out);
})().catch((e) => { console.error(e); process.exit(1); });
