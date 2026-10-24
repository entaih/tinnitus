import React, { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { Check, Square, SquareCheck } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Banner } from '@/components/Banner';
import { Stepper } from '@/components/Stepper';
import { useLocale, useT } from '@/i18n';
import type { L } from '@/content/modules';

/** 0–N slider with label and large readout (shared by exposure, thought record). */
export function SliderRow({ label, value, onChange, max = 10, step = 1, low, high }: { label: string; value: number; onChange: (v: number) => void; max?: number; step?: number; low?: string; high?: string }) {
  const { colors, space } = useTheme();
  const t = useT();
  return (
    <View style={{ gap: space[1] }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text variant="bodyStrong" style={{ flex: 1 }}>{label}</Text>
        <Text variant="h2">{value}</Text>
      </View>
      <Slider
        minimumValue={0} maximumValue={max} step={step} value={value} onValueChange={(v: number) => onChange(Math.round(v))}
        minimumTrackTintColor={colors.primary} maximumTrackTintColor={colors.border} thumbTintColor={colors.primary}
        accessibilityLabel={label} accessibilityValue={{ text: t('thought.a11y.value', { label, v: value }) }}
      />
      {(low || high) ? (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="caption" tone="secondary">{low}</Text>
          <Text variant="caption" tone="secondary">{high}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** Multiline input with a label and optional hint; large tap target, grows with content. */
export function TextArea({ label, hint, value, onChange, placeholder, minHeight = 96 }: { label: string; hint?: string; value: string; onChange: (v: string) => void; placeholder?: string; minHeight?: number }) {
  const { colors, radius, space } = useTheme();
  return (
    <View style={{ gap: space[1] }}>
      <Text variant="bodyStrong">{label}</Text>
      {hint ? <Text variant="caption" tone="secondary">{hint}</Text> : null}
      <TextInput
        multiline value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.textMuted}
        accessibilityLabel={label} textAlignVertical="top"
        style={{ minHeight, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: space[3], backgroundColor: colors.card, color: colors.text, fontSize: 17, lineHeight: 24 }}
      />
    </View>
  );
}

/** Worksheet: one text area per prompt; onSave receives the answers in prompt order. */
export function Worksheet({ items, onSave }: { items: L[]; onSave: (answers: string[]) => void }) {
  const { space } = useTheme();
  const t = useT();
  const locale = useLocale();
  const [answers, setAnswers] = useState<string[]>(() => items.map(() => ''));
  const [saved, setSaved] = useState(false);
  return (
    <View style={{ gap: space[4] }}>
      {items.map((it, i) => (
        <TextArea key={i} label={it[locale]} value={answers[i]} placeholder={t('module.worksheet.placeholder')} onChange={(v) => { setSaved(false); setAnswers((a) => a.map((x, j) => (j === i ? v : x))); }} />
      ))}
      <Text variant="caption" tone="secondary">{t('module.worksheet.hint')}</Text>
      <Button variant={saved ? 'secondary' : 'primary'} title={saved ? t('module.worksheet.saved') : t('common.save')} disabled={!answers.some((a) => a.trim())} onPress={() => { onSave(answers); setSaved(true); }} />
    </View>
  );
}

/** Checklist with 44pt rows; reports checked indexes. */
export function Checklist({ items, onChange }: { items: L[]; onChange?: (checked: boolean[]) => void }) {
  const { colors, space } = useTheme();
  const t = useT();
  const locale = useLocale();
  const [checked, setChecked] = useState<boolean[]>(() => items.map(() => false));
  const done = checked.filter(Boolean).length;
  return (
    <View style={{ gap: space[2] }}>
      <Text variant="caption" tone="secondary">{t('module.checklist.hint')}</Text>
      {items.map((it, i) => {
        const on = checked[i];
        return (
          <Pressable key={i} accessibilityRole="checkbox" accessibilityState={{ checked: on }}
            onPress={() => { void Haptics.selectionAsync(); setChecked((c) => { const n = c.map((x, j) => (j === i ? !x : x)); onChange?.(n); return n; }); }}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'flex-start', gap: space[3], minHeight: 48, paddingVertical: space[2], opacity: pressed ? 0.7 : 1 })}>
            {on ? <SquareCheck size={26} color={colors.primary} /> : <Square size={26} color={colors.borderStrong} />}
            <Text variant="body" style={{ flex: 1, opacity: on ? 0.65 : 1, textDecorationLine: on ? 'line-through' : 'none' }}>{it[locale]}</Text>
          </Pressable>
        );
      })}
      <Text variant="caption" tone="primary">{t('module.checklist.progress', { done, total: items.length })}</Text>
    </View>
  );
}

/** Exposure practice: before rating → focused listening timer (5–15 min) → after rating. */
export function ExposurePractice({ defaultMinutes = 5, onFinish }: { defaultMinutes?: number; onFinish: (r: { before: number; after: number; minutes: number }) => void }) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const [phase, setPhase] = useState<'before' | 'listening' | 'after' | 'done'>('before');
  const [before, setBefore] = useState(5);
  const [after, setAfter] = useState(5);
  const [minutes, setMinutes] = useState(Math.min(15, Math.max(5, defaultMinutes)));
  const [remaining, setRemaining] = useState(0);
  const iv = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => { if (iv.current) clearInterval(iv.current); iv.current = null; };
  React.useEffect(() => stop, []);

  const start = () => {
    setRemaining(minutes * 60); setPhase('listening');
    stop();
    iv.current = setInterval(() => setRemaining((r) => {
      if (r <= 1) { stop(); void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setPhase('after'); return 0; }
      return r - 1;
    }), 1000);
  };
  const mm = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (phase === 'before') return (
    <View style={{ gap: space[4] }}>
      <Text variant="bodySmall" tone="secondary">{t('module.exposure.hint')}</Text>
      <SliderRow label={t('module.exposure.before')} value={before} onChange={setBefore} />
      <Stepper label={t('module.exposure.minutes')} value={minutes} onChange={setMinutes} min={5} max={15} step={1} format={(v) => t('common.minutes', { n: v })} />
      <Button title={t('module.exposure.start')} onPress={start} />
    </View>
  );
  if (phase === 'listening') return (
    <View style={{ gap: space[4], alignItems: 'center' }}>
      <Text variant="numeric" accessibilityLiveRegion="polite">{mm(remaining)}</Text>
      <View style={{ backgroundColor: colors.tinted, borderRadius: radius.lg, padding: space[4] }}>
        <Text variant="body" center>{t('module.exposure.listening')}</Text>
      </View>
      <Button variant="ghost" title={t('module.exposure.finish')} onPress={() => { stop(); setPhase('after'); }} />
    </View>
  );
  if (phase === 'after') return (
    <View style={{ gap: space[4] }}>
      <SliderRow label={t('module.exposure.after')} value={after} onChange={setAfter} />
      <Button title={t('common.save')} onPress={() => { setPhase('done'); onFinish({ before, after, minutes: Math.max(1, Math.round((minutes * 60 - remaining) / 60)) }); }} />
    </View>
  );
  const drop = before - after;
  return (
    <View style={{ gap: space[2] }}>
      <Text variant="h3">{t('module.exposure.result', { b: before, a: after })}</Text>
      <Text variant="body" tone={drop > 0 ? 'success' : 'secondary'}>{drop > 0 ? t('module.exposure.drop', { n: drop }) : t('module.exposure.noDrop')}</Text>
    </View>
  );
}

