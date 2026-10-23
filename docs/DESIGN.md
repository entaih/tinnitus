# Design Specification — Tinnitus Assessment & Rehabilitation App

**Platform:** iOS + Android, React Native / Expo (Expo Go compatible)
**Primary language:** Turkish (tr-TR), secondary English (en)
**Audience:** Adults with tinnitus — frequently anxious, often 45+, varying hearing ability, sometimes using the app at night in bed.
**Positioning:** Clinical-grade, evidence-led, calm. Visual benchmark set: Kalmeda (CE-marked CBT DiGA), Oto (NHS-trialled CBT programme), Apple Health, Headspace/Calm (for warmth, not playfulness).

Design principle in one line: **"Quiet authority."** The interface should feel like a good clinician: unhurried, precise, honest about limits, never selling.

---

## 1. Brand concept & naming

### Concept
The app sits at the intersection of two emotions: the patient's *noise* (anxiety, intrusiveness) and the clinic's *calm* (structure, evidence, measured progress). The brand should therefore be built on **still water / horizon** imagery — a flat, deep teal plane meeting a pale sand sky — rather than ears, sound waves or brains, which read as either anatomical or gimmicky. The logo mark: a single horizontal line with a soft dip (a wave settling to flat), inside a rounded square. It doubles as the "residual inhibition" metaphor: the sound subsiding.

### Name options (Turkish-friendly, trademark-check required)

| Name | Rationale | Risk |
|---|---|---|
| **Dinginlik** ("tranquillity") | Native Turkish word, non-medical, pronounceable by English speakers ("din-gin-lik"); conveys the goal (calm) rather than the problem (ringing). | Longish for an app icon; abbreviate to "Dingin" in wordmark. |
| **Sessiz Liman** ("quiet harbour") | Warm, clinical-safe metaphor: a place you return to. Strong for a programme/"home" framing. | Two words; English users will not parse it. |
| **Uğultu** ("hum/ringing") | Literally the symptom; memorable; patients search for this word. | Names the enemy — can feel heavier, less hopeful. |
| **Tinora** | Coined (tin-nitus + "ora" ≈ *hora*/"now", also sounds like Turkish *tını* = timbre). Works in both languages, good for English App Store. | No intrinsic Turkish meaning; needs brand building. |

**Recommended:** **Dingin** (short form of *Dinginlik*) with the descriptive App Store subtitle "Tinnitus Değerlendirme ve Rehabilitasyon". It is positive, native, trademark-friendly and sounds equally credible as a hospital-affiliated product or a private DTx.

**Tagline (TR):** "Sesle değil, sessizlikle ölçülen ilerleme." (Progress measured not by sound, but by quiet.)
**Tagline (EN):** "Evidence-based care for a quieter day."

**Brand voice:** Warm, exact, non-promissory. We say "may help", "most people", "studies show" — never "cure", "silence your tinnitus", "guaranteed".

---

## 2. Color system

### Rationale
Deep teal is the chromatic midpoint between clinical blue (trust, competence) and green (recovery, safety); it is also the hue least associated with alarm. The warm sand accent prevents the palette from feeling cold or institutional and gives a single "human" colour for progress and encouragement. Saturated red is reserved exclusively for red-flag triage. All neutrals are teal-tinted (not pure grey) so dark mode and light mode feel like the same product. Dark mode uses a deep navy-teal surface (not pure black) to reduce halation on OLED for older eyes at night and to keep the brand hue present.

### Core tokens

| Token | Hex | Use |
|---|---|---|
| `primary.50` | `#E6F3F3` | Tinted backgrounds, selected states |
| `primary.100` | `#C4E4E6` | Chips, progress track |
| `primary.200` | `#8FD6D9` | Dark-mode links / icons |
| `primary.300` | `#5FBFC4` | Dark-mode primary (buttons, rings) |
| `primary.400` | `#2E9BA3` | Illustration mid-tone |
| `primary.500` | `#15808A` | Icons on light, chart line |
| `primary.600` | `#0E6B75` | **Light-mode primary** (buttons, active tab) |
| `primary.700` | `#0A525A` | Pressed state, headings on tinted bg |
| `primary.800` | `#073D44` | Dark-mode elevated surface tint |
| `primary.900` | `#052A30` | Deepest brand |
| `accent.100` | `#F6EBD3` | Streak/adherence background |
| `accent.300` | `#E3C285` | Dark-mode accent, streak flame |
| `accent.500` | `#B8863B` | Sand accent — **decorative/large text only (3.2:1)** |
| `accent.700` | `#8A6320` | Accent text on light (5.4:1) |
| `secondary.100` | `#DDEFF9` | Info surfaces, education tags |
| `secondary.500` | `#4A90C8` | Soft sky blue — illustrations, sleep module |
| `secondary.700` | `#1E5FA8` | Info text / links on light (6.5:1) |

