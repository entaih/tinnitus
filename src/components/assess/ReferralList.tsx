import React from 'react';
import { View } from 'react-native';
import { Stethoscope, Clock } from 'lucide-react-native';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Chip } from '@/components/Chip';
import { useT } from '@/i18n';
import { REFERRAL } from '@/clinical/journey';

/** Renders each triage reason with the clinician to see and how soon. */
export function ReferralList({ reasons }: { reasons: string[] }) {
  const { colors, space, radius } = useTheme();
  const t = useT();
  const items = reasons.filter((r) => r !== 'triage.selfcare');
  if (!items.length) return null;
  return (
    <View style={{ gap: space[3] }}>
      {items.map((r) => {
        const ref = REFERRAL[r];
        const whenTone = ref?.when === 'now' || ref?.when === 'h24' ? 'danger' : ref?.when === 'w2' ? 'warning' : 'info';
        return (
          <View key={r} style={{ backgroundColor: colors.card, borderRadius: radius.md, padding: space[3], gap: space[2], borderWidth: 1, borderColor: colors.border }}>
            <Text variant="bodyStrong">{t(r)}</Text>
            {ref ? (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space[2], flexWrap: 'wrap' }}>
                  <Chip small tone="primary" label={t(ref.who)} icon={<Stethoscope size={14} color={colors.primaryPressed} />} />
                  {ref.when !== 'none' ? <Chip small tone={whenTone} label={t(`when.${ref.when}`)} icon={<Clock size={14} color={whenTone === 'danger' ? colors.danger : whenTone === 'warning' ? colors.warning : colors.info} />} /> : null}
                </View>
                <Text variant="bodySmall" tone="secondary">{t(`${r}.say`)}</Text>
              </>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
