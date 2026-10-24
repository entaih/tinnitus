# Dingin — UX İncelemesi (Ekim 2026)

**Kapsam:** `docs/DESIGN.md`, `docs/ARCHITECTURE.md`, `src/theme/tokens.ts`, paylaşılan bileşenler, Home/Assess/Sound/Mind/Progress sekmeleri, onboarding, seans koşucusu, değerlendirme akışı (triage, öykü, nedenler, THI, otomatik muayene, sonuçlar), program, oynatıcı, modül ve ayarlar ekranları; `scratchpad/shots/` altındaki tüm ekran görüntüleri (j-* ve k-* en güncel indigo paleti, eskiler teal paleti; `k-results-causes*.png` boş siyah çıktı, değerlendirilemedi).
**Yöntem:** Sezgisel inceleme (Nielsen + dijital sağlık güven ölçütleri), kod düzeyinde erişilebilirlik denetimi, WCAG 2.2 kontrast hesapları (göreli parlaklıkla, aşağıdaki tüm oranlar hesaplanmıştır), "55 yaşında, kaygılı, ilk kez kullanan" persona ile uçtan uca yürüyüş.

## Genel değerlendirme

Yolculuk kartı, uyarlanır anketler ve seans koşucusu doğru yönde büyük adımlar; ürün artık "ne yapacağımı söyle" sorusuna cevap veriyor. Ancak üç yapısal sorun kurucunun geri bildirimini hâlâ geçersiz kılıyor:

1. **Yolculuk hâlâ uzun ve yanlış sıralı.** `src/clinical/journey.ts` neden sorularını (2 dk) ve "Otomatik muayene"yi (8 dk) THI'den *önce* ve zorunlu koyuyor; ilk programa ulaşmak 9 adım / ~17 dk (k-home.png). Kaygılı bir kullanıcı denge testinde telefonu göğsüne bastırırken henüz "benim programım"ı görmemiş oluyor.
2. **Sonuç ekranı 6–7 ekran boyu** ve asıl eylem ("Programı başlat") en altta.
3. **Program "güçlü" değil, "şişkin" görünüyor.** 30 dk seçen kullanıcıya "Toplam yaklaşık 162 dk" ve "Çentikli ses (deneysel) · 120 dk" gösteriliyor (j-program.png, j-session.png).

Persona yürüyüşü (kurulum → "programım"): onboarding 5 ekran (~2 dk) → Home → 9 adımlı yolculuk (~17 dk, 25 soruluk THI dâhil ~70 soru + 5 fiziksel test) → uzun sonuç ekranı → "Programı başlat". Hedef: **≤ 4 zorunlu adım, ≤ 10 dk, sonuç ekranında tek dokunuşla program.**

---

## A) Mutlaka düzeltilmeli (5)

### A1. Yolculuk sırası ve süresi — neden soruları ve muayene THI'nin önüne alınmış
- **Önem:** Kritik (zaman-değer, terk riski)
- **Ekran / dosya:** Home yolculuk kartı; `src/clinical/journey.ts` (`computeJourney`), `src/components/home/JourneyCard.tsx`, `journey.title.*`, `journey.why.*`
- **Değişiklik:**
  - Sıra: `safety → history → thi → (hq | rasst | sci koşullu) → phq → gad → results`. `causes` ve `exam` yolculuktan çıkarılıp **programın 1. haftasına "isteğe bağlı: sonucu keskinleştir" görevi** olarak eklenmeli (`src/clinical/program.ts`); sonuç ekranında da "Daha kesin sonuç için 2 kısa adım" bağlantısı kalmalı.
  - `journey.title.exam` "Otomatik muayene" → **"Telefonla kısa testler"**; `assess.module.exam` aynı.
  - Kalan süre etiketi gerçek toplamı göstersin; ilk ekranda "Yaklaşık 8 dakika, 3 kısa bölüm" cümlesi hero'da yer alsın.
  - Öykü girişindeki tutarsızlık: `history.intro.body` "Yaklaşık 14 kısa soru" diyor, meta satırı "8 soru" (j-history.png). Metin: "8 kısa soru. Yanıtlarınız programın hangi parçalarının size uygun olduğunu belirler."

