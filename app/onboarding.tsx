import React, { useRef, useState } from 'react';
import { FlatList, Pressable, TextInput, View, useWindowDimensions, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Circle, Path, Polyline, Rect } from 'react-native-svg';
import { AudioWaveform, Bell, Brain, Check, ClipboardList, Headphones } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Button, Card, Disclaimer, EvidenceChip, Screen, Text, useCitation } from '@/components';
import { Segmented } from '@/components/home';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useSettings } from '@/store/settings';
import { requestReminderPermission, scheduleWeekdayReminders } from '@/notifications';

type Stage = 'carousel' | 'consent' | 'setup';

/** Flat two-tone illustrations (teal/sand), no faces. */
function Illustration({ kind }: { kind: 0 | 1 | 2 }) {
  const { colors, isDark } = useTheme();
  const teal = colors.primary;
  const tealSoft = colors.primaryTrack;
  const sand = colors.accent;
  const sandSoft = colors.accentSoft;
  const w = 240, h = 160;
  if (kind === 0) {
    // Horizon mark: sand sky over a deep teal plane, a wave settling to flat.
    return (
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Rect x={0} y={0} width={w} height={h} rx={28} fill={sandSoft} />
        <Rect x={0} y={92} width={w} height={68} fill={teal} />
        <Path d="M0 92 Q 40 70 80 92 T 160 92 T 240 92 L240 100 L0 100 Z" fill={tealSoft} opacity={isDark ? 0.5 : 0.9} />
        <Circle cx={184} cy={44} r={18} fill={sand} opacity={0.8} />
      </Svg>
    );
  }
  if (kind === 1) {
    // Three stacked steps: assess → listen → learn.
    return (
      <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <Rect x={0} y={0} width={w} height={h} rx={28} fill={colors.tinted} />
        <Rect x={32} y={100} width={56} height={36} rx={10} fill={teal} />
        <Rect x={92} y={72} width={56} height={64} rx={10} fill={tealSoft} />
        <Rect x={152} y={40} width={56} height={96} rx={10} fill={sand} opacity={0.85} />
        <Polyline points="36,92 118,62 176,30" fill="none" stroke={colors.textSecondary} strokeWidth={2} strokeDasharray="4 4" />
      </Svg>
    );
  }
  // Progress silhouette: a line easing downward over soft bars.
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <Rect x={0} y={0} width={w} height={h} rx={28} fill={sandSoft} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Rect key={i} x={28 + i * 32} y={110 - i * 4} width={18} height={30 + i * 4} rx={5} fill={tealSoft} />
      ))}
      <Polyline points="30,40 66,52 102,50 138,70 174,82 210,96" fill="none" stroke={teal} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      {[30, 66, 102, 138, 174, 210].map((x, i) => <Circle key={x} cx={x} cy={[40, 52, 50, 70, 82, 96][i]} r={5} fill={colors.card} stroke={teal} strokeWidth={3} />)}
    </Svg>
  );
}

