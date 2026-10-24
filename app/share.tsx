import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Share, View } from 'react-native';
import { Stack } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { captureRef } from 'react-native-view-shot';
import { FileText, Gift, Image as ImageIcon, MessageSquareText } from 'lucide-react-native';
import { Button, Card, Disclaimer, Screen, SectionHeader, Text } from '@/components';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useClinical } from '@/store/clinical';
import { useGrowth } from '@/store/growth';
import { ProgressCardView, buildCardHtml, buildShareText, computeProgressStats, thiBandKey } from '@/components/growth';

/** Store links are placeholders until the listings exist (docs/store-listing.md). */
const STORE_IOS = 'https://apps.apple.com/app/dingin/id0000000000';
const STORE_ANDROID = 'https://play.google.com/store/apps/details?id=com.aiheartech.tinnova';

/**
 * Shareable progress card + "invite a friend". The card is captured from the on-screen View with
 * react-native-view-shot (bundled in Expo Go SDK 57) and handed to expo-sharing; if capture fails the same
 * content goes out as an HTML→PDF card (expo-print) or as plain text (Share.share).
 */
export default function ShareScreen() {
  const { colors, space } = useTheme();
  const t = useT();
  const { assessments, program, diary, sessions } = useClinical();
  const track = useGrowth((s) => s.track);
  const inviteCode = useGrowth((s) => s.inviteCode);
  const cardRef = useRef<React.ComponentRef<typeof View>>(null);
  const [busy, setBusy] = useState<'image' | 'pdf' | 'text' | null>(null);

  useEffect(() => { track('shareOpened'); }, [track]);

  const stats = useMemo(() => computeProgressStats({ assessments, program, diary, sessions }), [assessments, program, diary, sessions]);
  const hasData = stats.thiFirst != null || stats.programWeek != null || stats.activeDays > 0;

  const labels = {
    appName: t('app.name'),
    thi: t('growth.share.card.thiShort'),
    week: t('growth.share.card.weekLabel'),
    activeDays: t('growth.share.card.activeDays'),
    footer: t('growth.share.card.footer'),
    bandOf: (total: number) => t(`severity.${thiBandKey(total)}`),
    noThi: t('growth.share.card.noThi'),
  };
  const text = buildShareText(stats, labels);

  const shareFile = async (uri: string, mimeType: string, UTI: string) => {
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType, UTI, dialogTitle: t('growth.share.shareTitle') });
    else await Share.share({ url: uri, message: uri, title: t('growth.share.shareTitle') });
  };

  const sharePdf = async () => {
    const html = buildCardHtml({ title: t('growth.share.card.title'), lines: text.split('\n').slice(1).filter(Boolean).slice(0, -1), footer: t('growth.share.card.footer'), accent: colors.primary, mark: t('app.name') });
    const { uri } = await Print.printToFileAsync({ html });
    await shareFile(uri, 'application/pdf', 'com.adobe.pdf');
  };

  const run = async (kind: 'image' | 'pdf' | 'text') => {
    setBusy(kind);
    try {
      if (kind === 'text') {
        await Share.share({ message: text, title: t('growth.share.shareTitle') });
      } else if (kind === 'pdf') {
        await sharePdf();
      } else {
        try {
          const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile', fileName: 'dingin-progress' });
          await shareFile(uri, 'image/png', 'public.png');
        } catch {
          await sharePdf(); // view-shot unavailable (e.g. web) → same card as PDF
        }
      }
    } catch {
      Alert.alert(t('growth.share.title'), t('growth.share.fail'));
    } finally {
      setBusy(null);
    }
  };

  const invite = async () => {
    const link = `dingin://invite?from=${encodeURIComponent(inviteCode)}`;
    const message = t('growth.invite.message', { link, ios: STORE_IOS, android: STORE_ANDROID });
    try { await Share.share({ message, title: t('growth.invite.title') }); } catch { /* user dismissed */ }
  };

  return (
    <>
      <Stack.Screen options={{ title: t('growth.share.title') }} />
      <Screen>
        <SectionHeader title={t('growth.share.card.title')} />
        <Text variant="bodySmall" tone="secondary">{t('growth.share.card.intro')}</Text>
        {hasData ? <ProgressCardView ref={cardRef} stats={stats} /> : <Card><Text variant="body" tone="secondary">{t('growth.share.empty')}</Text></Card>}
        {hasData ? (
          <View style={{ gap: space[2] }}>
            <Button title={t('growth.share.image')} icon={<ImageIcon size={18} color={colors.onPrimary} />} loading={busy === 'image'} disabled={busy != null} onPress={() => { void run('image'); }} />
            <View style={{ flexDirection: 'row', gap: space[2] }}>
              <Button variant="secondary" style={{ flex: 1 }} title={t('growth.share.text')} icon={<MessageSquareText size={18} color={colors.primary} />} loading={busy === 'text'} disabled={busy != null} onPress={() => { void run('text'); }} />
              <Button variant="secondary" style={{ flex: 1 }} title={t('growth.share.pdf')} icon={<FileText size={18} color={colors.primary} />} loading={busy === 'pdf'} disabled={busy != null} onPress={() => { void run('pdf'); }} />
            </View>
          </View>
        ) : null}
        <Text variant="caption" tone="muted">{t('growth.share.privacy')}</Text>

        <SectionHeader title={t('growth.invite.title')} />
        <Card variant="tinted">
          <Text variant="body" tone="secondary">{t('growth.invite.body')}</Text>
          <Text variant="caption" tone="muted">{t('growth.invite.code', { code: inviteCode })}</Text>
          <Button title={t('growth.invite.cta')} icon={<Gift size={18} color={colors.onPrimary} />} onPress={() => { void invite(); }} />
        </Card>

        <Disclaimer textKey="disclaimer.short" />
      </Screen>
    </>
  );
}
