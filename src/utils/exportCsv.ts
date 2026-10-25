/**
 * CSV export of the user's own records (diary entries + questionnaire totals).
 * Pure builder (testable) + a share helper using expo-file-system's class API and expo-sharing.
 */
import type { Assessment, DiaryEntry } from '@/clinical/types';

const esc = (v: string | number | undefined | null) => {
  if (v == null) return '';
  const s = String(v);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export interface CsvInput { diary: DiaryEntry[]; assessments: Assessment[] }

/** Builds a single CSV with a `kind` column so one file holds both record types. */
export function buildCsv({ diary, assessments }: CsvInput): string {
  const lines: string[] = ['kind,date,instrument,total,loudness,annoyance,mood,sleepQuality,note'];
  for (const d of [...diary].sort((a, b) => a.date.localeCompare(b.date))) {
    lines.push(['diary', d.date, '', '', d.loudness ?? '', d.annoyance, d.mood, d.sleepQuality ?? '', d.note ?? ''].map(esc).join(','));
  }
  for (const a of assessments) {
    for (const q of a.questionnaires) {
      lines.push(['questionnaire', q.date.slice(0, 10), q.id, q.total, '', '', '', '', ''].map(esc).join(','));
    }
  }
  return lines.join('\n') + '\n';
}

export function hasExportableData({ diary, assessments }: CsvInput): boolean {
  return diary.length > 0 || assessments.some((a) => a.questionnaires.length > 0);
}

/** Writes the CSV to the cache directory and opens the OS share sheet. Throws on failure. */
export async function exportCsv(input: CsvInput, fileName = 'dingin-export.csv'): Promise<string> {
  const { File, Paths } = await import('expo-file-system');
  const Sharing = await import('expo-sharing');
  const text = buildCsv(input);
  const file = new File(Paths.cache, fileName);
  await file.write(text);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: 'text/csv', dialogTitle: fileName, UTI: 'public.comma-separated-values-text' });
  }
  return file.uri;
}
