import type { SoundSpec } from './sounds';

/**
 * Typed catalogue of every sound the Sound Lab offers.
 * Parameters follow docs/research/treatment.md §3.3 (level just below the mixing point,
 * notched noise 1 octave at pitch, narrow-band ±½ octave for residual inhibition).
 * Specs that depend on the user's pitch match carry `dynamic: 'pitch'` and are resolved with `resolveSpec`.
 */
export type PresetCategory = 'noise' | 'notched' | 'nature' | 'tone' | 'mix';
export type EvidenceLevel = 'guideline' | 'rct' | 'expert';

export interface SoundPreset {
  id: string;
  spec: SoundSpec;
  nameKey: string;
  descKey: string;
  category: PresetCategory;
  evidence?: EvidenceLevel;
  citation?: string;
  experimental?: boolean;
  /** Spec centre frequency is replaced by the user's pitch match at runtime. */
  dynamic?: 'pitch';
  /** Suggested starting volume (0..1) before the safety cap. */
  defaultVolume?: number;
}

const PLACEHOLDER_HZ = 4000;

export const PRESETS: SoundPreset[] = [
  // --- Gürültü ---
  { id: 'noise.pink', spec: { kind: 'noise', color: 'pink' }, nameKey: 'sound.noise.pink', descKey: 'preset.desc.pink', category: 'noise', evidence: 'guideline', citation: 'sereda2018', defaultVolume: 0.5 },
  { id: 'noise.brown', spec: { kind: 'noise', color: 'brown' }, nameKey: 'sound.noise.brown', descKey: 'preset.desc.brown', category: 'noise', evidence: 'guideline', citation: 'sereda2018', defaultVolume: 0.5 },
  { id: 'noise.white', spec: { kind: 'noise', color: 'white' }, nameKey: 'sound.noise.white', descKey: 'preset.desc.white', category: 'noise', evidence: 'guideline', citation: 'sereda2018', defaultVolume: 0.4 },
  { id: 'am.40', spec: { kind: 'am', color: 'pink', rateHz: 40, depth: 0.8 }, nameKey: 'preset.name.am40', descKey: 'preset.desc.am40', category: 'noise', evidence: 'expert', experimental: true, defaultVolume: 0.4 },
  // --- Çentikli ---
  { id: 'notched.pink', spec: { kind: 'notched', color: 'pink', centerHz: PLACEHOLDER_HZ, octaves: 1 }, nameKey: 'preset.name.notched', descKey: 'preset.desc.notched', category: 'notched', evidence: 'rct', citation: 'okamoto2010', experimental: true, dynamic: 'pitch', defaultVolume: 0.5 },
  // --- Ton ---
  { id: 'narrowband.pitch', spec: { kind: 'narrowband', color: 'white', centerHz: PLACEHOLDER_HZ, octaves: 0.5 }, nameKey: 'preset.name.narrowband', descKey: 'preset.desc.narrowband', category: 'tone', evidence: 'rct', citation: 'sendesen2024', dynamic: 'pitch', defaultVolume: 0.5 },
  { id: 'binaural.6', spec: { kind: 'binaural', carrierHz: 200, beatHz: 6 }, nameKey: 'preset.name.binaural', descKey: 'preset.desc.binaural', category: 'tone', evidence: 'expert', experimental: true, defaultVolume: 0.4 },
  // --- Doğa ---
  { id: 'nature.rain', spec: { kind: 'nature', preset: 'rain' }, nameKey: 'sound.nature.rain', descKey: 'preset.desc.rain', category: 'nature', evidence: 'guideline', citation: 'sereda2018', defaultVolume: 0.5 },
  { id: 'nature.ocean', spec: { kind: 'nature', preset: 'ocean' }, nameKey: 'sound.nature.ocean', descKey: 'preset.desc.ocean', category: 'nature', evidence: 'guideline', citation: 'sereda2018', defaultVolume: 0.5 },
  { id: 'nature.stream', spec: { kind: 'nature', preset: 'stream' }, nameKey: 'sound.nature.stream', descKey: 'preset.desc.stream', category: 'nature', evidence: 'guideline', citation: 'sereda2018', defaultVolume: 0.5 },
  { id: 'nature.wind', spec: { kind: 'nature', preset: 'wind' }, nameKey: 'sound.nature.wind', descKey: 'preset.desc.wind', category: 'nature', evidence: 'guideline', citation: 'sereda2018', defaultVolume: 0.5 },
  { id: 'nature.fan', spec: { kind: 'nature', preset: 'fan' }, nameKey: 'sound.nature.fan', descKey: 'preset.desc.fan', category: 'nature', evidence: 'guideline', citation: 'sereda2018', defaultVolume: 0.5 },
  // --- Karışım / yardımcı ---
  { id: 'silence', spec: { kind: 'silence', seconds: 10 }, nameKey: 'sound.silence', descKey: 'preset.desc.silence', category: 'mix', defaultVolume: 0 },
];

export const presetById = (id: string): SoundPreset | undefined => PRESETS.find((p) => p.id === id);

export const presetsByCategory = (c: PresetCategory): SoundPreset[] => PRESETS.filter((p) => p.category === c);

