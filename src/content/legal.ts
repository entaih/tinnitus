/**
 * Privacy notice (KVKK aydınlatma metni) and terms of use shown in the app (app/privacy.tsx) and published for the
 * store listings (docs/privacy-policy.md mirrors this text). Data controller details are configured in app.json
 * `extra.legal` so they can be filled in without a code change.
 */
export interface LegalSection { title: string; body: string }
export interface LegalDoc { title: string; updated: string; sections: LegalSection[] }

export const LEGAL_UPDATED = '2026-10-25';

export function privacyDoc(locale: 'tr' | 'en', controller: string, contact: string): LegalDoc {
  if (locale === 'en') {
    return {
      title: 'Privacy notice', updated: LEGAL_UPDATED, sections: [
        { title: 'Summary', body: 'Dingin works without an account. Everything you enter — answers, test results, programme progress — is stored only on this device. Nothing is sent to us or to any server, and there is no advertising or tracking.' },
        { title: 'Data controller', body: contact ? `${controller}. Contact: ${contact}.` : `${controller}.` },
        { title: 'What is processed', body: 'Health-related answers (tinnitus questionnaires, mood screening, history questions, hearing and sound test results), programme progress and your settings. The microphone is used only to measure room noise before the hearing test; no sound is recorded. The motion sensor is used only for the balance recording.' },
        { title: 'Why', body: 'To produce your preliminary assessment, suggest which doctor to see, build and adapt your personal programme. The legal basis is your explicit consent, given on the first screen.' },
        { title: 'Where it is kept', body: 'Only in the app\'s storage on your device. Several people can use one device; each person\'s data is kept separately.' },
        { title: 'Sharing', body: 'Data leaves the device only when you share it yourself (doctor report PDF, progress card, data export). You choose the recipient.' },
        { title: 'Deleting', body: 'Settings → People → delete a person removes that person\'s data. Settings → My data → delete removes everything. Uninstalling the app deletes all data.' },
        { title: 'Your rights', body: 'Under KVKK Article 11 you may ask whether your data is processed, request correction or deletion and object to processing. Because the data is only on your device, you can exercise most of these rights directly in the app; for anything else contact us.' },
        { title: 'Children', body: 'The app is intended for adults (18+).' },
      ],
    };
  }
  return {
    title: 'Gizlilik ve KVKK aydınlatma metni', updated: LEGAL_UPDATED, sections: [
      { title: 'Özet', body: 'Dingin hesap gerektirmez. Girdiğiniz her şey (yanıtlar, test sonuçları, program ilerlemesi) yalnızca bu cihazda saklanır. Bize ya da herhangi bir sunucuya veri gönderilmez; reklam ve takip yoktur.' },
      { title: 'Veri sorumlusu', body: contact ? `${controller}. İletişim: ${contact}.` : `${controller}.` },
      { title: 'İşlenen veriler', body: 'Sağlıkla ilgili yanıtlar (çınlama ölçekleri, ruh hali taraması, öykü soruları, işitme ve ses testi sonuçları), program ilerlemesi ve ayarlarınız. Mikrofon yalnızca işitme testinden önce ortam gürültüsünü ölçmek için kullanılır; ses kaydedilmez. Hareket algılayıcısı yalnızca denge kaydında kullanılır.' },
      { title: 'Amaç ve hukuki sebep', body: 'Ön değerlendirmenizi üretmek, hangi hekime gitmeniz gerektiğini önermek, kişisel programınızı oluşturup uyarlamak. Hukuki sebep, ilk ekranda verdiğiniz açık rızadır (KVKK m. 6).' },
      { title: 'Saklama yeri', body: 'Yalnızca cihazınızdaki uygulama deposunda. Bir cihazı birden fazla kişi kullanabilir; her kişinin verisi ayrı tutulur.' },
      { title: 'Aktarım', body: 'Veriler yalnızca sizin başlattığınız paylaşımla cihazdan çıkar (doktor raporu PDF, ilerleme kartı, veri dışa aktarma). Alıcıyı siz seçersiniz.' },
      { title: 'Silme', body: 'Ayarlar → Kişiler → kişiyi sil, o kişinin verilerini siler. Ayarlar → Verilerim → sil, tüm verileri siler. Uygulamayı kaldırmak da tüm verileri siler.' },
      { title: 'Haklarınız', body: 'KVKK m. 11 uyarınca verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini veya silinmesini isteme ve itiraz etme haklarınız vardır. Veriler yalnızca cihazınızda olduğu için bu hakların çoğunu doğrudan uygulamada kullanabilirsiniz; diğer talepler için bize yazın.' },
      { title: 'Yaş', body: 'Uygulama yetişkinler (18 yaş ve üzeri) içindir.' },
    ],
  };
}

export function termsDoc(locale: 'tr' | 'en'): LegalDoc {
  if (locale === 'en') {
    return {
      title: 'Terms of use', updated: LEGAL_UPDATED, sections: [
        { title: 'What Dingin is', body: 'An app that gives a preliminary assessment of tinnitus from short questionnaires and phone-based tests, tells you which doctor to see and when, and offers an evidence-based self-management programme (sound therapy, cognitive-behavioural exercises, sleep and relaxation).' },
        { title: 'What it is not', body: 'It is not a substitute for an examination by a doctor or an audiologist. Phone-based tests are estimates, not a clinical audiogram. The preliminary assessment must be confirmed by a doctor.' },
        { title: 'Emergencies', body: 'If you have sudden hearing loss, severe dizziness, weakness or numbness of the face or limbs, or thoughts of harming yourself, call 112 or go to the nearest emergency department. Do not wait for the app.' },
        { title: 'Sound safety', body: 'Keep sounds at a comfortable, low level. Stop if a sound causes discomfort or pain.' },
        { title: 'Responsibility', body: 'Decisions about your health are made together with your doctor. Use the app at your own discretion.' },
      ],
    };
  }
  return {
    title: 'Kullanım koşulları', updated: LEGAL_UPDATED, sections: [
      { title: 'Dingin nedir', body: 'Kısa ölçekler ve telefonla yapılan testlerle çınlamanız için ön değerlendirme yapan, hangi hekime ne zaman gitmeniz gerektiğini söyleyen ve kanıta dayalı bir öz yönetim programı (ses terapisi, bilişsel-davranışçı egzersizler, uyku ve gevşeme) sunan bir uygulamadır.' },
      { title: 'Ne değildir', body: 'Hekim veya odyolog muayenesinin yerine geçmez. Telefonla yapılan testler tahmindir, klinik odyogram değildir. Ön değerlendirme bir hekim tarafından doğrulanmalıdır.' },
      { title: 'Acil durumlar', body: 'Ani işitme kaybı, şiddetli baş dönmesi, yüzde veya kol-bacakta güçsüzlük ya da uyuşma, kendinize zarar verme düşüncesi varsa 112\'yi arayın veya en yakın acil servise gidin. Uygulamayı beklemeyin.' },
      { title: 'Ses güvenliği', body: 'Sesleri rahat ve düşük bir düzeyde tutun. Bir ses rahatsızlık veya ağrı verirse durdurun.' },
      { title: 'Sorumluluk', body: 'Sağlığınızla ilgili kararlar hekiminizle birlikte verilir. Uygulamayı kendi takdirinizle kullanırsınız.' },
    ],
  };
}