function CheckRow({ checked, label, hint, onToggle }: { checked: boolean; label: string; hint?: string; onToggle: () => void }) {
  const { colors, radius, space } = useTheme();
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      onPress={() => { void Haptics.selectionAsync(); onToggle(); }}
      style={({ pressed }) => ({ minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[2], opacity: pressed ? 0.8 : 1 })}
    >
      <View style={{ width: 28, height: 28, borderRadius: radius.sm, borderWidth: 2, borderColor: checked ? colors.primary : colors.borderStrong, backgroundColor: checked ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
        {checked ? <Check size={18} color={colors.onPrimary} strokeWidth={3} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="body">{label}</Text>
        {hint ? <Text variant="caption" tone="secondary">{hint}</Text> : null}
      </View>
    </Pressable>
  );
}

export default function Onboarding() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { locale, setLocale, completeOnboarding, reminderHour, setReminderHour } = useSettings();
  const cite = useCitation();

  const [stage, setStage] = useState<Stage>('carousel');
  const [page, setPage] = useState(0);
  const listRef = useRef<FlatList<number>>(null);

  const [notDiagnosis, setNotDiagnosis] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [anonymous, setAnonymous] = useState(false);
  const [name, setName] = useState('');
  const [notifState, setNotifState] = useState<'idle' | 'granted' | 'denied'>('idle');

  const pages = [0, 1, 2];
  const goTo = (i: number) => { listRef.current?.scrollToIndex({ index: i, animated: true }); setPage(i); };
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  const finish = () => {
    completeOnboarding(name.trim());
    router.replace('/(tabs)');
  };

  const allowNotif = async () => {
    const ok = await requestReminderPermission();
    if (!ok) { setNotifState('denied'); return; }
    const hour = reminderHour ?? 20;
    const ids = await scheduleWeekdayReminders(hour);
    if (ids.length > 0) { setReminderHour(hour); setNotifState('granted'); } else setNotifState('denied');
  };

  if (stage === 'carousel') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: space[4] }}>
          <Button variant="ghost" size="sm" title={t('onb.skip')} onPress={() => setStage('consent')} />
        </View>
        <FlatList
          ref={listRef}
          style={{ flex: 1 }}
          data={pages}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(i) => String(i)}
          onMomentumScrollEnd={onEnd}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
          renderItem={({ item }) => (
            <View style={{ width, paddingHorizontal: space[6], gap: space[5], alignItems: 'center', justifyContent: 'center', flex: 1 }} accessibilityLabel={t('onb.a11y.page', { n: item + 1, total: 3 })}>
              <Illustration kind={item as 0 | 1 | 2} />
              <Text variant="h1" center accessibilityRole="header">{t(`onb.card${item + 1}.title`)}</Text>
              <Text variant="body" tone="secondary" center>{t(`onb.card${item + 1}.body`)}</Text>
              {item === 0 ? <EvidenceChip level="guideline" onPress={() => cite.open('tunkel2014')} /> : null}
              {item === 1 ? (
                <View style={{ alignSelf: 'stretch', gap: space[2] }}>
                  {([['assess', ClipboardList], ['listen', AudioWaveform], ['learn', Brain]] as const).map(([k, Icon]) => (
                    <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 56 }}>
                      <View style={{ width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Icon size={22} color={colors.primary} /></View>
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyStrong">{t(`onb.card2.${k}`)}</Text>
                        <Text variant="caption" tone="secondary">{t(`onb.card2.${k}Sub`)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          )}
        />
        <View style={{ paddingHorizontal: space[4], paddingBottom: insets.bottom + space[4], gap: space[4] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: space[2] }} accessibilityLabel={t('onb.a11y.page', { n: page + 1, total: 3 })}>
            {pages.map((i) => <View key={i} style={{ width: i === page ? 20 : 8, height: 8, borderRadius: 4, backgroundColor: i === page ? colors.primary : colors.border }} />)}
          </View>
          <Button title={t('common.continue')} onPress={() => (page < 2 ? goTo(page + 1) : setStage('consent'))} />
        </View>
        {cite.sheet}
      </View>
    );
  }

  if (stage === 'consent') {
    const canAccept = notDiagnosis && privacy;
    return (
      <Screen footer={<Button title={t('onb.consent.accept')} disabled={!canAccept} onPress={() => setStage('setup')} />}>
        <View style={{ paddingTop: insets.top }} />
        <Text variant="h1" accessibilityRole="header">{t('onb.consent.title')}</Text>
        <Text variant="body" tone="secondary">{t('onb.consent.intro')}</Text>
        <Card>
          <CheckRow checked={notDiagnosis} label={t('onb.consent.notDiagnosis')} onToggle={() => setNotDiagnosis((v) => !v)} />
          <CheckRow checked={privacy} label={t('onb.consent.privacy')} hint={t('onb.consent.privacyBody')} onToggle={() => setPrivacy((v) => !v)} />
          <CheckRow checked={anonymous} label={t('onb.consent.anonymous')} hint={t('onb.consent.anonymousHint')} onToggle={() => setAnonymous((v) => !v)} />
        </Card>
        <Card>
          <Text variant="bodyStrong">{t('onb.consent.language')}</Text>
          <Segmented options={[{ value: 'tr', label: 'Türkçe' }, { value: 'en', label: 'English' }]} value={locale} onChange={setLocale} accessibilityLabel={t('onb.consent.language')} />
          <Text variant="bodyStrong" style={{ marginTop: space[2] }}>{t('onb.consent.name')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('onb.consent.namePlaceholder')}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            maxLength={40}
            accessibilityLabel={t('onb.consent.name')}
            style={{ minHeight: 52, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, paddingHorizontal: space[4], color: colors.text, fontSize: 17, backgroundColor: colors.card }}
          />
        </Card>
        <Disclaimer textKey="disclaimer.short" />
      </Screen>
    );
  }

  return (
    <Screen footer={<Button title={t('onb.setup.finish')} onPress={finish} />}>
      <View style={{ paddingTop: insets.top }} />
      <Text variant="h1" accessibilityRole="header">{t('onb.setup.title')}</Text>
      <Card>
        <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
          <View style={{ width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}><Headphones size={24} color={colors.primary} /></View>
          <Text variant="h3" style={{ flex: 1 }}>{t('onb.setup.headphonesTitle')}</Text>
        </View>
        <Text variant="body" tone="secondary">{t('onb.setup.headphonesBody')}</Text>
      </Card>
      <Card>
        <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'center' }}>
          <View style={{ width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}><Bell size={24} color={colors.accentText} /></View>
          <Text variant="h3" style={{ flex: 1 }}>{t('onb.setup.notifTitle')}</Text>
        </View>
        <Text variant="body" tone="secondary">{t('onb.setup.notifBody')}</Text>
        {notifState === 'granted' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}><Check size={18} color={colors.success} /><Text variant="bodyStrong" tone="success">{t('onb.setup.notifGranted')}</Text></View>
        ) : (
          <>
            <Button variant="secondary" title={t('onb.setup.allowNotif')} onPress={() => { void allowNotif(); }} />
            {notifState === 'denied' ? <Text variant="caption" tone="secondary">{t('onb.setup.notifDenied')}</Text> : null}
          </>
        )}
      </Card>
      <Button variant="ghost" title={t('onb.setup.later')} onPress={finish} />
    </Screen>
  );
}
