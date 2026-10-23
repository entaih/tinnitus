# Tinnitus app in Expo Go — verified technical plan (Expo SDK 58, Oct 23 2026)

## How this was verified

`docs.expo.dev` and `expo.dev` are blocked from this sandbox, so every Expo fact below was taken from the
**source of the docs and packages on the `sdk-58` branch of `github.com/expo/expo`** (raw files), which is what
docs.expo.dev/versions/v58.0.0 renders. Third-party facts come from the libraries' GitHub READMEs/sources or from
web-search snippets of official pages. Each claim is tagged:

- **[V]** = verified against SDK 58 docs/source quoted below
- **[I]** = inferred (engineering judgement, or behaviour deduced from source but not run on a device)

### SDK 58 baseline [V]
`packages/expo/package.json` on `sdk-58`: `expo@58.0.16`, `react-native@0.88.0`, `react@19.3.0`, `typescript ~6.0.3`.
Bundled versions (`bundledNativeModules.json`, what `npx expo install` picks): `expo-audio ~58.0.9`,
`expo-file-system ~58.0.10`, `expo-notifications ~58.1.5`, `expo-router ~58.0.24`, `expo-haptics ~58.0.7`,
`expo-linear-gradient ~58.0.3`, `expo-keep-awake ~58.0.3`, `expo-sqlite ~58.0.13`,
`@react-native-async-storage/async-storage 2.2.0`, `react-native-reanimated 4.7.1`, `react-native-worklets 0.13.0`,
`react-native-svg 15.16.0`, `@shopify/react-native-skia 2.14.0`, `react-native-gesture-handler ~3.3.0`,
`react-native-screens ~4.30.0`, `react-native-safe-area-context ~5.10.1`.

Expo Go's own `apps/expo-go/package.json` (sdk-58) depends on `expo-audio`, `expo-haptics`, `expo-linear-gradient`,
`expo-notifications`, `expo-router`, `expo-sqlite`, `async-storage 2.2.0`, `skia 2.14.0`, `svg 15.16.0`,
`reanimated 4.7.1`, `worklets 0.13.0`, `gesture-handler ~3.3.0` — i.e. all of those are compiled into Expo Go. [V]
`react-native-mmkv` and `react-native-audio-api` are **not** in `bundledNativeModules.json` nor in Expo Go. [V]

**Expo Go store status (important):** the SDK 58 docs still say "During the SDK 58 transition period,
`create-expo-app@latest` without the `--template` flag creates an SDK 57 project. If you plan to use Expo Go on a
physical device, use an SDK 57 project. Otherwise, use `--template default@sdk-58`." [V] A web search of the Apple
App Store listing shows Expo Go **58.0.5, "adds support for SDK 58", released ~Oct 22 2026** [search snippet, treat as
likely but confirm in the store]; Google Play status unconfirmed. Each Expo Go build supports exactly one SDK, so if
the store build is still 57 you must either scaffold SDK 57 or install the SDK 58 Expo Go from https://expo.dev/go
(Android APK / iOS simulator) or `eas go` (iOS TestFlight). [V]

---

## 1. Audio playback with `expo-audio` (in Expo Go) [V unless noted]

`expo-audio` doc frontmatter: `platforms: ['android', 'ios', 'web', 'tvos', 'expo-go']`. `expo-av` is not part of
the SDK 58 story; use `expo-audio`.

### API surface (from `packages/expo-audio/src/*.ts`, sdk-58)

```ts
import {
  useAudioPlayer, useAudioPlayerStatus, createAudioPlayer, setAudioModeAsync,
  useAudioRecorder, useAudioRecorderState, RecordingPresets, AudioModule,
} from 'expo-audio';

// AudioSource = string | number | null | { uri?: string; assetId?: number; headers?: ...; name?: string }
//   uri: "an HTTPS address, a local file path, or the name of a static audio file resource"
// useAudioPlayer(source: AudioSource = null, options: AudioPlayerOptions = {})
// AudioPlayerOptions = { updateInterval?: number (500); downloadFirst?: boolean (false);
//   keepAudioSessionActive?: boolean (false); preferredForwardBufferDuration?: number (0);
//   allowsExternalPlayback?: boolean (true, iOS) }
// createAudioPlayer(source, options) -> you MUST call player.release() yourself (docs) [V]
// AudioPlayer props: playing, muted, loop, paused, isLoaded, isBuffering, currentTime, duration,
//   volume (0.0..1.0), playbackRate, shouldCorrectPitch, currentStatus
// AudioPlayer methods: play(), pause(), replace(source), seekTo(seconds), setPlaybackRate(),
//   setAudioSamplingEnabled(), setActiveForLockScreen(active, metadata?, options?),
//   updateLockScreenMetadata(), clearLockScreenControls(), remove()
```

`useAudioPlayer` re-creates the native player whenever `JSON.stringify(source)` changes (verified in
`ExpoAudio.ts`). For a generated-sound app prefer one long-lived player made with `createAudioPlayer(null)` and swap
files with `player.replace({ uri })`.

### Audio mode (`setAudioModeAsync(Partial<AudioMode>)`) — exact SDK 58 keys [V]

