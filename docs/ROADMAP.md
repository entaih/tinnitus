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

## 6. Sprint 1 — "sıkılmadan tedavi" (Ekim 2026, `docs/reviews/pm-sprint1.md`)
| # | Madde | Durum |
|---|---|---|
| S1-01 | Kısa kapılı ölçekler: SCI-02, THS-C (2 madde), PHQ-2 + madde 9; tam SCI-8/HQ-14 2. haftada yalnız pozitiflere | ✅ |
| S1-02 | "Bu puan şunu değiştirdi" satırları (`consequences.ts`): ölçek sonu, sonuç ekranı, program uyarlaması | ✅ |
| S1-03 | 1. gün = check-in → Sesinizi bulun → Hoş geldiniz (14 dk); varsayılan 15 dk; en fazla 3 numaralı adım; "Yarın: …" | ✅ |
| S1-04 | Ana ekranda tek dokunuş check-in (0–10) + 7 günlük mini grafik + haftalık karşılaştırma | ✅ |
| S1-05 | Ölçüm haftası günlere yayıldı; 3 maddelik kırmızı bayrak yeniden taraması (kapılı) | ✅ |
| S1-06 | Günlük uygulama rotasyonu (Öst basamakları), 9–12. hafta içeriği, arka plan sesi ayrı satır | ✅ |
| S1-07 | Seans sonu "Günün notu" (24 kaynaklı içgörü) | ✅ |
| S1-08 | "Kısa sürüm" (2–3 dk) kullanıcı seçimli | ✅ |
| S1-09 | Haftalık hedef 5/7 halkası + Pazar haftalık kartı (`/week-review`) | ✅ |
| S1-10 | Güne özel hatırlatma metinleri, 3 gün yeniden giriş bildirimi, ölçüm haftası hatırlatması | ✅ (ölçüm hatırlatması bağlanmadı) |
| S1-11 | Sonuç ekranı "Programınızı belirleyen şeyler" | ✅ |
| S1-12 | Büyüme sayaçları (check-in, kısa sürüm, yeniden giriş, 1→2. gün dönüşü, ölçüm tamamlama) | ✅ |

Sprint 2 adayları ve KPI'lar: `docs/reviews/pm-sprint1.md` §4.

## 7. Sprint 2 — "tanı kararlı, gün hafif" (Ekim 2026, `docs/reviews/pm-sprint2.md`)
| # | Madde | Durum |
|---|---|---|
| A1 | Üretici düzeltmeleri: günde tek çekirdek, 1. hafta 4. gün ≤15 dk, akut kolda her gün uygulama, uyku günlüğü kaldırıldı, hiperakuzi kolunda 1. günden ses | ✅ |
| A2 | Kararlı tanı kartı: tek cümle ön tanı, "En iyi yol", kesinliği artıran uygulama içi ölçümler, dışlanacaklar | ✅ |
| A3 | Düşük uyumda "Dozu düşür" (hafif doz: günde ~8 dk, haftada 1 modül); program tercihleri kalıcı | ✅ |
| A4 | Misofoni (1 soru) ve OSA (2 soru) taraması; OSA şüphesinde uyku sıkıştırma yok, sevk önerisi | ✅ |
| B1 | Bütçe: çekirdek her zaman görünür, haftalık kart hiç gizlenmez; "Bugünün tek şeyi" | ✅ |
| B2 | Check-in: gürlük uydurulmuyor; uyku kolunda "Uyku kalitesi" satırı | ✅ |
| B3 | Modül 2 dakikalık özetleri (38 modül), "Bugün yalnız özet yeter", kaldığı yerden devam | ✅ |
| B4 | Haftalık kart program haftasına göre; "Bu hafta öğrendikleriniz"; 6 dk kısa PMR | ✅ |
| C1 | Ölçüm haftası Pazar hatırlatması bağlandı | ✅ |
| C2 | Perde eşleme → ses otomatik ayarlanır ("Çınlamanıza göre ayarlandı ≈{hz} Hz") | ✅ |
| C3 | Hiperakuzi: "Rahat sesinizi bulun" (−40 dBFS'ten başlar, tavan −18), haftalık +2 dB önerisi | ✅ |
| C4 | Sessiz saatlerde hatırlatma reddi, hafif doz metni, Ayarlar'da program dozu | ✅ |

## 8. Sprint 3 — "ilk değer 3 dakikada, program hiç bitmez" (Ekim 2026, `docs/reviews/pm-sprint3.md`)
| # | Madde | Durum |
|---|---|---|
| A1 | Program sonu + bakım modu (4 haftalık bloklar, her 4. Pazar THI) + THI +13'te tazeleme bloğu; yeniden başlat | ✅ |
| A2 | "Kesinlik arttı" döngüsü (tanı anlık görüntüsü, ölçüm sonrası karşılaştırma, kesinlik çubuğu); yolculuk: güvenlik → sesi dene → THI → ön izleme → öykü → koşullu → ruh hali tek ekran → sonuç (≈9 dk) | ✅ |
| A3 | Üretici: hiperakuzi 1. gün numaralı "Rahat sesinizi bulun", modül kaydırma Pazar'a gitmez, hafif doz 2 dk özetlerle ≤8 dk, RI 4. güne | ✅ |
| A4 | THI-S (madde tablosu doğrulanamadı → kapalı); depolama budama (oturum ≤500, günlük ≤730 gün) | ✅ / 🧪 |
| B1 | Tek ekran onboarding → doğrudan güvenlik taraması; bildirim izni ilk seans sonrası karta taşındı | ✅ |
| B2 | Bitiş/bakım ana ekranı, haftalık hedef 3, "2 dk özet" etiketi | ✅ |
| B3 | Paylaşım anları (ilk hafta, hedef, THI −7, program bitti, 12 hafta bakım; haftada en fazla 1) + davet bağlantısı + klinik kodu satırı | ✅ |
| B4 | Değerlendirme sekmesi yolculukla uyumlu, erişilebilirlik değerleri, ana ekran performansı | ✅ |
| C1 | "Sesi dene" 60 sn deneme modu; kulaklık kontrolü bir kez | ✅ |
| C2 | Bakım hatırlatmaları haftada 3; program bitti bildirimi; izin-sonra-değer | ✅ |
| C3 | Hafif doz/bakım ses hedefleri; sessiz saatte uyku sesi 45 dk zamanlayıcı | ✅ |
| C4 | Ayarlar "Programım" (durum, doz, yeniden başlat, hatırlatma günleri) | ✅ |

## 9. Kişiler (Ekim 2026, sahip isteği)
- ✅ Ayarlar → Kişiler: yeni kişi oluştur (adını girince her şey o kişi için sıfırdan başlar ve güvenlik taramasına gidilir), kişi değiştir, kişi sil (verileri cihazdan silinir; son kişi silinemez, verileri temizlenir).
- Her kişinin klinik verisi, büyüme sayaçları ve modül ilerlemesi ayrı AsyncStorage anahtarlarında tutulur (`src/store/profileRules.ts`, `profiles.ts`, `profileSwitch.ts`); ilk kişi eski anahtarları kullandığı için mevcut kurulumlar veri kaybetmez. Dil, tema, hatırlatma ve ses güvenliği ayarları cihaz genelidir.

## 10. Sahip kararları (Ekim 2026)
- ✅ Testlerden sonra sade, adım adım sonuç akışı: 1) sonuç (renkli daire + tek cümle), 2) doktor (yalnızca gerekiyorsa: kime, ne zaman), 3) olası neden (gündelik dille, kesinlik), 4) program (günde kaç dakika, kaç hafta, ne içeriyor) ve tek "Programı başlat" düğmesi. Teknik ayrıntılar "Ayrıntılı rapor (doktor için)" altında.
- ✅ "Programı başlat" artık onay kutusu beklemiyor; 2. kademe sevkte hatırlatma ekranda yazar. Acil durumlarda program yerine "Önce doktora gidin" gösterilir.
- ✅ Yalnızca takip amaçlı sorular kaldırıldı: günlük check-in görevi ve ana ekran puanlama kartı, 4. hafta THI, 8/12. hafta kaygı ve uyku tekrarları. Tedaviyi veya güvenliği değiştirenler kaldı: 8. hafta ve program sonu THI, ruh hali taraması, 3 soruluk kırmızı bayrak kontrolü, bakım modunda 4 haftada bir THI (tazeleme kararı).
- ✅ Uyku sorularında seçenekler şıklarda; sorular arasında kayma geçişi; ek ruh hali sorularının nedeni ve ayrı "Ek soru" sayacı; 60 sn deneme sayacı düzeltildi.

