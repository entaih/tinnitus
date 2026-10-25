/**
 * Validated instruments with exact scoring. Item text is provided in Turkish and English.
 *
 * Licensing notes (see README): THI (Newman 1996) is widely reproduced and freely listed by PhenX; Turkish
 * validation Aksoy et al. 2007. PHQ-9 and GAD-7 are public domain (Pfizer). The Khalfa Hyperacusis
 * Questionnaire (2002) and RaSST (Michiels 2022) are journal-published and attributed. The Sleep Condition
 * Indicator (Espie 2014) is free to use. The TFI (OHSU) and ISI (Mapi) require commercial licences and are
 * therefore NOT embedded; the TFI severity bands are still used for interpretation of imported scores.
 */
import type { SeverityBand } from '@/theme/tokens';

export type QuestionnaireId = 'THI' | 'HQ' | 'PHQ9' | 'GAD7' | 'SCI' | 'RASST' | 'SCI02' | 'THS' | 'THIS';

export interface Option { value: number; tr: string; en: string }
/** `options` overrides the questionnaire's shared answer set for this item (e.g. SCI items, each with its own wording). */
export interface Item { tr: string; en: string; subscale?: string; reverse?: boolean; options?: Option[] }

export interface Questionnaire {
  id: QuestionnaireId;
  name: { tr: string; en: string };
  description: { tr: string; en: string };
  minutes: number;
  citation: string;
  evidence: 'guideline' | 'rct' | 'expert';
  options: Option[];
  items: Item[];
  /** Score → band + interpretation key. `answers` is passed for scales whose screen rests on one item (THS C1). */
  interpret: (total: number, answers?: number[]) => { band: SeverityBand; key: string };
  max: number;
  mcid?: number;
}

const THI_OPTIONS: Option[] = [
  { value: 0, tr: 'Hayır', en: 'No' },
  { value: 2, tr: 'Bazen', en: 'Sometimes' },
  { value: 4, tr: 'Evet', en: 'Yes' },
];