```ts
export type AudioMode = {
  playsInSilentMode: boolean;        // default true. Android: when false, suppressed in silent/vibrate ringer mode
  interruptionMode: 'mixWithOthers' | 'doNotMix' | 'doNotMixPersistent' | 'duckOthers'; // default 'mixWithOthers'
  interruptionModeAndroid?: InterruptionMode; // deprecated
  allowsRecording: boolean;          // default false, iOS (switches to .playAndRecord)
  shouldPlayInBackground: boolean;   // default false  <-- this replaces expo-av's staysActiveInBackground
  shouldRouteThroughEarpiece: boolean; // default false; iOS only effective when allowsRecording = true
  allowsBackgroundRecording?: boolean;
};
```
There is **no** `staysActiveInBackground` key in expo-audio; the key is `shouldPlayInBackground`. [V]

Recommended for a sound-therapy player:
```ts
await setAudioModeAsync({
  playsInSilentMode: true,          // iOS mute switch / Android silent mode still plays
  shouldPlayInBackground: true,     // keep session alive when screen locks (see caveats below)
  interruptionMode: 'duckOthers',   // or 'mixWithOthers' if you want podcasts to keep playing
  allowsRecording: false,
});
```

### Playing a local WAV from the cache directory [V]

```ts
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { File, Paths } from 'expo-file-system';

const file = new File(Paths.cache, `tone_${hash}.wav`);
await file.write(wavBytes);                 // Uint8Array — see section 2
const player = createAudioPlayer({ uri: file.uri }); // file.uri is a file:// URI
player.loop = true;
player.volume = 0.6;
player.play();
// later: player.pause(); player.replace({ uri: other.uri }); player.release();
```
`Paths.cache` → `Directory(ExpoFileSystem.cacheDirectory)`, and `File.uri` is a `file://` string. [V]

### `data:audio/wav;base64,...` URIs
- **iOS [V]:** `AudioUtils.swift` has `isBase64Audio` (`absoluteString.hasPrefix("data:audio/")`) and
  `handleBase64Asset` which base64-decodes and writes a temp file, then plays it. So data URIs work, but it is
  literally "write a temp file" under the hood — you gain nothing over writing the file yourself, and you pay for
  shipping a multi-MB string across the bridge.
- **Android [I, strong]:** `createMediaItem` does `MediaItem.fromUri(uri)` with `DefaultDataSource.Factory(context)`
  (AudioModule.kt L1124-1140). Media3's `DefaultDataSource` routes the `data` scheme to `DataSchemeDataSource`
  (verified in androidx/media `DefaultDataSource.java` L269-270), so a `data:` URI should play. Not tested on device.
- **Recommendation:** always write `file://` WAVs with expo-file-system; avoid base64 entirely.

### Looping / gapless caveats
- **iOS [V from source]:** `AudioPlayer.swift` uses an `AVQueuePlayer`; when `loop` is true it pre-enqueues a second
  `AVPlayerItem(asset: currentItem.asset)` and sets `actionAtItemEnd = .advance`, re-enqueuing on each
  `AVPlayerItemDidPlayToEndTime`. This is the standard "near-gapless" approach, not an `AVPlayerLooper`; a seam of a
  few ms is possible. (Changelog 58.0.x: "[iOS] Improve looping support", and `preferredForwardBufferDuration`
  re-applied on loop items.) `allowsExternalPlayback: false` is noted as fixing `loop` not firing during AirPlay. [V]
- **Android [V from source]:** `player.ref.repeatMode = Player.REPEAT_MODE_ONE` on ExoPlayer; for uncompressed WAV
  this is effectively seamless. [I]
- **Mitigation [I]:** make the loop content itself seamless so any seam is inaudible: for tones choose the loop
  length as an integer number of periods (and of the warble period) so the file ends at phase 0; for noise, crossfade
  the last ~50 ms into the first ~50 ms (equal-power) before writing; use 10-20 s loops so a seam happens rarely.
  Zero-start/zero-end also avoids clicks. If a user still hears a click, build a 2-item `AudioPlaylist` (also in
  expo-audio) — but the queue approach above is already what expo-audio does.
- Docs: "Note that audio automatically stops if headphones/Bluetooth audio devices are disconnected." [V]

### Background audio in Expo Go (screen lock)
- **iOS [V]:** Expo Go's `apps/expo-go/ios/Exponent/Supporting/Info.plist` already contains
  `UIBackgroundModes = [audio, fetch, location, remote-notification, processing]`. The docs say "On iOS, audio
  playback continues seamlessly in the background once the audio session is configured with
  `shouldPlayInBackground: true`." So in Expo Go on iOS, sound keeps playing when the screen locks. Lock-screen
  controls (`setActiveForLockScreen`) are optional on iOS.
