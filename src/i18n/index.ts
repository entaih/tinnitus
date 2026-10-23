import { useSettings, type Locale } from '@/store/settings';
import { tr } from './tr';
import { en } from './en';
import { coreStrings } from './areas/core';
import { assessStrings } from './areas/assess';
import { psychoStrings } from './areas/psycho';
import { soundStrings } from './areas/sound';
import { mindStrings } from './areas/mind';

type Dict = Record<string, string>;
const areas = [coreStrings, assessStrings, psychoStrings, soundStrings, mindStrings];
const dicts: Record<Locale, Dict> = {
  tr: Object.assign({}, tr as Dict, ...areas.map((a) => a.tr)),
  en: Object.assign({}, en as Dict, ...areas.map((a) => a.en)),
};

export function translate(locale: Locale, key: string, params?: Record<string, string | number>): string {
  let s = dicts[locale][key] ?? dicts.tr[key] ?? key;
  if (params) for (const [k, v] of Object.entries(params)) s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
  return s;
}

export type TFn = (key: string, params?: Record<string, string | number>) => string;

/** Hook returning a translate function bound to the current locale. */
export function useT(): TFn {
  const locale = useSettings((s) => s.locale);
  return (key, params) => translate(locale, key, params);
}

export function useLocale(): Locale {
  return useSettings((s) => s.locale);
}

/** Pick a localised value from a { tr, en } object. */
export function pick<T>(obj: { tr: T; en: T }, locale: Locale): T {
  return obj[locale] ?? obj.tr;
}

export function formatDate(iso: string, locale: Locale, opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }) {
  try { return new Date(iso).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-GB', opts); } catch { return iso.slice(0, 10); }
}
