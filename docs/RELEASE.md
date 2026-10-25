# Dingin — Yayın rehberi (App Store / Google Play)

Güncelleme: 25 Ekim 2026 · sürüm 1.0.0 · Expo SDK 58

## 1. Hazır olanlar

| Alan | Durum |
|---|---|
| Uygulama kimliği | iOS `com.aiheartech.tinnova`, Android `com.aiheartech.tinnova`, ad "Dingin", sürüm 1.0.0 (derleme numaraları EAS tarafından otomatik artar) |
| İkonlar | 1024 px uygulama ikonu, Android uyarlanabilir ikon (ön, arka, tek renk), açılış görseli, Android bildirim ikonu (`assets/notification-icon.png`) |
| İzin metinleri | Mikrofon ve hareket algılayıcısı açıklamaları Türkçe ve İngilizce (`locales/`), kullanılmayan Android izinleri engellendi (adım sayar, harici depolama, üstte gösterme) |
| iOS gizlilik bildirimi | `ios.privacyManifests`: takip yok, veri toplama yok, gerekli API gerekçeleri tanımlı; şifreleme beyanı `usesNonExemptEncryption: false` |
| Yalnız telefon | iPad desteği kapalı (iPad ekran görüntüsü gerekmez) |
| Derleme profilleri | `eas.json`: `preview` (iç dağıtım, Android APK) ve `production` (mağaza, Android App Bundle, otomatik derleme numarası) |
| Hata ekranı | Beklenmeyen bir hatada boş ekran yerine "Bir şeyler ters gitti · Tekrar dene" ekranı (`app/_layout.tsx`) |
| Gizlilik ve koşullar | Uygulama içinde (`/privacy`, Ayarlar → Gizlilik ve ilk ekran) ve mağaza için `docs/privacy-policy.md` |
| Mağaza metni | `docs/store-listing.md` (TR + EN, ekran görüntüsü planı) |
| Kalite | TypeScript hatasız, birim testleri geçiyor, iOS ve Android paketleri derleniyor, `expo-doctor` 18/20 (kalan 2 kontrol yalnızca internet erişimi ister) |
| Yayın kapısı | `npm run release:check`: gizlilik iletişim bilgisi boşsa derlemeyi durdurur |

## 2. Yalnızca sizin yapabileceğiniz adımlar

1. **Hesaplar:** Apple Developer Program (yıllık ücretli) ve Google Play Console (tek seferlik ücret) hesapları; Expo hesabı (ücretsiz).
2. **Veri sorumlusu bilgisi:** `app.json` → `expo.extra.legal.controller` (şirket unvanı) ve `contact` (destek e-postası). `docs/store-listing.md` ve `docs/privacy-policy.md` içindeki `[İLETİŞİM]` / `[VERİ SORUMLUSU]` alanları.
3. **Gizlilik politikası adresi:** `docs/privacy-policy.md` dosyasını herkese açık bir adreste yayımlayın (şirket sitesi veya GitHub Pages). Bu adres iki mağazada da zorunludur.
4. **THI kullanım izni:** Tinnitus Handikap Envanteri'nin ticari kullanımı için yazar/yayıncı izni (README notu).
5. **Ekran görüntüleri:** `docs/store-listing.md` §3'teki 6 kare (iPhone 6,9" ve Android telefon).
6. **App Store bağlantısı:** uygulama App Store'da oluşturulunca adresini `app.json` → `extra.storeUrls.ios` alanına yazın (davet mesajında görünür).

## 3. Komutlar (proje klasöründe, sırayla)

```bash
npx eas-cli@latest login
npx eas-cli@latest init            # projeyi Expo hesabınıza bağlar (bir kez)
npm run release:check              # eksik yapılandırma varsa durur
npx eas-cli@latest build --profile preview --platform android    # telefonda denemek için APK
npx eas-cli@latest build --profile production --platform all      # mağaza derlemeleri
npx eas-cli@latest submit --profile production --platform ios      # TestFlight'a
npx eas-cli@latest submit --profile production --platform android  # Play "iç test" kanalına (taslak)
```

Not: Uygulama yalnızca Expo modülleri kullanır; Xcode veya Android Studio gerekmez, derleme EAS bulutunda yapılır.

## 4. Mağaza formlarındaki yanıtlar

**App Store Connect → App Privacy:** "Data Not Collected" (veri toplanmıyor). Tüm veriler cihazda; sunucu, analiz, reklam yok.

**Google Play → Veri güvenliği:** Veri toplanmıyor, paylaşılmıyor. Şifreleme: veri cihazdan çıkmadığı için aktarım yok. Silme: uygulama içinde (Ayarlar → Kişiler / Verilerim).

**Google Play → Ön plan hizmeti beyanı:** Arka planda ses çalma (medya oynatma). Gerekçe: uyku ve ses terapisi sesleri ekran kapalıyken devam eder.

**Google Play → Sağlık uygulamaları beyanı:** Sağlık ve fitness; tıbbi bilgi ve öz yönetim. Hesap veya sağlık hizmeti bağlantısı yok.

**Yaş derecelendirmesi:** Tıbbi/tedavi bilgisi "sık değil" düzeyinde; hedef kitle 18+.

**Kategori:** Sağlık ve Fitness.

## 5. Düzenleyici risk (önemli)

Uygulama "ön tanı" üretiyor ve hangi hekime ne zaman gidileceğini söylüyor. AB MDR Kural 11 ve Türkiye TİTCK düzenlemesine göre bu, yazılım olarak tıbbi cihaz (en az Sınıf IIa) kapsamındadır. Uygun yol, planladığınız klinik araştırmayla uyumlu olarak:

1. **Önce kapalı dağıtım:** TestFlight (iOS) ve Google Play iç/kapalı test kanalı. Katılımcılar davetle girer; bu, klinik araştırma için de uygun kanaldır. `eas.json` Android gönderimi bu yüzden "internal" kanalına taslak olarak ayarlıdır.
2. **Herkese açık yayın:** CE/MDR belgesi veya hukuki görüş alındıktan sonra.

Mağaza incelemesi açısından: Apple Yönergesi 1.4.1 ve Google Play sağlık politikası, onaysız tanı iddiası taşıyan uygulamaları reddedebilir. Bu yüzden mağaza metni "ön değerlendirme" der; uygulama içinde "Ön tanı" her yerde "hekim muayenesinin yerine geçmez" notuyla gösterilir ve acil durumlarda program yerine 112/doktor yönlendirmesi çıkar.

## 6. Bilinen sınırlar

- `npx expo lint` bu geliştirme ortamında çalıştırılamadı (ESLint yapılandırması internetten indirilemedi). TypeScript ve birim testleri temiz.
- Uzaktan güncelleme (EAS Update) kurulu değil; her değişiklik yeni derleme gerektirir. İstenirse sonradan eklenebilir.
- THI-S kısa formu kapalı: madde tablosu doğrulanana kadar kullanılmıyor.
