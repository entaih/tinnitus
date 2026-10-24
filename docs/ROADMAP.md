# Dingin — Ürün yol haritası (proje yönetimi özeti)

Kaynak: `docs/reviews/physician.md`, `audiologist.md`, `ux.md`, `marketing.md` (Ekim 2026). Durum sütunu: ✅ yapıldı · 🔧 yapılıyor · ⏭ sonraki sürüm · 🧪 klinik doğrulama gerektirir.

## 0. İlke kararları
- Dingin **ön tanı koyar** (ölçüt tabanlı tanısal karar desteği, ICD-10 kodlu, kesinlik dereceli). Ürün stratejisi: klinik araştırma ile doğrulama ve MDR sertifikasyonu; sertifikasyona kadar "araştırma sürümü, hekim doğrulaması zorunlu" beyanı. Dışlanması gereken durumlar ayırıcı tanı olarak her zaman listelenir.
- Her çıkış (ekran, PDF, mağaza metni) "kanıta dayalı öz yönetim programı" der; "tedavi eder / tamamen düzelir" yasak.
- Tek doğruluk kaynağı: `computeTriage` — her ekran aynı kademeyi gösterir.
- Telefonla yapılan testler "ekran tahmini / kayıt"tır; normal–anormal etiketi yok.

## 1. Kullanıcıya vermeden önce şart (tamamı uygulandı veya uygulanıyor)
| # | Madde | Kaynak | Durum |
|---|---|---|---|
| 1 | 12 kırmızı bayrak yanıtının tamamı kalıcı; en yüksek kademe + tüm nedenler; sonuç/program aynı motor | Hekim A1 | ✅ |
| 2 | Kriz yolu: 112/acil servis, güvenli bekleme talimatı, ALO 183 "sosyal destek" olarak; her yerden erişilen çevrimdışı kriz kartı + 3-3-3 güvenlik planı | Hekim A2 | ✅ metin · 🔧 kriz kartı |
| 3 | Muayene kontrendikasyon kapısı (Valsalva, boyun basısı kaldırıldı, denge, LDL) | Hekim A3 | 🔧 |
| 4 | Neden sıralaması: "önce dışlanmalı / olası mekanizma", yüzdesiz, dürüst tedavi etiketleri | Hekim A4 | ✅ |
| 5 | Pulsatil + uyarıcı bulgu → 2 hafta; pulsatil/2. kademede program öncesi "randevumu aldım" onayı | Hekim A5 | ✅ kademe · 🔧 onay kapısı |
| 6 | İşitme taraması birimi (dBFS → kaba dB HL tahmini ±15, raporda açık etiket) | Odyolog A1 | ✅ |
| 7 | MML ve RI aynı uyaranla; "maskelenmedi" bayrağı; RI pozitif tanımı tutarlı | Odyolog A2–A3 | ✅ model · 🔧 ekranlar |
| 8 | Test tonları −12 dBFS + float kazanç + TPDF dither; taban −90 dB | Odyolog A4 | ✅ |
| 9 | Stereo WAV ile tek kulaklı sunum; kulaklık doğrulama sol/sağ | Odyolog A5 | ✅ altyapı · 🔧 ekranlar |
| 10 | Yolculuk sırası: güvenlik → öykü → THI → koşullu ölçekler → sonuç; neden soruları ve telefon testleri 1. hafta isteğe bağlı | UX A1 | ✅ |
| 11 | Sonuç ekranı katmanlı, yapışkan CTA, puan tek kez | UX A2 | 🔧 |
| 12 | Program bütçesi: arka plan sesi dakikaya sayılmaz, "(deneysel)" başlıktan çıkar, günlük plan tercihi aşmaz | UX A3 | 🔧 |
| 13 | Kontrast: koyu tema düğme, muted metin, sekme, kenarlık, grafik renkleri | UX A4 | ✅ |
| 14 | Türkçe ı/İ büyük harf hatası, ünlü uyumu, THI tek ad, sekme adı | UX A5 | ✅ |

## 2. Yüksek etkili (bu sürüm)
- ✅ THI alt ölçek (madde 17), SCI bantları, HQ rozeti "uzman"; çentikli ses "deneysel, düşük kanıt"
- ✅ Doktor özeti: triyaj kademesi, yaş, önceki odyometri, PHQ-9 madde 9, tüm bayraklar, kaba HL tahmini
- ✅ PHQ-9 4. haftada, kırmızı bayrak 8. haftada; hafif sürümde 6. hafta nüks önleme; hiperakuzi kolunda maruz kalma yerine hiyerarşi; somatik 6 hafta kuralı
- ✅ İşitme cihazı önceliği (PTA ≥40 / iletişim güçlüğü), KI adaylığı önerisi (PTA ≥70), "bir kez odyoloji" önerisi
- ✅ Türkiye sevk ifadeleri (MHRS, hastane odyolojisi, FTR, aile hekimi → psikiyatri)
- 🔧 Seans tamamlanma hissi, kaçırılan gün yeniden giriş, "5/7 gün", sözlük, gelişmiş karıştırıcı gizli
- 🔧 Telefon testleri yeniden etiketleme (DIN kayıt, ses rahatlık öz-bildirimi, denge kaydı), perde eşlemede değişen başlangıç çiftleri ve yakalama denemeleri
- 🔧 Klinik kodu, paylaşılabilir ilerleme kartı, davet bağlantısı, haftalık özet bildirimi, kanıt sayfası, mağaza metni, yerel huni sayaçları

## 3. Sonraki sürümler
- ⏭ Misofoni 2 maddelik tarama; uyku sıkıştırma kontrendikasyon soruları uygulama içinde; OSA 2 madde (Hekim B5–B6)
- ⏭ Kulaklık profili kalibrasyon tablosu; biyolojik (kendi eşiğiyle) kalibrasyon; tinnitus spektrum benzerlik derecelendirmesi (Odyolog yenilikçi 1–3)
- ⏭ Kaydedilmiş Türkçe rakam üçlüleriyle DIN (antifazik seçenek) ve norm çalışması
- ⏭ Rehberli (klinisyen eşlikli) katman; B2B2C klinik paneli; ödeme (uygulama içi satın alma) — Expo Go dışında geliştirme derlemesi gerekir
- ⏭ Web açılış sayfası ve blog (SEO), ASO görselleri, kongre/klinik pilotu (Pazarlama 0–90 gün planı)

## 4. Klinik doğrulama ve düzenleyici
- 🧪 Triyaj + neden sıralaması SaMD kapsamındadır (MDR IIa / TİTCK). Mağaza sürümü öncesi: amaçlanan kullanım beyanı, klinik değerlendirme planı (sahte kontrollü RKÇ, THI birincil, 13 puanlık TFI/7 puanlık THI yanıt analizi), olumsuz olay bildirimi ("kötüleşme bildir"), THI yazar izni, HQ-R lisansı, KVKK aydınlatma ve ayrı rıza.
- 🧪 Telefon testlerinin eşik değerleri (DIN −8 dB, LDL, sallanma 12) norm çalışması yapılmadan karar verici olamaz; şimdilik "kayıt".
- 🧪 Danışma kurulu: KBB, odyoloji, klinik psikoloji; "gözden geçiren" satırı makalelerde gerçek kişi adıyla.

## 5. Başarı ölçütleri (pazarlama ile uyumlu)
Kurulum → değerlendirme tamamlama ≥ %40 · değerlendirme → program ≥ %60 · D7/D30 ≥ %25/%12 · 4. haftada THI ≥ 7 puan düşüş gösteren kullanıcı ≥ %40 · klinik kodlu kurulum payı izlenir.
