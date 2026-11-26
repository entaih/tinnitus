import fs from 'node:fs';
import { buildProfile } from '../../src/clinical/engine';
import { generateProgram, taskKey, tasksForDay } from '../../src/clinical/program';
import type { Assessment } from '../../src/clinical/types';
const now = new Date(); const iso = (d: Date) => d.toISOString(); const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);
const a: Assessment = { id: 'a1', date: iso(daysAgo(9)), questionnaires: [
  { id: 'THI', date: iso(daysAgo(9)), answers: Array(25).fill(2), total: 50 },
  { id: 'PHQ9', date: iso(daysAgo(9)), answers: [1,1,0,0,0,0,0,0,0], total: 2, subscales: { screen: 2 } },
  { id: 'GAD7', date: iso(daysAgo(9)), answers: [1,1,0,0,0,0,0], total: 2, subscales: { screen: 2 } },
  { id: 'SCI02', date: iso(daysAgo(9)), answers: [1,1], total: 2 },
], redFlags: { suddenHearingLoss: false, unilateralSymptoms: false, pulsatile: false, vertigo: false, neuroSigns: false, otorrhoeaOrPain: false, headTrauma: false, selfHarm: false, rapidWorsening: false, objectiveSound: false, menierePattern: false, newOtotoxicDrug: false },
  history: { side: 'both', onset: '1to5y', pattern: 'constant', character: 'tonal', noiseExposure: true, hearingDifficulty: false, soundSensitivity: false, somaticModulation: false, neckOrJawPain: false, ototoxicMeds: false, earFullness: false, sleepProblem: true, stressWorsens: true, age: 62, priorAudiometry: true },
  psycho: { date: iso(daysAgo(8)), pitchHz: 4000 } as never, previewSeenAt: iso(daysAgo(9)) };
const p = generateProgram(buildProfile(a), { minutesPerDay: 15, style: 'cbt', pitchHz: 4000 }, daysAgo(9));
for (let i = 0; i < 9; i++) { if (i === 4 || i === 5) continue; const w = Math.floor(i / 7) + 1, d = (i % 7) + 1; for (const t of tasksForDay(p, w, d).slice(0, 2)) p.completed[taskKey(w, d, t.id)] = iso(daysAgo(9 - i)); }
const settings = { state: { onboarded: true, locale: 'tr', consentAt: iso(daysAgo(10)), displayName: '', headphoneCheckedAt: iso(daysAgo(8)) }, version: 0 };
const noProg = { state: { assessments: [a], diary: [], thoughts: [], sessions: [], program: null, readArticles: [], redFlagAcknowledgedAt: null }, version: 0 };
const prog = { state: { ...noProg.state, program: p, programPrefs: { minutesPerDay: 15, style: 'cbt' } }, version: 0 };
const profiles = { state: { profiles: [{ id: 'default', name: 'Ayşe', createdAt: iso(daysAgo(10)) }], activeId: 'default' }, version: 0 };
fs.writeFileSync(process.argv[2], JSON.stringify({ settings, clinicalNoProgram: noProg, clinicalProgram: prog, profiles }));