/** Sleep-window calculator (Marks 2023 / CBT-I): TIB = TST + 30 min, floor 5.5 h; titration advice from efficiency. */
export function SleepWindowCalc({ diaryAvgMinutes, onSave }: { diaryAvgMinutes?: number; onSave: (r: { tstMin: number; tibMin: number; riseHour: number; riseMin: number; bedHour: number; bedMin: number; efficiency: number }) => void }) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const [tstH, setTstH] = useState(diaryAvgMinutes ? Math.floor(diaryAvgMinutes / 60) : 6);
  const [tstM, setTstM] = useState(diaryAvgMinutes ? Math.round((diaryAvgMinutes % 60) / 15) * 15 % 60 : 0);
  const [riseH, setRiseH] = useState(7);
  const [riseM, setRiseM] = useState(0);
  const [eff, setEff] = useState(80);
  const [saved, setSaved] = useState(false);

  const calc = useMemo(() => {
    const tst = tstH * 60 + tstM;
    let tib = tst + 30;
    const floored = tib < 330;
    if (floored) tib = 330;
    const rise = riseH * 60 + riseM;
    const bed = ((rise - tib) % 1440 + 1440) % 1440;
    return { tst, tib, floored, bedH: Math.floor(bed / 60), bedM: bed % 60 };
  }, [tstH, tstM, riseH, riseM]);
  const pad = (n: number) => String(n).padStart(2, '0');
  const advice = eff >= 85 ? t('module.sleepWindow.adviceUp') : eff >= 80 ? t('module.sleepWindow.adviceKeep') : t('module.sleepWindow.adviceDown');

  return (
    <View style={{ gap: space[4] }}>
      <Banner tone="warning" title={t('module.kind.warning')} body={t('module.sleepWindow.warning')} />
      {diaryAvgMinutes ? <Text variant="caption" tone="secondary">{t('module.sleepWindow.fromDiary', { h: Math.floor(diaryAvgMinutes / 60), m: Math.round(diaryAvgMinutes % 60) })}</Text> : null}
      <Text variant="bodyStrong">{t('module.sleepWindow.tst')}</Text>
      <Stepper label={t('sleep.diary.hour')} value={tstH} onChange={setTstH} min={3} max={10} />
      <Stepper label={t('sleep.diary.minute')} value={tstM} onChange={setTstM} min={0} max={45} step={15} format={pad} />
      <Text variant="bodyStrong">{t('module.sleepWindow.rise')}</Text>
      <Stepper label={t('sleep.diary.hour')} value={riseH} onChange={setRiseH} min={0} max={23} format={pad} />
      <Stepper label={t('sleep.diary.minute')} value={riseM} onChange={setRiseM} min={0} max={45} step={15} format={pad} />
      <Stepper label={t('module.sleepWindow.efficiency')} value={eff} onChange={(v) => { setEff(v); setSaved(false); }} min={50} max={100} step={5} format={(v) => `${v}%`} />

      <View style={{ backgroundColor: colors.tinted, borderRadius: radius.lg, padding: space[4], gap: space[2] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="body">{t('module.sleepWindow.tib')}</Text>
          <Text variant="h3">{Math.floor(calc.tib / 60)} {t('sleep.diary.h')} {calc.tib % 60} {t('sleep.diary.min')}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="body">{t('module.sleepWindow.bed')}</Text>
          <Text variant="h2">{pad(calc.bedH)}:{pad(calc.bedM)}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="body">{t('module.sleepWindow.rise')}</Text>
          <Text variant="h2">{pad(riseH)}:{pad(riseM)}</Text>
        </View>
        {calc.floored ? <Text variant="caption" tone="warning">{t('module.sleepWindow.floor')}</Text> : null}
        <Text variant="bodySmall" tone="primary">{advice}</Text>
      </View>
      <Button variant={saved ? 'secondary' : 'primary'} title={saved ? t('module.sleepWindow.saved') : t('module.sleepWindow.save')}
        onPress={() => { onSave({ tstMin: calc.tst, tibMin: calc.tib, riseHour: riseH, riseMin: riseM, bedHour: calc.bedH, bedMin: calc.bedM, efficiency: eff }); setSaved(true); }} />
    </View>
  );
}

/** Five-rung exposure hierarchy: editable labels + anxiety 0–100; sorted on save. */
export function HierarchyBuilder({ examples, onSave }: { examples: L[]; onSave: (items: { label: string; score: number }[]) => void }) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const [items, setItems] = useState(() => Array.from({ length: 5 }, (_, i) => ({ label: examples[i]?.[locale] ?? '', score: 20 + i * 15 })));
  const [saved, setSaved] = useState(false);
  const set = (i: number, patch: Partial<{ label: string; score: number }>) => { setSaved(false); setItems((a) => a.map((x, j) => (j === i ? { ...x, ...patch } : x))); };
  return (
    <View style={{ gap: space[4] }}>
      <Text variant="bodySmall" tone="secondary">{t('module.hierarchy.hint')}</Text>
      {items.map((it, i) => (
        <View key={i} style={{ gap: space[2], padding: space[3], borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.card }}>
          <Text variant="caption" tone="secondary">{t('module.hierarchy.item', { n: i + 1 })}</Text>
          <TextInput value={it.label} onChangeText={(v) => set(i, { label: v })} accessibilityLabel={t('module.hierarchy.item', { n: i + 1 })} placeholderTextColor={colors.textMuted}
            style={{ minHeight: 44, color: colors.text, fontSize: 17, borderBottomWidth: 1, borderBottomColor: colors.border, paddingVertical: space[2] }} />
          <SliderRow label={t('module.hierarchy.score')} value={it.score} onChange={(v) => set(i, { score: v })} max={100} step={5} />
        </View>
      ))}
      {saved ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
          <Check size={18} color={colors.success} />
          <Text variant="bodySmall" tone="success">{t('module.hierarchy.sorted')}</Text>
        </View>
      ) : null}
      <Button variant={saved ? 'secondary' : 'primary'} title={saved ? t('module.hierarchy.saved') : t('module.hierarchy.save')} disabled={!items.some((x) => x.label.trim())}
        onPress={() => { const sorted = [...items].filter((x) => x.label.trim()).sort((a, b) => a.score - b.score); setItems((prev) => [...sorted, ...prev.filter((x) => !x.label.trim())]); onSave(sorted); setSaved(true); }} />
    </View>
  );
}
