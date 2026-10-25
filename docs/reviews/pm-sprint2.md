# Dingin — Proje yönetimi kararı: Sprint 2 (Ekim 2026)

Karar sahibi: Proje yöneticisi. Girdi: Sprint 1 uygulaması (commit `1649666`), `docs/reviews/pm-sprint1.md`, yeniden simülasyon (`generateProgram` × 5 kullanıcı tipi, 15/30 dk), ekran okumaları (`app/(tabs)/index.tsx`, `app/session.tsx`, `app/assess/questionnaire/[id].tsx`, `src/clinical/consequences.ts`, `app/week-review.tsx`, `src/components/home/{taskBudget,QuickCheckIn,checkinStats}.ts(x)`, `src/notifications.ts`, `src/clinical/diagnosis.ts`).

Sahibin iki önceliği değişmedi: **(1) ön tanı — organ düzeyinde neden, ICD-10, kesinlik, en iyi tedavi yolu; (2) sıkılmadan tedavi — hızlı değer, az sürtünme.** Sprint 2 = Sprint 1'in kusurlarını kapat + tanıyı kararlı ve eyleme dönük yap + ses "vay" anını otomatikleştir.

---

## 0. Sprint 1 incelemesi — kusurlar ve gerilemeler

Genel yargı: Sprint 1 hedefini tutturdu (en fazla 3 adım, 1. gün 14 dk, ölçüm haftası dağıtıldı, tek dokunuş check-in, sonuç satırları; 100/100 test, `tsc` temiz). Simülasyon ve kod okumasında bulunan kusurlar (önem sırasıyla):

| # | Kusur | Yer | Kanıt |
|---|---|---|---|
| D1 | **Pazar "Haftalık kart" çoğu Pazar "Daha fazla"ya düşüyor.** Üst sınır (3 adım) zorunlu görevlerden önce uygulanıyor; `review.weekly` listede son sırada. | `src/components/home/taskBudget.ts:72-77` (`splitByBudget`: `if (steps >= maxActive) { more.push(x); continue; }` `isEssential` kontrolünden önce) · `src/clinical/program.ts:218` (`review.weekly` sona ekleniyor) | Simülasyon: w2d7, w3d7, w4d7, w5d7… `more review.weekly` (uykusuzluk kolu ve 30 dk kullanıcıda her hafta) |
| D2 | **Haftanın modülü bütçeye sığmayınca gizleniyor; "bir çekirdek" kuralı bozuluyor.** 15 dk kullanıcıda 15 dk'lık modül (`cbt.relax1`, `cbt.restructuring`) `more`'a gidiyor, yerine 5 dk uygulama gösteriliyor. | `taskBudget.ts:75` (`fits = used + x.minutes <= budget || steps === 0`; check-in 1 dk olduğu için `steps` hiç 0 değil) | w1d5: shown `exercise.breathing` / more `cbt.relax1`; w11d1: shown `cbt.relax6` / more `cbt.restructuring`; w5d1 aynı |
| D3 | **1. hafta 4. gün 21 dk** (PMR 12 + muayene 8): ölçüm "zorunlu" sayıldığı için bütçeyi aşıyor. | `program.ts:188-190` (`assess.exam` d4) + `program.ts:178-181` (uygulama aynı gün) | Tüm tiplerde w1d4 = 21 dk |
| D4 | **Akut kolda 1. hafta 2/4/5. günler boş** (yalnız check-in). `!acute \|\| w >= 2` kuralı Sprint 1 öncesinden kaldı. | `program.ts:178` | acute w1d2/d4/d5: `diary.daily(1)` / 1 dk |
| D5 | **`sleep.diary` numaralı adım olarak uygulamayı/kartı dışarı itiyor**, günden güne tutarsız görünüyor. | `program.ts:200` (`sleep.diary` görev), `taskBudget.ts` (diary zorunlu + sayılıyor) | w2d2: `more sleep.diary`; w4d5: `more sleep.diary`; w2d7: kart gizli |
| D6 | **İlk check-in gürlüğü uyduruyor:** `loudness = existing ?? last ?? v` → ilk kayıtta gürlük = rahatsızlık. İlerleme grafiğinde iki çizgi aynı, doktor özetine sahte sayı. | `src/components/home/QuickCheckIn.tsx:95-99` (`save`), `src/clinical/types.ts` (`DiaryEntry.loudness: number` zorunlu) | Kod okuması |
| D7 | **Hiperakuzi kolunda 1. hafta hiç ses yok, 1. günde "ses" anı yok** (`soundEnrichmentOn=false`, `hyper.exposure` 2. haftadan). Ağır + RI negatif kullanıcıda da aynı. | `program.ts:156`, `program.ts:194-196` | severe/hyper w1: `bg` boş; w1d1 = check-in + welcome (9 dk) |
| D8 | **`session.why.review` çeviri anahtarı yok** → Haftalık kart "sıradaki adım" olduğunda ham anahtar görünür. | `src/i18n/areas/core.ts:44-50` (TR) ve EN bloğu; `app/session.tsx` `t(\`session.why.${current.type}\`)` | grep: anahtar tanımsız |
| D9 | **Ölçüm haftası hatırlatması bağlı değil** (fonksiyon var, çağıran yok). | `src/notifications.ts:220` `scheduleMeasurementReminder` | Mühendislik notu |
| D10 | `hyper.hierarchy` üç kez (w3, w6, w12), `cbt.exposure` yerine konulurken 12. haftada da aynı modül. | `program.ts:168`, `LATE_WEEKS[12]` | severe/hyper w12d1 |
| D11 | 1. haftada PMR (12 dk) üç kez (d2/d4/d6): 15 dk kullanıcı için haftanın en ağır dört günü; kısa PMR yok. | `DAILY_PRACTICE_POOL[1]` | w1d2/d4/d6 13–21 dk |
| D12 | Haftalık karşılaştırma takvim 7 günü kullanıyor, haftalık hedef program haftasını; Pazar kartında iki farklı "hafta". | `checkinStats.ts:56` vs `taskBudget.ts:weekActiveDays` | Kod okuması (kabul edilebilir, P2) |
| D13 | `ProgramPrefs` kalıcı değil (yalnız `Program` saklanıyor) → doz düşürme / yeniden üretim için tercih bilgisi yok. | `src/store/clinical.ts` (`setProgram`), `app/program/setup.tsx` | Kod okuması |