### Semantic

| Token | Light (text / bg) | Dark (text / bg) | Contrast |
|---|---|---|---|
| `success` | `#1F7A4D` / `#E3F5EA` | `#7FD1A6` / `#0F2B20` | 4.7:1 / 9.8:1 |
| `warning` | `#9A5B00` / `#FBF1DC` | `#F2C46D` / `#2E2410` | 5.4:1 / 10.9:1 |
| `danger` | `#B42318` / `#FBE2DF` | `#F5A09A` / `#331512` | 6.6:1 / 8.8:1 |
| `info` | `#1E5FA8` / `#DDEFF9` | `#8FC3F2` / `#102235` | 6.5:1 / ≈9:1 |

### Neutrals (teal-tinted)

| Token | Hex | Light-mode role | Dark-mode role |
|---|---|---|---|
| `neutral.50` | `#F7F9F8` | **App background** | — |
| `neutral.100` | `#EEF2F3` | Secondary surface, skeleton base | — |
| `neutral.200` | `#D5E0E4` | Borders, dividers | — |
| `neutral.300` | `#B3C2C8` | Disabled text, placeholder | Secondary text (9.7:1) |
| `neutral.400` | `#8A9BA3` | Icons (decorative) | Muted text (6.2:1) |
| `neutral.500` | `#6B8591` | Muted text — **large text only (3.7:1)** | Disabled |
| `neutral.600` | `#4F6B75` | Secondary text (5.4:1) | Borders |
| `neutral.700` | `#2C4A55` | Body text (9.0:1) | Elevated surface 2 |
| `neutral.800` | `#13262E` | Headings on tinted | **Card surface** |
| `neutral.900` | `#0F2A33` | **Primary text** (14.2:1) | — |
| `ink.dark` | `#0B1A20` | — | **App background** |
| `text.onDark` | `#E6EDF0` | — | Primary text (15.0:1 on bg, 13.2:1 on card) |

### Surfaces

| Role | Light | Dark |
|---|---|---|
| `surface.bg` | `#F7F9F8` | `#0B1A20` |
| `surface.card` | `#FFFFFF` | `#13262E` |
| `surface.elevated` | `#FFFFFF` + shadow | `#1A3139` |
| `surface.tinted` | `#E6F3F3` | `#0F2B30` |
| `surface.overlay` | `rgba(15,42,51,0.55)` | `rgba(0,0,0,0.65)` |
| `border.default` | `#D5E0E4` | `#2C4A55` |
| `border.strong` | `#B3C2C8` | `#4F6B75` |

### WCAG AA verification (computed with relative luminance; AA normal text ≥ 4.5:1, large ≥ 3:1)

| Pair | Ratio | Verdict |
|---|---|---|
| `#0F2A33` on `#F7F9F8` | 14.2 | AAA |
| `#2C4A55` on `#F7F9F8` | 9.0 | AAA |
| `#4F6B75` on `#F7F9F8` | 5.4 | AA |
| `#6B8591` on `#F7F9F8` | 3.7 | **Large text only** |
| `#FFFFFF` on `#0E6B75` (primary button) | 6.2 | AA |
| `#FFFFFF` on `#0A525A` (pressed) | 8.9 | AAA |
| `#0A525A` on `#E6F3F3` | 7.8 | AAA |
| `#8A6320` on `#FFFFFF` (accent text) | 5.4 | AA |
| `#B8863B` on `#FFFFFF` | 3.2 | **Decorative / large only** |
| `#FFFFFF` on `#B42318` (red-flag banner) | 6.6 | AA |
| `#E6EDF0` on `#0B1A20` | 15.0 | AAA |
| `#B3C2C8` on `#0B1A20` | 9.7 | AAA |
| `#8A9BA3` on `#13262E` | 5.4 | AA |
| `#0B1A20` on `#5FBFC4` (dark primary button label) | 8.2 | AAA |
| `#5FBFC4` on `#0B1A20` (dark links) | 8.2 | AAA |

Rule: never place `accent.500` or `neutral.500` as body-size text. Non-text UI (borders, slider tracks, focus rings) must reach 3:1 against adjacent colour (WCAG 1.4.11) — `border.strong` is used wherever a border is the only affordance.

### "Night" theme (sound-therapy at bedtime)
Not a third theme; a **dark-mode modifier** `night=true` triggered by the Sleep tab or a scheduled window (user-set, default 22:00–06:00): background `#070F13`, all text capped at `neutral.300`, primary demoted to `primary.400` `#2E9BA3`, brightness of illustrations reduced 40%, haptics on, screen auto-dim hint shown once. Rationale: minimise blue-rich luminance and glare while keeping AA contrast.