export const THI: Questionnaire = {
  id: 'THI',
  name: { tr: 'Çınlama etki puanı (THI)', en: 'Tinnitus impact score (THI)' },
  description: { tr: 'Tinnitusun günlük yaşamınızı ne kadar etkilediğini ölçen 25 soruluk, uluslararası standart ölçek.', en: 'The 25-item international standard measure of how much tinnitus affects daily life.' },
  minutes: 5,
  citation: 'newman1996',
  evidence: 'guideline',
  options: THI_OPTIONS,
  max: 100,
  mcid: 7,
  items: [
    { subscale: 'F', tr: 'Çınlamanız nedeniyle dikkatinizi toplamakta güçlük çekiyor musunuz?', en: 'Because of your tinnitus, is it difficult for you to concentrate?' },
    { subscale: 'F', tr: 'Çınlamanızın yüksekliği, insanları duymanızı zorlaştırıyor mu?', en: 'Does the loudness of your tinnitus make it difficult for you to hear people?' },
    { subscale: 'E', tr: 'Çınlamanız sizi öfkelendiriyor mu?', en: 'Does your tinnitus make you angry?' },
    { subscale: 'F', tr: 'Çınlamanız kafanızın karışmasına neden oluyor mu?', en: 'Does your tinnitus make you feel confused?' },
    { subscale: 'C', tr: 'Çınlamanız nedeniyle kendinizi çaresiz hissediyor musunuz?', en: 'Because of your tinnitus, do you feel desperate?' },
    { subscale: 'E', tr: 'Çınlamanızdan çok yakınıyor musunuz?', en: 'Do you complain a great deal about your tinnitus?' },
    { subscale: 'F', tr: 'Çınlamanız nedeniyle geceleri uykuya dalmakta güçlük çekiyor musunuz?', en: 'Because of your tinnitus, do you have trouble falling asleep at night?' },
    { subscale: 'C', tr: 'Çınlamanızdan kurtulamayacağınızı düşünüyor musunuz?', en: 'Do you feel as though you cannot escape your tinnitus?' },
    { subscale: 'F', tr: 'Çınlamanız sosyal etkinliklerden (dışarıda yemek, sinema gibi) keyif almanızı engelliyor mu?', en: 'Does your tinnitus interfere with your ability to enjoy social activities (such as going out to dinner, to the movies)?' },
    { subscale: 'E', tr: 'Çınlamanız nedeniyle kendinizi engellenmiş/hayal kırıklığına uğramış hissediyor musunuz?', en: 'Because of your tinnitus, do you feel frustrated?' },
    { subscale: 'C', tr: 'Çınlamanız nedeniyle korkunç bir hastalığınız olduğunu düşünüyor musunuz?', en: 'Because of your tinnitus, do you feel that you have a terrible disease?' },
    { subscale: 'F', tr: 'Çınlamanız hayattan keyif almanızı zorlaştırıyor mu?', en: 'Does your tinnitus make it difficult for you to enjoy life?' },
    { subscale: 'F', tr: 'Çınlamanız işinizi ya da ev işlerinizi yapmanızı etkiliyor mu?', en: 'Does your tinnitus interfere with your job or household responsibilities?' },
    { subscale: 'E', tr: 'Çınlamanız nedeniyle kendinizi sık sık sinirli hissediyor musunuz?', en: 'Because of your tinnitus, do you find that you are often irritable?' },
    { subscale: 'F', tr: 'Çınlamanız nedeniyle okumakta güçlük çekiyor musunuz?', en: 'Because of your tinnitus, is it difficult for you to read?' },
    { subscale: 'E', tr: 'Çınlamanız sizi üzüyor mu?', en: 'Does your tinnitus make you upset?' },
    { subscale: 'F', tr: 'Çınlamanızın aileniz ve arkadaşlarınızla ilişkilerinizde gerginlik yarattığını düşünüyor musunuz?', en: 'Do you feel that your tinnitus problem has placed stress on your relationships with members of your family and friends?' },
    { subscale: 'F', tr: 'Dikkatinizi çınlamanızdan uzaklaştırıp başka şeylere odaklanmakta güçlük çekiyor musunuz?', en: 'Do you find it difficult to focus your attention away from your tinnitus and on other things?' },
    { subscale: 'C', tr: 'Çınlamanız üzerinde hiçbir kontrolünüz olmadığını düşünüyor musunuz?', en: 'Do you feel that you have no control over your tinnitus?' },
    { subscale: 'F', tr: 'Çınlamanız nedeniyle kendinizi sık sık yorgun hissediyor musunuz?', en: 'Because of your tinnitus, do you often feel tired?' },
    { subscale: 'E', tr: 'Çınlamanız nedeniyle kendinizi bunalımda hissediyor musunuz?', en: 'Because of your tinnitus, do you feel depressed?' },
    { subscale: 'E', tr: 'Çınlamanız sizi kaygılandırıyor mu?', en: 'Does your tinnitus make you feel anxious?' },
    { subscale: 'C', tr: 'Çınlamanızla artık baş edemediğinizi düşünüyor musunuz?', en: 'Do you feel that you can no longer cope with your tinnitus?' },
    { subscale: 'F', tr: 'Stres altındayken çınlamanız kötüleşiyor mu?', en: 'Does your tinnitus get worse when you are under stress?' },
    { subscale: 'E', tr: 'Çınlamanız kendinizi güvensiz hissetmenize neden oluyor mu?', en: 'Does your tinnitus make you feel insecure?' },
  ],
  interpret: (t) => {
    // McCombe et al. 2001 grades
    if (t <= 16) return { band: 'none', key: 'thi.grade1' };
    if (t <= 36) return { band: 'mild', key: 'thi.grade2' };
    if (t <= 56) return { band: 'moderate', key: 'thi.grade3' };
    if (t <= 76) return { band: 'severe', key: 'thi.grade4' };
    return { band: 'catastrophic', key: 'thi.grade5' };
  },
};

const FREQ4: Option[] = [
  { value: 0, tr: 'Hiçbir zaman', en: 'Not at all' },
  { value: 1, tr: 'Birkaç gün', en: 'Several days' },
  { value: 2, tr: 'Günlerin yarısından fazlası', en: 'More than half the days' },
  { value: 3, tr: 'Hemen hemen her gün', en: 'Nearly every day' },
];

