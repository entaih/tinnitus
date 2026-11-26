# Dingin — Yayın rehberi (iOS + Android)

Güncelleme: 26 Kasım 2026 · Yayıncı: **AIHEAR** · sürüm 1.0.0 · Expo SDK 58

Bu rehber sırayla izlenecek şekilde yazıldı. ✅ olanlar depoda hazır; ✍️ olanları yalnızca siz yapabilirsiniz.

## 1. Hazır olanlar

| Alan | Durum |
|---|---|
| ✅ Yapılandırma | Ad "Dingin", sürüm 1.0.0, derleme numaraları EAS'te otomatik artar (`eas.json`: `appVersionSource: remote`, `autoIncrement`). iOS ve Android yerel projeleri üretilerek doğrulandı: izinler, sürüm, şifreleme beyanı, gizlilik bildirimi, iki dilli izin metinleri doğru. |
| ✅ İkonlar | App Store için saydamlık katmanı olmayan 1024 px ikon; Android uyarlanabilir ikon; bildirim ikonu; Play için 512 px ikon. |
| ✅ Uyumluluk | Tüm yerel modüller SDK 58'in beklediği sürümde; TypeScript hatasız; 186 test geçiyor; lint 0 hata. |
| ✅ Marka | Uygulamada "Bir AIHEAR uygulaması" (giriş ve Ayarlar), gizlilikte veri sorumlusu AIHEAR. Logo şimdilik yer tutucu: `assets/brand/` (bkz. o klasördeki README). |
| ✅ Mağaza metni ve ASO | `docs/store-listing.md`: TR/EN ad, alt başlık, anahtar kelimeler, açıklamalar, A/B varyantları. |
| ✅ Mağaza görselleri | `docs/store-assets/ios/` (1290×2796), `docs/store-assets/android/` (1080×2160, öne çıkan görsel 1024×500, ikon 512). Yeniden üretim: `npm run store:assets`. |
| ✅ Tanıtım videosu | `docs/marketing/dingin-reels.mp4` (Reels/TikTok, 1080×1920, 30 sn) ve kapak. Yeniden üretim: `npm run promo:video`. |
| ✅ Web | `docs/site/` (TR/EN açılış sayfası, SEO, SSS, paylaşım görselleri), `docs/privacy-policy.html` (yayımlanacak gizlilik sayfası). |
| ✅ Yayın kapısı | `npm run release:check` eksik yapılandırmada derlemeyi durdurur. |

## 2. İlk derlemeden ÖNCE verilmesi gereken kalıcı kararlar ✍️

1. **Paket kimliği.** Şu an iOS ve Android'de `com.aiheartech.tinnova`. Mağazaya ilk yüklemeden sonra **değiştirilemez**. Uygulama adı Dingin olduğu için `com.aiheartech.dingin` gibi bir kimlik isteyebilirsiniz; karar sizin. Değiştirmek isterseniz `app.json` içinde iki satır (`ios.bundleIdentifier`, `android.package`) ve `extra.storeUrls.android`.
2. **Destek e-postası.** `app.json` → `extra.legal.contact`. Bu boşken `npm run release:check` derlemeyi durdurur. Aynı adresi `docs/store-listing.md` içindeki `[DESTEK E-POSTASI]` ve `docs/privacy-policy.html` içindeki `[İLETİŞİM]` yerine yazın.
3. **Veri sorumlusu unvanı.** Şu an "AIHEAR". KVKK için tam ticari unvan farklıysa (ör. "... Teknoloji A.Ş.") `extra.legal.controller` alanına onu yazın.
4. **Resmi logo.** `assets/brand/aihear-logo.png` ve `aihear-logo-white.png` dosyalarını değiştirip `npm run store:assets` ve `npm run promo:video` çalıştırın.
5. **Alan adı.** Açılış sayfası `https://dingin.app` varsayımıyla yazıldı. Gerçek adres için: `sh docs/site/set-domain.sh https://alan-adiniz`.

## 3. Hesaplar ✍️

- **Apple Developer Program** (AIHEAR şirket hesabı; D-U-N-S numarası gerekir; yıllık ücretli).
- **Google Play Console** (şirket hesabı önerilir; tek seferlik ücret).
- **Expo hesabı** (ücretsiz) — derlemeler bulutta yapılır, Mac veya Android Studio gerekmez.

## 4. Derleme ve gönderim (proje klasöründe)

```bash
npm install --legacy-peer-deps
npx eas-cli@latest login
npx eas-cli@latest init                 # projeyi Expo hesabına bağlar (bir kez; app.json'a projectId yazar)
npm run release:check                   # eksik varsa durur
npx eas-cli@latest build --profile preview --platform android     # telefonda denemek için APK
npx eas-cli@latest build --profile production --platform ios      # Apple hesabınızla giriş ister, imzalamayı EAS yönetir
npx eas-cli@latest build --profile production --platform android  # Play için .aab, anahtar deposunu EAS üretir ve saklar
npx eas-cli@latest submit --profile production --platform ios      # TestFlight'a yükler
npx eas-cli@latest submit --profile production --platform android  # Play "iç test" kanalına taslak olarak
```

