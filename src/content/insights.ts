/**
 * "Günün notu": 24 short, cited insights shown once on the session completion card (variable reward, PM §2.1).
 * Rules: ≤ 160 characters, every entry points to an id in src/content/citations.ts, no "cure" / "treats" claims —
 * wording stays in programme / evidence language. Distilled from the education articles.
 */
import { CITATIONS } from './citations';

export interface Insight { id: string; tr: string; en: string; citation: string }

export const INSIGHTS: Insight[] = [
  { id: 'hear-vs-bother', citation: 'cima2019',
    tr: 'Çınlamayı duymak ile ondan rahatsız olmak farklı şeylerdir; program ikincisini hedefler.',
    en: 'Hearing tinnitus and being bothered by it are different things; the programme targets the second.' },
  { id: 'habituation', citation: 'tunkel2014',
    tr: 'Alışma, sesin kaybolması değil; beynin onu önemsiz saymayı öğrenmesidir. Bu zamanla olur.',
    en: 'Habituation is not the sound disappearing; it is the brain learning to treat it as unimportant. That takes time.' },
  { id: 'silence', citation: 'sereda2018',
    tr: 'Sessiz odalar çınlamayı belirgin kılar. Düşük düzeyde arka plan sesi, karşılaştırma noktasını yumuşatır.',
    en: 'Quiet rooms make tinnitus stand out. Low-level background sound softens the contrast.' },
  { id: 'sound-not-alone', citation: 'sereda2018',
    tr: 'Ses tek başına bir çözüm değildir; eğitim ve beceri çalışmasıyla birlikte kullanıldığında anlam kazanır.',
    en: 'Sound on its own is not a solution; it makes sense alongside education and skills practice.' },
  { id: 'cbt-impact', citation: 'fuller2020',
    tr: 'BDT çınlamanın sesini değil, yaşam kalitesi üzerindeki etkisini azaltır; Cochrane derlemesi bunu gösterir.',
    en: 'CBT reduces the impact of tinnitus on quality of life, not its loudness; the Cochrane review shows this.' },
  { id: 'icbt', citation: 'beukes2018',
    tr: 'İnternet üzerinden BDT, yüz yüze gruplara benzer sonuç verebilir; düzenli katılım en güçlü belirleyicidir.',
    en: 'Internet-delivered CBT can match face-to-face groups; regular participation is the strongest predictor.' },
  { id: 'act', citation: 'hesser2012',
    tr: 'Kabul temelli yaklaşım da BDT kadar işe yarayabilir: amaç sesle savaşmak değil, hayatı sürdürmek.',
    en: 'An acceptance-based approach can work as well as CBT: the aim is not to fight the sound but to keep living.' },
  { id: 'mindfulness', citation: 'mckenna2017',
    tr: 'Farkındalık temelli bilişsel terapi çınlamayla ilişkili sıkıntıyı azaltabilir; etki aylar sonra da sürmüştür.',
    en: 'Mindfulness-based cognitive therapy can reduce tinnitus-related distress; the effect lasted months later.' },
  { id: 'relaxation', citation: 'ost1987',
    tr: 'Gevşeme bir beceridir: Öst\'ün basamakları 15 dakikadan 1 dakikaya iner. Pratik kısaldıkça güçlenir.',
    en: 'Relaxation is a skill: Öst\'s steps go from 15 minutes down to 1. The practice gets stronger as it gets shorter.' },
  { id: 'cbti', citation: 'marks2023',
    tr: 'Uykusuzluk için BDT-U, çınlamayla ilişkili uyku sorununda ilaç olmadan fark yaratabilir.',
    en: 'CBT for insomnia can make a difference in tinnitus-related sleep problems without medication.' },
  { id: 'thi-mcid', citation: 'newman1996',
    tr: 'THI\'de 7 puanlık düşüş anlamlı kabul edilir; küçük sayılar da gerçek değişimdir.',
    en: 'A 7-point drop on the THI counts as meaningful; small numbers are real change too.' },
  { id: 'hyperacusis', citation: 'juris2014',
    tr: 'Ses hassasiyetinde kademeli, düşük düzey ses ve BDT birlikte çalışılmıştır; sürekli kulak tıkacı tersine işleyebilir.',
    en: 'For sound sensitivity, gradual low-level sound plus CBT has been studied; constant earplugs can work against you.' },
  { id: 'somatic', citation: 'michiels2016',
    tr: 'Boyun ve çene çınlamayı değiştiriyorsa, hedefli fizyoterapi bazı kişilerde fark yaratmıştır.',
    en: 'If neck and jaw change the sound, targeted physiotherapy has made a difference for some people.' },
  { id: 'acute-chronic', citation: 'wallhausser2017',
    tr: 'Akut çınlamanın kalıcı sıkıntıya dönüşmesini en çok öngören şey sesin kendisi değil; kaygı ve uyku düzeyidir.',
    en: 'What best predicts acute tinnitus turning into lasting distress is not the sound itself but anxiety and sleep.' },
  { id: 'ginkgo', citation: 'sereda2022',
    tr: 'Ginkgo biloba için Cochrane derlemesi yarar göstermedi; para harcamadan önce bunu bilmek iyidir.',
    en: 'The Cochrane review found no benefit from Ginkgo biloba; good to know before spending money.' },
  { id: 'betahistine', citation: 'wegner2018',
    tr: 'Betahistin çınlama için plasebodan farklı bulunmadı; "çınlama ilacı" diye bir ilaç yoktur.',
    en: 'Betahistine was no different from placebo for tinnitus; there is no such thing as a "tinnitus pill".' },
  { id: 'zinc', citation: 'person2016',
    tr: 'Çinko takviyesi çınlamada yarar göstermedi; dengeli beslenme yeterlidir.',
    en: 'Zinc supplements showed no benefit for tinnitus; a balanced diet is enough.' },
  { id: 'melatonin', citation: 'hurtuk2011',
    tr: 'Melatonin uykuyu biraz düzeltebilir; çınlamayı doğrudan azalttığına dair kanıt zayıftır.',
    en: 'Melatonin may improve sleep a little; evidence that it directly reduces tinnitus is weak.' },
  { id: 'guidelines', citation: 'nice2020',
    tr: 'Kılavuzlar hemfikir: eğitim, ses zenginleştirme ve BDT. Hiçbiri kür değil; hepsi etkiyi azaltmayı hedefler.',
    en: 'Guidelines agree: education, sound enrichment and CBT. None is a cure; all aim to reduce the impact.' },
  { id: 'mood', citation: 'kroenke2001',
    tr: 'Ruh hali çınlamanın sesini değil, rahatsızlığı yükseltir; ruh hali taraması bu yüzden programın parçasıdır.',
    en: 'Mood raises the annoyance, not the loudness; that is why a mood screen is part of the programme.' },
  { id: 'small-steps', citation: 'adams2026',
    tr: 'Yoğun ve hızlı değil, düzenli küçük adımlar fark yaratır; güncel kılavuz da öz yönetimi önerir.',
    en: 'Regular small steps make the difference, not intensity; the current guideline recommends self-management.' },
  { id: 'app-cbt', citation: 'wasano2026',
    tr: 'Telefon uygulamasıyla BDT, sahte uygulamaya göre sıkıntıyı daha çok azalttı; araç siz kullandıkça çalışır.',
    en: 'Smartphone CBT reduced distress more than a sham app; the tool works as long as you use it.' },
  { id: 'completion', citation: 'walter2023',
    tr: 'Dijital tedavi denemelerinde kazanım, modül tamamlama oranıyla birlikte arttı; haftada birkaç kısa gün yeter.',
    en: 'In digital therapy trials, gains rose with module completion; a few short days a week is enough.' },
  { id: 'ri', citation: 'sendesen2024',
    tr: 'Ses sonrası kısa sessizlik (RI), ses temelli yaklaşımın işe yarama olasılığını artırabilir; yoksa da başka yollar var.',
    en: 'Brief silence after sound (RI) may raise the odds that sound-based approaches help; without it, other routes remain.' },
];

/** Small deterministic hash so each programme starts the 24-day cycle at a different note. */
export function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** The note for a programme day: consecutive days never repeat within a 24-day cycle. */
export function insightForDay(programId: string, dayIndex: number): Insight {
  const n = INSIGHTS.length;
  return INSIGHTS[(((dayIndex + hashString(programId)) % n) + n) % n];
}

/** True when every insight resolves to a known citation (checked in tests). */
export const insightsAreCited = () => INSIGHTS.every((i) => !!CITATIONS[i.citation]);
