# Odyolojik inceleme — Dingin psikoakustik, işitme taraması ve ses terapisi modülleri

**Gözden geçiren:** Klinik odyolog (tinnitus/hiperakuzi; akıllı telefon odyometrisi deneyimi)
**Tarih:** 2026-10-24
**Kapsam:** `src/audio/*`, `app/assess/{headphone-check,hearing,pitch,loudness,mml,ri}.tsx`, `app/assess/exam/{din,ldl}.tsx`, `app/sound/{player,mixing-point}.tsx`, `src/clinical/engine.ts`, `src/i18n/areas/{psycho,exam,sound}.ts`, `app/assess/results.tsx` (doktor özeti); `docs/research/diagnosis.md` §3–4 ve `treatment.md` §3, §6 referans alındı.

**Genel değerlendirme.** Protokol iskeleti doğru kaynaklara oturuyor (Wunderlich 2015 / Vielsmeier 2020 özyinelemeli 2AFC, Henry 2013 sırası, Vernon–Meikle RI, Fournier 2018 MRIL, Chen 2021). "Tarama, test değil" dili ve ±10 dB belirsizlik bandı doğru refleksler. Ancak kalibrasyonsuz bir telefonda **tüm düzeylerin dBFS (0 = cihaz tam ölçeği) olması** ile klinik motorun **dB HL varsayan eşikleri** arasında kopukluk var; bazı sonuçlar hiç tetiklenmiyor, bazıları da hekime yanlış birimle gidiyor. Ayrıca mevcut DSP altyapısı stereo WAV üretebildiği hâlde ("binaural" preset) tek kulaklı sunum ve antifazik DIN "imkânsız" kabul edilmiş; bu, en büyük kaçırılmış fırsat. Aşağıdaki maddeler öncelik sırasına göre, her biri dosya/ekran, somut değişiklik ve gerekçe ile verilmiştir. Kod değiştirilmemiştir.

---

## A) Mutlaka düzeltilmeli (5)

### A1. PTA4 kuralı dBFS/dB HL karışıklığı yüzünden hiç çalışmıyor; rapora yanlış birimle gidiyor
- **Önem:** Kritik (klinik karar + rapor doğruluğu)
- **Yer:** `src/clinical/engine.ts` `pta4()`, `computeTriage()` (`p > 25`), `buildProfile()` (`p > 25`); `app/assess/hearing.tsx` (`HIGH_PTA_DB = -25`); `app/assess/results.tsx` (`results.summary.pta`); `src/i18n/areas/assess.ts`
- **Sorun:** Eşikler `levelDb ≤ 0` (dBFS) olarak saklanıyor; `pta4()` bu negatif değerlerin ortalamasını alıyor; `p > 25` koşulu **asla doğru olamaz**. Sonuç: taramadan "olası işitme kaybı" (Tier 4) ve `hearingLossAssociated` fenotipi hiçbir zaman tetiklenmiyor; yalnızca öz bildirim çalışıyor. Aynı değer doktor özetine "PTA4 (kötü kulak): yaklaşık −38 dB" olarak gidiyor; hekim bunu dB HL sanır.
- **Değişiklik:** (1) Motorda tek bir "cihaz-göreli tarama eşiği" tanımlayın: `pta4 > HIGH_PTA_DB (−25 dBFS)` ya da daha iyisi A4'teki biyolojik referansla `dB SL`'ye çevirin. (2) Motor ve ekran aynı sabiti `psychoacoustics.ts`'den alsın. (3) Rapor satırı: "İşitme taraması (kalibre edilmemiş, dB re cihaz tam ölçeği; 0 = en yüksek; **dB HL değildir**): Sağ 0,5/1/2/4/6/8 kHz: −55/−60/−50/−40/−35/−30; Sol …; PTA4 sağ −51, sol −48; belirsizlik ±10 dB". (4) Her iki kulak birlikte modunda `ear: 'both'` (ya da `binaural: true`) saklayın; şu an aynı değer sol ve sağa kopyalanıyor ve rapor "kötü kulak" diyor.
- **Gerekçe:** `diagnosis.md` §4.2 "asla 'normal' deme, kalibre değilse". Birimi yanlış raporlanan sayı, hiç raporlanmayandan daha zararlıdır.