### A2. Sonuç ekranı: eylem gömülü, katman yok
- **Önem:** Kritik
- **Ekran / dosya:** `app/assess/results.tsx`; `results.*`, `causes.result.*`
- **Değişiklik:** Aşağıdaki "İdeal sonuç sayfası" yapısı. Somut olarak:
  - `Screen footer` ile **yapışkan "Programı başlat"** (program varsa "Bugünün seansına git"). Mevcut CTA kartı en alttan kaldırılır.
  - Puan üç kez gösteriliyor (gösterge "40", "THI / 100", rozet "Orta · 40"). Tek gösterim: gösterge içinde `numeric` 40, altında `caption` "Çınlama etki puanı · 100 üzerinden · Orta".
  - "Olası nedenler", "Olası profil", "Doktorunuza söyleyebilecekleriniz", "Önceki ölçümle karşılaştırma" **varsayılan kapalı akordeon** (`accessibilityState.expanded`), başlık + tek satır özet.
  - Triage `Banner` yalnızca `triage !== 'selfcare'` ise tam banner; selfcare durumunda gösterge kartının altında tek satır: "Acil bir bulgu yok — programa başlayabilirsiniz" (`results.triage.selfcare` yeniden yazılır).
  - `results.profile.hint` overline olarak iki satır büyük harf basılıyor; `caption` tonuna indirilmeli (bkz. A5).

### A3. Program bütçesi ve "deneysel" görev güveni zedeliyor
- **Önem:** Kritik (güven, "tedavi güçlü hissettirmeli")
- **Ekran / dosya:** `app/session.tsx`, `app/program/index.tsx`, `src/components/home/TaskRow.tsx`, `src/clinical/program.ts`, `prog.minutesTotal`, `session.hero.body`
- **Değişiklik:**
  - Ses görevleri (`type === 'sound'`) **aktif dakika bütçesine sayılmaz**; görev satırında süre yerine "Arka planda · en az 30 dk" etiketi; `prog.minutesTotal` yalnızca aktif görevleri toplar ("Bugün yaklaşık 14 dk + arka plan sesi").
  - Program görev başlıklarında "(deneysel)" eki olmaz. Deneysellik, oynatıcıdaki `Chip tone="warning"` ile zaten belirtiliyor; programda görev adı "Çentikli ses — arka planda".
  - Günlük plan `minutesPerDay` tercihini aşamaz; üretici 30 dk için ≥ 4 aktif görev koyuyorsa haftaya yaymalı (6/6 görev + 162 dk = kullanıcı "beceremem" der).
  - Seans koşucusunda ses görevi başlatılınca otomatik "tamamlandı" sayılıyor (`completeTask` at start). Bunun yerine durum: "Çalıyor" (MiniPlayer ile bağlı), 10 dk sonra tamamlandı.

### A4. Kontrast hataları — koyu temada birincil düğme AA'yı geçmiyor
- **Önem:** Kritik (erişilebilirlik; hedef kitle 45+)
- **Dosya:** `src/theme/tokens.ts`
- **Hesaplanan oranlar ve düzeltmeler:**

| Çift | Mevcut | Hedef / yeni değer |
|---|---|---|
| Koyu tema `onPrimary` beyaz / `primary` `#818CF8` | **2.98:1 ✗** | `onPrimary: palette.inkDark` → 6.41:1 (DESIGN.md §2 zaten böyle) |
| Gece `#FFFFFF` / `#6366F1` | 4.47:1 ✗ (sınırda) | gece `primary: palette.primary[600]` → 6.29:1 |
| Açık `textMuted #6B7488` / bg `#F6F7FB` (13 px caption: "1 dk", "Yapılmadı · 3 dk") | 4.38:1 ✗ | `#5B6478` → 5.54:1 |
| `tabInactive #98A2B3` / beyaz (11 px sekme etiketi) | 2.58:1 ✗ | `palette.neutral[500] #6B7488` → 4.69:1 |
| `borderStrong #C5CBD8` / beyaz (seçilmemiş seçenek kartı kenarı, tek göstergeli sınır; WCAG 1.4.11 ≥ 3:1) | 1.63:1 ✗ | `#8E97A8` → 2.94:1 ve OptionCard'a 1.5 px kenar + `neutral[50]` dolgu farkı |
| `accent #F97316` (alev simgesi, grafik "Rahatsızlık" çizgisi) / beyaz | 2.80:1 ✗ | grafik için `chart.annoyance: '#C2410C'` → 5.18:1 |
| Hero gradyanı üstünde `rgba(255,255,255,0.75)` caption | ≈3.98:1 ✗ | opaklık 0.85 ve gradyan koyulaştırma (B1) → ≥ 6:1 |

