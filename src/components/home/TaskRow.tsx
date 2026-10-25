import React from 'react';
import { Pressable, View } from 'react-native';
import { AudioWaveform, BookOpen, Brain, CalendarCheck, Check, ChevronRight, ClipboardList, Dumbbell, MoonStar, NotebookPen } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Chip } from '@/components/Chip';
import { useT } from '@/i18n';
import type { ProgramTask } from '@/clinical/types';
import { taskMeta, taskTitle } from './taskBudget';

export function taskIcon(type: ProgramTask['type'], color: string, size = 20) {
  const Icon = { sound: AudioWaveform, mind: Brain, education: BookOpen, exercise: Dumbbell, sleep: MoonStar, diary: NotebookPen, assessment: ClipboardList, review: CalendarCheck }[type] ?? Brain;
  return <Icon size={size} color={color} />;
}

/**
 * One programme task. "Başla" navigates; the checkbox (or a long press anywhere) toggles done.
 * Sound tasks show "Arka planda · en az n dk" instead of a minute count. Done rows use a check and a muted tone (no strikethrough).
 * `compact` hides the type chip for dense lists (Home).
 */
export function TaskRow({ task, done, onStart, onToggleDone, compact, connector = true, playing }: {
  task: ProgramTask; done: boolean; onStart?: () => void; onToggleDone?: () => void; compact?: boolean; connector?: boolean; playing?: boolean;
}) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const title = taskTitle(t, task);
  const meta = taskMeta(t, task);
  const toggle = onToggleDone ? () => { void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggleDone(); } : undefined;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${meta}${done ? `, ${t('task.done')}` : playing ? `, ${t('task.playing')}` : ''}`}
      accessibilityHint={!done && onStart ? t('task.start') : onToggleDone ? t('task.markDoneHint') : undefined}
      onPress={!done ? onStart : undefined}
      onLongPress={toggle}
      delayLongPress={450}
      style={{ flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 56, paddingVertical: space[2] }}
    >
      {connector ? <View style={{ width: 2, alignSelf: 'stretch', backgroundColor: done ? colors.primary : colors.border, borderRadius: 1, marginLeft: 2 }} /> : null}
      <View style={{ width: 40, height: 40, borderRadius: radius.md, backgroundColor: done ? colors.successBg : colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        {done ? <Check size={20} color={colors.success} strokeWidth={2.5} /> : taskIcon(task.type, colors.primary)}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant={done ? 'body' : 'bodyStrong'} tone={done ? 'secondary' : 'default'} numberOfLines={2}>{title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap' }}>
          <Text variant="caption" tone="secondary">{meta}</Text>
          {playing && !done ? <Chip small label={t('task.playing')} tone="success" /> : null}
        </View>
      </View>
      {/* The whole row starts the task (a separate "Başla" button squeezed the title to "Ses zenginleşt…"). */}
      {!done && onStart ? <ChevronRight size={22} color={colors.textMuted} /> : null}
      {/* Tasks complete themselves when finished; the box only appears on done tasks (to undo). Long press marks done. */}
      {onToggleDone && done ? (
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: done }}
          accessibilityLabel={t('task.markDone')}
          onPress={toggle}
          hitSlop={8}
          style={({ pressed }) => ({ width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.7 : 1 })}
        >
          <View style={{ width: 26, height: 26, borderRadius: radius.sm, borderWidth: 2, borderColor: done ? colors.primary : colors.borderStrong, backgroundColor: done ? colors.primary : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
            {done ? <Check size={18} color={colors.onPrimary} strokeWidth={3} /> : null}
          </View>
        </Pressable>
      ) : null}
    </Pressable>
  );
}
