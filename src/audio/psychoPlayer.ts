import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { materialize, materializeBurst } from './engine';
import type { SoundSpec } from './sounds';
import { dbToVolume } from './psychoacoustics';

/**
 * One-shot stimulus playback for the psychoacoustic modules (pitch, loudness, MML, RI).
 * Every call returns a handle whose `stop()` is safe to call more than once; the module also keeps
 * a registry so a screen can `stopAllOneShots()` on unmount.
 */
export interface OneShotHandle {
  player: AudioPlayer;
  /** Resolves when the stimulus has finished (or was stopped). */
  finished: Promise<void>;
  stop: () => void;
}

const active = new Set<OneShotHandle>();
let modeReady = false;

async function ensurePlaybackMode() {
  if (modeReady) return;
  try {
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'mixWithOthers', allowsRecording: false });
  } catch (e) {
    console.warn('setAudioModeAsync failed', e);
  }
  modeReady = true;
}

/** Call after a microphone session so the next one-shot re-applies the playback audio mode. */
export function invalidatePlaybackMode() { modeReady = false; }

function start(uri: string, ms: number, volume: number): OneShotHandle {
  const player = createAudioPlayer({ uri });
  player.loop = false;
  player.volume = Math.max(0, Math.min(1, volume));
  let done = false;
  let resolveFinished: () => void = () => {};
  const finished = new Promise<void>((res) => { resolveFinished = res; });
  const handle: OneShotHandle = {
    player,
    finished,
    stop: () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      active.delete(handle);
      try { player.pause(); player.remove(); } catch {}
      resolveFinished();
    },
  };
  const timer = setTimeout(handle.stop, ms + 250);
  active.add(handle);
  try { player.play(); } catch (e) { console.warn('one-shot play failed', e); handle.stop(); }
  return handle;
}

/**
 * Render a spec once (not looped) and play it for `ms` milliseconds at a linear `volume` (0..1).
 * The spec's own `seconds` should be ≥ ms / 1000; the loop fade of the renderer gives a soft offset.
 */
export async function playSpecOnce(spec: SoundSpec, ms: number, volume = 0.5): Promise<OneShotHandle> {
  await ensurePlaybackMode();
  const uri = await materialize(spec);
  return start(uri, ms, volume);
}

/**
 * Tone burst at a level in dB re full scale (level is rendered into the file; player volume stays 1).
 * The caller is responsible for clamping `levelDb` to the user's cap (see applyLevelCap).
 */
export async function playToneOnce(freq: number, opts: { ms?: number; levelDb?: number; warble?: boolean } = {}): Promise<OneShotHandle> {
  await ensurePlaybackMode();
  const ms = opts.ms ?? 1000;
  const levelDb = Math.max(-80, Math.min(0, opts.levelDb ?? 0));
  const uri = await materializeBurst(freq, ms, levelDb, opts.warble ?? false);
  return start(uri, ms, 1);
}

/** Narrow-band (1/3-octave) noise burst centred on `centerHz`, played at `levelDb` via player volume. */
export async function playNarrowbandOnce(centerHz: number, opts: { ms?: number; levelDb?: number } = {}): Promise<OneShotHandle> {
  const ms = opts.ms ?? 1500;
  const spec: SoundSpec = { kind: 'narrowband', color: 'white', centerHz: Math.round(centerHz), octaves: 0.33, seconds: Math.ceil(ms / 1000) + 0.5 };
  return playSpecOnce(spec, ms, dbToVolume(opts.levelDb ?? -6));
}

/** Stop every one-shot started through this module (call on unmount). */
export function stopAllOneShots() {
  for (const h of [...active]) h.stop();
}

export const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
