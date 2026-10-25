import React, { useState } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Check, Trash2, UserPlus, UserRound } from 'lucide-react-native';
import { Button, Card, Screen, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useProfiles } from '@/store/profiles';
import { activateProfile, createAndActivateProfile, deletePerson } from '@/store/profileSwitch';
import { MAX_PROFILES, PROFILE_NAME_MAX, cleanProfileName } from '@/store/profileRules';

/**
 * People on this device ("Kişiler"): each person has their own assessments, programme, diary and counters.
 * Creating a person starts everything from scratch for them; deleting removes their data from the device.
 */
export default function ProfilesScreen() {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const { profiles, activeId } = useProfiles();
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const canAdd = cleanProfileName(name).length > 0 && profiles.length < MAX_PROFILES && !busy;

  const create = async () => {
    if (!canAdd) return;
    setBusy(true);
    try {
      const id = await createAndActivateProfile(name);
      if (id) { setName(''); router.replace('/assess/triage?journey=1'); }
    } finally { setBusy(false); }
  };

  const switchTo = async (id: string) => {
    if (id === activeId || busy) return;
    setBusy(true);
    try { await activateProfile(id); router.replace('/(tabs)'); } finally { setBusy(false); }
  };

  const confirmDelete = (id: string, label: string) => {
    const last = profiles.length <= 1;
    Alert.alert(
      t(last ? 'profiles.delete.last.title' : 'profiles.delete.title', { name: label }),
      t(last ? 'profiles.delete.last.body' : 'profiles.delete.body'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => { setBusy(true); void deletePerson(id).finally(() => setBusy(false)); } },
      ],
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: t('profiles.title') }} />
      <Screen>
        <Text variant="body" tone="secondary">{t('profiles.intro')}</Text>

        <Card>
          {profiles.map((p, i) => {
            const active = p.id === activeId;
            const label = p.name || t('profiles.unnamed');
            return (
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 56, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border, paddingTop: i ? space[2] : 0 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={active ? t('profiles.active.a11y', { name: label }) : t('profiles.switch.a11y', { name: label })}
                  onPress={() => { void switchTo(p.id); }}
                  style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: space[3], opacity: pressed ? 0.7 : 1, minHeight: 44 })}
                >
                  <View style={{ width: 40, height: 40, borderRadius: radius.full, backgroundColor: active ? colors.primary : colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                    {active ? <Check size={20} color={colors.onPrimary} strokeWidth={3} /> : <UserRound size={20} color={colors.primary} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{label}</Text>
                    <Text variant="caption" tone={active ? 'primary' : 'secondary'}>{active ? t('profiles.active') : t('profiles.switch')}</Text>
                  </View>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('profiles.delete.a11y', { name: label })}
                  onPress={() => confirmDelete(p.id, label)}
                  style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}
                >
                  <Trash2 size={20} color={colors.danger} />
                </Pressable>
              </View>
            );
          })}
        </Card>

        <Card title={t('profiles.new')}>
          <Text variant="bodySmall" tone="secondary">{t('profiles.new.body')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('profiles.new.placeholder')}
            placeholderTextColor={colors.textMuted}
            maxLength={PROFILE_NAME_MAX}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={() => { void create(); }}
            accessibilityLabel={t('profiles.new.placeholder')}
            style={{ minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: space[3], color: colors.text, backgroundColor: colors.bg }}
          />
          {profiles.length >= MAX_PROFILES ? <Text variant="caption" tone="warning">{t('profiles.new.limit', { n: MAX_PROFILES })}</Text> : null}
          <Button title={t('profiles.new.cta')} icon={<UserPlus size={18} color={canAdd ? colors.onPrimary : colors.textMuted} />} onPress={() => { void create(); }} disabled={!canAdd} />
        </Card>
      </Screen>
    </>
  );
}