---

## 3. Typography

**Recommendation:** Platform system fonts (SF Pro on iOS, Roboto on Android) via React Native default. Reasons: free Dynamic Type / font-scale support, full Turkish glyph coverage (İ ı Ş ş Ğ ğ Ç ç Ö ö Ü ü), zero load time, and it reads as "part of the OS" — a trust signal in a medical context. If a brand face is required, use **Inter** via `@expo-google-fonts/inter` for body and **Manrope** for display; both have complete Turkish diacritics and tabular numerals. Avoid DM Sans (weak Turkish kerning on ş/ğ at small sizes).

| Style | Size / Line height | Weight | Letter spacing | Use |
|---|---|---|---|---|
| `display` | 34 / 41 | 700 | −0.4 | Result headline score ("TFI 42") |
| `h1` | 28 / 34 | 700 | −0.3 | Screen titles |
| `h2` | 22 / 28 | 600 | −0.2 | Section titles, card titles |
| `h3` | 18 / 24 | 600 | 0 | Sub-sections, questionnaire item stem |
| `body` | **17 / 26** | 400 | 0 | All reading text (≥16 for older users) |
| `bodyStrong` | 17 / 26 | 600 | 0 | Emphasis, button labels |
| `bodySmall` | 15 / 22 | 400 | 0 | Secondary descriptions |
| `caption` | 13 / 18 | 500 | +0.2 | Timestamps, chart axes, evidence chips |
| `overline` | 12 / 16 | 600 | +0.8, uppercase | Section labels ("BUGÜN", "HAFTA 3") |
| `numeric` | 40 / 44 | 700, tabular | 0 | Gauges, slider readouts (Hz, dB) |

**Dynamic Type / fontScale:** All text uses `allowFontScaling` (default) and layouts must survive 200% scale: buttons grow vertically, horizontal chip rows wrap, tab labels may be hidden at ≥160% (icons remain, with `accessibilityLabel`). Cap `maxFontSizeMultiplier` at 2.0 for `display`/`numeric` only to protect gauges. Minimum tap target 44×44 pt (exceeds WCAG 2.2 2.5.8 minimum of 24×24, meets Apple HIG 44 and Material 48dp with 4 dp spacing). Turkish strings run ~20–30% longer than English — design every label at Turkish length first.

---

## 4. Spacing, radii, elevation, iconography

### Spacing (4-pt base)

| Token | px | Use |
|---|---|---|
| `space.1` | 4 | Icon-to-label gap |
| `space.2` | 8 | Inside chips, between stacked captions |
| `space.3` | 12 | Card inner padding (compact) |
| `space.4` | 16 | **Screen gutter**, card padding |
| `space.5` | 20 | Between cards |
| `space.6` | 24 | Section gap |
| `space.8` | 32 | Between major groups |
| `space.10` | 40 | Top of onboarding content |
| `space.12` | 48 | Bottom safe margin above tab bar |

### Radii

| Token | px | Use |
|---|---|---|
| `radius.sm` | 8 | Chips, inputs, badges |
| `radius.md` | 12 | Buttons |
| `radius.lg` | 16 | Cards |
| `radius.xl` | 24 | Bottom sheets, modals |
| `radius.full` | 999 | Play button, progress ring, avatar |

### Elevation (keep flat; borders carry hierarchy in dark mode)

| Level | Light | Dark |
|---|---|---|
| `e0` | none, 1px `border.default` | 1px `#2C4A55` |
| `e1` card | `shadowColor #0F2A33, opacity 0.06, radius 8, offsetY 2, elevation 2` | surface `#13262E`, no shadow |
| `e2` sticky header/bottom sheet | `opacity 0.10, radius 16, offsetY 6, elevation 6` | surface `#1A3139` |
| `e3` FAB/play button | `opacity 0.18, radius 24, offsetY 10, elevation 10` | surface `#1A3139` + 1px `primary.800` |

### Iconography
**Recommendation: `lucide-react-native`** (plus `react-native-svg`, already available in Expo Go). Reasons: a single coherent 2-px stroke family that matches the "quiet, medical" tone; SVG so it scales crisply with font scale and takes any token colour; imports per icon (`lucide-react-native/icons/ear`) to avoid Metro bundle bloat. `@expo/vector-icons` is bundled in Expo Go and remains a valid zero-config fallback, but Expo has announced it is moving away from it in favour of `@react-native-vector-icons/*` packages, so do not build a new product on it. Stroke width 2 at 24 px; 1.75 at 20 px in dense rows. Always paired with `accessibilityLabel`.

