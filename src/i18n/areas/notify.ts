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

    // --- Maintenance (Sprint 3 C2): weekdays 2–7 share one body; Sunday keeps the weekly card ---
    'notif.day.maint.title': 'Bakım: 5 dakikalık kısa uygulama',
    'notif.day.maint.body': 'Kısa bir uygulama ya da arka plan sesi; ikisi de sayılır.',

    // --- Programme completed (one-shot, last programme day 18:00) ---
    'notif.programDone.title': 'Programı tamamladınız — bakım modunu açın',
    'notif.programDone.body': 'Bakım modu: haftada 3 gün kısa uygulama, Pazar kartı ve 4 haftada bir ölçüm.',

    // --- Settings: "Programım" section and reminder days (Sprint 3 C4) ---
    'settings.program': 'Programım',
    'settings.program.none': 'Henüz bir program yok. Değerlendirmeyi tamamlayınca program oluşturulur.',
    'settings.program.status': 'Durum',
    'settings.program.active': 'Etkin program · {w}. hafta / {n}',
    'settings.program.finished': 'Program tamamlandı · bakım modunu Ana ekrandan açın',
    'settings.program.maintenance': 'Bakım modu · {n}. hafta',
    'settings.program.maintenance.sub': 'Haftada 3 etkin gün hedefi, Pazar kartı, 4 haftada bir ölçüm.',
    'settings.program.refresher': 'Tazeleme bloğu {date} tarihine kadar sürüyor.',
    'settings.program.restart': 'Programı yeniden başlat',
    'settings.program.restart.sub': 'Program kurulumu açılır; yeni bir program üretilir, tamamlananlar sıfırlanır.',
    'settings.reminderDays': 'Hatırlatma günleri',
    'settings.reminderDays.hint.active': 'Program sırasında her gün hatırlatılır; seçtiğiniz günler bakım modunda geçerli olur.',
    'settings.reminderDays.hint.maintenance': 'Bakımda yalnız seçili günlerde hatırlatılır: haftada {n} bildirim.',
    'settings.reminderDays.empty': 'En az bir gün seçin; hiçbiri seçili değilse Pzt/Çar/Paz kullanılır.',
    'settings.reminderDays.a11y': '{day} hatırlatması',
    'settings.reminderDays.d1': 'Paz',
    'settings.reminderDays.d2': 'Pzt',
    'settings.reminderDays.d3': 'Sal',
    'settings.reminderDays.d4': 'Çar',
    'settings.reminderDays.d5': 'Per',
    'settings.reminderDays.d6': 'Cum',
    'settings.reminderDays.d7': 'Cmt',
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

    'notif.day.maint.title': 'Maintenance: a 5-minute practice',
    'notif.day.maint.body': 'A short practice or background sound; both count.',

    'notif.programDone.title': 'You completed the programme — open maintenance mode',
    'notif.programDone.body': 'Maintenance: a short practice 3 days a week, the Sunday card and a measurement every 4 weeks.',

    'settings.program': 'My programme',
    'settings.program.none': 'No programme yet. One is created when you finish the assessment.',
    'settings.program.status': 'Status',
    'settings.program.active': 'Active programme · week {w} of {n}',
    'settings.program.finished': 'Programme completed · open maintenance mode from the Home screen',
    'settings.program.maintenance': 'Maintenance mode · week {n}',
    'settings.program.maintenance.sub': 'Goal of 3 active days a week, the Sunday card, a measurement every 4 weeks.',
    'settings.program.refresher': 'Refresher block runs until {date}.',
    'settings.program.restart': 'Restart the programme',
    'settings.program.restart.sub': 'Opens the programme setup; a new programme is generated and completed steps are reset.',
    'settings.reminderDays': 'Reminder days',
    'settings.reminderDays.hint.active': 'During the programme you are reminded every day; the days you pick apply in maintenance mode.',
    'settings.reminderDays.hint.maintenance': 'In maintenance you are reminded only on the selected days: {n} notifications a week.',
    'settings.reminderDays.empty': 'Pick at least one day; with none selected Mon/Wed/Sun are used.',
    'settings.reminderDays.a11y': '{day} reminder',
    'settings.reminderDays.d1': 'Sun',
    'settings.reminderDays.d2': 'Mon',
    'settings.reminderDays.d3': 'Tue',
    'settings.reminderDays.d4': 'Wed',
    'settings.reminderDays.d5': 'Thu',
    'settings.reminderDays.d6': 'Fri',
    'settings.reminderDays.d7': 'Sat',
  },
};