- **Android [V manifest + docs, I conclusion]:** Expo Go's Android manifest (`template-files/android/AndroidManifest.xml`
  on sdk-58) declares `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK` and the **expo-video** service
  (`expo.modules.video.playbackService.ExpoVideoPlaybackService`), but **not** `expo.modules.audio.service.AudioControlsService`
  (which the `expo-audio` config plugin would add to your own app's manifest). The docs: "On Android, you have to
  enable the lock screen controls with `setActiveForLockScreen` for sustained background playback. Otherwise, the
  audio will stop after approximately 3 minutes of background playback (OS limitation)." Because the service is not
  declared in Expo Go, expect: **~3 minutes of playback after the screen locks on Android in Expo Go, then it stops**
  (the module logs "Failed to start the expo-audio foreground service for lock screen controls" and warns about audio
  focus). You cannot fix this inside Expo Go; a development build with the `expo-audio` plugin
  (`enableBackgroundPlayback: true`) fixes it.
- **Pragmatic Expo Go workaround [V API, I UX]:** `expo-keep-awake` is in Expo Go; call `useKeepAwake()` on the
  player screen so the screen does not lock while a session runs, and tell Android users to keep the app in the
  foreground. Add a sleep timer that stops playback cleanly.

### Does `expo-audio` have any synthesis API? **No.** [V]
The SDK 58 surface is `AudioPlayer`, `AudioPlaylist`, `AudioRecorder`, `AudioStream` (microphone PCM **capture**
with `onBuffer`, float32/int16 — input only) and `useAudioSampleListener` (reads samples from a playing player).
Nothing can be fed PCM for output. The docs explicitly point to React Native Audio API for synthesis, which is
**not available in Expo Go** (Software Mansion docs: "the library contains native custom code and isn't part of the
Expo Go application ... you have to use Expo development build"). [V via search snippet of official docs]

---

## 2. Generating audio in JS → WAV → file [V for I/O APIs, I for DSP/perf]

Because there is no synthesis API, the only Expo Go path is: synthesise PCM in JS → wrap as WAV → write with
expo-file-system → play with expo-audio. No `wav-encoder`/`@expo/wav` needed (a WAV header is 44 bytes; the code
below is complete). `wav-encoder` would work (pure JS) but adds nothing.

### expo-file-system SDK 58 class API [V, from `NativeFileSystem.types.ts` + docs]
```ts
import { File, Directory, Paths } from 'expo-file-system';
// new File(...uris: (string | File | Directory)[])   e.g. new File(Paths.cache, 'x.wav')
// file.uri: string (file://), file.exists: boolean, file.size: number, file.type: string (mime)
// file.create(options?: { intermediates?, overwrite? }): void   -- optional; write() creates the file
// file.write(content: string | Uint8Array | ArrayBuffer, options?: { encoding?: 'utf8'|'base64'; append?: boolean }): Promise<void>
// file.writeSync(content, options?): void
// file.bytes(): Promise<Uint8Array>, bytesSync(), base64(), base64Sync(), text(), textSync()
// file.delete(): void ; file.open(FileMode) -> FileHandle (readBytes/writeBytes, offset)
// Paths.cache / Paths.document : Directory ; Directory.list(), create({ idempotent: true })
// Legacy API: import * as FileSystem from 'expo-file-system/legacy'
```
Docs example (verbatim): `const src = new File(Paths.cache, 'file.pdf'); await src.write(await response.bytes());`
— so `write(Uint8Array)` is the intended binary path; **no base64 needed**. [V]

### Complete generator (TypeScript, pure JS, Hermes-safe)

```ts
// audio/synth.ts
export type SoundSpec =
  | { kind: 'tone'; freq: number; warbleHz?: number; warbleDepth?: number /* 0..1 of freq */ }
  | { kind: 'noise'; color: 'white' | 'pink' | 'brown' }
  | { kind: 'notched'; color: 'white' | 'pink'; centerHz: number; widthOct: number }
  | { kind: 'am'; color: 'white' | 'pink'; modHz: number /* 40 */; depth: number /* 0..1 */ }
  | { kind: 'binaural'; carrierHz: number; beatHz: number };

export const SAMPLE_RATE = 44100;

// ---------- helpers ----------
function makeNoise(n: number, color: 'white' | 'pink' | 'brown', rnd = Math.random): Float32Array {
  const out = new Float32Array(n);
  if (color === 'white') {
    for (let i = 0; i < n; i++) out[i] = rnd() * 2 - 1;
  } else if (color === 'pink') {
    // Paul Kellet's economy pink filter
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < n; i++) {
      const w = rnd() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      out[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  } else {
    // brown: leaky integrator of white
    let last = 0;
    for (let i = 0; i < n; i++) {
      const w = rnd() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      out[i] = last * 3.5;
    }
  }
  return out;
}

// RBJ biquad (Audio EQ Cookbook). Direct form I, in place.
type Biquad = { b0: number; b1: number; b2: number; a1: number; a2: number };
function lowpass(fc: number, q: number, fs = SAMPLE_RATE): Biquad {
  const w0 = (2 * Math.PI * fc) / fs, cs = Math.cos(w0), al = Math.sin(w0) / (2 * q);
  const a0 = 1 + al;
  return { b0: ((1 - cs) / 2) / a0, b1: (1 - cs) / a0, b2: ((1 - cs) / 2) / a0, a1: (-2 * cs) / a0, a2: (1 - al) / a0 };
}
function highpass(fc: number, q: number, fs = SAMPLE_RATE): Biquad {
  const w0 = (2 * Math.PI * fc) / fs, cs = Math.cos(w0), al = Math.sin(w0) / (2 * q);
  const a0 = 1 + al;
  return { b0: ((1 + cs) / 2) / a0, b1: (-(1 + cs)) / a0, b2: ((1 + cs) / 2) / a0, a1: (-2 * cs) / a0, a2: (1 - al) / a0 };
}
function runBiquad(x: Float32Array, c: Biquad): Float32Array {
  const y = new Float32Array(x.length);
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const x0 = x[i];
    const y0 = c.b0 * x0 + c.b1 * x1 + c.b2 * x2 - c.a1 * y1 - c.a2 * y2;
    x2 = x1; x1 = x0; y2 = y1; y1 = y0; y[i] = y0;
  }
  return y;
}
// 4th-order Butterworth = two cascaded biquads with Q = 0.5412 and 1.3066
const BW4_Q = [0.5411961, 1.3065630];

/** Notched noise: sum of a steep low-passed copy below the notch and a steep high-passed copy above it.
 *  Cheap (8 multiplies/sample/stage), arbitrary notch width, and much deeper than a single RBJ notch. */
function notchedNoise(n: number, color: 'white' | 'pink', centerHz: number, widthOct: number): Float32Array {
  const src = makeNoise(n, color);
  const lo = centerHz * Math.pow(2, -widthOct / 2);
  const hi = centerHz * Math.pow(2, widthOct / 2);
  let low = src, high = src;
  for (const q of BW4_Q) { low = runBiquad(low, lowpass(lo, q)); high = runBiquad(high, highpass(Math.min(hi, SAMPLE_RATE * 0.45), q)); }
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = low[i] + high[i];
  return out;
}

function normalize(x: Float32Array, peak = 0.8): void {
  let m = 1e-9;
  for (let i = 0; i < x.length; i++) { const a = Math.abs(x[i]); if (a > m) m = a; }
  const g = peak / m;
  for (let i = 0; i < x.length; i++) x[i] *= g;
}

/** Equal-power crossfade of the tail into the head so the loop seam is silent. */
function makeLoopSeamless(x: Float32Array, fadeSamples: number): void {
  const n = x.length;
  for (let i = 0; i < fadeSamples; i++) {
    const t = i / fadeSamples;
    const a = Math.cos(t * Math.PI / 2), b = Math.sin(t * Math.PI / 2);
    x[i] = x[i] * b + x[n - fadeSamples + i] * a;
  }
  // drop the tail we folded into the head
  // (caller slices: x.subarray(0, n - fadeSamples))
}

// ---------- main ----------
export function render(spec: SoundSpec, seconds: number): { left: Float32Array; right?: Float32Array; sampleRate: number } {
  const fs = SAMPLE_RATE;
  let n = Math.round(seconds * fs);

  if (spec.kind === 'tone') {
    // choose n so the loop ends at an integer number of cycles of both carrier and warble LFO -> seamless
    // (the lowest periodic component is the warble LFO when present, otherwise the carrier)
    const base = spec.warbleHz ? spec.warbleHz : spec.freq;
    const cycles = Math.max(1, Math.round(seconds * base));
    n = Math.round((cycles * fs) / base); // ends within one sample of phase 0
    const out = new Float32Array(n);
    const depth = spec.warbleDepth ?? 0;
    let phase = 0;
    for (let i = 0; i < n; i++) {
      const t = i / fs;
      const f = spec.freq * (1 + depth * Math.sin(2 * Math.PI * (spec.warbleHz ?? 0) * t)); // FM "warble"
      phase += (2 * Math.PI * f) / fs;
      out[i] = Math.sin(phase);
    }
    // short fade-in/out (5 ms) in case rounding left a tiny discontinuity
    const f5 = Math.round(fs * 0.005);
    for (let i = 0; i < f5; i++) { out[i] *= i / f5; out[n - 1 - i] *= i / f5; }
    normalize(out, 0.5);
    return { left: out, sampleRate: fs };
  }

  if (spec.kind === 'binaural') {
    const L = new Float32Array(n), R = new Float32Array(n);
    const fL = spec.carrierHz, fR = spec.carrierHz + spec.beatHz;
    for (let i = 0; i < n; i++) { const t = i / fs; L[i] = 0.5 * Math.sin(2 * Math.PI * fL * t); R[i] = 0.5 * Math.sin(2 * Math.PI * fR * t); }
    const f = Math.round(fs * 0.05); // 50 ms crossfade for the seam
    makeLoopSeamless(L, f); makeLoopSeamless(R, f);
    return { left: L.subarray(0, n - f), right: R.subarray(0, n - f), sampleRate: fs };
  }

  let x: Float32Array;
  if (spec.kind === 'noise') x = makeNoise(n, spec.color);
  else if (spec.kind === 'notched') x = notchedNoise(n, spec.color, spec.centerHz, spec.widthOct);
  else { // 'am'
    x = makeNoise(n, spec.color);
    for (let i = 0; i < n; i++) {
      const m = 1 - spec.depth / 2 + (spec.depth / 2) * Math.sin(2 * Math.PI * spec.modHz * (i / fs));
      x[i] *= m;
    }
  }
  normalize(x, 0.8);
  const fade = Math.round(fs * 0.05);
  makeLoopSeamless(x, fade);
  return { left: x.subarray(0, n - fade), sampleRate: fs };
}

// ---------- WAV (PCM16 LE) ----------
export function encodeWav(left: Float32Array, right: Float32Array | undefined, sampleRate: number): Uint8Array {
  const channels = right ? 2 : 1;
  const frames = left.length;
  const dataBytes = frames * channels * 2;
  const buf = new ArrayBuffer(44 + dataBytes);
  const dv = new DataView(buf);
  const str = (o: number, s: string) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); dv.setUint32(4, 36 + dataBytes, true); str(8, 'WAVE');
  str(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, channels, true);
  dv.setUint32(24, sampleRate, true); dv.setUint32(28, sampleRate * channels * 2, true);
  dv.setUint16(32, channels * 2, true); dv.setUint16(34, 16, true);
  str(36, 'data'); dv.setUint32(40, dataBytes, true);
  let o = 44;
  for (let i = 0; i < frames; i++) {
    let s = Math.max(-1, Math.min(1, left[i])); dv.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2;
    if (right) { s = Math.max(-1, Math.min(1, right[i])); dv.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2; }
  }
  return new Uint8Array(buf);
}
```

### Writing and caching the file [V API]
```ts
// audio/files.ts
import { File, Directory, Paths } from 'expo-file-system';
import { render, encodeWav, SoundSpec } from './synth';

const dir = new Directory(Paths.cache, 'sounds');

export async function ensureSoundFile(spec: SoundSpec, seconds = 15): Promise<string> {
  dir.create({ idempotent: true, intermediates: true });
  const key = JSON.stringify({ spec, seconds }).replace(/[^a-z0-9]/gi, '').slice(0, 80);
  const file = new File(dir, `${key}.wav`);
  if (!file.exists) {
    // give the UI a frame before the (sub-second) synchronous render
    await new Promise(r => setTimeout(r, 0));
    const { left, right, sampleRate } = render(spec, seconds);
    await file.write(encodeWav(left, right, sampleRate)); // Uint8Array -> no base64
  }
  return file.uri; // file:///.../sounds/<key>.wav
}
```
Cache files can be purged by the OS; `file.exists` handles regeneration. Use `Paths.document` if you prefer
persistence. Use a param-derived filename so `player.replace({uri})` always sees new content (never overwrite
a file the native player may still have open). [I]

### Base64 (only if you ever need it) [I]
Do not do `btoa(String.fromCharCode(...bytes))` — spreading a ~2 MB array overflows the stack on Hermes. I could not
verify from docs whether Hermes/RN 0.88 exposes global `btoa` (it has for several releases, but Hermes's `atob` is
known to be strict about padding). Prefer `File.write(Uint8Array)`. If you must, a chunked pure-JS encoder:
```ts
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
export function toBase64(bytes: Uint8Array): string {
  const parts: string[] = [];
  let s = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i], b = bytes[i + 1], c = bytes[i + 2];
    s += B64[a >> 2] + B64[((a & 3) << 4) | (b >> 4)] + (b === undefined ? '=' : B64[((b & 15) << 2) | (c >> 6)]) + (c === undefined ? '=' : B64[c & 63]);
    if (s.length > 65536) { parts.push(s); s = ''; }
  }
  parts.push(s);
  return parts.join('');
}
```
(`file.write(str, { encoding: 'base64' })` also exists if you have a base64 string. [V])

### Size / time budget [I]
- 44.1 kHz × 15 s mono = 661,500 samples: Float32 2.6 MB + WAV 1.3 MB. Stereo doubles the WAV. Keep loops at
  **10-20 s**, mono unless binaural.
- Cost per sample: tone ≈ 1 `sin` + a few mults; pink ≈ 10 mults; notched ≈ noise + 4 biquads (~40 flops). On
  Hermes with typed arrays expect roughly 50-400 ms for a 15 s mono buffer on a mid-range phone, i.e. well under 1 s;
  it blocks the JS thread for that long, so show a spinner / `await setTimeout(0)` first. `Math.random()` dominates
  for noise; it is fine. Do not use plain arrays or `push`; preallocate `Float32Array`.
- Hermes typed arrays and `DataView` are fully supported; avoid `Array.from(typedArray)` and spread.

### Volume fades [I]
expo-audio has no fade API. Ramp `player.volume` in a 30-50 ms `setInterval` for fade-in/out and sleep-timer
fade-outs.

---

## 3. Microphone metering for an "is it quiet enough?" check [V]

`RecordingOptions.isMeteringEnabled?: boolean` — "determines whether audio level information will be part of the
status object under the `metering` key". `RecorderState.metering?: number` is available via `recorder.getStatus()`
or `useAudioRecorderState(recorder)`.
Units (from native source): iOS `AVAudioRecorder.averagePower(forChannel: 0)` (dBFS, ≤ 0); Android
`20 * log10(MediaRecorder.maxAmplitude / 32767)` (dBFS, ≤ 0; 0 amplitude → very negative). These are **relative dBFS,
not calibrated dB SPL** — use thresholds like "> -35 dBFS = noisy" and calibrate empirically. [V units, I thresholds]

```tsx
import { useEffect } from 'react';
import { useAudioRecorder, useAudioRecorderState, RecordingPresets, AudioModule, setAudioModeAsync } from 'expo-audio';

export function useAmbientLevel(active: boolean) {
  const recorder = useAudioRecorder({ ...RecordingPresets.LOW_QUALITY, isMeteringEnabled: true });
  const state = useAudioRecorderState(recorder, 200); // metering in state.metering (dBFS)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!active) return;
      const perm = await AudioModule.requestRecordingPermissionsAsync();
      if (!perm.granted || cancelled) return;
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
    })();
    return () => {
      cancelled = true;
      recorder.stop().catch(() => {});
      setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }); // back to playback category
    };
  }, [active]);
  return state.metering; // undefined until recording
}
```
Notes: Expo Go's Android manifest has `RECORD_AUDIO` and the recording Snack is an Expo Go sample, so this works in
Expo Go [V]. On iOS `allowsRecording: true` switches the session to `.playAndRecord`; set it back to `false` before
starting therapy playback, otherwise output may be quieter/routed differently. Delete the throwaway recording file
(`recorder.uri`) afterwards. [I]

---

## 4. Headphone / output-route detection: **no public API in Expo Go** [V]

expo-audio exposes no output-route query or route-change event to JS (the iOS module observes
`AVAudioSession.routeChangeNotification` internally only to pause). What exists:
- Docs: playback "automatically stops if headphones/Bluetooth audio devices are disconnected" → you can detect
  an unexpected `playing: false` via `useAudioPlayerStatus` and show "headphones disconnected?". [V]
- Heuristic via **input** devices (needs mic permission): `recorder.getAvailableInputs(): RecordingInput[]`
  returns `{ name, type, uid }`. iOS maps `AVAudioSessionPortDescription.portType` raw values
  (`"MicrophoneBuiltIn"`, `"MicrophoneWired"` = headset mic, `"BluetoothHFP"`), Android maps
  `TYPE_BUILTIN_MIC → "MicrophoneBuiltIn"`, `TYPE_WIRED_HEADSET → "MicrophoneWired"`, `TYPE_BLUETOOTH_SCO → "BluetoothSCO"`
  (AudioUtils.kt / AudioUtils.swift). Any input other than `MicrophoneBuiltIn` strongly suggests a headset with a mic
  (AirPods, wired earbuds); headphones without a mic are invisible. [V mapping, I heuristic]
- **Recommendation:** show an explicit "Put on headphones (required for binaural/notched therapy)" gate with a
  confirm button, optionally pre-ticked when the heuristic finds a non-built-in input.

---

## 5. Local notifications (daily reminders) in Expo Go [V]

SDK 58 notifications doc (verbatim): "Push notifications (remote notifications) functionality provided by
`expo-notifications` is unavailable in Expo Go on Android from SDK 53. A development build is required to use push
notifications. **Local notifications (in-app notifications) remain available in Expo Go.**" Expo Go's Android
manifest still declares the `ScheduledNotificationReceiver`/`SchedulingTriggerReceiver` for scheduled
notifications. [V]

```ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false,
  }),
});

export async function scheduleDailyReminder(hour: number, minute: number) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Daily reminders', importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;
  await Notifications.cancelAllScheduledNotificationsAsync();
  return Notifications.scheduleNotificationAsync({
    content: { title: 'Tinnitus check-in', body: 'Log today\'s level and do a 10-min session.' },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: 'reminders' },
  });
}
```
`DailyTriggerInput = { type: SchedulableTriggerInputTypes.DAILY; channelId?: string; hour: number; minute: number; delivery?: NotificationDelivery }`. [V]
Also available: `TIME_INTERVAL` (`seconds`, `repeats`), `DATE`, `WEEKLY`, `CALENDAR` (iOS). Expo Go on Android
may log a warning about remote push — ignore it; never call `getExpoPushTokenAsync` in Expo Go.

---

## 6. Storage [V]

| Library | In Expo Go? | Notes |
|---|---|---|
| `@react-native-async-storage/async-storage` 2.2.0 | **Yes** (`platforms: [... 'expo-go']`, bundled in Expo Go) | simple, async, JSON strings |
| `expo-sqlite` ~58.0.13 | **Yes** (`platforms: [... 'expo-go']`) | use if you want queries over daily logs |
| `react-native-mmkv` | **No** (JSI/Nitro native code; not in Expo Go nor bundledNativeModules) | dev build only |

Recommended: **zustand + AsyncStorage persist**.
```bash
npx expo install @react-native-async-storage/async-storage
npm i zustand
```
```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Entry = { date: string; loudness: number; distress: number; note?: string };
type State = { entries: Entry[]; profile: { tinnitusHz?: number; preset?: string }; addEntry: (e: Entry) => void };

export const useStore = create<State>()(
  persist(
    (set) => ({
      entries: [], profile: {},
      addEntry: (e) => set((s) => ({ entries: [...s.entries.filter(x => x.date !== e.date), e] })),
    }),
    { name: 'tinnitus-store', storage: createJSONStorage(() => AsyncStorage), version: 1 },
  ),
);
```
(zustand is pure JS — nothing to verify against Expo Go.)

---

## 7. Charts [V availability, I recommendation]

- `react-native-svg` 15.16.0: in Expo Go (`platforms` includes `expo-go`). **Yes.**
- `@shopify/react-native-skia` 2.14.0: **also in Expo Go** (`inExpoGo: true`) in SDK 58 — so `victory-native` (XL)
  is *technically* possible (its README needs Reanimated, Gesture Handler and Skia; babel plugin auto-configured by
  `babel-preset-expo`). Risk: it pins its own peer ranges and you cannot change the Skia/Reanimated versions Expo Go
  ships (2.14.0 / 4.7.1). Avoid unless you want to debug version mismatches.
- `react-native-gifted-charts`: peer deps are `react-native-svg` + `expo-linear-gradient` (both in Expo Go); README
  gives `npx expo install react-native-gifted-charts expo-linear-gradient react-native-svg`. **Recommended** for
  a 30-day loudness/distress line chart, or just hand-roll a `<Polyline>` with `react-native-svg` (one file, zero
  deps) — which is what I'd do for 2-3 small charts.

---

## 8. expo-router (SDK 58) + utilities [V]

- `expo-router` is now version-aligned with the SDK (`~58.0.24`), entry `"main": "expo-router/entry"`.
- File conventions: routes live in **`src/app/`** (the SDK 58 default template; plain `app/` still works). Root
  `src/app/_layout.tsx` replaces `App.tsx`; `(tabs)` group with `(tabs)/_layout.tsx` + `(tabs)/index.tsx` etc.
  Three tab flavours: **JavaScript tabs** (`Tabs` from `expo-router`, React Navigation bottom tabs, bundled since
  SDK 56), **native tabs** (`expo-router/unstable-native-tabs`, used by the default template on iOS/Android), and
  **custom tabs** (`expo-router/ui`). For predictability in Expo Go use the JS `Tabs`:

```tsx
// src/app/_layout.tsx
import { Stack } from 'expo-router';
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="session" options={{ presentation: 'modal', title: 'Session' }} />
    </Stack>
  );
}
```
```tsx
// src/app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#4f46e5' }}>
      <Tabs.Screen name="index"   options={{ title: 'Sounds',  tabBarIcon: ({ color }) => <FontAwesome name="volume-up" size={24} color={color} /> }} />
      <Tabs.Screen name="match"   options={{ title: 'Match',   tabBarIcon: ({ color }) => <FontAwesome name="sliders" size={24} color={color} /> }} />
      <Tabs.Screen name="journal" options={{ title: 'Journal', tabBarIcon: ({ color }) => <FontAwesome name="book" size={24} color={color} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <FontAwesome name="cog" size={24} color={color} /> }} />
    </Tabs>
  );
}
```
- `expo-haptics` ~58.0.7 (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`, `selectionAsync()`) — bundled
  in Expo Go (listed in Expo Go's package.json; the doc frontmatter happens to omit the `expo-go` tag but the package
  is an Expo-Go-bundled module). [V]
- `expo-linear-gradient` ~58.0.3 — in Expo Go. [V]
- `react-native-reanimated` 4.7.1 + `react-native-worklets` 0.13.0 — in Expo Go; install both:
  `npx expo install react-native-reanimated react-native-worklets`; Babel plugin configured by `babel-preset-expo`. [V]
- `expo-keep-awake` ~58.0.3 — `useKeepAwake()` hook / `activateKeepAwake()`; in Expo Go. [V]
- SDK 58 note from the upgrade post (search snippet): Strict TypeScript API is default and `InteractionManager`
  was removed from RN 0.88 — use `setTimeout`/`requestAnimationFrame` instead. [I, from blog snippet]

---

## 9. Scaffold and run [V]

```bash
# SDK 58 project (explicit template tag is REQUIRED during the transition period):
npx create-expo-app@latest tinnitus --template default@sdk-58     # Expo Router + tabs + TS (src/app, native tabs)
#   or minimal:  npx create-expo-app@latest tinnitus --template blank-typescript@sdk-58   (no router)
#   or:          npx create-expo-app@latest tinnitus --template tabs@sdk-58               (router + JS tabs)
cd tinnitus
npx expo install expo-audio expo-file-system expo-notifications expo-haptics expo-linear-gradient \
  expo-keep-awake @react-native-async-storage/async-storage react-native-svg react-native-reanimated react-native-worklets
npm i zustand
npx expo-doctor@latest        # sanity-check versions
npx expo start                # LAN; press a / i for emulator/simulator
npx expo start --tunnel       # if phone and laptop are on different networks (slower reloads)
```
Templates available: `default`, `blank`, `blank-typescript`, `tabs`, `bare-minimum` (`--template <name>@sdk-58`).
If you start from `default`, run `npm run reset-project` to clear the demo screens.

On the phone: install **Expo Go** (must be the SDK 58 build — App Store listing shows 58.0.5 "adds support for
SDK 58" as of ~Oct 22 2026; verify, and on Android grab the SDK 58 APK from https://expo.dev/go if Play lags),
scan the QR code (Camera app on iOS, Expo Go's scanner on Android). **iOS physical device:** "Expo Go opens your
project only when Expo CLI and Expo Go are signed in to the same Expo account. Run `npx expo login` on your
computer, then sign in to Expo Go with the same account." If you see "Project is incompatible with this version of
Expo Go", the SDK in `package.json` (`expo` version) ≠ Expo Go's SDK: fix one side (`npx expo install --fix`).

Do **not** add the `expo-audio` config plugin to `app.json` for Expo Go (plugins are ignored there, harmless, but
background-playback on Android will still not work — see §1). Keep it in `app.json` anyway so a later
`eas build --profile development` gets background audio for free:
```json
{ "expo": { "plugins": [["expo-audio", { "microphonePermission": "Used to check that your room is quiet enough for the hearing test.", "enableBackgroundPlayback": true }]] } }
```

---

## 10. Pitfalls checklist

1. **Hermes + big arrays [I]:** preallocate `Float32Array`/`Uint8Array`; never spread or `Array.from` them;
   `DataView` writes are fine. A 15 s mono WAV is ~1.3 MB — trivial for `File.write`.
2. **Generation time [I]:** 44.1 k × 15 s ≈ 0.66 M samples → typically 50-400 ms on Hermes, synchronous; show a
   spinner and cache by spec hash. Stay ≤ 20 s per loop.
3. **Sample rate [I]:** iPhone hardware runs at 48 kHz, most Androids 48 kHz; the OS resamples 44.1 k WAVs silently.
   Pick 44100 (classic, smaller) or 48000 (no resampling); either is fine. Keep tones ≤ ~16 kHz (tinnitus
   matching range 125 Hz-12 kHz) and far below Nyquist.
4. **iOS silent switch [V]:** `playsInSilentMode` defaults to `true` in expo-audio, but set it explicitly in
   `setAudioModeAsync` on app start. On Android `playsInSilentMode: false` would mute in silent/vibrate mode.
5. **Interruptions [V]:** phone call → player pauses (interruption handling is native); re-check
   `useAudioPlayerStatus(player).playing` and offer "resume". `'doNotMix'` is required if you ever call
   `setActiveForLockScreen` (docs note).
6. **Background on Android in Expo Go [V+I]:** ~3-minute cap once the screen is off (no `AudioControlsService` in
   Expo Go's manifest). Use `useKeepAwake()` + sleep timer; tell users; dev build fixes it.
7. **Headphone unplug [V]:** playback auto-pauses; surface it in UI.
8. **Player lifecycle [V]:** `useAudioPlayer` recreates the native player when the source object changes; use a
   single `createAudioPlayer` kept in a ref/zustand and `replace({uri})`; call `release()` on unmount.
9. **File overwrite while playing [I]:** write new spec → new filename; delete old files lazily (`Directory.list()`).
10. **Loudness safety [I]:** cap `player.volume` (e.g. 0.8) and normalise generated audio to -2 dBFS peak;
    noise feels louder than tones at the same peak — use RMS-based gain per sound type.
11. **Base64/`btoa` [I]:** unverified on RN 0.88 Hermes; avoid by writing bytes.
12. **Expo Go ≠ production [V docs]:** "Expo Go is a learning environment and sandbox. For a production project,
    create a development build." Plan to graduate to a dev build for background audio + proper permissions text.

## Source files consulted (all `expo/expo` @ `sdk-58` unless noted)
docs/pages/versions/v58.0.0/sdk/{audio,filesystem,notifications,sqlite,async-storage,svg,keep-awake,haptics,linear-gradient,reanimated,skia}.mdx;
docs/pages/get-started/{create-a-project,start-developing}.mdx; docs/pages/more/create-expo.mdx; docs/pages/router/{basics/core-concepts,advanced/tabs,installation}.mdx;
docs/pages/troubleshooting/expo-go-version-mismatch.mdx; packages/expo/{package.json,bundledNativeModules.json};
packages/expo-audio/src/{Audio.types,AudioModule.types,ExpoAudio,AudioStream.types}.ts, CHANGELOG.md, ios/{AudioUtils,AudioPlayer,AudioModule,AudioRecorder}.swift,
android/.../{AudioModule,AudioPlayer,AudioRecorder,AudioUtils}.kt, android/.../service/AudioControlsService.kt, plugin/src/withAudio.ts;
packages/expo-file-system/src/{File,Paths,index}.ts, src/internal/NativeFileSystem.types.ts, src/File.types.ts;
packages/expo-notifications/src/{Notifications.types,scheduleNotificationAsync}.ts; apps/expo-go/{package.json, ios/Exponent/Supporting/Info.plist, android/expoview/src/main/AndroidManifest.xml};
template-files/android/AndroidManifest.xml; templates/expo-template-{default,blank-typescript}/package.json;
androidx/media `DefaultDataSource.java`; FormidableLabs/victory-native-xl README; react-native-gifted-charts README + package.json;
web-search snippets of expo.dev SDK 58 changelog/upgrade post, Apple App Store Expo Go listing, docs.swmansion.com react-native-audio-api getting-started.