| Concept | Lucide icon | Fallback (Ionicons) |
|---|---|---|
| Assessment | `clipboard-list` | `clipboard-outline` |
| Sound therapy | `audio-waveform` (or `waves`) | `musical-notes-outline` |
| CBT / Mind | `brain` | `bulb-outline` |
| Sleep | `moon-star` | `moon-outline` |
| Progress | `trending-up` | `trending-up-outline` |
| Education | `book-open` | `book-outline` |
| Profile | `user-round` | `person-circle-outline` |
| Alert / red flag | `triangle-alert` (danger colour) | `warning-outline` |
| Headphones | `headphones` | `headset-outline` |
| Ear | `ear` | `ear-outline` |
| Evidence badge | `badge-check` | `ribbon-outline` |
| Doctor summary / export | `file-text`, `share-2` | `document-text-outline` |
| Timer | `timer` | `timer-outline` |
| Streak | `flame` (accent) | `flame-outline` |
| Mood check | `smile`, `meh`, `frown` | `happy-outline` |

Tab bar order (5): Home `house`, Assess `clipboard-list`, Sounds `audio-waveform`, Mind `brain`, Progress `trending-up`. Sleep, Education and Settings live in Home cards / Profile sheet to keep five tabs.

---

## 5. Component inventory

All components: 44 pt minimum hit area, visible pressed state (background shift to `.700` or 8% overlay), `accessibilityRole`, and Turkish `accessibilityLabel`/`Hint`.

**Buttons**
- *Primary:* height 52, `radius.md`, bg `primary.600` (dark: `primary.300`, label `ink.dark`), label `bodyStrong` white, full-width on forms; loading state replaces label with 20 px spinner and keeps width. Disabled: `neutral.200` bg, `neutral.500` text, `accessibilityState.disabled`.
- *Secondary:* same size, transparent bg, 1.5 px `primary.600` border, `primary.700` label.
- *Ghost:* no border, `primary.600` text, used for "Daha sonra" / "Atla"; never for destructive actions.
- *Destructive (settings only):* ghost with `danger` text + confirm sheet.

**Card:** `surface.card`, `radius.lg`, padding 16, `e1`. Header row: `h2` title + optional overline; optional right-aligned icon button 44 pt. Variants: `tinted` (`surface.tinted`, no shadow) for programme items; `outlined` for dark mode.

**Severity badge** (THI/TFI bands). Pill, `radius.full`, `caption` 600, 8×12 padding, dot 8 px left. Colours chosen so each step is distinguishable by lightness and hue for colour-blind users; labels always accompany colour.

| Band | TR label | Text | Background (light) | Dark |
|---|---|---|---|---|
| None / slight | Yok / Çok hafif | `#1F7A4D` | `#E3F5EA` | `#7FD1A6` on `#0F2B20` |
| Mild | Hafif | `#0E6B75` | `#E0F2F3` | `#5FBFC4` on `#0F2B30` |
| Moderate | Orta | `#8A6320` | `#FBF1DC` | `#E3C285` on `#2E2410` |
| Severe | Şiddetli | `#A8451A` | `#FCE8DC` | `#F4A27B` on `#331A10` |
| Catastrophic | Çok şiddetli | `#8F1D14` | `#FBE2DF` | `#F5A09A` on `#331512` |

**Questionnaire item.** One item per screen (reduces cognitive load for anxious users; supports font scaling). Layout: overline "SORU 4 / 25" + thin progress bar; stem in `h3`; options as full-width radio cards 56 pt tall, 8 pt gap, `radius.md`, border `border.default`, selected: `primary.50` bg + 2 px `primary.600` border + check icon. Formats: *Likert 0–4* (TFI: "Hiç" … "Çok fazla" with numeric anchors shown small), *0/2/4* (THI: "Hayır (0)", "Bazen (2)", "Evet (4)"). Auto-advance after 350 ms on select, with "Geri" ghost button always present; a "Yanıtı değiştir" affordance in review. Never a timer.

**Slider (pitch / loudness).** Track 6 px, `neutral.200`; filled `primary.600`; thumb 28 px white with 2 px primary border and `e2`; large `numeric` readout above ("4 000 Hz", "42 dB HL"). Coarse/fine toggle; ± stepper buttons (44 pt) at each end for users who cannot drag precisely; `accessibilityRole="adjustable"` with `accessibilityActions` increment/decrement. Pitch slider is logarithmic (250 Hz–12 kHz). Loudness slider warns with `warning` tint above 80 dB and hard-caps.

**Circular play control.** 88 pt diameter (72 in mini-player), `primary.600` fill, white 36 px `play`/`pause` glyph, `e3`. An outer 4 px ring shows timer progress. Long-press opens the mixer. In night mode the fill drops to `primary.800` with `primary.300` glyph.

