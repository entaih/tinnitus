import { useEffect, useState } from 'react';
import { soundEngine, type Layer } from '@/audio/engine';
import type { SoundSpec } from '@/audio/sounds';

/**
 * Mixer state that sits on top of `soundEngine`: a master volume (already capped by the caller),
 * a per-layer mix level and mute flag. Effective engine volume = master × level, or 0 when muted.
 * Kept at module level so the full player and the mini-player agree.
 */
interface MixState {
  master: number;
  levels: Record<string, number>;
  muted: Record<string, boolean>;
  timerMinutes: number | null;
  /** When playback started (ms); null when paused/stopped. Used for session logging. */
  startedAt: number | null;
  /** Seconds accumulated before the current run (pause keeps the total). */
  accumulatedSec: number;
  /** Which named preset is loaded, for titles. */
  titleKey: string | null;
  presetId: string | null;
}

const state: MixState = { master: 0.5, levels: {}, muted: {}, timerMinutes: null, startedAt: null, accumulatedSec: 0, titleKey: null, presetId: null };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

const effective = (id: string) => (state.muted[id] ? 0 : state.master * (state.levels[id] ?? 1));

function applyVolumes() {
  for (const l of soundEngine.layers) soundEngine.setVolume(l.id, effective(l.id));
}

function markPlaying() {
  if (state.startedAt == null) state.startedAt = Date.now();
}
function markStopped() {
  if (state.startedAt != null) {
    state.accumulatedSec += (Date.now() - state.startedAt) / 1000;
    state.startedAt = null;
  }
}

export const mixer = {
  get state() { return state; },
  get master() { return state.master; },
  level: (id: string) => state.levels[id] ?? 1,
  isMuted: (id: string) => !!state.muted[id],
  timerMinutes: () => state.timerMinutes,

  setMaster(v: number) {
    state.master = Math.max(0, Math.min(1, v));
    applyVolumes();
    emit();
  },
  setLevel(id: string, v: number) {
    state.levels[id] = Math.max(0, Math.min(1, v));
    applyVolumes();
    emit();
  },
  toggleMute(id: string) {
    state.muted[id] = !state.muted[id];
    applyVolumes();
    emit();
  },
  setTimer(minutes: number | null) {
    state.timerMinutes = minutes;
    soundEngine.setTimer(minutes);
    emit();
  },
  setTitle(titleKey: string | null, presetId: string | null) {
    state.titleKey = titleKey; state.presetId = presetId; emit();
  },

  /** Start (or restart) a layer at its mix level. */
  async play(spec: SoundSpec, id: string, level = 1) {
    state.levels[id] = Math.max(0, Math.min(1, level));
    state.muted[id] = false;
    await soundEngine.play(spec, { id, volume: effective(id) });
    markPlaying();
    emit();
  },
  /** Replace everything with a preset's layers. */
  async load(layers: { id: string; spec: SoundSpec; level: number }[], master: number, timerMinutes: number | null, titleKey: string | null, presetId: string | null) {
    await soundEngine.stopAll();
    state.levels = {}; state.muted = {};
    state.master = Math.max(0, Math.min(1, master));
    state.titleKey = titleKey; state.presetId = presetId;
    for (const l of layers) {
      state.levels[l.id] = l.level;
      await soundEngine.play(l.spec, { id: l.id, volume: effective(l.id) });
    }
    state.timerMinutes = timerMinutes;
    soundEngine.setTimer(timerMinutes);
    markPlaying();
    emit();
  },
  async remove(id: string) {
    await soundEngine.stop(id);
    delete state.levels[id]; delete state.muted[id];
    if (!soundEngine.layers.length) { markStopped(); state.timerMinutes = null; soundEngine.setTimer(null); }
    emit();
  },
  pause() { soundEngine.pauseAll(); markStopped(); emit(); },
  resume() { soundEngine.resumeAll(); markPlaying(); emit(); },
  async stopAll() {
    await soundEngine.stopAll();
    markStopped();
    state.timerMinutes = null; state.levels = {}; state.muted = {};
    emit();
  },

  /** Seconds played in this session so far (running + accumulated). */
  elapsedSec(): number {
    return state.accumulatedSec + (state.startedAt != null ? (Date.now() - state.startedAt) / 1000 : 0);
  },
  /** Returns the whole minutes played so far and resets the counter (used for session logging). */
  takeElapsedMinutes(): number {
    const running = state.startedAt != null;
    markStopped();
    const sec = state.accumulatedSec;
    state.accumulatedSec = 0;
    if (running) state.startedAt = Date.now();
    return sec >= 30 ? Math.max(1, Math.round(sec / 60)) : 0;
  },
};

// Keep the elapsed counter honest when the engine's own sleep timer stops playback.
soundEngine.subscribe(() => {
  if (!soundEngine.layers.length && state.startedAt != null) { markStopped(); state.timerMinutes = null; emit(); }
});

export interface SoundEngineSnapshot {
  layers: Layer[];
  isPlaying: boolean;
  hasLayers: boolean;
  timerEndsAt: number | null;
  timerMinutes: number | null;
  master: number;
  titleKey: string | null;
  presetId: string | null;
  /** Bumps on every engine/mixer event. */
  version: number;
}

/** Subscribes to the sound engine and mixer; re-renders on every change. */
export function useSoundEngine(): SoundEngineSnapshot {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    const a = soundEngine.subscribe(bump);
    listeners.add(bump);
    return () => { a(); listeners.delete(bump); };
  }, []);
  return {
    layers: soundEngine.layers,
    isPlaying: soundEngine.isPlaying,
    hasLayers: soundEngine.layers.length > 0,
    timerEndsAt: soundEngine.timerEndsAt,
    timerMinutes: state.timerMinutes,
    master: state.master,
    titleKey: state.titleKey,
    presetId: state.presetId,
    version,
  };
}

/** Re-renders once a second while `active`; returns Date.now(). */
export function useTicker(active: boolean, ms = 1000): number {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return;
    setNow(Date.now());
    const iv = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(iv);
  }, [active, ms]);
  return now;
}

export const formatClock = (sec: number): string => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const mm = String(m).padStart(2, '0'), ss = String(r).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};
