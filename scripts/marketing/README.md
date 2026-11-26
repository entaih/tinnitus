# Pazarlama dosyaları (AIHEAR · Dingin)

| Komut | Ne üretir |
|---|---|
| `npm run store:assets` | `docs/store-assets/ios/` (App Store 1290×2796), `docs/store-assets/android/` (Google Play 1080×2160, öne çıkan görsel 1024×500, ikon 512) |
| `npm run promo:video` | `docs/marketing/dingin-reels.mp4` (Reels/TikTok/Shorts, 1080×1920, 30 sn) ve `dingin-reels-kapak.jpg` |

Gerekenler: Node, Playwright (Chromium), Python 3 + Pillow + numpy, ffmpeg, Inter yazı tipi (`/usr/share/fonts/opentype/inter/`).

**Resmi AIHEAR logosu geldiğinde:** `assets/brand/aihear-logo.png` ve `aihear-logo-white.png` dosyalarını aynı adla değiştirin, sonra iki komutu yeniden çalıştırın.

## Video senaryosu (30 sn)

| Zaman | Görüntü | Yazı | Ses |
|---|---|---|---|
| 0–3 | Gece, yıldızlar | GECE 03.00 · Herkes uyuyor. | Oda sessizliği, yükselen ince çınlama (kısık tutuldu) |
| 3–7 | Profilden baş, kulaktan turuncu gergin dalgalar | Bir tek o ses susmuyor. | Çınlama + kalp atışı |
| 7–10 | Yedi kişiden biri vurgulanır | Yetişkinlerin yaklaşık yedide biri bu sesle yaşıyor. · Yalnız değilsiniz. | Gerilim zirvesi |
| 10–12 | Mor aydınlanma | Artık kolay bir yol var. | Çınlama söner, sıcak akor açılır |
| 12–14 | Dingin ikonu | Dingin · Kulak çınlaması için kolay bir yol | Piyano arpejleri |
| 14–24 | Telefonda uygulama: olası neden, bugünün adımı, çizimli egzersiz | Birkaç soruda olası nedenini öğrenin · Günde 15 dakika · Çizimlerle kolay | Müzik |
| 24–27 | Sakin baş, ay, yumuşak dalgalar | Daha sakin geceler için ilk adımı atın. | Müzik |
| 27–30 | Kapanış kartı | Ücretsiz indirin · App Store · Google Play · AIHEAR · uyarı satırı | Son akor |

İkna ilkeleri: empatiyle açılış (izleyici kendini tanır), yalnızlık duygusunu kırma (yaygınlık bilgisi: Jarach ve ark. 2022, yetişkinlerde yaklaşık %14), somut ve zahmetsiz çözüm, umut veren kapanış, net çağrı. Kullanılmayanlar: "iyileştirir/geçer" iddiası, uydurma yorum veya sayı, sahte aciliyet.

Yayın notu: yazılar Instagram'ın üst (≈220 px) ve alt (≈350 px) arayüz alanlarının dışında tutuldu. Sesi kapalı izleyenler için tüm mesaj ekranda yazılı. Paylaşırken kapak olarak `dingin-reels-kapak.jpg` seçin.
