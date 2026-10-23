/**
 * Mind modules: core CBT (Andersson/Kaldo → Beukes iCBT structure), ACT alternative (Hesser/Westin),
 * MBCT-lite (McKenna/Marks), CBT-I (Marks 2023) and hyperacusis (Jüris 2014 / Formby 2015).
 * Every unit in src/content/registry.ts whose route starts with /mind/ has an entry here.
 * Bodies are "markdown-lite": paragraphs separated by blank lines, "- " bullets, **bold** inline.
 * Tone: formal "siz", warm, no promises. Clinical content is adapted from the cited protocols; where the
 * app shortens a protocol (e.g. 15-minute body scan instead of 40) this is stated in the text.
 */
export type L = { tr: string; en: string };
export type SectionKind = 'text' | 'exercise' | 'tip' | 'warning';
export interface ModuleSection { heading: L; body: L; kind?: SectionKind }
export type PracticeKind = 'timer' | 'worksheet' | 'checklist' | 'exposure' | 'sleepWindow' | 'hierarchy' | 'thoughtRecord';
export interface PracticeStep extends L { seconds?: number }
export interface ModulePractice {
  kind: PracticeKind;
  minutes?: number;
  /** timer: ordered steps the PracticeTimer plays; seconds per step (default 60). */
  steps?: PracticeStep[];
  /** worksheet: prompts (one text input each); checklist: tick items; hierarchy: example items. */
  items?: L[];
}
export interface Module {
  id: string;
  title: L;
  intro: L;
  sections: ModuleSection[];
  practice?: ModulePractice;
  keyTakeaway: L;
  citations: string[];
}

export type ModuleTrack = 'cbt' | 'act' | 'mind' | 'cbti' | 'hyper';

