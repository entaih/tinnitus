# Dingin — Proje yönetimi kararı: Sprint 1 (Ekim 2026)

Karar sahibi: Proje yöneticisi. Danışılan sanal ekip: hekim (KBB/psikiyatri), odyolog, UX tasarımcısı, davranış bilimci, pazarlama.
Girdi: `docs/ROADMAP.md`, `docs/reviews/{physician,audiologist,ux,marketing}.md`, `src/clinical/{journey,questionnaires,program,engine}.ts`, `app/session.tsx`, `app/(tabs)/index.tsx`, `app/assess/results.tsx`, `src/components/home/taskBudget.ts`, `src/content/{registry,modules,exercises}.ts`, `src/store/growth.ts`, `src/notifications.ts`.

Sahibin iki emri bu sprintin çerçevesidir: **(1) uygulama ön tanı koyar; (2) kullanıcı sıkılmadan tedavi olabilmeli / çözüm bulabilmeli.** Bu sprintte önce (2) üzerinde çalışıyoruz; (1) için mevcut motor (`computeTriage`, `buildProfile`, `diagnosis.ts`) korunur, hiçbir güvenlik kapısı gevşetilmez.

---

## 0. Teşhis: bugün bir kullanıcı ne yaşıyor?

`generateProgram` ile orta şiddet (THI 44), uykusuzluk sürücülü, tonal bir kullanıcıyı simüle ettik (15 ve 30 dk tercihleri). Bulgular:

| Gözlem | Kanıt (koddan) | Sonuç |
|---|---|---|
| Başlangıç değerlendirmesi 49–75 madde | güvenlik 12 + öykü 8 + THI 25 + (HQ 14, SCI 8, RaSST 4) + PHQ-2 + GAD-2 | İlk değere ulaşmak 10–15 dk; terk riski en yüksek nokta burası |
| Anket bitince yalnız "Toplam puan 44/100" gösteriliyor | `q.done.total` | Sahibin "sonuçla hiçbir şey yapmıyoruz" hissi doğru: motor puanı kullanıyor, **ekran söylemiyor** |
| 1. gün 23 aktif dakika | diary + cbt.welcome(8) + exercise.pmr(12) + mixingPoint(5) + causes(2) + 120 dk ses | 15 dk seçen kullanıcı ilk gün bütçeyi aşıyor; "vay" anı yok |
| 3.–12. hafta her gün aynı: check-in + 5 dk nefes + "en az 120 dk ses" | `DAILY_PRACTICE` 3. haftadan sonra hep `exercise.breathing` | 70 gün aynı egzersiz = sıkılmanın ana kaynağı |
| 9.–12. hafta neredeyse boş | w9–10: yalnız `cbt.toolbox` | Program "bitmiş gibi" hissettirir, D30 sonrası kayıp |
| 8. hafta 7. gün: 10 görev, 5 anket üst üste | `assess.thi + redflags + mood + anxiety + sleep` | "Ölçüm duvarı": 49–61 madde tek günde |
| Günlük kayıt 2 kaydırıcı + 3 ruh hali + not, ayrı ekran | `app/diary.tsx` | "10 saniye" deniyor ama 3 ekran geçişi; Ana ekranda tek dokunuşla yapılamıyor |
| Kaçırılan gün sonrası yeniden giriş var (2 kısa adım) | `isReentry`, `splitByBudget(reentry)` | İyi; ama kullanıcı **kendi isteğiyle** kısa sürümü seçemiyor |
| Haftalık ritim var (Pzt/Çar/Cum modül, Cmt makale, Paz ölçüm) | `moduleDays`, `edu` | İyi iskelet; Pazar "ilerleme kartı" yok, ölçüm günü ağır |

Özet: içerik ve klinik motor yeterli; **sorun ritim, görünürlük ve geri bildirim.** Bu sprint yeni içerik yazmaz; mevcut içeriği yeniden paketler.

---

## 1. Anket politikası (karar)

### 1.1 İlke
- **THI-25 başlangıçta kalır.** Gerekçe: 2. kademe triyaj (≥58), McCombe bantları, MCID 7/11, 4/8/12. hafta uyarlaması ve MDR klinik değerlendirme planının birincil sonlanımı THI-25'e bağlıdır; THI-S'in (Newman 2008) Türkçe geçerliliği ve derecelendirme bantları yoktur. Otomatik ilerlemeyle 25 madde ≈ 2,5–3 dk; sorun süre değil, **sonrasında hiçbir şey olmaması**. Masadaki "THI-S başlangıçta" önerisi **reddedildi**; THI-S yalnızca Sprint 2'de isteğe bağlı ara kontrol (2. ve 6. hafta) olarak değerlendirilecek.
- Uzun olan **diğer her şey kısalır ve kapılı olur** (PHQ-2 modeli): kısa tarama → yalnız pozitifse tam ölçek.
- **Her ölçeğin sonunda "Bu puan şunu değiştirdi" satırı** (1–3 satır) gösterilir; aynı satırlar sonuç ekranında ve 4/8/12. hafta ölçümlerinde tekrarlanır.
- **Bir günde en fazla bir ölçek.** Ölçüm haftası günlere yayılır.
- Güvenlik gevşemez: PHQ madde 9 her ruh hali taramasında sorulur; kırmızı bayraklar kısa yeniden taramayla kapılı olarak sorulur.

### 1.2 Hangi ölçek, ne zaman, kaç madde

