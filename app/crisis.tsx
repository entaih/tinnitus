import React from 'react';
import { Alert, Linking, TextInput, View } from 'react-native';
import { Stack } from 'expo-router';
import { Hospital, HeartHandshake, MapPin, Phone, Siren, Users, Activity } from 'lucide-react-native';
import { Banner, Button, Card, Disclaimer, Screen, SectionHeader, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { hasSafetyPlan, useGrowth } from '@/store/growth';

/**
 * Crisis card (physician review A2). Fully offline: every text is embedded in the bundle (i18n growth area);
 * no network, no images. Reachable from Settings and the small link at the bottom of Home.
 * 112 / nearest emergency department first; ALO 183 second and labelled as social support, not an emergency line.
 */
export default function CrisisScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const plan = useGrowth((s) => s.safetyPlan);
  const setItem = useGrowth((s) => s.setSafetyPlanItem);
  const clearPlan = useGrowth((s) => s.clearSafetyPlan);

  const call = (number: string) => { void Linking.openURL(`tel:${number}`); };

  const bullet = (text: string, key: string) => (
    <View key={key} style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
      <Text variant="body" tone="secondary">•</Text>
      <Text variant="body" style={{ flex: 1 }}>{text}</Text>
    </View>
  );

  const planGroup = (group: 'people' | 'places' | 'activities', icon: React.ReactNode) => (
    <View style={{ gap: space[2] }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
        {icon}
        <Text variant="bodyStrong" style={{ flex: 1 }}>{t(`growth.crisis.plan.${group}`)}</Text>
      </View>
      {([0, 1, 2] as const).map((i) => (
        <TextInput
          key={`${group}-${i}`}
          value={plan[group][i]}
          onChangeText={(v) => setItem(group, i, v)}
          placeholder={`${i + 1}. ${t(`growth.crisis.plan.placeholder.${group}`)}`}
          placeholderTextColor={colors.textMuted}
          maxLength={80}
          accessibilityLabel={t('growth.crisis.plan.item', { group: t(`growth.crisis.plan.${group}`), n: i + 1 })}
          style={{ minHeight: 48, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.md, paddingHorizontal: space[3], color: colors.text, fontSize: 17, backgroundColor: colors.card }}
        />
      ))}
    </View>
  );

  const confirmClear = () => Alert.alert(t('growth.crisis.plan.clear'), t('growth.crisis.plan.clearConfirm'), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('common.delete'), style: 'destructive', onPress: clearPlan },
  ]);

  return (
    <>
      <Stack.Screen options={{ title: t('growth.crisis.title') }} />
      <Screen>
        <Banner tone="danger" title={t('growth.crisis.banner.title')} body={t('growth.crisis.banner.body')} />

        <Button title={t('growth.crisis.call112')} icon={<Phone size={20} color={colors.onPrimary} />} onPress={() => call('112')} style={{ minHeight: 60 }} accessibilityLabel={t('growth.crisis.call112')} />

        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
            <Hospital size={20} color={colors.danger} />
            <Text variant="h3" style={{ flex: 1 }}>{t('growth.crisis.er')}</Text>
          </View>
          <Text variant="body" tone="secondary">{t('growth.crisis.er.body')}</Text>
        </Card>

        <Card title={t('growth.crisis.when.title')} right={<Siren size={20} color={colors.danger} />}>
          {[1, 2, 3].map((i) => bullet(t(`growth.crisis.when.${i}`), `when-${i}`))}
        </Card>

        <Card title={t('growth.crisis.safe.title')} variant="tinted">
          {[1, 2, 3, 4].map((i) => bullet(t(`growth.crisis.safe.${i}`), `safe-${i}`))}
        </Card>

        <Card title={t('growth.crisis.support.title')} right={<HeartHandshake size={20} color={colors.textSecondary} />}>
          <Text variant="body" tone="secondary">{t('growth.crisis.support.body')}</Text>
          <Button variant="secondary" title={t('growth.crisis.call183')} icon={<Phone size={18} color={colors.primary} />} onPress={() => call('183')} />
        </Card>

        <SectionHeader title={t('growth.crisis.plan.title')} action={hasSafetyPlan(plan) ? t('growth.crisis.plan.clear') : undefined} onAction={hasSafetyPlan(plan) ? confirmClear : undefined} />
        <Card>
          <Text variant="bodySmall" tone="secondary">{t('growth.crisis.plan.body')}</Text>
          {planGroup('people', <Users size={18} color={colors.primary} />)}
          {planGroup('places', <MapPin size={18} color={colors.primary} />)}
          {planGroup('activities', <Activity size={18} color={colors.primary} />)}
        </Card>

        <Text variant="caption" tone="muted">{t('growth.crisis.offline')}</Text>
        <Disclaimer textKey="growth.crisis.disclaimer" />
      </Screen>
    </>
  );
}
