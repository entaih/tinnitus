import React, { useState } from 'react';
import { Linking, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight, ReduceMotion } from 'react-native-reanimated';
import { ArrowRight, CalendarDays, Clock, Ear, Headphones, Moon, Phone, Sparkles, Stethoscope, Volume2, Activity, FileText } from 'lucide-react-native';
import { Screen, Text, Button } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { REFERRAL } from '@/clinical/journey';
import { diagnosisActions, type Diagnosis } from '@/clinical/diagnosis';
import type { Assessment, Profile } from '@/clinical/types';
import type { SeverityBand } from '@/theme/tokens';
import type { ProgramGate } from './programGate';

type StepId = 'score' | 'doctor' | 'cause' | 'program';
const WHEN_ORDER = ['now', 'h24', 'w2', 'routine'] as const;
type When = (typeof WHEN_ORDER)[number];

/** The single most urgent referral among the triage reasons (null when self-care only). */
export function topReferral(reasons: string[]): { reason: string; who: string; when: When } | null {
  let best: { reason: string; who: string; when: When } | null = null;
  for (const r of reasons) {
    const ref = REFERRAL[r];
    if (!ref || ref.when === 'none') continue;
    const when = ref.when as When;
    if (!best || WHEN_ORDER.indexOf(when) < WHEN_ORDER.indexOf(best.when)) best = { reason: r, who: ref.who, when };
  }
  return best;
}

/** Up to three plain "what is in your programme" lines, from the profile drivers. */
function programParts(profile: Profile): { key: string; Icon: typeof Volume2 }[] {
  const d = profile.drivers;
  const out: { key: string; Icon: typeof Volume2 }[] = [{ key: d.includes('hyperacusis') ? 'simple.part.hyper' : 'simple.part.sound', Icon: d.includes('hyperacusis') ? Ear : Volume2 }];
  if (d.includes('insomnia')) out.push({ key: 'simple.part.sleep', Icon: Moon });
  if (d.includes('somatic')) out.push({ key: 'simple.part.somatic', Icon: Activity });
  if (d.includes('hearingLoss')) out.push({ key: 'simple.part.hearing', Icon: Headphones });
  out.push({ key: 'simple.part.mind', Icon: Sparkles });
  return out.slice(0, 3);
}

/**
 * Plain, one-message-per-screen results for first-time users (older people, people who do not like reading):
 * 1 the score in words, 2 the doctor to see and when (only if needed), 3 the likely cause in everyday words,
 * 4 the programme with one big start button. Everything technical stays on the detailed report.
 */
