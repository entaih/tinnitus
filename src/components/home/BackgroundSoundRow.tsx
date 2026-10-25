import React from 'react';
import { View } from 'react-native';
import { AudioWaveform, Check } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { useT } from '@/i18n';
import type { ProgramTask } from '@/clinical/types';
import { taskTitle } from './taskBudget';

/**
 * Background sound is not a numbered step (PM §2.1): one row with the task title, "Gün içinde açık tutun" and an
 * Aç / Çalıyor state. No minute target is shown. `onMarkDone` (optional) lets the user count it once it has played.
 */
export function BackgroundSoundRow({ task, state, onOpen, onMarkDone }: {
  task: ProgramTask; state: 'idle' | 'playing' | 'done'; onOpen: () => void; onMarkDone?: () => void;
}) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const title = taskTitle(t, task);
  const stateLabel = state === 'done' ? t('task.done') : state === 'playing' ? t('task.playing') : t('home.bg.hint');
  return (
    <View accessible accessibilityLabel={`${t('home.bg.title')}: ${title}, ${stateLabel}`} style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 56 }}>
      <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: state === 'done' ? colors.successBg : colors.secondarySoft, alignItems: 'center', justifyContent: 'center' }}>
        {state === 'done' ? <Check size={20} color={colors.success} strokeWidth={2.5} /> : <AudioWaveform size={20} color={colors.secondaryText} />}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="overline" tone="secondary">{t('home.bg.title')}</Text>
        <Text variant="bodyStrong" numberOfLines={2}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap' }}>
          <Text variant="caption" tone="secondary">{t('home.bg.hint')}</Text>
          {state === 'playing' ? <Chip small label={t('task.playing')} tone="success" /> : null}
        </View>
      </View>
      {state === 'done' ? null : state === 'playing' && onMarkDone ? (
        <Button size="sm" variant="ghost" title={t('session.playing.markDone')} onPress={onMarkDone} />
      ) : (
        <Button size="sm" variant="secondary" title={state === 'playing' ? t('task.playing') : t('home.bg.open')} onPress={onOpen} accessibilityLabel={`${t('home.bg.open')}: ${title}`} />
      )}
    </View>
  );
}
