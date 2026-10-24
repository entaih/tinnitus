import React, { useState } from 'react';
import { Alert, TextInput, View } from 'react-native';
import { Stack } from 'expo-router';
import { Building2, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import { Button, Card, Disclaimer, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { formatDate, useLocale, useT } from '@/i18n';
import { useGrowth } from '@/store/growth';
import { formatClinicCode, isValidClinicCode, normalizeClinicCode } from '@/components/growth/clinicCode';

/**
 * Clinic code (B2B2C attribution). The code is validated on the device with a mod-36 checksum and stored
 * locally; nothing is sent anywhere. Other screens can read `useGrowth().clinic`.
 */
export default function ClinicScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const locale = useLocale();
  const clinic = useGrowth((s) => s.clinic);
  const setClinicCode = useGrowth((s) => s.setClinicCode);
  const clearClinic = useGrowth((s) => s.clearClinic);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const normalized = normalizeClinicCode(input);
  const looksValid = isValidClinicCode(normalized);

  const apply = () => {
    const ok = setClinicCode(input);
    setError(!ok);
    if (ok) setInput('');
  };

  const confirmRemove = () => Alert.alert(t('growth.clinic.remove'), t('growth.clinic.removeConfirm'), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('growth.clinic.remove'), style: 'destructive', onPress: clearClinic },
  ]);

  return (
    <>
      <Stack.Screen options={{ title: t('growth.clinic.title') }} />
      <Screen>
        <Text variant="body" tone="secondary">{t('growth.clinic.intro')}</Text>

        {clinic ? (
          <Card variant="tinted">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2] }}>
              <CheckCircle2 size={22} color={colors.success} />
              <Text variant="h3" style={{ flex: 1 }}>{t('growth.clinic.active')}</Text>
            </View>
            <Text variant="numeric" style={{ color: colors.primary }}>{formatClinicCode(clinic.code)}</Text>
            <Text variant="bodySmall" tone="secondary">{t('growth.clinic.enteredAt', { date: formatDate(clinic.enteredAt, locale, { day: 'numeric', month: 'long', year: 'numeric' }) })}</Text>
            <Button variant="danger" title={t('growth.clinic.remove')} onPress={confirmRemove} />
          </Card>
        ) : (
          <Card>
            <TextInput
              value={input}
              onChangeText={(v) => { setInput(v); setError(false); }}
              placeholder={t('growth.clinic.placeholder')}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={16}
              accessibilityLabel={t('growth.clinic.title')}
              style={{ minHeight: 52, borderWidth: 1.5, borderColor: error ? colors.danger : looksValid ? colors.success : colors.borderStrong, borderRadius: radius.md, paddingHorizontal: space[3], color: colors.text, fontSize: 20, letterSpacing: 2, backgroundColor: colors.card }}
            />
            {error ? <Text variant="bodySmall" tone="danger">{t('growth.clinic.invalid')}</Text> : <Text variant="caption" tone="muted">{t('growth.clinic.format')}</Text>}
            <Button title={t('growth.clinic.apply')} disabled={normalized.length < 5} onPress={apply} icon={<Building2 size={18} color={colors.onPrimary} />} />
          </Card>
        )}

        <Card title={t('growth.clinic.what.title')} right={<ShieldCheck size={20} color={colors.primary} />}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ flexDirection: 'row', gap: space[2], alignItems: 'flex-start' }}>
              <Text variant="body" tone="secondary">•</Text>
              <Text variant="body" style={{ flex: 1 }}>{t(`growth.clinic.what.${i}`)}</Text>
            </View>
          ))}
        </Card>

        <Disclaimer textKey="settings.privacy.body" />
      </Screen>
    </>
  );
}
