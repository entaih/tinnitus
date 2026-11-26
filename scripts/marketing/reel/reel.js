/* Dingin reel — deterministic timeline. window.render(t) draws the frame at t seconds (0…DURATION). */
const DURATION = 30;
const $ = (id) => document.getElementById(id);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, p) => a + (b - a) * p;
const easeOut = (p) => 1 - Math.pow(1 - clamp(p), 3);
const easeInOut = (p) => { p = clamp(p); return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; };
const easeBack = (p) => { p = clamp(p); const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
/** 0→1 between a and b (eased), 1 until c, 1→0 until d. */
const window4 = (t, a, b, c, d, ease = easeInOut) => (t < a || t > d ? 0 : t < b ? ease((t - a) / (b - a)) : t <= c ? 1 : 1 - ease((t - c) / (d - c)));

// ---- Text script -------------------------------------------------------------------------------------------
const TEXT = [
  { cls: 'small', top: 640, text: 'Gece 03.00', in: 0.15, out: 3.0 },
  { cls: 'big', top: 730, text: 'Herkes uyuyor.', in: 0.7, out: 3.0 },
  { cls: 'big', top: 300, text: 'Bir tek o ses|susmuyor.', in: 3.6, out: 6.45 },
  { cls: 'mid', top: 300, text: 'Yetişkinlerin yaklaşık|yedide biri|bu sesle yaşıyor.', in: 6.8, out: 9.6 },
  { cls: 'big', top: 1190, text: 'Yalnız değilsiniz.', in: 8.4, out: 9.6 },
  { cls: 'big', top: 760, text: 'Artık kolay|bir yol var.', in: 10.3, out: 11.9 },
  { cls: 'big', top: 950, text: 'Dingin', in: 12.3, out: 14.4 },
  { cls: 'body', top: 1090, text: 'Kulak çınlaması için|kolay bir yol', in: 12.6, out: 14.4 },
  { cls: 'mid', top: 260, text: 'Birkaç soruda olası|nedenini öğrenin', in: 14.9, out: 17.6 },
  { cls: 'mid', top: 260, text: 'Günde 15 dakika.|Size özel program.', in: 18.0, out: 20.7 },
  { cls: 'mid', top: 260, text: 'Çizimlerle kolay.|Kendi hızınızda.', in: 21.1, out: 23.8 },
  { cls: 'mid', top: 330, text: 'Daha sakin geceler|için ilk adımı atın.', in: 24.6, out: 26.5 },
  { cls: 'big', top: 640, text: 'Dingin', in: 27.0, out: 99 },
  { cls: 'body', top: 780, text: 'Kulak çınlaması için kolay bir yol', in: 27.2, out: 99 },
  { cls: 'small', top: 880, text: 'Ücretsiz indirin', in: 27.4, out: 99, style: 'color:#e0e7ff;letter-spacing:6px' },
  { cls: 'body', top: 1130, text: 'Ücretsiz · Hesap yok|Verileriniz telefonunuzda', in: 27.9, out: 99, style: 'font-size:38px;color:#c7d2fe' },
];
const WORD_IN = 0.5, STAGGER = 0.07, WORD_OUT = 0.35;
const textEls = TEXT.map((item) => {
  const el = document.createElement('div');
  el.className = `txt ${item.cls}`;
  el.style.top = `${item.top}px`;
  if (item.style) el.style.cssText += item.style;
  let i = 0;
  el.innerHTML = item.text.split('|').map((line) => line.split(' ').map((w) => `<span class="word" data-i="${i++}">${w}</span>`).join(' ')).join('<br>');
  document.body.insertBefore(el, $('logo'));
  return { item, el, words: [...el.querySelectorAll('.word')] };
});

// ---- Stars, people, waves --------------------------------------------------------------------------------
const STARS = Array.from({ length: 70 }, (_, k) => {
  const s = document.createElement('span');
  const r = (n) => { const x = Math.sin(k * 127.1 + n * 311.7) * 43758.5453; return x - Math.floor(x); };
  s.style.left = `${r(1) * 1080}px`; s.style.top = `${r(2) * 1300}px`;
  const size = 2 + r(3) * 4; s.style.width = s.style.height = `${size}px`;
  $('stars').appendChild(s);
  return { el: s, phase: r(4) * Math.PI * 2, speed: 0.6 + r(5) * 1.6, base: 0.25 + r(6) * 0.6 };
});
const PERSON = (fill) => `<svg viewBox="0 0 92 170"><circle cx="46" cy="34" r="28" fill="${fill}"/><path d="M8 170v-62c0-26 17-44 38-44s38 18 38 44v62z" fill="${fill}"/></svg>`;
for (let k = 0; k < 7; k++) $('people').insertAdjacentHTML('beforeend', `<div class="person" style="will-change:transform,opacity">${PERSON(k === 6 ? '#f59e0b' : '#818cf8')}</div>`);
const people = [...document.querySelectorAll('.person')];
const EAR = { x: 335, y: 410 };
const wavesG = $('waves');
const WAVE_N = 5;
for (let k = 0; k < WAVE_N; k++) wavesG.insertAdjacentHTML('beforeend', '<path fill="none" stroke-linecap="round"/>');
const wavePaths = [...wavesG.querySelectorAll('path')];

function wavePath(r, jitter, t, k) {
  const a0 = (125 * Math.PI) / 180, a1 = (235 * Math.PI) / 180, steps = 60;
  let d = '';
  for (let s = 0; s <= steps; s++) {
    const a = lerp(a0, a1, s / steps);
    const rr = r + jitter * Math.sin(a * 22 + t * 18 + k * 1.7) * (0.6 + 0.4 * Math.sin(t * 7 + s));
    const x = EAR.x + rr * Math.cos(a), y = EAR.y + rr * Math.sin(a);
    d += `${s ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d;
}
const mix = (c1, c2, p) => `rgb(${c1.map((v, i) => Math.round(lerp(v, c2[i], p))).join(',')})`;

// ---- Assets ------------------------------------------------------------------------------------------------
const SHOTS = ['../out/raw/ios-2-neden.png', '../out/raw/ios-4-bugun.png', '../out/raw/ios-5-egzersiz.png'];
$('icon').src = $('endicon').src = '../../../assets/icon.png';
$('logo').src = '../../../assets/brand/aihear-logo-white.png';
$('disclaimer').textContent = 'Ön değerlendirme ve öz yönetim uygulamasıdır; doktor muayenesinin yerine geçmez.';
$('end3').innerHTML = '<span class="pill">App Store</span><span class="pill">Google Play</span>';
for (const id of ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 'cap', 't8', 'end1', 'end2', 'end4']) { const e = $(id); if (e) e.remove(); }

let currentShot = -1;
function setShots(t) {
  const segs = [[14.6, 17.8], [17.8, 20.9], [20.9, 24.2]];
  let idx = segs.findIndex(([a, b]) => t >= a && t < b);
  if (idx < 0) idx = t < 14.6 ? 0 : 2;
  const [a] = segs[idx];
  const fade = idx > 0 ? easeInOut((t - a) / 0.5) : 1;
  const A = $('shotA'), B = $('shotB');
  if (currentShot !== idx) {
    A.src = SHOTS[Math.max(0, idx - 1)];
    B.src = SHOTS[idx];
    currentShot = idx;
  }
  B.style.opacity = fade;
  A.style.opacity = idx > 0 ? 1 : 0;
  const push = lerp(1, 1.035, clamp((t - a) / 3.2));
  B.style.transform = `scale(${push})`; B.style.transformOrigin = '50% 30%';
}

// ---- Frame -------------------------------------------------------------------------------------------------
window.render = (t) => {
  // Backgrounds: night → indigo bloom at ~10 s, dim indigo for the calm night, back to indigo for the end card.
  const toIndigo = easeInOut((t - 9.7) / 1.3);
  $('night').style.opacity = 1 - toIndigo + window4(t, 24.0, 24.8, 26.2, 26.9) * 0.55;
  $('indigo').style.opacity = toIndigo;
  $('glow').style.opacity = window4(t, 9.7, 10.6, 11.2, 12.4) * 0.9 + window4(t, 26.6, 27.4, 99, 100) * 0.45;
  $('stars').style.opacity = (1 - toIndigo) * (0.9) + window4(t, 24.0, 24.8, 26.2, 26.9) * 0.8;
  for (const s of STARS) s.el.style.opacity = s.base * (0.55 + 0.45 * Math.sin(t * s.speed + s.phase));

  // Head: tense (3.1–9.7), calm with moon (24.4–26.6). Slow push-in for tension.
  const headVis = Math.max(window4(t, 3.0, 3.8, 6.35, 6.85), window4(t, 24.3, 25.0, 26.3, 26.9));
  const head = $('head');
  head.style.opacity = headVis;
  const tension = clamp((t - 3.2) / 3.2);
  const headScale = t < 10 ? lerp(0.95, 1.03, tension) : lerp(0.96, 1, easeOut((t - 24.3) / 1.5));
  const shake = t > 4.5 && t < 6.6 ? Math.sin(t * 61) * 1.6 * tension : 0;
  head.style.transform = `translate(${shake}px, ${t > 20 ? 40 : 0}px) scale(${headScale})`;
  $('moon').style.opacity = window4(t, 24.6, 25.4, 99, 100);
  // Waves: amber jagged pulses that grow (tension) → calm lavender arcs in the calm night.
  const calm = t > 20 ? 1 : 0;
  const amp = calm ? 0 : lerp(4, 16, tension);
  const color = calm ? mix([245, 158, 11], [199, 210, 254], 1) : mix([251, 191, 36], [245, 120, 11], tension);
  const speed = calm ? 26 : lerp(40, 90, tension);
  for (let k = 0; k < WAVE_N; k++) {
    const r = 70 + ((t * speed + k * 70) % 330);
    const fadeR = 1 - clamp((r - 70) / 330);
    const p = wavePaths[k];
    p.setAttribute('d', wavePath(r, amp, t, k));
    p.setAttribute('stroke', color);
    p.setAttribute('stroke-width', String(calm ? 9 : lerp(8, 12, tension)));
    p.setAttribute('opacity', String(fadeR * (calm ? 0.8 : 0.95)));
  }

  // People row (7 → 1 highlighted)
  const peopleVis = window4(t, 7.0, 7.6, 9.3, 9.8);
  people.forEach((el, k) => {
    const p = easeOut((t - 7.0 - k * 0.08) / 0.5);
    const highlight = k === 6 ? 1 + 0.08 * Math.sin(t * 6) * clamp((t - 7.9) / 0.3) : 1;
    el.style.opacity = peopleVis * p * (k === 6 ? 1 : lerp(1, 0.55, clamp((t - 7.9) / 0.4)));
    el.style.transform = `translateY(${(1 - p) * 40}px) scale(${highlight})`;
  });
  $('people').style.top = '820px';

  // Logo scene icon pop
  const iconIn = easeBack((t - 12.0) / 0.7);
  const iconOut = 1 - easeInOut((t - 14.3) / 0.4);
  const icon = $('icon');
  icon.style.opacity = t < 12 ? 0 : clamp((t - 12) / 0.25) * iconOut;
  icon.style.transform = `scale(${lerp(0.6, 1, iconIn)})`;

  // Phone: slides up at 14.6, three screens, leaves at 24.0
  const phone = $('phone');
  const up = easeOut((t - 14.4) / 0.9), down = easeInOut((t - 23.9) / 0.6);
  phone.style.opacity = t < 14.4 || t > 24.6 ? 0 : 1 - down;
  phone.style.transform = `translateY(${lerp(900, 0, up) + down * 260}px) rotate(${lerp(4, 0, up)}deg)`;
  if (t >= 14.4 && t <= 24.6) setShots(t);
  $('scrim').style.opacity = 0;

  // End card
  const endIcon = $('endicon');
  endIcon.style.opacity = clamp((t - 26.8) / 0.3);
  endIcon.style.transform = `scale(${lerp(0.6, 1, easeBack((t - 26.8) / 0.7))})`;
  const pills = $('end3');
  pills.style.opacity = easeOut((t - 27.5) / 0.6);
  pills.style.transform = `translateY(${(1 - easeOut((t - 27.5) / 0.6)) * 40}px)`;
  $('logo').style.opacity = easeOut((t - 28.1) / 0.6);
  $('disclaimer').style.opacity = easeOut((t - 28.1) / 0.6);

  // Kinetic words
  for (const { item, words } of textEls) {
    for (const w of words) {
      const i = Number(w.dataset.i);
      const p = easeOut((t - item.in - i * STAGGER) / WORD_IN);
      const q = easeInOut((t - item.out) / WORD_OUT);
      w.style.opacity = String(p * (1 - q));
      w.style.transform = `translateY(${(1 - p) * 46 - q * 30}px)`;
      w.style.filter = `blur(${((1 - p) * 14 + q * 8).toFixed(1)}px)`;
    }
  }
};
window.DURATION = DURATION;
window.render(0);
