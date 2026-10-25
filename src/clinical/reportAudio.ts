/**
 * Doctor-summary lines for the hearing screen, psychoacoustic measures and the self-examination battery.
 * Every acoustic number carries its unit (dB re device full scale or dB SL), its method and the "not dB HL"
 * caveat, so a clinician can place it against a calibrated audiogram (audiologist review A1 / B10).
 * Pure: takes the merged assessment and a translate function; the results screen only concatenates.
 */
import type { Assessment, HearingScreenResult } from './types';
import type { TFn } from '@/i18n';
import { SCREEN_HL_UNCERTAINTY_DB, hearingAsymmetry, noiseNotch, pta4, toHlEstimate } from './engine';
import { SCREENING_FREQS, SCREENING_UNCERTAINTY_DB } from '@/audio/psychoacoustics';
import { DIN_SCORED_FROM_TRIAL, DIN_TRIALS, LDL_FREQS, ldlDynamicRangeDb } from '@/audio/examTests';

/** Bump when a presentation protocol changes so records from different app versions are not compared blindly. */
export const AUDIO_PROTOCOL_VERSION = '2026.10';

const fmtDb = (v: number) => `${Math.round(v) > 0 ? '+' : ''}${Math.round(v)}`;

function earRow(h: HearingScreenResult, ear: 'left' | 'right'): string | null {
  const cells = SCREENING_FREQS.map((f) => {
    const p = h.thresholds.find((x) => x.ear === ear && x.freq === f);
    return p ? fmtDb(p.levelDb) : '—';
  });
  if (cells.every((c) => c === '—')) return null;
  return `${SCREENING_FREQS.map((f) => (f >= 1000 ? `${f / 1000}k` : `${f}`)).join('/')} Hz: ${cells.join('/')}`;
}

/** Frequencies where the interaural difference is ≥ 10 dB (reported with the value) — the clinician sees why a flag fired. */
function asymmetryDetail(h: HearingScreenResult): string {
  const out: string[] = [];
  for (const f of SCREENING_FREQS) {
    const l = h.thresholds.find((x) => x.ear === 'left' && x.freq === f)?.levelDb;
    const r = h.thresholds.find((x) => x.ear === 'right' && x.freq === f)?.levelDb;
    if (l != null && r != null && Math.abs(l - r) >= 10) out.push(`${f} Hz: ${Math.round(Math.abs(l - r))} dB`);
  }
  return out.join(', ');
}

