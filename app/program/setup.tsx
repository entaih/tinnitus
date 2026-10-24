import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Banner, Button, Card, Chip, Disclaimer, EvidenceChip, OptionCard, Screen, SectionHeader, SeverityBadge, Text, useCitation } from '@/components';
import { CheckRow, RationaleList } from '@/components/home';
import { programGate } from '@/components/assess/programGate';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { useProfile } from '@/hooks/useProfile';
import { computeTriage } from '@/clinical/engine';
import { generateProgram, type ProgramPrefs } from '@/clinical/program';
import type { Program } from '@/clinical/types';
import { fmtHz } from '@/utils/format';

export default function ProgramSetup() {
  const { space } = useTheme();
  const t = useT();
  const cite = useCitation();
  const { assessment, profile } = useProfile();
  const { program: existing, setProgram } = useClinical();

  const [minutes, setMinutes] = useState<ProgramPrefs['minutesPerDay']>(30);
  const [style, setStyle] = useState<ProgramPrefs['style']>('cbt');
  const [acked, setAcked] = useState(false);
  const [preview, setPreview] = useState<Program | null>(null);

  const tier = assessment ? computeTriage(assessment).tier : null;
  const gate = programGate(profile, tier);
  const canGenerate = !!profile && !gate.blocked && (!gate.needsAck || acked);

  const psycho = assessment?.psycho;
  const prefs = useMemo<ProgramPrefs>(() => ({
    minutesPerDay: minutes,
    style,
    pitchHz: psycho?.pitchHz,
    riPositive: psycho ? (psycho.riPositive ?? (psycho.riCategory ? psycho.riCategory === 'complete' : undefined)) : undefined,
    hearingDone: !!assessment?.hearing,
    causesDone: !!assessment?.causeAnswers,
    examDone: !!assessment?.exam,
  }), [minutes, style, psycho, assessment]);

  const generate = () => { if (profile) setPreview(generateProgram(profile, prefs)); };
  const save = () => { if (preview) { setProgram(preview); router.replace('/program'); } };

  if (!profile) {
    return (
      <>
        <Stack.Screen options={{ title: t('setup.title') }} />
        <Screen>
          <Card title={t('setup.noProfile')}>
            <Button title={t('setup.goAssess')} onPress={() => router.push('/(tabs)/assess')} />
          </Card>
        </Screen>
      </>
    );
  }

  const riLabel = psycho?.riCategory ? t(`setup.profile.ri.${psycho.riCategory}`) : t('setup.profile.notMeasured');
  const rationaleKeys = preview ? Array.from(new Set(preview.weeks.flatMap((w) => w.rationaleKeys))) : [];

  return (
    <>
      <Stack.Screen options={{ title: t('setup.title') }} />
      <Screen footer={preview ? <Button title={t('setup.save')} onPress={save} /> : <Button title={t('setup.generate')} onPress={generate} disabled={!canGenerate} />}>
        {gate.blocked ? <Banner tone="danger" title={t('setup.urgent.title')} body={t('setup.urgent.blocked')} /> : null}
        {gate.needsAck ? (
          <Card variant="tinted" title={t('setup.ack.title')}>
            <Text variant="body" tone="secondary">{profile.triage === 'urgent' ? t('setup.urgent.body') : t('setup.ack.body')}</Text>
            <CheckRow checked={acked} label={t('setup.ack.check')} hint={acked ? t('setup.urgent.acked') : t('setup.ack.hint')} onToggle={() => setAcked((v) => !v)} />
          </Card>
        ) : null}
        {existing && !preview ? <Banner tone="info" title={t('setup.existing')} /> : null}

        <Card title={t('setup.profile')}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2], alignItems: 'center' }}>
            {profile.severityScore != null ? <SeverityBadge band={profile.severityBand} score={profile.severityScore} source={profile.severitySource} /> : <Chip label={t('setup.profile.noScore')} />}
            {profile.subtypes.map((s) => <Chip key={s} small label={t(s)} tone="primary" />)}
          </View>
          <View style={{ flexDirection: 'row', gap: space[4] }}>
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="secondary">{t('setup.profile.pitch')}</Text>
              <Text variant="bodyStrong">{psycho?.pitchHz ? fmtHz(psycho.pitchHz) : t('setup.profile.notMeasured')}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="secondary">{t('setup.profile.ri')}</Text>
              <Text variant="bodyStrong">{riLabel}</Text>
            </View>
          </View>
        </Card>

        {!preview ? (
          <>
            <SectionHeader title={t('setup.minutes')} />
            {([15, 30, 45] as const).map((m) => (
              <OptionCard key={m} label={t(`setup.minutes.${m}`)} hint={t(`setup.minutes.${m}.sub`)} selected={minutes === m} onPress={() => setMinutes(m)} />
            ))}
            <SectionHeader title={t('setup.style')} />
            {(['cbt', 'act', 'mindfulness'] as const).map((s) => (
              <View key={s} style={{ gap: space[2] }}>
                <OptionCard label={t(`setup.style.${s}`)} hint={t(`setup.style.${s}.sub`)} selected={style === s} onPress={() => setStyle(s)} />
                <View style={{ flexDirection: 'row', gap: space[2], paddingLeft: space[2] }}>
                  {s === 'cbt' ? <EvidenceChip level="guideline" onPress={() => cite.open('fuller2020')} /> : (
                    <>
                      <Chip small label={t('setup.style.equivalent')} tone="info" />
                      <EvidenceChip level="rct" onPress={() => cite.open(s === 'act' ? 'hesser2012' : 'mckenna2017')} />
                    </>
                  )}
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            <Card title={t('setup.overview')} overline={t('setup.overview.weeks', { n: preview.weeks.length })}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[2] }}>
                <Chip label={t(`setup.overview.arm.${preview.arm}`)} tone="primary" />
                <Chip label={t(`setup.style.${style}`)} />
                <Chip label={t(`setup.minutes.${minutes}`)} />
                {preview.notchHz ? <Chip label={`${t('setup.overview.notch')}: ${fmtHz(preview.notchHz)}`} tone="accent" /> : null}
              </View>
              <View style={{ gap: space[2] }}>
                {preview.weeks.map((w) => {
                  const n = w.days.reduce((s, d) => s + d.tasks.length, 0);
                  return (
                    <View key={w.week} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 36 }}>
                      <Text variant="caption" tone="secondary" style={{ width: 64 }}>{t('prog.week', { n: w.week })}</Text>
                      <Text variant="bodySmall" style={{ flex: 1 }}>{t(w.themeKey)}</Text>
                      <Text variant="caption" tone="muted">{n}</Text>
                    </View>
                  );
                })}
              </View>
            </Card>
            <Card title={t('setup.rationale')}>
              <RationaleList keys={rationaleKeys} onCite={cite.open} />
            </Card>
            <Button variant="ghost" title={t('setup.regenerate')} onPress={() => setPreview(null)} />
            <Disclaimer textKey="disclaimer.short" />
          </>
        )}
        {cite.sheet}
      </Screen>
    </>
  );
}
