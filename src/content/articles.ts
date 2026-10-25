/**
 * Education library. Bodies are markdown-lite (paragraphs, "- " bullets, **bold**, "| a | b | c |" table rows)
 * with inline citation markers [n] that map 1-based into `citations`.
 * Numbers come from docs/research/{treatment,diagnosis}.md; every claim resolves to a citation in citations.ts.
 */
import type { L } from './modules';

export type ArticleGroup = 'basics' | 'sound' | 'cbt' | 'sleep' | 'hearing' | 'doctor';

export interface Article {
  slug: string;
  title: L;
  readingMinutes: number;
  group: ArticleGroup;
  reviewedLine: L;
  takeaway: L;
  body: L;
  citations: string[];
}

const REVIEWED: L = { tr: 'Kanıt özeti, Ekim 2026', en: 'Evidence summary, October 2026' };

export const ARTICLES: Article[] = [
  {
    slug: 'what-is-tinnitus',
    title: { tr: 'Çınlama (tinnitus) nedir?', en: 'What is tinnitus?' },
    readingMinutes: 6, group: 'basics', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Çınlama, dışarıda kaynağı olmayan bir sestir. Çoğunlukla işitme yollarındaki bir dengelenmeden doğar. Hastalık değil, bir belirtidir; doktor kontrolünden sonra yönetilebilir.',
      en: 'Tinnitus is a sound with no external source. It mostly arises from a compensation process in the hearing pathways. It is a symptom, not a disease, and can be managed once a doctor has checked it.',
    },
    body: {
      tr: `## Tanım

Çınlama, dış ortamda bir kaynak olmadan duyulan sestir: çınlama, uğultu, vızıltı, ıslık ya da birden çok sesin karışımı. Yetişkinlerin yaklaşık yüzde 10–15'i bunu yaşar; daha küçük bir bölümü (yüzde 1–2) için günlük yaşamı belirgin biçimde etkiler [1]. Çınlama bir hastalık değil, bir belirtidir; tıpkı ağrı gibi, altında farklı nedenler yatabilir ve çoğu zaman belirli bir neden bulunmaz.

## Nereden gelir

Çoğu kişide başlangıç noktası iç kulaktır. Gürültü, yaşlanma, bazı ilaçlar ya da enfeksiyon, iç kulaktaki tüy hücrelerinin bir bölümünü etkiler ve beyne giden sinyal belirli frekanslarda azalır. İşitme sistemi bu azalmayı dengelemek için kendi "kazancını" artırır; sinir hücreleri kendi kendine daha çok ve daha uyumlu sinyal üretmeye başlar. Beyin bu etkinliği ses olarak yorumlar. Bu yüzden çınlama kulakta "üretilen" değil, çoğunlukla işitme yollarında ve beyinde "işlenen" bir sinyaldir.

Bu model iki önemli sonuç doğurur. Birincisi, çınlama ile işitme kaybı sık birlikte görülür; kayıp fark edilmeyecek kadar hafif ya da yalnızca yüksek frekanslarda olabilir. Kılavuzlar bu nedenle kalıcı çınlaması olanlara işitme testi önerir [1, 2]. İkincisi, ses çoğu zaman zararsızdır: sesi duymanız, kulağınızda ilerleyen bir hasar olduğu anlamına gelmez.

## Neden bazı kişilerde rahatsız edicidir

Aynı ses düzeyinde bir kişi sesi gün boyu fark etmezken bir başkası sürekli duyabilir. Fark, beynin sinyale verdiği önemdedir. Beyin, tehdit ya da belirsizlikle ilişkilendirdiği sinyalleri süzmez; onlara öncelik verir. "Bu ses ne, kötüleşecek mi, hiç geçmeyecek mi" soruları sesi önemli kılar; dikkat sese kilitlenir; kaygı ve uykusuzluk sesi daha da belirgin hâle getirir. Bu döngü çınlamanın "sıkıntı" boyutunu belirler ve tam olarak bu boyut değiştirilebilir [3].

Kılavuzlar bu nedenle rahatsız edici ve rahatsız etmeyen çınlamayı ayırır; müdahale rahatsız edici olana yöneliktir [1, 2]. Rahatsızlık düzeyi, Tinnitus Handikap Envanteri (THI) gibi anketlerle ölçülür; 0–100 arasındaki puan beş dereceye ayrılır ve 7 puanlık bir değişim anlamlı sayılır [4].

## Süre ve seyir

Avrupa kılavuzu üç aydan kısa süreni akut (yeni), üç–altı ayı ara dönem, altı ay ve üzerini kronik (uzun süreli) olarak tanımlar [2]. Akut dönemde ses bazı kişilerde kendiliğinden azalır ya da kaybolur; kronik çınlamada ses genellikle sabit kalır ama sesle ilişki belirgin biçimde değişebilir. Yıllar içinde çoğu kişi için sesin düzeyi artmaz; dalgalanmalar yorgunluk, stres, gürültü ve uykusuzlukla ilgilidir.

## Nabızla atan ve tek taraflı çınlama

Sesin kalp atışıyla eş zamanlı atması (pulsatil tinnitus), yalnızca bir kulakta olması, ani işitme kaybı, baş dönmesi ya da nörolojik belirtilerle birlikte görülmesi farklı bir değerlendirme gerektirir; bu durumlarda görüntüleme ve kulak burun boğaz muayenesi öncelik kazanır [1, 5]. Bunlar çınlamanın "tehlikeli" olduğu anlamına gelmez; ancak altta yatan ve ele alınabilir bir neden bulunma olasılığı daha yüksektir.

## Ne işe yarar

Bugün için sesi ortadan kaldıran bir ilaç ya da işlem yoktur. Kanıtı en güçlü yaklaşım bilişsel davranışçı terapidir (BDT): 28 çalışmayı birleştiren Cochrane derlemesine göre BDT, çınlamanın yaşam kalitesine etkisini azaltabilir [3]. İşitme kaybı varsa işitme cihazları, sessiz ortamlar için rahatlatan arka plan sesi ve uyku için uykusuzluk terapisi bu temelin üzerine eklenir [1, 2]. Hedef sessizlik değil, sesin hayattaki yerinin küçülmesidir.`,
      en: `## Definition

Tinnitus is sound heard without a source in the environment: ringing, humming, buzzing, hissing or a mixture. About 10–15 per cent of adults experience it; for a smaller share (1–2 per cent) it clearly affects daily life [1]. Tinnitus is a symptom, not a disease; like pain, it can have different causes, and often no specific cause is found.

## Where it comes from

In most people the starting point is the inner ear. Noise, ageing, certain medicines or infection affect some of the hair cells, and the signal reaching the brain drops at certain frequencies. The hearing system raises its own "gain" to compensate; nerve cells begin to fire more spontaneously and more in synchrony. The brain interprets this activity as sound. So tinnitus is not "generated" in the ear but mostly "processed" along the hearing pathways and in the brain.

This model has two important consequences. First, tinnitus and hearing loss often go together; the loss may be too mild to notice or confined to high frequencies. Guidelines therefore recommend a hearing test for people with persistent tinnitus [1, 2]. Second, the sound is usually harmless: hearing it does not mean ongoing damage in your ear.

## Why it bothers some people

At the same sound level one person may not notice it all day while another hears it constantly. The difference lies in the importance the brain gives the signal. The brain does not filter signals it links with threat or uncertainty; it prioritises them. Questions such as "what is this, will it get worse, will it ever stop" make the sound important; attention locks on; anxiety and poor sleep make it more prominent still. This loop determines the "distress" dimension of tinnitus, and exactly this dimension can be changed [3].

Guidelines therefore distinguish bothersome from non-bothersome tinnitus; intervention is aimed at the bothersome kind [1, 2]. The level of distress is measured with questionnaires such as the Tinnitus Handicap Inventory (THI); the 0–100 score falls into five grades and a 7-point change counts as meaningful [4].

## Duration and course

The European guideline defines less than three months as acute, three to six months as sub-acute, and six months or more as chronic [2]. In the acute phase the sound fades or disappears on its own in some people; in chronic tinnitus the sound usually stays the same, but the relationship with it can change markedly. Over the years the level does not rise for most people; fluctuations relate to tiredness, stress, noise and lack of sleep.

## Pulsatile and one-sided tinnitus

Sound that pulses with the heartbeat (pulsatile tinnitus), sound in one ear only, sudden hearing loss, dizziness or neurological symptoms call for a different assessment; imaging and an ENT examination take priority [1, 5]. These do not mean the tinnitus is "dangerous", but the chance of finding an underlying, treatable cause is higher.

## What works

There is currently no medicine or procedure that removes the sound. The approach with the strongest evidence is cognitive behavioural therapy: according to the Cochrane review pooling 28 randomised trials, CBT can reduce the impact of tinnitus on quality of life [3]. Hearing aids where there is hearing loss, sound enrichment for quiet settings and CBT for insomnia for sleep are added on top [1, 2]. The goal is not silence but a smaller place for the sound in life.`,
    },
    citations: ['tunkel2014', 'cima2019', 'fuller2020', 'newman1996', 'nice2020'],
  },
  {
    slug: 'habituation',
    title: { tr: 'Çınlamaya alışma nasıl olur', en: 'How habituation happens' },
    readingMinutes: 6, group: 'cbt', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Alışma, beynin tekrar eden ve zararsız olduğu anlaşılan bir sinyale verdiği tepkiyi azaltmasıdır; önce tepkiye, sonra algıya alışılır ve süreci en çok tehdit algısı, sesi kontrol etme ve kaçınma yavaşlatır.',
      en: 'Habituation is the brain reducing its response to a signal that repeats and proves harmless; reaction habituates first, then perception, and what slows the process most is threat perception, sound checking and avoidance.',
    },
    body: {
      tr: `## Gündelik bir yetenek

Yeni bir eve taşındığınızda sokaktan gelen trafik sesini ilk geceler duyarsınız; birkaç hafta sonra duymaz olursunuz. Ses değişmemiştir; sinir sisteminin ona verdiği önem değişmiştir. Buna alışma denir ve beynin en temel öğrenme biçimlerinden biridir: tekrar eden, öngörülebilir ve zararsız sinyaller bilinçten süzülür.

Çınlama için de aynı süreç geçerlidir; ancak iki koşulu sağlamak gerekir. Sinyalin **zararsız** olduğunun beyin tarafından kabul edilmesi ve sinyalin **önemli** sayılmaması. Çınlamada bu iki koşul kendiliğinden sağlanmaz, çünkü ses belirsizdir ve başlangıçta kaygıyla ilişkilenir [1].

## İki aşama

Klinik modellerde alışma iki düzeyde tanımlanır. **Tepkiye alışma** önce gelir: ses hâlâ duyulur, ama ona eşlik eden kaygı, öfke, gerginlik ve dikkat çekimi azalır. Kişi sesi "duyar ama umursamaz". **Algıya alışma** daha sonra gelir: ses günün büyük kısmında fark edilmez, dikkat bilerek yöneltildiğinde hâlâ oradadır. Çoğu kişi için ikinci aşama aylar ya da yıllar alır ve birincisinden geçer [1, 2].

Bu sıralama önemlidir, çünkü tedavilerin hedefi de bu sıradadır: önce sesle ilişkiyi değiştirmek, sonra fark edilirliğin azalmasına izin vermek. Sesi doğrudan "duymamaya" çalışmak ise ters etki yapar; bastırılan sinyal daha çok dikkat çeker.

## Süreci yavaşlatan üç şey

- **Tehdit algısı.** "Ses kötüleşiyor", "beynimde bir sorun var", "hiç geçmeyecek" düşünceleri sesi beyin için önemli kılar. Tıbbi değerlendirmenin tamamlanması ve sesin mekanizmasının anlaşılması bu nedenle her programın ilk adımıdır [1, 3].
- **Kontrol etme.** Gün içinde sesin orada olup olmadığını, arttığını ya da azaldığını dinlemek, sesi sürekli gündemde tutar. Her kontrol beynin "bu önemli" etiketini yeniler.
- **Kaçınma.** Sessizlikten kaçınmak, kulak tıkacı takmak, sosyal ortamları iptal etmek kısa vadede rahatlatır ama sesin tehlikeli olduğu mesajını güçlendirir. Kaçınma, çınlamanın ses hassasiyetiyle birlikte görülmesinde de rol oynar [4].

## Süreci hızlandıran şeyler

Bilişsel davranışçı terapi tam olarak bu üç engeli hedefler: sesle ilgili düşünceleri sorgulamak, dikkati yönlendirmeyi öğrenmek, kaçınılan durumlara kademeli dönmek ve sese bilerek kulak vererek kaygının kendi başına düştüğünü yaşamak. Cochrane derlemesindeki 28 çalışma, BDT'nin çınlamaya bağlı yaşam kalitesi kaybını azaltabildiğini gösterir [2]; internet üzerinden uygulanan sekiz haftalık programlar yüz yüze terapiden daha az etkili bulunmamıştır [3].

Rahatlatan arka plan sesi ikinci bir yardımcıdır: sessiz ortamda çınlama tek sinyaldir ve bütün dikkati toplar; kısık bir arka plan sesi çınlamanın arka plana karışmasına izin verir. Ses, çınlamayı örtecek kadar yüksek olmamalıdır; aksi hâlde beyin ona alışma fırsatı bulamaz [5]. Kılavuzlar ses terapisini tek başına değil, danışmanlıkla birlikte önerir; büyük bir randomize çalışmada ses üreteçlerinin danışmanlığa ek katkısı gösterilememiştir [6].

Bilinçli farkındalık, alışmaya başka bir yoldan ulaşır: sesi değiştirmeye çalışmadan onunla birlikte olmayı öğretir. Randomize bir çalışmada farkındalık temelli bilişsel terapi, gevşeme eğitimine göre çınlama sıkıntısını daha fazla azalttı [7].

## Zaman çizelgesi

Tepkiye alışma, düzenli uygulamayla haftalar ile birkaç ay içinde başlar. Algıya alışma daha yavaştır ve doğrusal değildir: iyi dönemler ve geri dönüşler birbirini izler. Kötü bir hafta, sürecin bozulduğu anlamına gelmez; yorgunluk, hastalık ya da stres sesi geçici olarak öne çıkarır. Alışmanın ölçüsü sesin yok olması değil, sesin fark edildiği anlarda hissedilen sıkıntının azalmasıdır.`,
      en: `## An everyday ability

When you move to a new home you hear the traffic from the street during the first nights; a few weeks later you no longer hear it. The sound has not changed; the importance the nervous system gives it has. This is called habituation and it is one of the brain's most basic forms of learning: repeating, predictable and harmless signals are filtered out of awareness.

The same process applies to tinnitus, but two conditions must be met. The brain must accept that the signal is **harmless**, and it must not count the signal as **important**. In tinnitus these two conditions are not met by themselves, because the sound is ambiguous and initially linked with anxiety [1].

## Two stages

Clinical models describe habituation on two levels. **Habituation of reaction** comes first: the sound is still heard, but the anxiety, anger, tension and pull on attention that accompany it decrease. The person "hears it but does not mind it". **Habituation of perception** comes later: the sound goes unnoticed for most of the day and is still there when attention is deliberately turned to it. For most people the second stage takes months or years and passes through the first [1, 2].

This order matters because treatments target it in that order: first change the relationship with the sound, then allow noticing to decrease. Trying to "not hear" the sound directly backfires; a suppressed signal draws more attention.

## Three things that slow the process

- **Threat perception.** Thoughts such as "the sound is getting worse", "something is wrong in my brain", "it will never stop" make the sound important to the brain. Completing the medical assessment and understanding the mechanism is therefore the first step of every programme [1, 3].
- **Checking.** Listening during the day to see whether the sound is there, louder or quieter keeps it on the agenda. Each check renews the brain's "this is important" tag.
- **Avoidance.** Avoiding silence, wearing earplugs, cancelling social settings bring short-term relief but strengthen the message that the sound is dangerous. Avoidance also plays a part when tinnitus comes with sound sensitivity [4].

## Things that speed it up

Cognitive behavioural therapy targets exactly these three obstacles: questioning thoughts about the sound, learning to direct attention, returning gradually to avoided situations, and listening to the sound deliberately so that anxiety is experienced falling on its own. The 28 trials in the Cochrane review show that CBT can reduce the loss of quality of life due to tinnitus [2]; eight-week internet-delivered programmes were found no less effective than face-to-face therapy [3].

Sound enrichment is a second helper: in a quiet setting the tinnitus is the only signal and gathers all attention; a low-level background sound lets it blend into the ground. The sound must not be loud enough to cover the tinnitus, or the brain gets no chance to habituate to it [5]. Guidelines recommend sound therapy together with counselling, not alone; in a large randomised trial, sound generators added nothing measurable to counselling [6].

Mindfulness reaches habituation by another road: it teaches being with the sound without trying to change it. In a randomised trial, mindfulness-based cognitive therapy reduced tinnitus distress more than relaxation training [7].

## Timeline

Habituation of reaction begins within weeks to a few months with regular practice. Habituation of perception is slower and not linear: good periods and setbacks alternate. A bad week does not mean the process has broken down; tiredness, illness or stress bring the sound forward temporarily. The measure of habituation is not the sound disappearing but the distress felt in the moments it is noticed decreasing.`,
    },
    citations: ['tunkel2014', 'fuller2020', 'beukes2018', 'juris2014', 'sereda2018', 'scherer2019', 'mckenna2017'],
  },
  {
    slug: 'hearing-protection',
    title: { tr: 'İşitmeyi korumak: ne zaman, nasıl', en: 'Protecting hearing: when and how' },
    readingMinutes: 5, group: 'hearing', reviewedLine: REVIEWED,
    takeaway: {
      tr: '85 desibel ve üzeri gürültüde koruma işitme sağlığıdır; gündelik ortamlarda tıkaç kullanmak ise çınlamayı ve ses hassasiyetini artırabilir. Çizgi, ortamın ses düzeyidir.',
      en: 'Protection in noise of 85 decibels and above is hearing health; using plugs in everyday settings can increase tinnitus and sound sensitivity. The line is the sound level of the setting.',
    },
    body: {
      tr: `## Gürültü ve işitme

Gürültüye bağlı işitme kaybı, çınlamanın en sık nedenlerinden biridir ve önlenebilir olanıdır. İç kulaktaki tüy hücreleri yüksek ses düzeyinde mekanik ve metabolik olarak zarar görür; kaybolan hücreler yenilenmez. Risk, ses düzeyi ile maruz kalma süresinin çarpımına bağlıdır. Mesleki standartlar sekiz saatlik bir iş günü için 85 desibel (dBA) sınırını kullanır; düzey her 3 desibel arttığında güvenli süre yarıya iner: 88 desibelde dört saat, 91'de iki saat, 100 desibelde on beş dakika.

Kaba bir ölçek:

- 60 dB: normal konuşma, sakin ofis.
- 70–75 dB: lokanta, çarşı, trafikli cadde, elektrikli süpürge.
- 85 dB: yoğun trafik, çim biçme makinesi, bazı spor salonları. Uzun sürede koruma gerekir.
- 95–100 dB: motosiklet, matkap, bir konserin ortası.
- 110–120 dB: gece kulübü hoparlörü yakını, havai fişek, silah sesi. Saniyeler içinde risk.

Gürültülü bir etkinlikten sonra kulaklarda uğultu ya da geçici dolgunluk, iç kulağın yorulduğunu gösterir; tekrarlanan bu "geçici" dönemler zamanla kalıcı kayba dönüşebilir.

## Ne zaman koruma

- Konser, festival, düğün salonu: hoparlörlere yakın yerlerde düz filtreli (müzisyen tipi) tıkaç, sesi bozmadan 15–20 desibel düşürür.
- Elektrikli aletler, motosiklet, avcılık ve atış: kulaklık tipi koruyucu ya da köpük tıkaç.
- Mesleki gürültü: iş yeri işitme koruma programı ve düzenli odyometri.
- Kulaklıkla müzik: cihazın ses sınırını açın; "60/60 kuralı" (en fazla yüzde 60 ses düzeyi, günde en fazla 60 dakika yüksek dinleme) pratik bir ölçüdür. Gürültü önleyici kulaklıklar, dış sesi bastırdığı için müziği daha düşük düzeyde dinlemeye yardım eder.

## Ne zaman koruma değil

Lokanta, ofis, otobüs, çocuk parkı ve ev gibi ortamların ses düzeyi işitme için zararsızdır. Bu ortamlarda tıkaç takmak işitme sistemini sessizliğe alıştırabilir: sistemin "kazancı" yükselir, tıkaç çıkınca sesler daha sert gelir, çınlama öne çıkar ve ses hassasiyeti (hiperakuzi) gelişebilir ya da artar [1, 2]. Çınlaması olan kişilerde sık görülen bu kaçınma davranışı, ses hassasiyeti tedavi protokollerinde özellikle bırakılması istenen bir alışkanlıktır [1].

Aynı şey gece için de geçerlidir: tıkaçla uyumak tam sessizlik yaratır ve çınlamayı en belirgin hâline getirir; gece için düşük düzeyde arka plan sesi önerilir [3].

## Ani işitme kaybı: zaman kritiktir

Üç gün içinde gelişen, bir kulakta belirgin işitme düşüşü (çoğu zaman çınlama ve dolgunluk ile) ani iç kulak kaynaklı işitme kaybı olabilir. Kılavuz, mümkün olan en kısa sürede (en geç 14 gün içinde) işitme testi yapılmasını önerir. Steroid tedavisi ilk iki hafta içinde değerlendirilir; düzelme eksikse 2–6. haftada kulak içine ek tedavi seçeneği vardır [4]. Bu durum acil bir kulak burun boğaz başvurusu gerektirir; "geçer" diye beklemek tedavi penceresini kaçırabilir.

## İlaçlar ve işitme

Bazı ilaçlar iç kulağa zarar verebilir: yüksek doz aspirin ve bazı ağrı kesiciler (genellikle geri dönüşlü), bazı güçlü antibiyotikler, kemoterapi ilaçları, kıvrım diüretikleri. Bu ilaçları kullanırken çınlama ya da işitmede değişiklik fark ederseniz reçete eden hekime bildirin; ilacı kendi başınıza bırakmayın [5].

## Gürültülü bir etkinlikten sonra

Kulaklar uğulduyor ya da sesler boğuk geliyorsa 24–48 saat yüksek sesten uzak durun, kulak tıkacıyla sessizlik yaratmayın ve kısık bir arka plan sesi kullanın. Uğultu üç günden uzun sürerse işitme testi isteyin. İşitme belirgin düştüyse beklemeyin; aynı gün bir KBB uzmanına başvurun. Bu durumlarda uygulamadaki işitme taraması bir ön bilgi verir; klinik testin yerini tutmaz.`,
      en: `## Noise and hearing

Noise-induced hearing loss is one of the most common causes of tinnitus and the preventable one. The hair cells of the inner ear are damaged mechanically and metabolically at high sound levels; lost cells do not regenerate. Risk depends on sound level multiplied by exposure time. Occupational standards use 85 decibels (dBA) for an eight-hour working day; for every 3-decibel rise the safe time halves: four hours at 88 decibels, two at 91, fifteen minutes at 100.

A rough scale:

- 60 dB: normal conversation, a calm office.
- 70–75 dB: a restaurant, a market, a busy street, a vacuum cleaner.
- 85 dB: heavy traffic, a lawnmower, some gyms. Protection needed for long exposure.
- 95–100 dB: a motorcycle, a drill, the middle of a concert.
- 110–120 dB: near a nightclub speaker, fireworks, gunfire. Risk within seconds.

Ringing or temporary fullness in the ears after a loud event shows the inner ear has been fatigued; repeated "temporary" episodes can turn into permanent loss over time.

## When to protect

- Concerts, festivals, wedding halls: near the speakers, flat-filter (musician's) plugs cut 15–20 decibels without distorting the sound.
- Power tools, motorcycles, hunting and shooting: earmuff-type protectors or foam plugs.
- Occupational noise: a workplace hearing conservation programme and regular audiometry.
- Music through earphones: turn on the device's volume limit; the "60/60 rule" (at most 60 per cent volume, at most 60 minutes of loud listening a day) is a practical measure. Noise-cancelling headphones help you listen at a lower level because they suppress outside sound.

## When not to protect

The sound levels of restaurants, offices, buses, playgrounds and homes are harmless to hearing. Wearing plugs there can accustom the hearing system to silence: its "gain" rises, sounds hit harder when the plugs come out, tinnitus comes forward, and sound sensitivity (hyperacusis) can develop or increase [1, 2]. This avoidance behaviour, common in people with tinnitus, is a habit that hyperacusis treatment protocols specifically ask people to drop [1].

The same applies at night: sleeping with plugs creates complete silence and makes tinnitus most prominent; low-level background sound is recommended for the night instead [3].

## Sudden hearing loss: time is critical

A marked drop in hearing in one ear developing within three days (often with tinnitus and fullness) may be sudden sensorineural hearing loss. The guideline recommends audiometry as soon as possible (within 14 days at the latest). Steroid treatment is considered within the first two weeks; if recovery is incomplete, an add-on treatment into the ear is an option at 2–6 weeks [4]. This requires an urgent ENT visit; waiting for it to "pass" can miss the treatment window.

## Medicines and hearing

Some medicines can harm the inner ear: high-dose aspirin and some painkillers (usually reversible), certain strong antibiotics, chemotherapy drugs, loop diuretics. If you notice tinnitus or a change in hearing while taking these, tell the prescribing doctor; do not stop the medicine on your own [5].

## After a loud event

If the ears are ringing or sounds seem muffled, stay away from loud sound for 24–48 hours, do not create silence with earplugs, and use low-level background sound. If the ringing lasts longer than three days, ask for a hearing test. If hearing has clearly dropped, do not wait; see an ENT specialist the same day. The hearing screen in the app gives preliminary information in these cases; it does not replace the clinical test.`,
    },
    citations: ['juris2014', 'formby2015', 'sereda2018', 'chandrasekhar2019', 'tunkel2014'],
  },
  {
    slug: 'supplements',
    title: { tr: 'Takviyeler ve ilaçlar: kanıt ne diyor', en: 'Supplements and medicines: what the evidence says' },
    readingMinutes: 6, group: 'basics', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Çınlamayı azalttığı gösterilen bir ilaç ya da takviye yoktur: betahistin, ginkgo ve çinkonun plasebodan farkı gösterilmemiştir; kılavuzlar takviye önermez. Eşlik eden depresyon ve uykusuzluk kendi başlarına tedavi edilir.',
      en: 'No medicine or supplement has been shown to reduce tinnitus: betahistine, ginkgo and zinc are no different from placebo; guidelines advise against supplements. Accompanying depression and insomnia are treated in their own right.',
    },
    body: {
      tr: `## Neden bu kadar çok ürün var

Çınlama yaygındır, rahatsız edicidir ve sesi ortadan kaldıran bir tedavi yoktur. Bu üçlü, kanıtsız ürünler için ideal bir pazar oluşturur. "Doğal formül", "klinik olarak test edildi", "binlerce kişi memnun" gibi ifadeler randomize kontrollü çalışma anlamına gelmez.

## Betahistin

Baş dönmesi için kullanılan bu ilaç, çınlama için de sık reçete edilir. Beş randomize çalışmayı birleştiren Cochrane derlemesi (yaklaşık 300 katılımcı) betahistinin çınlama şiddeti ya da gürlüğü üzerinde plasebodan farklı bir etkisi olmadığını buldu [1]. İngiltere kılavuzu NICE, yalnızca çınlama için betahistin verilmemesini açıkça önerir [2].

## Ginkgo biloba

En çok satılan "çınlama takviyesi". 12 randomize çalışma ve yaklaşık 1 900 katılımcıyı kapsayan Cochrane derlemesi, ginkgonun çınlama şiddeti, gürlüğü ya da yaşam kalitesi üzerinde anlamlı bir etkisi olmadığını gösterir [3]. Ginkgo kan sulandırıcılarla etkileşebilir; "zararsız bitkisel ürün" varsayımı doğru değildir.

## Çinko, B12, magnezyum ve "çınlama formülleri"

Çinko için üç randomize çalışma (209 katılımcı) yarar göstermedi. B12, magnezyum, lipoflavonoidler, CBD ve karışım ürünler için randomize kanıt yoktur. Amerikan KBB Akademisi kılavuzu 2014 ve 2026 sürümlerinde çınlama için besin takviyesi önerilmemesini belirtir [4, 5]. Belirgin bir vitamin eksikliği saptanmışsa onun düzeltilmesi ayrı bir konudur; çınlama için takviye almak değildir.

## Melatonin

Küçük çalışmalarda melatonin, çınlaması ve uyku sorunu olan kişilerde uykuyu ve çınlama puanlarını bir miktar düzeltmiştir; ancak çalışmalar küçük, kısa ve düşük kalitelidir. Kılavuzlar melatonini çınlama tedavisi olarak önermez. Uyku için kullanımı bir hekimle konuşulabilir; çınlama için beklenti düşük tutulmalıdır [4].

## Antidepresanlar, benzodiazepinler ve antikonvülzanlar

Cochrane derlemeleri antidepresanların çınlama üzerinde yeterli kanıtı olmadığını, antikonvülzanların (gabapentin, karbamazepin) yarar göstermediğini bildirir. Benzodiazepinler kısa süreli rahatlama sağlayabilir ancak bağımlılık riski taşır ve alışmayı geciktirebilir. Kılavuzlar bu ilaçları çınlama için rutin olarak önermez [4, 5]. Önemli ayrım: çınlamayla birlikte depresyon ya da kaygı bozukluğu varsa, bunlar kendi başlarına ve etkili biçimde tedavi edilir; bu durumda ilaç tedavisi çınlama için değil, eşlik eden durum için verilir.

## Kulak içine verilen ilaçlar ve "yeni moleküller"

Akut çınlama için geliştirilen AM-101 (esketamin) faz 3 çalışmalarında, OTO-313 faz 2 çalışmasında birincil hedeflerine ulaşamadı; ikinci çalışmada plasebo grubundaki yüksek yanıt dikkat çekiciydi. Bugün çınlama için onaylanmış bir ilaç yoktur [4].

## Pratik ölçütler

- Ürün "çınlamayı ortadan kaldırır" ya da "sesi yok eder" diyorsa kanıta değil pazarlamaya dayanıyordur.
- Bağımsız randomize çalışma ve derleme var mı? Üreticinin kendi çalışması yeterli değildir.
- Kullanmaya karar verirseniz hekiminize söyleyin; etkileşimler (özellikle kan sulandırıcılar) önemlidir.
- Parayı ve zamanı kanıtı olan yöntemlere ayırın: BDT, işitme değerlendirmesi, uyku programı [6].

## Plasebo etkisini anlamak

Çınlama çalışmalarında plasebo kolundaki katılımcıların önemli bir bölümü düzelme bildirir; sesin gürlüğü ve sıkıntısı doğal olarak dalgalandığı için en kötü dönemde başlanan her şey "işe yaramış" gibi görünür. Bu nedenle "ben kullandım, azaldı" deneyimleri, ne kadar içten olursa olsun, bir ürünün etkili olduğunu göstermez; yalnızca kontrol grubuyla karşılaştırılan çalışmalar gösterir.`,
      en: `## Why there are so many products

Tinnitus is common, unpleasant, and has no treatment that removes the sound. That trio creates an ideal market for products without evidence. Phrases such as "natural formula", "clinically tested", "thousands of satisfied users" do not mean randomised controlled trials.

## Betahistine

This drug, used for dizziness, is also often prescribed for tinnitus. The Cochrane review pooling five randomised trials (about 300 participants) found no effect of betahistine on tinnitus severity or loudness compared with placebo [1]. The UK guideline NICE explicitly advises against offering betahistine for tinnitus alone [2].

## Ginkgo biloba

The best-selling "tinnitus supplement". The Cochrane review covering 12 randomised trials and about 1,900 participants shows no meaningful effect of ginkgo on tinnitus severity, loudness or quality of life [3]. Ginkgo can interact with blood thinners; the assumption of a "harmless herbal product" is not correct.

## Zinc, B12, magnesium and "tinnitus formulas"

For zinc, three randomised trials (209 participants) showed no benefit. For B12, magnesium, lipoflavonoids, CBD and combination products there is no randomised evidence. The American Academy of Otolaryngology guideline, in its 2014 and 2026 versions, states that dietary supplements are not recommended for tinnitus [4, 5]. If a marked vitamin deficiency has been found, correcting it is a separate matter; it is not taking a supplement for tinnitus.

## Melatonin

In small studies melatonin somewhat improved sleep and tinnitus scores in people with tinnitus and sleep problems; but the studies are small, short and of low quality. Guidelines do not recommend melatonin as a tinnitus treatment. Its use for sleep can be discussed with a doctor; expectations for tinnitus should be kept low [4].

## Antidepressants, benzodiazepines and anticonvulsants

Cochrane reviews report insufficient evidence for antidepressants in tinnitus and no benefit from anticonvulsants (gabapentin, carbamazepine). Benzodiazepines may give short-term relief but carry a dependence risk and can delay habituation. Guidelines do not recommend these drugs routinely for tinnitus [4, 5]. An important distinction: if depression or an anxiety disorder accompanies tinnitus, those are treated in their own right and effectively; medication is then given for the accompanying condition, not for the tinnitus.

## Drugs injected into the ear and "new molecules"

AM-101 (esketamine), developed for acute tinnitus, missed its primary endpoints in phase 3 trials, and OTO-313 in a phase 2 trial; in the latter the high response in the placebo group was notable. There is no approved drug for tinnitus today [4].

## Practical criteria

- If a product says it "cures tinnitus" or "removes the sound", it rests on marketing, not evidence.
- Is there an independent randomised trial and review? The manufacturer's own study is not enough.
- If you decide to use something, tell your doctor; interactions (especially with blood thinners) matter.
- Put money and time into methods with evidence: CBT, hearing assessment, a sleep programme [6].

## Understanding the placebo effect

In tinnitus trials a sizeable share of participants in the placebo arm report improvement; because loudness and distress fluctuate naturally, anything started at the worst point seems to have "worked". That is why "I used it and it got better" experiences, however sincere, do not show that a product is effective; only trials compared against a control group do.`,
    },
    citations: ['wegner2018', 'nice2020', 'sereda2022', 'tunkel2014', 'adams2026', 'fuller2020', 'person2016', 'hurtuk2011'],
  },
  {
    slug: 'when-to-see-a-doctor',
    title: { tr: 'Ne zaman doktora gitmeli', en: 'When to see a doctor' },
    readingMinutes: 5, group: 'doctor', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Ani işitme kaybı 24 saat içinde; nörolojik belirti, kontrolsüz baş dönmesi ya da kendine zarar verme düşüncesi hemen; tek taraflı, nabızla atan ya da ağrı ve akıntıyla birlikte çınlama planlı KBB değerlendirmesi gerektirir.',
      en: 'Sudden hearing loss within 24 hours; neurological signs, uncontrolled vertigo or thoughts of self-harm immediately; one-sided, pulsatile tinnitus or tinnitus with pain or discharge needs a planned ENT assessment.',
    },
    body: {
      tr: `## Herkes için bir değerlendirme

Çınlaması olan herkes için en az bir kez kulak burun boğaz muayenesi ve işitme testi önerilir: nedeni belirlemek, işitme kaybını saptamak ve ele alınabilir durumları dışlamak için [1, 2]. Uygulamadaki işitme taraması bir ön bilgidir; tam işitme testinin yerini tutmaz. Aşağıdaki durumlar ise beklemeyi gerektirmeyen ya da öncelikli olanlardır. Sıralama İngiltere NICE kılavuzunun sevk basamaklarına dayanır [3].

## Hemen (acil servis ya da 112)

- **Ani nörolojik belirtiler:** yüzde güçsüzlük ya da kayma, çift görme, konuşma bozukluğu, kol veya bacakta güçsüzlük. İnme ya da sinir hasarı dışlanmalıdır.
- **Kontrol edilemeyen, şiddetli baş dönmesi** ile birlikte çınlama; özellikle ani başlamışsa.
- **Kendinize zarar verme düşünceleri.** Çınlama bazen dayanılmaz hissettirir ve ruh hâlini ağır biçimde etkileyebilir. Bu düşünceler varsa 112'yi arayın ya da en yakın acile gidin; Amerikan kılavuzunun 2026 güncellemesi rahatsız edici çınlaması olan herkese bu sorunun sorulmasını önerir [4].

## 24 saat içinde

- **Ani işitme kaybı:** üç gün içinde gelişen, genellikle tek kulakta belirgin işitme düşüşü; çınlama ve dolgunluk hissi sıklıkla eşlik eder. Ani işitme kaybında zaman önemlidir: steroid tedavisi ilk iki hafta içinde değerlendirilir, 2–6. haftada ek tedavi seçeneği vardır [5]. Hafta sonunu beklemeyin.

## İki hafta içinde

- Çınlamanın **ruh sağlığını belirgin biçimde etkilemesi**: günlük işleri yapamamak, yoğun kaygı ya da çökkünlük.
- **30 günden eski ani işitme kaybı** ya da **hızla (günler–haftalar içinde) kötüleşen işitme**.

## Planlı KBB değerlendirmesi

- **Nabızla atan (pulsatil) çınlama:** kalp atışıyla eş zamanlı ses. Damar kaynaklı nedenler için görüntüleme önerilir; bu durumda önce doktor değerlendirmesi gerekir [1, 3].
- **Tek taraflı ya da asimetrik çınlama:** bir kulakta sürekli ses ya da iki kulak arasında belirgin işitme farkı. İşitme siniri üzerindeki iyi huylu tümörler gibi nadir nedenler için MR gerekebilir [1, 2].
- **Başkalarının da duyabildiği (objektif) çınlama.**
- **Kulak ağrısı, akıntı ya da yakın zamanda kafa travması** ile birlikte çınlama.
- **Dalgalı işitme, dolgunluk ve dönme atakları** birlikteyse Ménière hastalığı değerlendirmesi.

## Ne beklemeli

Muayene genellikle öykü, kulağa ışıkla bakma (otoskopi), tam işitme testi ve gerektiğinde ek testleri (orta kulak basınç testi, işitme siniri testi, görüntüleme) içerir. Kılavuzlar, yukarıdaki özel durumlar yoksa yalnızca çınlama için görüntüleme yapılmamasını önerir [1]. Muayeneye giderken şunları yazılı götürün: başlangıç zamanı, hangi kulak, sesin niteliği, nabızla atıp atmadığı, işitme ve denge belirtileri, kullandığınız ilaçlar, gürültü öyküsü ve bu uygulamadaki anket puanlarınız; uygulamanın profil raporu bu amaçla paylaşılabilir.

## Değerlendirmeden sonra

Kulak burun boğaz muayenesi ele alınabilir bir neden bulmadıysa çınlama "zararsız ama rahatsız edici" kategorisindedir ve kendi kendine yönetim programı güvenle sürdürülebilir. Ses niteliği değişirse, yeni belirtiler eklenirse ya da ruh hâli belirgin düşerse yeniden değerlendirme için başvurun.

## Hangi uzman

İlk başvuru kulak burun boğaz uzmanınadır; işitme testi odyolog tarafından yapılır. Çınlamaya bağlı kaygı, uykusuzluk ya da çökkünlük için psikolog veya psikiyatrist; boyun ve çene ile ilişkili çınlama için fizyoterapist ya da diş hekimi devreye girebilir. Aile hekiminiz bu yönlendirmeleri düzenleyebilir.`,
      en: `## An assessment for everyone

Everyone with tinnitus is advised to have at least one ENT examination and hearing test: to identify the cause, detect hearing loss and rule out treatable conditions [1, 2]. The hearing screen in the app is preliminary information; it does not replace clinical audiometry. The situations below are the ones that should not wait, or that take priority. The order follows the referral tiers of the UK NICE guideline [3].

## Immediately (emergency department or 112)

- **Sudden neurological symptoms:** facial weakness or drooping, double vision, slurred speech, weakness in an arm or leg. Stroke or nerve damage must be ruled out.
- **Uncontrolled, severe vertigo** with tinnitus, especially of sudden onset.
- **Thoughts of harming yourself.** Tinnitus can sometimes feel unbearable and weigh heavily on mood. If these thoughts are present, call 112 or go to the nearest emergency department; the 2026 update of the American guideline recommends asking everyone with bothersome tinnitus this question [4].

## Within 24 hours

- **Sudden hearing loss:** a marked drop in hearing, usually in one ear, developing within three days; tinnitus and a sense of fullness often accompany it. Sudden hearing loss is time-critical: steroid treatment is considered within the first two weeks, with an add-on option at 2–6 weeks [5]. Do not wait for the weekend to pass.

## Within two weeks

- Tinnitus **clearly affecting mental health**: inability to carry out daily activities, intense anxiety or low mood.
- **Sudden hearing loss more than 30 days ago** or **hearing worsening rapidly (over days to weeks)**.

## Planned ENT assessment

- **Pulsatile tinnitus:** sound in time with the heartbeat. Imaging is recommended for vascular causes; here a doctor's assessment comes first [1, 3].
- **One-sided or asymmetric tinnitus:** constant sound in one ear or a clear hearing difference between the ears. MRI may be needed for rare causes such as benign tumours on the hearing nerve [1, 2].
- **Tinnitus others can hear (objective tinnitus).**
- Tinnitus with **ear pain, discharge or recent head trauma**.
- **Fluctuating hearing, fullness and attacks of vertigo** together: assessment for Ménière's disease.

## What to expect

The examination usually includes history, otoscopy, a full hearing test and, when needed, further tests (tympanometry, auditory brainstem responses, imaging). Guidelines advise against imaging for tinnitus alone in the absence of the special situations above [1]. Take these in writing: time of onset, which ear, the character of the sound, whether it pulses, hearing and balance symptoms, medicines you take, noise history and your questionnaire scores from this app; the app's profile report can be shared for this purpose.

## After the assessment

If the ENT examination has found no treatable cause, the tinnitus is in the "harmless but bothersome" category and the self-management programme can safely continue. If the character of the sound changes, new symptoms appear or mood drops markedly, return for reassessment.

## Which specialist

The first visit is to an ear, nose and throat specialist; the hearing test is done by an audiologist. For anxiety, insomnia or low mood linked to tinnitus, a psychologist or psychiatrist; for tinnitus related to the neck and jaw, a physiotherapist or dentist may be involved. Your family doctor can arrange these referrals.`,
    },
    citations: ['tunkel2014', 'cima2019', 'nice2020', 'adams2026', 'chandrasekhar2019'],
  },
  {
    slug: 'hearing-aids',
    title: { tr: 'İşitme cihazları ve çınlama', en: 'Hearing aids and tinnitus' },
    readingMinutes: 6, group: 'hearing', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'İşitme kaybı iletişimi etkiliyorsa işitme cihazı değerlendirmesi öncelikli adımdır: cihazlar anlamayı kolaylaştırır ve çınlamanın arka plana karışmasına yardım edebilir; ses üreteci eklentisinin ek katkısı gösterilmemiştir.',
      en: 'If hearing loss affects communication, a hearing-aid evaluation is a priority step: aids make understanding easier and help tinnitus blend into the ground; the sound-generator add-on has not been shown to add benefit.',
    },
    body: {
      tr: `## İşitme kaybı ve çınlama neden birlikte

Çınlaması olan kişilerin büyük çoğunluğunda bir derece işitme kaybı vardır; birçoğu bunu fark etmez çünkü kayıp yüksek frekanslarda başlar ve konuşmanın yalnızca bazı ünsüzlerini (s, ş, f) etkiler. İşitme sistemi, azalan sinyali dengelemek için kazancını artırır; çınlama büyük ölçüde bu dengelenmenin ürünüdür. Dolayısıyla kaybı gidermek, çınlamayı besleyen mekanizmanın bir bölümünü hedefler.

## İşitme cihazı çınlamaya ne yapar

Üç mekanizma öne çıkar. Birincisi, dış seslerin güçlenmesi çınlamanın arka plana karışmasına yardım eder; sessizlikte tek sinyal olan ses artık yalnız değildir. İkincisi, işitme sisteminin "aç kalması" azalır ve kazanç normale yaklaşır. Üçüncüsü, konuşmayı anlamak için harcanan çaba azalır; bu çaba, gün sonundaki yorgunluğun ve gerginliğin önemli bir parçasıdır.

Kanıt durumu: Cochrane derlemesi, işitme cihazları ve ses üreteçleri için düşük kesinlikte kanıt bulur ve hiçbir cihazın diğerinden üstün olmadığını bildirir [1]. Daha yeni veriler daha olumludur: Avrupa'da beş merkezde 461 katılımcıyla yürütülen UNITI çalışmasında BDT ve işitme cihazı, tek başına uygulanan yöntemler arasında en büyük etkileri gösterdi; ses terapisi en küçüğünü [2]. Çok merkezli bir izlem çalışmasında altı haftalık cihaz kullanımıyla THI yaklaşık 12 puan düştü [2]. Kılavuzlar işitme kaybı belgelenmiş rahatsız edici çınlamada işitme cihazı değerlendirmesini önerir [3, 4].

## Kimler için

- İşitme kaybı iletişimi etkiliyorsa: kalabalıkta anlamada zorluk, televizyonu yüksek açma, sık "efendim" deme. NICE kılavuzu bu durumda amplifikasyon önerir; işitme kaybı olmadan yalnızca çınlama için cihaz önermez [4].
- Hafif kayıpta bile çınlama belirginse deneme değerlidir; birçok odyoloji merkezi birkaç haftalık deneme süresi sunar.
- Tek taraflı işitme kaybı ve şiddetli kayıplarda kemik iletimli cihazlar ya da koklear implant değerlendirmesi gündeme gelebilir; koklear implant sonrası çınlamada anlamlı azalma bildiren derlemeler vardır [3].

## Çınlama programlı cihazlar

Birçok işitme cihazı, amplifikasyona ek olarak düşük düzeyde gürültü ya da ambiyans sesi üreten bir "çınlama programı" sunar. Bu seçenek rahatlatıcı olabilir; ancak Cochrane derlemesi ve büyük bir randomize çalışma, ses üreteci bileşeninin danışmanlığa ek ölçülebilir bir katkısı olmadığını göstermiştir [1, 5]. Cihaz seçiminde ölçüt işitme ihtiyacı olmalıdır; çınlama programı bir ek özelliktir, satın alma gerekçesi değil.

## Alışma dönemi

Yeni bir işitme cihazı ilk günlerde "fazla" gelebilir: kendi sesiniz, kâğıt hışırtısı, bulaşık sesleri keskin duyulur. Bu, beynin uzun süredir duymadığı seslere yeniden alışmasıdır ve genellikle 2–4 haftada yatışır. Cihazı gün boyu takmak alışmayı hızlandırır; yalnızca "gerektiğinde" takmak süreci uzatır. Çınlama için faydanın görülmesi de haftalar alabilir; bu izlem çalışmasında etki altı haftada belirgin, on iki haftada platoya ulaşmıştır [2].

## Odyoloji randevusuna hazırlık

Tam işitme testi (saf ses odyometrisi, konuşma testleri) ve çınlama değerlendirmesi istenir. Uygulamadaki işitme taraması ve çınlama profil raporu, görüşmeye başlangıç noktası sağlar; ancak akıllı telefon taraması kalibre edilmemiş kulaklıkla 8–14 desibel sapabilir ve klinik testin yerini tutmaz [6]. Cihaz denemesinde çınlama puanlarınızı (THI) deneme öncesi ve sonrası karşılaştırmak kararı kolaylaştırır.

## Sık sorulan sorular

- **Cihaz çınlamayı artırır mı?** Nadiren; genellikle ilk günlerdeki keskinlik hissi yatışır. Artış sürerse odyolog kazanç ayarını değiştirir.
- **Tek kulakta kayıp varsa?** Tek taraflı cihaz ya da sesi diğer kulağa aktaran sistemler değerlendirilir.
- **Cihazı gece takmalı mıyım?** Hayır; gece için kısık bir arka plan sesi kullanın.`,
      en: `## Why hearing loss and tinnitus go together

The great majority of people with tinnitus have some degree of hearing loss; many do not notice it because the loss starts at high frequencies and affects only some consonants of speech (s, sh, f). The hearing system raises its gain to compensate for the reduced signal; tinnitus is largely a product of that compensation. So correcting the loss targets part of the mechanism that feeds the tinnitus.

## What a hearing aid does to tinnitus

Three mechanisms stand out. First, amplifying outside sounds lets the tinnitus blend into the ground; the sound that was the only signal in silence is no longer alone. Second, the hearing system's "starvation" is reduced and the gain moves back towards normal. Third, the effort spent understanding speech decreases; that effort is a large part of end-of-day fatigue and tension.

The evidence: the Cochrane review finds low-certainty evidence for hearing aids and sound generators and reports no device superior to another [1]. Newer data are more favourable: in the UNITI trial, run at five European centres with 461 participants, CBT and hearing aids showed the largest effects among single treatments, and sound therapy the smallest [2]. In a multicentre cohort, THI fell by about 12 points after six weeks of aid use [2]. Guidelines recommend a hearing-aid evaluation for bothersome tinnitus with documented hearing loss [3, 4].

## Who it is for

- If hearing loss affects communication: difficulty understanding in crowds, the television turned up, frequent "pardon". The NICE guideline recommends amplification in this case; it does not recommend aids for tinnitus alone without hearing loss [4].
- Even with mild loss, a trial is worthwhile if the tinnitus is prominent; many audiology centres offer a trial period of a few weeks.
- With one-sided hearing loss and severe loss, bone-conduction devices or cochlear implant assessment may come up; reviews report meaningful reductions in tinnitus after cochlear implantation [3].

## Aids with tinnitus programmes

Many hearing aids offer a "tinnitus programme" that generates low-level noise or ambient sound in addition to amplification. This option can be soothing; but the Cochrane review and a large randomised trial have shown that the sound-generator component adds nothing measurable to counselling [1, 5]. The criterion for choosing an aid should be hearing need; the tinnitus programme is an extra feature, not a reason to buy.

## The adjustment period

A new hearing aid can feel like "too much" in the first days: your own voice, rustling paper, crockery sound sharp. This is the brain re-adjusting to sounds it has not heard for a long time, and it usually settles within 2–4 weeks. Wearing the aid all day speeds the adjustment; wearing it only "when needed" prolongs it. Benefit for tinnitus can also take weeks; in the multicentre cohort the effect was clear at six weeks and plateaued by twelve [2].

## Preparing for the audiology appointment

A full hearing test (pure-tone audiometry, speech tests) and a tinnitus assessment are requested. The hearing screen and tinnitus profile report in the app give a starting point for the discussion; but a smartphone screen can deviate by 8–14 decibels with uncalibrated earphones and does not replace the clinical test [6]. During an aid trial, comparing your tinnitus scores (THI) before and after makes the decision easier.

## Frequently asked questions

- **Can the aid make tinnitus worse?** Rarely; the sharpness of the first days usually settles. If an increase persists, the audiologist adjusts the gain.
- **What if the loss is in one ear only?** A one-sided aid or systems that route sound to the other ear are considered.
- **Should I wear it at night?** No; use background sound for the night.`,
    },
    citations: ['sereda2018', 'adams2026', 'tunkel2014', 'nice2020', 'scherer2019', 'chen2021', 'schoisswohl2025'],
  },
  {
    slug: 'neuromodulation',
    title: { tr: 'Nöromodülasyon ve yeni tedaviler', en: 'Neuromodulation and emerging treatments' },
    readingMinutes: 6, group: 'sound', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Manyetik ve elektriksel beyin uyarımı, lazer ve nörofeedback için derlemeler kalıcı yarar göstermez ve kılavuzlar rutin kullanımı önermez; dil-ses bimodal uyarımı kontrollü verisi olan tek seçenektir ve cihaz gerektirir.',
      en: 'For magnetic and electrical brain stimulation, laser and neurofeedback, reviews show no lasting benefit and guidelines advise against routine use; tongue–sound bimodal stimulation is the only option with controlled data, and it requires a device.',
    },
    body: {
      tr: `## Fikir

Çınlama, işitme yollarında ve beyinde artmış, eş zamanlı sinir etkinliğiyle ilişkilidir. Nöromodülasyon bu etkinliği dışarıdan uyarımla (manyetik alan, elektrik akımı, ışık, ses ile eşleştirilmiş sinir uyarımı) değiştirmeyi amaçlar. Fikir sağlamdır; sonuçlar çoğu yöntem için hayal kırıcıdır.

## Tekrarlayıcı transkraniyal manyetik uyarım (rTMS)

Kafa derisine yerleştirilen bir bobinle işitme korteksi uyarılır; günlük seanslar, bir iki hafta. 26 randomize çalışma ve 1 576 katılımcıyı birleştiren 2026 tarihli meta-analizde rTMS'nin çınlama şiddeti üzerindeki etkisi istatistiksel anlamlılığa ulaşmadı; kısa vadeli küçük yararlar altı ayda kaybolur. Amerikan KBB Akademisi kılavuzu 2014'te ve 2026 güncellemesinde rTMS'yi çınlama için önermez [1, 2].

## Transkraniyal doğru akım (tDCS) ve rastgele gürültü uyarımı (tRNS)

Kafa derisinden zayıf akım. Aynı meta-analizde tDCS için havuzlanmış etki anlamlı değildi; tRNS için yalnızca küçük, kontrolsüz çalışmalar vardır. Kanıt çok düşük [1].

## Vagus siniri uyarımı (VNS) ve ses eşleştirme

Boyuna yerleştirilen bir implant ile vagus siniri, ses tonlarıyla eş zamanlı uyarılır. 30 kişilik pilot çalışmada kontrol grubuna göre anlamlı fark bulunmadı; şirket araştırmasını başka alanlara yöneltti. Deneysel; rutin kullanım yok [1]. Cilt üzerinden (transkutanöz) uyarım için derlemeler heterojen ve düşük kaliteli çalışmalarda küçük etkiler bildirir.

## Nörofeedback

EEG ile beyin dalgalarını görüp bunları değiştirmeyi öğrenme. Küçük çalışmalarda sıkıntı puanları düştü, gürlük başlangıca döndü; yöntemler arasında fark bulunmadı. Kanıt düşük; kontrollü çalışmalar sürüyor [1].

## Düşük düzeyli lazer / fotobiyomodülasyon

Kulak kanalına ya da kulak arkasına uygulanan kızılötesi ışık. 11 çalışma ve 670 katılımcılı derlemede plaseboya karşı THI farkı yoktu. Önerilmez [1].

## Akustik koordine sıfırlama (CR)

Çınlama frekansı etrafında özel ton dizileri. İlk çalışmalar olumluydu; 2022'de yapılan çift kör, plasebo kontrollü çalışmada birincil ya da ikincil hiçbir sonuçta fark bulunmadı. Önerilmez [1].

## Müzik terapisi (Heidelberg modeli)

Danışmanlık + sekiz seans müzik terapisi, 290 kişilik kontrollü ama randomize olmayan bir çalışmada tek başına danışmanlığa göre daha yüksek yanıt oranı gösterdi (yüzde 66'ya karşı 33). Umut verici; randomize doğrulama yok [1].

## Bimodal uyarım: dil + ses ve boyun/yüz + ses

Nöromodülasyon alanında en güçlü veriler buradadır. Dil üzerine yerleştirilen bir elektrot dizisiyle eş zamanlı ses (Lenire) 12 haftalık programlarda THI'da anlamlı azalma gösterdi; kontrollü pivotal çalışmada orta–şiddetli çınlamada bimodal uyarım, yalnızca sese göre daha fazla yanıt üretti (yüzde 59'a karşı 43) [3]. Michigan grubunun boyun/yüz uyarımı + ses yöntemi, somatik çınlaması olan 99 kişilik çift kör çaprazlama çalışmasında anlamlı düzelme sağladı; yalnızca ses etkisizdi [2]. Her iki yöntem de cihaz gerektirir, milisaniye hassasiyetinde zamanlama kullanır ve bir uygulama ile taklit edilemez; ayrıntı için "Bimodal nöromodülasyon" yazısına bakın.

## Ketamin, psikedelikler, gen tedavisi

Ketamin için tamamlanmış bir faz 2 çalışmasının sonuçları yayımlanmadı; psilosibin için yalnızca hayvan verisi ve kayıtlı pilot çalışmalar var. Gen tedavisi programları doğuştan sağırlığı hedefler, çınlamayı değil. Hepsi araştırma aşamasındadır [1].

## Kullanıcı için özet

Bugün için bir cihazın ya da uyarım yönteminin çınlamayı azalttığına dair kontrollü kanıt yalnızca bimodal uyarım için vardır; o da sınırlıdır ve cihaz gerektirir. Kılavuzların en net biçimde önerdiği yaklaşım bilişsel davranışçı terapidir [2, 4]. Yeni bir cihaz ya da yöntem için pratik soru şudur: bağımsız, sahte uyarım kontrollü randomize çalışma var mı?`,
      en: `## The idea

Tinnitus is linked with increased, synchronised nerve activity in the hearing pathways and the brain. Neuromodulation aims to change that activity with stimulation from outside (magnetic fields, electric current, light, nerve stimulation paired with sound). The idea is sound; the results are disappointing for most methods.

## Repetitive transcranial magnetic stimulation (rTMS)

A coil on the scalp stimulates the auditory cortex; daily sessions for one or two weeks. In a 2026 meta-analysis pooling 26 randomised trials and 1,576 participants, the effect of rTMS on tinnitus severity did not reach statistical significance; small short-term benefits vanish by six months. The American Academy of Otolaryngology guideline advised against rTMS for tinnitus in 2014 and again in its 2026 update [1, 2].

## Transcranial direct current (tDCS) and random noise stimulation (tRNS)

Weak current through the scalp. In the same meta-analysis the pooled effect for tDCS was not significant; for tRNS there are only small, uncontrolled studies. Very low evidence [1].

## Vagus nerve stimulation (VNS) paired with sound

An implant in the neck stimulates the vagus nerve in time with tones. In a 30-person pilot no significant difference from the control group was found; the company redirected its research. Experimental; no routine use [1]. For stimulation through the skin (transcutaneous), reviews report small effects in heterogeneous, low-quality studies.

## Neurofeedback

Seeing brain waves on EEG and learning to change them. In small studies distress scores fell while loudness returned to baseline; no difference between protocols. Low evidence; controlled trials are ongoing [1].

## Low-level laser / photobiomodulation

Infrared light applied to the ear canal or behind the ear. In a review of 11 studies with 670 participants there was no THI difference against placebo. Not recommended [1].

## Acoustic coordinated reset (CR)

Special tone sequences around the tinnitus frequency. Early studies were positive; in a 2022 double-blind, placebo-controlled trial no difference was found on any primary or secondary outcome. Not recommended [1].

## Music therapy (Heidelberg model)

Counselling plus eight sessions of music therapy showed a higher response rate than counselling alone in a 290-person controlled but non-randomised study (66 versus 33 per cent). Promising; no randomised confirmation [1].

## Bimodal stimulation: tongue + sound and neck/face + sound

The strongest data in neuromodulation lie here. An electrode array on the tongue with time-locked sound (Lenire) showed meaningful THI reductions in 12-week programmes; in the controlled pivotal trial, bimodal stimulation produced more responders than sound alone in moderate-to-severe tinnitus (59 versus 43 per cent) [3]. The Michigan group's neck/face stimulation plus sound produced meaningful improvement in a 99-person double-blind crossover trial in somatic tinnitus; sound alone had no effect [2]. Both methods need a device, use millisecond-precise timing and cannot be imitated by an app; see the "Bimodal neuromodulation" article for details.

## Ketamine, psychedelics, gene therapy

Results of a completed phase 2 ketamine trial have not been published; for psilocybin there are only animal data and registered pilot studies. Gene therapy programmes target congenital deafness, not tinnitus. All are at the research stage [1].

## Summary for the user

Today, controlled evidence that a device or stimulation method reduces tinnitus exists only for bimodal stimulation, and it is limited and requires a device. The approach guidelines recommend most clearly is cognitive behavioural therapy [2, 4]. The practical question for any new device or method is: is there an independent, sham-controlled randomised trial?`,
    },
    citations: ['tunkel2014', 'adams2026', 'conlon2020', 'fuller2020', 'kitsis2026', 'jones2023', 'boedts2024'],
  },
  {
    slug: 'sleep',
    title: { tr: 'Çınlama ve uyku', en: 'Tinnitus and sleep' },
    readingMinutes: 6, group: 'sleep', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Uykusuzluk çınlaması olan kişilerin yarısına yakınını etkiler ve ses varken de düzeltilebilir: uykusuzluk terapisi bir çalışmada ses ve eğitime dayalı bakımdan daha etkiliydi; gece için kısık arka plan sesi ve sabit kalkış saati temel adımlardır.',
      en: 'Insomnia affects nearly half of people with tinnitus and can be corrected while the sound is there: CBT for insomnia was more effective than sound- and education-based care in a randomised trial; low background sound at night and a fixed rise time are the basic steps.',
    },
    body: {
      tr: `## Ne kadar yaygın

Çınlaması olan kişilerde uykusuzluk sıklığı çalışmalar arasında yüzde 10 ile 80 arasında değişir; çoğu çalışma yüzde 40'ın üzerini, klinik örneklemler yaklaşık yüzde 70'i bildirir [1]. Uyku sorunu çınlamanın en sık ikinci yakınmasıdır ve çınlamanın rahatsızlık düzeyini en güçlü biçimde öngören etkenlerden biridir.

## Döngü

Yatak odası günün en sessiz yeridir; çınlama burada en belirgindir. Uykuya dalamamak kaygı doğurur, kaygı uyanıklığı artırır, uyanıklık sesi daha çok fark ettirir. Birkaç kötü geceden sonra yatak "sesle baş başa kalınan yer" olarak öğrenilir; yatağa girmek bile uyanıklığı tetikler. Ertesi gün yorgunluk sesi daha gürültülü ve daha rahatsız edici hissettirir; döngü kapanır.

Uyku üç sistemle düzenlenir: uyanık geçen saatlerle biriken uyku baskısı, sabah ışığı ve sabit kalkış saatiyle ayarlanan biyolojik saat ve uyarılma düzeyi. Çınlama üçüncüsünü besler. Uykusuzluk için bilişsel davranışçı terapi (kısaca uykusuzluk terapisi) üçünü birlikte hedefler.

## Kanıt

Marks ve arkadaşlarının 2023 tarihli randomize çalışmasında çınlamaya bağlı uykusuzluğu olan 102 kişi üç gruba ayrıldı: uykusuzluk terapisi (altı haftalık grup programı), odyoloji temelli bakım (çınlama eğitimi, rahatlatan arka plan sesi, uyku hijyeni) ve uyku destek grubu. uykusuzluk terapisi, uyku şiddeti ve uyku verimliliğinde odyoloji temelli bakımdan üstündü; etki altı ayda sürdü; çınlama sıkıntısı, psikolojik sıkıntı ve yaşam kalitesi de düzeldi. Katılımcıların yüzde 94'ü programı tamamladı ve yüzde 80'i uykusuzluğunun düzeldiğini bildirdi [1]. Önemli sonuç: uyku, ses varken de düzelir ve uykunun düzelmesi çınlama sıkıntısını azaltır.

## Program bileşenleri

- **Uyku günlüğü:** yatış, uykuya dalma süresi, uyanmalar, kalkış. Program kararları bu veriye dayanır.
- **Uyku hijyeni:** öğleden sonra kafein yok, gündüz uykusu yok, sabah ışık, akşam loş ekran.
- **Uyaran kontrolü:** yatak yalnızca uyku için; 15–20 dakikada uyuyamayınca kalkmak; her gün aynı saatte kalkmak. Uykusuzlukta en iyi incelenmiş davranış yöntemlerinden biri.
- **Uyku sıkıştırma:** yatakta geçen süreyi ortalama uyku süresi + 30 dakikaya indirmek (en az 5,5 saat), verimlilik yüzde 85'e ulaştıkça 15 dakika genişletmek. Epilepsi, bipolar bozukluk, parasomni ya da güvenlik açısından kritik işte yalnızca uzmanla.
- **Bilişsel çalışma:** "bu sesle asla uyuyamam", "sekiz saat şart" gibi inançlarla gündüz çalışmak.
- **Gevşeme ve endişe zamanı:** yatış öncesi 60–90 dakikalık iniş pisti; endişelere gündüz belirli bir zaman.

## Gece için ses

Sessiz yatak odasında kısık bir arka plan sesi (pembe/kahverengi gürültü, yağmur, vantilatör) çınlamanın arka plana karışmasına yardım eder. Küçük çalışmalarda yatak başı ses kullanımı uyku kalitesini artırmıştır; doğa ve su sesleri en çok tercih edilenlerdir, ancak hangi sesin daha iyi olduğunu gösteren karşılaştırmalı çalışma yoktur [2]. Pratik kurallar: ses çınlamayı örtmesin, sürekli olsun ve aniden kesilmesin; uyku zamanlayıcısı en az 90 dakika ya da bütün gece; oda hoparlörü ya da yastık hoparlörü kulaklığa tercih edilir; kulak tıkacı kullanılmaz. Ses, uykusuzluk terapisinin yerini almaz; onunla birlikte kullanılır [2, 3].

## İlaçlar

Uyku ilaçları kısa vadede uykuya dalmayı kolaylaştırabilir, ancak uykusuzluğun öğrenilmiş bileşenini değiştirmez ve bağımlılık riski taşır; kılavuzlar çınlama için benzodiazepin ya da antidepresan önermez [3]. Melatonin küçük ve düşük kaliteli çalışmalarda uykuyu bir miktar düzeltmiştir; bir hekimle konuşulabilir. Uyku apnesi belirtileri (yüksek horlama, tanıklı nefes durması, sabah baş ağrısı) varsa uyku uzmanı değerlendirmesi öncelik kazanır.`,
      en: `## How common

The prevalence of insomnia in people with tinnitus ranges from 10 to 80 per cent across studies; most report over 40 per cent and clinic samples about 70 per cent [1]. Sleep trouble is the second most common complaint in tinnitus and one of the strongest predictors of how bothersome it is.

## The loop

The bedroom is the quietest place of the day; tinnitus is most prominent there. Not falling asleep breeds anxiety, anxiety increases wakefulness, wakefulness makes the sound more noticeable. After a few bad nights the bed is learned as "the place of being alone with the sound"; even getting into bed triggers wakefulness. The next day, fatigue makes the sound feel louder and more unpleasant; the loop closes.

Sleep is regulated by three systems: sleep pressure that builds with hours awake, the body clock set by morning light and a fixed rise time, and the level of arousal. Tinnitus feeds the third. Cognitive behavioural therapy for insomnia (CBT-I) targets all three together.

## The evidence

In the 2023 randomised trial by Marks and colleagues, 102 people with tinnitus-related insomnia were split into three groups: CBT-I (a six-week group programme), audiology-based care (tinnitus education, sound enrichment, sleep hygiene) and a sleep support group. CBT-I was superior to audiology-based care on insomnia severity and sleep efficiency; the effect held at six months; tinnitus distress, psychological distress and quality of life also improved. 94 per cent of participants completed the programme and 80 per cent reported their insomnia had improved [1]. The key result: sleep improves while the sound is there, and improved sleep reduces tinnitus distress.

## Programme components

- **Sleep diary:** bedtime, time to fall asleep, wakings, rise time. Programme decisions rest on this data.
- **Sleep hygiene:** no caffeine after midday, no naps, morning light, dim screens in the evening.
- **Stimulus control:** the bed only for sleep; getting up when sleep does not come within 15–20 minutes; the same rise time every day. One of the best-studied behavioural methods for insomnia.
- **Sleep compression:** reducing time in bed to average sleep time + 30 minutes (minimum 5.5 hours), widening by 15 minutes as efficiency reaches 85 per cent. With epilepsy, bipolar disorder, parasomnia or a safety-critical job, only with a specialist.
- **Cognitive work:** working in the daytime with beliefs such as "I can never sleep with this sound", "eight hours are essential".
- **Relaxation and worry time:** a 60–90 minute landing strip before bed; a set time in the day for worries.

## Sound for the night

In a quiet bedroom, low-level background sound (pink/brown noise, rain, a fan) lets the tinnitus blend into the ground. In small studies bedside sound improved sleep quality; nature and water sounds are the most preferred, but no comparative trial shows which sound is better [2]. Practical rules: the sound should not cover the tinnitus, should be continuous and should not cut off suddenly; a sleep timer of at least 90 minutes or all night; a room or pillow speaker is preferred to earphones; no earplugs. Sound does not replace CBT-I; it is used alongside it [2, 3].

## Medicines

Sleeping pills can make falling asleep easier in the short term, but do not change the learned component of insomnia and carry a dependence risk; guidelines do not recommend benzodiazepines or antidepressants for tinnitus [3]. Melatonin somewhat improved sleep in small, low-quality studies; it can be discussed with a doctor. If there are signs of sleep apnoea (loud snoring, witnessed pauses in breathing, morning headache), assessment by a sleep specialist takes priority.`,
    },
    citations: ['marks2023', 'sereda2018', 'tunkel2014'],
  },
  {
    slug: 'hyperacusis',
    title: { tr: 'Ses hassasiyeti (hiperakuzi)', en: 'Sound sensitivity (hyperacusis)' },
    readingMinutes: 6, group: 'sound', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Ses hassasiyeti, sessizlik ve kaçınmayla yükselen bir işitme kazancı sorunudur; kademeli, kısık ses ve BDT toleransı artırabilir, gündelik ortamlarda kulak tıkacı ise sorunu sürdürür. Belirli seslere öfke (misofoni) ayrı bir durumdur.',
      en: 'Hyperacusis is a hearing-gain problem that rises with silence and avoidance; graded low-level sound and CBT raise tolerance, while earplugs in everyday settings maintain it. Anger at specific sounds (misophonia) is a separate condition.',
    },
    body: {
      tr: `## Tanım

Ses hassasiyeti (hiperakuzi), çoğu insanın rahat bulduğu gündelik seslerin rahatsız edici, çok yüksek ya da ağrılı algılanmasıdır: tabak sesleri, trafik, çocuk sesleri, bir kapının çarpması. Çınlaması olan kişilerin önemli bir bölümünde görülür ve çınlamayla aynı mekanizmayı paylaşır: işitme sisteminin kazancı yükselmiştir. Rahatsızlık düzeyi Hiperakuzi Anketi (Khalfa) ile ölçülür; 14 madde, 0–42 puan; çınlama örneklemlerinde yaklaşık 16 puan ve üzeri hassasiyete, 28 ve üzeri belirgin hassasiyete işaret eder [1].

## Mekanizma

İşitme sistemi gelen sesin düzeyine göre kendi kazancını ayarlar. Uzun süre sessizlikte kalındığında ya da kulak tıkacıyla sesler azaltıldığında sistem zayıf sesleri duyabilmek için kazancı artırır. Normal düzeyde bir ses geldiğinde bu yüksek kazançla işlenir ve çok yüksek algılanır. Sağlıklı işiten gönüllülerde iki haftalık kulak tıkacı kullanımı bile ses toleransını ölçülebilir biçimde düşürmüştür [2]. Üstüne bir psikolojik katman biner: rahatsız edici bir deneyimden sonra benzer sesler tehdit olarak işaretlenir, beden gerilir, kaçınma başlar ve kaçınma kazancı daha da yükseltir.

## Ses hassasiyeti ile misofoni farkı

Ses hassasiyetinde sorun sesin yüksekliğidir ve birçok ses türü rahatsız eder. Misofonide ise belirli sesler (çiğneme, nefes, klavye, tıkırtı) düşük düzeyde bile öfke, iğrenme ya da panik doğurur; ses düzeyi değil, sesin kaynağı ve anlamı belirleyicidir. Uzlaşı tanımına göre misofoni ayrı bir durumdur; ses programı misofoni için önerilmez, psikolojik yaklaşımlar ve uzman değerlendirmesi önerilir. Rahatsızlığınız belirli seslere ve kişilere bağlıysa ses hassasiyeti programı yerine bir uzmanla görüşün.

## Ne işe yarar

İki yaklaşım randomize çalışmalarda sınanmıştır:

- **Kademeli ses:** Düşük düzeyde pembe gürültünün her gün dinlenmesi ve düzeyin haftalar içinde yavaşça artırılması. Formby ve arkadaşlarının randomize, plasebo kontrollü çalışmasında danışmanlık ile birlikte gerçek ses üreteçleri, rahatsızlık eşiğini yaklaşık 10 desibel yükseltti [2]. Protokol: açıkça rahat bir düzeyden başlamak, her hafta 2–3 desibel artırmak, günde iki kez 30–60 dakikadan günün büyük kısmına yaymak, 8–12 hafta sürdürmek.
- **Bilişsel davranışçı terapi:** Jüris ve arkadaşlarının 60 kişilik randomize çalışmasında ses hassasiyeti için BDT, ses toleransı ve ses hassasiyeti anketlerinde orta–büyük etki gösterdi; etki 12 ayda korundu [3]. Bileşenler: ses korkusunun mekanizmasını anlamak, güvenlik davranışlarını (tıkaç, kaçınma) bırakmak, kaçınılan durumları hafiften zora sıralayıp kademeli olarak yeniden girmek.

Bu uygulamadaki ses hassasiyeti programı iki yaklaşımı birleştirir: günlük pembe gürültü seansı ve iki haftada bir BDT modülü (eğitim, hiyerarşi, kulak tıkacı planı).

## Kulak tıkaçları

Gündelik ortamlarda (lokanta, çarşı, ofis, otobüs, ev) tıkaç kullanmak, ses hassasiyetini sürdüren en önemli davranışlardan biridir; programlar bunun bırakılmasını ister [2, 3]. Tıkaç, gerçekten yüksek ortamlar (85 desibel üstü: konser, inşaat, motosiklet) için saklanır; orada koruma işitme sağlığıdır. Gece tıkaçla uyumak da tam sessizlik yaratır ve kazancı en yüksek düzeye çıkarır; gece için düşük arka plan sesi önerilir.

## Ne zaman uzmana

Altı haftalık kademeli programda tolere edilen ses düzeyinde ilerleme yoksa, seslerle birlikte kulakta ağrı varsa (ağrılı ses hassasiyeti ayrı bir türdür), tek taraflı belirtiler ya da yüz felci gibi eşlik eden bulgular varsa odyoloji ve kulak burun boğaz değerlendirmesi gerekir. Sese karşı kaygı günlük yaşamı belirgin biçimde kısıtlıyorsa BDT'nin bir psikologla yürütülmesi daha uygundur [3].`,
      en: `## Definition

Hyperacusis is when everyday sounds most people find comfortable are perceived as unpleasant, far too loud or painful: crockery, traffic, children's voices, a door slamming. It affects a sizeable share of people with tinnitus and shares the same mechanism: the gain of the hearing system is raised. The level of distress is measured with the Hyperacusis Questionnaire (Khalfa); 14 items, 0–42 points; in tinnitus samples about 16 and above indicates sensitivity and 28 and above marked sensitivity [1].

## Mechanism

The hearing system sets its own gain according to the level of incoming sound. After long periods in silence, or when sounds are reduced with earplugs, the system raises the gain to hear faint sounds. When a sound at normal level arrives, it is processed at this high gain and perceived as far too loud. Even two weeks of earplug use in volunteers with normal hearing measurably reduced sound tolerance [2]. A psychological layer sits on top: after an unpleasant experience, similar sounds are tagged as threats, the body tenses, avoidance begins and avoidance raises the gain further.

## Hyperacusis versus misophonia

In hyperacusis the problem is the loudness of sound and many kinds of sound are unpleasant. In misophonia, specific sounds (chewing, breathing, keyboards, clicking) trigger anger, disgust or panic even at low level; what matters is not the sound level but its source and meaning. By consensus definition misophonia is a separate condition; the sound programme is not recommended for it, psychological approaches and specialist assessment are. If your distress is tied to specific sounds and people, talk to a specialist instead of following the hyperacusis programme.

## What works

Two approaches have been tested in randomised trials:

- **Graded sound:** Listening to low-level pink noise every day and raising the level slowly over weeks. In the randomised, placebo-controlled trial by Formby and colleagues, real sound generators combined with counselling raised the discomfort threshold by about 10 decibels [2]. The protocol: start at a clearly comfortable level, increase 2–3 decibels a week, build from 30–60 minutes twice a day to most of the day, continue for 8–12 weeks.
- **Cognitive behavioural therapy:** In the 60-person randomised trial by Jüris and colleagues, CBT for hyperacusis showed moderate-to-large effects on sound tolerance and hyperacusis questionnaires, maintained at 12 months [3]. Components: understanding the mechanism of fear of sound, dropping safety behaviours (plugs, avoidance), ranking avoided situations from mild to hard and re-entering them gradually.

The sound sensitivity programme in this app combines both: a daily pink-noise session and a CBT module every two weeks (education, hierarchy, earplug plan).

## Earplugs

Using plugs in everyday settings (restaurant, market, office, bus, home) is one of the most important behaviours maintaining hyperacusis; programmes ask for it to be dropped [2, 3]. Plugs are kept for genuinely loud settings (over 85 decibels: concerts, building sites, motorcycles); there, protection is hearing health. Sleeping with plugs also creates complete silence and pushes the gain to its highest; low background sound is recommended for the night.

## When to see a specialist

If there is no progress in the tolerated level after six weeks of the graded programme, if there is ear pain with sounds (pain hyperacusis is a separate subtype), or if there are one-sided symptoms or accompanying findings such as facial palsy, audiology and ENT assessment is needed. If anxiety about sound markedly restricts daily life, CBT with a psychologist is more appropriate [3].`,
    },
    citations: ['khalfa2002', 'formby2015', 'juris2014', 'swedo2022'],
  },
  {
    slug: 'somatosensory',
    title: { tr: 'Boyun, çene ve çınlama', en: 'Neck, jaw and tinnitus' },
    readingMinutes: 6, group: 'basics', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Çınlama çene ya da boyun hareketiyle değişiyor ve bu bölgelerde ağrı veya gerginlik varsa, çınlamayı boyun ve çene etkiliyor olabilir. Küçük çalışmalarda altı–dokuz haftalık boyun veya çene fizyoterapisi çınlamayı azaltmıştır.',
      en: 'If tinnitus changes with jaw or neck movement and there is pain or tension in these areas, the neck and jaw may be influencing it. In small randomised trials, six to nine weeks of neck or jaw physiotherapy reduced tinnitus severity.',
    },
    body: {
      tr: `## Beyinde kesişen yollar

İşitme beyin sapındaki ilk işlem merkezi (koklear çekirdek), yalnızca kulaktan değil, boyun kaslarından, çene ekleminden ve yüzden gelen duyusal sinyalleri de alır. Bu bağlantı normalde kendi sesimizi (çiğneme, konuşma) dış seslerden ayırmaya yarar. İşitme girdisi azaldığında (işitme kaybı) ya da boyun/çeneden gelen sinyal arttığında (gerginlik, ağrı, travma) bu kesişim işitme yolunda çınlamayı doğuran ya da değiştiren etkinliğe katkıda bulunabilir.

Bu nedenle bazı kişilerde dişleri sıkmak, çeneyi öne itmek, başı çevirmek ya da boyun kaslarına basmak çınlamanın gürlüğünü ya da perdesini geçici olarak değiştirir. Buna somatik modülasyon denir ve çınlaması olan kişilerin önemli bir bölümünde görülür. Bu değişim tek başına tanı için yeterli değildir; çınlaması olmayan kişilerde de benzer etkiler görülebilir.

## Boyun-çene kaynaklı çınlamanın ölçütleri

Uzmanların uzlaştığı bir çalışmada boyun ve çeneden etkilenen (somatosensoriyel) çınlama için şu ölçütler belirlenmiştir [1]:

- Çınlamanın çene ya da boyun hareketleri, belirli duruşlar ya da bu bölgelere basınçla değişmesi.
- Başlangıcın ya da dalgalanmaların boyun/çene ağrısı, travma (ör. boyun burkulması), diş tedavisi ya da duruş sorunlarıyla zamansal ilişkisi.
- Çınlama ile boyun/çene yakınmalarının birlikte artıp azalması.
- Tek taraflı çınlamanın ağrılı tarafla aynı tarafta olması.
- Bu bölgelerde artmış kas gerginliği ya da tetik noktalar.

Dört soruluk bir tarama aracı (RASST) bu ölçütleri pratik bir forma dönüştürür; duyarlılığı yüzde 82, özgüllüğü yüzde 79'dur [2]. Uygulamadaki somatik modülasyon testi aynı mantıkla hareketleri rehberli olarak uygular. Amerikan KBB Akademisi'nin 2026 güncellemesi bu çınlama türünü ayrı bir başlık olarak ele alır [3].

## Boyun kaynaklı çınlama: kanıt

Michiels ve arkadaşlarının randomize çalışmasında boyun kaynaklı çınlaması olan 38 kişi, altı haftada en fazla 12 seans fizyoterapi (eklem hareketleri, hassas noktalara basınç, derin boyun kası eğitimi, ev egzersizleri) aldı. Çınlama anketi (TFI) puanları ve boyun yakınmaları azaldı; yüzde 53'ü belirgin çınlama düzelmesi bildirdi, yüzde 24'ünde düzelme altı hafta sonra da sürüyordu [4]. Yanıt verme olasılığı, çınlama ile boyun yakınmalarının birlikte değiştiği, sesin düşük perdeli olduğu ve kötü boyun duruşuyla arttığı kişilerde daha yüksekti.

## Çene kaynaklı çınlama: kanıt

Çene eklemi sorunuyla ilişkili çınlaması olan 80 kişilik randomize çalışmada dokuz hafta boyunca en fazla 18 seans çene ve yüz fizyoterapisi, eğitim ve diş sıkma varsa gece plağı uygulandı. Erken başlayan grupta çınlama şiddeti daha fazla azaldı; yüzde 61'i şiddette, yüzde 46'sı rahatsızlıkta klinik olarak anlamlı düzelme bildirdi [5]. Beş randomize çalışmayı birleştiren 2025 tarihli bir analizde en etkili yaklaşım, farklı uzmanların birlikte yürüttüğü ameliyatsız çene tedavisiydi.

## Uygulamadaki egzersizler

Programın boyun ve çene egzersizleri bu çalışmalardan uyarlanmıştır: çene içeri çekme, derin boyun kaslarını çalıştırma, boyun hareketleri, kürek kemiklerini toplama, hassas noktalara basınç ve germe; çene için dinlenme duruşu, çiğneme kası masajı, kontrollü ağız açma ve diş sıkmayla baş etme. Bunlar destekleyici hareketlerdir; fizyoterapist ya da diş hekimi değerlendirmesinin yerine geçmez. Egzersiz sırasında ağrı ya da baş dönmesi olursa durun. Altı haftada değişim yoksa, ağrı artıyorsa ya da uyuşma, güçsüzlük gibi belirtiler varsa uzmana başvurun [4, 5].

## Bimodal cihazlar

Boyun-çene kaynaklı çınlaması olan kişiler için boyun/yüz elektriksel uyarımını sesle milisaniye hassasiyetinde eşleştiren bir cihaz, 99 kişilik çift kör çaprazlama çalışmada çınlama puanlarını ve gürlüğü azalttı; yalnızca ses etkisizdi. Cihaz henüz yaygın kullanımda değildir ve kendi kendine yapılan hareketlerle sesi eşleştirmenin benzer etki yarattığına dair kanıt yoktur [3].`,
      en: `## Pathways that cross in the brain

The first processing centre for hearing in the brainstem (the cochlear nucleus) receives sensory signals not only from the ear but also from the neck muscles, the jaw joint and the face. Normally this connection helps separate our own sounds (chewing, speaking) from outside sounds. When hearing input falls (hearing loss) or the signal from the neck/jaw rises (tension, pain, trauma), this crossing can contribute to the activity in the hearing pathway that produces or changes tinnitus.

That is why, in some people, clenching the teeth, pushing the jaw forward, turning the head or pressing on the neck muscles temporarily changes the loudness or pitch of the tinnitus. This is called somatic modulation and is seen in a sizeable share of people with tinnitus. Modulation alone is not enough for the diagnosis; similar effects can occur in people without tinnitus too.

## Criteria for somatosensory tinnitus

An expert consensus (Delphi) study set these criteria for somatosensory tinnitus [1]:

- Tinnitus changing with jaw or neck movements, certain postures or pressure on these areas.
- A temporal link between onset or fluctuations and neck/jaw pain, trauma (e.g. whiplash), dental treatment or posture problems.
- Tinnitus and neck/jaw complaints increasing and decreasing together.
- One-sided tinnitus on the same side as the pain.
- Increased muscle tension or trigger points in these areas.

A four-question screening tool (RASST) turns these criteria into a practical form; sensitivity 82 per cent, specificity 79 per cent [2]. The somatic modulation test in the app applies the manoeuvres in a guided way by the same logic. The 2026 update of the American Academy of Otolaryngology guideline addresses somatosensory tinnitus as a separate topic [3].

## Cervicogenic tinnitus: the evidence

In the randomised trial by Michiels and colleagues, 38 people with cervicogenic somatic tinnitus received up to 12 sessions of multimodal physiotherapy over six weeks (mobilisation, trigger-point therapy, deep neck flexor training, home exercises). The Tinnitus Functional Index and neck complaints fell; 53 per cent reported substantial tinnitus improvement and in 24 per cent the improvement persisted six weeks later [4]. Response was more likely in people whose tinnitus and neck complaints changed together, whose sound was low-pitched and increased with poor neck posture.

## Jaw-related tinnitus: the evidence

In an 80-person randomised trial of tinnitus related to temporomandibular disorder (TMD), up to 18 sessions of orofacial physiotherapy, education and a night splint where bruxism was present were given over nine weeks. The early-start group showed a larger reduction in tinnitus severity; 61 per cent reported clinically relevant improvement in severity and 46 per cent in annoyance [5]. A 2025 meta-analysis pooling five randomised trials found multidisciplinary non-invasive orofacial treatment the most effective approach.

## The exercises in the app

The neck and jaw exercises in the programme are adapted from these protocols: chin tucks, craniocervical flexion, range of motion, scapular stabilisation, trigger-point release and stretching; for the jaw, the rest position, masticatory muscle massage, controlled mouth opening and bruxism management. They are self-management exercises and do not replace assessment by a physiotherapist or dentist. Stop if an exercise causes pain or dizziness. If there is no change after six weeks, if pain increases, or if there are signs such as numbness or weakness, see a specialist [4, 5].

## Bimodal devices

For people with somatic tinnitus, a device pairing electrical stimulation of the neck/face with sound at millisecond precision reduced tinnitus scores and loudness in a 99-person double-blind crossover trial; sound alone had no effect. The device is not yet in general use and there is no evidence that pairing sound with self-performed manoeuvres produces a similar effect [3].`,
    },
    citations: ['michiels2018', 'michiels2022', 'adams2026', 'michiels2016', 'vanderwal2020', 'jones2023'],
  },
  {
    slug: 'acute-tinnitus',
    title: { tr: 'Yeni başlayan çınlama: ilk üç ay', en: 'New tinnitus: the first three months' },
    readingMinutes: 6, group: 'doctor', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Yeni çınlamada ilk adım işitme kaybını dışlamaktır: ani işitme kaybı iki hafta içinde steroid gerektirebilir. Sonrasında kulağı korumak, sessizlikten kaçınmak ve erken sıkıntıyı ele almak yapılabilecek en iyi şeylerdir; kronikleşmeyi önlediği kanıtlanmış bir yöntem yoktur.',
      en: 'In new tinnitus the first step is to rule out hearing loss: sudden hearing loss may need steroids within two weeks. After that, protecting the ear, avoiding silence and addressing early distress are the best things to do; no method has been proven to prevent chronicity.',
    },
    body: {
      tr: `## Tanım

Avrupa kılavuzu üç aydan kısa süren çınlamayı akut (yeni), üç–altı ayı ara dönem, altı ay ve üzerini kronik (uzun süreli) olarak sınıflar [1]. İlk üç ay, hem sesin kendiliğinden azalma olasılığının en yüksek olduğu hem de altta yatan bazı nedenlerin zaman kritik tedavi gerektirdiği dönemdir.

## Önce: işitme kaybı var mı

Yeni çınlamayla birlikte bir kulakta ani işitme düşüşü, dolgunluk ya da "tıkanıklık" hissi ani işitme kaybına işaret edebilir. Tanım: 72 saat içinde gelişen, en az üç komşu frekansta 30 desibel ve üzeri kayıp. Kılavuz, mümkün olan en kısa sürede (en geç 14 gün içinde) işitme testi önerir. Kortizon (steroid) tedavisi ilk iki hafta içinde değerlendirilir; düzelme eksikse 2–6. haftada kulak içine steroid seçeneği vardır [2]. Bu pencere kaçırıldığında tedavi seçenekleri daralır. Bu nedenle: yeni çınlama + işitmede düşüş = 24 saat içinde kulak burun boğaz.

Ani işitme kaybıyla başlayan çınlama, işitme düzeldikçe çoğu zaman azalır: üç ayda yaklaşık yüzde 44'ünde tamamen kaybolur; hafif kayıpta bu oran yüzde 65, ağır kayıpta yüzde 23'tür.

## Diğer uyarı işaretleri

Nabızla atan ses, baş dönmesi, yüz felci, şiddetli baş ağrısı, kafa travması, kulak akıntısı ya da ağrı: bunlar da erken değerlendirme gerektirir; ayrıntı için "Ne zaman doktora gitmeli" yazısına bakın [3].

## İşitme kaybı olmayan yeni çınlama

Çoğu yeni çınlama bir gürültü maruziyeti, üst solunum yolu enfeksiyonu, stresli bir dönem ya da belirgin bir neden olmadan başlar ve işitme normaldir. Bu durumda steroid tedavisinin yararına dair kanıt yoktur; Alman S3 kılavuzu bu durumda ani işitme kaybı kılavuzuna yönlendirir ve işitme kaybı yoksa steroid önermez. Akut çınlama için geliştirilen kulak içi ilaçlar (AM-101) faz 3 çalışmalarında başarısız olmuştur [4].

Seyir: bir izlem çalışmasında altı ay içinde ses yüzde 11 kişide tamamen kayboldu; ancak çok daha büyük bir bölümünde ses arka plana çekildi ve rahatsızlık azaldı. Erken dönemdeki ruhsal sıkıntı, sonraki aylardaki zorlanmayı en iyi öngören etkenlerden biridir; sesin kendisinden daha belirleyici olabilir [1, 4].

## İlk haftalarda ne yapmalı

- **Kulağı koruyun.** Yüksek gürültüden (konser, elektrikli aletler) birkaç hafta uzak durun; gerekli yerlerde koruma kullanın. İşitmeye zarar verebilecek ilaçları hekiminizle gözden geçirin.
- **Sessizlikten kaçının.** Tam sessizlik sesi öne çıkarır ve beynin ona önem vermesine yol açar. Sessiz ortamlarda ve gece düşük düzeyde arka plan sesi kullanın; kulak tıkacı takmayın.
- **Araştırmayı sınırlayın.** Forumlardaki en kötü hikâyeler, erken dönem kaygısını besler ve kaygı sesin önemini artırır.
- **Uykuyu koruyun.** Sabit kalkış saati, yatak odasında ses, uyuyamayınca kalkmak. İlk haftalardaki uykusuzluk döngüsünü kırmak sonraki aylar için belirleyicidir.
- **Hafif BDT.** Mekanizmayı anlamak (çınlama ve beyin), gevşeme ve rahatlatan arka plan sesi modülleri ilk aylarda da uygulanabilir. Bunun kronikleşmeyi önlediğine dair randomize kanıt yoktur; ancak erken sıkıntıyı azaltmanın sonraki engelliliği azaltmasını beklemek makuldür [4].

## Dört ve on iki hafta

Uygulama, yeni çınlamada dördüncü ve on ikinci haftada yeniden değerlendirme planlar: işitme taraması, uyarı işaretleri ve THI. On ikinci haftada ses hâlâ varsa ve rahatsız ediyorsa, kronik çınlama programına geçilir. Bu, "artık geçmeyecek" anlamına gelmez; algıya alışma ayları bulur ve çoğu kişide ses yıllar içinde arka plana çekilir [1].`,
      en: `## Definition

The European guideline classifies tinnitus lasting less than three months as acute, three to six months as sub-acute, and six months or more as chronic [1]. The first three months are the period in which the sound is most likely to fade on its own, and also the period in which some underlying causes need time-critical treatment.

## First: is there hearing loss

New tinnitus with a sudden drop in hearing, fullness or a "blocked" feeling in one ear may point to sudden sensorineural hearing loss (SSNHL). Definition: a loss of 30 decibels or more at three or more consecutive frequencies developing within 72 hours. The guideline recommends audiometry as soon as possible (within 14 days at the latest). Corticosteroid treatment is considered within the first two weeks; if recovery is incomplete, steroids into the ear are an option at 2–6 weeks [2]. Once this window is missed, treatment options narrow. Hence: new tinnitus + a drop in hearing = ENT within 24 hours.

Tinnitus that starts with SSNHL usually lessens as hearing recovers: about 44 per cent resolve completely within three months; the rate is 65 per cent with mild loss and 23 per cent with severe loss.

## Other warning signs

Pulsing sound, vertigo, facial palsy, severe headache, head trauma, ear discharge or pain: these also need early assessment; see the "When to see a doctor" article [3].

## New tinnitus without hearing loss

Most new tinnitus starts after noise exposure, an upper respiratory infection, a stressful period or with no obvious cause, with normal hearing. There is no evidence of benefit from steroids in this case; the German S3 guideline defers to the sudden hearing loss guideline and does not recommend steroids without hearing loss. Intratympanic drugs developed for acute tinnitus (AM-101) failed in phase 3 trials [4].

The course: in one cohort, complete remission within six months was seen in 11 per cent; but in a much larger share the sound receded into the background and the distress fell. Psychological distress in the early period is one of the strongest predictors of disability in the chronic period and may matter more than the sound itself [1, 4].

## What to do in the first weeks

- **Protect the ear.** Stay away from loud noise (concerts, power tools) for a few weeks; use protection where needed. Review possibly ototoxic medicines with your doctor.
- **Avoid silence.** Complete silence brings the sound forward and leads the brain to give it importance. Use low-level background sound in quiet settings and at night; do not wear earplugs.
- **Limit researching.** The worst stories on forums feed early anxiety, and anxiety increases the importance of the sound.
- **Protect sleep.** A fixed rise time, sound in the bedroom, getting up when sleep does not come. Breaking the insomnia loop in the first weeks is decisive for the months ahead.
- **Light CBT.** The modules on mechanism (tinnitus and the brain), relaxation and sound enrichment can be used in the acute phase too. There is no randomised evidence that this prevents chronicity; but it is reasonable to expect that reducing early distress reduces later disability [4].

## Weeks four and twelve

For new tinnitus the app schedules reassessment at weeks four and twelve: hearing screen, warning signs and THI. If the sound is still there and bothersome at week twelve, the chronic tinnitus programme begins. That does not mean "it will never go"; habituation of perception takes months and in most people the sound recedes into the background over the years [1].`,
    },
    citations: ['cima2019', 'chandrasekhar2019', 'nice2020', 'tunkel2014', 'mazurek2022', 'wallhausser2017'],
  },
  {
    slug: 'pulsatile-tinnitus',
    title: { tr: 'Nabızla atan çınlama', en: 'Pulsatile tinnitus' },
    readingMinutes: 5, group: 'doctor', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Kalp atışıyla eş zamanlı çınlama damar kaynaklı olabilir ve kılavuzlar görüntüleme ile planlı KBB değerlendirmesi önerir; bu uygulamanın kendi kendine yönetim programı pulsatil çınlama için tasarlanmamıştır.',
      en: 'Tinnitus in time with the heartbeat may be vascular, and guidelines recommend imaging with a planned ENT assessment; the self-management programme in this app is not designed for pulsatile tinnitus.',
    },
    body: {
      tr: `## Nasıl tanınır

Pulsatil çınlama, kalp atışıyla eş zamanlı, ritmik bir sestir: "vuş-vuş", uğultu ya da tıkırtı biçiminde olabilir. Nabzınızı sayarken sesin aynı ritimde olduğunu fark ederseniz, egzersizle hızlanıp dinlenince yavaşlıyorsa ya da başı çevirmek, boynun yan tarafına bastırmak sesi değiştiriyorsa pulsatil çınlamadan söz edilir. Çınlaması olan kişilerin küçük bir bölümünde (yaklaşık yüzde 4–10) görülür ve sürekli tondaki çınlamadan farklı bir değerlendirme izler.

## Neden farklı ele alınır

Sürekli çınlama çoğunlukla işitme yollarında üretilen bir sinyaldir. Pulsatil çınlama ise çoğu zaman gerçek bir ses kaynağıdır: kulağa yakın bir damarda türbülanslı kan akışı ya da kulağın içinden kaslardan gelen ritmik hareket. Olası nedenler arasında damar anomalileri (dural arteriyovenöz fistül, karotis darlığı, venöz sinüs darlığı), kafa içi basınç artışı, anemi ve tiroid gibi sistemik durumlar, orta kulak tümörleri ve iç kulak kemiğindeki yapısal değişiklikler bulunur. Bunların bir bölümü tedavi edilebilir ve birkaçı zaman içinde risk taşır; bu nedenle kılavuzlar pulsatil çınlamayı "görüntüleme yapılmaması" kuralının istisnası olarak tanımlar [1, 2].

Amerikan KBB Akademisi kılavuzu, yalnızca çınlama için görüntüleme yapılmamasını önerirken pulsatil, tek taraflı, nörolojik bulgulu ya da asimetrik işitme kaybı ile birlikte olan çınlamayı bu kuralın dışında tutar [1]. NICE kılavuzu, pulsatil çınlaması olan kişilere görüntüleme sunulmasını önerir [2].

## Değerlendirme nasıl olur

Kulak burun boğaz muayenesi otoskopiyi (kulak zarının arkasında kızarıklık ya da kitle), boyun ve kulak çevresinde steteskopla dinlemeyi (başkalarının da duyabildiği "objektif" sesi aramak), işitme testini ve kan basıncı ölçümünü içerir. Görüntüleme seçimi öyküye bağlıdır: damarları gösteren BT anjiyografi/venografi, MR ve MR anjiyografi; kuşkulu durumlarda kateter anjiyografi. 2025 tarihli sistematik derleme tek bir en iyi görüntüleme yolu göstermez; seçim klinik bulgulara göre yapılır [1, 2]. Birçok kişide görüntüleme normal çıkar; bu genellikle rahatlatıcıdır. Ancak ses sürerse ya da değişirse hekiminiz ek test isteyebilir.

## Ne beklemeli

Nedene bağlı olarak tedavi değişir: kan basıncı ve anemi gibi sistemik nedenlerin düzeltilmesi, bazı damar anomalilerinde girişimsel radyoloji ile kapatma, kafa içi basınç artışında kilo yönetimi ve ilaç, orta kulak tümörlerinde cerrahi. Neden bulunamayan ya da tedavi gerektirmeyen pulsatil çınlamada, sürekli çınlama için kullanılan yaklaşımlar (rahatlatan arka plan sesi, kaygı yönetimi, uyku) rahatlama sağlayabilir; ancak bu, değerlendirme tamamlandıktan sonradır.

## Bu uygulamayla ilişkisi

Bu uygulamanın kendi kendine yönetim programı sürekli, nabızla atmayan çınlama için tasarlanmıştır. Değerlendirme bölümünde pulsatil çınlama işaretlendiğinde uygulama sizi sevke yönlendirir ve program başlatmaz. Görüntüleme ve muayene tamamlanıp tedavi gerektiren bir neden dışlandığında eğitim ve ses bölümleri kullanılabilir; bir hekim onayladıysa kendi kendine yönetim programına da başlanabilir.

## Acil olan durumlar

Pulsatil çınlamayla birlikte ani şiddetli baş ağrısı, görme değişikliği, yüzde güçsüzlük, konuşma bozukluğu ya da ani işitme kaybı varsa beklemeden acile başvurun [2].

## Muayeneye hazırlık

Sesin ritmini nabzınızla karşılaştırıp not edin; hangi kulakta olduğunu, başlangıç zamanını, duruş ya da baş hareketiyle değişip değişmediğini, kan basıncı ve tiroid öykünüzü ve kullandığınız ilaçları yazın. Mümkünse sesi tarif eden kısa bir ses kaydı ya da benzetme ("vuş-vuş", "tıkırtı") görüşmeyi hızlandırır.`,
      en: `## How it is recognised

Pulsatile tinnitus is a rhythmic sound in time with the heartbeat: a "whoosh", a hum or a clicking. If you notice the sound keeps the same rhythm as your pulse when you count it, speeds up with exercise and slows at rest, or changes when you turn the head or press on the side of the neck, it is pulsatile tinnitus. It affects a small share of people with tinnitus (about 4–10 per cent) and follows a different assessment from continuous tonal tinnitus.

## Why it is handled differently

Continuous tinnitus is mostly a signal generated in the hearing pathways. Pulsatile tinnitus is often a real sound source: turbulent blood flow in a vessel near the ear or rhythmic movement from muscles inside the ear. Possible causes include vascular anomalies (dural arteriovenous fistula, carotid narrowing, venous sinus stenosis), raised intracranial pressure, systemic conditions such as anaemia and thyroid disease, middle-ear tumours and structural changes in the bone of the inner ear. Some of these are treatable and a few carry risk over time; that is why guidelines define pulsatile tinnitus as the exception to the "no imaging" rule [1, 2].

The American Academy of Otolaryngology guideline advises against imaging for tinnitus alone but exempts tinnitus that is pulsatile, one-sided, accompanied by neurological findings or asymmetric hearing loss [1]. The NICE guideline recommends offering imaging to people with pulsatile tinnitus [2].

## How the assessment goes

The ENT examination includes otoscopy (redness or a mass behind the eardrum), listening with a stethoscope around the neck and ear (looking for an "objective" sound others can hear), a hearing test and a blood pressure measurement. The choice of imaging depends on the history: CT angiography/venography showing the vessels, MRI and MR angiography; catheter angiography in doubtful cases. A 2025 systematic review shows no single best imaging pathway; the choice follows the clinical findings [1, 2]. In many people imaging is normal; that is usually reassuring. But if the sound persists or changes, your doctor may ask for further tests.

## What to expect

Treatment depends on the cause: correcting systemic causes such as blood pressure and anaemia, closure by interventional radiology for some vascular anomalies, weight management and medication for raised intracranial pressure, surgery for middle-ear tumours. In pulsatile tinnitus with no cause found or none needing treatment, the approaches used for continuous tinnitus (sound enrichment, anxiety management, sleep) can bring relief; but that comes after the assessment is complete.

## Relationship to this app

The self-management programme in this app is designed for continuous, non-pulsatile tinnitus. When pulsatile tinnitus is marked in the assessment section, the app directs you to referral and does not start a programme. Once imaging and examination are complete and a cause needing treatment is ruled out, the education and sound sections can be used; if a doctor has approved, the self-management programme can be started as well.

## Emergencies

If pulsatile tinnitus comes with sudden severe headache, visual change, facial weakness, slurred speech or sudden hearing loss, go to the emergency department without waiting [2].

## Preparing for the examination

Compare the rhythm of the sound with your pulse and note it; write down which ear, the time of onset, whether it changes with posture or head movement, your blood pressure and thyroid history, and the medicines you take. If possible, a short description or comparison of the sound ("whoosh", "clicking") speeds up the discussion.`,
    },
    citations: ['tunkel2014', 'nice2020'],
  },
  {
    slug: 'menieres',
    title: { tr: 'Ménière hastalığı ve çınlama', en: 'Ménière\'s disease and tinnitus' },
    readingMinutes: 5, group: 'doctor', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Dönme atakları, dalgalanan işitme, dolgunluk ve çınlama birlikteyse Ménière hastalığı düşünülür; tanı ve tedavi KBB uzmanına aittir, çınlama bileşeni için ise bu programın yaklaşımları yardımcı olabilir.',
      en: 'When attacks of vertigo, fluctuating hearing, fullness and tinnitus occur together, Ménière\'s disease is considered; diagnosis and treatment belong to the ENT specialist, while the approaches in this programme can help with the tinnitus component.',
    },
    body: {
      tr: `## Dört belirti

Ménière hastalığı, iç kulaktaki sıvı dengesinin bozulmasıyla ilişkilendirilen ve dört belirtinin birlikte görüldüğü bir durumdur: dakikalar ile saatler süren (tipik olarak 20 dakika–12 saat) dönme (vertigo) atakları, genellikle tek kulakta ve başlangıçta düşük frekanslarda dalgalanan işitme kaybı, kulakta dolgunluk ya da basınç hissi ve çınlama. Çınlama çoğu zaman düşük perdeli bir uğultu ya da kükreme biçimindedir ve atak öncesinde ya da sırasında artabilir. Çınlaması olan kişilerin küçük bir bölümünde neden Ménière'dir; ancak dalgalı işitme ve dönme ataklarının birlikteliği değerlendirme gerektirir [1].

## Neden önemli

Kılavuzlar, çınlama ile birlikte baş dönmesi ya da dalgalı/asimetrik işitme kaybı olan kişilerin kulak burun boğaz uzmanı tarafından görülmesini önerir; bu grup kendi kendine yönetim yolunda değil, tanısal değerlendirme yolundadır [1, 2]. Ménière tanısı klinik ölçütlere (atak sayısı ve süresi, odyometride belgelenmiş düşük–orta frekans kaybı) dayanır; iç kulağı ve işitme sinirini değerlendirmek için görüntüleme istenebilir. Atak sırasında şiddetli, uzun süren baş dönmesi ile birlikte yürüme güçlüğü, çift görme ya da konuşma bozukluğu gibi belirtiler ise inme için acil değerlendirme gerektirir [2].

## Tedavi seçenekleri (uzman yönetiminde)

Ménière tedavisi atakları azaltmayı ve işitmeyi korumayı hedefler; çınlamayı doğrudan hedefleyen bir bileşeni yoktur. Yaşam tarzı düzenlemeleri (tuz, kafein ve alkolün sınırlanması, düzenli uyku ve stres yönetimi) yaygın biçimde önerilir ancak kanıt düzeyi düşüktür. İlaç seçenekleri arasında diüretikler ve betahistin bulunur; betahistin için büyük bir plasebo kontrollü çalışma atak sıklığında fark göstermemiştir ve Cochrane derlemesi çınlama üzerinde etkisiz bulmuştur [3]. Dirençli olgularda kulak içine steroid ya da gentamisin uygulamaları ve cerrahi seçenekler değerlendirilir. Vestibüler rehabilitasyon ataklar arası denge yakınmaları için yararlıdır. Bu kararlar kulak burun boğaz uzmanına aittir [1].

## Ménière'de çınlamayla yaşamak

Hastalığın çınlama bileşeni, diğer çınlama türleriyle aynı mekanizmalara (işitme kaybı, dikkat, kaygı) bağlıdır ve aynı yaklaşımlardan yarar görür:

- **İşitme cihazı:** Dalgalı işitme cihaz ayarını zorlaştırır; ancak modern cihazlar birden fazla program sunar ve odyolog dalgalanmaya göre ayar yapabilir. İşitme kaybı iletişimi etkiliyorsa değerlendirme önerilir [1, 2].
- **Rahatlatan arka plan sesi:** Düşük perdeli çınlamada kahverengi gürültü ya da doğa sesleri çoğu kişi için daha uyumludur; düzey karışma noktasının altında kalmalıdır.
- **Bilişsel davranışçı terapi:** Çınlama sıkıntısını azaltmada kanıtı en güçlü yaklaşımdır [4]. Ménière'de atak korkusu ve belirsizlik ek bir kaygı kaynağıdır; düşünce kaydı ve kaygı yönetimi becerileri bu kaygıya da uygulanır.
- **Uyku:** Ataklar ve kaygı uykuyu bozar; uyku modülleri aynı şekilde geçerlidir.

Uygulamadaki çınlama programı, Ménière tanısı almış kişilerde uzman tedavisine ek olarak kullanılabilir; değerlendirme sırasında baş dönmesi ya da dalgalı işitme işaretlendiğinde uygulama önce sevk önerir.

## Takip

Ménière zaman içinde değişir: ataklar yıllar içinde seyrekleşebilir, işitme kaybı ise kalıcı hâle gelebilir. İşitme ve çınlamanın düzenli odyolojik takibi önerilir. Yeni bir belirti (karşı kulakta işitme düşüşü, farklı nitelikte baş dönmesi, nörolojik bulgu) yeniden değerlendirme nedenidir [1].

## Atak sırasında

Atak başladığında güvenli bir yere oturun ya da uzanın, başınızı sabit tutun ve bir noktaya bakın; araç kullanmayın. Hekiminizin önerdiği atak ilacı varsa kullanın. Atak geçtikten sonraki saatlerde çınlama ve dolgunluk belirgin olabilir; bu beklenir ve genellikle günler içinde yatışır.`,
      en: `## Four symptoms

Ménière's disease is a condition linked with a disturbance of fluid balance in the inner ear in which four symptoms occur together: attacks of spinning dizziness (vertigo) lasting minutes to hours (typically 20 minutes to 12 hours), fluctuating hearing loss usually in one ear and initially at low frequencies, a feeling of fullness or pressure in the ear, and tinnitus. The tinnitus is often a low-pitched hum or roar and may increase before or during an attack. In a small share of people with tinnitus the cause is Ménière's; but the combination of fluctuating hearing and attacks of vertigo calls for assessment [1].

## Why it matters

Guidelines recommend that people with tinnitus together with dizziness or fluctuating/asymmetric hearing loss be seen by an ENT specialist; this group is on the diagnostic route, not the self-management route [1, 2]. The diagnosis of Ménière's rests on clinical criteria (number and duration of attacks, documented low-to-mid frequency loss on audiometry); imaging may be requested to assess the inner ear and the hearing nerve. Severe, prolonged dizziness during an attack together with difficulty walking, double vision or slurred speech needs emergency assessment for stroke [2].

## Treatment options (under specialist management)

Treatment of Ménière's aims to reduce attacks and preserve hearing; it has no component that targets tinnitus directly. Lifestyle measures (limiting salt, caffeine and alcohol, regular sleep and stress management) are widely advised but the evidence is weak. Drug options include diuretics and betahistine; for betahistine a large placebo-controlled trial showed no difference in attack frequency, and the Cochrane review found it ineffective for tinnitus [3]. In resistant cases intratympanic steroid or gentamicin and surgical options are considered. Vestibular rehabilitation helps balance complaints between attacks. These decisions belong to the ENT specialist [1].

## Living with tinnitus in Ménière's

The tinnitus component of the disease depends on the same mechanisms as other kinds of tinnitus (hearing loss, attention, anxiety) and benefits from the same approaches:

- **Hearing aids:** Fluctuating hearing makes fitting harder; but modern aids offer several programmes and the audiologist can adjust to the fluctuation. If hearing loss affects communication, an evaluation is advised [1, 2].
- **Sound enrichment:** For low-pitched tinnitus, brown noise or nature sounds suit most people better; the level should stay below the mixing point.
- **Cognitive behavioural therapy:** The approach with the strongest evidence for reducing tinnitus distress [4]. In Ménière's, fear of attacks and uncertainty are an added source of anxiety; thought records and anxiety management skills apply to that anxiety too.
- **Sleep:** Attacks and anxiety disrupt sleep; the sleep modules apply in the same way.

The tinnitus programme in the app can be used alongside specialist treatment in people diagnosed with Ménière's; when dizziness or fluctuating hearing is marked during assessment, the app recommends referral first.

## Follow-up

Ménière's changes over time: attacks may become rarer over the years while hearing loss may become permanent. Regular audiological follow-up of hearing and tinnitus is advised. A new symptom (hearing drop in the other ear, dizziness of a different character, a neurological finding) is a reason for reassessment [1].

## During an attack

When an attack starts, sit or lie down somewhere safe, keep the head still and fix your gaze on a point; do not drive. Use any attack medication your doctor has advised. In the hours after an attack the tinnitus and fullness may be prominent; that is expected and usually settles within days.`,
    },
    citations: ['tunkel2014', 'nice2020', 'wegner2018', 'fuller2020', 'basura2020'],
  },
  {
    slug: 'meds-and-tinnitus',
    title: { tr: 'İlaçlar ve çınlama: kulağa zarar veren ilaçlar', en: 'Medicines and tinnitus: ototoxicity' },
    readingMinutes: 5, group: 'hearing', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Bazı ilaçlar (yüksek doz aspirin, aminoglikozid antibiyotikler, sisplatin, kıvrım diüretikleri, kinin) çınlamaya yol açabilir ya da artırabilir; değişiklik fark ederseniz reçete eden hekime bildirin, ilacı kendi başınıza kesmeyin.',
      en: 'Some medicines (high-dose aspirin, aminoglycoside antibiotics, cisplatin, loop diuretics, quinine) can cause or increase tinnitus; if you notice a change, tell the prescribing doctor and do not stop the medicine on your own.',
    },
    body: {
      tr: `## Ototoksisite nedir

Ototoksisite, bir ilacın iç kulaktaki işitme ya da denge yapılarına zarar vermesidir. Belirtiler çınlama, işitme kaybı (genellikle önce yüksek frekanslarda ve iki taraflı) ve denge bozukluğudur. Çınlama çoğu zaman ilk belirtidir; bu nedenle bilinen ototoksik bir ilaç kullanırken yeni başlayan ya da artan çınlama bildirilmesi gereken bir sinyaldir. Kılavuzlar, çınlama öyküsünde ilaç kullanımının sorgulanmasını ve ototoksik ilaç alanlarda işitmenin izlenmesini önerir [1].

## Sık karşılaşılan ilaçlar

- **Salisilatlar (aspirin) ve bazı ağrı kesiciler:** Yüksek dozda (günde birkaç gram) aspirin geçici çınlama ve hafif işitme kaybı yapabilir; düşük doz (kalp koruyucu) aspirin nadiren sorun oluşturur. Bazı steroid dışı antienflamatuvar ilaçlar da geçici çınlama bildirimine yol açabilir.
- **Aminoglikozid antibiyotikler (gentamisin, amikasin, streptomisin):** Damar yoluyla ve uzun süre kullanıldığında kalıcı iç kulak hasarı yapabilir; hastanede kullanım sırasında kan düzeyi ve işitme izlenir.
- **Platin kemoterapileri (sisplatin, karboplatin):** Kalıcı yüksek frekans işitme kaybı ve çınlama sık görülür; tedavi öncesi ve sırasında odyometri standarttır.
- **Kıvrım diüretikleri (furosemid):** Özellikle yüksek dozda ve hızlı damar içi uygulamada geçici çınlama ve işitme kaybı.
- **Kinin ve bazı sıtma ilaçları:** Geçici çınlama ("sinkonizm").
- **Bazı antidepresanlar ve benzodiazepinlerin kesilmesi:** Doğrudan ototoksik değildir; ancak bazı kişilerde başlarken ya da keserken çınlama artışı bildirilir.

Diğer birçok ilacın prospektüsünde "çınlama" yan etki olarak yer alır; ancak nadir bildirimler ile kanıtlanmış ototoksisite arasında fark vardır. İlaç başladıktan sonra çınlama fark ettiyseniz bu bir ilişki olabilir, ancak tesadüf de olabilir; değerlendirmeyi hekiminizle yapın.

## Ne yapmalı

- **Bildirin.** Yeni ya da artan çınlama, işitmede değişiklik ya da denge sorunu fark ederseniz reçete eden hekime söyleyin. Çoğu durumda doz ayarı, ilaç değişimi ya da yalnızca izlem yeterlidir.
- **Kendi başınıza kesmeyin.** Antibiyotik ya da kemoterapi gibi ilaçlarda tedavi kesilmesi, çınlama riskinden daha büyük bir risk taşıyabilir. Karar, hekiminizle birlikte fayda–zarar dengesine göre verilir [1].
- **İşitmeyi izletin.** Bilinen ototoksik bir ilaç planlanıyorsa başlangıç odyometrisi ve tedavi sırasında kontrol isteyin; erken fark edilen değişiklik kalıcı hasarı sınırlayabilir.
- **Birleşik riskleri azaltın.** Ototoksik ilaç kullanırken yüksek gürültüden kaçının; gürültü ve ilaç etkisi birbirini güçlendirir.
- **Listeyi hazır tutun.** Kullandığınız tüm ilaç ve takviyelerin listesini (dozlarıyla) KBB muayenesine götürün; uygulamadaki profil raporuna ekleyebilirsiniz.

## Çınlama için ilaç kullanıyorsanız

Çınlamanın kendisi için önerilen bir ilaç yoktur; betahistin, antidepresanlar, antikonvülzanlar ve benzodiazepinler kılavuzlarda rutin olarak önerilmez [1, 2]. Eşlik eden depresyon, kaygı ya da uykusuzluk için reçete edilen ilaçlar, o durumlar için kullanılmaya devam edilir; ayrıntı için "Takviyeler ve ilaçlar" yazısına bakın [3].

## Çınlama geri döner mi

Salisilat, kıvrım diüretiği ve kinine bağlı çınlama ilaç kesildikten ya da doz düşürüldükten sonra genellikle günler içinde geriler. Aminoglikozid ve platin kaynaklı hasar ise kalıcı olabilir; bu nedenle bu ilaçlarda izlem tedavi sırasında yapılır, sonrasında değil. Kalıcı çınlama gelişirse yönetim, diğer çınlama türleriyle aynıdır: işitme değerlendirmesi, rahatlatan arka plan sesi ve bilişsel davranışçı terapi [1]. İlaçla ilişkili çınlamanın farkı, başlangıç zamanının belli olmasıdır; bu, sesin nereden geldiğini anlamayı ve alışmayı kolaylaştırabilir.`,
      en: `## What ototoxicity is

Ototoxicity is damage by a medicine to the hearing or balance structures of the inner ear. The symptoms are tinnitus, hearing loss (usually first at high frequencies and in both ears) and balance disturbance. Tinnitus is often the first sign; so new or increasing tinnitus while taking a known ototoxic drug is a signal that should be reported. Guidelines recommend asking about medicines in the tinnitus history and monitoring hearing in people taking ototoxic drugs [1].

## Common medicines

- **Salicylates (aspirin) and some painkillers:** High-dose aspirin (several grams a day) can cause reversible tinnitus and mild hearing loss; low-dose (cardioprotective) aspirin rarely causes problems. Some non-steroidal anti-inflammatory drugs can also lead to reports of temporary tinnitus.
- **Aminoglycoside antibiotics (gentamicin, amikacin, streptomycin):** Given intravenously and for long periods they can cause permanent inner-ear damage; blood levels and hearing are monitored during hospital use.
- **Platinum chemotherapy (cisplatin, carboplatin):** Permanent high-frequency hearing loss and tinnitus are common; audiometry before and during treatment is standard.
- **Loop diuretics (furosemide):** Temporary tinnitus and hearing loss, especially at high dose and with rapid intravenous use.
- **Quinine and some antimalarials:** Temporary tinnitus ("cinchonism").
- **Some antidepressants and benzodiazepine withdrawal:** Not directly ototoxic; but some people report increased tinnitus when starting or stopping.

Many other medicines list "tinnitus" as a side effect in the leaflet; but there is a difference between rare reports and proven ototoxicity. If you noticed tinnitus after starting a drug, there may be a link, but it may also be coincidence; assess it with your doctor.

## What to do

- **Report it.** If you notice new or increasing tinnitus, a change in hearing or a balance problem, tell the prescribing doctor. In most cases a dose adjustment, a change of drug or simply monitoring is enough.
- **Do not stop on your own.** With drugs such as antibiotics or chemotherapy, stopping treatment can carry a bigger risk than the tinnitus. The decision is made with your doctor on the balance of benefit and harm [1].
- **Have your hearing monitored.** If a known ototoxic drug is planned, ask for baseline audiometry and checks during treatment; a change caught early can limit permanent damage.
- **Reduce combined risks.** Avoid loud noise while taking an ototoxic drug; noise and drug effects reinforce each other.
- **Keep the list ready.** Take a list of all medicines and supplements you use (with doses) to the ENT examination; you can add it to the profile report in the app.

## If you take medicines for tinnitus

No medicine is recommended for tinnitus itself; betahistine, antidepressants, anticonvulsants and benzodiazepines are not routinely recommended in guidelines [1, 2]. Medicines prescribed for accompanying depression, anxiety or insomnia continue to be used for those conditions; see the "Supplements and medicines" article for details [3].

## Does the tinnitus go away

Tinnitus due to salicylates, loop diuretics and quinine usually recedes within days after the drug is stopped or the dose reduced. Damage from aminoglycosides and platinum drugs can be permanent; that is why monitoring with these drugs happens during treatment, not after. If permanent tinnitus develops, management is the same as for other kinds of tinnitus: hearing assessment, sound enrichment and cognitive behavioural therapy [1]. What sets drug-related tinnitus apart is that the time of onset is known; that can make it easier to understand where the sound comes from and to ease habituation.`,
    },
    citations: ['tunkel2014', 'nice2020', 'wegner2018'],
  },
  {
    slug: 'bimodal-neuromodulation',
    title: { tr: 'Bimodal nöromodülasyon (Lenire ve benzerleri)', en: 'Bimodal neuromodulation (Lenire and similar)' },
    readingMinutes: 6, group: 'sound', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Dil veya boyun uyarımını sesle milisaniye hassasiyetinde eşleştiren cihazlar, kontrollü çalışmalarda yalnızca sese göre daha fazla yanıt üretmiştir; etki cihazdaki elektriksel uyarıma bağlıdır ve bir uygulama ile taklit edilemez.',
      en: 'Devices pairing tongue or neck stimulation with sound at millisecond precision produced more responders than sound alone in controlled trials; the effect depends on the device\'s electrical stimulation and cannot be replicated by an app.',
    },
    body: {
      tr: `## Fikir

"Bimodal" iki duyu kanalının birlikte uyarılması demektir: ses ile birlikte dil, boyun ya da yüzden gelen dokunsal/elektriksel uyarım. Gerekçe, işitme yolundaki ilk işlem merkezinin (koklear çekirdek) hem kulaktan hem de bu bölgelerden sinyal almasıdır. İki sinyalin milisaniye hassasiyetinde zamanlanması, çınlamayla ilişkili aşırı eş zamanlı sinir etkinliğini azaltmayı hedefler. Zamanlama, yöntemin özüdür.

## Lenire (dil + ses)

Lenire, kulaklıktan verilen kişiselleştirilmiş sesi (odyogram aralığında tonlar, geniş bantlı bir zemin üzerinde) dil üzerine yerleştirilen 32 elektrotlu bir dizi ile eşleştirir; günde iki kez 30 dakika, 12 hafta.

- **TENT-A1 (2020):** 326 katılımcı, üç uyarım ayarı; kontrol grubu yok. On iki haftada THI ortalama yaklaşık 14 puan düştü; uyumlu katılımcıların yüzde 86'sı bir miktar düzelme bildirdi ve yaklaşık yüzde 80'inde etki 12 ayda sürdü. Ayarlar arasında fark bulunmadı [1].
- **TENT-A2 (2022):** 191 katılımcı, altıncı haftada ayar değişimi; kontrol grubu yok. THI düşüşü yaklaşık 18–20 puan.
- **TENT-A3 (2024):** 112 katılımcı, tek kollu ama kontrollü tasarım: önce altı hafta yalnızca ses, sonra altı hafta bimodal. Orta ve daha şiddetli çınlamada yanıt oranı (THI'da 7 puandan fazla düzelme) bimodal dönemde yüzde 59, yalnızca ses döneminde yüzde 43 idi. Tüm katılımcılar alındığında bimodalin üstünlüğü görülmedi. Bu çalışma, ABD'de cihazın De Novo onayına (2023) temel oluşturdu [1].

Kanıt derecesi: orta–şiddetli çınlamada "bimodal, yalnızca sesten daha iyi" için orta; mutlak etkinlik için düşük, çünkü sahte uyarım kontrollü çalışma yoktur ve çınlama çalışmalarında plasebo yanıtı yüksektir. Amerikan KBB Akademisi'nin 2026 güncellemesi bimodal nöromodülasyonu bağımsız doğrulama çağrısıyla birlikte bir "seçenek" olarak listeler [2].

## Michigan yöntemi (boyun/yüz + ses)

Shore ve ekibinin yöntemi, çınlama spektrumuna göre şekillendirilmiş sesi boyun (C2) ya da yüz bölgesine uygulanan elektriksel uyarımla, milisaniye hassasiyetinde eşleştirir. Somatik çınlamayı (çene/boyun hareketiyle değişen) olan 99 kişilik çift kör çaprazlama çalışmada, altı haftalık bimodal dönem TFI ve THI'da anlamlı ve klinik olarak önemli düzelme sağladı; gürlükte protokole uyanlarda yaklaşık 14 desibel azalma görüldü; yalnızca ses döneminde birikimli etki olmadı. Etki, uyarım bittikten sonra da bir süre sürdü. Cihaz henüz onaylı ve yaygın değildir [2].

## Bir uygulama ne yapabilir, ne yapamaz

| Bileşen | Uygulama | Kanıt |
| Odyograma göre şekillendirilmiş ses | Evet (uygulama içi işitme taramasıyla) | TENT-A3'te yalnızca ses: yüzde 43 yanıt; Michigan: birikimli etki yok |
| Milisaniye zamanlı elektriksel uyarım | Hayır (donanım gerekir) | Etkinin kaynağı |
| Sesi kendi yaptığınız çene/boyun hareketleriyle eşleştirmek | Teknik olarak evet | Kanıt yok; iddia edilmemeli |
| Günlük 60 dakikalık yapılandırılmış dinleme ve takip | Evet | Uyuma yardımcı; etkinlik iddiası yok |

Sonuç açıktır: bu uygulama bimodal nöromodülasyon sunmaz ve sunduğunu iddia etmez. Uygulamadaki "kişiselleştirilmiş spektrum dinleme" rahatlatan arka plan sesi olarak etiketlenir, nöromodülasyon olarak değil.

## Kimler için düşünülebilir

- Orta–şiddetli, kronik (altı aydan uzun), rahatsız edici çınlama.
- Tıbbi değerlendirme tamamlanmış; pulsatil ya da ele alınabilir nedenler dışlanmış.
- Michigan yöntemi için somatik modülasyon varlığı.
- Düzenli günlük kullanıma (12 hafta, günde 60 dakika) uyum.

Cihazlar ücretlidir ve çoğu ülkede geri ödeme kapsamında değildir. Sorulması gereken sorular: sahte uyarım kontrollü veri var mı, yanıt tanımı nedir, etki kaç ay izlenmiş, hangi alt gruplarda işe yaramış. Kılavuzların en net biçimde önerdiği yaklaşım hâlâ bilişsel davranışçı terapidir; bimodal cihazlar BDT'nin yerine değil, uzman değerlendirmesiyle birlikte bir ek seçenek olarak düşünülmelidir [2, 3].`,
      en: `## The idea

"Bimodal" means stimulating two sensory channels together: sound together with tactile/electrical stimulation from the tongue, neck or face. The rationale is that the first processing centre in the hearing pathway (the cochlear nucleus) receives signals both from the ear and from these regions. Timing the two signals with millisecond precision aims to reduce the excessively synchronised nerve activity linked with tinnitus. The timing is the essence of the method.

## Lenire (tongue + sound)

Lenire pairs personalised sound through headphones (tones across the audiogram range on a broadband background) with a 32-electrode array placed on the tongue; 30 minutes twice a day for 12 weeks.

- **TENT-A1 (2020):** 326 participants, three stimulation settings; no control group. THI fell by about 14 points on average at twelve weeks; 86 per cent of compliant participants reported some improvement and in about 80 per cent the effect lasted to 12 months. No difference between settings [1].
- **TENT-A2 (2022):** 191 participants, a change of setting at week six; no control group. THI reduction about 18–20 points.
- **TENT-A3 (2024):** 112 participants, a single-arm but controlled design: six weeks of sound only, then six weeks bimodal. In moderate or worse tinnitus the responder rate (more than 7 points of THI improvement) was 59 per cent in the bimodal phase and 43 per cent in the sound-only phase. Across all participants no advantage for bimodal was seen. This trial was the basis for the device's De Novo authorisation in the US (2023) [1].

Grade of evidence: moderate for "bimodal better than sound alone" in moderate-to-severe tinnitus; low for absolute efficacy, because there is no sham-controlled trial and the placebo response in tinnitus trials is high. The 2026 update of the American Academy of Otolaryngology guideline lists bimodal neuromodulation as an "option" with a call for independent replication [2].

## The Michigan method (neck/face + sound)

The method of Shore and her team pairs sound shaped to the tinnitus spectrum with electrical stimulation applied to the neck (C2) or face region at millisecond precision. In a 99-person double-blind crossover trial in somatic tinnitus (tinnitus that changes with jaw/neck movement), the six-week bimodal phase produced statistically significant and clinically meaningful improvement on the TFI and THI; loudness fell by about 14 decibels in those who followed the protocol; the sound-only phase had no cumulative effect. The effect continued for a while after stimulation ended. The device is not yet approved or widely available [2].

## What an app can and cannot do

| Component | App | Evidence |
| Sound shaped to the audiogram | Yes (with the in-app hearing screen) | Sound only in TENT-A3: 43 per cent response; Michigan: no cumulative effect |
| Millisecond-timed electrical stimulation | No (needs hardware) | The source of the effect |
| Pairing sound with self-performed jaw/neck manoeuvres | Technically yes | No evidence; must not be claimed |
| Structured 60-minute daily listening with tracking | Yes | Supports adherence; no efficacy claim |

The conclusion is clear: this app does not deliver bimodal neuromodulation and does not claim to. The "personalised spectrum listening" in the app is labelled as sound enrichment, not neuromodulation.

## Who it may be considered for

- Moderate-to-severe, chronic (over six months), bothersome tinnitus.
- Medical assessment complete; pulsatile or treatable causes ruled out.
- For the Michigan method, the presence of somatic modulation.
- Ability to keep to daily use (12 weeks, 60 minutes a day).

The devices are paid for and not covered by reimbursement in most countries. Questions to ask: is there sham-controlled data, how is response defined, over how many months was the effect followed, in which subgroups did it work. The approach guidelines recommend most clearly is still cognitive behavioural therapy; bimodal devices should be considered not instead of CBT but as an additional option alongside specialist assessment [2, 3].`,
    },
    citations: ['conlon2020', 'adams2026', 'fuller2020', 'boedts2024', 'jones2023'],
  },
  {
    slug: 'digital-therapeutics-evidence',
    title: { tr: 'Çınlama uygulamaları: kanıt karşılaştırması', en: 'Tinnitus apps: comparing the evidence' },
    readingMinutes: 7, group: 'cbt', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Dijital BDT programları kontrollü çalışmalarda çınlama sıkıntısını azaltmıştır; etki büyüklüğü rehberli programlarda daha yüksek, sahte uygulama kontrollü tek çalışmada THI farkı yaklaşık 20 puandır. Hiçbir uygulama sesin gürlüğünü anlamlı biçimde azaltmamıştır.',
      en: 'Digital CBT programmes have reduced tinnitus distress in randomised trials; the effect is larger in guided programmes, and in the single sham-app-controlled trial the THI difference was about 20 points. No app has meaningfully reduced the loudness of the sound.',
    },
    body: {
      tr: `## Neden önemli

Çınlama için bilişsel davranışçı terapi kılavuzların ilk sırada önerdiği yaklaşımdır; ancak yüz yüze terapiye erişim sınırlıdır. İngiltere NICE kılavuzu bu nedenle basamaklı bir yol önerir: önce dijital BDT, sonra grup programları, sonra psikolog eşliğinde bireysel terapi [1]. Soru, dijital programların gerçekten işe yarayıp yaramadığıdır. Aşağıdaki tablo, bağımsız yayımlanmış çalışmaları ürün adıyla ve dürüst biçimde özetler; bu uygulamanın kendi etkinlik verisi henüz yoktur.

## İnternet temelli BDT: temel kanıt

Bu uygulamanın yapısını oluşturan internet temelli BDT programı (Andersson/Kaldo → Beukes), üç randomize çalışmada sınanmıştır. İngiltere'de 146 kişilik çalışmada odyolog rehberliğindeki sekiz haftalık program, haftalık izleme grubuna göre TFI'da orta–büyük etki (d = 0,70) gösterdi; yüzde 51'i 13 puanlık klinik anlamlı değişime ulaştı (kontrolde yüzde 5) [2]. İkinci bir çalışmada program, yüz yüze klinik bakımdan daha az etkili bulunmadı. ABD'de 158 kişilik çalışmada etki daha küçüktü (d = 0,46); kazanımlar bir yıla kadar sürdü [2].

## Ürün karşılaştırması

| Ürün | Kanıt | Sınırlar |
| Kalmeda (Almanya, DiGA listesinde) | 187 kişilik RKÇ: Tinnitus Anketi, depresyon ve uyku puanları düzeldi; grup içi etki büyüklüğü yaklaşık 1,2–1,4; gürlükte değişim yok | Gecikmeli başlangıç kontrolü, sahte uygulama yok; işitme taraması, uyku BDT'si, ses hassasiyeti ve somatik bileşen yok |
| Oto (İngiltere) | 2025 RKÇ: altı ayda TFI kontrolden 9 puan daha iyi (d = 0,62); yüzde 21 ayrılma | Sahte kontrol yok; rehbersiz; işitme ve somatik bileşen yok |
| Tinnibot / MindEar (Avustralya–Yeni Zelanda) | 2026 RKÇ (105 kişi): yalnızca Tinnibot klinik anlamlı TFI düşüşüne ulaştı; uyku, kaygı ve depresyon da düzeldi; klinisyen eklenen karma sürümde yanıt yüzde 64, yalnızca bot ile yüzde 42 | Sohbet botu; en iyi sonuç için insan desteği gerekli |
| Tinnitracks (Almanya) | Çentikli müzik; dayandığı literatürde çift kör RKÇ olumsuz | Tek mekanizma; DiGA listesinde değil |
| ReSound Relief, Beltone Calmer | Ses kütüphanesi, gevşeme, eğitim | Yayımlanmış RKÇ yok; yapılandırılmış BDT yok |
| Japon dijital tedavi uygulaması (Wasano 2026) | Sahte uygulama kontrollü RKÇ (60 kişi): 16 haftada THI gruplar arası −20 puan; 24 haftada −18 | Küçük örneklem; işitme kaybı olmayan ve düşük başlangıç puanlı alt gruplarda yarar görülmedi [3] |
| Searchfield prototipi (Yeni Zelanda) | 2022 RKÇ: TFI 12 haftada −18 (beyaz gürültü uygulamasında −10); yanıt yüzde 65'e karşı 43 | Kemik iletimli donanım gerektirir |
| UC Irvine uygulaması (2025) | 92 kişilik RKÇ: TFI −17 (kontrolde −2); yüzde 38'inde 20 puan üzeri düzelme | Bekleme listesi kontrolü |

## Tablodan çıkan dersler

- **Rehberli, rehbersizden iyidir.** Haftalık kısa klinisyen teması olan programlar (Beukes d ≈ 0,5–0,7; Tinnibot karma yüzde 64) rehbersiz olanlardan (Oto 9 puan; Tinnibot bot yüzde 42) daha büyük etki gösterir [2].
- **Sahte kontrol nadirdir.** Çoğu çalışma bekleme listesi ya da gecikmeli başlangıç kontrolü kullanır; bu, beklenti etkisini dışlamaz. Sahte uygulama kontrollü tek çalışma (Wasano) olumlu ama küçüktür [3].
- **Gürlük değişmez.** Hiçbir dijital program sesin gürlüğünü anlamlı biçimde azaltmamıştır; değişen şey sıkıntı, uyku, ruh hâli ve yaşam kalitesidir. Bu, hedefin doğru konmasını gerektirir.
- **Ortak eksikler.** Mevcut ürünlerin hemen hepsi tek bir yol sunar: işitme taraması, uykusuzluk için BDT, ses hassasiyeti programı, somatosensoriyel egzersizler ve sonuca göre uyarlama çoğunda yoktur. Bu uygulama bu eksikleri kapatmaya çalışır; ancak bu tasarım seçimlerinin sonuç üzerindeki etkisi henüz kendi randomize çalışmasında sınanmamıştır.

## Bu uygulama için dürüst ifade

Bu uygulamadaki BDT içeriği, yukarıdaki randomize çalışmalarda sınanmış program yapısını (Beukes/Andersson 21 modül, Öst gevşeme dizisi), uykusuzluk için BDT'yi (Marks 2023) ve ses hassasiyeti protokollerini (Jüris, Formby) izler. Bu içeriklerin bu uygulamadaki biçimiyle etkinliği henüz ölçülmemiştir. Bekleyebileceğiniz şey, benzer programlarda görülen etkidir: düzenli uygulayanların yaklaşık yarısında sekiz haftada klinik olarak anlamlı sıkıntı azalması [2]; sesin yok olması değil. Uygulama, ilerlemenizi THI ile dört haftada bir ölçer ve sekizinci haftada yanıt yoksa strateji değişikliği (ACT, farkındalık, klinisyen eşliğinde BDT) önerir; bu, kanıtın gösterdiği basamaklı yaklaşımın gereğidir [1, 4].`,
      en: `## Why it matters

Cognitive behavioural therapy for tinnitus is the first-line approach in guidelines; but access to face-to-face therapy is limited. The UK NICE guideline therefore recommends a stepped route: digital CBT first, then group programmes, then individual therapy with a psychologist [1]. The question is whether digital programmes really work. The table below summarises independently published trials by product name and honestly; this app has no efficacy data of its own yet.

## Internet-based CBT: the core evidence

The internet-based CBT programme that forms the structure of this app (Andersson/Kaldo → Beukes) has been tested in three randomised trials. In a 146-person UK trial, the audiologist-guided eight-week programme showed a moderate-to-large effect on the TFI (d = 0.70) compared with weekly monitoring; 51 per cent reached the 13-point clinically meaningful change (5 per cent in controls) [2]. In a second trial the programme was found no less effective than face-to-face clinical care. In a 158-person US trial the effect was smaller (d = 0.46); gains lasted up to a year [2].

## Product comparison

| Product | Evidence | Limits |
| Kalmeda (Germany, DiGA-listed) | 187-person RCT: Tinnitus Questionnaire, depression and sleep scores improved; within-group effect size about 1.2–1.4; no change in loudness | Delayed-start control, no sham; no hearing screen, no CBT-I, no hyperacusis or somatic components |
| Oto (UK) | 2025 RCT: TFI 9 points better than control at six months (d = 0.62); 21 per cent dropout | No sham; unguided; no hearing or somatic components |
| Tinnibot / MindEar (Australia–New Zealand) | 2026 RCT (105 people): only Tinnibot reached a clinically meaningful TFI reduction; sleep, anxiety and depression also improved; hybrid version with a clinician 64 per cent response, bot only 42 per cent | Chatbot; best outcomes still need a human |
| Tinnitracks (Germany) | Notched music; the double-blind RCT in its underlying literature was negative | Single mechanism; not DiGA-listed |
| ReSound Relief, Beltone Calmer | Sound library, relaxation, education | No published RCT; no structured CBT |
| Japanese therapeutic app (Wasano 2026) | Sham-app-controlled RCT (60 people): THI between-group −20 points at 16 weeks; −18 at 24 weeks | Small sample; no benefit in subgroups without hearing loss or with low baseline scores [3] |
| Searchfield prototype (New Zealand) | 2022 RCT: TFI −18 at 12 weeks (−10 with a white-noise app); response 65 versus 43 per cent | Requires bone-conduction hardware |
| UC Irvine app (2025) | 92-person RCT: TFI −17 (−2 in controls); 38 per cent improved by more than 20 points | Waitlist control |

## Lessons from the table

- **Guided beats unguided.** Programmes with brief weekly clinician contact (Beukes d ≈ 0.5–0.7; Tinnibot hybrid 64 per cent) show larger effects than unguided ones (Oto 9 points; Tinnibot bot 42 per cent) [2].
- **Sham controls are rare.** Most trials use waitlist or delayed-start controls, which do not rule out expectation effects. The single sham-app-controlled trial (Wasano) is positive but small [3].
- **Loudness does not change.** No digital programme has meaningfully reduced the loudness of the sound; what changes is distress, sleep, mood and quality of life. That requires setting the goal correctly.
- **Shared gaps.** Almost all current products offer a single path: a hearing screen, CBT for insomnia, a hyperacusis programme, somatosensory exercises and outcome-based adaptation are missing from most. This app tries to close these gaps; but the effect of these design choices on outcomes has not yet been tested in its own randomised trial.

## An honest statement for this app

The CBT content in this app follows the programme structure tested in the randomised trials above (Beukes/Andersson 21 modules, the Öst relaxation sequence), CBT for insomnia (Marks 2023) and the hyperacusis protocols (Jüris, Formby). The effectiveness of this content in the form it takes in this app has not yet been measured. What you can expect is the effect seen in similar programmes: clinically meaningful reduction in distress at eight weeks in about half of those who practise regularly [2]; not the sound disappearing. The app measures your progress with the THI every four weeks and, if there is no response at week eight, suggests a change of strategy (ACT, mindfulness, clinician-delivered CBT); that is what the stepped approach shown by the evidence requires [1, 4].`,
    },
    citations: ['nice2020', 'beukes2018', 'wasano2026', 'fuller2020', 'walter2023', 'oto2025', 'tinnibot2026', 'schoisswohl2025'],
  },
  {
    slug: 'myths',
    title: { tr: 'Çınlama hakkında yaygın yanlışlar', en: 'Common myths about tinnitus' },
    readingMinutes: 6, group: 'basics', reviewedLine: REVIEWED,
    takeaway: {
      tr: 'Çınlama sağırlığın habercisi değildir, yaşlılara özgü değildir, "yapacak bir şey yok" doğru değildir ve sessizlik iyi gelmez; kanıt, sesle ilişkiyi değiştiren yaklaşımların işe yaradığını gösterir.',
      en: 'Tinnitus is not a herald of deafness, not confined to the old, "nothing can be done" is not true, and silence does not help; the evidence shows that approaches which change the relationship with the sound work.',
    },
    body: {
      tr: `## "Yapacak bir şey yok, alışmanız gerekiyor"

Yarısı doğru, yarısı yanlış. Sesi ortadan kaldıran bir tedavi yoktur; ancak "alışmak" kendiliğinden beklenecek bir şey değil, öğrenilebilen bir süreçtir. 28 çalışmayı birleştiren Cochrane derlemesine göre bilişsel davranışçı terapi, çınlamanın yaşam kalitesine etkisini azaltabilir [1]; uykusuzluk için BDT, işitme cihazları ve ses hassasiyeti programlarının da kanıtı vardır. "Yapacak bir şey yok" cümlesi, yardımcı olabilecek yolların önünü kapatır.

## "Çınlama sağırlığa gider"

Çınlama ve işitme kaybı sık birlikte görülür; ama ses, kaybın ilerlediğinin göstergesi değildir. Çınlama, çoğu kişide işitme kaybının hızlandığını göstermez. Sesin yüksek olduğu bir gün, işitmenin o gün kötüleştiği anlamına gelmez; gürlük yorgunluk, stres ve sessizlikle dalgalanır. Ani ya da hızlı işitme düşüşü ise ayrı bir durumdur ve değerlendirme gerektirir [2].

## "Beyinde bir sorun var"

Çınlama çoğunlukla işitme yollarındaki bir dengelenmenin ürünüdür: azalan girdiye karşı artan kazanç. Bu, beyinde bir hastalık olduğu anlamına gelmez; sistemin çalışma biçimidir. Kılavuzlar, nabızla atmayan, tek taraflı olmayan ve nörolojik bulgu ya da iki kulak arasında işitme farkı olmayan çınlama için görüntüleme yapılmamasını önerir; çünkü bu durumlarda altta yatan yapısal bir sorun bulma olasılığı çok düşüktür [2, 3].

## "Yalnızca yaşlılarda olur"

Çınlama her yaşta görülür; gençlerde en sık neden gürültü maruziyetidir (konserler, kulaklık, iş gürültüsü). Yaşla sıklık artar, ancak 20'li ve 30'lu yaşlarda çınlama hiç de nadir değildir.

## "Sessizlik iyi gelir" / "Kulağımı korumalıyım"

Tam tersi. Sessizlikte çınlama tek sinyaldir ve bütün dikkati toplar; kulak tıkacıyla sessizlik yaratmak işitme sisteminin kazancını yükseltebilir, sesi öne çıkarabilir ve ses hassasiyetine zemin hazırlayabilir [4]. Koruma, gerçekten yüksek (85 desibel üstü) ortamlar içindir; lokanta, ofis ve ev için değil. Sessiz ortamlarda düşük düzeyde arka plan sesi önerilir.

## "Bir ilaç ya da takviye var"

Betahistin, ginkgo biloba ve çinkonun bağımsız derlemelerde plasebodan farkı gösterilmemiştir; kılavuzlar çınlama için takviye ya da ilaç önermez [5, 6]. "Doğal formül" ya da "klinik olarak kanıtlanmış" ifadeleri randomize çalışma anlamına gelmez. Ayrıntı için "Takviyeler ve ilaçlar" yazısına bakın.

## "Ses terapisi çınlamayı geçirir"

Rahatlatan arka plan sesi rahatlatıcıdır ve sessizlikte dikkati dağıtır; ancak büyük bir randomize çalışmada ses üreteçlerinin danışmanlığa ölçülebilir bir katkısı olmadı; sahte üreteçler gerçek olanlar kadar etkiliydi [7]. Çentikli müzik için çift kör çalışma olumsuz çıkmıştır. Ses, yardımcıdır; tedavi değil.

## "Kafein / şarap / tuz kesilirse geçer"

Bireysel tetikleyiciler vardır ve bir günlükle fark edilebilir; ancak genel olarak kafein ya da tuz kısıtlamasının çınlamayı azalttığına dair güvenilir kanıt yoktur. Kafeini aniden kesmek bazı kişilerde baş ağrısı ve sesi geçici olarak artırabilir. Uyku için öğleden sonra kafeinden kaçınmak ayrı ve mantıklı bir öneridir.

## "Ses hiç değişmeyecek, hayatım bitti"

Gerçek şudur: sesin düzeyi çoğu kişide yıllar içinde sabit kalır ya da azalır; sesle ilişki ise belirgin biçimde değişebilir. İnternet temelli BDT programını tamamlayanların yaklaşık yarısı sekiz haftada klinik olarak anlamlı düzelme bildirmiştir [8]. Sesin yok olması gerekmez; hayattaki yerinin küçülmesi yeter. Kendinize zarar verme düşünceleriniz varsa bunu kimseyle paylaşmadan taşımayın; 112'yi arayın ya da bir uzmana başvurun [3].`,
      en: `## "Nothing can be done, you have to get used to it"

Half true, half false. There is no treatment that removes the sound; but "getting used to it" is not something expected to happen by itself, it is a process that can be learned. According to the Cochrane review pooling 28 randomised trials, cognitive behavioural therapy can reduce the impact of tinnitus on quality of life [1]; CBT for insomnia, hearing aids and sound sensitivity programmes have evidence too. The sentence "nothing can be done" closes off routes that could help.

## "Tinnitus leads to deafness"

Tinnitus and hearing loss often go together; but the sound is not a sign that the loss is progressing. In most people, tinnitus does not signal that hearing loss is speeding up. A day when the sound is loud does not mean hearing got worse that day; loudness fluctuates with tiredness, stress and silence. Sudden or rapid hearing loss is a separate matter and needs assessment [2].

## "Something is wrong in my brain"

Tinnitus is mostly the product of a compensation process in the hearing pathways: increased gain in response to reduced input. That does not mean there is a disease in the brain; it is how the system works. Guidelines advise against imaging for tinnitus that is not pulsatile, not one-sided and without neurological findings or a hearing difference between the ears, because the chance of finding an underlying structural problem in those cases is very low [2, 3].

## "It only happens to the old"

Tinnitus occurs at every age; in young people the most common cause is noise exposure (concerts, earphones, work noise). Prevalence rises with age, but tinnitus in the twenties and thirties is not rare at all.

## "Silence helps" / "I must protect my ears"

The opposite. In silence the tinnitus is the only signal and gathers all attention; creating silence with earplugs can raise the gain of the hearing system, bring the sound forward and lay the ground for sound sensitivity [4]. Protection is for genuinely loud (over 85 decibel) settings; not for restaurants, offices and homes. In quiet settings low-level background sound is recommended.

## "There is a pill or supplement"

Betahistine, ginkgo biloba and zinc have been found no different from placebo in independent reviews; guidelines do not recommend supplements or medicines for tinnitus [5, 6]. "Natural formula" or "clinically proven" do not mean randomised trials. See the "Supplements and medicines" article for details.

## "Sound therapy cures tinnitus"

Sound enrichment is soothing and distracts attention in silence; but in a large randomised trial sound generators added nothing measurable to counselling, and placebo generators worked as well as real ones [7]. For notched music the double-blind trial was negative. Sound is a helper, not a treatment.

## "Cutting caffeine / wine / salt will make it go"

Individual triggers exist and can be spotted with a diary; but in general there is no reliable evidence that restricting caffeine or salt reduces tinnitus. Stopping caffeine abruptly can cause headache and temporarily increase the sound in some people. Avoiding caffeine after midday for sleep is a separate and sensible recommendation.

## "The sound will never change, my life is over"

The reality: the level of the sound stays the same or decreases over the years in most people; the relationship with it can change markedly. About half of those who completed an internet-based CBT programme reported clinically meaningful improvement at eight weeks [8]. The sound does not have to disappear; a smaller place in life is enough. If you have thoughts of harming yourself, do not carry them alone; call 112 or see a professional [3].`,
    },
    citations: ['fuller2020', 'tunkel2014', 'nice2020', 'juris2014', 'wegner2018', 'sereda2022', 'scherer2019', 'beukes2018'],
  },
];

export const ARTICLE_BY_SLUG: Record<string, Article> = Object.fromEntries(ARTICLES.map((a) => [a.slug, a]));
export const getArticle = (slug: string): Article | undefined => ARTICLE_BY_SLUG[slug];

export const ARTICLE_GROUPS: ArticleGroup[] = ['basics', 'sound', 'cbt', 'sleep', 'hearing', 'doctor'];
export const articlesByGroup = (g: ArticleGroup): Article[] => ARTICLES.filter((a) => a.group === g);
