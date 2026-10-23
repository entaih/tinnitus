import React from 'react';
import { Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { useT } from '@/i18n';

export type DayState = 'done' | 'partial' | 'missed' | 'future';

export interface TimelineDay {
  day: number;          // 1..7 within the week
  label: string;        // short weekday ("Pzt")
  dateLabel: string;    // day of month ("14")
  state: DayState;
  isToday: boolean;
}

/**
 * Horizontal row of 7 day pills (40×56). Today outlined; done = filled primary with check;
 * missed = neutral hollow (never red); future = dashed border.
 */
export function WeekTimeline({ days, selected, onSelect }: { days: TimelineDay[]; selected?: number; onSelect?: (day: number) => void }) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }} accessibilityRole="tablist">
      {days.map((d) => {
        const filled = d.state === 'done';
        const isSel = selected === d.day;
        const borderColor = d.isToday || isSel ? colors.primary : d.state === 'future' ? colors.borderStrong : colors.border;
        const bg = filled ? colors.primary : d.state === 'partial' ? colors.primarySoft : 'transparent';
        const fg = filled ? colors.onPrimary : d.state === 'missed' ? colors.textMuted : colors.text;
        const stateLabel = d.isToday ? t('prog.today') : t(`prog.timeline.${d.state}`);
        return (
          <Pressable
            key={d.day}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSel }}
            accessibilityLabel={t('prog.timeline.a11y', { day: d.day, state: stateLabel })}
            onPress={onSelect ? () => onSelect(d.day) : undefined}
            style={({ pressed }) => ({ alignItems: 'center', gap: 4, opacity: pressed ? 0.75 : 1 })}
          >
            <Text variant="caption" style={{ color: d.isToday ? colors.primary : colors.textSecondary }}>{d.label}</Text>
            <View style={{
              width: 40, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', gap: 2,
              backgroundColor: bg, borderWidth: d.isToday || isSel ? 2 : 1.5, borderColor,
              borderStyle: d.state === 'future' && !d.isToday ? 'dashed' : 'solid',
            }}>
              <Text variant="bodyStrong" style={{ color: fg, fontSize: 15 }}>{d.dateLabel}</Text>
              {filled ? <Check size={14} color={fg} strokeWidth={3} /> : d.state === 'partial' ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary }} /> : <View style={{ height: 6 }} />}
            </View>
            {isSel ? <View style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: colors.primary, marginTop: space[1] - 2 }} /> : <View style={{ height: 3, marginTop: space[1] - 2 }} />}
          </Pressable>
        );
      })}
    </View>
  );
}
