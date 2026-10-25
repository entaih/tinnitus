# Dingin — Proje yönetimi kararı: Sprint 3 (Ekim 2026)

Karar sahibi: Proje yöneticisi. Girdi: Sprint 2 uygulaması (commit `4f2bcbb`), `docs/reviews/pm-sprint2.md`, yeniden simülasyon (`generateProgram` + `splitByBudget` × 4 kullanıcı tipi + hafif doz `regenerateProgram`), ekran okumaları (`src/components/assess/DiagnosisCard.tsx`, `app/assess/results.tsx`, `app/mind/[module].tsx`, `app/sound/player.tsx`, `app/(tabs)/index.tsx`, `app/week-review.tsx`, `app/onboarding.tsx`, `src/notifications.ts`, `src/notificationRules.ts`, `src/clinical/{program,diagnosis}.ts`, `src/components/home/taskBudget.ts`). `tsc` temiz, 135/135 test.

Sahibin öncelikleri değişmedi: **(1) organ düzeyinde kararlı ön tanı + en iyi tedavi yolu; (2) sıkılmadan, hızlı değer, hızlı yayılma.** Sprint 3'ün sorusu: *telefonunu ilk kez açan gerçek bir kullanıcı için en zayıf halka nerede?* Cevap (aşağıda kanıtlarıyla): **ilk 3 dakika** (değer görmeden 8–10 dk soru), **tanı kesinliğinin görünür artışı** (düğmeler var, "kesinlik arttı" anı yok), **program bitince ne olacağı** (12. hafta 7. gün sonsuza kadar tekrar ediyor) ve **paylaşım anının yokluğu** (kart var, tetik yok).

---

## 0. Sprint 2 incelemesi — kusurlar

Genel yargı: Sprint 2 hedefleri tutturdu: hiçbir günde çekirdek gizlenmiyor (`hiddenCore 0`), Pazar kartı hiç gizlenmiyor (`hiddenReview 0`), en fazla 3 adım, w1d4 ≤ 15 dk, akut kolda boş gün yok, uyku günlüğü check-in'e katlandı, tanı kartı tek cümle + "En iyi yol" + "kesinliği artır" düğmeleri, ses otomatik ayar ve rahat düzey arayışı, ölçüm hatırlatması bağlı. Kalan kusurlar:

| # | Kusur | Yer | Kanıt |
|---|---|---|---|
| E1 | **Program bittikten sonra son gün sonsuza kadar tekrar ediyor.** `programPosition` son güne sabitleniyor; 6 haftalık hafif program 43. günden itibaren her gün "12/6. hafta 7. gün: THI + haftalık kart" gösteriyor, hero/halka/hatırlatmalar donuyor, bakım modu yok. | `src/clinical/program.ts:362-368` (`idx = Math.min(diff, total - 1)`); `app/(tabs)/index.tsx` (bitiş durumu yok); `src/notificationRules.ts:35` (`nextMeasurementDate` null → sessizlik) | Kod okuması; hafif kullanıcı 43. günde aynı ekran |
| E2 | **Hiperakuzi 1. gün "Rahat sesinizi bulun" numaralı adım değil, en alttaki arka plan satırı.** `hyper.exposure` `/sound/player` rotasında olduğu için `isBackground` true; `core` işareti de yok. Hero "Hoş geldiniz"i gösteriyor; "ses vay anı" görünmüyor. | `src/clinical/program.ts:304` (`core` yok), `src/components/home/taskBudget.ts:12` (`isBackground`) | Sim: severe/hyper w1d1 = `diary + cbt.welcome \| bg hyper.exposure` |
| E3 | **1. hafta Pazar en ağır gün** (cbt.relax1 15 dk çekirdek + haftalık kart = 17 dk, tüm kronik kollarda). 5. gün muayene kuralı üçüncü modülü 7. güne itti; Pazar kart günü olmalı. | `src/clinical/program.ts:254-270` (ölçüm günü → modül kayması) | Sim: w1d7 17 dk (orta, ağır, hafif) |
| E4 | **Hafif doz modül günleri hâlâ 11–16 dk** (`cbt.restructuring` 16, `cbt.sleepGuidelines` 11); `asSummary` yalnız kısa kipte kullanılıyor, hafif dozda değil. Ayrıca hafif dozda ek kol modülü (BDT-U) 2. günde kalıyor → haftada fiilen 2 modül. | `src/components/home/taskBudget.ts:72` (`asSummary` yalnız `shortSplit`), `src/clinical/program.ts:233` | Sim LIGHT: w5d1 16 dk, w3d2 `cbti.stimulusControl` 11 dk |
| E5 | **"Kesinlik arttı" anı yok.** Tanı kartındaki düğmeler ölçüme götürüyor ama perde eşleme → gürlük → … zinciri sonuçlara dönmüyor; dönülse de önce/sonra kesinlik karşılaştırması yok. | `src/components/assess/DiagnosisCard.tsx` (`router.push(a.route)`), `app/assess/pitch.tsx:306` (`router.replace('/assess/loudness')`), `app/assess/hearing.tsx:313` | Kod okuması |
| E6 | **İlk değere kadar 8–10 dk soru.** Onboarding (3 sayfa + 3 onay kutusu + ad + kurulum sayfası) → Ana ekran → yolculuk kartı → güvenlik 12 → öykü 14 (misofoni/OSA ile) → THI 25 → PHQ 3 → GAD 2 → sonuç. Bu sırada çalınacak tek ses yok; bildirim izni değer görülmeden isteniyor. | `app/onboarding.tsx:105-106` (`router.replace('/(tabs)')`), `:212-220` (izin), `src/clinical/journey.ts`, `app/(tabs)/assess.tsx:36` (öykü 14 madde) | Kod okuması |
| E7 | **RI ölçümü hiç yapılmıyor:** `sound.ri` 1. hafta 3. günde (psikoeğitim 12 + nedenler 2) hep "Daha fazla"da; `rec.soundFirst/cbtFirst` ve `program.arm` kararı askıda kalıyor. | `src/clinical/program.ts:249` (d3), sim mild w1d3 `more sound.ri` | Sim |
| E8 | **Bildirim izni yanlış anda** (kurulum sayfası, değer görülmeden). Fogg/Eyal: izin "yatırım"dan sonra, ilk tamamlanan seansta istenmeli. | `app/onboarding.tsx:212-224` | Kod okuması |
| E9 | **Paylaşım tetiği yok:** `/share` kartı (view-shot + davet kodu) var ama hiçbir "an" ona götürmüyor (4. hafta THI düşüşü, haftalık hedef, 1. hafta tamam). Haftalık kart yalnız düz metin paylaşıyor. | `app/share.tsx`, `app/week-review.tsx:66-75`, `src/components/home/SessionComplete.tsx` | Kod okuması |
| E10 | Değerlendirme sekmesi eski envanteri gösteriyor: tam SCI-8/HQ-14 satırları, THI "5 dk" (yolculukta 4), öykü "14 soru"; sekme ile yolculuk çelişiyor. | `app/(tabs)/assess.tsx:35-47` | Kod okuması |
| E11 | Performans/depolama: Ana ekran tüm `useClinical()` deposuna abone, `planForToday` her render'da; `sessions` 2000 kayıt × oynatıcı `detail` JSON'u (katman listesi) AsyncStorage'da büyüyor; `diary` sınırsız. | `app/(tabs)/index.tsx:30,42`, `src/store/clinical.ts:79`, `app/sound/player.tsx:139-142` | Kod okuması (bugün hissedilmez; 6 ayda hissedilir) |
| E12 | Türkçe/erişilebilirlik tutarlılığı: "Çınlama etki puanı (THI)" ile "THI" karışık; dakika etiketleri (`4 dk`/`5 dk`) ekrana göre değişiyor; `ChipScale` 0–10 çiplerinde `accessibilityValue` yok; tanı kartı tek cümlesi ekran okuyucuda tek blok. | `src/i18n/areas/*.ts`, `src/components/home/QuickCheckIn.tsx`, `DiagnosisCard.tsx` | Kod okuması |

Doğrulananlar: `completed` ve `startDate` doz değişiminde korunuyor; `review.weekly` sayılmıyor ve hiç gizlenmiyor; ölçek/muayene ≥6 dk günlerde uygulama yok; `sound.tuned` çipi ve el ile değişiklikte otomatik ayarın durması; hiperakuzi −40 dBFS başlangıç ve −18 tavan; ölçüm hatırlatması `bumpReentryNudge` üzerinden eşitleniyor; sessiz saat reddi.

---