Doğrulananlar (sorun yok): PHQ-2 + madde 9 kapısı (`[id].tsx:25`, `alwaysAsk:[8]`); THS C2 yalnız C1 ≥1'de; SCI-02 ≤2 → uykusuzluk ve THS C1 ≥2 → hiperakuzi (`engine.ts`); kısa kırmızı bayrak "Evet" → tam 12 madde ve `computeTriage` (`triage.tsx:84-87`); `consequence.hq.strong` anahtarı var; `cancelReminders` artık haftalık incelemeye dokunmuyor; `taskIcon` `review` tipini biliyor; eski programlar (`completed` anahtarları) uyumlu.

---

## 1. Sprint 2 hedefleri
1. Sprint 1 kusurlarını kapat (D1–D9 bu sprintte; D10–D13 düşük maliyetli olduğu için aynı emirlerin içinde).
2. **Tanı kartı kararlı ve eyleme dönük:** tek cümle ön tanı (neden adı, organ düzeyi, ICD-10, kesinlik), "en iyi yol" satırı (tedavi edilebilirlik + kime + program kolu), "kesinliği artırmak için" eksik ölçütleri uygulama içi görevlere bağla, dışlanması gerekenleri açık liste.
3. **Ses "vay" anı otomatik:** perde eşlemesi varsa oynatıcı kendini ayarlar; hiperakuzi kolunda 1. günden "rahat düzey" sesi.
4. **Doz esnekliği:** düşük uyumda tek dokunuşla "dozu düşür" (program yeniden üretimi, tamamlananlar korunur).
5. 2 dakikalık modül özetleri (yarım kalan modüle geri dönüş; "bugün yalnız özeti oku" seçeneği).
6. Tanı kalitesi için iki kısa tarama: misofoni (2 madde) ve OSA (2 madde) öyküde.

Sprint 3'e ertelendi: THI-S ara eğilim (2/6/10. hafta), bakım modu (12. haftadan sonra aylık THI + 3 maddelik güvenlik, +13 THI → tazeleme), sesli rehberli uygulamalar, e-posta özeti, klinisyen eşlikli katman.

---

