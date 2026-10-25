# Dingin — Mağaza metni (App Store / Google Play)

Güncelleme: 25 Ekim 2026. Uygulamanın şimdiki akışına göre yazıldı (tek ekran giriş → güvenlik → çınlama ölçeği → kısa öykü → ruh hali → adım adım sonuç → program).

Dil kuralı: mağaza metni "ön değerlendirme" der; "tedavi eder, iyileştirir, çınlamayı geçirir, kesin tanı" denmez. Uygulama içindeki "Ön tanı" ifadesi kalıcı "hekim muayenesinin yerine geçmez" notuyla birlikte gösterilir. Gerekçe: Apple App Store Yönergesi 1.4.1 ve Google Play sağlık uygulamaları politikası, düzenleyici onayı olmayan tanı iddialarını reddetme nedeni sayar. Ayrıntı: `docs/RELEASE.md` §5.

`[İLETİŞİM]` yazan yerlere gerçek destek e-postası yazılmadan mağazaya gönderilmez.

## 1. Türkçe

| Alan | Metin | Sınır |
|---|---|---|
| Ad | **Dingin: Kulak Çınlaması** | 30 |
| Alt başlık (iOS) | **Çınlama testi ve kişisel program** | 30 |
| Kısa açıklama (Play) | **Kulak çınlaması için ön değerlendirme, doktor yönlendirmesi ve kişisel program.** | 80 |
| Anahtar kelimeler (iOS) | `kulak çınlaması,tinnitus,çınlama,işitme testi,hiperakuzi,uyku,beyaz gürültü,kbb,odyoloji` | 100 |
| Tanıtım metni (iOS) | Kulak çınlamanızı birkaç dakikada değerlendirin, hangi doktora gideceğinizi öğrenin, size özel programa başlayın. Verileriniz telefonunuzda kalır. | 170 |

**Açıklama (TR)**

> Kulak çınlaması (tinnitus) için Türkçe, kanıta dayalı bir uygulama. Birkaç dakikalık sorularla çınlamanızın hayatınızı ne kadar etkilediğini ve olası nedenini öğrenin; gerekiyorsa hangi doktora, ne zaman gitmeniz gerektiğini görün; size göre hazırlanan programa tek dokunuşla başlayın.
>
> **Kolay.** Her ekranda tek soru, büyük düğmeler. Sonuçlar sade dille ve adım adım gösterilir.
>
> **Önce güvenlik.** Kısa güvenlik taraması, kılavuz ölçütlerine (NICE NG155, AAO-HNS) göre acil, 24 saat, 2 hafta ya da rutin muayene gerekip gerekmediğini söyler. Doktorunuza götürebileceğiniz bir rapor (PDF) hazırlar.
>
> **Size özel program.** Günde yaklaşık 15 dakika, 6–12 hafta: rahatlatan sesler (çınlamanızın perdesine göre ayarlanır), bilişsel-davranışçı beceriler, uyku desteği, ses hassasiyetinde kademeli alışma, gerekirse boyun ve çene egzersizleri. Her gün "bugünün tek şeyi". Program bitince bakım modu devam eder.
>
> **Telefonla ölçümler.** Perde eşleme, gürlük, kulaklıkla işitme taraması ve kendi kendine muayene adımları. Bunlar tahmindir, klinik odyometrinin yerini tutmaz.
>
> **Kanıtla.** Her önerinin yanında kanıt düzeyi ve kaynağı var. Önerilmeyen yöntemler (takviyeler, betahistin, ginkgo) da açıkça yazılı.
>
> **Verileriniz telefonunuzda kalır.** Hesap yok, sunucu yok, reklam yok. Bir telefonu birden fazla kişi ayrı ayrı kullanabilir.
>
> Dingin hekim veya odyolog muayenesinin yerine geçmez. Ani işitme kaybı, şiddetli baş dönmesi ya da kendinize zarar verme düşüncesi varsa 112'yi arayın.
>
> İletişim: [İLETİŞİM]

## 2. English