## 1. Sprint 3 hedefleri
1. **İlk 3 dakikada değer:** onboarding tek sayfa; güvenlik taramasından hemen sonra "Rahatlatıcı sesi dene" (ses, sonuçtan önce); THI biter bitmez "ön sonuç" (bant + 6/12 hafta); PHQ/GAD sonuçtan önce ama tek ekran; bildirim izni ilk seans tamamlanınca.
2. **Kesinlik görünür artsın:** tanı kartı düğmeleri `?from=dx` ile ölçümü yapıp sonuçlara döner; kart "Kesinlik: düşük → orta" rozeti ve "{ölçüm} şunu kesinleştirdi" satırı gösterir; sonuç ekranında kesinlik ilerleme çubuğu (ölçüt n/m).
3. **Program bitince hayat var:** bakım modu (4 haftalık bloklar: günlük isteğe bağlı uygulama + ses, Pazar kartı, 4 haftada bir THI, 12 haftada bir kısa güvenlik), THI +13 → 2 haftalık tazeleme bloğu; "Programı tamamladınız" kartı + paylaşım.
4. **Hafif doz gerçekten hafif:** modül = özet (2 dk) varsayılan; ek kol modülü 2 haftada bir.
5. **Yayılma:** paylaşım anları (1. hafta tamam, haftalık hedef, 4. hafta THI düşüşü, program tamam) → görsel kart + davet; klinik kodu onboarding'de tek satır.
6. Kusur düzeltmeleri E1–E12 öncelikli; THI-S ara eğilim (2/6. hafta) isteğe bağlı olarak eklenir.

Sprint 4'e: sesli rehberli uygulamalar, e-posta özeti, klinisyen paneli, biyolojik kalibrasyon, Türkçe DIN kayıtları.

---

## 2. Kararlar (kısa)
- **Onboarding = 1 ekran:** başlık + 3 satır değer önerisi + tek onay kutusu ("Ön tanı ve öz yönetim programıdır; hekim muayenesinin yerine geçmez; verilerim cihazımda kalır" — KVKK aydınlatma bağlantısı) + dil anahtarı. Ad ve kurulum (kulaklık, bildirim) kaldırılır; ad Ayarlar'a, bildirim izni 1. seans sonuna, kulaklık uyarısı ilk ses/test ekranına. "Başla" doğrudan güvenlik taramasına (`/assess/triage?journey=1`), Ana ekrana uğramaz.
- **Yolculuk sırası:** güvenlik (12) → **"Sesi dene" ara ekranı (isteğe bağlı, 1 dk, `preset=enrichment` 60 sn)** → THI (25) → **ön sonuç kartı** (bant, program süresi, "Devam: 8 soru daha") → öykü (11 + koşullu 3) → koşullu kısa ölçekler → PHQ-2+9 & GAD-2 **tek ekranda** (5 madde) → sonuç. Güvenlik taraması acil kademe verdiyse ses adımı atlanır. Hedef: ilk ses 2,5 dk'da, ön sonuç 6 dk'da, tam sonuç ≤ 9 dk.
- **Kesinlik döngüsü:** `Assessment.dxSnapshot?: { certainty; met: number; missing: number; at: string }` — sonuç ekranı açıldığında yazılır; ölçüm `?from=dx` ile biterse sonuçlara dönülür ve kart `dx.raised` ("Kesinlik düşükten ortaya yükseldi: perde eşleme ve işitme taraması 2 ölçütü karşıladı") ya da `dx.unchanged` ("Kesinlik değişmedi; eksik: …") gösterir. Sonuç ekranına "Kesinlik {met}/{met+missing} ölçüt" çubuğu.
- **Bakım modu:** `Program.phase: 'active' | 'maintenance'`; son gün tamamlanınca (ya da geçilince) `enterMaintenance()` 4 haftalık blok üretir (`maintenanceWeeks`), `programPosition` bloklar boyunca ilerler. THI her 4. Pazar; +13 (önceki ölçüme göre) → `refresherBlock` (2 hafta: `cbt.restructuring`, `cbt.exposure`/`hyper.hierarchy`, `cbt.relapse`, günlük uygulama) ve banner; −7/yatay → blok devam. Kısa güvenlik her 12 haftada. Günlük: check-in + isteğe bağlı uygulama (havuz 7) + arka plan ses; hedef 3/7 gün (halka hedefi bakımda 3).
- **Hafif doz:** modül görevi `params.summary='1'` ve `minutes: 2` ile üretilir (tam modül "Tam modülü oku" ile hâlâ açılır); ek kol modülleri `w % 2 === 0` haftalarda; uygulama ≤5 dk. Hedef: hafif dozda hiçbir gün > 8 dk.
- **Paylaşım anları (B):** `SessionComplete` ve `week-review` içinde koşullu "Kartı paylaş" (1. hafta tamam, haftalık hedef, THI ≥7 düşüş, program tamam); kart görseli view-shot ile; "Davet et" bağlantısı `dingin://invite?from=…` + mağaza bağlantısı yer tutucu. Sayılar yalnız kullanıcının kendi sayıları; "tedavi" dili yok.
- **THI-S (A, P2):** 2. ve 6. hafta Pazar "Daha fazla"da isteğe bağlı 10 madde; yalnız eğilim ("THI-S 18 → 14"), bant ve karar yok; maddeler Newman 2008 tablosundan birebir alınır (mühendislik yayını doğrular), toplam 0–40.