export const PHQ9: Questionnaire = {
  id: 'PHQ9',
  name: { tr: 'Depresyon taraması (PHQ-9)', en: 'Depression screen (PHQ-9)' },
  description: { tr: 'Son 2 hafta içinde aşağıdaki sorunlar sizi ne sıklıkla rahatsız etti?', en: 'Over the last 2 weeks, how often have you been bothered by the following problems?' },
  minutes: 3,
  citation: 'kroenke2001',
  evidence: 'guideline',
  options: FREQ4,
  max: 27,
  items: [
    { tr: 'Bir şeyler yapmaya karşı az ilgi veya zevk duyma', en: 'Little interest or pleasure in doing things' },
    { tr: 'Kendini keyifsiz, çökkün veya umutsuz hissetme', en: 'Feeling down, depressed, or hopeless' },
    { tr: 'Uykuya dalmada veya uykuyu sürdürmede güçlük ya da çok fazla uyuma', en: 'Trouble falling or staying asleep, or sleeping too much' },
    { tr: 'Kendini yorgun hissetme veya enerjisinin az olması', en: 'Feeling tired or having little energy' },
    { tr: 'İştahsızlık veya aşırı yeme', en: 'Poor appetite or overeating' },
    { tr: 'Kendiniz hakkında kötü hissetme; başarısız olduğunuzu ya da kendinizi veya ailenizi hayal kırıklığına uğrattığınızı düşünme', en: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down' },
    { tr: 'Gazete okumak veya televizyon izlemek gibi şeylere odaklanmakta güçlük', en: 'Trouble concentrating on things, such as reading the newspaper or watching television' },
    { tr: 'Başkalarının fark edebileceği kadar yavaş hareket etme veya konuşma; ya da tam tersi, her zamankinden çok daha hareketli ve huzursuz olma', en: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual' },
    { tr: 'Ölmüş olsanız daha iyi olacağı ya da kendinize bir şekilde zarar verme düşünceleri', en: 'Thoughts that you would be better off dead or of hurting yourself in some way' },
  ],
  interpret: (t) => {
    if (t <= 4) return { band: 'none', key: 'phq.minimal' };
    if (t <= 9) return { band: 'mild', key: 'phq.mild' };
    if (t <= 14) return { band: 'moderate', key: 'phq.moderate' };
    if (t <= 19) return { band: 'severe', key: 'phq.modsevere' };
    return { band: 'catastrophic', key: 'phq.severe' };
  },
};

export const GAD7: Questionnaire = {
  id: 'GAD7',
  name: { tr: 'Kaygı taraması (GAD-7)', en: 'Anxiety screen (GAD-7)' },
  description: { tr: 'Son 2 hafta içinde aşağıdaki sorunlar sizi ne sıklıkla rahatsız etti?', en: 'Over the last 2 weeks, how often have you been bothered by the following problems?' },
  minutes: 2,
  citation: 'spitzer2006',
  evidence: 'guideline',
  options: FREQ4,
  max: 21,
  items: [
    { tr: 'Sinirli, kaygılı veya gergin hissetme', en: 'Feeling nervous, anxious, or on edge' },
    { tr: 'Endişelenmeyi durduramama veya kontrol edememe', en: 'Not being able to stop or control worrying' },
    { tr: 'Farklı şeyler hakkında çok fazla endişelenme', en: 'Worrying too much about different things' },
    { tr: 'Gevşemekte güçlük çekme', en: 'Trouble relaxing' },
    { tr: 'Yerinde duramayacak kadar huzursuz olma', en: 'Being so restless that it is hard to sit still' },
    { tr: 'Kolayca sinirlenme veya alınganlık', en: 'Becoming easily annoyed or irritable' },
    { tr: 'Korkunç bir şey olabilirmiş gibi korku hissetme', en: 'Feeling afraid, as if something awful might happen' },
  ],
  interpret: (t) => {
    if (t <= 4) return { band: 'none', key: 'gad.minimal' };
    if (t <= 9) return { band: 'mild', key: 'gad.mild' };
    if (t <= 14) return { band: 'moderate', key: 'gad.moderate' };
    return { band: 'severe', key: 'gad.severe' };
  },
};

const HQ_OPTIONS: Option[] = [
  { value: 0, tr: 'Hayır', en: 'No' },
  { value: 1, tr: 'Evet, biraz', en: 'Yes, a little' },
  { value: 2, tr: 'Evet, oldukça', en: 'Yes, quite a lot' },
  { value: 3, tr: 'Evet, çok fazla', en: 'Yes, a lot' },
];

export const HQ: Questionnaire = {
  id: 'HQ',
  name: { tr: 'Ses hassasiyeti ölçeği (Hiperakuzi Anketi)', en: 'Sound sensitivity (Hyperacusis Questionnaire)' },
  description: { tr: 'Günlük seslere karşı hassasiyetinizi değerlendiren 14 soru (Khalfa ve ark., 2002).', en: '14 items assessing sensitivity to everyday sounds (Khalfa et al., 2002).' },
  minutes: 3,
  citation: 'khalfa2002',
  evidence: 'expert',
  options: HQ_OPTIONS,
  max: 42,
  items: [
    { tr: 'Gürültü algınızı azaltmak için kulak tıkacı veya kulaklık kullanır mısınız? (Aşırı yüksek gürültüde koruyucu kullanımı hariç)', en: 'Do you ever use earplugs or earmuffs to reduce your noise perception (do not consider the use of hearing protection during abnormally high noise exposure situations)?' },
    { tr: 'Gürültülü ortamlarda dikkatinizi toplamakta daha çok güçlük çeker misiniz?', en: 'Do you find it harder to concentrate in noisy surroundings?' },
    { tr: 'Gürültülü veya sesli bir ortamda okumakta güçlük çeker misiniz?', en: 'Do you have trouble reading in a noisy or loud environment?' },
    { tr: 'Gürültülü bir ortamda bir konuşmayı takip etmekte güçlük çeker misiniz?', en: 'Do you have trouble following a conversation in a noisy environment?' },
    { tr: 'Gürültülü bir ortamda bir dersi veya konuşmayı dinlemekte güçlük çeker misiniz?', en: 'Do you have trouble listening to a lecture or speech in a noisy environment?' },
    { tr: 'Gürültü sizi strese sokar mı?', en: 'Do you get stressed by noise?' },
    { tr: 'Gürültüye maruz kaldığınızda sakin kalmakta güçlük çeker misiniz?', en: 'Do you find it hard to stay calm when you are exposed to noise?' },
    { tr: 'Gürültü sosyal yaşamınızı (dışarı çıkmak, arkadaşlarla buluşmak) etkiler mi?', en: 'Does noise affect your social life (going out, meeting friends)?' },
    { tr: 'Gürültü mesleki yaşamınızı etkiler mi?', en: 'Does noise affect your professional life?' },
    { tr: 'Gürültü kolayca sinirlenmenize veya öfkelenmenize neden olur mu?', en: 'Does noise make you feel easily irritated or angry?' },
    { tr: 'Yakın çevrenizdeki gürültüye tahammül etmekte güçlük çeker misiniz?', en: 'Do you find it hard to tolerate noise in your immediate surroundings?' },
    { tr: 'Bazı ses ortamlarından (sinema, konser, restoran) kaçınır mısınız?', en: 'Do you avoid certain sound environments (cinema, concerts, restaurants)?' },
    { tr: 'Gürültülü bir ortamda bulunduktan sonra kendinizi daha yorgun hisseder misiniz?', en: 'Do you feel more tired after being in a noisy environment?' },
    { tr: 'Gürültü uykuya dalmanızı zorlaştırır mı?', en: 'Does noise make it harder for you to fall asleep?' },
  ],
  interpret: (t) => {
    // Khalfa original cutoff 28 = strong; later validations and the Turkish ULL validation ≈16.
    if (t < 16) return { band: 'none', key: 'hq.none' };
    if (t < 28) return { band: 'moderate', key: 'hq.present' };
    return { band: 'severe', key: 'hq.strong' };
  },
};

const THS_OPTIONS: Option[] = [
  { value: 0, tr: 'Hayır, sorun değil', en: 'No, not a problem' },
  { value: 1, tr: 'Evet, küçük bir sorun', en: 'Yes, a small problem' },
  { value: 2, tr: 'Evet, orta düzeyde bir sorun', en: 'Yes, a moderate problem' },
  { value: 3, tr: 'Evet, büyük bir sorun', en: 'Yes, a big problem' },
  { value: 4, tr: 'Evet, çok büyük bir sorun', en: 'Yes, a very big problem' },
];

/**
 * Tinnitus and Hearing Survey, section C "Sound tolerance" (Henry et al. 2015; public domain, VA). Two items, 0–4 each.
 * Screen: C1 ≥ 2 → positive (full HQ-14 opens in week 2). C2 is asked only when C1 ≥ 1 (gate in the questionnaire screen).
 * Turkish wording is a screen translation ("ekran tahmini"), not a validated adaptation.
 */
export const THS: Questionnaire = {
  id: 'THS',
  name: { tr: 'Ses toleransı taraması (THS-C)', en: 'Sound tolerance screen (THS-C)' },
  description: { tr: 'Geçen haftayı düşünerek yanıtlayın. İki kısa soru; Türkçe metin ekran çevirisidir.', en: 'Think about the past week. Two short questions.' },
  minutes: 1,
  citation: 'henry2015',
  evidence: 'expert',
  options: THS_OPTIONS,
  max: 8,
  items: [
    { tr: 'Geçen hafta, çevremdekiler için normal olan sesler bana fazla yüksek ya da rahatsız edici geldi.', en: 'Over the last week, sounds that are normal for people around me seemed too loud or uncomfortable to me.' },
    { tr: 'Geçen hafta bu ses hassasiyeti günlük yaşamımda ne kadar sorun oldu?', en: 'Over the last week, how much of a problem was this sound sensitivity in my daily life?' },
  ],
  interpret: (t, answers) => ((answers?.[0] ?? t) >= 2 ? { band: 'moderate', key: 'ths.positive' } : { band: 'none', key: 'ths.none' }),
};

const SCI_OPTIONS: Option[] = [
  { value: 0, tr: '0', en: '0' }, { value: 1, tr: '1', en: '1' }, { value: 2, tr: '2', en: '2' }, { value: 3, tr: '3', en: '3' }, { value: 4, tr: '4', en: '4' },
];
// SCI answer sets (Espie et al. 2014). Shown in natural reading order; each option carries its scoring value (0–4, higher = better sleep).
const SCI_MINUTES: Option[] = [
  { value: 4, tr: '0–15 dakika', en: '0–15 minutes' },
  { value: 3, tr: '16–30 dakika', en: '16–30 minutes' },
  { value: 2, tr: '31–45 dakika', en: '31–45 minutes' },
  { value: 1, tr: '46–60 dakika', en: '46–60 minutes' },
  { value: 0, tr: '61 dakika veya daha uzun', en: '61 minutes or more' },
];
const SCI_NIGHTS: Option[] = [
  { value: 4, tr: '0–1 gece', en: '0–1 nights' },
  { value: 3, tr: '2 gece', en: '2 nights' },
  { value: 2, tr: '3 gece', en: '3 nights' },
  { value: 1, tr: '4 gece', en: '4 nights' },
  { value: 0, tr: '5–7 gece', en: '5–7 nights' },
];
const SCI_QUALITY: Option[] = [
  { value: 4, tr: 'Çok iyi', en: 'Very good' },
  { value: 3, tr: 'İyi', en: 'Good' },
  { value: 2, tr: 'Orta', en: 'Average' },
  { value: 1, tr: 'Kötü', en: 'Poor' },
  { value: 0, tr: 'Çok kötü', en: 'Very poor' },
];
const SCI_IMPACT: Option[] = [
  { value: 4, tr: 'Hiç', en: 'Not at all' },
  { value: 3, tr: 'Biraz', en: 'A little' },
  { value: 2, tr: 'Orta derecede', en: 'Somewhat' },
  { value: 1, tr: 'Oldukça', en: 'Much' },
  { value: 0, tr: 'Çok fazla', en: 'Very much' },
];
const SCI_DURATION: Option[] = [
  { value: 4, tr: 'Uyku sorunum yok / 1 aydan kısa', en: 'No problem / less than 1 month' },
  { value: 3, tr: '1–2 ay', en: '1–2 months' },
  { value: 2, tr: '3–6 ay', en: '3–6 months' },
  { value: 1, tr: '7–12 ay', en: '7–12 months' },
  { value: 0, tr: '1 yıldan uzun', en: 'More than 1 year' },
];

/** Sleep Condition Indicator (Espie et al. 2014, BMJ Open) — free to use; 8 items, 0–32, ≤16 suggests probable insomnia disorder. */
export const SCI: Questionnaire = {
  id: 'SCI',
  name: { tr: 'Uyku Durumu Göstergesi (SCI)', en: 'Sleep Condition Indicator (SCI)' },
  description: { tr: 'Son bir ay içindeki uykunuzu düşünerek yanıtlayın. Yüksek puan daha iyi uykuyu gösterir.', en: 'Think about your sleep over the past month. Higher scores mean better sleep.' },
  minutes: 2,
  citation: 'espie2014',
  evidence: 'rct',
  options: SCI_OPTIONS,
  max: 32,
  items: [
    { tr: 'Uykuya dalmanız genellikle ne kadar sürer?', en: 'How long does it usually take you to fall asleep?', options: SCI_MINUTES },
    { tr: 'Gece uyanırsanız toplam ne kadar süre uyanık kalırsınız?', en: 'If you wake up during the night, how long are you awake in total?', options: SCI_MINUTES },
    { tr: 'Haftada kaç gece uyku sorunu yaşarsınız?', en: 'How many nights a week do you have a problem with your sleep?', options: SCI_NIGHTS },
    { tr: 'Uyku kalitenizi nasıl değerlendirirsiniz?', en: 'How would you rate your sleep quality?', options: SCI_QUALITY },
    { tr: 'Kötü uyku ruh halinizi, enerjinizi veya ilişkilerinizi ne kadar etkiliyor?', en: 'How much has poor sleep affected your mood, energy or relationships?', options: SCI_IMPACT },
    { tr: 'Kötü uyku odaklanmanızı, verimliliğinizi veya uyanık kalmanızı ne kadar etkiliyor?', en: 'How much has poor sleep affected your concentration, productivity or ability to stay awake?', options: SCI_IMPACT },
    { tr: 'Kötü uyku genel olarak sizi ne kadar rahatsız ediyor?', en: 'How much has poor sleep troubled you in general?', options: SCI_IMPACT },
    { tr: 'Uyku sorununuz ne zamandır sürüyor?', en: 'How long have you had a problem with your sleep?', options: SCI_DURATION },
  ],
  interpret: (t) => {
    if (t > 16) return { band: 'none', key: 'sci.ok' };
    if (t >= 10) return { band: 'moderate', key: 'sci.probable' };
    return { band: 'severe', key: 'sci.severe' };
  },
};

/**
 * SCI-02 (Espie et al. 2014, BMJ Open): the two-item short form of the SCI (items 3 and 7), 0–8;
 * ≤2 suggests probable insomnia disorder. Used at baseline; the full SCI-8 opens in week 2 only when positive.
 */
export const SCI02: Questionnaire = {
  id: 'SCI02',
  name: { tr: 'Uyku taraması (SCI-02)', en: 'Sleep screen (SCI-02)' },
  description: { tr: 'Son bir ay içindeki uykunuzu düşünerek yanıtlayın. İki soru; yüksek puan daha iyi uykuyu gösterir.', en: 'Think about your sleep over the past month. Two questions; higher scores mean better sleep.' },
  minutes: 1,
  citation: 'espie2014',
  evidence: 'rct',
  options: SCI_OPTIONS,
  max: 8,
  items: [SCI.items[2], SCI.items[6]],
  interpret: (t) => (t <= 2 ? { band: 'severe', key: 'sci02.probable' } : { band: 'none', key: 'sci02.ok' }),
};

const YESNO: Option[] = [
  { value: 0, tr: 'Hayır', en: 'No' },
  { value: 1, tr: 'Evet', en: 'Yes' },
];

/** Rapid Screening for Somatosensory Tinnitus Tool (Michiels et al., Ear Hear 2022): ≥2/4 suggests somatosensory tinnitus. */
export const RASST: Questionnaire = {
  id: 'RASST',
  name: { tr: 'Somatosensoriyel tinnitus taraması (RaSST)', en: 'Somatosensory tinnitus screen (RaSST)' },
  description: { tr: 'Boyun, çene ve kas gerginliğinin çınlamanızla ilişkisini tarayan 4 soru.', en: 'Four items screening the link between neck, jaw and muscle tension and your tinnitus.' },
  minutes: 1,
  citation: 'michiels2022',
  evidence: 'rct',
  options: YESNO,
  max: 4,
  items: [
    { tr: 'Çınlamanız ve boyun/çene ağrınız birlikte artıp azalıyor mu?', en: 'Do your tinnitus and neck or jaw pain increase and decrease together?' },
    { tr: 'Ense/boyun kaslarınızda belirgin gerginlik var mı?', en: 'Do you have noticeable tension in the muscles at the back of your neck (suboccipital)?' },
    { tr: 'Başınızı, boynunuzu veya çenenizi hareket ettirdiğinizde ya da bastırdığınızda çınlamanız değişiyor mu?', en: 'Does your tinnitus change when you move or press on your head, neck or jaw?' },
    { tr: 'Dişlerinizi sıkar veya gıcırdatır mısınız (bruksizm)?', en: 'Do you clench or grind your teeth (bruxism)?' },
  ],
  interpret: (t) => (t >= 2 ? { band: 'moderate', key: 'rasst.positive' } : { band: 'none', key: 'rasst.negative' }),
};

/**
 * THI-S (Newman, Sandridge & Bolek 2008, Otol Neurotol 29:276–81): the 10-item screening version of the THI, 0–40,
 * used only as an interim *trend* in weeks 2 and 6 (no band, no decision — PM sprint 3 A4).
 *
 * The 10 items must be taken one-to-one from Table 1 of the 2008 paper. Engineering could not verify that table
 * against the source at the time of writing (the item list is not reproduced in the secondary literature available
 * offline), so `THIS_ITEM_INDICES` stays `null` and `THIS_ENABLED` stays `false`: the scale is not scheduled, the route
 * shows "unknown questionnaire", and `consequencesOf('THIS', …)` is only reachable from imported results. To enable:
 * fill the 0-based THI item indices from the verified table and flip the flag; nothing else changes.
 */
export const THIS_ITEM_INDICES: number[] | null = null;
export const THIS_ENABLED: boolean = ((THIS_ITEM_INDICES as number[] | null)?.length ?? 0) === 10;

export const THIS: Questionnaire = {
  id: 'THIS',
  name: { tr: 'Hızlı kontrol (THI-S)', en: 'Quick check (THI-S)' },
  description: { tr: 'Çınlama etki puanının 10 soruluk ara eğilim sürümü. Yalnızca eğilim gösterir; bant ya da karar vermez.', en: 'The 10-item interim trend version of the tinnitus impact score. Shows a trend only; no band and no decision.' },
  minutes: 2,
  citation: 'newman2008',
  evidence: 'rct',
  options: THI_OPTIONS,
  max: 40,
  items: (THIS_ITEM_INDICES ?? []).map((i) => ({ tr: THI.items[i].tr, en: THI.items[i].en })),
  interpret: () => ({ band: 'none', key: 'this.trend' }),
};

export const QUESTIONNAIRES: Record<QuestionnaireId, Questionnaire> = { THI, HQ, PHQ9, GAD7, SCI, RASST, SCI02, THS, THIS };

/** Answer options of one item: its own set when it has one, otherwise the questionnaire's shared set. */
export const optionsFor = (q: Questionnaire, index: number): Option[] => q.items[index]?.options ?? q.options;

export function scoreQuestionnaire(q: Questionnaire, answers: number[]) {
  const total = answers.reduce((a, b) => a + b, 0);
  const subscales: Record<string, number> = {};
  q.items.forEach((it, i) => { if (it.subscale) subscales[it.subscale] = (subscales[it.subscale] ?? 0) + (answers[i] ?? 0); });
  return { total, subscales, ...q.interpret(total, answers) };
}

/** TFI bands (Meikle 2012 / Henry 2016) — used when a user enters a clinic-measured TFI. */
export function tfiBand(score: number): SeverityBand {
  if (score <= 17) return 'none';
  if (score <= 31) return 'mild';
  if (score <= 53) return 'moderate';
  if (score <= 72) return 'severe';
  return 'catastrophic';
}