**Progress ring.** 120 pt, stroke 10, track `primary.100`, fill `primary.600` (dark `primary.300`), centre `numeric` + caption ("3/5 görev"). Animates 600 ms ease-out on mount; static when reduced motion.

**Weekly programme timeline.** Horizontal row of 7 day pills (40×56): today outlined, done = filled `primary.600` with check, missed = `neutral.200` hollow (never red — missing a day is not a failure state), future = dashed border. Below, vertical task list with left connector line.

**Streak / adherence widget.** Avoids guilt mechanics: shows "Bu hafta 4 gün" with `accent.100` bg and `flame` icon in `accent.700`; copy references consistency, not streak loss. No counter resets displayed as zero in red.

**Red-flag alert banner.** Full-width, `danger` bg `#B42318` (dark `#331512` with `#F5A09A` text and 1 px `#F5A09A` border), white `triangle-alert`, `bodyStrong` headline, `bodySmall` explanation, two buttons: primary white "Ne yapmalıyım?" and ghost "Anladım". Persists at top of Home until acknowledged; `accessibilityLiveRegion="assertive"`. Used only for: sudden/unilateral hearing loss, pulsatile tinnitus, tinnitus with vertigo/neurological signs, severe distress / self-harm ideation (PHQ-style item). For self-harm: shows the national line (Turkey: 112 / ALO 183 as applicable) and dials with one tap.

**Evidence-badge chip.** `secondary.100` bg, `secondary.700` text, `badge-check` 14 px, `caption`. Variants: "RKÇ destekli" (RCT-supported), "Kılavuz önerisi" (Guideline-recommended, e.g. AAO-HNS 2014 / ESIT / NICE NG155), "Uzman görüşü" (Expert opinion — rendered in `neutral` so the hierarchy is honest). Tap opens a sheet with the citation (authors, year, journal, DOI link) and a one-sentence plain-language summary. Never shown without a tappable source.

**Disclaimer footer.** `bodySmall` `neutral.600` on `neutral.100`, 16 padding, `radius.sm`, `info` icon; appears at the bottom of every results screen and the Education article body, and once in onboarding consent. Fixed wording (section 7). Not dismissable on results screens.

**Bottom tab bar.** 5 tabs, height 56 + safe area, `surface.card` with top `border.default`; active = `primary.600` icon + `caption` 600 label; inactive `neutral.500` icon (3:1 OK for icon) + `neutral.600` label. Labels always visible (older users rely on them); at ≥160% font scale labels collapse and `accessibilityLabel` carries meaning. A 6 px `danger` dot on Home when a red-flag banner is unread.

**Onboarding carousel.** 3 cards + consent. Each: illustration (flat, two-tone teal/sand, no faces), `h1`, `body`, page dots 8 px (`primary.600` active), persistent "Atla" ghost top-right, primary "Devam" bottom. Swipe + buttons both work.

**Empty states.** Icon in `primary.100` circle 72 pt, `h3`, `body` one sentence, one primary action. Copy always says what will appear here and the first step ("Henüz değerlendirme yok. İlk değerlendirme 5 dakika sürer.").

**Loading / skeletons.** Skeleton blocks `neutral.100` (dark `#1A3139`) with 1.2 s shimmer (`primary.50` highlight); shimmer disabled under reduced motion (static blocks). Full-screen loaders never used; spinners only inside buttons or list footers. Audio buffering shows a thin indeterminate bar under the play control.

**Mood check (Home).** Three 56 pt circular icon buttons (`frown`/`meh`/`smile`) with labels "Zor", "Orta", "İyi"; optional 0–10 loudness and annoyance sliders revealed after tap. Takes < 10 s.

---

## 6. Screen-by-screen UX flow

### 6.1 Onboarding (3 + consent)
1. **"Tinnitusu anlamak"** — illustration of the horizon mark; `h1` "Tinnitus yaygındır ve yönetilebilir"; `body` one sentence that it affects ~10–15% of adults; evidence chip "Kılavuz önerisi". Purpose: normalise.
2. **"Ne yapacağız"** — three icon rows: Değerlendir (clipboard), Dinle (waveform), Öğren ve uygula (brain). `body`: "Önce durumunuzu ölçeriz, sonra size uygun bir program öneririz."
3. **"Sizinle birlikte"** — shows the Progress chart silhouette; `body`: "İlerlemenizi birlikte izleriz; verileriniz cihazınızda kalır."
4. **Consent & disclaimer** — full-screen, scrollable, `h1` "Başlamadan önce"; three checkboxes (56 pt rows): (a) "Bu uygulamanın tıbbi tanı koymadığını anladım", (b) "Gizlilik politikasını okudum" (link), (c) optional "Anonim kullanım verisi paylaşımı". Primary "Kabul ediyorum ve başla" enabled only after (a)+(b). Then language (TR/EN), headphone check (plays a 1 kHz tone L/R and asks which side — doubles as device check), and notification permission with a pre-permission explainer.