---

## 3. SPRINT 3 — Emirler (12; üç iş akışı, dosya sahipliği çakışmaz)

Dosya sahipliği:
- **A:** `src/clinical/*`, `app/assess/*`, `app/program/*`, `src/store/clinical.ts`, `src/components/assess/*`, `src/i18n/areas/assess.ts`, `tests/{program,engine,diagnosis,consequences,causes,journey}.test.ts`
- **B:** `app/(tabs)/*`, `app/session.tsx`, `app/week-review.tsx`, `app/mind/*`, `app/exercise/*`, `app/diary.tsx`, `app/onboarding.tsx`, `app/share.tsx`, `src/components/home/*`, `src/components/growth/*`, `src/content/*`, `src/i18n/areas/{core,mind,growth}.ts`, `src/store/growth.ts`, `tests/{checkin,taskBudget,growth,summaries}.test.ts`
- **C:** `src/notifications.ts`, `src/notificationRules.ts`, `src/store/settings.ts`, `app/settings.tsx`, `app/sound/*`, `app/sleep/*`, `src/audio/*`, `src/i18n/areas/{notify,sound}.ts`, `tests/{notifications,sound,dsp,psychoacoustics}.test.ts`
- Paylaşılan tipler (`src/clinical/types.ts`) yalnız A, **ilk commit**: `Program.phase?`, `Program.maintenanceStartDate?`, `ProgramTask.core?` (var), `Assessment.dxSnapshot?`, `ProgramTask.params.summary` (var). B/C bu alanları isteğe bağlı kullanır.
- Yeni rota parametreleri: `?from=dx` (A ekranları okur, B/C ekranlarından `/assess/pitch` vb. çağrılırken geçirilir), `?journey=1` (var).

### İş akışı A — klinik