// ---------------------------------------------------------------------------------------------
// CORE CBT (weeks 1–8)
// ---------------------------------------------------------------------------------------------
const CBT: Module[] = [
  {
    id: 'cbt.welcome',
    title: { tr: 'Hoş geldiniz: program nasıl işler', en: 'Welcome: how the programme works' },
    intro: {
      tr: 'Bu program, tinnitus için bilişsel davranışçı terapinin (BDT) internet üzerinden uygulanan ve randomize çalışmalarda sınanmış yapısını temel alır. Sekiz hafta boyunca her hafta iki üç kısa modül okuyacak, günlük kısa egzersizler yapacak ve ilerlemenizi izleyeceksiniz.',
      en: 'This programme follows the structure of internet-delivered cognitive behavioural therapy (CBT) for tinnitus that has been tested in randomised trials. Over eight weeks you will read two or three short modules a week, do brief daily exercises and track your progress.',
    },
    sections: [
      {
        heading: { tr: 'Bu programın amacı', en: 'What this programme aims to do' },
        body: {
          tr: `Bu programın amacı tinnitus sesini yok etmek değildir. Amaç, sesin hayatınızdaki yerini küçültmektir: dikkatinizi daha az çekmesi, uykunuzu daha az bozması, sizi daha az yormasıdır. Araştırmalar bunun mümkün olduğunu gösteriyor. Bir Cochrane derlemesinde 28 çalışma ve 2 733 katılımcı bir araya getirildiğinde, BDT'nin tinnitusun yaşam kalitesine etkisini azalttığı bulundu. Sesin kendisi çoğu kişide aynı kalsa da sesle ilişki değişebiliyor.

İngiltere'de yapılan bir çalışmada, bu programa benzer sekiz haftalık bir internet programını tamamlayanların yaklaşık yarısı, Tinnitus Fonksiyonel İndeksi'nde klinik olarak anlamlı sayılan 13 puanlık düşüşe ulaştı. Bu, herkeste aynı sonucun görüleceği anlamına gelmez; ancak düzenli uygulayan kişilerin önemli bir bölümünde belirgin fark oluştuğunu gösterir.`,
          en: `The aim of this programme is not to make the tinnitus sound disappear. The aim is to shrink the place it occupies in your life: for it to draw your attention less, disturb your sleep less and tire you less. Research shows this is possible. A Cochrane review pooling 28 trials and 2,733 participants found that CBT reduces the impact of tinnitus on quality of life. For most people the sound itself stays the same, but the relationship with it changes.

In a UK trial, about half of those who completed an eight-week internet programme similar to this one reached the 13-point drop on the Tinnitus Functional Index that counts as clinically meaningful. That does not mean everyone will see the same result, but it shows that a substantial share of people who practise regularly notice a real difference.`,
        },
      },
      {
        heading: { tr: 'Sekiz haftanın haritası', en: 'A map of the eight weeks' },
        body: {
          tr: `- **1. hafta:** Tinnitus nedir, beyin sesi neden fark eder, alışma (habituasyon) modeli. Derin gevşeme, 1. adım.
- **2. hafta:** Kısa gevşeme. Ses zenginleştirme: sessizlikten kaçınmak. Düşünce günlüğüne giriş.
- **3. hafta:** Uyku ilkeleri. Nefesle gevşeme.
- **4. hafta:** Olumsuz otomatik düşünceleri tanımak. Olumlu imgeleme. Fark eden gevşeme.
- **5. hafta:** Düşünceleri yeniden yapılandırma. Hızlı gevşeme.
- **6. hafta:** Sese bilinçli maruz kalma. Gevşemeyi gündelik hayata taşıma.
- **7. hafta:** Dikkati yönlendirme. Etkinlik planlama ve güvenlik davranışlarını azaltma.
- **8. hafta:** Geriye dönüşleri önleme. Kendi araç kutunuz.

Her hafta bir ana fikir, bir egzersiz ve bir uygulama görevi vardır. Modüller kısa tutulmuştur; asıl etki okumada değil, günlük uygulamada ortaya çıkar.`,
          en: `- **Week 1:** What tinnitus is, why the brain notices it, the habituation model. Deep relaxation, step 1.
- **Week 2:** Short relaxation. Sound enrichment: avoiding silence. Introducing the thought diary.
- **Week 3:** Sleep guidelines. Breathing-based relaxation.
- **Week 4:** Recognising negative automatic thoughts. Positive imagery. Differential relaxation.
- **Week 5:** Restructuring thoughts. Rapid relaxation.
- **Week 6:** Deliberate exposure to the sound. Taking relaxation into daily life.
- **Week 7:** Redirecting attention. Activity planning and reducing safety behaviours.
- **Week 8:** Preventing setbacks. Your own toolbox.

Each week has one main idea, one exercise and one practice task. The modules are kept short; the real effect comes from daily practice, not from reading.`,
        },
      },
      {
        heading: { tr: 'Nasıl çalışmalı', en: 'How to work with it' },
        kind: 'tip',
        body: {
          tr: `- Günde 15–30 dakika ayırın. Araştırmalardaki programlarda günlük gevşeme uygulaması 10–15 dakika, günde iki kez önerilir; tek seferle de başlayabilirsiniz.
- Modülleri sırayla izleyin. Her modül bir öncekinin üzerine kurulur.
- Egzersizleri tam yapmak, mükemmel yapmaktan önemlidir. Dikkatiniz dağıldığında sadece geri dönün.
- Günlük kısa kayıt (ses düzeyi, rahatsızlık, ruh hâli) ilerlemeyi görünür kılar. Tinnitus günden güne dalgalanır; haftalık eğilime bakın, tek bir güne değil.
- Zorlu bir gün programın bozulduğu anlamına gelmez. Kaldığınız yerden devam edin.`,
          en: `- Set aside 15–30 minutes a day. The trial programmes recommend 10–15 minutes of relaxation practice twice daily; you can start with once.
- Follow the modules in order. Each builds on the one before.
- Doing the exercises fully matters more than doing them perfectly. When your attention drifts, simply return.
- A short daily record (loudness, annoyance, mood) makes progress visible. Tinnitus fluctuates from day to day; look at the weekly trend, not at a single day.
- A hard day does not mean the programme has failed. Continue from where you left off.`,
        },
      },
      {
        heading: { tr: 'Bu programın sınırları', en: 'The limits of this programme' },
        kind: 'warning',
        body: {
          tr: `Bu program tıbbi değerlendirmenin yerini tutmaz. Tek taraflı veya ani başlayan tinnitus, nabızla eş zamanlı ses, baş dönmesi, işitmede ani düşüş ya da yüzde güçsüzlük gibi belirtiler varsa önce bir kulak burun boğaz uzmanına başvurun. Kendinize zarar verme düşünceleri yaşıyorsanız 112'yi arayın veya en yakın acil servise gidin; program bunu bekleyebilir, siz bekleyemezsiniz.`,
          en: `This programme does not replace medical assessment. If your tinnitus is one-sided or started suddenly, pulses with your heartbeat, comes with dizziness, a sudden drop in hearing or facial weakness, see an ear, nose and throat specialist first. If you are having thoughts of harming yourself, call 112 or go to the nearest emergency department; the programme can wait, you cannot.`,
        },
      },
      {
        heading: { tr: 'İlk görev', en: 'First task' },
        kind: 'exercise',
        body: {
          tr: `Aşağıdaki çalışma kâğıdında üç soruyu yanıtlayın. Yanıtlarınız yalnızca bu cihazda saklanır. Sekizinci haftada bunlara geri dönüp neyin değiştiğine birlikte bakacağız.`,
          en: `Answer the three questions in the worksheet below. Your answers stay on this device only. In week eight we will come back to them and look together at what has changed.`,
        },
      },
    ],
    practice: {
      kind: 'worksheet',
      minutes: 5,
      items: [
        { tr: 'Tinnitus şu anda hayatınızı en çok hangi alanda etkiliyor? (uyku, iş, dinlenme, ilişkiler…)', en: 'Which area of your life does tinnitus affect most right now? (sleep, work, rest, relationships…)' },
        { tr: 'Sekiz hafta sonra neyin farklı olmasını isterdiniz? Sesin yok olmasından başka bir şey yazın.', en: 'What would you like to be different in eight weeks? Write something other than the sound disappearing.' },
        { tr: 'Günün hangi saatinde 15 dakikayı bu programa ayırabilirsiniz?', en: 'At what time of day can you give 15 minutes to this programme?' },
      ],
    },
    keyTakeaway: {
      tr: 'Hedef sessizlik değil, sesin hayatınızdaki yerinin küçülmesidir; bunu belirleyen de okuduklarınız değil, günlük uygulamadır.',
      en: 'The goal is not silence but a smaller place for the sound in your life; what decides that is daily practice, not reading.',
    },
    citations: ['beukes2018', 'fuller2020', 'nice2020'],
  },
  {
    id: 'cbt.psychoeducation',
    title: { tr: 'Tinnitus ve beyin', en: 'Tinnitus and the brain' },
    intro: {
      tr: 'Tinnitusu anlamak, onunla ilişkinizi değiştirmenin ilk adımıdır. Bu modül sesin nereden geldiğini, beynin onu neden sürekli fark ettiğini ve alışmanın (habituasyon) nasıl gerçekleştiğini anlatır.',
      en: 'Understanding tinnitus is the first step to changing your relationship with it. This module explains where the sound comes from, why the brain keeps noticing it and how habituation happens.',
    },
    sections: [
      {
        heading: { tr: 'Ses nereden geliyor', en: 'Where the sound comes from' },
        body: {
          tr: `Tinnitus, dış ortamda bir ses kaynağı olmadan duyulan sestir. Yetişkinlerin yaklaşık yüzde 10–15'i bunu yaşar; daha küçük bir bölümü için rahatsız edicidir. Çoğu kişide başlangıç noktası iç kulaktır: gürültü, yaş, bazı ilaçlar ya da başka nedenlerle iç kulaktaki duyu hücrelerinin bir bölümü beyne daha az sinyal gönderir. İşitme sistemi bu azalmayı dengelemek için kendi "kazancını" artırır. Sonuç, dışarıdan gelmeyen ama gerçek olarak duyulan bir sestir.

Bu nedenle tinnitus kulakta değil, çoğunlukla işitme yollarında ve beyinde üretilir. Bu bilgi önemlidir: sesi duyuyor olmanız kulağınızda ilerleyen bir hasar olduğu anlamına gelmez. Değerlendirmeniz tamamlandıysa ve bir kulak burun boğaz uzmanı başka bir neden bulmadıysa, ses zararsızdır; rahatsız edicidir ama tehlikeli değildir.`,
          en: `Tinnitus is sound heard without an external source. Around 10–15 per cent of adults experience it; for a smaller share it is bothersome. In most people the starting point is the inner ear: because of noise, age, certain medicines or other causes, some of the sensory cells send fewer signals to the brain. The hearing system raises its own "gain" to compensate. The result is a sound that does not come from outside but is heard as real.

So tinnitus is mostly generated not in the ear but along the hearing pathways and in the brain. This matters: hearing the sound does not mean there is ongoing damage in your ear. If your assessment is complete and an ENT specialist has found no other cause, the sound is harmless; unpleasant, but not dangerous.`,
        },
      },
      {
        heading: { tr: 'Beyin neden bu sesi bırakmıyor', en: 'Why the brain will not let the sound go' },
        body: {
          tr: `Beyniniz her saniye binlerce sinyal alır ve neredeyse hepsini süzer. Buzdolabının uğultusunu, üzerinizdeki giysinin temasını, kendi nefesinizi çoğu zaman fark etmezsiniz. Bir sinyalin süzgeçten geçip bilince ulaşması için beynin onu "önemli" olarak işaretlemesi gerekir.

Tinnitus genellikle iki nedenle önemli işaretlenir. Birincisi yeniliktir: beklenmedik bir sinyal dikkat çeker. İkincisi tehdit değeridir: "Bu ses ne? Kötüleşecek mi? Hiç geçmeyecek mi?" gibi sorular, sesi kaygı ve tehlike ile ilişkilendirir. Beyin, tehlikeyle ilişkilendirdiği sinyalleri filtrelemez; aksine onlara öncelik verir. Böylece bir döngü oluşur: ses fark edilir, kaygı artar, kaygı sesi daha önemli kılar, ses daha çok fark edilir.

Bu döngü sesin kendisini değil, sesin ne kadar duyulduğunu belirler. Aynı ses düzeyinde bir kişi sesi günün çoğunda fark etmezken bir başkası sürekli duyabilir. Fark, kulakta değil, beynin sinyale verdiği anlamdadır.`,
          en: `Your brain receives thousands of signals every second and filters almost all of them. You usually do not notice the hum of the fridge, the touch of your clothes or your own breathing. For a signal to pass the filter and reach awareness, the brain has to tag it as "important".

Tinnitus usually gets tagged for two reasons. The first is novelty: an unexpected signal draws attention. The second is threat value: questions such as "What is this sound? Will it get worse? Will it never stop?" link the sound with anxiety and danger. The brain does not filter signals it has linked with danger; it prioritises them. A loop forms: the sound is noticed, anxiety rises, anxiety makes the sound more important, the sound is noticed more.

This loop does not determine the sound itself but how much of it is heard. At the same sound level, one person may not notice it for most of the day while another hears it constantly. The difference lies not in the ear but in the meaning the brain gives the signal.`,
        },
      },
      {
        heading: { tr: 'Alışma: habituasyon modeli', en: 'Getting used to it: the habituation model' },
        body: {
          tr: `Habituasyon, beynin tekrar eden ve zararsız olduğu anlaşılan bir sinyale verdiği tepkiyi azaltmasıdır. Yeni bir eve taşındığınızda sokaktan gelen sesleri ilk geceler duyarsınız; haftalar içinde duymaz olursunuz. Ses değişmemiştir; beynin ona verdiği önem değişmiştir.

Tinnitusta habituasyon iki düzeyde olur. Önce **tepkiye alışma**: ses hâlâ duyulur ama kaygı, öfke ve gerginlik azalır. Sonra **algıya alışma**: ses günün büyük kısmında fark edilmez olur, ancak dikkat ona yöneltildiğinde hâlâ oradadır. Çoğu kişi için ikinci aşama aylar alır ve birinci aşamadan geçer.

Habituasyonu zorlaştıran üç şey vardır: sesi tehlikeli saymak, sesi sürekli kontrol etmek (dinleyip ölçmek) ve sessizlikten ya da sesten kaçınmak. Programın geri kalanı tam olarak bu üçünü hedefler: düşüncelerle çalışmak, dikkati yönlendirmek ve kaçınmayı azaltmak.`,
          en: `Habituation is the brain reducing its response to a signal that repeats and turns out to be harmless. When you move to a new home you hear the street during the first nights; within weeks you stop hearing it. The sound has not changed; the importance the brain gives it has.

In tinnitus, habituation happens on two levels. First **habituation of reaction**: the sound is still heard but anxiety, anger and tension drop. Then **habituation of perception**: the sound goes unnoticed for most of the day, though it is still there when attention is turned to it. For most people the second stage takes months and passes through the first.

Three things make habituation harder: treating the sound as dangerous, constantly checking it (listening and measuring) and avoiding silence or sound. The rest of the programme targets exactly these three: working with thoughts, directing attention and reducing avoidance.`,
        },
      },
      {
        heading: { tr: 'Sık sorulan sorular', en: 'Frequently asked questions' },
        body: {
          tr: `- **Ses zamanla kötüleşir mi?** Çoğu kişide ses düzeyi yıllar içinde sabit kalır veya azalır. Dalgalanmalar normaldir ve genellikle yorgunluk, stres, gürültü ya da uykusuzlukla ilişkilidir.
- **Sesi duymam kulağımın bozulduğu anlamına mı gelir?** Hayır. İşitme kaybı tinnitusla sık birlikte görülür ama ses, kaybın ilerlediğinin göstergesi değildir. İşitmenizdeki değişiklikleri odyolojik değerlendirmeyle izleyin.
- **Ses bazen neden daha gürültülü?** Sessiz ortamlar, yorgunluk, kaygı ve dikkatin sese dönmesi sesi daha belirgin kılar. Düzey aynı olsa da fark ediş değişir.
- **Sese dikkat etmemek mümkün mü?** Zorla dikkat etmemeye çalışmak dikkati artırır. Programda dikkatin başka yere nasıl yöneltileceğini çalışacaksınız.`,
          en: `- **Will the sound get worse over time?** In most people the level stays stable or decreases over the years. Fluctuations are normal and usually linked to tiredness, stress, noise or lack of sleep.
- **Does hearing the sound mean my ear is failing?** No. Hearing loss often accompanies tinnitus, but the sound is not a sign that the loss is progressing. Monitor changes in your hearing with audiological assessment.
- **Why is the sound sometimes louder?** Quiet surroundings, tiredness, anxiety and attention turning to the sound make it more prominent. The level may be the same; the noticing changes.
- **Is it possible not to pay attention to it?** Forcing yourself not to pay attention increases attention. In the programme you will practise how to direct attention elsewhere.`,
        },
      },
      {
        heading: { tr: 'Kendi döngünüzü çizin', en: 'Draw your own loop' },
        kind: 'exercise',
        body: {
          tr: `Aşağıdaki çalışma kâğıdında, sesi fark ettiğiniz tipik bir anı adım adım yazın: ortam, ilk düşünce, beden tepkisi, yaptığınız şey. Bu döngüyü görmek, ilerleyen haftalarda hangi halkaya müdahale edeceğinizi gösterir.`,
          en: `In the worksheet below, write step by step a typical moment when you notice the sound: the setting, the first thought, the body reaction, what you do. Seeing this loop shows you which link you will work on in the coming weeks.`,
        },
      },
    ],
    practice: {
      kind: 'worksheet',
      minutes: 6,
      items: [
        { tr: 'Sesi en çok hangi ortamda fark ediyorsunuz?', en: 'In which setting do you notice the sound most?' },
        { tr: 'O anda aklınızdan geçen ilk düşünce ne oluyor?', en: 'What is the first thought that goes through your mind then?' },
        { tr: 'Bedeninizde ne hissediyorsunuz? (gerginlik, kalp çarpıntısı, yorgunluk…)', en: 'What do you feel in your body? (tension, racing heart, tiredness…)' },
        { tr: 'Sonra ne yapıyorsunuz? (dinliyorum, ortamı değiştiriyorum, kulağımı kapatıyorum…)', en: 'What do you do next? (I listen, I change the room, I cover my ear…)' },
      ],
    },
    keyTakeaway: {
      tr: 'Tinnitus kulakta değil beyinde "önemli" işaretlenen bir sinyaldir; alışma, bu işareti kaldırmakla başlar.',
      en: 'Tinnitus is a signal tagged as "important" in the brain, not the ear; habituation begins by removing that tag.',
    },
    citations: ['fuller2020', 'tunkel2014', 'cima2019'],
  },
  {
    id: 'cbt.relax1',
    title: { tr: 'Derin gevşeme 1: kas gevşetme', en: 'Deep relaxation 1: muscle relaxation' },
    intro: {
      tr: 'Uygulamalı gevşeme, altı adımda öğrenilen bir beceridir. İlk adım ilerleyici kas gevşetmedir: kas gruplarını sırayla gerip bırakarak gerginlik ile gevşeme arasındaki farkı bedeninize öğretirsiniz. Bu adım yaklaşık 15 dakika sürer ve iki hafta boyunca günde iki kez önerilir.',
      en: 'Applied relaxation is a skill learned in six steps. The first is progressive muscle relaxation: tensing and releasing muscle groups in turn teaches your body the difference between tension and release. This step takes about 15 minutes and is recommended twice a day for two weeks.',
    },
    sections: [
      {
        heading: { tr: 'Gevşemenin tinnitusla ilgisi', en: 'What relaxation has to do with tinnitus' },
        body: {
          tr: `Tinnitus ve beden gerginliği birbirini besler. Ses fark edildiğinde omuzlar kalkar, çene sıkılır, nefes sığlaşır; bu gerginlik sinir sistemini uyanık tutar ve beyin sesi daha önemli sayar. Gevşeme bu döngüyü ters yönden çözer: beden sakinleştiğinde beyin tehlike sinyalini düşürür ve ses arka plana çekilmeye başlar.

Öst'ün uygulamalı gevşeme protokolü, tinnitus için geliştirilen internet temelli BDT programlarının omurgasıdır; on beş çekirdek modülün altısı bu yöntemin adımlarıdır. Yöntemin amacı, bir gevşeme kasetini dinlemek değil, istediğiniz anda 20–30 saniye içinde gevşeyebilmeyi öğrenmektir. Bu modül o yolun başlangıcıdır.`,
          en: `Tinnitus and body tension feed each other. When the sound is noticed, shoulders rise, the jaw tightens, breathing gets shallow; this tension keeps the nervous system alert and the brain counts the sound as more important. Relaxation unwinds the loop from the other end: when the body settles, the brain lowers the danger signal and the sound starts to recede.

Öst's applied relaxation protocol is the backbone of internet-based CBT programmes for tinnitus; six of the fifteen core modules are its steps. The goal is not to listen to a relaxation recording but to learn to relax within 20–30 seconds whenever you choose. This module is the start of that path.`,
        },
      },
      {
        heading: { tr: 'Hazırlık', en: 'Preparation' },
        kind: 'tip',
        body: {
          tr: `- Rahat bir sandalyeye oturun ya da uzanın. Gözlerinizi kapatın veya bir noktaya yumuşakça bakın.
- Her kas grubunu **5–7 saniye** gerin; ağrıtacak kadar değil, gerginliği belirgin hissedecek kadar. Sonra bir anda bırakın ve **15–20 saniye** gevşemenin yayılmasını izleyin.
- Nefesi tutmayın. Gererken normal nefes alın; bırakırken nefesi yavaşça verin.
- Ağrılı veya yaralı bir bölgeyi germeyin; o bölgeyi atlayın ya da yalnızca hayal edin.
- Tinnitus sesi egzersiz sırasında daha belirgin gelebilir. Bu normaldir ve zamanla azalır; sesi engellemeye çalışmadan devam edin.`,
          en: `- Sit in a comfortable chair or lie down. Close your eyes or rest them softly on a point.
- Tense each muscle group for **5–7 seconds**; not to the point of pain, just enough to feel the tension clearly. Then let go all at once and follow the release spreading for **15–20 seconds**.
- Do not hold your breath. Breathe normally while tensing; breathe out slowly as you release.
- Do not tense a painful or injured area; skip it or only imagine it.
- The tinnitus sound may feel more prominent during the exercise. This is normal and lessens with time; continue without trying to block the sound.`,
        },
      },
      {
        heading: { tr: 'Sıra', en: 'The sequence' },
        kind: 'exercise',
        body: {
          tr: `Zamanlayıcı aşağıdaki sırayı adım adım yürütür. Her adımda önce gerin, sonra bırakın. Sırası: eller ve ön kollar, üst kollar, alın, gözler ve burun, çene ve dil, boyun, omuzlar, göğüs ve nefes, karın, sırt, kalçalar ve uyluklar, baldırlar, ayaklar. Sonunda bütün bedeni bir kez daha tarayıp kalan gerginliği bırakın.

İlk hafta iki kez, günde iki kere uygulayın. Her uygulamadan sonra 0–10 arasında ne kadar gevşediğinizi aklınızdan not edin; rakam değil, yön önemlidir.`,
          en: `The timer walks through the sequence below step by step. In each step first tense, then release. The order: hands and forearms, upper arms, forehead, eyes and nose, jaw and tongue, neck, shoulders, chest and breathing, abdomen, back, hips and thighs, calves, feet. At the end scan the whole body once more and release any remaining tension.

Practise twice daily during the first two weeks. After each session note in your mind how relaxed you feel on 0–10; the direction matters, not the number.`,
        },
      },
      {
        heading: { tr: 'Sık karşılaşılan zorluklar', en: 'Common difficulties' },
        body: {
          tr: `- **Dikkatim dağılıyor.** Bu, egzersizin bir parçasıdır. Fark ettiğiniz anda hangi kasta kaldığınıza dönün.
- **Gevşedikçe sesi daha çok duyuyorum.** Dış sesler azaldığında iç ses öne çıkar. Haftalar içinde bu etki azalır. İsterseniz egzersizi düşük düzeyde bir ortam sesiyle yapabilirsiniz.
- **Uyuyakalıyorum.** Gece yapıyorsanız sorun değil; gündüz yapıyorsanız oturarak uygulayın. Amaç beceriyi uyanıkken öğrenmektir.
- **Vaktim yok.** 15 dakika bulamadığınız günlerde yalnızca üst beden (eller, kollar, yüz, omuzlar) ile 6–7 dakikalık kısa sürüm yapın. Düzen, süreden önemlidir.`,
          en: `- **My mind wanders.** That is part of the exercise. The moment you notice, return to the muscle you were on.
- **The more I relax, the more I hear the sound.** When outside sounds fall away the inner sound comes forward. This effect fades over the weeks. You can do the exercise with low-level background sound if you wish.
- **I fall asleep.** At night that is fine; during the day practise sitting up. The aim is to learn the skill while awake.
- **I have no time.** On days without 15 minutes do a 6–7 minute short version with the upper body only (hands, arms, face, shoulders). Regularity matters more than length.`,
        },
      },
    ],
    practice: {
      kind: 'timer',
      minutes: 15,
      steps: [
        { tr: 'Yerleşin. Gözlerinizi kapatın, üç yavaş nefes alın. Bedeninizin sandalyeye ya da yatağa verdiği ağırlığı fark edin.', en: 'Settle in. Close your eyes, take three slow breaths. Notice the weight your body gives to the chair or bed.', seconds: 45 },
        { tr: 'Eller ve ön kollar: iki yumruğunuzu sıkın, ön kollarda gerginliği hissedin… ve bırakın. Parmakların açıldığını, sıcaklığın yayıldığını izleyin.', en: 'Hands and forearms: clench both fists, feel the tension in the forearms… and release. Watch the fingers open and warmth spread.', seconds: 40 },
        { tr: 'Üst kollar: dirsekleri bükün, pazularınızı sıkın… ve bırakın. Kolların ağırlaştığını fark edin.', en: 'Upper arms: bend the elbows, tighten the biceps… and release. Notice the arms grow heavy.', seconds: 40 },
        { tr: 'Alın: kaşlarınızı yukarı kaldırın, alnı kırıştırın… ve bırakın. Alın düz ve serin.', en: 'Forehead: raise the eyebrows, wrinkle the forehead… and release. The forehead smooth and cool.', seconds: 40 },
        { tr: 'Gözler ve burun: gözleri sıkıca yumun, burnu kırıştırın… ve bırakın. Göz kapakları hafif.', en: 'Eyes and nose: squeeze the eyes shut, wrinkle the nose… and release. Eyelids light.', seconds: 40 },
        { tr: 'Çene ve dil: dişleri hafifçe sıkın, dili damağa bastırın… ve bırakın. Dudaklar aralık, çene gevşek.', en: 'Jaw and tongue: press the teeth lightly together, push the tongue to the palate… and release. Lips parted, jaw loose.', seconds: 40 },
        { tr: 'Boyun: çeneyi hafifçe göğse doğru çekin, boynun arkasında gerginliği hissedin… ve bırakın. Başın rahatça dengelendiğini fark edin.', en: 'Neck: draw the chin gently towards the chest, feel the tension at the back of the neck… and release. Notice the head balance easily.', seconds: 40 },
        { tr: 'Omuzlar: omuzları kulaklara doğru kaldırın… ve düşürün. Omuzlar aşağı, geniş ve ağır.', en: 'Shoulders: lift the shoulders towards the ears… and drop them. Shoulders down, wide and heavy.', seconds: 40 },
        { tr: 'Göğüs ve nefes: derin bir nefes alın, tutun, göğüste gerginliği hissedin… ve yavaşça verin. Nefes kendi ritmine dönsün.', en: 'Chest and breathing: take a deep breath, hold it, feel the tension in the chest… and let it out slowly. Let the breath return to its own rhythm.', seconds: 45 },
        { tr: 'Karın: karın kaslarını sertleştirin… ve bırakın. Her nefesle karın yumuşakça iner kalkar.', en: 'Abdomen: tighten the stomach muscles… and release. With each breath the belly rises and falls softly.', seconds: 40 },
        { tr: 'Sırt: kürek kemiklerini birbirine yaklaştırın… ve bırakın. Sırt sandalyeye yaslanıyor.', en: 'Back: draw the shoulder blades together… and release. The back rests into the chair.', seconds: 40 },
        { tr: 'Kalçalar ve uyluklar: kalça ve uyluk kaslarını sıkın… ve bırakın. Bacaklar ağır.', en: 'Hips and thighs: tighten the hip and thigh muscles… and release. Legs heavy.', seconds: 40 },
        { tr: 'Baldırlar: ayak parmaklarını yüzünüze doğru çekin, baldırları gerin… ve bırakın.', en: 'Calves: pull the toes towards your face, tense the calves… and release.', seconds: 40 },
        { tr: 'Ayaklar: parmakları kıvırın, ayak tabanını gerin… ve bırakın. Ayaklar sıcak ve gevşek.', en: 'Feet: curl the toes, tense the soles… and release. Feet warm and loose.', seconds: 40 },
        { tr: 'Bütün bedeni baştan ayağa tarayın. Kalan bir gerginlik varsa nefes verirken bırakın. Birkaç nefes boyunca bu durumda kalın.', en: 'Scan the whole body from head to toe. If any tension remains, release it on an out-breath. Stay like this for a few breaths.', seconds: 90 },
        { tr: 'Üçten geriye sayın: üç, parmaklarınızı kıpırdatın; iki, derin bir nefes; bir, gözlerinizi açın.', en: 'Count back from three: three, move your fingers; two, a deep breath; one, open your eyes.', seconds: 30 },
      ],
    },
    keyTakeaway: {
      tr: 'Kas gevşetme, bedene gerginlik ile gevşeme arasındaki farkı öğretir; iki hafta boyunca günde iki kez uygulandığında sonraki hızlı gevşeme adımlarının temelini kurar.',
      en: 'Muscle relaxation teaches the body the difference between tension and release; practised twice daily for two weeks, it lays the foundation for the faster steps that follow.',
    },
    citations: ['ost1987', 'beukes2018'],
  },
  {
    id: 'cbt.relax2',
    title: { tr: 'Derin gevşeme 2: yalnızca bırakma', en: 'Deep relaxation 2: release only' },
    intro: {
      tr: 'İkinci adımda germe aşamasını kaldırıyoruz. Artık kasları sırayla yalnızca bırakacaksınız; gerginliği hissetmek için önce germeye gerek kalmaz. Süre 15 dakikadan 5–7 dakikaya iner.',
      en: 'In the second step we drop the tensing phase. Now you will only release the muscles in turn; you no longer need to tense first to feel the tension. The time comes down from 15 minutes to 5–7 minutes.',
    },
    sections: [
      {
        heading: { tr: 'Neden germeyi bırakıyoruz', en: 'Why we drop the tensing' },
        body: {
          tr: `İlk haftalarda germe ve bırakma, bedene iki durumu ayırt etmeyi öğretti. Şimdi beden bu farkı biliyor; gevşemeyi doğrudan çağırabilir. Öst'ün protokolünde bu adım "yalnızca bırakma" (release-only) olarak adlandırılır ve bir iki hafta sürer. Amaç, gevşemeyi gittikçe daha az zamanda ve daha az "tören" ile üretebilmektir; sonunda bir sözcük ve bir nefesle.

Bu adımı denediğinizde gevşeme ilk adımdakinden daha sığ gelebilir. Bu beklenen bir durumdur; birkaç gün içinde derinleşir. Yeterince gevşeyemediğinizi düşündüğünüz günlerde ilk adıma dönmek yerine bu adımı tekrar edin.`,
          en: `In the first weeks, tensing and releasing taught the body to tell the two states apart. The body now knows that difference and can call up relaxation directly. In Öst's protocol this step is called "release only" and lasts one to two weeks. The aim is to produce relaxation in less and less time with less and less "ceremony"; eventually with one word and one breath.

When you try this step the relaxation may feel shallower than in step one. That is expected; it deepens within a few days. On days when you feel you did not relax enough, repeat this step rather than going back to step one.`,
        },
      },
      {
        heading: { tr: 'Nasıl yapılır', en: 'How to do it' },
        kind: 'exercise',
        body: {
          tr: `Oturun; sırtınız desteklensin, ayaklar yerde. Gözleri kapatın. Nefesinize birkaç saniye eşlik edin. Sonra dikkatinizi sırayla her kas grubuna götürün ve her nefes verişte o bölgeyi "bırakın": alın, gözler, çene, boyun, omuzlar, kollar, eller, göğüs, karın, sırt, bacaklar, ayaklar. Her bölgede 20–30 saniye kalın.

Bir bölgede gerginlik hissederseniz onu zorla çözmeye çalışmayın. Gerginliğin orada olduğunu fark edin ve nefes verirken yumuşamasına izin verin. Gevşeme bir yapma değil, bırakma eylemidir.

Son bir dakikada bütün bedeni bir bütün olarak hissedin. Hazır olduğunuzda gözlerinizi açın ve birkaç saniye gevşek kalarak oturun.`,
          en: `Sit with your back supported and feet on the floor. Close your eyes. Follow your breath for a few seconds. Then take your attention to each muscle group in turn and "release" that area on each out-breath: forehead, eyes, jaw, neck, shoulders, arms, hands, chest, abdomen, back, legs, feet. Stay 20–30 seconds in each area.

If you feel tension somewhere, do not try to force it out. Notice that it is there and let it soften as you breathe out. Relaxation is not something you do; it is something you allow.

In the final minute feel the whole body as one. When ready, open your eyes and sit for a few seconds staying loose.`,
        },
      },
      {
        heading: { tr: 'Ne zaman ve ne sıklıkta', en: 'When and how often' },
        kind: 'tip',
        body: {
          tr: `- Günde iki kez, 5–7 dakika. Sabah kalkınca ve akşam işten dönünce iyi iki zaman dilimidir.
- Farklı yerlerde deneyin: masada, otobüste, bekleme salonunda. Gevşemenin yalnızca yatakta olmadığını beden öğrensin.
- Her uygulamadan önce ve sonra gerginliğinizi 0–10 arasında puanlayın. Birkaç gün sonra başlangıç puanlarının da düştüğünü görebilirsiniz.
- Tinnitus sesini uygulama sırasında duymanız beklenir. Ses sizi rahatsız ettiğinde onu bir bölge gibi ele alın: sesi fark edin, nefes verin, bir sonraki bölgeye geçin.`,
          en: `- Twice a day, 5–7 minutes. On waking and after coming home from work are two good slots.
- Try different places: at your desk, on the bus, in a waiting room. Let the body learn that relaxation is not only for the bed.
- Before and after each session rate your tension 0–10. After a few days you may see the starting scores fall too.
- Expect to hear the tinnitus during practice. When it bothers you, treat it like one more area: notice the sound, breathe out, move on to the next area.`,
        },
      },
    ],
    practice: {
      kind: 'timer',
      minutes: 7,
      steps: [
        { tr: 'Oturun, gözleri kapatın. Nefesinizi izleyin; değiştirmeyin.', en: 'Sit, close your eyes. Follow the breath; do not change it.', seconds: 30 },
        { tr: 'Alın ve gözler: her nefes verişte yumuşasın.', en: 'Forehead and eyes: soften on each out-breath.', seconds: 30 },
        { tr: 'Çene ve dil: dişler ayrık, dil gevşek.', en: 'Jaw and tongue: teeth apart, tongue loose.', seconds: 30 },
        { tr: 'Boyun ve omuzlar: omuzların kendi ağırlığıyla düştüğünü izleyin.', en: 'Neck and shoulders: watch the shoulders drop under their own weight.', seconds: 40 },
        { tr: 'Kollar ve eller: parmak uçlarına kadar ağır ve sıcak.', en: 'Arms and hands: heavy and warm to the fingertips.', seconds: 40 },
        { tr: 'Göğüs ve karın: nefes kendi kendine iner kalkar.', en: 'Chest and abdomen: the breath rises and falls by itself.', seconds: 40 },
        { tr: 'Sırt: sandalyeye yaslanır, yumuşar.', en: 'Back: rests into the chair, softens.', seconds: 30 },
        { tr: 'Bacaklar ve ayaklar: yere doğru ağırlaşır.', en: 'Legs and feet: grow heavy towards the floor.', seconds: 40 },
        { tr: 'Bütün beden tek bir gevşek bütün. Kalan gerginlikleri nefesle bırakın.', en: 'The whole body one loose whole. Release any remaining tension with the breath.', seconds: 90 },
        { tr: 'Gözlerinizi açın; birkaç saniye gevşek kalarak oturun.', en: 'Open your eyes; sit a few seconds staying loose.', seconds: 20 },
      ],
    },
    keyTakeaway: {
      tr: 'Germeyi bırakıp yalnızca bırakarak gevşemek, beceriyi 15 dakikadan 5–7 dakikaya indirir; hedef, sonunda bir nefesle gevşeyebilmektir.',
      en: 'Dropping the tensing and relaxing by release alone brings the skill from 15 minutes to 5–7; the goal is eventually to relax in a single breath.',
    },
    citations: ['ost1987', 'beukes2018'],
  },