| An | Ölçek | Madde | Koşul | Ne değiştirir (kullanıcıya söylenen) |
|---|---|---|---|---|
| Başlangıç | Güvenlik (kırmızı bayrak) | 12 | herkes | Kademe (acil / 24 sa / 2 hafta / rutin / öz bakım) ve kriz yolu |
| Başlangıç | Öykü | 8 | herkes | Fenotip (akut/kronik, tonal, tek taraflı…), hangi koşullu ölçeklerin açılacağı |
| Başlangıç | **THI-25** | 25 | herkes | Şiddet bandı; program uzunluğu (≤36 → 6 hafta, akut → 4, diğer → 12); ≥58 → 2 haftada KBB; ≥38 → "sıkıntı" sürücüsü; C alt ölçek ≥8 → felaketleştirme (olumsuz düşünceler modülü vurgulanır); madde 1+18 ≥4 → dikkat sürücüsü (dikkat/konsantrasyon modülü) |
| Başlangıç | **SCI-02** (yeni) | 2 | öyküde uyku sorunu | ≤2/8 → uykusuzluk sürücüsü → BDT-U kolu + uyku sesi; tam SCI-8 **2. hafta 2. gün** "uyku ölçümü" görevi olarak (yalnız pozitifse) |
| Başlangıç | **THS-C ses toleransı** (yeni, Henry 2015 Tinnitus and Hearing Survey, C bölümü) | 2 | öyküde ses hassasiyeti | C1 ≥2/4 → hiperakuzi fenotipi → hiperakuzi-önce kolu, kademeli ses, maruziyet yerine hiyerarşi; tam HQ-14 **2. hafta 4. gün** "ses hassasiyeti ölçümü" görevi olarak (yalnız pozitifse; HQ ≥28 → daha yavaş ses rampası) |
| Başlangıç | RaSST | 4 | öyküde boyun/çene | ≥2 → somatik kol (boyun/çene egzersizleri + somatik makale) |
| Başlangıç | **PHQ-2 + madde 9** | 3 (→9) | herkes | PHQ-2 ≥3 → tam PHQ-9; PHQ-9 ≥10 → depresyon sürücüsü/ruh sağlığı önerisi, 15–19 → 2 hafta aile hekimi→psikiyatri, ≥20 → ağır sıkıntı kademesi; **madde 9 >0 → kriz yolu (her zaman sorulur)** |
| Başlangıç | GAD-2 | 2 (→7) | herkes | ≥3 → tam GAD-7; GAD-7 ≥10 → kaygı sürücüsü; ≥15 → 2 hafta |
| Hafta 4 | PHQ-2+9 (5. gün), THI-25 (7. gün) | 3, 25 | herkes | THI değişimi ≥7 → "yolunda"; <7 → "erken yanıt yok, doz/strateji"; ≤−11 → kötüleşme → hekim |
| Hafta 8 | Kırmızı bayrak kısa (4. gün, 3 madde, kapılı), PHQ-2+9 & GAD-2 (5. gün), SCI-02 (6. gün, yalnız uykusuzluk kolu), THI-25 (7. gün) | 3, 5, 2, 25 | — | ≥11 → "yanıt verdi"; 7–10 → "iyileşiyor, 4 hafta daha"; <7 → "strateji değiştir" |
| Hafta 12 | Hafta 8 ile aynı dağılım | — | 12 haftalık programlar | Bakım planı; +13 THI artışında tazeleme bloğu (Sprint 2) |
| Her gün | **Tek dokunuş check-in** (rahatsızlık 0–10; gürlük isteğe bağlı) | 1 | herkes | 7 günlük grafik, haftalık karşılaştırma satırı, Pazar kartı |