export function audioReportLines(a: Assessment, t: TFn): string[] {
  const lines: string[] = [];
  const h = a.hearing;
  const ps = a.psycho;
  const ex = a.exam;
  const yn = (v: boolean | null | undefined) => (v == null ? '—' : v ? t('common.yes') : t('common.no'));
  if (!h && !ps && !ex) return lines;

  lines.push(t('psy.rep.header', { unc: SCREENING_UNCERTAINTY_DB, v: AUDIO_PROTOCOL_VERSION }));

  // ---- hearing screen ----
  if (h) {
    const mode = h.mode ?? 'separate';
    const ears: ('right' | 'left')[] = mode === 'both' ? ['right'] : ['right', 'left'];
    for (const ear of ears) {
      const row = earRow(h, ear);
      if (row) lines.push(t('psy.rep.hear.ear', { ear: mode === 'both' ? t('psy.hear.ear.both') : t(`psy.hear.ear.${ear}`), rows: row }));
    }
    const p = pta4(a);
    if (p != null) {
      const hl = toHlEstimate(p);
      lines.push(t('psy.rep.hear.pta', { raw: fmtDb(p), hl, lo: hl - SCREEN_HL_UNCERTAINTY_DB, hi: hl + SCREEN_HL_UNCERTAINTY_DB }));
    }
    lines.push(t('psy.rep.hear.meta', {
      mode: t(`psy.hear.mode.${mode}`),
      hp: h.headphonesVerified ? t('psy.rep.yes') : t('psy.rep.no'),
      rel: h.reliability === 'low' ? t('psy.rep.hear.rel.low') : h.reliability === 'ok' ? t('psy.rep.hear.rel.ok') : t('psy.rep.hear.rel.na'),
      amb: h.ambientOk ? t('psy.rep.hear.amb.ok') : t('psy.rep.hear.amb.skipped'),
    }));
    if (mode !== 'both' && hearingAsymmetry(a)) lines.push(t('psy.rep.hear.asym', { d: asymmetryDetail(h) || '—' }));
    if (noiseNotch(a)) lines.push(t('psy.rep.hear.notch'));
    const notHeard = SCREENING_FREQS.filter((f) => ears.some((ear) => !h.thresholds.some((x) => x.ear === ear && x.freq === f)));
    if (notHeard.length && h.thresholds.length) lines.push(t('psy.rep.hear.notHeard', { f: notHeard.join(', ') }));
  }

  // ---- psychoacoustics ----
  if (ps) {
    if (ps.pitchHz != null) {
      lines.push(t('psy.rep.pitch', { hz: Math.round(ps.pitchHz), conf: t(`psy.pitch.conf.${ps.pitchConfidence ?? 'low'}`) }));
    }
    if (ps.loudnessDbSl != null) lines.push(t('psy.rep.loud', { db: Math.round(ps.loudnessDbSl), hz: ps.pitchHz != null ? Math.round(ps.pitchHz) : '—' }));
    if (ps.mmlDb != null || ps.mmlNotMaskable) {
      const stim = ps.mmlStimulus === 'nbn'
        ? t('psy.rep.stim.nbn', { hz: ps.mmlCenterHz ?? (ps.pitchHz != null ? Math.round(ps.pitchHz) : '—') })
        : ps.mmlStimulus === 'bbn' ? t('psy.rep.stim.bbn') : t('psy.rep.stim.unknown');
      if (ps.mmlNotMaskable) lines.push(t('psy.rep.mml.notMaskable', { stim, db: ps.mmlDb != null ? Math.round(ps.mmlDb) : '—' }));
      else lines.push(t('psy.rep.mml', { db: Math.round(ps.mmlDb ?? 0), stim }));
    }
    if (ps.riCategory != null || ps.riPositive != null) {
      const stim = ps.mmlStimulus === 'nbn'
        ? t('psy.rep.stim.nbn', { hz: ps.mmlCenterHz ?? (ps.pitchHz != null ? Math.round(ps.pitchHz) : '—') })
        : ps.mmlStimulus === 'bbn' ? t('psy.rep.stim.bbn') : t('psy.rep.stim.unknown');
      const pos = ps.riPositive == null ? '—' : ps.riPositive ? t('psy.rep.ri.positive') : t('psy.rep.ri.negative');
      lines.push(t('psy.rep.ri', {
        stim, pos,
        cat: ps.riCategory ? t(`psy.ri.cat.${ps.riCategory}`) : '—',
        depth: ps.riDepth != null ? Math.round(ps.riDepth * 100) : '—',
        dur: ps.residualInhibitionSec != null ? Math.round(ps.residualInhibitionSec) : '—',
      }));
    }
  }

  // ---- self-examination records ----
  if (ex) {
    if (ex.dinSrtDb != null) lines.push(t('psy.rep.exam.din', { db: ex.dinSrtDb.toFixed(1), n: DIN_TRIALS, from: DIN_SCORED_FROM_TRIAL }));
    if (ex.ldlDb != null) {
      const th = h?.thresholds.filter((x) => x.freq === LDL_FREQS[0]).map((x) => x.levelDb) ?? [];
      const best = th.length ? Math.min(...th) : null;
      const dr = ldlDynamicRangeDb(ex.ldlDb, best);
      lines.push(t('psy.rep.exam.ldl', { db: fmtDb(ex.ldlDb), hz: LDL_FREQS[0], dr: dr != null ? t('psy.rep.exam.ldl.dr', { db: dr, th: fmtDb(best ?? 0) }) : t('psy.rep.exam.ldl.noDr') }));
    }
    if (ex.valsalvaPop != null || ex.fullnessRelief != null) lines.push(t('psy.rep.exam.pressure', { pop: yn(ex.valsalvaPop), relief: yn(ex.fullnessRelief) }));
    if (ex.headTurnChange != null || ex.positionalChange != null) {
      lines.push(t('psy.rep.exam.vascular', { h: ex.headTurnChange ? t(`exam.vascular.${ex.headTurnChange}`) : '—', p: yn(ex.positionalChange) }));
      lines.push(t('psy.rep.exam.jugularClinic'));
    }
    if (ex.swayScore != null) lines.push(t('psy.rep.exam.sway', { s: ex.swayScore }));
    if (ex.somaticPositive != null) lines.push(t('psy.rep.exam.somatic', { v: yn(ex.somaticPositive) }));
  }

  return lines;
}
