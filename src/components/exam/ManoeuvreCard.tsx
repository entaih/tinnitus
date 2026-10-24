import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CountdownRing } from '@/components/psycho/CountdownRing';
import { useT } from '@/i18n';

interface Props {
  title: string;
  instruction: string;
  seconds: number;
  /** Called once when the countdown reaches zero. */
  onComplete: () => void;
  /** Optional secondary action (e.g. skip a contraindicated manoeuvre). */
  skipLabel?: string;
  onSkip?: () => void;
  stepLabel?: string;
}

/** Instruction card with a one-shot countdown; used by the pressure and vascular manoeuvre screens. */
export function ManoeuvreCard({ title, instruction, seconds, onComplete, skipLabel, onSkip, stepLabel }: Props) {
  const { space } = useTheme();
  const t = useT();
  const [remaining, setRemaining] = useState<number | null>(null);
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  const clear = () => { if (iv.current) clearInterval(iv.current); iv.current = null; };
  useEffect(() => () => clear(), []);
  // Reset the countdown whenever the card is reused for the next manoeuvre.
  useEffect(() => { clear(); setRemaining(null); }, [title]);

  const start = () => {
    clear();
    setRemaining(seconds);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const t0 = Date.now();
    iv.current = setInterval(() => {
      const left = seconds - Math.round((Date.now() - t0) / 1000);
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        clear();
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onComplete();
      }
    }, 250);
  };

  const running = remaining != null && remaining > 0;
  return (
    <View style={{ gap: space[3] }}>
      {stepLabel ? <Text variant="overline" tone="secondary">{stepLabel}</Text> : null}
      <Text variant="h2" accessibilityRole="header">{title}</Text>
      <Card variant="tinted"><Text variant="body">{instruction}</Text></Card>
      <CountdownRing remaining={remaining ?? seconds} total={seconds} size={150} caption={t('exam.seconds')} />
      <Button title={t('exam.start')} onPress={start} disabled={running} />
      {skipLabel && onSkip ? <Button variant="ghost" title={skipLabel} onPress={() => { clear(); onSkip(); }} /> : null}
    </View>
  );
}
