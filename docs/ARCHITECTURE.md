# Dingin — architecture & conventions

Dingin is an Expo SDK 57 / React Native 0.86 / Expo Router app that must run inside **Expo Go** (no custom native modules).
Primary language Turkish, English supported. Design tokens come from `docs/DESIGN.md` (teal/sand "quiet authority" palette).

## Layout
```
app/                     expo-router routes (screens only; no business logic)
  _layout.tsx            providers (gesture, safe-area, ThemeProvider) + root Stack
  (tabs)/                5 tabs: index (Home), assess, sound, mind, progress
  assess/…               triage, history, questionnaire/[id], hearing, pitch, loudness, mml, ri, results
  sound/…                player, mixing-point
  mind/[module].tsx      CBT / ACT / mindfulness / CBT-I / hyperacusis modules (content-driven)
  exercise/[id].tsx      somatic exercises; exercise/breathing, exercise/pmr (animated)
  education/[slug].tsx   articles with citations
  program/…, sleep/…, diary.tsx, settings.tsx, onboarding.tsx
src/
  theme/                 tokens.ts (colours/type/space), ThemeProvider (useTheme())
  components/            shared UI: Text, Screen, Button, Card, Chip/EvidenceChip/SeverityBadge, ProgressRing, Banner, Disclaimer, OptionCard, Stepper, PlayControl, Row/SectionHeader
  i18n/                  useT() → t('key', {params}); strings in tr.ts/en.ts + areas/{core,assess,psycho,sound,mind}.ts
  store/                 zustand + AsyncStorage: settings.ts, clinical.ts (assessments, diary, thoughts, sessions, program)
  clinical/              types.ts, questionnaires.ts (THI, HQ, PHQ9, GAD7, SCI, RASST), engine.ts (triage + profile), program.ts (generator)
  audio/                 dsp.ts (pure TS DSP), sounds.ts (SoundSpec → PCM), engine.ts (expo-audio player: soundEngine, playBurst)
  content/               registry.ts (schedulable units), citations.ts (evidence), modules.ts, exercises.ts, articles.ts
  hooks/                 useProfile(), useAssessmentId(), useIsNightWindow()
```

## Conventions
- Import with `@/…` alias. Screens use `<Screen>` and the shared components; **no raw hex** — use `useTheme().colors`.
- All user-facing strings go through `useT()`; add keys to your area file under `src/i18n/areas/<area>.ts` in BOTH `tr` and `en`. Turkish first, formal "siz", no exclamation marks, no promises ("tedavi eder", "iyileştirir" are banned).
- Every clinical claim shown to the user carries an `<EvidenceChip level=… onPress={() => openCitation(id)} />` that resolves through `src/content/citations.ts`. Use `CitationSheet` (`src/components/CitationSheet.tsx`) to show it.
- Results and education screens end with `<Disclaimer />`.
- Minimum tap target 44pt; `accessibilityLabel` on icon-only controls; respect `useSettings().reduceMotion`.
- Audio: `soundEngine.play(spec, {id, volume})`, `soundEngine.stop(id)`, `soundEngine.setTimer(min)`, `playBurst(freq, {ms, levelDb})`. Cap volume with `useSettings().maxVolume`. Call `useKeepAwake()` on screens that play for long (Android Expo Go stops background audio after ~3 min with screen off; iOS keeps playing).
- Persist clinical data only via `useClinical` actions. Never store PII beyond the display name.
- Typecheck with `npx tsc --noEmit`; tests with `npm test`.
