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

export type QuestionnaireId = 'THI' | 'HQ' | 'PHQ9' | 'GAD7' | 'SCI' | 'RASST';

export interface Option { value: number; tr: string; en: string }
export interface Item { tr: string; en: string; subscale?: string; reverse?: boolean }

export interface Questionnaire {
  id: QuestionnaireId;
  name: { tr: string; en: string };
  description: { tr: string; en: string };
  minutes: number;
  citation: string;
  evidence: 'guideline' | 'rct' | 'expert';
  options: Option[];
  items: Item[];
  /** Score → band + interpretation key */
  interpret: (total: number) => { band: SeverityBand; key: string };
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

const SCI_OPTIONS: Option[] = [
  { value: 0, tr: '0', en: '0' }, { value: 1, tr: '1', en: '1' }, { value: 2, tr: '2', en: '2' }, { value: 3, tr: '3', en: '3' }, { value: 4, tr: '4', en: '4' },
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
    { tr: 'Uykuya dalmanız ne kadar sürer? (4: 0–15 dk, 3: 16–30 dk, 2: 31–45 dk, 1: 46–60 dk, 0: 61 dk ve üzeri)', en: 'How long does it take you to fall asleep? (4: 0–15 min, 3: 16–30, 2: 31–45, 1: 46–60, 0: 61 min or more)' },
    { tr: 'Gece boyunca toplam ne kadar süre uyanık kalırsınız? (4: 0–15 dk, 3: 16–30 dk, 2: 31–45 dk, 1: 46–60 dk, 0: 61 dk ve üzeri)', en: 'If you wake up during the night, how long are you awake in total? (4: 0–15 min, 3: 16–30, 2: 31–45, 1: 46–60, 0: 61 min or more)' },
    { tr: 'Haftada kaç gece uyku sorunu yaşarsınız? (4: 0–1 gece, 3: 2 gece, 2: 3 gece, 1: 4 gece, 0: 5–7 gece)', en: 'How many nights a week do you have a problem with your sleep? (4: 0–1, 3: 2, 2: 3, 1: 4, 0: 5–7 nights)' },
    { tr: 'Uyku kalitenizi nasıl değerlendirirsiniz? (0: çok kötü … 4: çok iyi)', en: 'How would you rate your sleep quality? (0: very poor … 4: very good)' },
    { tr: 'Kötü uyku ruh halinizi, enerjinizi veya ilişkilerinizi ne kadar etkiliyor? (0: çok fazla … 4: hiç)', en: 'How much has poor sleep affected your mood, energy or relationships? (0: very much … 4: not at all)' },
    { tr: 'Kötü uyku odaklanmanızı, verimliliğinizi veya uyanık kalmanızı ne kadar etkiliyor? (0: çok fazla … 4: hiç)', en: 'How much has poor sleep affected your concentration, productivity or ability to stay awake? (0: very much … 4: not at all)' },
    { tr: 'Kötü uyku genel olarak sizi ne kadar rahatsız ediyor? (0: çok fazla … 4: hiç)', en: 'How much has poor sleep troubled you in general? (0: very much … 4: not at all)' },
    { tr: 'Uyku sorununuz ne zamandır sürüyor? (0: >1 yıl, 1: 7–12 ay, 2: 3–6 ay, 3: 1–2 ay, 4: <1 ay / sorun yok)', en: 'How long have you had a problem with your sleep? (0: >1 year, 1: 7–12 months, 2: 3–6 months, 3: 1–2 months, 4: <1 month / no problem)' },
  ],
  interpret: (t) => {
    if (t > 16) return { band: 'none', key: 'sci.ok' };
    if (t >= 10) return { band: 'moderate', key: 'sci.probable' };
    return { band: 'severe', key: 'sci.severe' };
  },
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

export const QUESTIONNAIRES: Record<QuestionnaireId, Questionnaire> = { THI, HQ, PHQ9, GAD7, SCI, RASST };

export function scoreQuestionnaire(q: Questionnaire, answers: number[]) {
  const total = answers.reduce((a, b) => a + b, 0);
  const subscales: Record<string, number> = {};
  q.items.forEach((it, i) => { if (it.subscale) subscales[it.subscale] = (subscales[it.subscale] ?? 0) + (answers[i] ?? 0); });
  return { total, subscales, ...q.interpret(total) };
}

/** TFI bands (Meikle 2012 / Henry 2016) — used when a user enters a clinic-measured TFI. */
export function tfiBand(score: number): SeverityBand {
  if (score <= 17) return 'none';
  if (score <= 31) return 'mild';
  if (score <= 53) return 'moderate';
  if (score <= 72) return 'severe';
  return 'catastrophic';
}