## 11. Yayına hazırlık (Ekim 2026)
- ✅ Deneme sesi yolculuktan çıkarıldı (ses, 1. günde çınlamaya göre ayarlanan "Sesinizi bulun" ile geliyor).
- ✅ Mağaza yapılandırması, EAS profilleri, gizlilik bildirimi, izin metinleri, bildirim ikonu, hata ekranı, gizlilik/KVKK ve kullanım koşulları ekranı, yayın kapısı betiği, lint kurulumu.
- ✅ Bağımsız yayın denetimi: engelleyiciler ve metin sorunları giderildi; sonuç ekranı program varken de sade adımlarla açılıyor.
- ⏭ Sahibin yapacakları: `docs/RELEASE.md` §2 (hesaplar, veri sorumlusu bilgisi, gizlilik politikası adresi, THI izni, ekran görüntüleri).

## 12. UX turu (Ekim 2026, proje yöneticisi incelemesi)
- ✅ Görseller: giriş görseli, olası nedenin kulak/baş şemasında işaretlenmesi, kulaklık (SOL/SAĞ) çizimi, ders kapak görselleri (`src/components/illustrations/`).
- ✅ Yolculukta testlerin önündeki "Başla" kartı atlanıyor (4 dokunuş daha az); ilk soruda kısa amaç cümlesi.
- ✅ Giriş ekranı: tek başlık, üç kısa madde, tek satır onay, köşede dil seçimi.
- ✅ Ana sayfa: tek arka plan sesi (gece uyku sesi, gündüz rahatlatan ses), tekrar eden "Sıradaki" kutusu ve çelişen haftalık sayılar kaldırıldı, takip amaçlı THI eğilimi kaldırıldı.
- ✅ Ad çakışması giderildi ("Ses neden rahatlatır?" dersi, "Rahatlatan arka plan sesi"); "Zihin" sekmesi "Dersler"; "Ses Laboratuvarı" → "Sesler"; sekme yazıları büyütüldü.
- ✅ Program ekranı: görev satırının tamamı dokunulabilir, ad kesilmiyor; tek "Süreyi ve tarzı değiştir" düğmesi.
- ✅ İlerleme: üstte "Programım" (hafta, bitirilen ders, etkin gün); boş grafikler gizleniyor. Haftalık kartta boş rahatsızlık kartı gizleniyor.
- ✅ Sade dil: seans açıklamaları, kısaltmalar (BDT-U, SCI-8, HQ-14, Temel BDT) gündelik dile çevrildi.