İlk Android gönderiminde Google bir kez elle yükleme isteyebilir: `.aab` dosyasını Play Console → Test → İç test → "Yeni sürüm" ile yükleyin; sonrakiler `eas submit` ile gider (bir Google Cloud hizmet hesabı JSON'u gerekir).

## 5. App Store Connect ✍️

1. **Uygulama kaydı:** Apps → "+" → ad "Dingin: Kulak Çınlaması", birincil dil Türkçe, paket kimliği (§2.1), SKU örn. `dingin-ios`.
2. **Metin ve görseller:** `docs/store-listing.md` §1–2; ekran görüntüleri `docs/store-assets/ios/` (6,9" yuvası). İsterseniz video `dingin-reels.mp4` App Preview için kısaltılabilir (App Preview yalnız uygulama içi görüntü ister; kapanış kartı ve gece sahnesi çıkarılmalı).
3. **Gizlilik politikası URL'si:** `docs/privacy-policy.html` yayımlandığı adres.
4. **App Privacy:** "Data Not Collected".
5. **Yaş derecelendirmesi:** Tıbbi bilgi "sık değil/hafif"; uygulama metni yetişkinler içindir, 18+ seçin.
6. **Kategori:** Health & Fitness (birincil), Medical (ikincil isteğe bağlı).
7. **Fiyat:** Ücretsiz. **Bölgeler:** önce Türkiye (kriz numaraları 112/ALO 183 Türkiye için).
8. **İnceleme notları (App Review Information → Notes, İngilizce yapıştırın):**

```
Dingin is a free tinnitus self-help app by AIHEAR. No account or login is needed; all data stays on the device (no server, no analytics, no ads).
How to review: open the app, tick the consent box, answer the short safety and tinnitus questions (any answers work), then see the step-by-step result and start the programme.
The app gives a preliminary assessment ("likely cause") with a permanent note that a doctor makes the final diagnosis; it routes red-flag answers to urgent care (112) and blocks the programme for emergencies.
Microphone: used only to measure room noise before the optional hearing screen; nothing is recorded. Motion: used only for the optional balance recording.
Background audio: soothing sounds keep playing with the screen off (sleep/sound therapy).
```

9. **Tıbbi uygulama riski:** Apple Yönergesi 1.4.1 kapsamında düzenleyici belge sorulabilir. Önce **TestFlight** ile (iç + harici test) başlamanız önerilir.

## 6. Google Play Console ✍️

1. **Uygulama oluştur:** ad "Dingin: Kulak Çınlaması", varsayılan dil Türkçe, uygulama, ücretsiz.
2. **Mağaza girişi:** kısa ve tam açıklama (`docs/store-listing.md`), ikon `icon-512.png`, öne çıkan görsel `feature-graphic-1024x500.png`, telefon ekran görüntüleri `docs/store-assets/android/`. İsteğe bağlı tanıtım videosu: `dingin-reels.mp4` dosyasını YouTube'a yükleyip bağlantısını ekleyin.
3. **Uygulama içeriği beyanları:**
   - Gizlilik politikası URL'si.
   - **Veri güvenliği:** veri toplanmıyor, paylaşılmıyor; silme uygulama içinde (Ayarlar → Kişiler / Verilerim).
   - **Sağlık uygulamaları beyanı:** sağlık ve fitness, tıbbi bilgi ve öz yönetim; sağlık hizmeti hesabı bağlantısı yok.
   - **Ön plan hizmeti (medya oynatma):** "Uyku ve ses terapisi sesleri ekran kapalıyken çalmaya devam eder." Google kısa bir video isteyebilir: ses oynatıcıda sesi başlatıp ekranı kilitleyen 20 saniyelik bir ekran kaydı yeterli.
   - **Hedef kitle:** 18+. **İçerik derecelendirmesi (IARC) anketi:** şiddet/cinsellik yok; sağlık bilgisi var.
   - **Reklam:** yok.
4. **Test zorunluluğu (önemli):** 2023 sonrası açılan **kişisel** geliştirici hesaplarında üretime çıkmadan önce **en az 12 test kullanıcısıyla 14 gün kapalı test** zorunludur. Şirket (kuruluş) hesabında bu şart yoktur. Kapalı test, planlanan klinik çalışmanın pilotu için de uygundur.
5. **Bölgeler:** önce Türkiye.

## 7. Yayından sonra

- `extra.storeUrls.ios` alanına App Store adresini yazın (davet mesajında görünür).
- Açılış sayfasındaki `#app-store` ve `#google-play` bağlantılarını gerçek mağaza adresleriyle değiştirin.
- 2–4 hafta sonra mağaza A/B testleri (`docs/store-listing.md` §5).
- Reels videosunu AIHEAR sayfalarında kapak `dingin-reels-kapak.jpg` ile paylaşın; açıklamaya açılış sayfası bağlantısını ekleyin.

## 8. Bilinen sınırlar

- Uygulamayı gerçek telefonda mağaza derlemesiyle (EAS) hiç denemedik; ilk iş `preview` APK'sı ve TestFlight sürümüyle baştan sona bir deneme yapın.
- Lint'te 28 uyarı: ses ve test ekranlarında React Compiler uyumluluk önerileri; derleyici kapalı olduğu için çalışmayı etkilemez.
- THI-S kısa form kapalı (madde tablosu doğrulanmadı). THI ticari kullanım izni alınmalı.
- Klinik içerikte uzman onayı bekleyen maddeler: `docs/ROADMAP.md` §13.
- Düzenleyici durum: "olası neden" üreten yazılım AB MDR ve TİTCK'e göre tıbbi cihaz yazılımı sayılabilir; herkese açık yayın öncesi hukuki görüş önerilir.