**A1 · P0 · Program bitişi ve bakım modu (E1) + tazeleme bloğu**
- Gerekçe: Program biten her kullanıcı bugün donmuş bir ekrana bakıyor; en sadık kullanıcıyı kaybettiğimiz yer.
- Spek (`src/clinical/program.ts`, `src/clinical/types.ts`, `src/store/clinical.ts`, `app/program/index.tsx`, `src/i18n/areas/assess.ts`):
  - `Program.phase?: 'active' | 'maintenance'`, `Program.maintenanceStartDate?: string`, `Program.refresherUntil?: string`.
  - `export function isProgramFinished(p, now)`: `diff >= weeks.length*7` ve `phase !== 'maintenance'`.
  - `export function buildMaintenanceWeeks(profile, prefs, n = 4, opts: { refresher?: boolean })`: her hafta: d1–d7 `diary.daily` + isteğe bağlı uygulama (`DAILY_PRACTICE_POOL[7]` rotasyonu, `core` yok) + arka plan ses (varsa, 30 dk); d7 `review.weekly`; her 4. haftanın d7'si `assess.thi` (`core`); her 12. haftanın d4'ü `assess.redflagsShort`; `refresher` ise ilk 2 hafta d1/d3/d5 `cbt.restructuring`, `cbt.exposure` (hiperakuzi kolunda `hyper.hierarchy`), `cbt.relapse` (`core: true`).
  - `export function enterMaintenance(p, profile, prefs, now)`: `phase: 'maintenance'`, `maintenanceStartDate = now`, `weeks = [...p.weeks, ...buildMaintenanceWeeks(...)]`; `programPosition` değişmez (haftalar uzadığı için ilerler); bloğun son haftasına gelindiğinde `extendMaintenance()` 4 hafta daha ekler (store'da `ensureMaintenance()` Ana ekran açılışında çağrılır — çağrı B'nin dosyasından, fonksiyon A'nın).
  - `adaptationAdvice`: bakımda son iki THI farkı ≥ +13 → `'adapt.refresher'`; store'da `startRefresher()` 2 haftalık blok ekler ve `refresherUntil` yazar; `consequences.ts` THI satırı bakımda "+13: iki haftalık tazeleme bloğu eklendi" / "yatay: bakım sürüyor".
  - `app/program/index.tsx`: bakımda başlık "Bakım modu · {n}. hafta", tazeleme banner'ı; "Programı yeniden başlat" (tam yeniden üretim, `completed` sıfır) seçeneği.
  - Haftalık hedef bakımda 3/7 (`WEEKLY_GOAL_DAYS` B'nin; A `Program.weeklyGoal?: number` alanını yazar, B okur).
- Kabul: Test: 6 haftalık program 43. günde `isProgramFinished` true; `enterMaintenance` sonrası `programPosition` 7. hafta 1. gün; 10. hafta d7'de `assess.thi`; THI 30 → 45 sonrası `adapt.refresher` ve `startRefresher` ile sonraki 2 haftada 3 çekirdek modül; `nextMeasurementDate` bakımda sonraki THI Pazar'ını döner (C'nin fonksiyonu; A test verisi sağlar).

**A2 · P0 · "Kesinlik arttı" döngüsü (E5) + yolculuk yeniden sıralama ve ön sonuç (E6)**
- Gerekçe: Tanı kartının düğmeleri bugün tek yönlü; sahibin "tanı koysun" emri ancak kesinliğin görünür yükselişiyle inandırıcı olur. İlk değer 3 dakikaya ancak yolculuk sırası değişince iner.
- Spek (`src/clinical/diagnosis.ts`, `src/clinical/journey.ts`, `src/components/assess/DiagnosisCard.tsx`, `app/assess/results.tsx`, `app/assess/{pitch,hearing,causes,loudness}.tsx`, `app/assess/exam/*.tsx`, `app/assess/questionnaire/[id].tsx`, `src/hooks/useJourney.ts` [A'ya bu sprintte izin], `src/store/clinical.ts`, `src/i18n/areas/assess.ts`):
  - `Assessment.dxSnapshot?: { certainty: Certainty; met: number; missing: number; primaryId: CauseId; at: string }`; `results.tsx` açılışında `diagnose(a)` ile karşılaştırır: snapshot yoksa yazar; varsa ve `certainty` yükseldiyse ya da `met` arttıysa kartın üstünde `dx.raised` banner'ı ("Kesinlik: {önce} → {sonra}. {ölçüm adları} {k} ölçütü karşıladı.") ve snapshot güncellenir; `primaryId` değiştiyse `dx.changed` ("Ön tanı güncellendi: {eski} → {yeni}").
  - `DiagnosisCard`: "Kesinlik {met}/{met+missing} ölçüt" ince çubuk; düğmeler `route + '?from=dx'`.
  - `useJourney.finish()` ve `pitch/hearing/loudness/causes/exam` bitişleri: `from === 'dx'` ise zincir yerine `router.replace('/assess/results?raised=1')`. (`pitch.tsx:306` gürlüğe zincirleme yalnız `from` yokken.)
  - `journey.ts` yeni sıra: `safety → soundTry (isteğe bağlı, 1 dk, route '/sound/player?preset=enrichment&trial=1', acil kademede atlanır, `done` = `sessions.some(type==='sound')` ya da `skipped`) → thi → preview (route '/assess/results?preview=1', 1 dk, done = assessment.previewSeenAt) → history → (ths|rasst|sci02) → mood (route '/assess/questionnaire/MOOD' — PHQ-2+9 ve GAD-2 tek ekran, 5 madde; `[id].tsx` `MOOD` sanal kimliği iki sonucu ayrı `PHQ9`/`GAD7` kayıtları olarak yazar, kapı kuralları aynı) → results`.
  - `results.tsx?preview=1`: yalnız gösterge + `consequence.thi.length*` satırı + "Devam: 8 soru daha (≈2 dk)" düğmesi (`nextJourneyRoute`); `previewSeenAt` yazılır; tam sonuç ekranı değişmez.
  - `history.tsx`: misofoni/OSA soruları koşullu kalır; temel 11 madde (yaş ve önceki odyometri "Daha sonra" sekmesine değil, kalır — 11'i aşmaz).
- Kabul: Tonal kullanıcı tanı kartından "Perde eşleme"ye gider, bitince sonuç ekranına döner ve "Kesinlik: düşük → orta" banner'ını görür; snapshot güncellendiği için ikinci açılışta banner yok; yolculuk süresi (dakika toplamı) ≤ 9; THI'den sonra ön sonuç ekranı görünür; `MOOD` ekranı 5 madde ve PHQ-2 ≥3'te tam PHQ-9'a açılır; madde 9 >0 kriz yolu değişmez; `tests/journey.test.ts` 5 vaka.

**A3 · P1 · Üreteç düzeltmeleri (E2, E3, E4, E7) + hafif doz özet**
- Spek (`src/clinical/program.ts`): (a) hiperakuzi 1. gün `hyper.exposure` `core: true` ve `numbered: true` (yeni isteğe bağlı alan; B `isBackground` içinde `!task.numbered` kontrolü ekler); (b) ölçüm günü yüzünden kayan modül d7'ye değil önce d6'ya, d6 doluysa d4'e; d7'de modül asla yok (`moduleDays` yeniden: `[1,3,5,6,4,2]`); (c) hafif doz: modül görevleri `{ minutes: 2, params: { summary: '1' } }` ile üretilir (`task(m, { ...summaryParams })`), ek kol modülleri yalnız çift haftalarda, uygulama ≤5 dk; (d) `sound.ri` 1. hafta 4. güne (`core: true`; o gün uygulama yok) ve `riPositive` sonucu `assessment.psycho` üzerinden `bestPath` tarafından okunur (var).
- Kabul: Sim: hyper w1d1 numaralı adımlar = diary, hyper.exposure(core), welcome; hiçbir kolda w1d7 > 8 dk; hafif dozda hiçbir gün > 8 dk aktif; `sound.ri` w1d4'te gösterilen listede; `tests/program.test.ts` güncel.

**A4 · P2 · THI-S ara eğilim (2. ve 6. hafta, isteğe bağlı) + depolama budaması (E11)**
- Spek (`src/clinical/questionnaires.ts` `THIS` 10 madde, 0–40, `interpret` bant vermez (`band:'none'`, key `this.trend`), `citation:'newman2008'`; `program.ts` w2d7/w6d7 `assess.thiShort` `core` değil (Daha fazla); `consequences.ts` `THIS`: önceki THI-S varsa "{d} puan" eğilim satırı, yoksa "İlk ara ölçüm; 6. haftada karşılaştıracağız"; `src/store/clinical.ts` `persist` `partialize`: `sessions` 500 ile sınırlı ve `detail` 120 karakter; `diary` 730 gün). Maddeler Newman, Sandridge & Bolek 2008 tablosundan alınır; mühendislik yayınla doğrular, doğrulanamazsa görev üretilmez (bayrak `THIS_ENABLED=false`).
- Kabul: w2d7 "Daha fazla"da "Hızlı kontrol (10 soru)"; sonuç satırı eğilim verir, bant/karar vermez; depo yeniden yüklendiğinde `sessions.length ≤ 500`.

### İş akışı B — günlük deneyim ve yayılma

**B1 · P0 · Tek ekran onboarding + doğrudan yolculuk (E6, E8)**
- Gerekçe: İlk değer 3 dakikaya ancak giriş 30 saniyeye inince iner; izin istemi değerden sonra.
- Spek (`app/onboarding.tsx`, `src/i18n/areas/core.ts`, `src/components/home/SessionComplete.tsx`, `app/(tabs)/index.tsx`): tek ekran: logo + başlık "Çınlamanız için ön tanı ve 15 dakikalık günlük program" + 3 satır (ne yapar / ne yapmaz / veriler cihazda) + tek onay kutusu (`onb.consent.single`, KVKK/koşullar bağlantıları) + dil `Segmented` + "Başla" → `router.replace('/assess/triage?journey=1')`; ad alanı ve kurulum sayfası kaldırılır (ad Ayarlar'da var); bildirim izni: `SessionComplete` 1. gün tamamlandığında tek seferlik kart "Yarın hatırlatalım mı? (20:00)" → `scheduleWeekdayReminders` (C'nin fonksiyonu; `settings.reminderPromptedAt` C ekler, B okur/yazar `useSettings.getState().setReminderPromptedAt`); "Sonra" ile kapanır, 7 gün sonra bir kez daha. Kulaklık uyarısı ilk `/sound/*` ve `/assess/{hearing,pitch}` açılışında zaten var (`headphone-check`); yoksa C ekler.
- Kabul: Yeni kurulumda ilk dokunuşta güvenlik taraması açılır; onboarding ≤ 30 sn; bildirim izni ilk seans tamamlanmadan istenmez; `tests/growth.test.ts` `day1Completed` sayımı değişmez.

**B2 · P0 · Program bitişi ve bakım modu arayüzü + hafif doz / numaralı ses (A1, A3 ile eş)**
- Spek (`app/(tabs)/index.tsx`, `app/session.tsx`, `src/components/home/{taskBudget,SessionComplete,WeeklyGoalRing}.tsx`, `src/i18n/areas/core.ts`): Ana ekran açılışında `ensureMaintenance()` (A'nın store aksiyonu) çağrılır; `isProgramFinished` ise hero "Programı tamamladınız · {n} hafta, {k} etkin gün" + "Bakım moduna geç" (tek dokunuş) + "Kartı paylaş"; bakımda hero "Bakım · bu hafta {done}/3" ve halka hedefi `program.weeklyGoal ?? 5`; `isBackground` → `task.type === 'sound' && route.startsWith('/sound/player') && !task.numbered`; hafif dozda `params.summary==='1'` görevler "2 dk özet" etiketiyle; `SessionComplete` tazeleme/bakım metinleri.
- Kabul: 6 haftalık program 43. günde "tamamladınız" ekranı; "Bakım moduna geç" sonrası Ana ekran 7. hafta 1. gün; hiperakuzi 1. gün hero "Rahat sesinizi bulun · 10 dk".

**B3 · P1 · Paylaşım anları ve davet döngüsü (E9)**
- Gerekçe: Yayılma için "an" gerekir; kart hazır, tetik yok.
- Spek (`src/components/home/SessionComplete.tsx`, `app/week-review.tsx`, `app/share.tsx`, `src/components/growth/*`, `src/store/growth.ts`, `src/i18n/areas/growth.ts`): `shareMoments(program, pos, thi, weekDone): ShareMoment | null` (saf, `src/components/growth/shareMoments.ts`): `firstWeekDone` (w1d7 tamam), `weeklyGoal` (hedef tutturuldu, haftada 1), `thiDrop` (son THI ≥7 düşüş), `programDone`, `maintenance12w`; her an için kart varyantı (başlık + kullanıcının sayıları) ve `track('shareMomentShown' | 'shareMomentUsed')`; `week-review` "Paylaş" artık görsel kart (`captureRef`) + "Davet et" (`dingin://invite?from={inviteCode}` + mağaza yer tutucu); Ayarlar yerine onboarding sonrası ilk sonuç ekranında klinik kodu satırı **A'nın ekranı** olduğu için B `results.tsx`'e dokunmaz; bunun yerine `app/(tabs)/index.tsx`'te program yokken "Klinik kodunuz var mı?" tek satır (var olan `clinicCode` bileşeni).
- Kabul: w1d7 tamamlandığında "Kartı paylaş" görünür ve görsel kart üretir; haftada en fazla 1 paylaşım kartı; sayaçlar artar; kartta "tedavi/iyileşti" ifadesi yok (test: `buildShareText` yasaklı kelime listesi).

**B4 · P2 · Değerlendirme sekmesi ve kopya/erişilebilirlik tutarlılığı (E10, E12) + Ana ekran performansı (E11)**
- Spek (`app/(tabs)/assess.tsx`, `app/(tabs)/index.tsx`, `src/components/home/QuickCheckIn.tsx`, `src/i18n/areas/{core,mind,growth}.ts`): sekme envanteri yolculukla aynı (THS/SCI02 kısa, tam formlar "yalnız pozitifse" alt satırı; THI 4 dk; öykü 11 soru); dakika etiketleri `QUESTIONNAIRES.*.minutes` tek kaynaktan; `ChipScale` çiplerine `accessibilityValue`; `index.tsx` `useClinical` seçicilerle (`program`, `diary`, `assessments` ayrı), `planForToday` ve `coreTask` `useMemo`; `MiniBars` `React.memo`. Türkçe: "THI" yalnız parantez içinde, metinde "çınlama etki puanı"; "dk" biçimi tek.
- Kabul: Sekme ile yolculuk aynı madde sayılarını gösterir; ekran okuyucu 0–10 çipte "Rahatsızlık 6 / 10" okur; Ana ekran `diary` değişiminde `program` bağımlı hesapları yeniden yapmaz (React DevTools ile 1 render).

### İş akışı C — ses, bildirim, ayarlar

**C1 · P0 · "Sesi dene" deneme kipi + ilk ses kulaklık kontrolü (A2 ile eş)**
- Gerekçe: İlk değer = 2,5 dakikada çalan ses; deneme kipi görevsiz, 60 sn, tek düğme.
- Spek (`app/sound/player.tsx`, `src/audio/tuning.ts`, `src/i18n/areas/sound.ts`): `?trial=1`: başlık "60 saniyelik deneme", karıştırıcı gizli, tek "Başlat" düğmesi, 60 sn sayaç, bitince "Hoşunuza gittiyse program bunu her gün sizin için ayarlayacak" + "Devam et" (`router.back()` → yolculuk sürer) ve `logSession({type:'sound', minutes:1, detail:'trial'})`; kulaklık yoksa çalışır (hoparlör uyarısı tek satır); acil kademede açılmaz (B/A rota vermez). Ayrıca `headphone-check` ilk ses ve testlerde bir kez (`settings.headphoneCheckedAt`).
- Kabul: Deneme 60 sn'de durur, görev tamamlamaz, oturum kaydı `detail:'trial'`; yolculuk `soundTry.done` bu kayıtla true olur.

**C2 · P1 · Bakım modu hatırlatmaları + değerden sonra izin akışı (A1, B1 ile eş)**
- Spek (`src/notificationRules.ts`, `src/notifications.ts`, `src/store/settings.ts`, `app/settings.tsx`, `src/i18n/areas/notify.ts`): `nextMeasurementDate` bakım haftalarını (her 4. Pazar) ve tazeleme bloğunu tanır; bakımda günlük hatırlatma haftada 3'e iner (`settings.reminderDays: number[]`, varsayılan bakımda Pzt/Çar/Paz) ve metin "Bakım: 5 dk uygulama ya da yalnız check-in"; `settings.reminderPromptedAt`, `setReminderPromptedAt`; `requestReminderPermission` çağrısı artık yalnız B1'deki kart ya da Ayarlar'dan; program bitiş günü tek seferlik bildirim "Programı tamamladınız — bakım modunu açın" (`kind:'programDone'`), `syncProgramReminders` planlar.
- Kabul: Bakımda planlanmış hatırlatma sayısı 3/hafta; `nextMeasurementDate` bakım 4. Pazar'ı döner (test); onboarding sırasında hiçbir izin istemi tetiklenmez.

**C3 · P1 · Hafif doz ve bakım için ses süresi + sessiz saat uyumu**
- Spek (`app/sound/player.tsx`, `src/audio/tuning.ts`, `app/sleep/*`, `src/i18n/areas/sound.ts`): `targetMinutes` bakımda 30, hafif dozda `task.minutes`; oynatıcı "Tamamlandı say" hedefe ulaşınca otomatik öner (var) + gece ses ön ayarı `nightStart` sonrası otomatik zamanlayıcı 45 dk (uyku hijyeni; `sleep/*` ekranında "Zamanlayıcı: 45 dk" varsayılan); hiperakuzi haftalık +2 dB önerisi bakımda 2 haftada bir.
- Kabul: Gece ön ayarı sessiz saatte açılınca zamanlayıcı 45 dk görünür; hafif dozda ses görevi `task.minutes` hedefini gösterir.

**C4 · P2 · Ayarlar: "Programım" bölümü (doz, bakım, yeniden başlat, hatırlatma günleri) + Türkçe/erişilebilirlik geçişi (E12, C dosyaları)**
- Spek (`app/settings.tsx`, `src/i18n/areas/{notify,sound}.ts`): "Programım" bölümü: doz (Tam/Hafif → `/program/setup`), bakım durumu, "Programı yeniden başlat" (A'nın store aksiyonu), hatırlatma günleri seçimi; `sound.ts`/`notify.ts` kopyasında "tedavi/iyileştirir" taraması (test: yasaklı kelime), tüm `Pressable`'larda `accessibilityRole/Label`.
- Kabul: Ayarlar'dan hatırlatma günleri değişince 7 yerine seçilen gün sayısı kadar bildirim planlanır; yasaklı kelime testi geçer.

Sıra: A1 (types ilk commit) → B1, C1 paralel → A2 → B2, C2 → A3 → B3, C3 → A4, B4, C4. Her akış: `npx tsc --noEmit` + `npm test`.

---

## 4. KPI'lar (Sprint 1–2 listesine ek)
- Kurulum → ilk ses (deneme) ≤ 3 dk (medyan) ve ≥ %60 kullanıcıda; kurulum → ön sonuç ≤ 6 dk; kurulum → tam sonuç ≥ %55.
- Tanı kartı düğmesinden ölçüm tamamlayıp "kesinlik arttı" gören kullanıcı ≥ %35 (`dxRaisedShown`); kesinlik "düşük" ile programa başlayan pay izlenir ve düşmeli.
- Program bitiren kullanıcıda bakım moduna geçiş ≥ %60; bakım 4. haftada THI tamamlama ≥ %50; tazeleme bloğu tetiklenme oranı izlenir.
- Paylaşım anı gösterim → kullanım ≥ %15; davet bağlantısından kurulum izlenir (yerel sayaç + mağaza).
- Bildirim izni kabul oranı (değer sonrası istem) ≥ %55 (önce: kurulumda ≈ %35–45 beklenir).
- Hafif dozda günlük aktif dakika ≤ 8 (sim) ve hafif doza geçenlerde 14 günlük uyum artışı.