### 6.2 Home dashboard
Top: greeting + date (`h1` "Günaydın, Ayşe"), optional red-flag banner. Then **"Bugünün programı"** card: progress ring (3/5), task list with checkmarks, primary "Devam et". Below: **"Hızlı ses"** compact card with 72 pt play control and the last-used sound name + timer chip. **"Nasılsınız?"** mood-check row. Then a **"Haftalık özet"** tinted card (adherence, TFI trend arrow). Finally an Education teaser card with evidence chip. Everything above the fold is one task: continue the programme.

### 6.3 Assessment hub
List of assessment cards with status (Yapılmadı / Tamamlandı 3 gün önce / Yenile önerilir), estimated minutes and an evidence chip:
- **THI** (25 items, 0/2/4) — "Kılavuz önerisi"
- **TFI** (25 items, 0–10 scaled to Likert cards) — "RKÇ destekli"
- **İşitme taraması** — headphones required banner; pure-tone screening at 500/1k/2k/4k Hz; result is screening only, with explicit "Odyometri yerine geçmez".
- **Perde eşleme (pitch match)** — slider + "Benzer / Daha tiz / Daha pes" buttons; 2-AFC octave-confusion check.
- **Gürlük eşleme** — loudness slider at matched pitch; readout dB SL.
- **Minimum maskeleme düzeyi (MML)** — broadband noise ramp; "Artık duymuyorum" button.
- **Rezidüel inhibisyon** — 60 s noise at MML+10 dB then timer "Tinnitus geri döndü" button; result in seconds + category (tam/kısmi/yok).
- **Kırmızı bayrak taraması** — 6 yes/no items; any yes routes to the alert flow before continuing.
Flow: hub → intro card (what/why/how long, headphone check) → items → completion sheet (confetti forbidden; a calm check animation) → results.

### 6.4 Results / Profile report
Hero: semicircular **severity gauge** (180°, five colour bands as in section 5, needle animates 800 ms) with `display` score and severity badge; below, one-sentence framing: "Bu puan sizin algıladığınız etkiyi gösterir; bir tıbbi tanı değildir." **Subtype chips** (Tonal 4 kHz · Tek taraflı · Uyku etkili · Hiperakuzi şüphesi) with info sheets. **"Önerilen yol"** card: programme name, weeks, 3 bullet rationale, evidence chip. **"Doktorunuza söyleyebilecekleriniz"** card: auto-generated plain summary (duration, side, pitch, THI/TFI, red flags, sleep impact) with "Kopyala" and "PDF olarak paylaş". Disclaimer footer. Compare-with-previous row if ≥2 results.

### 6.5 Program
Week selector (segmented, "1. Hafta … 8. Hafta"), weekly timeline component, then daily task cards: each has icon, title, minutes, type chip (Ses / Zihin / Eğitim / Egzersiz), and a primary "Başla". Completed tasks collapse with a check. A "Bu hafta neden bunlar?" ghost link opens the rationale with citations. Missed days produce a gentle "Kaldığınız yerden devam edin" card, never a red streak.

### 6.6 Sound Lab
Top segmented control: Gürültü · Çentikli · Ton · Doğa · Karışım. Sound list as cards with waveform thumbnail, name, and "Önerilen" chip (based on pitch match for notched). Tapping opens the full player: large 88 pt play control, sound name, `numeric` timer, horizontal volume slider with hearing-safety cap, **mixer** (up to 3 layers, each with volume slider and mute), **timer** chips (15/30/45/60 dk, Sabaha kadar with fade-out), "Uyku moduna geç" toggle (night theme + screen dim). Notched noise shows the notch centre (from pitch match) and a "Yeniden eşle" link. Background audio and lock-screen controls required.

### 6.7 Mind
Module list (CBT): Tinnitus ve beyin · Dikkat ve alışma · Düşünce kayıtları · Kaçınmayı azaltma · Uyku için BDT. Each module card: progress bar, sessions count, evidence chip. **Mindfulness sessions** as audio cards (5/10/20 dk) with the play control. **Düşünce kaydı** (thought record) form: situation → thought → emotion (0–100 slider) → evidence for/against → balanced thought; saved entries listed with date; large text areas, autosave.

### 6.8 Sleep
Automatically night-themed. Three cards: "Uyku sesi" (direct to player with sleep timer), "Nefes egzersizi" (breathing animation, section 8), "Uyku günlüğü" (bedtime, wake time, awakenings — three steppers). A wind-down routine checklist. Minimum chrome; all text `neutral.300`.

