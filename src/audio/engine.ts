import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';
import { BURST_FILE_LEVEL_DB, renderSound, renderToneBurst, specKey, toWavBytes, type SoundSpec } from './sounds';
import { dbToGain } from './dsp';

/**
 * Thin wrapper over expo-audio that plays synthesised WAV loops from the cache directory.
 * Works inside Expo Go (no custom native code). Up to `MAX_LAYERS` sounds can play at once
 * so a programme can mix e.g. notched noise + nature sound.
 */
const MAX_LAYERS = 3;
let audioModeReady = false;

async function ensureAudioMode() {
  if (audioModeReady) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'mixWithOthers',
      allowsRecording: false,
    });
  } catch (e) {
    console.warn('setAudioModeAsync failed', e);
  }
  audioModeReady = true;
}

const fileCache = new Map<string, string>();

/** Render (or reuse) the WAV for a spec and return its file:// URI. */
export async function materialize(spec: SoundSpec): Promise<string> {
  const key = specKey(spec);
  const cached = fileCache.get(key);
  if (cached) return cached;
  const dir = Paths.cache;
  const file = new File(dir, `dingin_${key}.wav`);
  if (!file.exists) {
    const rendered = renderSound(spec);
    const bytes = toWavBytes(rendered);
    await file.write(bytes);
  }
  fileCache.set(key, file.uri);
  return file.uri;
}

export type Channel = 'left' | 'right' | 'both';

/** Burst file rendered at BURST_FILE_LEVEL_DB; the presentation level is applied by the caller via player volume. */
export async function materializeBurst(freq: number, ms: number, warble = false, channel: Channel = 'both'): Promise<string> {
  const key = `burst2_${Math.round(freq)}_${ms}_${warble ? 'w' : 's'}_${channel}`;
  const cached = fileCache.get(key);
  if (cached) return cached;
  const file = new File(Paths.cache, `dingin_${key}.wav`);
  if (!file.exists) await file.write(toWavBytes(renderToneBurst(freq, ms, BURST_FILE_LEVEL_DB, warble, channel)));
  fileCache.set(key, file.uri);
  return file.uri;
}

/** Linear player volume that presents a burst at `levelDb` (dB re full scale, ≤ 0). Floor −90 dB. */
export function burstVolume(levelDb: number): number {
  const db = Math.max(-90, Math.min(0, levelDb));
  return Math.min(1, dbToGain(db - BURST_FILE_LEVEL_DB));
}

export interface Layer {
  id: string;
  spec: SoundSpec;
  player: AudioPlayer;
  volume: number;
}

type Listener = () => void;

class SoundEngine {
  layers: Layer[] = [];
  private listeners = new Set<Listener>();
  private timer: ReturnType<typeof setTimeout> | null = null;
  timerEndsAt: number | null = null;

  subscribe(l: Listener) { this.listeners.add(l); return () => { this.listeners.delete(l); }; }
  private emit() { this.listeners.forEach((l) => l()); }

  get isPlaying() { return this.layers.some((l) => l.player.playing); }

  async play(spec: SoundSpec, opts: { id?: string; volume?: number; replace?: boolean } = {}) {
    await ensureAudioMode();
    const id = opts.id ?? specKey(spec);
    if (opts.replace !== false) await this.stop(id);
    if (this.layers.length >= MAX_LAYERS) await this.stop(this.layers[0].id);
    const uri = await materialize(spec);
    const player = createAudioPlayer({ uri }, { updateInterval: 500 });
    player.loop = true;
    player.volume = opts.volume ?? 0.6;
    player.play();
    this.layers.push({ id, spec, player, volume: player.volume });
    this.emit();
    return id;
  }

  setVolume(id: string, volume: number) {
    const l = this.layers.find((x) => x.id === id);
    if (l) { l.volume = volume; l.player.volume = Math.max(0, Math.min(1, volume)); this.emit(); }
  }

  async stop(id: string) {
    const idx = this.layers.findIndex((x) => x.id === id);
    if (idx === -1) return;
    const [l] = this.layers.splice(idx, 1);
    try { l.player.pause(); l.player.remove(); } catch {}
    this.emit();
  }

  async stopAll() {
    for (const l of this.layers) { try { l.player.pause(); l.player.remove(); } catch {} }
    this.layers = [];
    this.clearTimer();
    this.emit();
  }

  pauseAll() { this.layers.forEach((l) => l.player.pause()); this.emit(); }
  resumeAll() { this.layers.forEach((l) => l.player.play()); this.emit(); }

  /** Sleep timer: fade out over the last 20 s then stop. */
  setTimer(minutes: number | null) {
    this.clearTimer();
    if (!minutes) { this.emit(); return; }
    this.timerEndsAt = Date.now() + minutes * 60_000;
    const fadeStart = Math.max(0, minutes * 60_000 - 20_000);
    this.timer = setTimeout(() => this.fadeOutAndStop(20_000), fadeStart);
    this.emit();
  }

  private clearTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.timerEndsAt = null;
  }

  private fadeOutAndStop(ms: number) {
    const steps = 20;
    const start = this.layers.map((l) => l.volume);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      this.layers.forEach((l, k) => { l.player.volume = start[k] * (1 - i / steps); });
      if (i >= steps) { clearInterval(iv); void this.stopAll(); }
    }, ms / steps);
  }
}

export const soundEngine = new SoundEngine();

/**
 * One-shot player for tone bursts (audiometry, pitch and loudness matching).
 * Level is expressed in dB relative to full scale of the generated tone (0 = reference).
 */
export async function playBurst(freq: number, opts: { ms?: number; levelDb?: number; warble?: boolean; channel?: Channel } = {}) {
  await ensureAudioMode();
  const ms = opts.ms ?? 1000;
  const levelDb = opts.levelDb ?? 0;
  const uri = await materializeBurst(freq, ms, opts.warble, opts.channel ?? 'both');
  const player = createAudioPlayer({ uri });
  // Monaural presentation uses a stereo file with one silent channel; level via float gain (no 16-bit shaping).
  player.volume = burstVolume(levelDb);
  player.play();
  setTimeout(() => { try { player.remove(); } catch {} }, ms + 300);
  return player;
}

/** Linear gain for a "dB below reference" level. */
export const levelGain = (db: number) => dbToGain(db);