export function ResultsSteps({ thi, dx, assessment, profile, gate, plan, onStart, onDetails, hasProgram = false }: {
  thi: { total: number; band: SeverityBand } | null;
  dx: Diagnosis;
  assessment: Assessment;
  profile: Profile;
  gate: ProgramGate;
  plan: { weeks: number; min: number } | null;
  onStart: () => void;
  /** A programme already runs: the last step says so and the button goes to today's step. */
  hasProgram?: boolean;
  onDetails: () => void;
}) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const router = useRouter();
  const appReduceMotion = useSettings((s) => s.reduceMotion);
  const ref = topReferral(profile.triageReasons);
  const steps: StepId[] = ['score', ...(ref ? (['doctor'] as const) : []), 'cause', 'program'];
  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const next = () => setI((x) => Math.min(x + 1, steps.length - 1));
  const back = () => setI((x) => Math.max(0, x - 1));

  const band: SeverityBand = thi?.band ?? 'mild';
  const sev = colors.severity[band];
  const urgentNow = ref?.when === 'now';
  const selfHarm = profile.triageReasons.includes('triage.selfHarm');
  const primary = dx.primary;
  const causeId = primary?.id ?? 'central';
  const certainty = primary?.certainty ?? 'low';
  // Offer one optional test only while certainty is not high (less to read when it would add little).
  const action = certainty === 'high' ? undefined : diagnosisActions(dx, assessment)[0];

  // No confirmation dialog: the doctor reminder is printed on this screen, and one tap must be enough.
  const start = () => { if (!gate.blocked) onStart(); };

  const footer = step === 'program' ? (
    gate.blocked ? (
      <Button title={t('simple.blocked.cta')} onPress={() => router.replace('/(tabs)')} />
    ) : (
      <View style={{ gap: space[2] }}>
        <Button title={hasProgram ? t('simple.goToday') : t('simple.start')} icon={<ArrowRight size={20} color={colors.onPrimary} />} onPress={hasProgram ? onStart : start} />
        <Button variant="ghost" size="sm" title={t('simple.details')} icon={<FileText size={18} color={colors.primary} />} onPress={onDetails} />
      </View>
    )
  ) : (
    <View style={{ gap: space[2] }}>
      <Button title={step === 'doctor' ? t('simple.understood') : t('common.continue')} icon={<ArrowRight size={20} color={colors.onPrimary} />} onPress={next} />
      {i > 0 ? <Button variant="ghost" size="sm" title={t('common.back')} onPress={back} /> : null}
    </View>
  );

  const bigIcon = (node: React.ReactNode, bg: string) => (
    <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>{node}</View>
  );

  return (
    <Screen footer={footer}>
      {/* Progress dots: where am I, how much is left */}
      <View accessibilityRole="progressbar" accessibilityLabel={t('simple.progress', { n: i + 1, total: steps.length })} style={{ flexDirection: 'row', gap: space[2], justifyContent: 'center', paddingTop: space[2] }}>
        {steps.map((s, k) => (
          <View key={s} style={{ width: k === i ? 28 : 10, height: 10, borderRadius: 5, backgroundColor: k <= i ? colors.primary : colors.primaryTrack }} />
        ))}
      </View>

      <Animated.View key={step} entering={FadeInRight.duration(240).reduceMotion(appReduceMotion ? ReduceMotion.Always : ReduceMotion.System)} style={{ gap: space[5], paddingTop: space[4] }}>
        {step === 'score' ? (
          <>
            <Text variant="overline" tone="secondary" center>{t('simple.score.overline')}</Text>
            <View style={{ alignSelf: 'center', width: 168, height: 168, borderRadius: 84, backgroundColor: sev.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 6, borderColor: sev.text }}>
              <Text variant="h1" style={{ color: sev.text }} center>{t(`severity.${band}`)}</Text>
            </View>
            <Text variant="h1" center accessibilityRole="header">{t(`simple.score.${band}`)}</Text>
            <Text variant="body" tone="secondary" center>{t('simple.score.hope')}</Text>
            {thi ? <Text variant="caption" tone="muted" center>{t('simple.score.points', { n: thi.total })}</Text> : null}
          </>
        ) : null}

        {step === 'doctor' && ref ? (
          <>
            {bigIcon(<Stethoscope size={48} color={urgentNow ? colors.danger : colors.warning} />, urgentNow ? colors.dangerBg : colors.warningBg)}
            <Text variant="h1" center accessibilityRole="header">{t(`simple.doctor.${ref.when}`)}</Text>
            <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, padding: space[4], gap: space[3], borderWidth: 1, borderColor: colors.border }}>
              <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
                <Stethoscope size={24} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text variant="caption" tone="secondary">{t('simple.doctor.who')}</Text>
                  <Text variant="h3">{t(ref.who)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
                <Clock size={24} color={urgentNow ? colors.danger : colors.warning} />
                <View style={{ flex: 1 }}>
                  <Text variant="caption" tone="secondary">{t('simple.doctor.when')}</Text>
                  <Text variant="h3">{t(`when.${ref.when}`)}</Text>
                </View>
              </View>
            </View>
            <Text variant="bodySmall" tone="secondary" center>{t('simple.doctor.say')} {t(`${ref.reason}.say`)}</Text>
            {urgentNow ? (
              <View style={{ gap: space[2] }}>
                <Button variant="danger" title={t('triage.call112')} icon={<Phone size={20} color={colors.onPrimary} />} onPress={() => { void Linking.openURL('tel:112'); }} />
                {selfHarm ? <Button variant="secondary" title={t('triage.call183')} icon={<Phone size={20} color={colors.primaryPressed} />} onPress={() => { void Linking.openURL('tel:183'); }} /> : null}
              </View>
            ) : null}
          </>
        ) : null}

        {step === 'cause' ? (
          <>
            {bigIcon(<Ear size={48} color={colors.primary} />, colors.primarySoft)}
            <Text variant="overline" tone="secondary" center>{t('simple.cause.overline')}</Text>
            <Text variant="h1" center accessibilityRole="header">{t(`cause.${causeId}.plain`)}</Text>
            <Text variant="bodyStrong" center tone={certainty === 'high' ? 'success' : certainty === 'moderate' ? 'primary' : 'warning'}>{t(`simple.cause.certainty.${certainty}`)}</Text>
            {action ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t('simple.cause.raise')} ${t(action.key)}`}
                onPress={() => router.push(`${action.route}${action.route.includes('?') ? '&' : '?'}from=dx` as never)}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[4], borderRadius: radius.lg, backgroundColor: colors.primarySoft, opacity: pressed ? 0.8 : 1 })}
              >
                <Sparkles size={22} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong" tone="primary">{t('simple.cause.raise')}</Text>
                  <Text variant="bodySmall" tone="secondary">{t(action.key)} · {t('common.minutes', { n: action.minutes })}</Text>
                </View>
                <ArrowRight size={20} color={colors.primary} />
              </Pressable>
            ) : null}
            <Text variant="caption" tone="muted" center>{t('dx.disclaimer')}</Text>
          </>
        ) : null}

        {step === 'program' ? (
          gate.blocked ? (
            <>
              {bigIcon(<Stethoscope size={48} color={colors.danger} />, colors.dangerBg)}
              <Text variant="h1" center accessibilityRole="header">{t('simple.blocked.title')}</Text>
              <Text variant="body" tone="secondary" center>{t('simple.blocked.body')}</Text>
            </>
          ) : (
            <>
              {bigIcon(<CalendarDays size={48} color={colors.success} />, colors.successBg)}
              <Text variant="h1" center accessibilityRole="header">{t(hasProgram ? 'simple.program.running' : 'simple.program.title')}</Text>
              <View style={{ gap: space[3] }}>
                {plan ? (
                  <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
                    <Clock size={28} color={colors.primary} />
                    <Text variant="h3" style={{ flex: 1 }}>{t('simple.program.daily', { min: plan.min, weeks: plan.weeks })}</Text>
                  </View>
                ) : null}
                {programParts(profile).map(({ key, Icon }) => (
                  <View key={key} style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
                    <Icon size={28} color={colors.primary} />
                    <Text variant="h3" style={{ flex: 1 }}>{t(key)}</Text>
                  </View>
                ))}
              </View>
              {ref ? <Text variant="bodySmall" tone="warning" center>{t('simple.program.alsoDoctor', { who: t(ref.who) })}</Text> : null}
            </>
          )
        ) : null}
      </Animated.View>
    </Screen>
  );
}
