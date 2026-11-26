"""
Store assets for Dingin (AIHEAR): App Store 1290x2796, Google Play 1080x2160, Play feature graphic 1024x500, Play icon 512.
Input: raw screens in scripts/marketing/out/raw/ (capture.js). Output: docs/store-assets/{ios,android}/.
Persuasion is honest: empathy first, concrete benefit, low effort, trust strip. No ratings, user counts or cure claims.
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
RAW = os.path.join(HERE, 'out', 'raw')
OUT = os.path.join(ROOT, 'docs', 'store-assets')
LOGO_WHITE = os.path.join(ROOT, 'assets', 'brand', 'aihear-logo-white.png')
ICON = os.path.join(ROOT, 'assets', 'icon.png')

FONT_DIR = '/usr/share/fonts/opentype/inter'
F_BOLD = os.path.join(FONT_DIR, 'Inter-Bold.otf')
F_MED = os.path.join(FONT_DIR, 'Inter-Medium.otf')
F_SEMI = os.path.join(FONT_DIR, 'Inter-SemiBold.otf')

# (hook, supporting line) per frame — Turkish store copy (docs/store-listing.md §3).
FRAMES = {
    '1-sonuc': ('Kulağınızdaki o ses sizi yoruyor mu?', 'Yalnız değilsiniz. Birlikte adım adım ilerleyelim.'),
    '2-neden': ('Olası nedenini birkaç soruda öğrenin', 'Kulak şeması üzerinde, sade bir dille.'),
    '3-program': ('Günde sadece 15 dakika', 'Size özel program, kendi hızınızda.'),
    '4-bugun': ('Size özel, adım adım', 'Her gün tek bir şey yapmanız yeterli.'),
    '5-egzersiz': ('Okumak yok, çizimlerle kolay', 'Boyun ve çene egzersizleri resimli anlatılır.'),
    '6-ses': ('Rahatlatan sesler, daha sakin geceler', 'Çınlamanıza göre ayarlanan arka plan sesleri.'),
}
TRUST = 'Ücretsiz  ·  Hesap yok  ·  Kılavuz temelli'


def gradient(w, h):
    img = Image.new('RGB', (w, h))
    d = ImageDraw.Draw(img)
    top, bottom = (79, 70, 229), (49, 46, 129)
    for y in range(h):
        t = y / h
        d.line([(0, y), (w, y)], fill=tuple(int(a + (b - a) * t) for a, b in zip(top, bottom)))
    # soft light glow behind the phone
    glow = Image.new('L', (w, h), 0)
    ImageDraw.Draw(glow).ellipse([int(-0.2 * w), int(0.32 * h), int(1.2 * w), int(1.15 * h)], fill=60)
    img.paste(Image.new('RGB', (w, h), (165, 180, 252)), (0, 0), glow.point(lambda v: v // 2))
    return img


def wrap(d, text, font, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=font) <= maxw:
            cur = t
        else:
            lines.append(cur)
            cur = w
    lines.append(cur)
    return lines


def centered(d, y, text, font, fill, w):
    d.text(((w - d.textlength(text, font=font)) / 2, y), text, font=font, fill=fill)


def logo(height):
    im = Image.open(LOGO_WHITE).convert('RGBA')
    return im.resize((int(im.width * height / im.height), height), Image.LANCZOS)


def frame(key, raw_path, out_path, W, H, s):
    hook, sub = FRAMES[key]
    raw = Image.open(raw_path).convert('RGB')
    bg = gradient(W, H)
    d = ImageDraw.Draw(bg)
    f_hook = ImageFont.truetype(F_BOLD, int(94 * s))
    f_sub = ImageFont.truetype(F_MED, int(46 * s))
    f_trust = ImageFont.truetype(F_SEMI, int(38 * s))
    y = int(140 * s)
    for ln in wrap(d, hook, f_hook, W - int(150 * s)):
        centered(d, y, ln, f_hook, (255, 255, 255), W)
        y += int(112 * s)
    y += int(14 * s)
    for ln in wrap(d, sub, f_sub, W - int(190 * s)):
        centered(d, y, ln, f_sub, (224, 231, 255), W)
        y += int(60 * s)
    # bottom band: trust strip + AIHEAR logo
    band_h = int(230 * s)
    band_top = H - band_h
    top = y + int(56 * s)
    sw = int(W * 0.76)
    sh = int(raw.height * sw / raw.width)
    maxh = band_top - top - int(30 * s)
    shot = raw.resize((sw, sh), Image.LANCZOS)
    if sh > maxh:
        shot = shot.crop((0, 0, sw, maxh))
        sh = maxh
    r = int(60 * s)
    bezel = int(16 * s)
    x = (W - sw) // 2
    # device bezel and shadow
    shadow = Image.new('RGBA', (sw + 2 * bezel + 60, sh + 2 * bezel + 60), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle([30, 40, sw + 2 * bezel + 30, sh + 2 * bezel + 40], radius=r + bezel, fill=(15, 12, 60, 110))
    bg.paste(shadow, (x - bezel - 30, top - bezel - 30), shadow)
    ImageDraw.Draw(bg).rounded_rectangle([x - bezel, top - bezel, x + sw + bezel, top + sh + bezel], radius=r + bezel, fill=(17, 24, 39))
    mask = Image.new('L', (sw, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, sw, sh], radius=r, fill=255)
    bg.paste(shot, (x, top), mask)
    # fade the cropped bottom of the phone into the band
    fade = Image.new('L', (W, int(120 * s)), 0)
    for i in range(fade.height):
        ImageDraw.Draw(fade).line([(0, i), (W, i)], fill=int(255 * i / fade.height))
    band = gradient(W, H).crop((0, band_top - fade.height, W, band_top))
    bg.paste(band, (0, band_top - fade.height), fade)
    ImageDraw.Draw(bg).rectangle([0, band_top, W, H], fill=(49, 46, 129))
    d = ImageDraw.Draw(bg)
    centered(d, band_top + int(46 * s), TRUST, f_trust, (199, 210, 254), W)
    lg = logo(int(52 * s))
    bg.paste(lg, ((W - lg.width) // 2, band_top + int(122 * s)), lg)
    bg.save(out_path)


def feature_graphic(path):
    W, H = 1024, 500
    fg = gradient(W, H)
    d = ImageDraw.Draw(fg)
    icon = Image.open(ICON).convert('RGB').resize((132, 132), Image.LANCZOS)
    m = Image.new('L', (132, 132), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, 132, 132], radius=30, fill=255)
    fg.paste(icon, (60, 70), m)
    d.text((60, 222), 'Kulağınızdaki o ses', font=ImageFont.truetype(F_BOLD, 46), fill=(255, 255, 255))
    d.text((60, 276), 'sizi yoruyor mu?', font=ImageFont.truetype(F_BOLD, 46), fill=(255, 255, 255))
    d.text((60, 344), 'Olası nedenini öğrenin, günde 15 dakika', font=ImageFont.truetype(F_MED, 24), fill=(224, 231, 255))
    d.text((60, 376), 'size özel programa başlayın. Ücretsiz.', font=ImageFont.truetype(F_MED, 24), fill=(224, 231, 255))
    lg = logo(30)
    fg.paste(lg, (60, 432), lg)
    shot = Image.open(os.path.join(RAW, 'play-2-neden.png')).convert('RGB')
    sw = 240
    sh = int(shot.height * sw / shot.width)
    shot = shot.resize((sw, sh), Image.LANCZOS).crop((0, 0, sw, 470))
    ImageDraw.Draw(fg).rounded_rectangle([W - sw - 92, 32, W - 68, 520], radius=34, fill=(17, 24, 39))
    m2 = Image.new('L', (sw, 470), 0)
    ImageDraw.Draw(m2).rounded_rectangle([0, 0, sw, 470], radius=26, fill=255)
    fg.paste(shot, (W - sw - 80, 44), m2)
    fg.save(path)


def main():
    os.makedirs(os.path.join(OUT, 'ios'), exist_ok=True)
    os.makedirs(os.path.join(OUT, 'android'), exist_ok=True)
    for key in FRAMES:
        frame(key, os.path.join(RAW, f'ios-{key}.png'), os.path.join(OUT, 'ios', f'{key}.png'), 1290, 2796, 1.0)
        frame(key, os.path.join(RAW, f'play-{key}.png'), os.path.join(OUT, 'android', f'{key}.png'), 1080, 2160, 0.80)
    feature_graphic(os.path.join(OUT, 'android', 'feature-graphic-1024x500.png'))
    Image.open(ICON).convert('RGB').resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, 'android', 'icon-512.png'))
    print('store assets written to', OUT)


if __name__ == '__main__':
    main()
