import React from 'react';
import { View } from 'react-native';
import { EvidenceChip } from '@/components/Chip';
import { Text } from '@/components/Text';
import { useTheme } from '@/theme';
import { useT } from '@/i18n';

/** Rationale key → citation + evidence level, so each rationale line carries a tappable source. */
export const RATIONALE_EVIDENCE: Record<string, { citation: string; level: 'guideline' | 'rct' | 'expert' }> = {
  'program.rationale.cbt': { citation: 'fuller2020', level: 'guideline' },
  'program.rationale.acute': { citation: 'cima2019', level: 'guideline' },
  'program.rationale.cbti': { citation: 'marks2023', level: 'rct' },
  'program.rationale.hyper': { citation: 'formby2015', level: 'expert' },
  'program.rationale.somatic': { citation: 'michiels2016', level: 'rct' },
  'program.rationale.hearing': { citation: 'tunkel2014', level: 'guideline' },
  'program.rationale.riPositive': { citation: 'sendesen2024', level: 'rct' },
  'program.rationale.riNegative': { citation: 'sendesen2024', level: 'rct' },
  'program.rationale.notched': { citation: 'okamoto2010', level: 'rct' },
};

export function RationaleList({ keys, onCite }: { keys: string[]; onCite: (id: string) => void }) {
  const t = useT();
  const { space } = useTheme();
  return (
    <View style={{ gap: space[3] }}>
      {keys.map((k) => {
        const ev = RATIONALE_EVIDENCE[k];
        return (
          <View key={k} style={{ gap: space[1] }}>
            <Text variant="body">{t(k)}</Text>
            {ev ? <EvidenceChip level={ev.level} onPress={() => onCite(ev.citation)} /> : null}
          </View>
        );
      })}
    </View>
  );
}
