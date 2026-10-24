# Dingin — Klinik inceleme (KBB / nöro-otoloji)

**İnceleyen rolü:** Klinik lider (KBB – nöro-otoloji). **Tarih:** 2026-10-24. **Sürüm:** `main` çalışma kopyası.
**İncelenen dosyalar:** README, docs/ARCHITECTURE.md, docs/research/{diagnosis,treatment}.md, src/clinical/{engine,causes,journey,questionnaires,program}.ts, src/content/{modules,articles}.ts (cbt.exposure, cbti.stimulusControl, cbti.compression, hyper.hierarchy, hyper.earplugs; supplements, acute-tinnitus, pulsatile-tinnitus, menieres), src/i18n/areas/{assess,exam}.ts, app/assess/{triage,results}.tsx, app/assess/exam/*, app/program/setup.tsx, src/audio/examTests.ts, src/audio/presets.ts, ekran görüntüleri (k-*, j-*).

**Genel yargı.** Klinik omurga doğru seçilmiş: NICE NG155 kademeleri, PHQ-9 madde 9 ile kendine zarar taraması (AAO-HNSF 2026 KAS 3), Cima 2019 süre sınıfları, THI/McCombe bantları, Chandrasekhar 2019 steroid penceresi, Lopez-Escamez 2015 Ménière ölçütleri ve iBDT modül yapısı literatürle uyumlu. Sorunlar daha çok (1) ekranlar arasında triyaj tutarsızlığı, (2) telefonla "muayene" denemelerinin güvenlik ve geçerlilik sınırları, (3) neden sıralamasında yüzde ve "tam düzelebilir" etiketlerinin yanlış güvence üretmesi ve (4) Türkiye'ye özgü kriz/sevk ifadelerinde toplanıyor. Aşağıdaki A maddeleri kapanmadan gerçek kullanıcıya açılmamalıdır.

---

## A) Gerçek kullanıcıdan önce mutlaka düzeltilecekler (5)

### A1. Triyaj sonucu ekrandan ekrana değişiyor; Ménière, ototoksik ve objektif tinnitus yanıtları kayboluyor
- **Ciddiyet:** Kritik (düşük triyaj).
- **Nerede:** `app/assess/triage.tsx` `toRedFlags`/`finish` (satır 20–74), `src/clinical/engine.ts` `computeTriage` (satır 68–94), `src/clinical/types.ts` `RedFlags`.
- **Sorun:** 12 sorudan A9 (başkalarının duyduğu ses), A11 (20 dk–12 sa vertigo + dolgunluk) ve A12 (yeni ototoksik ilaç) `RedFlags`'a yazılmıyor. A11/A12 yalnızca *önceden kaydedilmiş bir öykü varsa* `earFullness`/`ototoxicMeds` alanına kopyalanıyor; motor Ménière için ayrıca `hearingDifficulty` istiyor. Sonuç: triyaj ekranı "KBB ve odyoloji" derken `results.tsx`/`setup.tsx` aynı kullanıcıya "Öz yönetim programı uygun" diyebiliyor ve program başlatılabiliyor. Ayrıca `selfHarm` erken `return` ile diğer bayrakları (ör. ani işitme kaybı) siliyor; sonuç ekranında sadece "kendine zarar" nedeni görünüyor.
- **Değişiklik:** `RedFlags`'a `objectiveSound`, `menierePattern`, `newOtotoxicDrug` alanlarını ekleyin; motor bu alanları doğrudan okusun (A11 → tier 3 `triage.meniere`, A12 → tier 3 `triage.ototoxic`, A9 → tier 3 `triage.objective`). `triage.tsx`'teki satır 69–71 geçici düzeltmeleri kaldırın. Kademe hesabını "tüm nedenleri topla, en yüksek kademeyi döndür" biçimine çevirin; tier 0'da bile alt bayraklar `reasons` listesinde kalsın ki doktor özetine ve sevk listesine düşsün. Sonuç/setup ekranı, triyaj ekranının gösterdiği kademeyi tek kaynaktan (`computeTriage`) alsın; iki ekran farklı sonuç veremesin (birim testi: 12 sorunun her biri tek başına "Evet" iken kademe ≤ beklenen).
- **Kanıt:** NICE NG155 1.2.1–1.2.5; AAO-HNS 2014 görüntüleme istisnaları; Lopez-Escamez 2015.

### A2. Kriz yolu: "ALO 183 = kriz hattı" yanlış; güvenli bekleme talimatı ve her ekrandan erişim yok
- **Ciddiyet:** Kritik (hasta güvenliği).
- **Nerede:** `assess.ts` `who.crisis`, `triage.result.tier0.mh`, `triage.call183`; `app/assess/questionnaire/[id].tsx` `q.crisis.*`; `rec.urgentCare`.
- **Sorun:** ALO 183, Aile ve Sosyal Hizmetler Bakanlığı'nın sosyal destek hattıdır; 7/24 intihar kriz hattı değildir ve bu etiketle sunulması kullanıcıyı yanlış kapıya gönderir. Türkiye'de ulusal intihar önleme hattı yoktur; doğru rota 112 ve en yakın acil servis (psikiyatri acil konsültasyonu). Tier 0 metni "konuşmak isterseniz 112'yi arayabilirsiniz" biçiminde yumuşatılmış; NICE'ın "beklerken güvenli yer" ögesi yok; kriz kartı yalnızca triyaj ve PHQ-9 ekranlarında var (ayarlar/ana ekrandan erişilemiyor, çevrimdışı garantisi yok).
- **Değişiklik:** `who.crisis` → "112 Acil / en yakın hastane acil servisi (psikiyatri)". `triage.call183` butonunu "ALO 183 Sosyal Destek Hattı (psikososyal destek; acil değil)" diye yeniden etiketleyin ve ikinci sıraya alın. Tier 0 metnine ekleyin: "Şu anda kendinize zarar verme riski varsa 112'yi arayın ya da acil servise gidin. Yalnız kalmayın; güvendiğiniz birine haber verin. İlaç, kesici alet gibi araçları ulaşamayacağınız yere kaldırın." Kısa bir güvenlik planı (3 kişi, 3 yer, 3 uğraş) ekleyin. Kriz kartı ana sekme ve ayarlar menüsünden tek dokunuşla, metni uygulama paketinde gömülü olarak açılsın. PHQ-9 madde 9 > 0 olan kullanıcıda programın her 4 haftalık ölçümünde madde 9 tekrar sorulsun (bkz. B5).
- **Kanıt:** NICE NG155 1.2.1; AAO-HNSF 2026 KAS 3; VA/DoD 2024 hasta özeti.

### A3. Otomatik muayene manevraları kontrendikasyon taraması olmadan sunuluyor
- **Ciddiyet:** Yüksek (zarar riski).
- **Nerede:** `app/assess/exam/pressure.tsx`, `vascular.tsx`, `balance.tsx`, `ldl.tsx`; `exam.ts` uyarı metinleri; `src/audio/examTests.ts` `applicableExamSteps`.
- **Sorun:** (a) **Valsalva**, kafa travması/barotravma/perilenf fistülü şüphesi (`traumaFistula`), üçüncü pencere (`soundInducedDizzy`), ani işitme kaybı ve aktif vertigo olan kullanıcıya da sunuluyor; bu gruplarda basınç manevrası vestibüler kriz ya da fistül ilerlemesi yapabilir. Mevcut uyarı yalnızca akıntı/ameliyat/zar perforasyonunu sayıyor. (b) **Boyun yanına bası**: kullanıcı internal juguler ven ile karotis sinüsünü ayırt edemez; karotis sinüs basısı senkop/bradikardi, ≥60 yaş ya da karotis plağı olanda emboli riski taşır. Metindeki "şah damarına basmayın" uyarısı kullanıcıya bu ayrımı yaptıramaz. (c) **Denge testi** (30 sn gözler kapalı, ayaklar bitişik) `rf.vertigo`, Ménière örüntüsü ya da düşme öyküsü olanlara "yanınızda biri olsun" notuyla açık; düşme riski. (d) **LDL**: HQ ≥ 28 ya da ses-ağrı tanımlayan kullanıcıya 0 dBFS tavana kadar 1 ve 4 kHz warble ton sunuluyor; ağrı hiperakuzisinde tek sunum bile günlerce alevlenme yapabilir.
- **Değişiklik:** Pil için bir "uygunluk kapısı" (`examEligibility(a)`): `headTrauma || barotrauma || suddenHearingLoss || vertigo || soundInducedDizzy || otorrhoeaOrPain` → basınç manevraları gizlenir ("KBB muayenesinde yapılır"). Juguler bası adımını **kaldırın**; yalnızca baş çevirme ve "egzersizle hızlanıyor mu / uzanınca değişiyor mu" soruları kalsın; bası manevrasını hekimin yapacağı bir madde olarak doktor özetine yazın. Denge testi `vertigo`, `menierePattern`, yaş ≥ 65 ya da düşme öyküsünde kapalı; ayrıca ayaklar bitişik yerine omuz genişliğinde, duvar temaslı. LDL: HQ ≥ 28 ya da ses-ağrı yanıtı varsa test devre dışı; diğerlerinde başlangıç −50 dBFS, tavan kullanıcı sınırının 10 dB altı, 5 dB yerine 3 dB adım, tek frekans. Tüm sonuç etiketlerinden "normal/anormal" çıkarılsın (bkz. B8).
- **Kanıt:** Chandrasekhar 2019 (akut dönemde ıkınma/Valsalva kaçınma); Minor 2000 (SSCD'de basınç/Tullio); karotis sinüs masajı kontrendikasyonları (ESC 2018 senkop kılavuzu); Formby 2015 (hiperakuzide "asla rahatsız edici düzey").

### A4. Neden sıralaması yüzde ve "Tam düzelebilir" etiketiyle yanlış güvence veriyor; dışlanması gereken nedenler "düşük olasılık" görünüyor
- **Ciddiyet:** Yüksek (yanlış güvence + düzenleyici risk).
- **Nerede:** `src/clinical/causes.ts` (prior'lar, `rankCauses`, `confidence`), `assess.ts` `causes.curability.*`, `causes.result.body`, `cause.*.treat`; ekran `k-results-1.png`.
- **Sorun:** Softmax ile 16 aday arasında paylaştırılan yüzdeler bir ön-olasılık gibi okunuyor ("Yüksek olasılık · %40"). Tek taraflı tinnitus + tarama asimetrisi olan bir kullanıcıda retrokoklear skor −0,9'da kalır (prior −3,5), `noiseCochlear` 0,6 ile başa geçer; ekranda "işitme siniri kaynaklı: düşük olasılık %4" yazar ve kullanıcı MR'ı gereksiz sayabilir. Oysa bu nedenler olasılıkla değil **dışlama zorunluluğu** ile ele alınır. "Tam düzelebilir" etiketi `vascular`, `systemic`, `sscd`, `otosclerosis`, `conductive` için kullanılmış; SSCD cerrahisi işitme riski taşır, stapedotomi tinnitusu olguların yaklaşık %60–80'inde azaltır ama bazılarında artırır, venöz sinüs darlığı/dAVF'de girişim her zaman tinnitusu gidermez. "Buşon temizliği ile çınlama sıklıkla aynı gün geçer", "altta yatan durum tedavi edilince çınlama genellikle tamamen geçer" ifadeleri kanıtsızdır.
- **Değişiklik:** Sıralamayı iki katmana ayırın: **"Önce dışlanmalı"** (ssnhl, retrocochlear, vascular, meniere, sscd, traumaFistula, myoclonus; herhangi bir tetikleyici varsa yüzdesiz, "KBB'nin dışlaması gereken" etiketiyle en üstte) ve **"Olası mekanizma"** (kalanlar; yüzde yerine "düşük / orta / güçlü ipucu"). `Curability` etiketlerini şu üçlüye çevirin: "Nedene yönelik tedavi var" / "İşitme ve sıkıntı için tedavi var" / "Yönetim odaklı". `cause.*.treat` metinlerine çalışma büyüklüğü ve belirsizlik ekleyin (ör. otoskleroz: "cerrahi sonrası tinnitus olguların çoğunda azalır, küçük bir bölümünde artabilir"). Kart başlığını "Hekiminizle konuşulacak olasılıklar" yapın; "Kılavuz önerisi" rozeti neden sorularında "Uzman görüşü" olarak değiştirilsin (ağırlıklar kılavuzdan değil uzman sentezinden geliyor).
- **Kanıt:** AAO-HNS 2014/2026 görüntüleme ifadesi; Durakovic 2019; Sobrinho 2004 / Ismi 2017 (stapedotomi sonrası tinnitus); Hofmann 2013 (pulsatil tinnitus etiyoloji serisi).

### A5. Pulsatil tinnitus ve "2 hafta" kademesinde program kapısı yok; IIH/dAVF ipuçları sorulmuyor
- **Ciddiyet:** Yüksek.
- **Nerede:** `app/assess/results.tsx` `startProgram`/`hardBlocked` (satır 34–40), `app/program/setup.tsx` `needsAck`, `journey.ts` `REFERRAL['triage.pulsatile']`, `articles.ts` pulsatile-tinnitus ("uygulama program başlatmaz"), `causes.ts` `CAUSE_QUESTIONS`.
- **Sorun:** Makale "pulsatil işaretlenince program başlatmaz" diyor; kodda pulsatil tier 3 ve sonuç ekranından onay istemeden başlatılıyor. Tier 2 (hızla kötüleşen işitme, PHQ-9 ≥ 20) `setup.tsx`'te onay isterken `results.tsx`'te istemiyor. Pulsatil tinnitusta idiyopatik intrakraniyal hipertansiyon (baş ağrısı, geçici görme kararması, papilödem) ve dural AV fistül (tek taraflı, objektif üfürüm, yeni başlangıç) sorulmuyor; bu iki durum "rutin" değil "haftalar içinde" değerlendirme ister.
- **Değişiklik:** Pulsatil + (tek taraflı ya da yeni < 3 ay ya da baş ağrısı/görme belirtisi) → tier 2 ("2–4 hafta içinde KBB, görüntüleme ile"). Pulsatil → `triage.q6` evet ise iki ek soru: "Baş ağrısı ya da birkaç saniyelik görme kararmaları eşlik ediyor mu?" ve "Yeni başladı ve tek kulakta mı?" `results.tsx` ve `setup.tsx` aynı kapı kuralını paylaşsın: tier 0–1 kilit; tier 2 ve pulsatil tier 3 → "Hekim randevumu aldım" onayı; onay tarihi doktor özetine yazılsın. Pulsatil kolda ses zenginleştirme + eğitim açık, BDT modülleri onay sonrası.
- **Kanıt:** NICE NG155 1.2.5 ve görüntüleme önerisi; RadioGraphics 2024 pulsatil tinnitus görüntüleme; Hofmann 2013.

---

## B) Yüksek etkili iyileştirmeler (10)

### B1. Ölçek sadakati: THI alt ölçek, SCI bantları, kanıt rozetleri
- **Ciddiyet:** Orta. **Nerede:** `questionnaires.ts` THI madde 17 (`C` → orijinalde Fonksiyonel), SCI madde 1–3 seçenek bantları, `evidence: 'rct'` (HQ, SCI, RaSST); `citations.ts` `sendesen2024`, `okamoto2010` `level: 'rct'`; `engine.ts` `rec.notched`, `rec.soundFirst`.
- **Değişiklik:** THI alt ölçeklerini Newman 1996'ya göre düzeltin (F 12, E 8, C 5: maddeler 5, 8, 11, 19, 23); `catastrophizing` sürücüsü buna göre yeniden eşiklensin. SCI maddeleri Espie 2014 orijinal bantlarına (0–15 / 16–30 / 31–45 / 46–60 / ≥61 dk; 0–1 / 2 / 3 / 4 / 5–7 gece) döndürülsün. Ölçekler için rozet "Valide ölçek" olsun. Sendesen 2024 prospektif kohorttur, Okamoto 2010 küçük (n=39) ve Stein 2016 negatiftir → `rec.notched` metni "küçük ama ölçülebilir fayda" yerine "deneysel; gürlükte küçük etki, sıkıntıda etki gösterilememiş" ve rozet "Düşük kanıt". `rec.soundFirst`/`cbtFirst` rozet "Kohort".
- **Kanıt:** Newman 1996; Espie 2014; Stein 2016; Scarpa 2024; Sendesen 2024.

### B2. Doktor özeti bir Türk KBB uzmanının isteyeceği alanları içermiyor
- **Ciddiyet:** Orta-yüksek. **Nerede:** `results.tsx` `buildSummary`, `FLAG_KEYS`, `buildHtml`.
- **Değişiklik:** Başlık "Hasta öz-bildirimi (uygulama taraması) — tanı değildir". Ekleyin: triyaj kademesi ve nedenleri; yaş; başlangıç tarihi ve tetikleyici; taraf/karakter/seyir (mevcut); gürültü/askerlik/meslek maruziyeti; ilaç listesi (ototoksik evet/hayır + hangi); vertigo atak süresi ve dolgunluk; A5 hızla kötüleşme (şu an `FLAG_KEYS` dışında); daha önce odyometri/işitme cihazı; aile öyküsü; THI toplam + grade, PHQ-9 toplam ve **madde 9**, GAD-7, HQ, SCI, RaSST; tarama odyogramı frekans-frekans tablo (±10 dB bant, "kalibre edilmemiş ekran tahmini" damgası) ve asimetri bayrağı; psikoakustik (perde ± aralık, dB SL, MML, RI tipi/süre); neden kartları yerine "hekimin dışlaması önerilen durumlar"; ölçek sürümleri ve uygulama sürümü. "Kesinleştirmek için gereken testler" başlığı "Hekim uygun görürse düşünebileceği testler" olsun; uygulama MR/BT "gerekli" diyemez.
- **Kanıt:** AAO-HNSF 2026 KAS 1 (hedefli öykü), NICE 1.1.

### B3. İşitme cihazı ve koklear implant yolu eksik; "hiç test edilmedi" çıkarımı yanlış kaynaktan
- **Ciddiyet:** Orta-yüksek. **Nerede:** `engine.ts` satır 90–91, 150; `history` alanları; `rec.hearingAids`.
- **Değişiklik:** Öyküye "Daha önce işitme testi yapıldı mı? / İşitme cihazı kullanıyor musunuz?" ekleyin; `neverTested` buna dayansın. AAO-HNSF 2026 KAS 5 gereği süreden bağımsız her kullanıcıya "tam odyolojik değerlendirme" önerisi (tier 5'te bile, `who.none` → "Sevk zorunlu değil; bir kez odyolojik değerlendirme önerilir"). Tarama PTA4 ≥ 40 dB ya da `hearingDifficulty` + iletişim güçlüğü → `rec.hearingAids` öncelik 1 ("NICE: iletişimi etkileyen kayıpta amplifikasyon"). Tarama PTA4 ≥ 70 dB ya da tek kulakta ağır kayıp (SSD) → yeni `rec.ciCandidacy`: "Koklear implant adaylığı için KBB; implant sonrası THI ortalama −14 (meta-analiz, kontrolsüz)". `hearing-aids` makalesine KI bölümü.
- **Kanıt:** AAO-HNSF 2026 KI ifadesi; NICE 1.5; PMC11431415 (2024 meta-analiz); Schoisswohl 2025 (UNITI).

### B4. Tier 2 akıl sağlığı eşiği ve sevk yolu
- **Ciddiyet:** Orta-yüksek. **Nerede:** `engine.ts` `severeDistress`, `rec.mentalHealth`; `who.entPsych`.
- **Değişiklik:** PHQ-9 15–19 (orta-ağır) ve GAD-7 ≥ 15 için de `rec.mentalHealth` öncelik 1 ve "2 hafta içinde aile hekimi → psikiyatri" ifadesi; NICE "ruh sağlığını etkileyen sıkıntı" kademesi THI ≥ 58'e ek olarak "günlük işleri engelliyor mu?" tek maddesiyle belirlensin (şu an THI tek başına kullanılıyor; makul ama kullanıcıya nedeni açıklanmalı). `who.entPsych` → "Psikiyatri / klinik psikolog (aile hekimi aracılığıyla) + KBB". Program kolunda `severe` kullanıcılar için "klinisyen eşliğinde" uyarısı setup'ta görünür olsun (şu an yalnız öneri listesinde).
- **Kanıt:** NICE 1.2.4; Cima 2019 (dekompanzasyon ≥ 2 → psikolojik değerlendirme).

### B5. Program ölçüm ve yeniden tarama takvimi
- **Ciddiyet:** Orta-yüksek. **Nerede:** `program.ts` satır 158–163, `adaptationAdvice`; `CBT_WEEKS` 6. hafta `cbt.exposure`.
- **Değişiklik:** 4. haftada PHQ-9 (madde 9 dahil) ve 8. haftada kırmızı bayrak taraması ekleyin (şu an 4 ve 12). Akut kolda ilk 4 hafta her hafta tek soru: "Bu hafta işitmeniz düştü mü?" → evet ise tier 1 akışı. Hafif (6 hafta) sürümde `cbt.relapse`/`cbt.toolbox` 6. haftaya taşınsın (şu an hiç planlanmıyor). Hiperakuzi kolunda `cbt.exposure` 6. haftada planlanmasın ya da `hyper.hierarchy` ile değiştirilsin (modül metni zaten "ayrı yöntem" diyor). Somatik kolda 6. hafta "değişim yoksa FTR/diş hekimi" kuralı `adaptationAdvice`'a girsin (treatment.md §12.5'te var, kodda yok). Uyku sıkıştırma (`cbti.compression`) planlanmadan önce 5 kontrendikasyon maddesi (epilepsi, bipolar, parasomni, güvenlik-kritik iş/gece vardiyası, gebelik/OSA şüphesi) **uygulama içinde sorulsun**; herhangi biri evet ise modül atlanır, uyaran kontrolü sürer. OSA için 2 madde (horlama + tanıklı apne) ekleyin.
- **Kanıt:** Marks 2023; Morin 2011; AAO-HNSF 2026 izlem ifadesi; Chandrasekhar 2019.

### B6. Hiperakuzi ses düzeyi ve misofoni dışlaması
- **Ciddiyet:** Orta-yüksek. **Nerede:** `src/audio/presets.ts` `hyperacusisWeekVolume` (0,25 lineer → 0,7; +2,5 dB/hafta), `program.ts` `hyper.exposure` 20→60 dk; `engine.ts` hiperakuzi fenotipi.
- **Değişiklik:** Başlangıç düzeyi sabit −12 dBFS yerine kullanıcının "açıkça rahat" diye ayarladığı düzey olsun ve haftalık artış kullanıcı onayıyla (+2 dB, "rahatsızsa bu hafta artırma"); LDL ölçüldüyse tavan = LDL −20 dB. Hoparlör tercih edilsin, gece kulaklık uyarısı (`hyper.earplugs`'ta var) presetin kendisinde de görünsün. Misofoni 2 maddelik tarama ("belirli sesler — çiğneme, nefes, tıklama — öfke/tiksinti yaratıyor mu?"); pozitifse ses maruziyet kolu kapalı, psikoeğitim + psikoloji sevki (`treatment.md` §6.3 kodda uygulanmamış). Süre: 60 dk/gün hedefi haftada en fazla +5 dk ile çıksın (mevcut).
- **Kanıt:** Formby 2015; Jüris 2014; Swedo 2022; Vernon & Press 1998.

### B7. Türkiye sevk ifadeleri
- **Ciddiyet:** Orta. **Nerede:** `assess.ts` `who.*`, `triage.result.tier1–4.body`, `triage.*.say`.
- **Değişiklik:** Türkiye'de KBB'ye doğrudan MHRS randevusu alınabilir; metin: "MHRS (182 / e-Nabız) üzerinden KBB randevusu alın; 24 saat içinde randevu yoksa hastane acil servisine başvurun (acil KBB konsültasyonu istenir)". `who.audiology` "Odyoloji (işitme merkezi)" → "Hastane/üniversite odyoloji birimi" (özel işitme merkezleri cihaz satar; çıkar çatışması). `who.physio` → "Fizik tedavi ve rehabilitasyon (FTR) hekimi → fizyoterapist (sevkle)". `who.gp` "Aile hekimi" ilk basamak olarak kalsın; sistemik nedenlerde "kan sayımı, TSH, tansiyon aile hekimliğinde istenebilir". Tier 1 metnine "kortikosteroid tedavisi ilk 2 hafta içinde başlanmalı; en iyi sonuç ilk günlerde" eklensin.
- **Kanıt:** Chandrasekhar 2019; Sağlık Bakanlığı MHRS uygulaması (sevk zinciri zorunlu değil).

### B8. Otomatik muayene testlerinin yeniden etiketlenmesi (geçerlilik)
- **Ciddiyet:** Orta-yüksek. **Nerede:** `examTests.ts` `DIN_PASS_SRT_DB = −8`, `LDL_LOW_MARGIN_DB = 20`, `SWAY_ABNORMAL_SCORE = 12`; `exam.ts` `*.result.pass/fail/low/normal/abnormal`; `causes.ts` satır 173–182.
- **Değişiklik:** **DIN**: TTS çıkış düzeyi sabitlenemez, Türkçe üçlü normu yok; "Beklenen aralıkta / Beklenenden yüksek" etiketleri kaldırılsın, sonuç "kayıt: SRT ≈ x dB (kalibre değil)" olarak doktor özetine; neden ağırlığı (0,8/0,5) sıfırlansın ya da 0,3'e indirilsin; Türkçe DIN normlanana kadar "gürültüde dinleme alıştırması" adıyla sunulsun. **LDL**: dBFS cinsinden "rahatsızlık düzeyi" klinik LDL değildir; "Ses rahatlık öz-bildirimi" adı, `ldlLow` hiperakuzi fenotipini tetiklemesin (HQ yeterli). **Denge**: ivmeölçer RMS eşiği 12 keyfî; "beklenenden fazla salınım" etiketi Ménière/retrokoklear skoruna +0,9 ekliyor → kaldırın; test ya tamamen çıkarılsın ya da yalnızca "kaydedildi, hekim yorumlar". **Basınç manevraları** ve **somatik manevra testi** öz-bildirim olarak savunulabilir (A3 kapısıyla). **Vasküler**: baş çevirme kalabilir, bası kaldırılır (A3).
- **Kanıt:** Chen 2021 (kalibrasyonsuz hatalar > 8–14 dB); De Sousa 2020 (DIN dil/norm bağımlılığı); Sherlock & Formby 2005; Mancini 2012 (ivmeölçer posturografi: gövdeye sabitlenmiş, normlu).

### B9. Aşırı iddia taraması (metin)
- **Ciddiyet:** Orta (etik kurul/düzenleyici). **Nerede:** `assess.ts` `cause.*.treat`, `rec.*`, `phenotype.*.info`; `articles.ts`.
- **Değişiklik:** "İşitme cihazı çınlamayı belirgin azaltır (6 haftada THI −12 civarı)" → "kontrolsüz bir çok merkezli kohortta 6 haftada THI ortalama −12; Cochrane 2018 kesinlik düşük". "%53 belirgin iyileşme" / "%61 klinik iyileşme" → n=38 ve n=80'lik tek RKÇ'ler olduğu belirtilsin. "Hafif kayıpta 3 ayda %65 tam düzelme" → tek kohort. "Merkezi çınlama … zararsızdır" → "diğer nedenler dışlandığında tehlikeli bir durum göstermez". `rec.avoidSupplements` "melatonin" listesini "tinnitus için önerilmez; uyku için hekimle konuşulabilir" diye nüanslayın (supplements makalesiyle tutarlı). `triage.result.tier5.title` "Acil bir bulgu yok" kalsın ama gövdeye "bu tarama hekim muayenesinin yerini tutmaz; kılavuzlar tüm tinnitus hastalarına bir kez odyolojik değerlendirme önerir" eklensin. README "12 haftalık rehabilitasyon programı üretir" → "öz-yönetim programı"; "tedavi eder/iyileştirir" yasağı `cause.*.treat` metinlerine de uygulansın ("tamamen düzelir", "aynı gün geçer").
- **Kanıt:** Sereda 2018; Ear Hear 2025 kohort; Michiels 2016; van der Wal 2020; AAO-HNSF 2026.

### B10. Düzenleyici çerçeve: triyaj + neden sıralaması SaMD'dir
- **Ciddiyet:** Orta (yayın öncesi). **Nerede:** README, onboarding, `Disclaimer`.
- **Değişiklik:** Uygulama kademe belirliyor ve mekanizma sıralıyorsa MDR'de en az sınıf IIa / TİTCK tıbbi cihaz yazılımı kapsamına girer; "prototip/araştırma" ibaresi mağaza sürümünde koruma sağlamaz. Onboarding'de 18 yaş altı, gebelik ve aktif psikiyatrik tedavi için kapsam dışı uyarısı; klinik değerlendirme planı (Wasano 2026 benzeri sham-kontrollü tasarım, THI/TFI birincil) ve olumsuz olay bildirimi (uygulama içi "kötüleşme bildir") eklensin. THI yazar izni ve HQ-R lisansı alınsın.
- **Kanıt:** MDR 2017/745 Kural 11; MDCG 2019-11; treatment.md §12.6.

---

## C) Olsa iyi olur (5)

### C1. Öykü maddeleri ve temel NRS
- **Ciddiyet:** Düşük. **Nerede:** `history` ekranı, `types.ts`. Ekleyin: önceki odyometri, işitme cihazı, ailede erken işitme kaybı, "uyanık zamanın yüzde kaçında farkındasınız", gürlük/rahatsızlık 0–10 NRS (haftalık izlem için temel). **Kanıt:** TSCHQ (Langguth 2007), Adamchic 2012.

### C2. HQ-R ve Mini-TQ-TR
- **Ciddiyet:** Düşük. **Nerede:** `questionnaires.ts`. 14 maddelik Khalfa'nın Türkçe yapı geçerliliği tartışmalı; 12 maddelik HQ-R (kesme 14) tercih edilsin; TFI lisansı alınamazsa ikinci sonuç ölçütü olarak Tr-ITI ya da TQ-12-T. **Kanıt:** Türkçe HQ-R 2025; Gürses TQ-12-T.

### C3. Doktor özeti PDF düzeni
- **Ciddiyet:** Düşük. Tek sayfa, KBB poliklinik akışına uygun sıra (yakınma → süre/taraf → eşlik eden → kırmızı bayraklar → ölçekler → tarama odyogramı → psikoakustik → kullanıcı soruları); odyogram grafiği ±10 dB bantla; her satırda "öz-bildirim" damgası; QR ile JSON dışa aktarım.

### C4. Ménière kartı ve kriz anı rehberi
- **Ciddiyet:** Düşük. `cause.meniere` kartına "Definite/Probable" ölçütlerinin hekim tarafından uygulanacağı notu; `menieres` makalesindeki "atak sırasında" bölümü, `phenotype.possibleMeniere` kullanıcılarına bildirimle sunulsun; atak günlüğü (süre, işitme, dolgunluk) doktor özetine eklensin. **Kanıt:** Lopez-Escamez 2015; Basura 2020.

### C5. Uzun dönem izlem
- **Ciddiyet:** Düşük. 12. haftadan sonra aylık THI + PHQ-9/GAD-7, 3 ayda bir kırmızı bayrak taraması; THI +13 artışta otomatik "takviye bloğu" (treatment.md §12.5'te var, kodda yok); haftalık gürlük NRS > 3 puan artışında ses düzeyi uyarısı.

---

## Doğrulanan sayılar (değişiklik gerekmeyen)
THI McCombe bantları (0–16/18–36/38–56/58–76/78–100) ve MCID 7/11; PHQ-9 ve GAD-7 kesmeleri; SCI ≤ 16; Ménière atak süresi 20 dk–12 sa; SSNHL tanımı (≥30 dB, ≥3 ardışık frekans, 72 sa) ve steroid penceresi (ilk 2 hafta; 2–6 haftada intratimpanik kurtarma); NICE kademeleri (24 saat, 2 hafta, rutin); asimetri bayrağı (≥15 dB tek frekans / ≥10 dB iki ardışık); uyku sıkıştırma kuralları (TST + 30 dk, ≥ 5,5 sa, %85 eşiği, +15 dk); hiperakuzi artış hızı 2–3 dB/hafta; betahistin/ginkgo/çinko Cochrane sonuçları; RI oturum başına ≤ 3 deneme.