### 6.9 Progress
Segmented range (4 hafta · 3 ay · 1 yıl). Charts: **TFI/THI over time** line chart with severity band shading in the background (very low alpha of the badge backgrounds); **daily loudness & annoyance** dual-line with 7-day moving average; **adherence** bar per week; **sleep** stacked bars. Chart colours: TFI `primary.600`, THI `secondary.500`, loudness `accent.700`, annoyance `#A8451A`. Each chart has a `caption` "Nasıl yorumlanır?" link and a text summary for screen readers ("Son 4 haftada TFI 52'den 44'e düştü"). Export CSV from here.

### 6.10 Education
Library grouped by topic (Temeller · Ses terapisi · BDT · Uyku · İşitme sağlığı · Ne zaman doktora gitmeli). Article cards with reading time and evidence chip. Article view: `h1`, author/reviewer line ("Gözden geçiren: KBB uzmanı, Ekim 2026"), `body` 17/26, pull-quote style key-takeaway box in `surface.tinted`, inline citation numbers that open a sheet, "Kaynaklar" list at the end, disclaimer footer. Font size control in header.

### 6.11 Settings
Grouped list: Dil (TR/EN) · Hatırlatıcılar (time pickers, per-type toggles) · Görünüm (Sistem/Açık/Koyu, Gece modu saatleri, Hareketi azalt mirrors OS) · Ses güvenliği (max output cap) · Verilerim (export PDF/CSV, delete all with confirm) · Gizlilik (policy, consent review) · Hakkında (version, evidence & sources, regulatory statement, contact). Destructive actions at the bottom in `danger` ghost.

---

## 7. Microcopy guidance (Turkish)

**Tone:** Warm, clear, non-alarming, professional. Use "siz" (formal), short sentences, no exclamation marks, no medical promises, no emojis. Name the limits of the app proactively. Prefer verbs over nouns in buttons ("Başla", "Devam et", "Kaydet").

| Moment | Copy |
|---|---|
| Results framing (mandatory) | "Bu sonuç bir tıbbi tanı değildir. Tinnitusun sizi nasıl etkilediğini anlamanıza ve doktorunuzla konuşmanıza yardımcı olmak için hazırlanmıştır." |
| High severity | "Puanınız tinnitusun hayatınızı belirgin şekilde etkilediğini gösteriyor. Bu durum yönetilebilir; bir KBB uzmanı veya odyologla görüşmenizi öneririz." |
| Red flag — hearing | "Ani veya tek taraflı işitme kaybı belirttiniz. Bu, en kısa sürede bir KBB uzmanı tarafından değerlendirilmelidir. Uygulamayı kullanmaya devam edebilirsiniz, ancak lütfen önce randevu alın." |
| Red flag — distress | "Zor bir dönemden geçiyor olabilirsiniz. Yalnız değilsiniz. Şu anda konuşmak isterseniz 112'yi arayabilirsiniz." + "Ara" button |
| Encouragement | "Bu hafta 4 gün programa devam ettiniz. Düzenlilik, alışma sürecinin en önemli parçasıdır." |
| Missed days | "Bir süre ara vermişsiniz. Kaldığınız yerden devam edebilirsiniz; hiçbir şey kaybolmadı." |
| Empty state | "Henüz kayıt yok. İlk değerlendirme yaklaşık 5 dakika sürer." |
| Loading audio | "Ses hazırlanıyor…" |
| Headphone check | "En doğru sonuç için kulaklık takın ve sessiz bir ortamda olun." |
| Loudness cap | "Güvenliğiniz için ses düzeyi sınırlandırıldı." |
| Evidence chip sheet | "Bu yöntem, 2019 tarihli randomize kontrollü bir çalışmada tinnitus şiddetini azaltmada etkili bulunmuştur. Kaynak: …" |
| Consent | "Verileriniz cihazınızda saklanır. İzniniz olmadan paylaşılmaz." |

**Words to avoid:** "tedavi eder", "iyileştirir", "kesin", "garanti", "sessizlik vaat", "hasta" (use "kullanıcı" or "siz"), "test sonucunuz kötü".

**Accessibility labels (examples):**
- Play control: `accessibilityLabel="Sesi oynat"` / "Sesi duraklat"; `accessibilityHint="Çift dokunarak başlatın. Uzun basınca karıştırıcı açılır."`
- Severity badge: "Şiddet düzeyi: Orta. THI puanı 42."
- Progress ring: "Bugünkü görevler: beşte üç tamamlandı."
- Pitch slider: `accessibilityRole="adjustable"`, `accessibilityValue={{ text: "4000 hertz" }}`.
- Red-flag banner: `accessibilityRole="alert"`, label begins with "Önemli uyarı:".
- Tab: "Ana sayfa, sekme 1 / 5".
- Chart: `accessibilityLabel` carries the text summary; the chart itself `accessible={false}` with the summary in a sibling view.
- Evidence chip: "Kanıt düzeyi: randomize kontrollü çalışma ile desteklenir. Kaynağı görmek için dokunun."

