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

    // --- Measurement week (weeks 4/8/12, Sunday morning) ---
    'notif.measure.title': 'Bugün 3 dakikalık ölçüm',
    'notif.measure.body': 'Puanınızın nasıl değiştiğini göreceksiniz.',
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

    'notif.measure.title': 'Today: a 3-minute measurement',
    'notif.measure.body': 'You will see how your score has changed.',
  },
};