## 2. Kararlar (kısa)
- **Çekirdek görev kuralı:** üreteç haftanın modülünü `core: true` ile işaretler; bölme fonksiyonu ilk çekirdeği bütçeden bağımsız gösterir; zorunlu görevler (check-in, ölçüm, haftalık kart) üst sınırı tüketmez; 3 adım sınırı yalnız isteğe bağlı görevlere uygulanır. Ölçüm günü = çekirdek ölçek; uygulama yok (zaten öyle).
- **Uyku günlüğü ayrı görev olmaktan çıkar:** BDT-U kolunda tek dokunuş check-in'e "+ Uyku kalitesi" satırı eklenir; `sleep.diary` üretilmez. Eski programlarda kalan `sleep.diary` görevleri zararsızdır (ekranı var).
- **Gürlük isteğe bağlı:** `DiaryEntry.loudness?: number`; grafik ve doktor özeti tanımsızı atlar; tek dokunuş yalnız rahatsızlığı yazar.
- **Hiperakuzi 1. gün:** "Rahat sesinizi bulun" — `hyper.exposure` 1. günden, 10 dk, oynatıcı hiperakuzi ön ayarı düşük düzeyden başlar ve haftada +5 dk (en çok 60) rampası korunur (odyolog B9: düzey tavanı). Ağır + RI negatif (BDT-önce) kolda 1. gün isteğe bağlı "Rahatlatıcı ses" satırı ("Daha fazla").
- **Perde eşlemesi → ses:** `psycho.pitchHz` varsa ve ≤8 kHz ve güven ≥ orta ise oynatıcı `enrichment` ön ayarında dar bant merkezini otomatik buna ayarlar ve "Çınlamanıza göre ayarlandı (≈{hz} Hz)" çipi gösterir; çentikli yalnız `program.notchHz` varsa (odyolog B4 kilidi korunur).
- **Tanı kartı katman 1'e çıkar** (UX A2 ile uyumlu): gösterge + tek cümle ön tanı + "en iyi yol" + "kesinliği artırmak için" düğmeleri. Neden listesi ve ayrıntılı ölçütler akordeonda kalır. Dürüstlük: "ön tanı · hekim doğrulaması gerekir" satırı kartın altında, her zaman.
- **Doz düşürme:** `ProgramPrefs` saklanır; "Dozu düşür" = `minutesPerDay: 15`, haftada 1 modül (`moduleDays` yalnız 1. gün), uygulama havuzu kısa sürümler; `completed` ve `startDate` korunur; `program.doseReducedAt` kaydedilir; `adapt.lowAdherence` kartında tek düğme.

---

## 3. SPRINT 2 — Emirler (12; üç iş akışı, dosya sahipliği çakışmaz)

Dosya sahipliği:
- **A (klinik):** `src/clinical/*`, `app/assess/*`, `app/program/*`, `src/store/clinical.ts`, `src/components/assess/*`, `src/i18n/areas/assess.ts`, `tests/{program,engine,consequences,diagnosis,causes}.test.ts`
- **B (günlük deneyim):** `app/(tabs)/*`, `app/session.tsx`, `app/week-review.tsx`, `app/mind/[module].tsx`, `src/components/home/*`, `src/content/*`, `src/i18n/areas/{core,mind}.ts`, `src/store/growth.ts`, `tests/{checkin,growth}.test.ts`
- **C (ses + bildirim + ayarlar):** `src/notifications.ts`, `src/store/settings.ts`, `app/settings.tsx`, `app/sound/*`, `src/audio/*`, `src/i18n/areas/{notify,sound}.ts`, `tests/{dsp,psychoacoustics}.test.ts`
- Paylaşılan tip değişiklikleri (`src/clinical/types.ts`) yalnız A yapar ve **ilk** iş olarak yapar; B ve C bu alanları isteğe bağlı (`?`) olarak kullanır, tip değişmeden de derlenir. Her akış sonunda `npx tsc --noEmit` + `npm test` (lint burada koşmuyor; `expo lint` yerel ortamda).

### İş akışı A — klinik