Geçenler (bilgi): metin 17.2, ikincil 7.0, beyaz/primary 6.3, `info` 5.5, `warning` 4.5 (sınırda, rozetlerde 13 px 600 ağırlık; `#92400E`'ye çekilirse 5.9).

### A5. Türkçe doğruluk ve terim tutarlılığı
- **Önem:** Kritik (profesyonel izlenim)
- **Dosya / anahtar:** `src/theme/tokens.ts` (`type.overline.textTransform`), `src/components/Text.tsx`, `progress.thi.summary`, `journey.title.thi`, `assess.module.THI`, THI `name`, `tab.assess`, `assess.title`
- **Değişiklik:**
  - `textTransform: 'uppercase'` Türkçe'de **ı/i** ayrımını bozuyor: ekranda "YALNIZCA **BIR HEKIM**", "ETK**I**LEYEN" (k-results-2.png). Token'dan `textTransform` kaldırılır; `Text` bileşeni `variant === 'overline'` için `String(children).toLocaleUpperCase('tr-TR')` uygular (`en` için `'en-US'`).
  - `progress.thi.summary` "{a}'den {b}'ye" sabit ekleri ünlü uyumunu bozuyor ("40'ye", j-progress.png). Cümle eksiz yazılmalı: **"THI puanı: 62 → 40 (düşüş · anlamlı değişim)"**.
  - Aynı ölçek üç adla geçiyor: "Çınlama etkisi (THI)", "Tinnitus etkisi (THI)", "Tinnitus Engellilik Envanteri (THI)". Tek ad: **"Çınlama etki puanı (THI)"**; "Engellilik Envanteri" yalnızca kaynak sayfasında.
  - Sekme "Ölçümler", ekran başlığı "Değerlendirme", bölüm "Ölçümler (isteğe bağlı…)", kart "Değerlendirmeye dön". Tek terim: sekme ve başlık **"Değerlendirme"**, kulaklıklı testler bölümü **"Ses testleri"**. (Eski görüntüde sekme etiketi "Değerlend…" kesiliyordu; etiket ≤ 10 karakter: "Ölçüm" yerine "Değerlendir" de kesilir — "Testler" kabul edilebilir.)
  - "Tinnitus" / "çınlama" karışık (onboarding "Tinnitus yaygındır", yolculuk "Çınlama"). Kural: kullanıcıya dönük metinlerde **çınlama**, başlık/doktor özeti/kaynaklarda **tinnitus**.

---

## B) Yüksek etkili (10)

### B1. Renk: indigo doğru, gradyan ve turuncu "jenerik SaaS" okunuyor
- **Önem:** Yüksek · `src/theme/tokens.ts`
- İndigo→mor gradyan (`#4F46E5 → #7C3AED`) ve `radius.lg 20 / xl 28` kartlar klinik üründen çok fintech/AI ürünü hissi veriyor. Öneri: `gradient: ['#4338CA', '#3730A3']` (tek ton, derinlik; beyaz metin 7.9 / 9.9:1), koyu tema `['#3730A3', '#312E81']`; `radius.lg: 16`, `xl: 24` (DESIGN.md ile uyumlu). `accent` ailesi: `100: '#FFF3E8'`, `500: '#E8873A'` (yalnızca simge), `700: '#9A3412'` (metin, 6.7:1 açık zeminde). Alev simgesi (`Flame`) yerine `CalendarCheck`; "Bu hafta 7 gün" rozeti böylece "kampanya etiketi" gibi durmaz.

### B2. Seans koşucusu: geri bildirim ve bitiş anı yok
- **Önem:** Yüksek · `app/session.tsx`, `session.*`
- Görevden dönüşte sessizce ilerliyor; gün sonunda yalnızca başlık değişiyor; tamamlananlar üstü çizili (okunurluk düşük). Değişiklik: (1) dönüşte 1,5 sn `Banner tone="success"` "Nefes egzersizi tamamlandı · 5 dk"; (2) son görevden sonra tam ekran bitiş kartı: büyük onay işareti (400 ms tek çizgi, konfeti yok), "Bugünkü seans tamamlandı", "4 adım · 18 dk · bu hafta 5. gün", tek düğme "Ana sayfaya dön", ikincil "Yarın ne var?"; (3) üstü çizili yerine `Check` + `tone="secondary"`; (4) "Tamamlandı say" düğmesi `ghost` değil "⋯" menüsüne taşınır (şu an atlamayla eşit ağırlıkta, yanlış işaretlemeyi teşvik ediyor).

### B3. Kaçırılan günler ve haftalık anlatı — suçluluk yaratmadan
- **Önem:** Yüksek · `app/(tabs)/index.tsx`, `app/program/index.tsx`, `home.weekly.*`, `notif.*`
- "Bir süre ara vermişsiniz" kartı yalnızca Program ekranında; Home'da ≥ 2 boş günden sonra hero alt başlığı "Kaldığınız yerden devam edin — hiçbir şey kaybolmadı" olmalı ve o günün planı **en kısa iki göreve** indirilmeli (yeniden giriş eşiği). "Program uyumu %77" bir not gibi okunuyor → "Bu hafta 5 / 7 gün" (yüzde yalnızca İlerleme sekmesinde). Pazar günleri hero altına "Haftanın özeti" kartı: tamamlanan gün sayısı, en çok yapılan uygulama, THI'ye kadar kalan hafta. Bildirim metni tek tip (`notif.body`); üç varyant döndürülmeli, kaçırılan günden sonra "Bugün 5 dakika yeter" tonu. Hatırlatma saati onboarding'de "Günün hangi saatinde 10 dakikanız olur?" sorusuyla seçilsin (`reminderHour` zaten var).

### B4. Anket madde ekranı
- **Önem:** Yüksek · `src/components/OptionCard.tsx`, `src/components/assess/QuestionStep.tsx`, `app/assess/questionnaire/[id].tsx`
- Seçilmemiş seçenek kartları zeminden neredeyse ayrılmıyor (1.25:1); THI seçeneklerinde "(0) (2) (4)" puan ipuçları yanıtı yönlendiriyor ve gereksiz — kaldırılmalı (`hint` yalnızca `q.id === 'THI'` satırı). "Geri" 44 pt'lik ghost düğme ekranın sol üstünde küçük; altta tam genişlikte `secondary` olarak durmalı. Boş alan büyük: madde `h3` yerine `h2`, seçenekler 64 pt. İlk maddede bir kez: "Seçince otomatik ilerler; Geri ile değiştirebilirsiniz."

### B5. Jargon sözlüğü (tek seferde uygulanacak değişiklikler)
- **Önem:** Yüksek · `src/i18n/tr.ts`, `areas/assess.ts`, `areas/core.ts`, `areas/sound.ts`
- `evidence.rct` "RKÇ destekli" → **"Klinik çalışmalarla desteklenir"**; `evidence.guideline` → **"Tıbbi kılavuz önerisi"**; `evidence.expert` → "Uzman görüşü" (kalır).
- "Rezidüel inhibisyon" → **"Ses sonrası sessizlik (RI)"**; "Perde eşleme" → **"Çınlama tonu"**; "dB SL", "MML" yalnızca doktor özetinde; kullanıcıya "Maskeleme düzeyi: sesin çınlamayı örttüğü düzey".
- `results.triage.selfcare` "Öz yönetim programı uygun görünüyor" → **"Programa başlayabilirsiniz"**; "sevk" → "yönlendirme"; `causes.result.overline` "Organ ve mekanizma düzeyinde sıralama" → kaldır.
- "BDT" ilk geçtiği yerde açılır: "düşünce ve davranış çalışması (BDT)". `setup.style.*` seçenekleri "Hangi yaklaşımı tercih edersiniz?" sorusu 55+ kullanıcıya anlamsız; varsayılan BDT ile atlanabilir, "Gelişmiş" altında.
- `lab.title` "Ses Laboratuvarı" → **"Sesler"** (sekmeyle aynı). "Otomatik muayene" → "Telefonla kısa testler".

### B6. Olası nedenler kartı: ton ve sahte kesinlik
- **Önem:** Yüksek · `src/components/assess/CauseList.tsx`, `causes.*`, neden içerikleri
- "Kaybolan tüy hücreleri geri gelmez" kaygılı kullanıcıya ilk sonuç ekranında söylenecek cümle değil; "İç kulaktaki değişiklik kalıcı olabilir; ancak çınlamanın etkisi azaltılabilir ve işitme cihazı belirgin fayda sağlar." Yüzdeler ("%32") tanı olasılığı gibi okunuyor; yalnızca üç sözel düzey ("Daha olası / Olası / Düşük") ve ilk aday açık, diğerleri "Diğer 2 adayı gör". "Merkezi (birincil) çınlama — işitme ağında kazanç artışı" → "Beyin kaynaklı çınlama (işitme yollarında aşırı duyarlılık)". Kartın kendisi A2'de akordeon.

### B7. Gezinti: Program'ın kalıcı yeri yok, ayarlar tutarsız
- **Önem:** Yüksek · `app/(tabs)/_layout.tsx`, `app/(tabs)/assess.tsx`, `app/(tabs)/sound.tsx`
- Program yalnızca Home hero'sundaki "Programı gör" bağlantısıyla ulaşılıyor; tüm görevler bitince hero'da aynı bağlantı **iki kez** görünüyor. Öneri: program oluştuğunda sekme sırası **Ana sayfa · Program · Sesler · Zihin · İlerleme**; Değerlendirme hub'ı Program sekmesinde "Ölçümlerim" bölümü + Ayarlar'da. Uyku: Home kartı + Sesler'de "Gece" kategorisi (mevcut). Eğitim: Zihin altında (mevcut) — Ayarlar'daki "Kanıt ve kaynaklar" satırı eğitim kütüphanesine değil `src/content/citations.ts` listesine gitmeli. Değerlendirme ve Sesler sekmeleri `TabHeader` kullanmıyor → profil düğmesi yok; her sekmede aynı başlık bileşeni. Yolculukta her adım `router.replace` ile değiştiğinden Android geri tuşu Home'a düşüyor — anket ortasında geri tuşu "Yanıtlarınız kaydedildi, sonra devam edebilirsiniz" onayı göstermeli.

### B8. Oynatıcı: karıştırıcı ve zamanlayıcı ilk görünümde fazla
- **Önem:** Yüksek · `app/sound/player.tsx`
- Oynat düğmesinin altında Ses düzeyi → Karıştırıcı ("Henüz katman yok. Oynat düğmesine basın veya katman ekleyin") → Zamanlayıcı → Uyku modu. 55+ kullanıcı için ekran: oynat, ad, "Nasıl dinlenir" tek cümle, zamanlayıcı çipleri (15 / 30 / 60 / Sabaha kadar), ses düzeyi + karışma ipucu. "Karıştırıcı", "Katman ekle", oktav seçimi "Gelişmiş" başlıklı kapalı bölüm (`accessibilityState.expanded`). "42 %" → "%42" (Türkçe yazım).

### B9. Güven sinyalleri ve rozet enflasyonu
- **Önem:** Orta-yüksek · `app/mind/[module].tsx`, `src/components/Chip.tsx`, `settings.about.regulatory`
- Modül başlığında üç kez "Kılavuz önerisi" (module.png); tüm ses kartlarında aynı çip — sinyal değerini sıfırlıyor. Aynı düzeydeki kaynaklar tek çipte birleşsin: "Kılavuz önerisi · 3 kaynak". Her modül ve makale üstünde **"Gözden geçiren: KBB uzmanı · Ekim 2026"** satırı (DESIGN.md §6.10, uygulanmamış). "Dingin bir tıbbi cihaz değildir ve bir prototiptir" cümlesi Ayarlar'da; sürüm numarasıyla birlikte onboarding onay ekranında da bir kez görünmeli. Sonuç PDF'i (`buildHtml`) eski teal hex'lerle (`#0F2A33`, `#D5E0E4`) basılıyor — token'lardan beslenmeli; üst bilgiye uygulama adı, sürüm ve "Kullanıcının kendi beyanına dayanır" notu eklenmeli.

### B10. Erişilebilirlik ayrıntıları
- **Önem:** Orta-yüksek
- `src/components/Stepper.tsx` düğme etiketleri `'-'` ve `'+'` → "Azalt" / "Artır" + `accessibilityValue`.
- `EvidenceChip` dokunulabilir ama ~26 pt yüksek; `hitSlop={{top:10,bottom:10}}` ve `accessibilityHint="Kaynağı görmek için dokunun"` (DESIGN.md §7).
- `Segmented` `minHeight: 38` → 44. `SectionHeader` eylem metni ve "Karışma noktası nedir?" bağlantıları `Pressable` ama yükseklik yok → `minHeight: 44`.
- `app/(tabs)/_layout.tsx` `tabBarAllowFontScaling: false` + 11 px etiket: büyük yazı kullanan yaşlı kullanıcıya en küçük metin. Ölçeklenmeli; ≥ 1.6 ölçekte etiket gizlenip `accessibilityLabel` taşımalı.
- `WeekTimeline` 40×56 sabit hücre ve 15 px sabit yazı; %200'de taşar → `minWidth` + `flex: 1`, `fontSize` token'dan.
- Grafiklerde metin özeti var (iyi); `ChartCard` özetine `accessibilityRole="summary"`, grafik `accessible={false}`.

---

## C) İyi olur (5)

1. **Giriş kartlarındaki boşluk** (triage.png, j-history.png, k-causes.png): kart ekranın üst üçte birinde, altı boş. Kart dikey ortalansın ya da altına "Neler soracağız?" 3 maddelik önizleme; `assess.section.required` "Önce bunlar" başlığı kaldırılsın (yolculuk zaten sıralıyor).
2. **Zihin sekmesi yoğunluğu:** 21 modül düz liste; "Sıradaki modül" + 2 satır, "Tümünü gör" ile açılır. Düşünce kaydı kartı kullanıcının olumsuz düşüncesini başlık gibi gösteriyor ("Bu ses hiç geçmeyecek…") → yalnızca "1 kayıt · dün".
3. **Düşünce kaydı** 7 alanı tek ekranda "ADIM 1 / 7" etiketiyle gösteriyor; anketlerdeki adım-adım deseni burada da uygulanmalı, ilk dört alan zorunlu.
4. **Home tamamlanmış gün durumu:** "Programı gör" düğmesi + alt satır bağlantısı tekrar; akşam saatinde ikinci eylem "Bu gece: uyku sesi" olmalı. Hero'da `Minus/TrendingUp` ok simgeleriyle "THI eğilimi Düşüş (-16)" → "Çınlama etkisi 4 haftada azaldı".
5. **Koyu tema cilası:** açık temada `tinted` ve `primarySoft` aynı renk (`#EEF2FF`) — ipucu kartı içindeki simge zemini kayboluyor; `tinted: '#F3F5FF'` ayrılsın. Ayarlar `Switch`'inde `thumbColor` yok (ekranda teal başparmak kalıntısı). THI çizgisi `secondary #0EA5E9` yerine `primary` (DESIGN.md §6.9).

---

## İdeal onboarding (metinle taslak)

Hedef: kurulumdan "benim programım"a **≤ 10 dakika, ≤ 4 zorunlu bölüm**, her ekranda tek karar.

1. **Hoş geldiniz (tek ekran, karusel yok):** Marka işareti, `h1` "Çınlamanızı anlayıp 12 haftalık bir plan hazırlayalım", üç satır: "3 kısa bölüm · yaklaşık 8 dakika", "Yanıtlar cihazınızda kalır", "Tanı koymaz; doktorunuzla konuşmanıza yardımcı olur". Tek düğme "Başlayalım". Mevcut 3 kartlık karusel "Dingin nasıl çalışır?" ghost bağlantısında.
2. **Onay:** iki zorunlu onay kutusu (tanı değil / gizlilik), dil seçimi. Ad ve anonim veri sorusu buradan çıkar (ad: ilk seans sonrası, "Size nasıl hitap edelim?").
3. **Güvenlik taraması (12 evet/hayır, ~2 dk).** Acil bulgu → anında yönlendirme kartı; diğerleri "Acil bir bulgu yok" tek satırla devam.
4. **Kısa öykü (8 soru).** Bu yanıtlar koşullu ölçekleri açar.
5. **Çınlama etki puanı (THI, 25 soru).** Gözden geçirme ekranı korunur.
6. **Koşullu kısa ekler** yalnızca gerekiyorsa (2'şer soru PHQ/GAD; HQ/RASST/SCI öykü işaretlediyse).
7. **Sonuç-lite + program:** küçük gösterge, bir cümle anlam, "Programınız hazır: günde 15 dk, 12 hafta" ve yapışkan "Programı başlat". Süre tercihi bu kartta tek satır segment (15 / 30 / 45), varsayılan 15.
8. **Son ayar (tek ekran):** "Hangi saatte 10 dakikanız olur?" (saat seçici + izin), kulaklık notu ilk ses görevine ertelenir.
9. **Home:** hero "İlk seansınız · 12 dk · 3 adım". Neden soruları ve telefon testleri 1. haftada "Sonucu keskinleştir (isteğe bağlı, 10 dk)" görevi olarak gelir.

## İdeal sonuç sayfası (katmanlı)

- **Katman 1 — ekranın üstü (kaydırmasız):** 180 pt gösterge (bantlar pastel, aktif bant doygun; iğne `#312E81`), tek puan gösterimi, `caption` "Çınlama etki puanı · 100 üzerinden · Orta". Altında bir cümle: "Çınlama günlük yaşamınızı orta düzeyde etkiliyor. Bu düzeyde yapılandırılmış program iyi incelenmiştir." Selfcare ise yeşil tek satır "Acil bir bulgu yok"; değilse `Banner` + "Kime, ne zaman" kartı burada ve yalnızca burada. **Yapışkan alt çubuk:** "Programı başlat" / "Bugünün seansına git".
- **Katman 2 — Programınız:** kol adı ("Ses zenginleştirme ve BDT"), 12 hafta, günde X dk, üç gerekçe maddesi (her biri tek kanıt çipi), "Neden bu program?" alt sayfası; "Süreyi ve tarzı değiştir" ghost.
- **Katman 3 — kapalı akordeonlar:** "Olası profil" (çipler + bilgi sayfası), "Çınlamanızın olası kaynağı" (ilk aday + "diğer adaylar"), "Doktorunuza özet" (Kopyala / PDF), "Önceki ölçümle karşılaştırma" (≥ 2 ölçüm varsa), en altta `Disclaimer`.
- Kurallar: üç kelimeden uzun büyük harf yok; yüzde yok; sayfa boyunca tek birincil düğme; her kart tek cümlelik özetle kapalı açılabilir.

## Ek: kontrast özeti (hesaplanmış)

Geçen: metin/zemin 17.2 · ikincil 7.0 · beyaz/primary 6.3 · primary/zemin 5.9 · `info` 5.5 · `secondaryText` 5.2 · `success` 4.6 · koyu metin/zemin 16.2 · koyu ikincil/kart 10.4 · gece metin 12.3.
Kalan: koyu `onPrimary` 2.98 · gece `onPrimary` 4.47 · `textMuted` 4.38 · `tabInactive` 2.58 · `border` 1.25 / `borderStrong` 1.63 (yalnız-sınır bileşenler) · `accent 500` 2.80 (metin/çizgi olarak kullanılmamalı) · gradyan üstü %75 beyaz ≈ 3.98.