### A2. MML ve RI farklı uyaranlarla ölçülüyor; "MML + 10 dB" gerçek değil
- **Önem:** Kritik (RI sonucunun geçerliliği)
- **Yer:** `app/assess/mml.tsx` (`NOISE = white noise`), `app/assess/ri.tsx` (`spec = narrowband 0.33 oct @ pitch` varsa), `psychoacoustics.ts` `riMaskerLevel()`
- **Sorun:** MML geniş bantlı beyaz gürültüyle alınıyor; RI maskeleyicisi perde çevresinde 1/3 oktav dar bant. `normalize(…,0.5)` tepe normalizasyonu nedeniyle iki sinyalin aynı dBFS'teki gürlüğü ve spektral düzeyi farklıdır; dar bant 1/3 oktav gürültünün MML'i beyaz gürültününkinden tipik olarak 5–15 dB farklı çıkar. "MML + 10" bu durumda ya yetersiz (RI yok çıkar) ya da gereksiz yüksektir.
- **Değişiklik:** Fournier & Hébert 2018 MRIL gibi **aynı uyaranla** ölçün: perde biliniyorsa MML'i de 1/3 oktav NBN ile alın (`mml.tsx` `NOISE` → `{kind:'narrowband', color:'white', centerHz: pitchHz, octaves: 0.33}`), perde yoksa her ikisi de beyaz gürültü olsun. `mmlDb` kaydına `stimulus: 'nbn'|'bbn'` ve `centerHz` ekleyin. RI ekranındaki "Perdenize ayarlı dar bantlı gürültü" metni, MML de NBN ile alındıysa gösterilsin.
- **Gerekçe:** Vernon & Meikle protokolü ve Hu 2021/Sendesen 2024 tek uyaranla (NBN) MML→RI zinciri kullanır; Roberts 2008 RI derinliğinin maskeleyici spektrumuna bağlı olduğunu gösterir.

### A3. "Maskelenmiyor" sonucu sayısal MML olarak kaydediliyor; RI "pozitif" bayrağı ile kategori tutarsız
- **Önem:** Kritik (veri bütünlüğü, öneri motoru)
- **Yer:** `app/assess/mml.tsx` `save()` (notMaskable → `capDb − noiseThresholdDb` yazılıyor), `src/clinical/types.ts` `PsychoacousticResult`, `app/assess/ri.tsx` `save()`, `engine.ts` (`riCategory === 'partial'` → `rec.soundFirst`)
- **Sorun:** (a) Maskelenemeyen tinnitus "MML: 48 dB" olarak rapora gidiyor. (b) `scoreResidualInhibition` "partial" kategorisini ≥2 puan düşüşe veriyor, ama RI+ tanımı "≤ %50 ≥ 5 s"; motor `partial`'ı RI+ sayıp ses-öncelikli öneriyor; ekran ise "RI −" rozeti gösterebiliyor.
- **Değişiklik:** `PsychoacousticResult`'a `mmlNotMaskable: boolean`, `mmlStimulus`, `riPositive: boolean`, `riDepth` ekleyin; motor `riPositive`'i kullansın; rapor "MML: güvenli sınırda maskelenmedi (sınır −1 dBFS, gürültü eşiği −52 dBFS)" yazsın.
- **Gerekçe:** `diagnosis.md` §3.2 RI-pozitif tanımı; VA/DoD 2024 psikoakustik ölçümleri "sonuç ölçütü" olarak değil, fenotipleme için önerir — fenotip etiketi iç tutarlı olmalı.