---

## 8. Motion

**Principles:** Motion explains, never decorates. Durations 150–300 ms for UI, up to 800 ms for data reveals (gauge, charts). Easing `easeOut` (cubic-bezier 0.2, 0, 0, 1) for entering, `easeIn` for exits. All motion checks `AccessibilityInfo.isReduceMotionEnabled` (and the in-app "Hareketi azalt" toggle): under reduced motion, transitions become 120 ms crossfades, rings and gauges render at final value, shimmer is static, and the breathing exercise switches to a text-and-haptic cadence.

| Element | Spec |
|---|---|
| Screen push | 250 ms slide 24 px + fade (native stack default) |
| Bottom sheet | 300 ms spring (damping 0.85) |
| Button press | scale 0.98, 100 ms |
| Questionnaire auto-advance | 350 ms delay, 200 ms crossfade |
| Progress ring / gauge | 600–800 ms ease-out from 0 |
| Chart line draw | 600 ms, left-to-right mask |
| Play → pause | glyph crossfade 150 ms; ring begins ticking |
| Completion | single check-mark stroke, 400 ms; no confetti |

### Breathing animation (relaxation / Sleep)
A 160 pt circle, `primary.100` fill with a `primary.300` 2 px ring, over a soft radial glow (`primary.50` → transparent). Scale 1.0 → 1.6 on inhale, hold, 1.6 → 1.0 on exhale, with the label (`h2`) and remaining seconds (`numeric` 28). Patterns, user-selectable, default **4-4-6** (gentler for beginners and older users; 4-7-8 offered as "İleri"):

| Phase | 4-4-6 | 4-7-8 | Label (TR) | Haptic |
|---|---|---|---|---|
| Inhale | 4 s, easeInOut, scale 1→1.6 | 4 s | "Nefes al" | light tick at start |
| Hold | 4 s, scale 1.6 steady, ring pulses opacity 0.6→1 | 7 s | "Tut" | none |
| Exhale | 6 s, easeInOut, scale 1.6→1 | 8 s | "Nefes ver" | light tick at start |

Default session: 6 cycles (≈1.5–2 min), configurable up to 10 min; optional 60 bpm low pad audio. Reduced-motion variant: circle static; text and a horizontal progress bar indicate phase; haptics mark transitions. Voice-over reads each phase label via `accessibilityLiveRegion="polite"`. Night mode dims the glow to 40% opacity.

---

## 9. Implementation notes
- Tokens live in `src/theme/tokens.ts` as `light`, `dark`, `night` objects; components consume via a `useTheme()` hook; no raw hex in components.
- Use `react-native-reanimated` for the ring, gauge and breathing circle; guard with `useReducedMotion()`.
- Charts: `victory-native` or `react-native-gifted-charts`, with the colour mapping from section 6.9 and the sibling text summary.
- Expo audio: `expo-av` with background mode and `staysActiveInBackground`; respect the output cap from Settings.
- Localisation: `i18n-js` with `tr` as default; all plurals and date formats via `Intl` (`tr-TR`).
- Test matrix: font scale 100/130/200%, VoiceOver and TalkBack on each assessment flow, dark + night themes, colour-blind simulation on severity bands.

### Sources consulted
- W3C, What's New in WCAG 2.2 (target size 2.5.8 minimum 24×24; focus not obscured) — w3.org/WAI/standards-guidelines/wcag/new-in-22
- Deque, What WCAG 2.2 Means for Native Mobile Accessibility — deque.com/blog/what-wcag-2-2-means-for-native-mobile-accessibility
- Kalmeda Gebrauchsanweisung & study report (CE-marked CBT tinnitus DiGA; therapy plan, progress, reminders, knowledge library) — kalmeda.de
- Oto / DEFINE trial registration (CBT + education + mindfulness; ~6 weeks, 4–5 sessions/week; audio-led sessions) — isrctn.com/ISRCTN99577932; clinicaltrials.gov NCT06623123
- Healthcare app trust design (clear "when to see a doctor" guidance, plain professional language, functionality before ornament) — thisisglance.com; weareaffective.com; medcitynews.com (2026)
- Healthcare palette & calm-UX guidance (teal primary on warm neutrals, red reserved for alerts, muted tones, navy night themes) — inspoai.io; raw.studio
- Apple HIG summaries (Dynamic Type, Reduce Motion alternatives, semantic colours) — various HIG foundation summaries
- Expo, Moving away from @expo/vector-icons (June 2026) — expo.dev/blog; Lucide React Native optimisation guide — lucide.dev
