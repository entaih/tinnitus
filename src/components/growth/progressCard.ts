/**
 * Pure helpers behind the shareable progress card (app/share.tsx). No UI, no storage — testable in node.
 * The card only ever shows the user's own numbers; wording stays descriptive ("THI 48 → 36"), never a claim.
 */
import type { Assessment, DiaryEntry, Program, QuestionnaireResult } from '@/clinical/types';
import type { SessionLog } from '@/store/clinical';

export interface ProgressStats {
  /** Chronological THI totals (oldest first). */
  thi: { date: string; total: number }[];
  thiFirst: number | null;
  thiLatest: number | null;
  /** latest − first; negative is improvement. */
  thiChange: number | null;
  /** 1-based week number on the programme, or null without a programme. */
  programWeek: number | null;
  /** Distinct calendar days with a diary entry, a logged session or a completed task. */
  activeDays: number;
  sessionsCount: number;
}

export function thiSeries(assessments: Assessment[]): { date: string; total: number }[] {
  const all: QuestionnaireResult[] = [];
  for (const a of assessments) for (const q of a.questionnaires) if (q.id === 'THI') all.push(q);
  return all.sort((a, b) => a.date.localeCompare(b.date)).map((q) => ({ date: q.date.slice(0, 10), total: q.total }));
}

export function computeProgressStats(input: { assessments: Assessment[]; program: Program | null; diary: DiaryEntry[]; sessions: SessionLog[] }, now = new Date()): ProgressStats {
  const thi = thiSeries(input.assessments);
  const thiFirst = thi.length ? thi[0].total : null;
  const thiLatest = thi.length ? thi[thi.length - 1].total : null;
  const thiChange = thi.length >= 2 && thiFirst != null && thiLatest != null ? thiLatest - thiFirst : null;

  let programWeek: number | null = null;
  if (input.program) {
    const start = new Date(`${input.program.startDate}T00:00:00`);
    const days = Math.floor((now.getTime() - start.getTime()) / 86_400_000);
    programWeek = Math.max(1, Math.floor(Math.max(0, days) / 7) + 1);
  }

  const days = new Set<string>();
  for (const d of input.diary) days.add(d.date.slice(0, 10));
  for (const s of input.sessions) days.add(s.date.slice(0, 10));
  if (input.program) for (const iso of Object.values(input.program.completed)) days.add(iso.slice(0, 10));

  return { thi, thiFirst, thiLatest, thiChange, programWeek, activeDays: days.size, sessionsCount: input.sessions.length };
}

/** THI grade label key for a total (McCombe 2001 bands, same as questionnaires.ts). */
export function thiBandKey(total: number): 'none' | 'mild' | 'moderate' | 'severe' | 'catastrophic' {
  if (total <= 16) return 'none';
  if (total <= 36) return 'mild';
  if (total <= 56) return 'moderate';
  if (total <= 76) return 'severe';
  return 'catastrophic';
}

/** Polyline points for a tiny sparkline inside a w×h box (THI is 0–100). */
export function sparklinePoints(series: { total: number }[], w: number, h: number, pad = 4): string {
  if (!series.length) return '';
  const n = series.length;
  const x = (i: number) => (n === 1 ? w / 2 : pad + (i * (w - 2 * pad)) / (n - 1));
  const y = (v: number) => pad + ((100 - Math.max(0, Math.min(100, v))) * (h - 2 * pad)) / 100;
  return series.map((p, i) => `${x(i).toFixed(1)},${y(p.total).toFixed(1)}`).join(' ');
}

/** Builds the plain-text version of the card (used by Share.share and as the PDF body). */
export function buildShareText(stats: ProgressStats, labels: { appName: string; thi: string; week: string; activeDays: string; footer: string; bandOf: (total: number) => string; noThi: string }): string {
  const lines: string[] = [labels.appName];
  if (stats.thiFirst != null && stats.thiLatest != null) {
    const arrow = stats.thi.length >= 2 ? ` → ${stats.thiLatest} (${labels.bandOf(stats.thiLatest)})` : '';
    lines.push(`${labels.thi}: ${stats.thiFirst} (${labels.bandOf(stats.thiFirst)})${arrow}`);
  } else {
    lines.push(labels.noThi);
  }
  if (stats.programWeek != null) lines.push(`${labels.week}: ${stats.programWeek}`);
  lines.push(`${labels.activeDays}: ${stats.activeDays}`);
  lines.push('');
  lines.push(labels.footer);
  return lines.join('\n');
}

/** Minimal HTML for the expo-print fallback; colours are passed in so the page matches the theme. */
export function buildCardHtml(opts: { title: string; lines: string[]; footer: string; accent: string; mark: string }): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  body{font-family:-apple-system,Helvetica,Arial,sans-serif;margin:0;padding:32px;color:#0F1422}
  .card{border:2px solid ${opts.accent};border-radius:24px;padding:28px;max-width:520px}
  .mark{font-weight:700;color:${opts.accent};font-size:14px;letter-spacing:1px;text-transform:uppercase}
  h1{font-size:26px;margin:8px 0 16px}
  .line{font-size:18px;margin:6px 0}
  .foot{margin-top:20px;font-size:12px;color:#5B6478}
  </style></head><body><div class="card"><div class="mark">${esc(opts.mark)}</div><h1>${esc(opts.title)}</h1>
  ${opts.lines.map((l) => `<div class="line">${esc(l)}</div>`).join('')}
  <div class="foot">${esc(opts.footer)}</div></div></body></html>`;
}