### A4. Düşük düzeyli ton dosyaları 16-bit'te kuantizasyon bozulmasıyla üretiliyor (eşikler tonu değil, "cızırtıyı" ölçüyor)
- **Önem:** Kritik (işitme taraması, gürlük eşiği, LDL geçerliliği)
- **Yer:** `src/audio/sounds.ts` `renderToneBurst()` (0,5 × g, 16-bit, dither yok), `src/audio/psychoPlayer.ts` `playToneOnce()` (düzey dosyaya gömülü, `player.volume = 1`), `psychoacoustics.ts` `HEARING_SEARCH.minDb = −70`
- **Sorun:** −60 dBFS'te sinüs genliği ≈16 LSB, −70'te ≈5 LSB, −80'de ≈1,6 LSB. Dithersiz 16-bit'te bu, harmonikleri zengin bir basamaklı dalga üretir; işitme kaybı olan kişi 8 kHz tonunu değil, düşük frekanslı bozulma ürünlerini duyabilir → eşik olduğundan iyi çıkar. Ayrıca −70 dBFS tabanı, telefon %70'te ≈ 20–25 dB SPL'e denk gelir; normal işiten pek çok kişi tabana "yapışır" (eşik = −70), normal/hafif kayıp ayrımı kaybolur.
- **Değişiklik:** Tonu **−12 dBFS'te** üretin (`renderToneBurst(freq, ms, −12)`), düzeyi `player.volume = dbToVolume(levelDb + 12)` ile verin (expo-audio float kazanç uygular; `psychoPlayer.start()` zaten `volume` alıyor). Alternatif: TPDF dither ekleyin ve 24-bit WAV yazın. Tabanı −90 dBFS'e indirin. Aynı yaklaşımı `playNarrowbandOnce` zaten kullanıyor (player volume); tonlarda da standartlaştırın.
- **Gerekçe:** Temel sayısal ses ilkesi; hearTest/hearScreen yazılım zayıflatmasını float kazançla yapar (Swanepoel 2014).

