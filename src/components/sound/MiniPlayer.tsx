import React from 'react';
import { Pressable, View } from 'react-native';
import { Square, Timer } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme';
import { Text } from '@/components/Text';
import { PlayControl } from '@/components/PlayControl';
import { Chip } from '@/components/Chip';
import { useT } from '@/i18n';
import { describeSpec } from '@/audio/sounds';
import { presetById } from '@/audio/presets';
import { useClinical } from '@/store/clinical';
import { formatClock, mixer, useSoundEngine, useTicker } from './useSoundEngine';

/** Persistent bar shown at the bottom of the Sound tab while something is loaded in the engine. */
export function MiniPlayer() {
  const { colors, radius, space } = useTheme();
  const t = useT();
  const router = useRouter();
  const eng = useSoundEngine();
  const now = useTicker(eng.hasLayers);
  const logSession = useClinical((s) => s.logSession);
  if (!eng.hasLayers) return null;

  const first = eng.layers[0];
  const preset = eng.presetId ? presetById(eng.presetId) : presetById(first.id);
  const baseName = eng.titleKey ? t(eng.titleKey) : preset ? t(preset.nameKey) : describeSpec(first.spec, t);
  const name = eng.layers.length > 1 ? `${baseName} +${eng.layers.length - 1}` : baseName;
  const remaining = eng.timerEndsAt ? Math.max(0, (eng.timerEndsAt - now) / 1000) : null;

  const stop = () => {
    const minutes = mixer.takeElapsedMinutes();
    if (minutes > 0) logSession({ type: 'sound', minutes, detail: JSON.stringify({ preset: eng.presetId ?? first.id, layers: eng.layers.map((l) => l.id) }) });
    void mixer.stopAll();
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('player.a11y.openPlayer', { name })}
      onPress={() => router.push('/sound/player')}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: space[3], backgroundColor: colors.card, borderRadius: radius.lg, padding: space[2], borderWidth: 1, borderColor: colors.border, opacity: pressed ? 0.9 : 1 })}
    >
      <PlayControl size={72} playing={eng.isPlaying} onPress={() => (eng.isPlaying ? mixer.pause() : mixer.resume())} accessibilityLabel={eng.isPlaying ? t('player.a11y.pause') : t('player.a11y.play')} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="bodyStrong" numberOfLines={1}>{name}</Text>
        <View style={{ flexDirection: 'row', gap: space[2], alignItems: 'center' }}>
          <Chip small tone={remaining != null ? 'primary' : 'neutral'} icon={<Timer size={14} color={remaining != null ? colors.primaryPressed : colors.textSecondary} />}
            label={remaining != null ? formatClock(remaining) : eng.isPlaying ? formatClock(mixer.elapsedSec()) : t('player.paused')} />
        </View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={t('common.stop')} onPress={stop} hitSlop={8}
        style={({ pressed }) => ({ width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}>
        <Square size={20} color={colors.textSecondary} fill={colors.textSecondary} />
      </Pressable>
    </Pressable>
  );
}