**A1 · P0 · Üreteç düzeltmeleri (D2, D3, D4, D5, D7, D10, D11)**
- Gerekçe: "bir çekirdek + isteğe bağlı" kuralı ve 1. hafta yükü düzelmeden geri kalan her şey boşa gider.
- Spek (`src/clinical/program.ts`, `src/clinical/types.ts`):
  - `ProgramTask.core?: boolean` (types.ts). Üreteçte `modules.forEach` ile eklenen modül görevleri, 2. hafta tam ölçekler ve 4/8/12 ölçümleri `core: true`; `sound.mixingPoint` 1. günde `core: true`.
  - 1. hafta: `assess.exam` d4 → d5; ölçüm/muayene/işitme taraması (`assess.*`, `sound.ri`) olan günlerde (`day` için `tasks.some(x => x.type==='assessment' && x.minutes >= 6)`) günlük uygulama eklenmez.
  - Akut kol: uygulama 1. hafta 2. günden itibaren (`if (!firstDay && !measurementDay)`; `acute` kısıtı kalkar), 1. hafta havuzu `['exercise.breathing','mind.breathingSpace']` (akut kolda PMR yok; 2. haftadan normal havuz).
  - `DAILY_PRACTICE_POOL[1] = ['exercise.pmr','exercise.breathing','exercise.breathing']`, `[2] = ['exercise.pmr','exercise.breathing','mind.breathingSpace']` (PMR haftada 2).
  - `sleep.diary` görevi üretilmez (BDT-U kolunda check-in'e "+ Uyku" satırı — B2). `sleep.sound` arka planda kalır.
  - Hiperakuzi kolu: `hyper.exposure` 1. hafta 1. günden (`w >= 1`, dakika `Math.min(60, 10 + (w - 1) * 5)`), 1. gün `core: true`, başlık anahtarı 1. günde `unit.hyper.exposure.first` ("Rahat sesinizi bulun"); `edu.hyperacusis` w2d7 → w1d6 (`edu.whatIsTinnitus` w1d6 → w2d6 kaydırılır, `edu` dizisi yalnız hiperakuzi kolunda değişir). Ağır + `riPositive === false` kolda 1. gün `sound.enrichment` `more`'da kalır (arka plan, `core` değil) — değişiklik yok.
  - `LATE_WEEKS[12]` hiperakuzi kolunda `['hyper.earplugs','cbt.relapse']` (hiyerarşi 3. kez değil).
- Kabul: Simülasyon (tests/program.test.ts'e eklenir): 15 dk, her tipte (orta/uykusuzluk, ağır/hiperakuzi, hafif, akut) hiçbir gün 3'ten fazla numaralı adım; w1d4 ≤ 15 dk; akut w1 her gün ≥ 1 aktif görev; her gün en fazla bir `core`; `sleep.diary` üretilmez; hiperakuzi w1d1'de `hyper.exposure` var; `cbt.restructuring` bulunan günde `core: true`.

**A2 · P0 · Tanı kartı: kararlı, organ düzeyinde, eyleme dönük**
- Gerekçe: Sahibin "tanı koysun" emri; mevcut kart ölçütleri listeliyor ama karar cümlesi ve "ne yapmalı" eksik.
- Spek (`src/clinical/diagnosis.ts`, `src/components/assess/DiagnosisCard.tsx`, `app/assess/results.tsx`, `src/i18n/areas/assess.ts`):
  - `diagnosis.ts`: `export function diagnosisActions(d: Diagnosis, a: Assessment): { key: string; route: string; minutes: number }[]` — `primary.missing` özellik anahtarlarını uygulama içi ölçümlere eşler: `pitchMatched`/`tonal` → `/assess/pitch` (6 dk); `hearingLoss`/`asymmetry`/`noiseNotch` → `/assess/hearing` (6 dk); `somaticModulation` → `/assess/exam` (8 dk); `causeAnswers` eksikse → `/assess/causes` (2 dk); `ldlLow` → `/assess/exam`. En fazla 3, dakikaya göre artan.
  - `diagnosis.ts`: `export function bestPath(d: Diagnosis, profile: Profile): { curability: Curability; whoKey: string; whenKey: string; armKey: string }` — `CAUSES[primary.id].curability/who` + `REFERRAL[...]` + program kolu. Dışlanması gereken (`mustExclude`) ve kesinlik `high` değilse `whenKey` sevk aciliyetini korur.
  - `DiagnosisCard.tsx` (katman 1'e taşınır; `results.tsx` içinde Gauge'ın hemen altı): (1) tek cümle: "Olası neden: **{cause.name}** · {cause.site} · {icd} · {kesinlik}"; (2) "En iyi yol" satırı: `dx.path.{curability}` ("Tedavi edilebilir neden: önce {who}; program eşlik eder" / "Yönetilebilir: {arm} programı birincil yol, {who} bir kez") ; (3) "Kesinliği artırmak için" — `diagnosisActions` düğmeleri ("Perde eşleme · 6 dk"); (4) "Önce dışlanmalı" çipleri (`differentials` mustExclude) — mevcut; (5) alt satır `dx.disclaimer` = "Ön tanı; ölçüt tabanlı karar desteğidir, hekim muayenesinin yerine geçmez." Ayrıntılı ölçütler (met/missing listesi) `Collapsible` içine iner.
  - Kesinlik `low` ve eylem listesi boşsa kart "Kesinlik düşük: KBB muayenesi ve odyometri gerekli" der; hiçbir zaman boş kalmaz.
- Kabul: Tonal + perde eşlemesi yapılmamış kullanıcıda kart "Perde eşleme" düğmesi gösterir, eşleme sonrası düğme kaybolur ve kesinlik yeniden hesaplanır; SSNHL yüksek kesinlikte "24 saat içinde KBB" satırı ve program kapısı değişmez; `tests/diagnosis.test.ts` `diagnosisActions`/`bestPath` için 6 vaka.

**A3 · P1 · Doz düşürme (program yeniden üretimi) + tercihlerin saklanması (D13)**
- Gerekçe: `adapt.lowAdherence` öneriyor ama uygulanamıyor; sıkılan kullanıcıya tek dokunuşla hafifletme.
- Spek (`src/store/clinical.ts`, `src/clinical/program.ts`, `app/program/index.tsx`, `app/program/setup.tsx`, `app/assess/results.tsx`, `src/clinical/types.ts`):
  - `ClinicalState.programPrefs: ProgramPrefs | null` + `setProgramPrefs`; `results.tsx`/`setup.tsx` program başlatırken yazar.
  - `Program.dose?: 'full' | 'light'`, `Program.doseChangedAt?: string`.
  - `program.ts`: `export function regenerateProgram(prev: Program, profile: Profile, prefs: ProgramPrefs, opts: { dose: 'light' | 'full' })` — aynı `startDate` ve `id`, `completed` korunur, `light`: `minutesPerDay: 15`, haftada yalnız 1 modül (`modules.slice(0,1)`), kalan modüller sonraki haftalara kaymaz (iCBT "hafif" varyantı), günlük uygulama havuzu yalnız ≤5 dk birimler, ek kol modülleri korunur. `generateProgram` iç mantığı `buildWeeks(profile, prefs, dose)` olarak ayrıştırılır.
  - `app/program/index.tsx` uyarlama kartı: `adapt.lowAdherence` varsa düğme `prog.adapt.lighten` = "Dozu düşür (günde ~8 dk)"; onaylayınca `regenerateProgram` + `prog.adapt.lightened` banner'ı; `full`'a dönüş `setup.tsx`'ten.
- Kabul: 3. haftada uyum %40 → düğme görünür; basınca mevcut tamamlananlar korunur, kalan haftalarda günlük aktif dakika ≤ 10; program `dose: 'light'`; test: `regenerateProgram` `completed` ve `startDate` eşit.

**A4 · P2 · Misofoni (2 madde) ve OSA (2 madde) taramaları öyküde (Hekim B5–B6)**
- Gerekçe: Tanı kalitesi — hiperakuzi/misofoni ayrımı ve uyku kolunda OSA dışlaması.
- Spek (`app/assess/history.tsx`, `src/clinical/types.ts` `CaseHistory.misophoniaScreen?: boolean; osaScreen?: boolean`, `src/clinical/engine.ts`, `src/clinical/diagnosis.ts`, `src/i18n/areas/assess.ts`): ses hassasiyeti "Evet" ise 1 ek soru "Belirli sesler (çiğneme, tıkırtı) öfke/tiksinti uyandırıyor mu?" (misofoni ipucu → `dx.comorbid.misophonia`, hiperakuzi kolunda ses rampası yerine "misofoni bilgi" makalesi önerisi `rec.misophoniaInfo`); uyku sorunu "Evet" ise 2 soru "Yüksek sesle horlama?" / "Gün içinde aşırı uykululuk?" → ikisi de evet → `rec.osaReferral` ("uyku sıkıştırma uygulanmaz; aile hekimi → uyku kliniği") ve `cbti.compression` programdan çıkar (`profile.flags.osaSuspect` → `generateProgram`).
- Kabul: OSA şüpheli kullanıcıda `cbti.compression` üretilmez ve öneri listesinde `rec.osaReferral` var; misofoni ipucu doktor özetinde.

### İş akışı B — günlük deneyim

**B1 · P0 · Bölme fonksiyonu düzeltmeleri (D1, D2) + "Bugünün tek şeyi" hero metni**
- Gerekçe: Pazar kartı ve haftanın modülü gizlenmemeli; ana ekran tek çekirdeği söylemeli.
- Spek (`src/components/home/taskBudget.ts`, `app/(tabs)/index.tsx`, `app/session.tsx`, `src/i18n/areas/core.ts`, `tests/checkin.test.ts` veya yeni `tests/taskBudget.test.ts`):
  - `splitByBudget`: sıra (1) arka plan → gösterilir; (2) `isEssential` → gösterilir, `steps` sayılmaz (`diary`/`review` tipinde 1 dk görevler sayılmaz; `assessment` sayılır ama sınırı aşabilir); (3) `x.core === true` olan **ilk** görev bütçeden bağımsız gösterilir; (4) kalanlar bütçe + `maxActive` ile. `core` alanı yoksa (eski programlar) mevcut davranış: ilk `mind`/`sleep` tipi görev çekirdek kabul edilir.
  - `activeTasks`/numaralandırma değişmez; `shown` içinde en fazla `maxActive` isteğe bağlı + zorunlular.
  - Hero: `session.hero.title` → "Bugünün tek şeyi" + alt satır `{core başlığı} · {dk} dk`; `home.today.sub` korunur. Çekirdek bittiğinde hero "Çekirdek tamam · isteğe bağlı {n} adım" (`home.today.coreDone`).
- Kabul: Test: `[diary(1), cbt.restructuring(15, core), exercise.breathing(5), review(1)]` 15 dk → shown = diary, restructuring, breathing? Hayır: breathing bütçeyi aşar → `more`; review gösterilir. `[diary, pmr(12), sleep.diary(1), review(1)]` → dördü de gösterilir. Simülasyonda hiçbir Pazar `review.weekly` `more`'da değil.

**B2 · P0 · Check-in: gürlük uydurma (D6) + "+ Uyku kalitesi" satırı (D5) + `session.why.review` (D8)**
- Gerekçe: Sahte veri doktor özetine gidiyor; uyku günlüğü check-in'e katlanınca BDT-U kolunda bir adım eksilir.
- Spek (`src/components/home/QuickCheckIn.tsx`, `src/components/home/checkinStats.ts`, `app/(tabs)/progress.tsx`, `app/session.tsx`, `src/i18n/areas/core.ts`):
  - `save`: `loudness` yalnız kullanıcı gürlük satırını işaretlediyse yazılır (A1 ile `DiaryEntry.loudness?` isteğe bağlı; A'nın tip değişikliği gelene kadar `loudness: existing?.loudness ?? last?.loudness ?? undefined as unknown as number` yerine **A'nın types.ts değişikliği ilk commit olarak gelir**; B o commit'in üstünde çalışır).
  - `program?.arm === 'sleepFirst'` ya da bugünün görevlerinde `sleep.sound` varsa üçüncü satır "Uyku kalitesi (dün gece)" 0–10 → `sleepQuality`. Eski programlardaki `sleep.diary` görevi varsa bu satır onu da tamamlar (`taskKey(..., 'sleep.diary')`).
  - `progress.tsx` gürlük serisi tanımsız günleri atlar; `last7Days(..., 'loudness')` null döner.
  - `core.ts`: `session.why.review` = "1 dakika: bu hafta kaç gün, rahatsızlık eğilimi ve gelecek haftanın teması." (+ EN).
- Kabul: İlk check-in'den sonra `diary[0].loudness === undefined`; gürlük grafiği boş kalır, rahatsızlık dolu; sleepFirst kullanıcıda üçüncü satır görünür ve `sleepQuality` yazılır; haftalık kart adımında ham anahtar görünmez.

**B3 · P1 · Modül 2 dakikalık özetleri ve yarım kalan modüle dönüş**
- Gerekçe: 10–15 dk modüller 15 dk kullanıcı için en sık "ertelenen" adım; özet, "bugün yalnız özeti oku" seçeneğiyle çekirdeği 2 dakikaya indirir (Fogg: en küçük sürüm).
- Spek (`src/content/modules.ts`, `app/mind/[module].tsx`, `src/components/home/SessionComplete.tsx`, `src/i18n/areas/mind.ts`, `src/store/growth.ts`):
  - Her modüle `summary: { tr: string[]; en: string[] }` (3 madde, ≤ 140 karakter/madde, kaynak çipi modülünkiyle aynı) — önce 8 haftalık BDT çekirdeği + BDT-U + hiperakuzi (29 modül), ACT/mindfulness sonra.
  - `[module].tsx`: üstte "2 dakikalık özet" kartı (3 madde + "Tam modülü oku" / "Bugün yalnız özet yeter" düğmesi → `completeTask` + `track('summaryOnlyUsed')`); modül içi kaydırma konumu `settings`/yerel state yerine `clinical.readArticles` benzeri `moduleProgress[id] = sectionIndex` (store/clinical **A'ya ait** — bu sprintte B yalnız `AsyncStorage` anahtarı `dingin.moduleProgress` ile kendi küçük zustand dilimini `src/components/home/moduleProgress.ts` altında tutar).
  - Kısa sürüm (`short`) seçildiğinde çekirdek modül yerine "özet" varyantı gösterilir (`task.params = { summary: '1' }` yalnız görünüm; görev kimliği aynı).
- Kabul: Kısa kipte modül günü 1 dk check-in + 2 dk özet; "Bugün yalnız özet yeter" görevi tamamlar; yarım kalan modül yeniden açılınca kaldığı bölümden başlar; `summaryOnlyUsed` sayacı artar.

**B4 · P2 · Haftalık kart tutarlılığı (D12) + "Bu hafta öğrendikleriniz" + PMR kısa sürüm**
- Gerekçe: İki farklı "hafta" tanımı kafa karıştırır; kart içerik hatırlatınca "yatırım" hissi artar; D11 için 6 dk PMR.
- Spek (`app/week-review.tsx`, `src/components/home/checkinStats.ts`, `src/content/exercises.ts`, `src/content/registry.ts`, `app/exercise/pmr.tsx` [B'ye bu dosya için izin], `src/i18n/areas/core.ts`): `weekCompare(diary, today, field, window?: { from: string; to: string })` → kart program haftasını geçer; kartta tamamlanan modüllerin `summary[0]` satırları ("Bu hafta öğrendikleriniz"); `exercise.pmrShort` (6 dk, 7 kas grubu) kayıt defterine; A1'deki havuzda 2. haftadan `exercise.pmr` yerine `exercise.pmrShort` (A ile tek satırlık koordinasyon: A havuzu `exercise.pmrShort` kimliğini kullanır, B kaydı ekler — kayıt yoksa `unit()` fırlatır, bu yüzden **B4 kaydı A1'den önce** birleştirilir ya da A1 havuzda `exercise.pmr` bırakır ve B4 sonrası tek satır değişir).
- Kabul: Pazar kartındaki gün sayısı ve ortalama aynı 7 günü kapsar; `exercise.pmrShort` 6 dk olarak çalışır.

### İş akışı C — ses, bildirim, ayarlar

**C1 · P0 · Ölçüm haftası hatırlatması bağlanır (D9) + hatırlatma eşitleme tek noktadan**
- Gerekçe: Fonksiyon yazıldı, hiç tetiklenmiyor; 4. hafta THI tamamlama KPI'si buna bağlı.
- Spek (`src/notifications.ts`, `src/store/settings.ts`): `export function nextMeasurementDate(program: Program, now = new Date()): string | null` (saf: `programPosition` ile 4/8/12. haftanın 7. gününün ISO tarihi; akut kol 4. hafta); `export async function syncProgramReminders()` — `useClinical.getState().program` okur, `scheduleMeasurementReminder(nextDate, settings.measurementReminderId)` ve `setMeasurementReminderId`; program yoksa iptal. `bumpReentryNudge()` içinden `syncProgramReminders()` çağrılır (B/A dosyalarına dokunmadan her tamamlamada eşitlenir); `settings.ts`'e `measurementReminderId: string | null`. Metin `notify.ts`: "Bu Pazar 3 dakikalık ölçüm: puanınızın nasıl değiştiğini göreceksiniz." Sessiz saatler: `nightStart–nightEnd` içinde planlanmaz (saat 10:00'a kaydırılır).
- Kabul: Program başlatılıp ilk görev tamamlandığında planlanmış bildirimler arasında `kind: 'measurement'` ve tarih 4. hafta Pazar 10:00; program silinince iptal; test `nextMeasurementDate` 4 vaka.

**C2 · P1 · Perde eşlemesi → ses ön ayarı otomatik ("vay" anı)**
- Gerekçe: Ölçüm yapılıyor ama ses programı elle ayarlanmadıkça kullanmıyor; "çınlamanıza göre ayarlandı" en güçlü kişiselleştirme sinyali.
- Spek (`app/sound/player.tsx`, `src/audio/*`, `src/store/settings.ts`, `src/i18n/areas/sound.ts`): `preset=enrichment` açılırken `useClinical` son `psycho.pitchHz` ve `pitchConfidence` okunur; `pitchHz ≤ 8000 && confidence !== 'low'` ise dar bant bileşeni merkezi `pitchHz`'e ayarlanır (mevcut karıştırıcı parametreleriyle; yeni DSP yok), üstte çip `sound.tuned` = "Çınlamanıza göre ayarlandı (≈{hz} Hz)" + "Değiştir" (gelişmiş karıştırıcıyı açar). Kullanıcı elle değiştirirse `settings.soundTuneOverride = true` ve otomatik ayar durur. `preset=notched` yalnız `program.notchHz` varsa (odyolog B4 kilidi; değişmez). Ana ekran "Hızlı ses" kartı alt metni `home.quickSound.tuned` = "≈{hz} Hz'e ayarlı" (bu anahtar `core.ts`'te — **B** ekler; C yalnız `sound.ts`).
- Kabul: Perde 4 kHz/orta güven → oynatıcı çipi görünür ve dar bant merkezi 4000 Hz; güven düşük → çip yok ve varsayılan; elle değişiklik sonrası yeniden açılışta otomatik ayar uygulanmaz.

**C3 · P1 · Hiperakuzi "rahat düzey" başlangıcı (A1 ile eş)**
- Gerekçe: Hiperakuzi kolunda 1. gün artık ses içeriyor (A1); oynatıcı düşük ve güvenli başlamalı (odyolog B9).
- Spek (`app/sound/player.tsx`, `src/store/settings.ts`, `src/i18n/areas/sound.ts`): `preset=hyperacusis` ilk açılışta "Rahat düzeyinizi bulun" adımı: pembe gürültü −40 dBFS'ten başlar, kullanıcı "rahat" diyene kadar 2 dB adımlarla artar (en çok −18 dBFS), değer `settings.hyperComfortDb`; sonraki açılışlarda bu düzeyde başlar, haftalık +2 dB önerisi "Biraz artır?" düğmesiyle (zorunlu değil); süre sayacı `task.minutes`'i hedef gösterir ("10 dk") ve bitince "Tamamlandı say". Başlık: `sound.hyper.first.title` = "Rahat sesinizi bulun".
- Kabul: İlk açılışta düzey −40 dBFS; kullanıcı seçimi saklanır; tavan −18 dBFS aşılmaz; 10 dk sonra tamamlanma önerisi görünür.

**C4 · P2 · Bildirim metinleri: sessiz saatler ve ölçüm/hafif doz varyantları; Ayarlar "Program dozu" satırı**
- Spek (`src/notifications.ts`, `app/settings.tsx`, `src/i18n/areas/notify.ts`): günlük hatırlatma `nightStart–nightEnd` aralığına düşerse planlanmaz ve Ayarlar'da uyarı; `dose: 'light'` programda hatırlatma gövdesi "Bugün ~8 dk: tek adım" (`notify.day.light`); Ayarlar'a "Program dozu: Tam / Hafif" satırı (`/program/setup`'a bağlantı; dozu A3 değiştirir).
- Kabul: 22:30 hatırlatma seçimi engellenir ve açıklama görünür; hafif dozda gövde değişir.

Sıra: A1 (types.ts ilk commit) → B1/B2/C1 paralel → A2, B3, C2 → A3, C3 → A4, B4, C4.

---

## 4. KPI'lar (Sprint 1 listesine ek)
- Çekirdek görev tamamlama oranı (gün başına) ≥ %55 etkin kullanıcıda; Pazar kartı açılma ≥ %50 (`weekReviewOpened` / etkin hafta).
- "Kesinliği artır" düğmelerinden ölçüm tamamlama ≥ %30; kesinlik "düşük"ten "orta/yüksek"e geçen kullanıcı payı izlenir.
- Perde eşlemesi olan kullanıcıda ayarlı ses kullanım oranı; hiperakuzi kolunda 1. hafta ses dakikası > 0 olan kullanıcı ≥ %70.
- Doz düşürme kullanım oranı ve sonrasında 14 günlük uyum değişimi; özet-yalnız kullanım oranı (`summaryOnlyUsed`) %40'ı geçerse modül uzunluğu yeniden ele alınır.
- 4. hafta THI tamamlama ≥ %60 (ölçüm hatırlatması bağlandıktan sonra).
