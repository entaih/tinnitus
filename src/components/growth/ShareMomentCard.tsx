import React, { useEffect, useRef } from 'react';
import { Share, View } from 'react-native';
import { router } from 'expo-router';
import { Gift, Share2, Sparkles } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';
import { useGrowth } from '@/store/growth';
import { localDay, type ShareMoment } from './shareMoments';
import { storeLinesText } from './shareRules';
import { STORE_ANDROID, STORE_IOS } from './storeLinks';

/**
 * The share-moment card (PM sprint 3 §B3): headline with the user's own numbers, "Kartı paylaş" (opens /share with the
 * headline baked into the captured image card) and "Davet et" (invite deep link + store placeholders). Marks the moment
 * as shown once per day and counts `shareMomentShown` / `shareMomentUsed`.
 */
export function ShareMomentCard({ moment }: { moment: ShareMoment }) {
  const { colors, space } = useTheme();
  const t = useT();
  const track = useGrowth((s) => s.track);
  const markShareMoment = useGrowth((s) => s.markShareMoment);
  const marked = useRef(false);

  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    const { lastShareMomentAt, lastShareMomentId } = useGrowth.getState();
    const sameToday = lastShareMomentId === moment.id && !!lastShareMomentAt && localDay(new Date(lastShareMomentAt)) === localDay(new Date());
    if (!sameToday) markShareMoment(moment.id);
    track('shareMomentShown');
  }, [moment.id, markShareMoment, track]);

  const headline = t(moment.titleKey, moment.params);
  const shareCard = () => {
    track('shareMomentUsed');
    router.push({ pathname: '/share', params: { moment: moment.id, headline } });
  };
  const invite = async () => {
    track('shareMomentUsed');
    const message = t('growth.invite.message', { stores: storeLinesText(STORE_IOS, STORE_ANDROID) });
    try { await Share.share({ message, title: t('growth.invite.title') }); } catch { /* dismissed */ }
  };

  return (
    <Card variant="tinted" overline={t('growth.moment.overline')} accessibilityLabel={headline}>
      <View style={{ flexDirection: 'row', gap: space[3], alignItems: 'flex-start' }}>
        <Sparkles size={22} color={colors.accentText} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="h3">{headline}</Text>
          <Text variant="bodySmall" tone="secondary">{t(moment.promptKey)}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: space[2] }}>
        <Button style={{ flex: 1 }} title={t('growth.moment.share')} icon={<Share2 size={18} color={colors.onPrimary} />} onPress={shareCard} />
        <Button style={{ flex: 1 }} variant="secondary" title={t('growth.moment.invite')} icon={<Gift size={18} color={colors.primary} />} onPress={() => { void invite(); }} />
      </View>
      <Text variant="caption" tone="muted">{t('growth.moment.privacy')}</Text>
    </Card>
  );
}
