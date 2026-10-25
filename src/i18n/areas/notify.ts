/**
 * i18n strings for local notifications (S1-10, PM §2.6): weekday-specific daily reminder copy,
 * the 3-day re-entry nudge and the measurement-week Sunday reminder.
 * Keys are flat, dot-separated. Weekday keys follow the expo-notifications convention used across the
 * app (`notif.day.1` = Sunday … `notif.day.7` = Saturday, same as `growth.weekly.day.N`).
 * Turkish first, formal "siz", no exclamation marks, no medical claims.
 */
export const notifyStrings = {
  tr: {
    // --- Weekday reminders (1 = Sunday … 7 = Saturday) ---
    'notif.day.1.title': '1 dakikalık haftalık kart',
    'notif.day.1.body': 'Haftanızı tek bakışta görün ve gelecek haftanın temasını öğrenin.',
    'notif.day.2.title': 'Haftanın becerisi hazır (8 dk)',
    'notif.day.2.body': 'Yeni haftanın becerisi sizi bekliyor. Kısa bir uygulama ile başlayın.',
    'notif.day.3.title': 'Bugünün tek şeyi: kısa bir uygulama',
    'notif.day.3.body': 'Birkaç dakika yeter. Günün adımını açın ve tamamlayın.',
    'notif.day.4.title': 'Bugünün tek şeyi: kısa bir uygulama',
    'notif.day.4.body': 'Haftanın ortası. Kısa bir uygulama ile ritmi koruyun.',
    'notif.day.5.title': 'Bugünün tek şeyi: kısa bir uygulama',
    'notif.day.5.body': 'Birkaç dakika yeter. Günün adımını açın ve tamamlayın.',
    'notif.day.6.title': 'Bugünün tek şeyi: kısa bir uygulama',
    'notif.day.6.body': 'Haftayı kısa bir uygulama ile kapatın.',
    'notif.day.7.title': 'Okuma günü: 5 dk',
    'notif.day.7.body': 'Bugün yalnızca kısa bir okuma var. Rahat bir an seçin.',

    // --- Re-entry nudge (one-shot, +3 days 19:00) ---
    'notif.reentry.title': '3 gündür görüşmedik',
    'notif.reentry.body': '2 dakikalık sürüm hazır. Kaldığınız yerden, kısa bir adımla devam edebilirsiniz.',

    // --- Measurement week (weeks 4/8/12, Sunday 10:00) ---
    'notif.measure.title': 'Ölçüm günü',
    'notif.measure.body': 'Bu Pazar 3 dakikalık ölçüm: puanınızın nasıl değiştiğini göreceksiniz.',

    // --- Light-dose programme (Sprint 2 C4): one body for weekdays 2–7 ---
    'notif.day.light.title': 'Bugünün tek şeyi: yaklaşık 8 dk',
    'notif.day.light.body': 'Bugün ~8 dk: tek adım',

    // --- Settings: quiet hours and programme dose (Sprint 2 C4) ---
    'settings.reminder.quiet': 'Sessiz saatlerde ({start}–{end}) hatırlatma planlanmaz; daha erken bir saat seçin.',
    'settings.dose': 'Program dozu',
    'settings.dose.full': 'Tam',
    'settings.dose.light': 'Hafif',
    'settings.dose.sub': 'Değiştirmek için program kurulumunu açın. Hafif doz: günde yaklaşık 8 dk, haftada tek modül.',
  },
  en: {
    'notif.day.1.title': 'Your 1-minute weekly card',
    'notif.day.1.body': 'See your week at a glance and find out next week\'s theme.',
    'notif.day.2.title': 'This week\'s skill is ready (8 min)',
    'notif.day.2.body': 'A new skill is waiting for you. Start with a short practice.',
    'notif.day.3.title': 'Today\'s one thing: a short practice',
    'notif.day.3.body': 'A few minutes is enough. Open today\'s step and complete it.',
    'notif.day.4.title': 'Today\'s one thing: a short practice',
    'notif.day.4.body': 'Midweek. Keep the rhythm with a short practice.',
    'notif.day.5.title': 'Today\'s one thing: a short practice',
    'notif.day.5.body': 'A few minutes is enough. Open today\'s step and complete it.',
    'notif.day.6.title': 'Today\'s one thing: a short practice',
    'notif.day.6.body': 'Close the week with a short practice.',
    'notif.day.7.title': 'Reading day: 5 min',
    'notif.day.7.body': 'Only a short read today. Pick a quiet moment.',

    'notif.reentry.title': 'We haven\'t seen you in 3 days',
    'notif.reentry.body': 'The 2-minute version is ready. Pick up where you left off with one short step.',

    'notif.measure.title': 'Measurement day',
    'notif.measure.body': 'This Sunday: a 3-minute measurement. You will see how your score has changed.',

    'notif.day.light.title': 'Today\'s one thing: about 8 min',
    'notif.day.light.body': 'Today ~8 min: one step',

    'settings.reminder.quiet': 'Reminders are not scheduled during quiet hours ({start}–{end}); pick an earlier hour.',
    'settings.dose': 'Programme dose',
    'settings.dose.full': 'Full',
    'settings.dose.light': 'Light',
    'settings.dose.sub': 'Open the programme setup to change it. Light dose: about 8 min a day, one module a week.',
  },
};