export interface ResolveContext {
  pitchHz?: number;
  /** Notch / band width override in octaves. */
  octaves?: number;
}

/** Fill the user's pitch (and optional width) into a dynamic preset. Returns null if the pitch is required but missing. */
export function resolveSpec(preset: SoundPreset, ctx: ResolveContext = {}): SoundSpec | null {
  const s = preset.spec;
  if (preset.dynamic === 'pitch') {
    if (!ctx.pitchHz) return null;
    if (s.kind === 'notched' || s.kind === 'narrowband') {
      return { ...s, centerHz: Math.round(ctx.pitchHz), octaves: ctx.octaves ?? s.octaves };
    }
  }
  return s;
}

/** Curated multi-layer combinations opened through /sound/player?preset=… */
export type NamedPreset = 'enrichment' | 'sleep' | 'hyperacusis' | 'notched' | 'ri' | 'custom';

export interface PresetLayer { id: string; spec: SoundSpec; level: number }

export interface ResolvedPreset {
  layers: PresetLayer[];
  /** Master volume before the safety cap. */
  volume: number;
  timerMinutes: number | null;
  titleKey: string;
  presetId?: string;
}

export interface NamedPresetContext extends ResolveContext {
  customSpec?: SoundSpec;
  customId?: string;
  mixingPoint?: number | null;
  /**
   * Enrichment auto-tune (Sprint 2 C2): when set, a narrow-band (±½ octave) layer centred on this frequency is mixed
   * under the pink-noise bed at `TUNE_BAND_LEVEL`. Decided by `tuneFor()`; absent → plain pink noise.
   */
  tuneHz?: number;
  /** Mix level of the tuned narrow-band layer (0..1); default 0.35. */
  tuneLevel?: number;
  /** Hyperacusis start level (linear gain) from the stored comfortable level (Sprint 2 C3); default 0.25. */
  hyperVolume?: number;
}

export function resolveNamedPreset(name: NamedPreset, ctx: NamedPresetContext): ResolvedPreset | null {
  switch (name) {
    case 'enrichment': {
      const layers: PresetLayer[] = [{ id: 'noise.pink', spec: { kind: 'noise', color: 'pink' }, level: 1 }];
      if (ctx.tuneHz && ctx.tuneHz > 0) {
        layers.push({ id: 'narrowband.pitch', spec: { kind: 'narrowband', color: 'white', centerHz: Math.round(ctx.tuneHz), octaves: 0.5 }, level: ctx.tuneLevel ?? 0.35 });
      }
      return { layers, volume: ctx.mixingPoint ?? 0.5, timerMinutes: null, titleKey: 'player.preset.enrichment', presetId: 'noise.pink' };
    }
    case 'sleep':
      return {
        layers: [
          { id: 'noise.brown', spec: { kind: 'noise', color: 'brown' }, level: 1 },
          { id: 'nature.ocean', spec: { kind: 'nature', preset: 'ocean' }, level: 0.45 },
        ],
        volume: 0.4, timerMinutes: 90, titleKey: 'player.preset.sleep', presetId: 'noise.brown',
      };
    case 'hyperacusis':
      return { layers: [{ id: 'noise.pink', spec: { kind: 'noise', color: 'pink' }, level: 1 }], volume: ctx.hyperVolume ?? 0.25, timerMinutes: 30, titleKey: 'player.preset.hyperacusis', presetId: 'noise.pink' };
    case 'notched': {
      if (!ctx.pitchHz) return null;
      const spec: SoundSpec = { kind: 'notched', color: 'pink', centerHz: Math.round(ctx.pitchHz), octaves: ctx.octaves ?? 1 };
      return { layers: [{ id: 'notched.pink', spec, level: 1 }], volume: ctx.mixingPoint ?? 0.5, timerMinutes: null, titleKey: 'player.preset.notched', presetId: 'notched.pink' };
    }
    case 'ri': {
      if (!ctx.pitchHz) return null;
      const spec: SoundSpec = { kind: 'narrowband', color: 'white', centerHz: Math.round(ctx.pitchHz), octaves: 0.5 };
      return { layers: [{ id: 'narrowband.pitch', spec, level: 1 }], volume: 0.5, timerMinutes: null, titleKey: 'player.preset.ri', presetId: 'narrowband.pitch' };
    }
    case 'custom': {
      if (!ctx.customSpec) return null;
      const id = ctx.customId ?? 'custom';
      const p = presetById(id);
      return { layers: [{ id, spec: ctx.customSpec, level: 1 }], volume: p?.defaultVolume ?? 0.5, timerMinutes: null, titleKey: p?.nameKey ?? 'player.preset.custom', presetId: p?.id };
    }
  }
}

/** Linear gain multiplier for a dB change. */
export const dbStep = (db: number) => Math.pow(10, db / 20);

/**
 * Hyperacusis graded exposure (Formby 2015; Vernon & Press 1998): start clearly comfortable,
 * raise ~2–3 dB per week. Returns the suggested linear volume for a programme week, before the safety cap.
 */
export function hyperacusisWeekVolume(week: number, start = 0.25, perWeekDb = 2.5): number {
  const w = Math.max(1, Math.floor(week));
  return Math.min(0.7, start * dbStep((w - 1) * perWeekDb));
}