| Field | Text | Limit |
|---|---|---|
| Name | **Dingin: Tinnitus** | 30 |
| Subtitle (iOS) | **Tinnitus check and personal plan** | 30 |
| Short description (Play) | **Preliminary tinnitus assessment, doctor guidance and a personal programme.** | 80 |
| Keywords (iOS) | `tinnitus,ringing ears,hearing test,hyperacusis,white noise,sleep,cbt,sound therapy,audiology` | 100 |
| Promotional text (iOS) | Check your tinnitus in a few minutes, learn which doctor to see, and start a programme made for you. Your data stays on your phone. | 170 |

**Description (EN)**

> An evidence-based app for tinnitus (ringing in the ears). A few minutes of simple questions show how much tinnitus affects your life and its likely cause; if needed, which doctor to see and when; and a programme made for you that starts with one tap.
>
> **Easy.** One question per screen, large buttons. Results in plain words, step by step.
>
> **Safety first.** A short safety screen follows guideline criteria (NICE NG155, AAO-HNS) to tell you whether you need care immediately, within 24 hours, within 2 weeks or routinely, and prepares a PDF report for your doctor.
>
> **Your programme.** About 15 minutes a day for 6–12 weeks: soothing sounds tuned to your tinnitus pitch, cognitive-behavioural skills, sleep support, gradual sound-tolerance practice and neck and jaw exercises when relevant. One thing to do each day, and a maintenance mode afterwards.
>
> **Phone-based measurements.** Pitch matching, loudness, a headphone hearing screen and guided self-checks. These are estimates and do not replace clinical audiometry.
>
> **With evidence.** Every recommendation shows its evidence level and source; methods that are not recommended are stated too.
>
> **Your data stays on your phone.** No account, no server, no ads. Several people can use one phone separately.
>
> Dingin does not replace an examination by a doctor or audiologist. In an emergency call your local emergency number.
>
> Contact: [CONTACT]

## 3. Ekran görüntüleri (6 kare, portre)

Hazır taslaklar: `docs/store-screenshots/` (1290×2796, App Store 6,7" ve Google Play telefon için uygun). Web derlemesinden alındı; yayından önce gerçek bir iPhone'dan aynı ekranlarla yenilenmesi önerilir (yazı tipi ve durum çubuğu birebir olur).

| # | Ekran | Başlık (TR) | Caption (EN) |
|---|---|---|---|
| 1 | `1-sonuc.png` · sonuç adımı (renkli daire) | Çınlamanız sizi ne kadar etkiliyor? | How much does tinnitus affect you? |
| 2 | `2-neden.png` · olası neden (kulak şeması) | Olası nedeni, sade dille. | The likely cause, in plain words. |
| 3 | `3-program.png` · "Programınız hazır" | Size özel program, günde 15 dakika. | Your programme, 15 minutes a day. |
| 4 | `4-bugun.png` · ana sayfa "Bugünün tek şeyi" | Her gün tek bir adım. | One step a day. |
| 5 | `5-egzersiz.png` · boyun programı, çizimli adım | Hareketler çizimlerle. | Movements shown in drawings. |
| 6 | `6-ses.png` · ses oynatıcı | Rahatlatan sesler, zamanlayıcıyla. | Soothing sounds with a timer. |

Kurallar: gerçek kullanıcı verisi yok (demo verisi); her karede "hekim muayenesinin yerine geçmez" altbilgisi; hekim veya klinik adı yok; öncesi/sonrası etkililik görseli yok.

## 4. Mağaza beyanları

- Kategori: Sağlık ve Fitness (iOS: Health & Fitness, Play: Health & Fitness).
- Yaş sınırı: 18+ (içerik: sağlık bilgisi, ruh hali taraması).
- Gizlilik etiketi / Veri güvenliği: veri toplanmaz, paylaşılmaz, takip yok (ayrıntı `docs/RELEASE.md` §4).
- İzinler: bildirim (yerel hatırlatma), mikrofon (yalnız ortam gürültüsü ölçümü, kayıt yok), hareket algılayıcısı (denge kaydı), arka planda ses çalma.
- Gizlilik politikası adresi: `docs/privacy-policy.md` yayımlanmış bir adreste (ör. GitHub Pages veya şirket sitesi).