Başlangıç madde sayısı: tipik 12+8+25+5 = **50 (önce 49)**, en kötü 12+8+25+2+2+4+5 = **58 (önce 75)**. Asıl kazanç: tipik kullanıcı için başlangıç *hissen* kısalır (üç ekran kalkar: HQ-14, SCI-8 ve PHQ'nun uzun sürümü) ve her ölçeğin bir karşılığı olur.

### 1.3 Kısa form madde listeleri (mühendislik için)

**SCI-02 (Espie ve ark. 2014, BMJ Open; ücretsiz).** SCI-8'in şu iki maddesi:
- SCI madde 3: "Haftada kaç gece uyku sorunu yaşarsınız?" (4: 0–1 gece … 0: 5–7 gece)
- SCI madde 7: "Kötü uyku genel olarak sizi ne kadar rahatsız ediyor?" (0: çok fazla … 4: hiç)
- Puan 0–8; **≤2 → olası uykusuzluk bozukluğu** (Espie 2014'te SCI-02 kesme noktası). Kod: `SCI02` kimliği, `interpret: t ≤ 2 → 'severe' / 'sci02.probable'`, aksi `'none'`. Mühendislik yayındaki tabloya karşı kesme noktasını doğrular (`citations.ts` `espie2014`).

**THS-C (Henry ve ark. 2015, Tinnitus and Hearing Survey, Bölüm C "Ses toleransı"; kamuya açık, VA).** Son 1 hafta, 0 "Hayır, sorun değil" – 4 "Evet, çok büyük bir sorun":
- C1: "Geçen hafta, çevremdekiler için normal olan sesler bana fazla yüksek ya da rahatsız edici geldi."
- C2 (yalnız C1 ≥1 ise): "Geçen hafta bu ses hassasiyeti günlük yaşamımda ne kadar sorun oldu?"
- Tarama: **C1 ≥2 → pozitif** (HQ-14 2. haftada). Tam madde metni Henry 2015 ekinden alınır; `evidence: 'expert'`, Türkçe metin "ekran tahmini" etiketi taşır. Kod: `THS` kimliği, max 8.

**PHQ-2 + madde 9 (3 madde).** `GATE.PHQ9 = { items: 2, cutoff: 3, alwaysAsk: [8] }`: ilk iki madde <3 ise 3. ekran olarak PHQ madde 9 sorulur, sonra kapatılır; ≥3 ise 3–9 tam sorulur. Madde 9 >0 → mevcut kriz yolu (`triage.selfHarm`) değişmeden.

**Kırmızı bayrak kısa yeniden tarama (3 madde, 8. ve 12. hafta; 4. haftada PHQ madde 9 yeterli).** "Son 4 haftada…" (1) "İşitmenizde ani düşüş ya da hızlı kötüleşme oldu mu?" (2) "Çınlama yeni başlayan tek taraflı ya da nabız gibi atan bir hal aldı mı?" (3) "Baş dönmesi, yüzde uyuşma/güçsüzlük, şiddetli baş ağrısı ya da görme değişikliği oldu mu?" Herhangi "Evet" → mevcut 12 maddelik `/assess/triage` açılır ve `computeTriage` yeniden çalışır. Kendine zarar maddesi PHQ madde 9 ile aynı hafta kapsanır.

**THI-S (Sprint 2'ye ertelendi, kayıt amaçlı).** Newman, Sandridge & Bolek 2008 (Otol Neurotol 29:276–81), 10 madde, 0–40. Sprint 2'de ara kontrol olarak eklenirse madde seçimi yayındaki tablodan birebir alınacak; bantlanmayacak, yalnız "eğilim" olarak gösterilecek.

### 1.4 "Bu puan şunu değiştirdi" satırları (Türkçe, `consequence.*`)
Tek kaynak: `src/clinical/consequences.ts` → `consequencesOf(id, result, assessment): string[]` (i18n anahtarları). Ölçek bitiş ekranı (`q.done`), sonuç ekranındaki yeni "Programınızı belirleyen şeyler" kartı ve 4/8/12. hafta ölçüm bitişi aynı fonksiyonu kullanır.

- `consequence.thi.length6`: "Puanınız {t}: hafif etki. Programınız 6 hafta sürecek; 1. ve 6. haftada bakım planı var."
- `consequence.thi.length12`: "Puanınız {t}: {band}. Programınız 12 hafta; 4. ve 8. haftada bu ölçeği tekrarlayıp değişimi göstereceğiz (7 puan düşüş anlamlıdır)."
- `consequence.thi.tier2`: "Puanınız 58 ve üzeri: ağır etki. Programın yanında 2 hafta içinde KBB randevusu öneriyoruz."
- `consequence.thi.catastrophizing`: "Çaresizlik/kontrol maddelerinde yüksek puan: 4. haftadaki 'olumsuz düşünceler' modülü sizin için öne çekildi."
- `consequence.thi.attention`: "Dikkat maddeleri yüksek: 7. haftada dikkat ve konsantrasyon çalışması programınızda."
- `consequence.thi.change.good`: "{d} puan düşüş — anlamlı iyileşme. Aynı düzende devam."
- `consequence.thi.change.flat`: "Değişim {d} puan (7'nin altında). Bu normal; program 8. haftaya kadar dozu değiştirmez."
- `consequence.thi.change.worse`: "{d} puan artış. Program durmaz; ama bu hafta hekimle görüşmenizi öneririz."
- `consequence.sci02.pos`: "Uyku puanınız düşük: programınıza uykusuzluk için BDT-U parçası ve gece sesi eklendi (2. haftadan itibaren)."
- `consequence.sci02.neg`: "Uykunuz programı değiştirmiyor; uyku ipuçları 3. haftada kısa bir modül olarak gelecek."
- `consequence.ths.pos`: "Ses hassasiyeti var: ses programı düşük düzeyden, kademeli başlayacak; 2. haftada kısa bir ölçüm daha yapacağız."
- `consequence.ths.neg`: "Ses hassasiyeti programı değiştirmiyor."
- `consequence.rasst.pos`: "Boyun/çene bağlantısı olası: programa 6 haftalık boyun-çene egzersizleri eklendi."
- `consequence.rasst.neg`: "Boyun/çene egzersizi gerekmiyor."
- `consequence.phq.screenedOut`: "Ruh hali taraması temiz; programınız değişmedi. 4. haftada 3 soruyla tekrar bakacağız."
- `consequence.phq.moderate`: "Ruh hali puanınız orta düzeyde: programda düşünce çalışmaları öne çekildi; aile hekiminizle görüşmeniz önerilir."
- `consequence.phq.high`: "Ruh hali puanınız yüksek: 2 hafta içinde aile hekimi → psikiyatri öneriyoruz; program buna eşlik eder, yerine geçmez."
- `consequence.gad.screenedOut`: "Kaygı taraması temiz; programınız değişmedi."
- `consequence.gad.pos`: "Kaygı puanı yüksek: gevşeme becerileri her gün programınızda; 2 hafta içinde aile hekimi önerilir." (≥15 ise)
- `consequence.pitch`: "Çınlamanız yaklaşık {hz} Hz: ses programınız buna göre ayarlandı."
- `consequence.ri.pos` / `consequence.ri.neg`: "Ses, çınlamanızı geçici olarak bastırdı: önce ses odaklı ilerliyoruz." / "Ses çınlamayı bastırmadı: program önce düşünce-davranış becerilerine ağırlık veriyor."

Dürüstlük kuralı: hiçbir satırda "tedavi eder / geçer" yok; her satır "program/değerlendirme" dilinde.

---

## 2. Sıkılmayı önleme ve tutunma tasarımı (8–12 hafta)

Dayanaklar: Fogg (Tiny Habits: davranış = motivasyon × yetenek × tetik; küçük, somut, hemen kutlanan adım), Eyal (Hook: tetik → eylem → değişken ödül → yatırım), Beukes/Andersson iCBT verileri (modül tamamlama düştükçe sonuç düşer; haftalık yapı + kısa günlük uygulama en iyi tutunma), Cima 2019 (uzmanlaşmış BDT'nin etkisi düzenlilikle gelir), NICE NG155 ve AAO-HNS (eğitim + ses + BDT; hiçbiri "kür" değil). Tasarım ilkeleri: **ilk gün bir "vay" anı, her gün tek çekirdek, haftada bir yenilik, görünür ilerleme, suçsuz yeniden giriş.**

### 2.1 Günlük seans şekli (karar)
- Hedef **5–12 aktif dakika**, varsayılan bütçe **15 dk** (30 → 15; kullanıcı 30/45'e çıkarabilir).
- Ekranda en fazla **3 numaralı adım**: (1) tek dokunuş check-in, (2) **günün çekirdeği** (modül, egzersiz ya da ölçüm; tek bir şey), (3) isteğe bağlı kısa uygulama. Kalanı "Daha fazla".
- **Arka plan sesi numaralı adım değildir.** Ayrı bir satır/çip olur: "Arka plan sesi · Gün içinde açık tut" (dakika hedefi yazılmaz; "en az 120 dk" kaldırılır). Oynatıcıdan dönünce "Çalıyor" rozeti kalır.
- **"2 dakikalık sürüm"** her gün elde: check-in + en kısa uygulama (3 dk nefes alanı ya da 3 dk ayrımlı gevşeme). Yeniden giriş mantığıyla aynı bölme; fark, kullanıcının kendi seçmesi. Fogg: "yapabileceğin kadar küçük".
- Seans sonu: tek bir tamamlanma anı (var) + **"Yarın: {görev adı}"** satırı + **günün notu** (değişken ödül: 24 kısa içgörüden rastgele biri, örn. "Çınlamayı duymak ile ondan rahatsız olmak farklı şeylerdir; program ikincisini hedefler.").

### 2.2 Haftalık ritim (karar; `moduleDays` korunur, boşluklar dolar)
| Gün | Çekirdek | Not |
|---|---|---|
| Pzt (1) | **Haftanın becerisi**: yeni modül | Tema başlığı zaten var; kartta "Bu hafta: {tema}" |
| Sal (2) | Günlük uygulama (rotasyon) + varsa ek kol modülü (BDT-U) | |
| Çar (3) | 2. modül ya da **beceri pratiği** (düşünce kaydı / maruz kalma uygulaması 5 dk) | |
| Per (4) | Günlük uygulama + varsa hiperakuzi modülü | |
| Cum (5) | 3. modül ya da uygulama; ölçüm haftasında PHQ-2+9 | |
| Cmt (6) | **Okuma günü**: makale (5–6 dk) | var |
| Paz (7) | **1 dakikalık haftalık kart**: bu hafta kaç gün, rahatsızlık ort. geçen haftaya göre, gelecek haftanın teması; ölçüm haftasında THI | paylaşılabilir kart (`progressCard.ts`) |

### 2.3 Tekrarı kırmak (karar)
- Günlük uygulama **havuzdan rotasyon**, Öst'ün uygulamalı gevşeme basamaklarını izler (kanıta dayalı ve doğal olarak yenilik üretir): 1–2. hafta `[exercise.pmr, exercise.breathing]`; 3–4. hafta `[exercise.breathing, mind.breathingSpace, cbt.relax3]`; 5–6. hafta `[cbt.relax5, exercise.breathing, mind.breathingSpace]`; 7+ `[cbt.relax6, mind.breathingSpace, exercise.breathing, cbt.concentration]`. Seçim `pool[(day − 1) % pool.length]`.
- 9.–12. hafta içerik: w9 `['cbt.concentration','cbt.toolbox']`, w10 `['act.values']` (BDT kullanıcıları için yeni bakış), w11 `['cbt.restructuring']`, w12 `['cbt.exposure','cbt.relapse']`. `cbt.concentration` ve `cbt.hearingTactics` kayıt defterinde var ama kullanılmıyor; kullanılır.
- Her modülün "2 dakikalık özeti" (Sprint 2: modül içeriğine `summary` alanı). Sprint 1'de yalnız kısa uygulamalar rotasyona girer.

### 2.4 1. gün → 2. gün köprüsü (karar)
1. gün sırası: (1) check-in (tek dokunuş), (2) **"Sesinizi bulun"** karıştırma noktası 3–5 dk → ses hemen çalmaya başlar (anında rahatlama = "vay"), (3) "Hoş geldiniz" modülü 8 dk ("neden olur, neden sönümlenir"). PMR 2. güne, neden soruları 3. güne ("Daha fazla"). 1. gün bitişinde: "Yarın: ilk gevşeme becerisi (12 dk) · İsterseniz 2 dakikalık sürümü seçin." Tonal kullanıcıda 2. gün perde eşleme → `consequence.pitch` satırı ("Çınlamanız ≈ {hz} Hz; sesiniz buna göre ayarlandı") — ikinci "vay".

### 2.5 Seri, affetme, yeniden giriş (karar)
- **Günlük seri yok; haftalık hedef 5/7.** Ana ekranda halka: "Bu hafta 3/5". Hedefe ulaşınca Pazar kartında rozet metni ("Bu hafta hedefi tutturdunuz"). Kaçırılan gün suçlama cümlesi yok ("Hiçbir şey kaybolmadı" korunur).
- Yeniden giriş (≥2 gün) mevcut; eklenen: 3 gün hiç giriş yoksa **tek seferlik yerel bildirim** ("3 gündür görüşmedik. 2 dakikalık sürüm hazır."), her görev tamamlandığında +3 gün 19:00'a yeniden planlanır (önceki iptal). Bildirim günde en fazla 1.
- Program uzadıkça ağırlık: 4. ve 8. hafta sonrası uyum %50'nin altındaysa `adapt.lowAdherence` zaten var; UI'de "Dozu düşür: haftada 1 modül + 2 dk sürüm" tek dokunuşla uygulanır (Sprint 2: `prefs.minutesPerDay` güncelleyip yeniden üretim).

### 2.6 Bildirim politikası (karar)
- Günlük hatırlatma (var, varsayılan 20:00): metin haftanın gününe göre döner — Pzt "Haftanın becerisi hazır (8 dk)", Sal–Cum "Bugünün tek şeyi: {çekirdek} · {dk} dk", Cmt "Okuma günü: 5 dk", Paz "1 dakikalık haftalık kart". Yerel bildirim gün içeriğini bilemez; metin genel ama güne özgü olur.
- Haftalık inceleme bildirimi (var) Pazar kartına yönlendirir.
- Yeniden giriş bildirimi (2.5). Ölçüm haftası (4/8/12) Pazar sabahı: "Bugün 3 dakikalık ölçüm: puanınızın nasıl değiştiğini göreceksiniz."
- Expo Go kısıtı: yalnız yerel bildirim; Android Expo Go'da yok (mevcut korumalar kalır).

---

## 3. SPRINT 1 — Öncelikli iş listesi (12 madde; hepsi Expo Go uyumlu, yeni yerel modül yok)

### S1-01 · P0 · Kısa koşullu ölçekler: SCI-02, THS-C, PHQ-2+madde 9
**Gerekçe:** Başlangıçtaki üç uzun ekran kalkar; güvenlik korunur.
**Spek:**
- `src/clinical/questionnaires.ts`: `QuestionnaireId` → `| 'SCI02' | 'THS'`; `SCI02` (SCI madde 3 ve 7 kopyası, max 8, `interpret: ≤2 → {band:'severe', key:'sci02.probable'}`, aksi `{band:'none', key:'sci02.ok'}`, `citation:'espie2014'`, `evidence:'rct'`); `THS` (2 madde 0–4, max 8, `interpret: answers[0] ≥ 2` → tarama pozitif — `interpret` yalnız toplamı alır; THS için `scoreQuestionnaire` sonrası `answers[0]` kontrolü `engine.ts`'de yapılır; `citation:'henry2015'` → `citations.ts`'e ekle, `evidence:'expert'`). `QUESTIONNAIRES` kaydına ekle.
- `src/clinical/types.ts`: `QuestionnaireResult.id` birliğine `'SCI02' | 'THS'`.
- `src/clinical/journey.ts`: `hq` adımı → route `/assess/questionnaire/THS`, `minutes: 1`, `has(a,'THS')`; `sci` adımı → `/assess/questionnaire/SCI02`, `minutes: 1`. `journey.why.hq/sci` metinleri "2 soru" olacak şekilde güncellenir.
- `src/clinical/engine.ts` `buildProfile`: `insomnia` = `(sci && sci.total ≤ 16) || (sci02 && sci02.total ≤ 2) || (!sci && !sci02 && h?.sleepProblem)`; `hyperacusis` fenotipi = `(hq && hq.total ≥ 16) || (ths && (ths.answers[0] ?? 0) ≥ 2) || (!hq && !ths && h?.soundSensitivity)`; `highDistress` listesine `sci02 ≤ 2` eklenir.
- `app/assess/questionnaire/[id].tsx`: `GATE` tipi `{ items; cutoff; alwaysAsk?: number[] }`; `PHQ9: { items: 2, cutoff: 3, alwaysAsk: [8] }`. Kapı altında kalınca `alwaysAsk` maddeleri sırayla sorulur, sonra `submit(..., true)`. `q.intro.gated` metni PHQ için "Önce 3 soru; yalnızca gerekirse 9'a tamamlanır."
- `src/clinical/program.ts`: tam ölçek görevleri — `assess.sleepFull` (`/assess/questionnaire/SCI`, 2 dk) 2. hafta 2. güne yalnız `insomnia && !has(SCI)`; `assess.hyperFull` (`/assess/questionnaire/HQ`, 3 dk) 2. hafta 4. güne yalnız `hyper && !has(HQ)`. Bunun için `ProgramPrefs`'e `sciDone?: boolean; hqDone?: boolean` eklenir (results/setup'ta doldurulur). `registry.ts`'e iki birim.
- Doktor özeti (`reportAudio.ts` / results) SCI-02 ve THS puanlarını "ekran" etiketiyle yazar.
**Kabul:** Uyku sorunu + ses hassasiyeti işaretleyen kullanıcı başlangıçta en fazla 58 madde görür; PHQ-2 <3 iken madde 9 yine sorulur ve >0 ise kriz yolu açılır; `buildProfile` testinde SCI02 ≤2 → `insomnia`, THS C1 ≥2 → `hyperacusis`; `npx tsc --noEmit` ve `npm test` geçer.

### S1-02 · P0 · "Bu puan şunu değiştirdi" — sonuç satırları
**Gerekçe:** Sahibin "sonuçla hiçbir şey yapmıyoruz" şikâyetinin doğrudan cevabı.
**Spek:**
- Yeni `src/clinical/consequences.ts`: `consequencesOf(id: QuestionnaireId, scored: {total; subscales; answers}, a: Assessment | null, prev?: QuestionnaireResult | null): { key: string; params?: Record<string, string|number>; tone: 'info'|'success'|'warning'|'danger' }[]` — §1.4'teki kurallar (THI: uzunluk/kademe/felaketleştirme/dikkat; önceki THI varsa değişim satırı; SCI02, THS, RASST, PHQ (screenedOut / ≥10 / ≥15), GAD, ayrıca `psycho` varsa pitch/RI). Saf fonksiyon, `tests/consequences.test.ts` ile.
- `app/assess/questionnaire/[id].tsx` `done` evresi: toplam puanın altına "Bu puan ne değiştirdi?" başlıklı kart, 1–3 satır, ton rengiyle nokta; kriz satırı varsa mevcut 112 düğmesi üstte kalır.
- `app/assess/results.tsx`: `results.program.autoBody` yerine "Programınızı belirleyen şeyler" kartı — her tamamlanan ölçek için ilk satır (en fazla 5 satır).
- `app/program/index.tsx` `prog.adapt` kartı: `adaptationAdvice` metinlerinin üstüne son THI için değişim satırı.
- i18n: `consequence.*` (TR §1.4, EN karşılıkları) `src/i18n/areas/assess.ts`.
**Kabul:** THI 44 → "12 hafta" satırı; THI 60 → ek "2 hafta KBB" satırı; PHQ-2 taramadan çıkan → "programınız değişmedi" satırı; 4. haftada ikinci THI 36 → "8 puan düşüş" satırı; hiçbir satırda "tedavi/geçer" geçmez.

### S1-03 · P0 · 1. gün yeniden tasarımı + varsayılan 15 dk + en fazla 3 adım
**Gerekçe:** İlk gün 23 dakikadan 12'ye iner, sesle biter; 2. güne köprü kurulur.
**Spek:**
- `src/clinical/program.ts` `generateProgram`: 1. hafta 1. gün sırası `diary.daily → sound.mixingPoint → cbt.welcome` (PMR eklenmez: `if (!(w===1 && day===1))`); `assess.causes` 3. güne; `assess.exam` 2. günden 4. güne (2. gün yalnız PMR + varsa pitch). `sound.enrichment` sırada en sona.
- `src/components/home/taskBudget.ts`: `DEFAULT_MINUTES_PER_DAY = 15`; `splitByBudget`'e `maxActive = 3` (diary dahil) sınırı — bütçe dolmasa da 3. aktif adımdan sonrası `more`'a gider; `assessment` tipi `isEssential` kalır ama üst sınırı aşamaz (ölçüm günü zaten tek ölçek).
- `app/program/setup.tsx`: varsayılan `minutes` 15; seçenek metinleri "15 dk (önerilen) / 30 / 45".
- `app/session.tsx` tamamlanma kartı: `session.complete.tomorrowLine` = "Yarın: {title} · {min} dk" (ertesi günün ilk aktif görevi `tasksForDay(pos.week, pos.day+1)`; hafta sonu ise sonraki hafta 1. gün). "Yarın ne var?" düğmesi kalır.
**Kabul:** Simülasyonda w1d1 aktif dakika ≤ 14 ve adım sayısı 3; 15 dk bütçede hiçbir gün 3'ten fazla numaralı adım göstermez; ölçüm günü yalnız 1 ölçek.

### S1-04 · P0 · Ana ekranda tek dokunuş check-in + 7 günlük mini grafik
**Gerekçe:** Her gün 10 saniyede "yatırım" (Hook) ve görünür eğilim; günlük kaydın 3 ekranı tek dokunuşa iner.
**Spek:**
- Yeni `src/components/home/QuickCheckIn.tsx`: başlık "Bugün çınlama sizi ne kadar rahatsız etti?" ve 0–10 çip satırı (44 pt dokunma alanı, `accessibilityRole="radio"`). Dokununca `upsertDiary({ date: today(), annoyance: v, loudness: existing?.loudness ?? last?.loudness ?? v, mood: existing?.mood ?? 1 })`, `completeTask(taskKey(pos.week,pos.day,'diary.daily'))`, hafif haptik, çip satırı "Kaydedildi · Düzenle" satırına döner (Düzenle → `/diary`). İkinci satır "Gürlük" varsayılan kapalı; "+ Gürlük" bağlantısıyla açılır.
- Mini grafik: son 7 günün rahatsızlık değerleri (6–8 pt çubuklar, `colors.chart.annoyance`), altına tek satır: `home.checkin.compare` = "Bu hafta ort. {cur} · geçen hafta {prev}" (geçen hafta verisi yoksa "İlk haftanız: eğilim 7 günde görünür"). Hesap `src/components/home/checkinStats.ts` (saf, test edilebilir: haftalık ortalama, son 7 gün dizisi).
- `app/(tabs)/index.tsx`: kart, hero kartının hemen altına; program yoksa da görünür (değerlendirme öncesi de kayıt başlayabilir).
- `app/diary.tsx` kalır (not, uyku).
**Kabul:** Tek dokunuşla `diary` kaydı oluşur ve günün `diary.daily` görevi tamamlanır; aynı gün ikinci dokunuş değeri günceller; 7 günlük çubuklar ve karşılaştırma satırı doğru; erişilebilirlik etiketi "Rahatsızlık {v} / 10".

### S1-05 · P0 · Ölçüm haftasını günlere yay + 3 maddelik kırmızı bayrak yeniden taraması
**Gerekçe:** 8. hafta 7. gündeki 10 görevlik duvar kalkar; güvenlik korunur.
**Spek:**
- `src/clinical/program.ts` 8. madde: w4 → d5 `assess.mood`, d7 `assess.thi`; w8/w12 → d4 `assess.redflagsShort`, d5 `assess.mood` + `assess.anxiety`, d6 `assess.sleep` (yalnız insomnia), d7 `assess.thi`; akut kol w4 → d5 mood, d7 thi + redflagsShort. Her ölçüm gününde günlük uygulama **eklenmez** (ölçüm = günün çekirdeği).
- `registry.ts`: `assess.redflagsShort` (`/assess/triage?short=1`, 1 dk, `nice2020`, guideline).
- `app/assess/triage.tsx`: `short=1` parametresinde §1.3'teki 3 madde; herhangi "Evet" → tam 12 madde akışına geçer; hepsi "Hayır" → `completeTask` ve "Değişiklik yok; program devam" ekranı. i18n `triage.short.*`.
**Kabul:** Simülasyonda w8 hiçbir günde 1'den fazla `assessment` görevi yok (mood+anxiety aynı gün sayılır: PHQ-2+9 ve GAD-2 = 5 madde); kısa taramada "Evet" tam taramayı açar ve `computeTriage` yeniden hesaplanır.

### S1-06 · P1 · Günlük uygulama rotasyonu, 9–12. hafta içeriği, arka plan sesi ayrı satır
**Gerekçe:** 70 gün aynı nefes egzersizi bitiyor; program sonuna kadar her hafta bir yenilik var.
**Spek:**
- `program.ts`: `DAILY_PRACTICE` → `DAILY_PRACTICE_POOL: Record<number,string[]>` (§2.3), seçim `pool[(day-1) % pool.length]`; mindfulness stilinde havuz `['mind.breathingSpace','exercise.breathing','mind.bodyScan'(yalnız d1/d4)]`. w9–12 modülleri §2.3.
- `cbt.relax5`/`cbt.relax6`/`cbt.concentration` modül ekranı (`app/mind/[module].tsx`) uygulama kipinde açıldığında doğrudan pratik bölümüne kaydırır (varsa `practice`); yoksa değişiklik yok.
- `app/session.tsx` ve `index.tsx`: `isBackground` görevler numaralı listeden çıkar; "Arka plan sesi" adlı ayrı satır: başlık + "Gün içinde açık tutun" + "Aç/Çalıyor" düğmesi; `task.background` metni "Arka planda · {n} dk" → "Arka planda, gün içinde". `sound.enrichment` `minutes` bütçeye zaten sayılmıyor; `session.complete.summary` "+ arka plan sesi" kalır.
**Kabul:** 3.–8. hafta ardışık 4 günde uygulama kimlikleri birbirinden farklı; w9–w12 her hafta en az 1 modül; seans listesinde ses numarasız.

### S1-07 · P1 · Seans sonu "günün notu" (değişken ödül) ve "Yarın" satırı
**Gerekçe:** Tamamlanma anı küçük bir sürprizle biter; ertesi güne merak taşır.
**Spek:** `src/content/insights.ts`: 24 kısa, kaynaklı içgörü (`{ id, tr, en, citation }`; makalelerden damıtılır, "kür" yok). `app/session.tsx` tamamlanma kartı: `insights[(dayIndex + programIdHash) % 24]`; altında kanıt çipi (mevcut `EvidenceChip`). "Yarın: …" satırı (S1-03). i18n `session.insight.title` = "Günün notu".
**Kabul:** Ardışık 24 günde aynı not tekrar etmez; her not ≤ 160 karakter ve bir `citations.ts` kimliğine bağlı.

### S1-08 · P1 · "2 dakikalık sürüm" (kullanıcı seçimli kısa gün)
**Gerekçe:** Fogg: en küçük adım her gün mümkün olmalı; yeniden giriş mantığı zaten var, yalnız tetik eksik.
**Spek:** `taskBudget.ts` `planForToday(program, pos, budget, opts?: { short?: boolean })` → `reentry || opts.short` ile kısa bölme (check-in + en kısa aktif görev; ölçüm günü ölçek korunur). `app/session.tsx`: ekran üstünde `Segmented` "Tam · Kısa (2–3 dk)"; seçim `useState` (günlük kalıcılık gerekmez). Ana ekran hero'da ikinci ghost düğme "Kısa sürüm". Kopya: `session.short.hint` = "Kısa gün de sayılır. Hedef düzenlilik, süre değil." Growth olayı `shortSessionUsed`.
**Kabul:** Kısa kipte en fazla 2 aktif adım; tamamlanınca gün "etkin gün" sayılır (haftalık halka artar).

### S1-09 · P1 · Haftalık hedef 5/7 halkası + Pazar haftalık kartı
**Gerekçe:** Seri yerine affedici haftalık hedef (davranış bilimi: kaçırılan gün seriyi değil haftayı etkiler); Pazar'da görünür ilerleme ve paylaşım.
**Spek:** `index.tsx` "Bu hafta" kartı: `activeDaysOf(...)` ile halka "3/5" (hedef 5), 5'e ulaşınca `home.weekly.goalMet` = "Haftalık hedef tamam". Yeni `app/week-review.tsx` (Pazar görevi `review.weekly`, registry'ye 1 dk, `/week-review`): bu hafta etkin gün, rahatsızlık ort. vs geçen hafta (S1-04 istatistikleri), tamamlanan modül adları, gelecek haftanın teması, "Kartı paylaş" (`app/share.tsx` / `progressCard.ts` yeniden kullanılır). `program.ts`: d7'ye `review.weekly` (ölçüm haftaları dahil; THI'den sonra).
**Kabul:** Pazar günü seans listesinde 1 dk "Haftalık kart"; kart geçen hafta verisi olmadan da hata vermeden açılır; paylaşımda yalnız kullanıcının kendi sayıları.

### S1-10 · P1 · Bildirim metinleri güne göre + 3 gün yeniden giriş bildirimi
**Gerekçe:** Tek tip "günlük kontrol" bildirimi kanıksanır; kaybolan kullanıcıya suçsuz bir el uzatılır.
**Spek:** `src/notifications.ts`: `scheduleDailyReminder` yerine `scheduleWeekdayReminders(hour, texts: Record<1..7,{title;body}>)` — 7 WEEKLY tetik (`WEEKLY_REVIEW` ile aynı desen), kimlikler `settings`'te `reminderIds: string[]`; `scheduleReentryNudge(atISO, title, body, previousId)` tek seferlik (`DATE` tetik) ve `cancelScheduled`. `app/session.tsx` `markDone` ve `QuickCheckIn` kaydı sonrası: `+3 gün 19:00` için yeniden planla (`settings.reentryNudgeId`). `cancelReminders` artık yalnız günlük kimlikleri iptal eder (weekly review ve nudge'a dokunmaz — mevcut nottaki tuzak kapanır). Kopya `notif.day.1..7`, `notif.reentry.title/body` (§2.6).
**Kabul:** Ayarlardan saat değişince 7 bildirim yeniden kurulur ve haftalık inceleme silinmez; görev tamamlanınca eski nudge iptal, yenisi +3 gün; Expo Go Android'de sessiz başarısızlık.

### S1-11 · P2 · Sonuç ekranı "Programınızı belirleyen şeyler" + süre/bütçe tek satır
**Gerekçe:** Sonuç ekranında puan ile program arasındaki bağ görünür olur (UX A2 katman 2 ile uyumlu).
**Spek:** `results.tsx` katman 2: kol adı + hafta sayısı + "günde ~{min} dk (15 önerilir)" + S1-02 satırları; "Süreyi ve tarzı değiştir" → `/program/setup`. `results.program.autoBody` kaldırılır.
**Kabul:** Her tamamlanan ölçek için en az bir satır; metinler `consequences.ts`'ten gelir (kopya tekrarı yok).

### S1-12 · P2 · Büyüme sayaçları (KPI altyapısı)
**Gerekçe:** Sprint KPI'ları ölçülemiyorsa karar alınamaz; yerel, anonim sayaç yeterli.
**Spek:** `src/store/growth.ts` `GrowthEvent` → `+ 'checkinDone' | 'questionnaireScreenedOut' | 'shortSessionUsed' | 'reentryUsed' | 'weekReviewOpened' | 'measurementCompleted' | 'day1Completed' | 'day2Returned'`; ilgili ekranlarda `track()`. Ayarlar → Hakkında "Yerel sayaçlar" satırı yeni olayları listeler.
**Kabul:** Olaylar yalnız ad + sayı; ağ yok; `tests/growth.test.ts` güncel.

Sıra: S1-01 → S1-02 → S1-03 → S1-05 → S1-04 → S1-06 → S1-08 → S1-07 → S1-09 → S1-10 → S1-11 → S1-12. Her madde için `npx expo lint` + `npx tsc --noEmit` + `npm test`.

---

## 4. Sprint 2 (başlıklar) ve KPI'lar

### Sprint 2 adayları
1. THI-S (10 madde) isteğe bağlı ara kontrol: 2. ve 6. hafta, yalnız eğilim.
2. Modül "2 dakikalık özet" alanı ve modül içi ilerleme (yarım kalan modüle geri dönüş).
3. Düşük uyumda tek dokunuşla "dozu düşür" (program yeniden üretimi, tamamlananlar korunur).
4. Felaketleştirme/dikkat sürücüsüne göre modül sırası (olumsuz düşünceler 2. haftaya).
5. 12. haftadan sonra bakım modu: aylık THI, 3 ayda bir kısa kırmızı bayrak, +13 THI → tazeleme bloğu.
6. Perde eşleme sonrası ses otomatik ayarı ve "sesiniz" kartı (ikinci "vay" anının görselleştirilmesi).
7. Misofoni 2 madde, OSA 2 madde, uyku sıkıştırma kontrendikasyonları (Hekim B5–B6).
8. Düşünce kaydı hızlı ekleme (Ana ekrandan 1 satır).
9. Sesli rehberli uygulamalar (kayıt varlıkları; Expo Go uyumlu `expo-audio`).
10. Haftalık e-posta özeti (isteğe bağlı adres) ve klinik kodu paneli.
11. Varsayılan bütçe (15 vs 30 dk) ve hatırlatma saati için yerel A/B sayaçları.
12. HQ-R lisansı ve THI yazar izni (düzenleyici hazırlık).

### KPI'lar (yerel sayaçlar + beta görüşmeleri)
| KPI | Hedef | Kaynak |
|---|---|---|
| Kurulum → sonuç ekranı | ≥ %50 (önce %40) | `assessmentStarted/Completed` |
| Başlangıç değerlendirme süresi (medyan) | ≤ 8 dk | beta ölçümü |
| 1. gün tamamlama → 2. gün dönüş | ≥ %45 | `day1Completed/day2Returned` |
| D7 / D30 | ≥ %30 / %15 (önce %25/%12) | sayaçlar + mağaza |
| Haftalık hedef (5/7) tutturan etkin kullanıcı | ≥ %40 | `activeDaysOf` |
| Günlük check-in oranı (etkin kullanıcılarda) | ≥ %60 gün | `checkinDone` |
| 4. hafta THI tamamlama (başlayanlar içinde) | ≥ %60 | `measurementCompleted` |
| 4. haftada THI ≥7 puan düşüş | ≥ %40 | THI serisi |
| Kısa sürüm / yeniden giriş kullanımı | izlenir (yüksekse doz fazla) | `shortSessionUsed`, `reentryUsed` |
| PHQ/GAD taramadan çıkma oranı | izlenir (çok düşükse kapı eşiği gözden geçirilir) | `questionnaireScreenedOut` |

---

## 5. Kapsam dışı ve riskler
- Hiçbir ölçek kaldırılmadı; uzun formlar kapı arkasında ya da 2. haftada. MDR/klinik doğrulama için THI-25 başlangıç ve 4/8/12 ölçümleri değişmedi.
- SCI-02 ve THS-C kesme noktaları yayınlara karşı doğrulanacak (`espie2014`, yeni `henry2015`); THS Türkçe metni "ekran" etiketiyle sunulur, HQ-14 şiddet için yine toplanır.
- Yerel bildirim günün içeriğini bilemez; metinler güne göre genel kalır. Android Expo Go'da bildirim yok (mevcut).
- Program yeniden üretimi (doz düşürme) Sprint 2; bu sprintte mevcut programlar `completed` haritasıyla uyumlu kalır (görev kimlikleri değişmedi, yalnız günlere dağılım ve yeni kimlikler eklendi; var olan programlar yeniden üretilmeden eski düzende çalışmaya devam eder).