### A5. Tek kulaklı sunum ve antifazik DIN "imkânsız" değil: stereo WAV ile mümkün
- **Önem:** Kritik (asimetri taraması, DIN geçerliliği; README'deki yanlış sınır)
- **Yer:** `src/audio/engine.ts` `playBurst()` yorumu ("no per-channel pan"), `README.md` "Sağ/sol kanal yönlendirme mümkün değildir", `app/assess/hearing.tsx` (kulaklık çıkarma modu), `app/assess/exam/din.tsx`
- **Sorun:** `encodeWav` ve `renderSound('binaural')` zaten iki kanallı dosya yazıyor. Bir kanalı sessiz olan stereo burst, kulaklık çıkarmadan **monaural** sunum sağlar; "Ses hangi kulakta?" sorusu da gerçek bir kulaklık/kanal kontrolü olur (hoparlörden çalınırsa iki tarafta duyulur). Kulaklık çıkarma yöntemi, kulak içi kulaklıklarda sızıntı ve ortam gürültüsü nedeniyle sol/sağ eşikleri sistematik bozar.
- **Değişiklik:** `renderToneBurst(freq, ms, levelDb, warble, channel: 'left'|'right'|'both')` → `channels: [L, R]` (biri `Float32Array(n)` sıfır). Kulaklık kontrolüne 1 kHz tonu önce sola, sonra sağa gönderip "Hangi tarafta duydunuz?" sorusu ekleyin; iki yanıt da doğruysa `headphonesVerified: true`. OS "mono ses" erişilebilirlik ayarı için uyarı metni: "Telefonun erişilebilirlik ayarlarında 'Mono ses' kapalı olmalıdır." README ve mod seçim metni güncellensin. DIN için bkz. B6.
- **Gerekçe:** Interaural zayıflama kulaklıkta ≥ 40–60 dB; stereo dosya, Expo Go'da native modül gerektirmez.

---

## B) Yüksek etkili (10)

### B1. İşitme taraması: yakalama (catch) denemeleri ve güvenilirlik bayrağı
- **Önem:** Yüksek · **Yer:** `psychoacoustics.ts` `respondThreshold`, `hearing.tsx` `present()`
- **Değişiklik:** Her kulakta sunumların %10–15'i sessiz olsun (6 frekans × ~6 sunum ≈ 36; +4 yakalama). ≥2 yanlış pozitif → `reliability: 'low'`, yönerge yeniden gösterilsin, kulak tekrarlansın. Rapora "yanlış pozitif: 1/4" eklensin.
- **Gerekçe:** Kalibrasyonsuz tarama için tek erişilebilir kalite kontrol; ISO 8253-1 manuel odyometri de yanıt tutarlılığını şart koşar.

### B2. Frekans seti: 3 kHz ekleyin; ≥ 3 kHz'de warble kullanın
- **Önem:** Yüksek · **Yer:** `SCREENING_FREQS`, `noiseNotch()`, `hearing.tsx` (`playToneOnce` warble yok)
- **Değişiklik:** `[500,1000,2000,3000,4000,6000,8000]`; çentik kuralı Coles 2000: 3/4/6 kHz'den en az biri, 1–2 kHz ortalamasından **≥ 15 dB** ve 8 kHz'den **≥ 10 dB** kötü (mevcut 20/15 çok katı, tarama hassasiyetini düşürür). Asimetri kuralına "3 kHz'de ≥ 15 dB" ("Rule 3000") ayrı gerekçe satırı. Kulak içi kulaklıkta duran dalga ve oturtma farkları için ≥ 3 kHz'de ±5 % warble.
- **Gerekçe:** `diagnosis.md` §1.6 asimetri eşikleri; gürültü çentiği 3–6 kHz'de en belirgindir.

### B3. Perde eşleme: başlangıç çifti sabit ve dar, uyaranlar gürlük dengelenmemiş
- **Önem:** Yüksek · **Yer:** `psychoacoustics.ts` `DEFAULT_START_PAIR`, `pitch.tsx` `AFC_LEVEL_DB = −12`, `playNarrowbandOnce`
- **Sorun:** 1 kHz–8 kHz başlangıcıyla ulaşılabilir alt sınır ≈ 350 Hz; düşük perdeli (Ménière tipi) uğultu eşlenemez. Üç turun hepsi aynı çiftten başladığı için "güven" yapay olarak yüksek. Tüm NBN'ler aynı dBFS'te; tüketici kulaklıklarında 8–12 kHz 10–20 dB düşer; sonuç sistematik olarak pese kayar (Wunderlich 2015'in bulduğu yanlılık).
- **Değişiklik:** Turlar için üç farklı başlangıç çifti (`[500,4000]`, `[1000,8000]`, `[2000,12000]`), rastgele sıra; A/B sunum sırası da rastgele. Her çiftten önce 1 saniyelik "gürlük dengeleme" adımı ("B'yi A kadar yüksek olana dek ayarlayın") ya da en azından işitme taramasındaki eşiklerden enterpolasyonla **eşit dB SL** (örn. 30 dB SL) sunum. `soundType === 'hiss'` ise 1 oktav NBN, `tonal` ise 1/3 oktav; `multiple` için "en baskın ses" yönergesi.
- **Gerekçe:** Vielsmeier 2020 (başlangıç çeşitliliği güvenilirliği artırır), Henry 2013 (gürlük dengeleme zorunlu adım).

### B4. Perde > 8 kHz ya da güven "düşük" iken çentikli/dar bant preset'leri kilitlensin
- **Önem:** Yüksek · **Yer:** `src/audio/presets.ts` `resolveSpec`, `resolveNamedPreset('notched'|'ri')`, `player.tsx`
- **Değişiklik:** `pitchHz > 8000 || pitchConfidence === 'low'` → çentikli preset devre dışı, metin: "Çentikli ses yalnızca 8 kHz altı ve güvenilir perde eşlemesi için uygundur; önce eşlemeyi tekrarlayın." Çentikli pink noise'a `evidence: 'rct'` + `okamoto2010` atfı yanıltıcı (RKÇ'ler **müzik** ile yapıldı); `evidence: 'expert'`, açıklama: "Çentikli gürültü, çentikli müzik çalışmalarından uyarlanmıştır; gürültü ile doğrudan RKÇ yoktur."
- **Gerekçe:** `treatment.md` §3.2(b): tonal, ≤ 8 kHz, 1 oktav; Stein 2016 ½ oktav negatif.

### B5. RI protokolü: erken örnekleme, aktif onay, hiperakuzi kapısı, rebound bilgisi
- **Önem:** Yüksek (geçerlilik + güvenlik) · **Yer:** `ri.tsx`, `psychoacoustics.ts` `RI_RATING_INTERVAL_SEC`
- **Değişiklik:** (1) İlk değerlendirme **t = 2 s**'de, sonra 5 s'de bir (kısa tam RI 5 s örneklemede kaçar). (2) Kaydırıcı son değeri taşıyor; her örneklemede "Şimdi değerlendirin" haptik + 3 s içinde dokunma yoksa `missing` işaretle, duration hesabında sansürle. (3) HQ ≥ 28 ya da `ldlLow` ise maskeleyici **MML + 5 dB** ve toplam 1 deneme; ağrı-tipi hiperakuzi beyanında test atlanır. (4) Kopya: "Nadiren ses sonrası çınlama birkaç dakika geçici olarak artabilir; bu zararlı değildir." (5) Ekrandaki "RI +/−" rozeti `positive` ile, kategori metni ayrı gösterilsin.
- **Gerekçe:** Vernon & Meikle (RI çoğu kişide < 30 s), Fournier 2018 (rebound %5–10), `treatment.md` §3.3 "hiperakuzide yüksek düzeyli maskelemeden kaçın".

### B6. Rakam-gürültü: TTS yerine gömülü kayıt + DSP karıştırma; antifazik mod; geç/kal etiketi kaldırılsın
- **Önem:** Yüksek · **Yer:** `app/assess/exam/din.tsx`, `src/audio/examTests.ts` (`DIN_BASE_NOISE_VOLUME`, `DIN_PASS_SRT_DB`), `exam.ts` kopyaları
- **Sorun:** TTS çıkış düzeyi cihaz/ses motoruna göre değişir; "SNR −8 dB" nominaldir, gerçek değildir. Maskeleyici 300–4000 Hz bant geçiren beyaz gürültü; standart DIN, rakamların uzun dönem spektrumuna (LTASS) şekillendirilmiş gürültü kullanır. Rakamlar düzey-homojenize değil (Smits 2004 her rakamı ±dB düzeltir). "Beklenen aralıkta" etiketi Türkçe norm olmadan savunulamaz.
- **Değişiklik:** 10 Türkçe rakam × 1 konuşmacı, 22,05 kHz mono (~250 KB) `assets/din/` içine; `dsp.ts`'te rakam+gürültü tek WAV'a karıştırılsın (SNR tam, RMS temelli); gürültü, rakam kayıtlarının LTASS'ından türetilsin (çevrimdışı üretilip gömülebilir). **Antifazik mod:** stereo WAV'da rakamlar sağ kanalda faz tersli (De Sousa 2020; tek taraflı/iletim tipi kayba duyarlı). Uyarlamalı iz: 24 üçlü, 2 dB adım, SRT = 5.–24. denemelerin ortalaması. Norm toplanana kadar etiket: "Norm çalışması yapılmamıştır; sonuç yalnızca kişisel izlem içindir". Geçici sevk kuralı: diyotik SRT ≥ −6 dB → "odyoloji önerilir"; "geçti" ifadesi hiç kullanılmasın.
- **Gerekçe:** `diagnosis.md` §4.1 (DIN dil/dikkat duyarlı, transduserden bağımsız), §7.5 (Türkçe DIN yok); Potgieter 2016 (−9,55 dB İngilizce kesme).

### B7. LDL: üç kademeli yanıt, dB SL'ye dönüşüm, sabit tavan
- **Önem:** Yüksek (güvenlik + yorum) · **Yer:** `examTests.ts` (`LDL_START_DB`, `LDL_LOW_MARGIN_DB`), `app/assess/exam/ldl.tsx`
- **Sorun:** "Rahat / Rahatsız edici" ikili seçenek, "yüksek ama tolere edilir" düzeyini rahatsızlık sayar (Cox Contour 7 kademe; Sherlock & Formby 2005 "ilk kez rahatsız edici, ağrılı değil"). `ldlLow` tavana göre tanımlı; tavan telefon ses düzeyine bağlı → telefon %100'de −21 dBFS ≈ 85–90 dB SPL olabilir (yanlış pozitif), %40'ta ≈ 55 dB SPL (yanlış negatif).
- **Değişiklik:** Yanıtlar: Rahat / Yüksek ama tolere edilir / Rahatsız edici (LDL = ilk "rahatsız edici"). LDL'yi aynı frekanstaki kullanıcı eşiğine göre **dB SL dinamik aralık** olarak raporlayın; 1 kHz'de dinamik aralık < 55 dB SL → "azalmış tolerans örüntüsü". LDL uyaranı için ayardan bağımsız sabit tavan **−10 dBFS** ve en fazla 12 kademe; HQ ≥ 28 ya da "ses ağrı yapıyor" beyanında test varsayılan olarak atlanır, açık onayla yapılır. Fenotip için `ldlLow` tek başına değil, HQ ≥ 16 **veya** (ldlLow + öz bildirim) kullanılsın.
- **Gerekçe:** Formby 2015 (LDL klinik tanımı), `diagnosis.md` §2.7 (HQ kesmeleri; LDL ≤ 90 dB HL).

### B8. Çıkış tavanı ve "kalibrasyon durumu" tutarlılığı
- **Önem:** Yüksek · **Yer:** `src/store/settings.ts` (`maxVolume: 0.85`), `psycho.ts`/`exam.ts` ("%50–70" vs "%60–70"), `headphone-check.tsx`
- **Değişiklik:** Varsayılan `maxVolume` **0,5** (−6 dB). Test bataryası için ayardan bağımsız iç tavan: ton/NBN burst ≤ −6 dBFS, sürekli gürültü ≤ −6 dBFS (zaten tepe 0,5; belgeleyin). Tek bir ses düzeyi yönergesi: **"Telefonun ses düzeyini en üste getirin"** (en üst, yeniden üretilebilir tek durumdur; yazılım zayıflatması düzeyi belirler — hearTest yaklaşımı) ve her oturum başında 1 kHz eşik tekrarıyla kayma kontrolü (C'deki 2. özellik). Oturum içinde "ses düzeyi değişti" uyarısı için `playing:false` olaylarını izleyin (kulaklık çıkarıldı).
- **Gerekçe:** Swanepoel 2014 (kalibrasyonsuz ±8–14 dB HL sapma); tavan, hiperakuzi kullanıcıları için güvenlik ağıdır.

### B9. Hiperakuzi kademeli maruziyet düzeyi çok yükseğe çıkıyor
- **Önem:** Yüksek · **Yer:** `presets.ts` `hyperacusisWeekVolume()` (0,25 → +2,5 dB/hafta → tavan 0,7 = −3 dBFS), `player.tsx` `hyperTarget`, `sound.ts` `player.hyper.*`
- **Değişiklik:** Başlangıç = karışma noktası − 10 dB (yoksa 0,15); artış **+2 dB/hafta**; tavan **0,4 (−8 dBFS)** ve ayrıca `LDL − 15 dB` (B7'den); süre artışı (dk/gün) düzey artışına alternatif ilerleme ekseni olarak programa yazılsın ("2 × 30 dk → 2 × 60 dk"). Kopya: "Hedef, konuşma düzeyine yakın ama hiçbir zaman rahatsız edici olmayan bir fon; düzeyi artıramıyorsanız süreyi artırın." 40 Hz AM ve binaural preset'ler hiperakuzi rotasında listelenmesin (AM derinliği 0,8 kaba/rahatsız; 0,5'e düşürün).
- **Gerekçe:** `treatment.md` §3.3 (20–30 dB SL başlangıç, 2–3 dB/hafta, konuşma düzeyi hedefi), Formby 2015, Jüris 2014.

### B10. Doktor özeti: yöntem, birim ve uyarılar olmadan sayı vermeyin
- **Önem:** Yüksek · **Yer:** `app/assess/results.tsx` `buildSummary`, `src/i18n/areas/assess.ts` `results.summary.*`
- **Değişiklik (zorunlu satırlar):**
  - Başlık: "Tüm akustik ölçümler kalibre edilmemiş akıllı telefon + kullanıcı kulaklığı ile, dB re cihaz tam ölçeği (dBFS) ya da dB SL olarak verilmiştir; dB HL değildir. Belirsizlik ≥ ±10 dB."
  - İşitme: kulak başına frekans tablosu, mod (ayrı/birlikte), ortam kontrolü (geçti/atlandı), yakalama hata oranı, kulaklık doğrulandı mı, asimetri/çentik kuralının hangi frekansta tetiklendiği.
  - Perde: "2AFC, 1/3 oktav NBN, 3 tur, medyan 4 100 Hz (aralık 3 700–4 800), güven: orta; oktav doğrulaması: aynı; ince ayar: kullanılmadı".
  - Gürlük: "X dB SL (eşik −58 dBFS, eşleme −46 dBFS, warble ton)".
  - MML: uyaran, gürültü eşiği, MML dB SL ya da "maskelenmedi (tavan)".
  - RI: "NBN @ 4 100 Hz, MML+10 dB, 60 s; başlangıç 6/10, en düşük 2/10 (t=10 s), eski düzeye dönüş 45 s; RI pozitif; 1/3 deneme".
  - DIN: yöntem (kayıt/TTS, gürültü tipi, diyotik/antifazik, 24 üçlü), SRT, "normlanmamış".
  - LDL: frekans başına dB SL dinamik aralık; tavanda sonlananlar.
  - Tarih, uygulama sürümü, protokol sürümü.
- **Gerekçe:** Odyolog bu bilgiler olmadan değeri klinik odyogramla karşılaştıramaz; AAO-HNSF 2026 KAS 5 tam odyolojik değerlendirme ister, uygulama ona "ön veri" sağlar.

---

## C) İyi olur (5)

### C1. MML'de inen doğrulama adımı
- **Yer:** `mml.tsx`, `psychoacoustics.ts` `mmlMasked()` · Sürekli yükselen rampada tepki gecikmesi MML'i 2–4 dB yükseltir. "Artık duymuyorum" sonrası düzeyi 4 dB düşürüp 3 s sonra "Çınlama geri geldi mi?" sorun; evetse MML = düzey + 2 dB, hayırsa 2 dB daha inin (en fazla 3 adım). Kayıt: ortalama.

### C2. Kanıt rozeti düzeyleri
- **Yer:** `src/content/citations.ts`, `EvidenceChip` · Chen 2021 ve Tavanai 2024 "RKÇ destekli" görünüyor; `level: 'meta'` ("Meta-analiz") ekleyin. Sendesen 2024 RKÇ değil, kohort; `level: 'cohort'` ya da `'expert'`.

### C3. Karışma noktasını dB adımıyla ve dinleme biçimiyle saklayın
- **Yer:** `app/sound/mixing-point.tsx` (`STEP_DOWN = 0.05` doğrusal), `mixingPoint.ts` · Bir kademe aşağı = **−3 dB** (×0,71). Kayıtla birlikte `route: 'headphones'|'speaker'`; uyku preset'i hoparlörle alınmış değeri, gündüz preset'i kulaklıkla alınanı kullansın. Uyku kopyasına ekleyin: "Gece boyunca kulaklık yerine yastık/oda hoparlörü tercih edin; zamanlayıcı ≥ 90 dk."

### C4. İşitme cihazı / koklear implant içeriğinde ifade düzeltmeleri
- **Yer:** `assess.ts` `cause.noiseCochlear.treat` ("6 haftada THI −12 civarı"), `cause.presbycusis.treat` ("THI ortalama −14"), `articles.ts` işitme cihazı makalesi · "Kontrolsüz kohortlarda" ibaresi ekleyin; cihaz denemesinden **önce** asimetri varsa KBB/MR adımını yazın; CI için "endikasyon ve geri ödeme ülkeye göre değişir; tek taraflı sağırlıkta değerlendirme uzman merkezde" ekleyin; "tinnitus programı" olan cihazın şart olmadığı (TRTT) doğru ve kalsın.

### C5. Oturum yorgunluğu
- **Yer:** `app/assess/(hub)`, `hearing.tsx` · Tam batarya ≈ 16 dk (tarama 5–6, perde 3, gürlük 2, MML 2, RI 4). Kulak değişiminde ve her modül sonunda otomatik ara kayıt; 10 dk sonra "Dinlenip devam edin" önerisi; RI ve LDL aynı oturumda yapılmasın (uyarılma/adaptasyon).

---

## Üç yenilikçi ama savunulabilir özellik

**1. Kulaklık profili tablosu ("yarı kalibrasyon").** Kullanıcı kulaklık modelini seçer (Apple EarPods, AirPods/Pro, Samsung Galaxy Buds, "genel kulak içi", "genel kulak üstü", "bilinmiyor"). Tablo, telefon ses düzeyi **en üstte** iken 1 kHz'de dBFS→dB SPL dönüşümü ve 0,5–8 kHz frekans ofsetlerini içerir (literatürde ölçülmüş modeller: EarPods — Am J Audiol 2018; Sennheiser HD202 — Swanepoel 2014). Yalnızca listelenen modellerde "tahmini dB HL (±10)" gösterilir; diğerlerinde dBFS kalır. Tablo `src/audio/earphones.ts` olarak JSON, `HearingScreenResult.calibrated` → `'profile'|'none'`. Rapora kulaklık modeli ve profil sürümü eklenir.

**2. Biyolojik kalibrasyon (kullanıcı kendi referansı).** Her oturum başında 1 kHz (ve perde frekansında) 30 s'lik eşik; (a) saklanan değerden > 10 dB sapma → "ses düzeyi/kulaklık değişmiş olabilir, testleri aynı koşulda tekrarlayın" uyarısı ve kayıtların `comparable:false` işaretlenmesi; (b) tüm psikoakustik düzeyler zaten dB SL — işitme taramasını da **"en iyi frekansa göre göreli konfigürasyon"** olarak raporlayın (asimetri ve çentik şekil temelli olduğundan kalibrasyondan bağımsızdır); (c) LDL'yi dB SL dinamik aralık olarak verin. Test–tekrar test güvenilirliğini ölçülebilir kılar ve program ilerleme grafiklerini aynı referansa bağlar.

**3. Tinnitus spektrumu benzerlik derecelendirmesi.** Noreña 2002 / Roberts 2008 / Hébert & Fournier 2017 yöntemi: 0,5–12 kHz arası 11 adet 1/3 oktav NBN, eşit dB SL'de rastgele sırayla; kullanıcı her birine 0–10 "çınlamama ne kadar benziyor" puanı verir. Çıktı: benzerlik spektrumu (tepe = perde; genişlik = tonal/hışırtı ayrımı; oktav karışıklığına 2AFC'den daha dayanıklı). Kullanımı: (i) çentik/dar bant genişliğini spektrumun yarı-yükseklik genişliğinden türetme, (ii) işitme taramasındaki kayıp kenarıyla örtüşmeyi raporlama (Roberts: RI derinliği kayıp bölgesine odaklı maskeleyicide en büyük), (iii) 2AFC ile çelişirse "güven: düşük". Süre ≈ 2 dk; `psychoacoustics.ts`'e saf fonksiyon olarak eklenebilir.

---

### Kaynaklar (kısa)
Chen 2021 JMIR mHealth; Swanepoel 2014 Int J Audiol; Wunderlich 2015 JAAA; Vielsmeier 2020 Audiol Neurotol; Henry 2013 JAAA; Hoare 2014 PLoS One; Hébert & Fournier 2017 Front Neurol; Fournier & Hébert 2018 Hear Res; Hu 2021 Trends Hear; Sendesen & Türkyılmaz 2024 Brain Behav; Roberts 2008 JARO; Noreña 2002 Audiol Neurootol; Smits 2004/2013 Int J Audiol; Potgieter 2016 Int J Audiol; De Sousa 2020 Ear Hear; Sherlock & Formby 2005 JAAA; Cox 1997 Ear Hear (Contour); Formby 2015 Semin Hear; Jüris 2014 Behav Res Ther; Okamoto 2010 PNAS; Stein 2016 BMC Neurol; Scherer 2019 JAMA Otolaryngol; Coles 2000 Clin Otolaryngol; NICE NG155; AAO-HNSF 2026 güncellemesi; VA/DoD 2024.
