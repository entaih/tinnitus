const { chromium } = require('playwright');
const seed = require(process.env.SEED || './out/seed.json');
const [W, H, prefix] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4]];
const FRAMES = [
  ['1-sonuc', '/assess/results', 'noprog', 0],
  ['2-neden', '/assess/results', 'noprog', 1],
  ['3-program', '/assess/results', 'noprog', 2],
  ['4-bugun', '/', 'prog', -1],
  ['5-egzersiz', '/exercise/somatic.cervical', 'prog', -1],
  ['6-ses', '/sound/player?preset=enrichment', 'prog', -1],
];
(async () => {
  const b = await chromium.launch();
  for (const [name, route, variant, steps] of FRAMES) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 3 });
    const p = await ctx.newPage();
    await p.addInitScript(([seed, variant]) => {
      localStorage.setItem('dingin.settings', JSON.stringify(seed.settings));
      localStorage.setItem('dingin.profiles', JSON.stringify(seed.profiles));
      localStorage.setItem('dingin.clinical', JSON.stringify(variant === 'prog' ? seed.clinicalProgram : seed.clinicalNoProgram));
    }, [seed, variant]);
    await p.goto('http://localhost:8099' + route, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1000);
    for (let k = 0; k < steps; k++) { await p.getByText(/^(Devam et|Anladım)$/).first().click(); await p.waitForTimeout(700); }
    if (name === '5-egzersiz') { const s = p.getByText(/^(Programı başlat|Başla|Başlat)$/).first(); if (await s.count()) { await s.click(); await p.waitForTimeout(700); } }
    await p.screenshot({ path: `${process.env.OUT || 'out'}/raw/${prefix}-${name}.png` });
    await ctx.close();
  }
  await b.close();
  console.log('done', prefix);
})().catch((e) => { console.error('ERR', e.message); process.exit(1); });
