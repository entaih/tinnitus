/**
 * "Bu puan şunu değiştirdi" — one source for the 1–3 lines shown after every scale, on the results screen
 * ("Programınızı belirleyen şeyler") and after the week 4/8/12 measurements (PM sprint 1 §1.4).
 * Pure: returns i18n keys + params, never copy. Every key says what the *programme / assessment* does; none
 * promises a cure.
 */
import type { QuestionnaireId } from './questionnaires';
import { QUESTIONNAIRES, scoreQuestionnaire } from './questionnaires';
import type { Assessment, QuestionnaireResult } from './types';

export type ConsequenceTone = 'info' | 'success' | 'warning' | 'danger';
type TFn = (key: string, params?: Record<string, string | number>) => string;
export interface Consequence { key: string; params?: Record<string, string | number>; tone: ConsequenceTone }

export interface ScoredAnswers { total: number; subscales?: Record<string, number>; answers: number[] }

/** THI minimal clinically important difference (Newman 1996 / Zeman 2011). */
export const THI_MCID = 7;
/** THI increase treated as worsening (adaptationAdvice uses the same threshold). */
export const THI_WORSE = 11;

const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${Math.abs(n)}` : '0');

/**
 * Two-item screeners (PHQ-2 / GAD-2) store zeros for the unasked items and `{ screen: 2 }` as a marker.
 * Fallback for imported results: first two items below the cutoff and nothing in items 3–8 (PHQ item 9 may be set).
 */
const screenedOut = (s: ScoredAnswers, gateItems = 2, cutoff = 3) => {
  if (s.subscales?.screen != null) return true;
  const first = s.answers.slice(0, gateItems).reduce((acc, b) => acc + (b ?? 0), 0);
  return first < cutoff && s.answers.slice(gateItems, 8).every((x) => !x);
};

/**
 * Lines for one scale. `prev` is the previous result of the same scale (THI only is interpreted as change).
 * `a` supplies context (acute onset shortens the programme).
 */
export function consequencesOf(id: QuestionnaireId, scored: ScoredAnswers, a: Assessment | null, prev?: QuestionnaireResult | null): Consequence[] {
  const out: Consequence[] = [];
  const t = scored.total;
  const push = (key: string, tone: ConsequenceTone, params?: Record<string, string | number>) => out.push({ key, tone, params });

  switch (id) {
    case 'THI': {
      const band = QUESTIONNAIRES.THI.interpret(t).band;
      if (prev && prev.id === 'THI') {
        const drop = prev.total - t;
        if (drop >= THI_MCID) push('consequence.thi.change.good', 'success', { d: drop });
        else if (drop <= -THI_WORSE) push('consequence.thi.change.worse', 'warning', { d: -drop });
        else push('consequence.thi.change.flat', 'info', { d: signed(-drop) });
      } else if (a?.history?.onset === 'lt3m') push('consequence.thi.length4', 'info', { t, band: `severity.${band}` });
      else if (t <= 36) push('consequence.thi.length6', 'info', { t });
      else push('consequence.thi.length12', 'info', { t, band: `severity.${band}` });
      if (t >= 58) push('consequence.thi.tier2', 'warning');
      if ((scored.subscales?.C ?? 0) >= 8) push('consequence.thi.catastrophizing', 'info');
      if ((scored.answers[0] ?? 0) + (scored.answers[17] ?? 0) >= 4) push('consequence.thi.attention', 'info');
      break;
    }
    case 'SCI02':
      push(t <= 2 ? 'consequence.sci02.pos' : 'consequence.sci02.neg', 'info');
      break;
    case 'SCI':
      push(t <= 16 ? 'consequence.sci02.pos' : 'consequence.sci02.neg', 'info');
      break;
    case 'THS':
      push((scored.answers[0] ?? 0) >= 2 ? 'consequence.ths.pos' : 'consequence.ths.neg', 'info');
      break;
    case 'HQ':
      if (t >= 28) push('consequence.hq.strong', 'info', { t });
      else push(t >= 16 ? 'consequence.ths.pos' : 'consequence.ths.neg', 'info');
      break;
    case 'RASST':
      push(t >= 2 ? 'consequence.rasst.pos' : 'consequence.rasst.neg', 'info');
      break;
    case 'PHQ9': {
      if ((scored.answers[8] ?? 0) > 0) push('consequence.phq.item9', 'danger');
      if (screenedOut(scored)) push('consequence.phq.screenedOut', 'success');
      else if (t >= 15) push('consequence.phq.high', 'warning');
      else if (t >= 10) push('consequence.phq.moderate', 'warning');
      else push('consequence.phq.low', 'success');
      break;
    }
    case 'GAD7': {
      if (screenedOut(scored)) push('consequence.gad.screenedOut', 'success');
      else if (t >= 15) push('consequence.gad.pos', 'warning');
      else if (t >= 10) push('consequence.gad.moderate', 'info');
      else push('consequence.gad.low', 'success');
      break;
    }
    default:
      break;
  }
  return out;
}

/** Pitch match and residual inhibition lines (phone measurements that set the sound programme). */
export function psychoConsequences(a: Assessment | null): Consequence[] {
  const ps = a?.psycho;
  const out: Consequence[] = [];
  if (!ps) return out;
  if (ps.pitchHz != null) out.push({ key: 'consequence.pitch', tone: 'info', params: { hz: Math.round(ps.pitchHz) } });
  const ri = ps.riPositive ?? (ps.riCategory ? ps.riCategory === 'complete' : undefined);
  if (ri === true) out.push({ key: 'consequence.ri.pos', tone: 'info' });
  if (ri === false) out.push({ key: 'consequence.ri.neg', tone: 'info' });
  return out;
}

const RESULTS_ORDER: QuestionnaireId[] = ['THI', 'SCI02', 'SCI', 'THS', 'HQ', 'RASST', 'PHQ9', 'GAD7'];

/**
 * Results-screen card: the first line of every completed scale (short screen or its full form, not both),
 * followed by pitch / RI, capped at `max` lines.
 */
export function profileConsequences(a: Assessment | null, max = 5): Consequence[] {
  if (!a) return [];
  const out: Consequence[] = [];
  const seen = new Set<string>();
  for (const id of RESULTS_ORDER) {
    const family = id === 'SCI02' || id === 'SCI' ? 'sleep' : id === 'THS' || id === 'HQ' ? 'sound' : id;
    if (seen.has(family)) continue;
    const r = a.questionnaires.find((q) => q.id === id);
    if (!r) continue;
    const scored = scoreQuestionnaire(QUESTIONNAIRES[id], r.answers);
    const lines = consequencesOf(id, { total: scored.total, subscales: { ...scored.subscales, ...(r.subscales ?? {}) }, answers: r.answers }, a);
    if (lines.length) { out.push(lines[0]); seen.add(family); }
  }
  out.push(...psychoConsequences(a));
  return out.slice(0, max);
}

/** Resolve a consequence to copy; params that are themselves i18n keys (severity bands) are translated first. */
export function consequenceText(t: TFn, c: Consequence): string {
  const params: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(c.params ?? {})) params[k] = typeof v === 'string' && v.startsWith('severity.') ? t(v) : v;
  return t(c.key, params);
}
