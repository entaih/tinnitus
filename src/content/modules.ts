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
  {
    id: 'cbt.soundEnrichment',
    title: { tr: 'Ses zenginleştirme: sessizlikten kaçınmak', en: 'Sound enrichment: avoiding silence' },
    intro: {
      tr: 'Sessiz bir odada tinnitus tek sestir ve bütün dikkati toplar. Düşük düzeyde, hoş bir ortam sesi, tinnitusun zemine karışmasına yardımcı olur. Bu modül ses zenginleştirmenin ne olduğunu, neyin işe yaradığını ve neyin yaramadığını anlatır.',
      en: 'In a silent room tinnitus is the only sound and gathers all attention. A low-level, pleasant background sound helps the tinnitus blend into the ground. This module explains what sound enrichment is, what works and what does not.',
    },
    sections: [
      {
        heading: { tr: 'Zemin ile şekil', en: 'Figure and ground' },
        body: {
          tr: `Beyin sesleri birbirine göre algılar. Tamamen sessiz bir ortamda zayıf bir ses bile "şekil" olur; arka planda başka sesler olduğunda aynı ses "zemine" karışır. Tinnitusun gece ya da sessiz odada daha gürültülü gelmesinin nedeni budur: ses artmamıştır, karşılaştırma noktası kaybolmuştur.

Ses zenginleştirme, günün sessiz bölümlerine düşük düzeyde ve nötr bir ses eklemektir: vantilatör, yağmur, dere, pembe gürültü, hafif bir müzik. Kılavuzlar bunu bir seçenek olarak önerir; Cochrane derlemesi tek başına ses terapisinin kanıt düzeyini düşük bulur ve danışmanlıkla birlikte kullanılmasını önerir. Bu programda ses, BDT'nin yerine değil, yanına konur.`,
          en: `The brain perceives sounds relative to each other. In complete silence even a faint sound becomes the "figure"; with other sounds in the background the same sound blends into the "ground". That is why tinnitus seems louder at night or in a quiet room: the sound has not increased, the reference point has disappeared.

Sound enrichment means adding a low-level, neutral sound to the quiet parts of the day: a fan, rain, a stream, pink noise, soft music. Guidelines list it as an option; the Cochrane review rates the evidence for sound therapy alone as low and advises using it alongside counselling. In this programme sound sits beside CBT, not in place of it.`,
        },
      },
      {
        heading: { tr: 'Karışma noktası: maskelemek değil, karıştırmak', en: 'The mixing point: blending, not masking' },
        body: {
          tr: `En önemli kural ses düzeyidir. Ses, tinnitusu tamamen örtmemelidir. Düzeyi, tinnitus ile dış sesin **karışmaya başladığı** noktanın hemen altına ayarlayın: ikisini de duyarsınız ama tinnitus artık yalnız değildir. Buna karışma noktası denir.

Neden tamamen örtmüyoruz? Tinnitusu her sessizlikte örtmek, beynin ona alışmasını engeller; ses her ortaya çıktığında yeni bir olay gibi algılanır. Karışma noktasının altında kalmak, beynin sese güvenli bir bağlamda alışmasına izin verir. Ayrıca yüksek ses işitmeyi yorar ve ses hassasiyetini artırabilir.

Uygulamanın Sesler bölümündeki "karışma noktası" aracı bu düzeyi birlikte bulmanıza yardımcı olur. Düzeyi bulduktan sonra ayarı değiştirmeden bırakın; sesi "yeterince örtüyor mu" diye tekrar tekrar kontrol etmek, dikkati yeniden tinnitusa çeker.`,
          en: `The most important rule is the level. The sound should not cover the tinnitus completely. Set it just below the point where the tinnitus and the outside sound **begin to blend**: you hear both, but the tinnitus is no longer alone. This is called the mixing point.

Why not cover it fully? Masking the tinnitus every time it is quiet stops the brain from habituating to it; each time it reappears it is treated as a new event. Staying below the mixing point lets the brain get used to the sound in a safe context. Loud sound also tires the hearing and can increase sound sensitivity.

The "mixing point" tool in the Sounds section helps you find this level. Once found, leave it alone; repeatedly checking whether it "covers enough" draws attention back to the tinnitus.`,
        },
      },
      {
        heading: { tr: 'Ne zaman, ne kadar', en: 'When and how much' },
        kind: 'tip',
        body: {
          tr: `- Sessiz anlarda kullanın: okurken, çalışırken, uykuya dalarken. Gürültülü ortamda gerek yoktur.
- Günde toplam iki saatten başlayıp mümkünse daha uzun süreye çıkın; programda günlük hedef tinnitus profilinize göre ayarlanır.
- Gece için hoparlör ya da yastık hoparlörü kulaklıktan iyidir; ses sabit kalsın, aniden kesilmesin. Uyku zamanlayıcısı en az 90 dakika olsun.
- Sesi sevin: rahatsız eden bir ses işe yaramaz. Doğa sesleri ve gürültü türleri arasında sonuç farkı gösterilmemiştir; tercihiniz belirleyicidir.
- Kulaklıkla kullanıyorsanız ses düzeyi sınırını açık tutun ve günde birkaç saatle sınırlayın.`,
          en: `- Use it in quiet moments: reading, working, falling asleep. In noisy surroundings there is no need.
- Start from about two hours a day in total and extend if you can; the programme sets a daily target based on your tinnitus profile.
- At night a room or pillow speaker is better than earphones; keep the sound steady, with no sudden cut-off. Set the sleep timer to at least 90 minutes.
- Choose a sound you like: an irritating sound does not help. No outcome difference has been shown between nature sounds and noise types; your preference decides.
- If you use earphones, keep the volume limit on and restrict use to a few hours a day.`,
        },
      },
      {
        heading: { tr: 'Kaçınılması gerekenler', en: 'What to avoid' },
        kind: 'warning',
        body: {
          tr: `- Tam sessizlik: kulak tıkacı ile uyumak ya da sessiz odada uzun süre kalmak tinnitusu öne çıkarır ve ses hassasiyetini artırabilir.
- Sesi gün boyu yüksek düzeyde açık tutmak: işitme için risk oluşturur ve alışmayı geciktirir.
- "Tinnitusu tedavi eden ses" vaadiyle satılan uygulamalar ve kayıtlar: ses zenginleştirme bir rahatlatma aracıdır; tek başına sesi azalttığına dair güvenilir kanıt yoktur.`,
          en: `- Complete silence: sleeping with earplugs or spending long periods in a silent room brings tinnitus forward and can increase sound sensitivity.
- Keeping sound on loud all day: it risks hearing and delays habituation.
- Apps and recordings sold as "sounds that cure tinnitus": sound enrichment is a comfort tool; there is no reliable evidence that it reduces the sound on its own.`,
        },
      },
      {
        heading: { tr: 'Haftalık görev', en: 'This week\'s task' },
        kind: 'exercise',
        body: {
          tr: `Aşağıdaki listeyi bu hafta içinde tamamlayın. Her maddeyi yaptığınızda işaretleyin.`,
          en: `Complete the list below during this week. Tick each item as you do it.`,
        },
      },
    ],
    practice: {
      kind: 'checklist',
      minutes: 5,
      items: [
        { tr: 'Sesler bölümünden en az üç farklı sesi dinleyip hoşunuza giden birini seçtim.', en: 'I listened to at least three sounds in the Sounds section and chose one I like.' },
        { tr: 'Karışma noktası aracıyla ses düzeyimi ayarladım.', en: 'I set my level with the mixing point tool.' },
        { tr: 'Evdeki en sessiz saati belirleyip o saatte sesi açtım.', en: 'I identified the quietest hour at home and turned the sound on then.' },
        { tr: 'Gece için hoparlör veya yastık hoparlörü düzenledim; kulak tıkacı kullanmadım.', en: 'I arranged a room or pillow speaker for the night and did not use earplugs.' },
        { tr: 'Üç gece üst üste sesi uyku zamanlayıcısıyla kullandım.', en: 'I used the sound with the sleep timer for three nights in a row.' },
      ],
    },
    keyTakeaway: {
      tr: 'Düşük düzeyde ve karışma noktasının altında kalan hoş bir ortam sesi tinnitusu yalnız bırakmaz; sesi örtmek değil, zemine karıştırmak hedeftir.',
      en: 'A pleasant background sound kept low and below the mixing point means the tinnitus is no longer alone; the goal is to blend it into the ground, not to cover it.',
    },
    citations: ['sereda2018', 'scherer2019', 'tunkel2014'],
  },
  {
    id: 'cbt.thoughtDiary',
    title: { tr: 'Düşünce günlüğüne giriş', en: 'Introducing the thought diary' },
    intro: {
      tr: 'Tinnitusla ilgili sıkıntının büyük bölümü sesin kendisinden değil, ses hakkında düşündüklerimizden gelir. Düşünce günlüğü, bu düşünceleri yakalamanın ve zamanla onlarla ilişkinizi değiştirmenin aracıdır.',
      en: 'Much of the distress around tinnitus comes not from the sound itself but from what we think about it. The thought diary is the tool for catching these thoughts and, over time, changing your relationship with them.',
    },
    sections: [
      {
        heading: { tr: 'Olay, düşünce, duygu', en: 'Event, thought, feeling' },
        body: {
          tr: `BDT'nin temel gözlemi basittir: bir olay doğrudan bir duygu yaratmaz; arada bir yorum vardır. Aynı ses iki kişide farklı duygular doğurur çünkü iki kişi ona farklı anlam verir.

Bir örnek: akşam oturma odasında ses belirginleşti. Birinci yorum: "Yine başladı, bu gece de uyuyamayacağım, bu böyle sürüp gidecek." Duygu: çaresizlik, kaygı, öfke. İkinci yorum: "Oda sessiz, ses her akşam bu saatte öne çıkıyor; yarın sabah yine arka planda olacak." Duygu: hafif rahatsızlık, belki biraz yorgunluk. Ses aynı, gece farklı.

Bu yorumlar genellikle o kadar hızlı ve alışkanlık hâlindedir ki fark edilmez; bu yüzden onlara **otomatik düşünce** denir. Düşünce günlüğü, otomatik düşünceyi yavaşlatıp görünür kılar.`,
          en: `CBT's basic observation is simple: an event does not create a feeling directly; there is an interpretation in between. The same sound produces different feelings in two people because they give it different meanings.

An example: in the evening, in the living room, the sound became prominent. First interpretation: "Here it goes again, I will not sleep tonight either, this will go on forever." Feeling: helplessness, anxiety, anger. Second interpretation: "The room is quiet, the sound comes forward at this hour every evening; tomorrow morning it will be in the background again." Feeling: mild irritation, maybe some tiredness. Same sound, different night.

These interpretations are usually so fast and habitual that they go unnoticed; that is why they are called **automatic thoughts**. The thought diary slows the automatic thought down and makes it visible.`,
        },
      },
      {
        heading: { tr: 'Günlüğün dört sütunu', en: 'The four columns of the diary' },
        body: {
          tr: `Bu hafta günlük yalnızca gözlem içindir; henüz düşünceleri değiştirmeye çalışmıyoruz. Her kayıt dört bölümden oluşur:

- **Durum:** Neredeydiniz, ne yapıyordunuz, saat kaçtı? ("Gece 23.30, yatakta, ışık kapalı.")
- **Otomatik düşünce:** Aklınızdan geçen cümle, mümkün olduğunca kelimesi kelimesine. ("Bu ses beni mahvedecek.")
- **Duygu ve şiddeti:** Bir iki kelimeyle duygu ve 0–100 arasında şiddeti. ("Kaygı 80, öfke 50.")
- **Ne yaptınız:** O anda verdiğiniz tepki. ("Telefona baktım, kulağımı yastığa bastırdım.")

İlk kayıtlar eksik ya da dağınık olabilir. Önemli olan sesin öne çıktığı anlardan en az birkaçını yakalamaktır. Düşünceyi olabildiğince o anda ya da hemen sonrasında yazın; saatler geçince cümle değişir.`,
          en: `This week the diary is for observation only; we are not yet trying to change thoughts. Each entry has four parts:

- **Situation:** Where were you, what were you doing, what time was it? ("11.30 pm, in bed, lights off.")
- **Automatic thought:** The sentence in your mind, as close to word for word as possible. ("This sound is going to destroy me.")
- **Feeling and intensity:** One or two words for the feeling and 0–100 for its strength. ("Anxiety 80, anger 50.")
- **What you did:** Your response in that moment. ("Looked at my phone, pressed my ear into the pillow.")

The first entries may be incomplete or messy. What matters is catching at least a few of the moments when the sound comes forward. Write the thought as close to the moment as you can; hours later the sentence changes.`,
        },
      },
      {
        heading: { tr: 'Düşünceyi yakalama ipuçları', en: 'Tips for catching the thought' },
        kind: 'tip',
        body: {
          tr: `- Duygu değiştiği anda sorun: "Az önce aklımdan ne geçti?"
- Düşünce bir görüntü olabilir: kendinizi uykusuz, yorgun, işte hata yaparken görmek gibi. Görüntüyü de yazın.
- "Neden ben?" gibi sorular da düşüncedir; genellikle altında bir yargı yatar: "Bu haksızlık, dayanamam."
- Düşünceyi yargılamayın. Günlük bir mahkeme değil, bir kayıt defteridir.
- Günde bir kayıt yeterlidir. Hiç kayıt yapamadığınız günlerde akşam geriye dönüp günün en zor anını yazın.`,
          en: `- The moment a feeling shifts, ask: "What just went through my mind?"
- The thought may be an image: seeing yourself sleepless, exhausted, making mistakes at work. Write the image down too.
- Questions such as "Why me?" are thoughts too; underneath usually lies a judgement: "This is unfair, I cannot stand it."
- Do not judge the thought. The diary is a logbook, not a courtroom.
- One entry a day is enough. On days with no entry, look back in the evening and record the hardest moment of the day.`,
        },
      },
      {
        heading: { tr: 'Önümüzdeki haftalar', en: 'The weeks ahead' },
        body: {
          tr: `Dördüncü haftada bu kayıtlara geri dönüp tekrar eden düşünce kalıplarını (felaketleştirme, zihin okuma, ya hep ya hiç) tanıyacaksınız. Beşinci haftada her düşünce için kanıtları tartacak ve daha dengeli bir alternatif oluşturacaksınız. Şimdiden toplanan her kayıt o haftalarda işe yarayacak malzemedir.

Aşağıdaki düğme sizi düşünce kaydı formuna götürür. Bu hafta yalnızca ilk dört alanı (durum, düşünce, duygu, şiddet) doldurmanız yeterlidir; kanıt ve dengeli düşünce alanlarını boş bırakabilirsiniz.`,
          en: `In week four you will return to these entries and recognise recurring thinking patterns (catastrophising, mind reading, all-or-nothing). In week five you will weigh the evidence for each thought and build a more balanced alternative. Every entry collected now is material for those weeks.

The button below takes you to the thought record form. This week it is enough to fill the first four fields (situation, thought, feeling, intensity); you can leave the evidence and balanced-thought fields empty.`,
        },
      },
    ],
    practice: { kind: 'thoughtRecord', minutes: 5 },
    keyTakeaway: {
      tr: 'Sıkıntıyı ses değil, ses hakkındaki otomatik yorum belirler; bu hafta onları değiştirmeden yalnızca yakalayın ve yazın.',
      en: 'Distress is set not by the sound but by the automatic interpretation of it; this week just catch and write those thoughts without changing them.',
    },
    citations: ['fuller2020', 'beukes2018'],
  },
  {
    id: 'cbt.sleepGuidelines',
    title: { tr: 'Uyku ilkeleri', en: 'Sleep guidelines' },
    intro: {
      tr: 'Tinnitusu olan kişilerin önemli bir bölümü uykuya dalmakta ya da gece uyandıktan sonra tekrar uyumakta zorlanır. Bu modül, uyku hijyeni ile uyaran kontrolünün tinnitusa uyarlanmış temel ilkelerini sunar. Belirgin uykusuzluk yaşıyorsanız programın Uyku için BDT bölümü bu ilkeleri derinleştirir.',
      en: 'A sizeable share of people with tinnitus struggle to fall asleep or to get back to sleep after waking at night. This module presents the core principles of sleep hygiene and stimulus control adapted to tinnitus. If you have marked insomnia, the CBT for insomnia part of the programme deepens these principles.',
    },
    sections: [
      {
        heading: { tr: 'Tinnitus ve uyku arasındaki döngü', en: 'The loop between tinnitus and sleep' },
        body: {
          tr: `Yatak odası genellikle günün en sessiz yeridir; tinnitus burada en belirgindir. Uykuya dalamamak kaygı doğurur, kaygı uyanıklığı artırır, uyanıklık sesi daha çok fark ettirir. Birkaç kötü geceden sonra yatak, uyku yerine "sesle baş başa kalma" ile ilişkilenir ve yatağa girmek bile tetikleyici olur.

İyi haber, uykunun tinnitustan bağımsız olarak düzeltilebilir olmasıdır. Marks ve arkadaşlarının 2023 tarihli randomize çalışmasında uykusuzluk için BDT, tinnitus eğitimi ve ses zenginleştirmesine dayalı bakıma kıyasla uykuyu ve tinnitus sıkıntısını daha fazla iyileştirdi. Uykuyu hedeflemek tinnitusa da iyi gelir.`,
          en: `The bedroom is usually the quietest place of the day; tinnitus is most prominent there. Not falling asleep breeds anxiety, anxiety increases wakefulness, wakefulness makes the sound more noticeable. After a few bad nights the bed becomes linked with "being alone with the sound" rather than with sleep, and even getting into bed becomes a trigger.

The good news is that sleep can be improved independently of tinnitus. In the 2023 randomised trial by Marks and colleagues, CBT for insomnia improved sleep and tinnitus distress more than care based on tinnitus education and sound enrichment. Targeting sleep helps tinnitus too.`,
        },
      },
      {
        heading: { tr: 'Uyku hijyeni: zemin hazırlamak', en: 'Sleep hygiene: preparing the ground' },
        body: {
          tr: `- **Sabit kalkış saati.** Haftanın yedi günü aynı saatte kalkın; uyku dürtüsünü düzenleyen en güçlü sinyal budur. Yatış saati değişebilir, kalkış saati değişmez.
- **Kafein ve alkol.** Öğleden sonra kafein almayın. Alkol uykuya dalmayı kolaylaştırır gibi görünse de gecenin ikinci yarısını böler.
- **Işık.** Sabah güneş ışığı alın; akşam ekran parlaklığını düşürün. Yatak odası karanlık ve serin olsun.
- **Gündüz uykusu.** Gündüz uyumayın ya da 20 dakikayla sınırlayın; öğleden sonra üçten sonra hiç uyumayın.
- **Egzersiz.** Düzenli hareket uykuyu derinleştirir; ancak yatmadan önceki iki saatte yoğun egzersizden kaçının.
- **Ses.** Yatak odasında düşük düzeyde ortam sesi kullanın (önceki modül). Tam sessizlik tinnitusu öne çıkarır.`,
          en: `- **Fixed rise time.** Get up at the same time all seven days; this is the strongest signal regulating sleep drive. Bedtime can vary, rise time does not.
- **Caffeine and alcohol.** No caffeine after midday. Alcohol may seem to help you drop off, but it fragments the second half of the night.
- **Light.** Get daylight in the morning; dim screens in the evening. Keep the bedroom dark and cool.
- **Napping.** Avoid naps or keep them to 20 minutes; never after 3 pm.
- **Exercise.** Regular movement deepens sleep; avoid vigorous exercise in the two hours before bed.
- **Sound.** Use low-level background sound in the bedroom (previous module). Complete silence brings tinnitus forward.`,
        },
      },
      {
        heading: { tr: 'Uyaran kontrolü: yatağı yeniden uykuya bağlamak', en: 'Stimulus control: re-linking the bed with sleep' },
        kind: 'exercise',
        body: {
          tr: `Uyaran kontrolü, uykusuzluk için en güçlü kanıta sahip davranışsal yöntemdir. Kuralları basittir, uygulaması sabır ister:

1. Yatağa yalnızca uykunuz geldiğinde gidin; saat geldiğinde değil.
2. Yatakta uyku ve yakınlık dışında bir şey yapmayın: telefon, televizyon, yemek, çalışma yok.
3. Yaklaşık 15–20 dakika içinde uyuyamadıysanız (saate bakmadan tahmin edin) kalkın, başka bir odaya geçin, loş ışıkta sakin bir şey yapın. Uykunuz gelince yatağa dönün.
4. Gece uyanıp tekrar uyuyamazsanız aynı kuralı uygulayın.
5. Kaç saat uyuduğunuzdan bağımsız olarak aynı saatte kalkın.

Tinnitusa uyarlama: kalktığınızda gittiğiniz odada da düşük düzeyde ses olsun. Yatakta uyanık kalıp sesi dinlemek, yatak ile sesi birbirine bağlar; kalkmak bu bağı koparır. İlk hafta daha az uyuyabilirsiniz; bu geçicidir ve yöntemin işlemesinin parçasıdır.`,
          en: `Stimulus control is the behavioural method with the strongest evidence for insomnia. The rules are simple; applying them takes patience:

1. Go to bed only when sleepy, not when the clock says so.
2. Do nothing in bed other than sleep and intimacy: no phone, television, food or work.
3. If you have not fallen asleep within about 15–20 minutes (estimate without checking the clock), get up, go to another room and do something calm in dim light. Return to bed when sleepy.
4. If you wake at night and cannot get back to sleep, apply the same rule.
5. Get up at the same time regardless of how many hours you slept.

Adaptation for tinnitus: have low-level sound in the room you move to as well. Lying awake listening to the sound binds bed and sound together; getting up breaks that bond. You may sleep less in the first week; this is temporary and part of how the method works.`,
        },
      },
      {
        heading: { tr: 'Gece uyandığınızda', en: 'When you wake at night' },
        kind: 'tip',
        body: {
          tr: `- Saate bakmayın; saat hesaplamak uyanıklığı artırır.
- "Yine uyuyamayacağım" düşüncesini fark edin ve ona cevap vermeyin; nefesinize ya da ortam sesine dönün.
- Kısa gevşeme (2. adım) yatakta yapılabilir; ancak 15–20 dakika sonra hâlâ uyanıksanız kalkın.
- Sabah olmuşsa ve kalkış saatinize bir saatten az kaldıysa kalkın; günü başlatın.`,
          en: `- Do not look at the clock; calculating hours increases wakefulness.
- Notice the thought "I will not sleep again" and do not answer it; return to your breath or the background sound.
- The short relaxation (step 2) can be done in bed; but if you are still awake after 15–20 minutes, get up.
- If it is near morning and less than an hour remains to your rise time, get up and start the day.`,
        },
      },
    ],
    practice: {
      kind: 'checklist',
      minutes: 4,
      items: [
        { tr: 'Haftanın yedi günü için tek bir kalkış saati belirledim.', en: 'I set one rise time for all seven days of the week.' },
        { tr: 'Öğleden sonra kafeini kestim.', en: 'I cut caffeine after midday.' },
        { tr: 'Yatak odasına düşük düzeyde ortam sesi kurdum.', en: 'I set up low-level background sound in the bedroom.' },
        { tr: 'Telefonu yatak odasının dışında bırakıyorum.', en: 'I leave the phone outside the bedroom.' },
        { tr: 'Uyuyamadığımda kalkıp başka bir odaya geçmeyi en az bir gece denedim.', en: 'I tried getting up and moving to another room when I could not sleep, on at least one night.' },
      ],
    },
    keyTakeaway: {
      tr: 'Sabit kalkış saati, yatakta yalnızca uyumak ve uyuyamayınca kalkmak; tinnitusu olan kişilerde uyku bu üç kuralla ve düşük ortam sesiyle yeniden kurulur.',
      en: 'A fixed rise time, the bed only for sleep and getting up when sleep does not come; with low background sound, these three rules rebuild sleep for people with tinnitus.',
    },
    citations: ['marks2023', 'espie2014'],
  },
  {
    id: 'cbt.relax3',
    title: { tr: 'Derin gevşeme 3: nefesle işaretli gevşeme', en: 'Deep relaxation 3: cue-controlled breathing' },
    intro: {
      tr: 'Üçüncü adımda gevşemeyi nefese ve bir sözcüğe bağlıyoruz. Her nefes verişte zihninizden "gevşe" diyeceksiniz. Birkaç hafta sonra bu sözcük tek başına bedeni gevşetmeye başlar. Süre 2–3 dakikaya iner.',
      en: 'In the third step we link relaxation to the breath and to a word. On each out-breath you will say "relax" in your mind. After a few weeks the word alone starts to relax the body. The time comes down to 2–3 minutes.',
    },
    sections: [
      {
        heading: { tr: 'Koşullu işaret', en: 'The conditioned cue' },
        body: {
          tr: `Önceki iki adımda gevşemeyi üretmeyi öğrendiniz. Şimdi bu durumu bir işarete bağlayacağız: nefes verme anı ve "gevşe" sözcüğü. Tekrar tekrar eşleştirildiğinde işaret ile durum birbirine bağlanır; tıpkı bir kokunun bir anıyı çağırması gibi. Öst bu adıma "cue-controlled", yani işaretle denetimli gevşeme adını verir.

Nefes bu iş için uygundur çünkü her zaman yanınızdadır ve yavaş nefes verme tek başına sinir sistemini yatıştırır. Dakikada altı civarı nefes (yaklaşık dört saniye alıp altı saniye verme) kaygı ve uykuya dalma üzerinde orta düzeyde kanıta sahiptir; burada bir tinnitus tedavisi olarak değil, gevşeme becerisinin bir parçası olarak sunulur.`,
          en: `In the previous two steps you learned to produce relaxation. Now we will tie that state to a cue: the moment of breathing out and the word "relax". Paired again and again, cue and state become linked, just as a smell can call up a memory. Öst calls this step cue-controlled relaxation.

The breath suits this purpose because it is always with you and slow exhalation by itself calms the nervous system. Around six breaths a minute (roughly four seconds in, six seconds out) has moderate evidence for anxiety and sleep onset; here it is offered not as a tinnitus treatment but as part of the relaxation skill.`,
        },
      },
      {
        heading: { tr: 'Nasıl yapılır', en: 'How to do it' },
        kind: 'exercise',
        body: {
          tr: `1. Oturun. Önce "yalnızca bırakma" ile 1–2 dakika gevşeyin.
2. Nefesinizi izleyin. Burundan yavaşça alın (yaklaşık dört saniye), ağızdan ya da burundan daha yavaş verin (yaklaşık altı saniye). Zorlamayın; rahat bir ritim bulun.
3. Her nefes alışta zihninizden "al", her nefes verişte "gevşe" deyin. Sözcüğü nefes verme ile tam zamanlı söyleyin.
4. Nefes verirken bedende gevşemenin omuzlardan parmaklara aktığını hayal edin.
5. Bunu 2–3 dakika sürdürün. Bitirince gözlerinizi açın ve gevşek kalın.

Günde iki kez, iki hafta boyunca. Sözcük sizin için başka bir şey olabilir: "sakin", "bırak", "yumuşa". Seçtiğiniz sözcüğü değiştirmeyin.`,
          en: `1. Sit. First relax for 1–2 minutes with "release only".
2. Follow your breath. Breathe in slowly through the nose (about four seconds), out through the mouth or nose more slowly (about six seconds). Do not force it; find a comfortable rhythm.
3. On each in-breath say "in" in your mind, on each out-breath say "relax". Time the word exactly with the out-breath.
4. As you breathe out, picture relaxation flowing from the shoulders down to the fingertips.
5. Continue for 2–3 minutes. When done, open your eyes and stay loose.

Twice a day for two weeks. The word may be something else for you: "calm", "let go", "soft". Once chosen, keep the same word.`,
        },
      },
      {
        heading: { tr: 'Sesle birlikte', en: 'Together with the sound' },
        kind: 'tip',
        body: {
          tr: `Bu adımdan itibaren egzersizi bilerek tinnitusun belirgin olduğu anlarda da yapın: sessiz odada, gece yatakta, yorgunken. Amaç sesi yok etmek değil, ses varken de gevşeyebildiğinizi bedene göstermektir. Ses yükselmiş gibi gelirse bu bir başarısızlık değildir; nefes verin, sözcüğü söyleyin, devam edin.`,
          en: `From this step on, deliberately practise at moments when the tinnitus is prominent: in a quiet room, at night in bed, when tired. The aim is not to remove the sound but to show the body that you can relax while the sound is there. If the sound seems to rise, that is not a failure; breathe out, say the word, continue.`,
        },
      },
    ],
    practice: {
      kind: 'timer',
      minutes: 4,
      steps: [
        { tr: 'Oturun ve bedeni yalnızca bırakarak gevşetin: yüz, omuzlar, kollar, gövde, bacaklar.', en: 'Sit and relax the body by release only: face, shoulders, arms, torso, legs.', seconds: 60 },
        { tr: 'Nefesi izleyin. Dört saniye al, altı saniye ver. Rahat bir ritim bulun.', en: 'Follow the breath. Four seconds in, six seconds out. Find a comfortable rhythm.', seconds: 40 },
        { tr: 'Her alışta "al", her verişte "gevşe". Sözcük nefesle aynı anda.', en: 'On each in-breath "in", on each out-breath "relax". Word and breath together.', seconds: 60 },
        { tr: 'Verirken gevşeme omuzlardan parmak uçlarına akıyor. Sözcük, nefes, gevşeme.', en: 'On the out-breath relaxation flows from the shoulders to the fingertips. Word, breath, release.', seconds: 60 },
        { tr: 'Son birkaç nefes. Gözlerinizi açın, gevşek kalın.', en: 'A few final breaths. Open your eyes, stay loose.', seconds: 20 },
      ],
    },
    keyTakeaway: {
      tr: 'Her nefes verişe "gevşe" sözcüğünü bağlamak, birkaç hafta içinde tek bir nefesle gevşeyebilmenin yolunu açar; sesin belirgin olduğu anlarda da uygulayın.',
      en: 'Tying the word "relax" to every out-breath opens the way, within a few weeks, to relaxing with a single breath; practise it in the moments when the sound is prominent too.',
    },
    citations: ['ost1987', 'beukes2018'],
  },
  {
    id: 'cbt.negativeThoughts',
    title: { tr: 'Olumsuz düşünceleri tanımak', en: 'Recognising negative thoughts' },
    intro: {
      tr: 'İki haftadır düşünce günlüğü tutuyorsunuz. Şimdi kayıtlara geri dönüp tekrar eden kalıpları tanıma zamanı. Tinnitusla ilgili düşünceler birkaç tipik biçimde bozulur; kalıbı adlandırmak, düşünceyi gerçekten ayırmanın ilk adımıdır.',
      en: 'You have kept a thought diary for two weeks. Now it is time to return to the entries and recognise recurring patterns. Thoughts about tinnitus tend to distort in a few typical ways; naming the pattern is the first step in separating the thought from the fact.',
    },
    sections: [
      {
        heading: { tr: 'Düşünce hatası ne demek', en: 'What a thinking error is' },
        body: {
          tr: `Zihin kısa yollar kullanır. Çoğu zaman bu kısa yollar işe yarar; kaygı ya da yorgunluk anlarında ise sistematik biçimde yanılır. Bu yanılmalara bilişsel çarpıtma ya da düşünce hatası denir. Düşünce hatası, düşüncenin yanlış olduğu anlamına gelmez; kanıttan daha fazlasını iddia ettiği anlamına gelir.

Tinnitus bu hataları kolayca tetikler çünkü ses belirsizdir: nereden geldiği görülmez, ne zaman biteceği bilinmez, başkaları duymaz. Belirsizlik, zihnin boşlukları en kötü olasılıkla doldurmasına zemin hazırlar.`,
          en: `The mind uses shortcuts. Most of the time they work; in moments of anxiety or fatigue they err systematically. These errors are called cognitive distortions or thinking errors. A thinking error does not mean the thought is wrong; it means the thought claims more than the evidence supports.

Tinnitus triggers these errors easily because the sound is ambiguous: its source cannot be seen, its end is unknown, others cannot hear it. Ambiguity invites the mind to fill the gaps with the worst possibility.`,
        },
      },
      {
        heading: { tr: 'Tinnitusta sık görülen kalıplar', en: 'Patterns common in tinnitus' },
        body: {
          tr: `- **Felaketleştirme:** "Bu ses sonunda beni delirtecek." Olası en kötü sonucu kesinmiş gibi ele almak.
- **Ya hep ya hiç:** "Ses varken hiçbir şeyden zevk alamam." Ara durumların silinmesi.
- **Aşırı genelleme:** "Bu gece uyuyamadım; artık hiç uyuyamayacağım." Tek olaydan sürekli bir kural çıkarmak.
- **Zihinsel süzgeç:** Günün iyi geçen saatlerini atlayıp sesin belirgin olduğu on dakikayı hatırlamak.
- **Zorunluluk cümleleri:** "Sessizlikte oturabilmeliyim", "Buna katlanmamam gerekir." Gerçekliğe değil, olması gerekene odaklanmak.
- **Duygusal akıl yürütme:** "Çok kötü hissediyorum, demek ki ses kötüleşiyor." Duyguyu kanıt saymak.
- **Falcılık:** "Yarınki toplantıda sesi duyup odaklanamayacağım." Geleceği bilmek.
- **Kişiselleştirme:** "Bu benim başıma geldi çünkü kulaklarımı korumadım, hak ettim." Sorumluluğu abartmak.`,
          en: `- **Catastrophising:** "This sound will drive me mad in the end." Treating the worst outcome as certain.
- **All-or-nothing:** "I cannot enjoy anything while the sound is there." Erasing the in-between.
- **Overgeneralising:** "I did not sleep tonight; I will never sleep again." Turning one event into a permanent rule.
- **Mental filter:** Skipping the good hours of the day and remembering the ten minutes when the sound was prominent.
- **Should statements:** "I should be able to sit in silence", "I should not have to put up with this." Focusing on what ought to be rather than what is.
- **Emotional reasoning:** "I feel terrible, so the sound must be getting worse." Treating the feeling as evidence.
- **Fortune telling:** "In tomorrow's meeting I will hear the sound and not be able to focus." Knowing the future.
- **Personalising:** "This happened to me because I did not protect my ears; I deserve it." Exaggerating responsibility.`,
        },
      },
      {
        heading: { tr: 'Kalıbı adlandırmanın gücü', en: 'The power of naming the pattern' },
        body: {
          tr: `Bir düşünceye "bu felaketleştirme" diyebilmek onu kaybettirmez; ama düşünceyle aranıza bir adım mesafe koyar. Düşünce artık dünyanın kendisi değil, zihnin ürettiği bir yorumdur. Bu mesafe, önümüzdeki hafta düşünceyi sorgulamak için gereken alanı açar.

Bazı düşünceler birden çok kalıba girer; bu normaldir. Hangi etiketin "doğru" olduğunu tartışmayın, size en uygun geleni seçin. Zamanla tekrar eden iki üç kalıbınızı tanıyacaksınız; çoğu kişide liste kısadır.`,
          en: `Being able to say "this is catastrophising" does not make a thought disappear, but it puts one step of distance between you and it. The thought is no longer the world itself; it is an interpretation the mind produced. That distance opens the space you will need next week to question the thought.

Some thoughts fit several patterns; that is normal. Do not argue over the "right" label; pick the one that fits best for you. Over time you will recognise your own two or three recurring patterns; for most people the list is short.`,
        },
      },
      {
        heading: { tr: 'Çalışma kâğıdı', en: 'Worksheet' },
        kind: 'exercise',
        body: {
          tr: `Günlüğünüzden en sık tekrar eden üç düşünceyi seçin. Her biri için kalıbı yazın ve düşüncenin kanıttan "fazla" iddia ettiği kısmı bir cümleyle belirtin. Henüz düşünceyi değiştirmeyin; yalnızca fazlalığı işaretleyin.`,
          en: `Choose the three thoughts that recur most often in your diary. For each, write the pattern and state in one sentence the part where the thought claims "more" than the evidence. Do not change the thought yet; only mark the excess.`,
        },
      },
    ],
    practice: {
      kind: 'worksheet',
      minutes: 8,
      items: [
        { tr: '1. düşünce ve kalıbı (ör. "Bu ses beni mahvedecek" — felaketleştirme)', en: 'Thought 1 and its pattern (e.g. "This sound will destroy me" — catastrophising)' },
        { tr: 'Bu düşüncenin kanıttan fazla iddia ettiği kısım', en: 'The part of this thought that goes beyond the evidence' },
        { tr: '2. düşünce ve kalıbı', en: 'Thought 2 and its pattern' },
        { tr: 'Bu düşüncenin kanıttan fazla iddia ettiği kısım', en: 'The part of this thought that goes beyond the evidence' },
        { tr: '3. düşünce ve kalıbı', en: 'Thought 3 and its pattern' },
        { tr: 'Bu düşüncenin kanıttan fazla iddia ettiği kısım', en: 'The part of this thought that goes beyond the evidence' },
      ],
    },
    keyTakeaway: {
      tr: 'Tinnitusla ilgili düşünceler birkaç tipik kalıpta bozulur; kalıbı adlandırmak düşünceyi yok etmez ama onunla aranıza sorgulamak için gereken mesafeyi koyar.',
      en: 'Thoughts about tinnitus distort in a few typical patterns; naming the pattern does not remove the thought but creates the distance needed to question it.',
    },
    citations: ['fuller2020', 'beukes2018'],
  },
  {
    id: 'cbt.positiveImagery',
    title: { tr: 'Olumlu imgeleme', en: 'Positive imagery' },
    intro: {
      tr: 'Zihin görüntülerle de düşünür. Tinnitusla ilgili kaygı çoğu zaman bir görüntü olarak gelir: uykusuz bir gece, sessiz bir odada baş başa kalma. Bu modülde zihnin aynı gücünü tersine kullanmayı, sesi daha az tehditkâr bir çerçeveye yerleştiren imgeler oluşturmayı öğreneceksiniz.',
      en: 'The mind thinks in images too. Anxiety about tinnitus often arrives as a picture: a sleepless night, being alone in a silent room. In this module you will learn to use the same power of the mind in reverse, building images that place the sound in a less threatening frame.',
    },
    sections: [
      {
        heading: { tr: 'İmgeler duyguyu doğrudan etkiler', en: 'Images act on feeling directly' },
        body: {
          tr: `Bir limonu kestiğinizi, suyunun parmaklarınıza aktığını ve bir dilimi ısırdığınızı hayal edin. Ağzınız sulanır; limon yoktur. Zihindeki görüntüler bedeni, gerçek olaylara yakın biçimde etkiler. Bu, kaygı için bir sorun, gevşeme için bir fırsattır.

Tinnitus programlarında olumlu imgeleme iki amaçla kullanılır. Birincisi, gevşemeyi derinleştiren güvenli bir yer imgesi. İkincisi, sesin kendisini yeniden çerçeveleyen bir imge: sesi düşman olmaktan çıkarıp bir doğa sesi, bir arka plan dokusu ya da uzaklaşan bir nesne olarak görmek. Bu, sesi sevmek zorunda olduğunuz anlamına gelmez; onu daha az tehlikeli bir kategoriye taşımak yeterlidir.`,
          en: `Imagine cutting a lemon, the juice running over your fingers, biting into a slice. Your mouth waters; there is no lemon. Images in the mind affect the body in ways close to real events. That is a problem for anxiety and an opportunity for relaxation.

Tinnitus programmes use positive imagery for two purposes. First, an image of a safe place that deepens relaxation. Second, an image that reframes the sound itself: moving it from enemy to a sound of nature, a background texture or a receding object. This does not mean you must like the sound; moving it into a less dangerous category is enough.`,
        },
      },
      {
        heading: { tr: 'Güvenli yer', en: 'The safe place' },
        kind: 'exercise',
        body: {
          tr: `Gözlerinizi kapatın ve kendinizi tamamen huzurlu hissettiğiniz bir yer seçin: gerçek ya da hayalî. Bir sahil, bir orman yolu, çocukluk evinin bahçesi, sıcak bir mutfak. Yeri beş duyu ile inşa edin:

- **Görüntü:** Işık nasıl, renkler ne, ufukta ne var?
- **Ses:** Dalgalar, kuşlar, rüzgâr, uzaktan bir konuşma. Bu yerde her zaman bir ses vardır; sessizlik seçmeyin.
- **Koku:** Deniz tuzu, çam, taze ekmek.
- **Dokunma:** Güneşin sıcaklığı, kumun dokusu, bir battaniye.
- **Beden:** Oturuyor musunuz, uzanıyor musunuz? Ağırlığınız nerede?

Yeri her gün aynı ayrıntılarla ziyaret edin. Birkaç tekrardan sonra bir iki saniyede oraya gidebilirsiniz. Tinnitusu bu yerin sesleri arasına yerleştirin: uzaktaki bir cırcır böceği, elektrik direğinin uğultusu, rüzgârın tel örgüde çıkardığı ses. Ses yerin bir parçası olduğunda tehdit olmaktan çıkar.`,
          en: `Close your eyes and choose a place where you feel completely at peace, real or imagined. A beach, a forest path, the garden of your childhood home, a warm kitchen. Build the place with all five senses:

- **Sight:** What is the light like, what colours, what is on the horizon?
- **Sound:** Waves, birds, wind, distant conversation. There is always sound in this place; do not choose silence.
- **Smell:** Sea salt, pine, fresh bread.
- **Touch:** The warmth of the sun, the texture of sand, a blanket.
- **Body:** Are you sitting or lying down? Where is your weight?

Visit the place every day with the same details. After a few repetitions you can get there in a second or two. Place the tinnitus among the sounds of this place: a distant cricket, the hum of a power line, wind in a wire fence. Once the sound is part of the place it stops being a threat.`,
        },
      },
      {
        heading: { tr: 'Sesi yeniden çerçeveleyen imgeler', en: 'Images that reframe the sound' },
        body: {
          tr: `Aşağıdaki imgelerden biri size yakın gelebilir; kendi imgenizi de oluşturabilirsiniz:

- **Uzaklaşan tren:** Ses bir trenin düdüğü; tren uzaklaşıyor, ses küçülüyor, siz perondasınız ve gitmesini izliyorsunuz.
- **Ses düğmesi:** Zihninizde eski bir radyonun düğmesi var. Düğmeyi kapatmaya çalışmıyorsunuz; yalnızca birkaç derece kısıyorsunuz.
- **Deniz kabuğu:** Kulağınızdaki ses, kabuğun içindeki deniz sesi; her zaman oradaydı, dinlemediğinizde duymuyorsunuz.
- **Odanın dokusu:** Ses, bir duvar kâğıdının deseni gibi; her yerde ama hiçbir şeyin önünde değil.

İmgeleme bir bastırma yöntemi değildir. Ses imgeye rağmen öne çıkarsa onu imgenin içine davet edin; dışarıda tutmaya çalışmayın.`,
          en: `One of the images below may feel close to you; you can also create your own:

- **The receding train:** The sound is a train whistle; the train is pulling away, the sound shrinking, and you stand on the platform watching it go.
- **The volume dial:** In your mind there is the dial of an old radio. You are not trying to switch it off; you only turn it down a few degrees.
- **The seashell:** The sound in your ear is the sea inside a shell; it was always there and you do not hear it when you are not listening.
- **The texture of the room:** The sound is like the pattern on wallpaper; everywhere, but in front of nothing.

Imagery is not a suppression method. If the sound comes forward despite the image, invite it into the image; do not try to keep it out.`,
        },
      },
      {
        heading: { tr: 'Uygulama', en: 'Practice' },
        kind: 'tip',
        body: {
          tr: `Zamanlayıcı, kısa bir gevşemenin ardından güvenli yere rehberlik eder. Günde bir kez 8–10 dakika, bir hafta boyunca. Uykuya dalmadan önce yapmak uygundur; görüntü uykuyla iç içe geçebilir.`,
          en: `The timer guides you to the safe place after a short relaxation. Once a day for 8–10 minutes over a week. Doing it before falling asleep works well; the image can merge into sleep.`,
        },
      },
    ],
    practice: {
      kind: 'timer',
      minutes: 9,
      steps: [
        { tr: 'Oturun ya da uzanın. Nefesle gevşeyin: her verişte "gevşe".', en: 'Sit or lie down. Relax with the breath: "relax" on each out-breath.', seconds: 60 },
        { tr: 'Güvenli yerinize gidin. Önce görüntü: ışık, renkler, ufuk.', en: 'Go to your safe place. First the picture: light, colours, horizon.', seconds: 60 },
        { tr: 'Bu yerin sesleri: hangi sesler var, hangisi yakın, hangisi uzak?', en: 'The sounds of this place: which sounds are there, which near, which far?', seconds: 60 },
        { tr: 'Kokular ve dokunma: hava, sıcaklık, altınızdaki yüzey.', en: 'Smells and touch: the air, the temperature, the surface beneath you.', seconds: 60 },
        { tr: 'Bedeninizi bu yerde hissedin. Ağırlığınız, nefesiniz, rahatlığınız.', en: 'Feel your body in this place. Your weight, your breath, your ease.', seconds: 60 },
        { tr: 'Tinnitusu bu yerin seslerinden biri olarak davet edin. Uzakta, dokunun bir parçası.', en: 'Invite the tinnitus in as one of the sounds of this place. Distant, part of the texture.', seconds: 90 },
        { tr: 'Birkaç nefes daha bu yerde kalın. Buraya her zaman dönebileceğinizi bilin.', en: 'Stay a few more breaths in this place. Know that you can always return.', seconds: 60 },
        { tr: 'Yavaşça odaya dönün. Parmaklar, nefes, gözler.', en: 'Slowly come back to the room. Fingers, breath, eyes.', seconds: 30 },
      ],
    },
    keyTakeaway: {
      tr: 'Zihin görüntülerle bedeni etkiler; sesi güvenli bir yerin dokusuna yerleştiren bir imge, onu düşman kategorisinden çıkarır.',
      en: 'The mind moves the body through images; an image that places the sound in the texture of a safe place takes it out of the enemy category.',
    },
    citations: ['beukes2018', 'fuller2020'],
  },
  {
    id: 'cbt.relax4',
    title: { tr: 'Derin gevşeme 4: fark eden gevşeme', en: 'Deep relaxation 4: differential relaxation' },
    intro: {
      tr: 'Dördüncü adım gevşemeyi hareketin içine taşır. Gündelik bir iş yaparken yalnızca o iş için gereken kaslar çalışır; geri kalanı gevşek kalır. Bu, gevşemenin sandalyeden kalkıp hayata karıştığı adımdır.',
      en: 'The fourth step carries relaxation into movement. While doing an everyday task, only the muscles needed for that task work; the rest stay loose. This is the step where relaxation leaves the chair and joins daily life.',
    },
    sections: [
      {
        heading: { tr: 'Gereksiz gerginlik', en: 'Unnecessary tension' },
        body: {
          tr: `Yazı yazarken omuzlarınız kalkıyor mu? Telefonda konuşurken çeneniz sıkılıyor mu? Araba kullanırken direksiyonu gereğinden sıkı mı tutuyorsunuz? Çoğumuz bir işi yaparken o işle ilgisi olmayan onlarca kası da gerer. Bu "artık gerginlik" gün boyu birikir ve akşam tinnitusun daha gürültülü geldiği yorgunluğun bir parçasıdır.

Fark eden gevşeme (differential relaxation), bir etkinlik sırasında hangi kasların gerçekten gerektiğini ayırt edip diğerlerini bırakma becerisidir. Öst'ün protokolünde bu adım, oturarak, ayakta ve hareket hâlinde olmak üzere kademeli uygulanır ve 60–90 saniyelik kısa gevşemelerle çalışılır.`,
          en: `Do your shoulders rise when you type? Does your jaw clench when you talk on the phone? Do you grip the steering wheel harder than needed? Most of us tense dozens of muscles unrelated to the task while doing it. This "residual tension" accumulates through the day and is part of the evening fatigue in which tinnitus sounds louder.

Differential relaxation is the skill of telling which muscles a task really needs and letting the others go. In Öst's protocol this step is practised in stages, sitting, standing and moving, using short 60–90 second relaxations.`,
        },
      },
      {
        heading: { tr: 'Üç kademe', en: 'Three stages' },
        kind: 'exercise',
        body: {
          tr: `**1. Oturarak, hareketle.** Masada oturun. Nefesle işaretli gevşeme ile 60 saniyede gevşeyin. Sonra bir elinizle yazı yazın ya da telefonu tutun. Diğer kol, omuzlar, yüz, bacaklar gevşek mi? Gerginlik fark ettiğinizde "gevşe" deyin ve o bölgeyi bırakın; iş devam etsin.

**2. Ayakta.** Ayağa kalkın, dengeli durun. Dik durmak için gerçekten hangi kaslar gerekiyor? Omuzlar, eller, çene gerekmiyor. Ayakta 60 saniye gevşek kalın; sonra bir şey yapın: bulaşık, dolabı düzenleme.

**3. Hareket hâlinde.** Yürürken uygulayın. Adımlar bacaklardan; kollar serbestçe sallanır, omuzlar düşük, yüz yumuşak. Her birkaç adımda bir nefes verişle "gevşe".

Her kademede iki üç gün kalın. Bu hafta günde iki kez, farklı etkinliklerle. Oturarak derin gevşemeye (2. ya da 3. adım) günde bir kez devam edin.`,
          en: `**1. Sitting, with movement.** Sit at a desk. Relax in 60 seconds with cue-controlled breathing. Then write with one hand or hold the phone. Are the other arm, the shoulders, the face, the legs loose? When you notice tension, say "relax" and release that area; let the task continue.

**2. Standing.** Stand up, balanced. Which muscles are really needed to stand upright? Not the shoulders, hands or jaw. Stay loose standing for 60 seconds; then do something: the dishes, tidying a cupboard.

**3. Moving.** Practise while walking. The steps come from the legs; the arms swing freely, shoulders low, face soft. Every few steps, "relax" on an out-breath.

Stay two or three days at each stage. This week twice a day, with different activities. Continue the seated deep relaxation (step 2 or 3) once a day.`,
        },
      },
      {
        heading: { tr: 'Gün içinde kontrol noktaları', en: 'Checkpoints through the day' },
        kind: 'tip',
        body: {
          tr: `Günde beş altı kez, kısa bir "gerginlik taraması" yapın: omuzlar, çene, eller, karın. Telefonu her elinize aldığınızda, her kapıdan geçtiğinizde, her e-postayı açtığınızda. Tarama üç saniye sürer; bulduğunuz gerginliği bir nefesle bırakın. Çene ve boyun gerginliği olan kişilerde bu alışkanlık tinnitusun somatik bileşenini de hafifletebilir; bu konu için programın egzersiz bölümüne bakın.`,
          en: `Five or six times a day, do a short "tension scan": shoulders, jaw, hands, abdomen. Each time you pick up the phone, walk through a door, open an email. The scan takes three seconds; release what you find with one breath. For people with jaw and neck tension this habit may also ease the somatic component of tinnitus; see the exercise section of the programme for that.`,
        },
      },
    ],
    practice: {
      kind: 'timer',
      minutes: 5,
      steps: [
        { tr: 'Oturun. Nefesle işaretli gevşeme: her verişte "gevşe".', en: 'Sit. Cue-controlled relaxation: "relax" on each out-breath.', seconds: 60 },
        { tr: 'Bir elinizle bir şey yapın: yazın, telefonu tutun. Diğer kol, omuzlar, yüz gevşek kalsın.', en: 'Do something with one hand: write, hold the phone. Keep the other arm, shoulders and face loose.', seconds: 60 },
        { tr: 'Ayağa kalkın. Yalnızca dik durmak için gereken kaslar çalışsın. Omuzlar, eller, çene serbest.', en: 'Stand up. Only the muscles needed to stand upright work. Shoulders, hands, jaw free.', seconds: 60 },
        { tr: 'Birkaç adım yürüyün. Kollar sallanıyor, omuzlar düşük, yüz yumuşak. Her birkaç adımda "gevşe".', en: 'Walk a few steps. Arms swinging, shoulders low, face soft. "Relax" every few steps.', seconds: 60 },
        { tr: 'Durun. Hızlı tarama: omuzlar, çene, eller, karın. Bir nefesle bırakın.', en: 'Stop. Quick scan: shoulders, jaw, hands, abdomen. Release with one breath.', seconds: 30 },
      ],
    },
    keyTakeaway: {
      tr: 'Bir iş için gereken kaslar çalışırken gerisini bırakmak, gün boyu biriken gerginliği azaltır; gevşeme bu adımda sandalyeden kalkıp hayata karışır.',
      en: 'Letting go of every muscle a task does not need reduces the tension that builds through the day; in this step relaxation leaves the chair and joins daily life.',
    },
    citations: ['ost1987', 'beukes2018'],
  },
  {
    id: 'cbt.restructuring',
    title: { tr: 'Düşünceleri yeniden yapılandırma', en: 'Restructuring thoughts' },
    intro: {
      tr: 'Düşünceleri yakaladınız ve kalıplarını tanıdınız. Bu modülde her düşünceyi bir iddia gibi ele alıp kanıtları tartacak ve daha dengeli bir alternatif oluşturacaksınız. Bu, BDT\'nin çekirdek becerisidir ve haftalar içinde otomatikleşir.',
      en: 'You have caught the thoughts and recognised their patterns. In this module you will treat each thought as a claim, weigh the evidence and build a more balanced alternative. This is the core skill of CBT and becomes automatic over the weeks.',
    },
    sections: [
      {
        heading: { tr: 'Olumlu düşünmek değil, doğru düşünmek', en: 'Not positive thinking but accurate thinking' },
        body: {
          tr: `Yeniden yapılandırma, kötü düşünceyi iyi düşünceyle değiştirmek değildir. "Bu ses beni mahvedecek" cümlesinin karşısına "Her şey harika" koymak işe yaramaz; zihin ikna olmaz. Amaç, kanıtlara dayanan, ne abartan ne küçümseyen bir cümle bulmaktır: "Bu ses rahatsız edici ve bazı geceler uykumu bölüyor; buna rağmen son üç ayda işime gittim, arkadaşlarımla görüştüm ve ses yüzünden hiçbir şey kaybetmedim."

Dengeli düşünce daha uzun ve daha az çarpıcıdır. Çarpıcı olmaması iyidir; kaygı çarpıcılıktan beslenir.`,
          en: `Restructuring is not replacing a bad thought with a good one. Setting "Everything is wonderful" against "This sound will destroy me" does not work; the mind is not convinced. The aim is a sentence based on evidence that neither exaggerates nor minimises: "This sound is unpleasant and breaks my sleep some nights; even so, over the last three months I went to work, saw my friends and lost nothing because of it."

The balanced thought is longer and less dramatic. Being less dramatic is good; anxiety feeds on drama.`,
        },
      },
      {
        heading: { tr: 'Yedi adım', en: 'Seven steps' },
        kind: 'exercise',
        body: {
          tr: `1. **Durum:** Ne oldu, nerede, ne zaman?
2. **Otomatik düşünce:** Aklınızdan geçen cümle. Birden çoksa en sıcak olanı, yani en güçlü duyguyu tetikleyeni seçin.
3. **Duygu ve şiddeti (0–100):** Önce ne hissettiğinizi puanlayın.
4. **Düşünceyi destekleyen kanıtlar:** Yalnızca olgular; yorum ve duygu değil. "Dün gece iki saat uyuyamadım" olgu; "Hiç uyuyamıyorum" yorumdur.
5. **Düşünceye karşı kanıtlar:** Bu düşünceye uymayan olgular. "Bu hafta beş gece normal uyudum." "Geçen ay da böyle bir gece olmuştu ve ertesi gün toparlandım." "Bir dostum olsa ona ne derdim?"
6. **Dengeli düşünce:** İki sütunu birleştiren, bir mahkeme kararı gibi tarafsız cümle.
7. **Duyguyu yeniden puanlayın (0–100):** Şiddet genellikle düşer ama sıfıra inmez; on puanlık bir düşüş bile anlamlıdır.`,
          en: `1. **Situation:** What happened, where, when?
2. **Automatic thought:** The sentence in your mind. If there are several, choose the hottest one, the one that triggers the strongest feeling.
3. **Feeling and intensity (0–100):** Rate what you feel first.
4. **Evidence for the thought:** Facts only; not interpretations or feelings. "Last night I could not sleep for two hours" is a fact; "I never sleep" is an interpretation.
5. **Evidence against the thought:** Facts that do not fit. "Five nights this week I slept normally." "I had a night like this last month too and recovered the next day." "What would I say to a friend?"
6. **Balanced thought:** A sentence that combines both columns, as neutral as a court ruling.
7. **Re-rate the feeling (0–100):** The intensity usually falls but rarely to zero; even a ten-point drop is meaningful.`,
        },
      },
      {
        heading: { tr: 'Yardımcı sorular', en: 'Helpful questions' },
        body: {
          tr: `Karşı kanıt bulmak zor olduğunda şu sorular yardımcı olur:

- Bu düşünceyi destekleyen gerçek bir kanıt mı, yoksa yalnızca hissettiğim bir şey mi?
- Geçmişte benzer durumlar nasıl sonuçlandı?
- Bu olay bir yıl sonra ne kadar önemli olacak?
- Aynı durumdaki bir yakınıma ne söylerdim?
- Durumu başka nasıl açıklayabilirim?
- En kötü, en iyi ve en olası sonuç ne?
- Düşünceyi yüzde kaç oranında doğru buluyorum? Yüzde yüz değilse geri kalan yüzde neyi içeriyor?`,
          en: `When evidence against is hard to find, these questions help:

- Is this real evidence for the thought, or only something I feel?
- How did similar situations turn out in the past?
- How much will this matter a year from now?
- What would I say to someone close to me in the same situation?
- How else could I explain the situation?
- What is the worst, the best and the most likely outcome?
- How far do I believe the thought, as a percentage? If not one hundred, what does the rest contain?`,
        },
      },
      {
        heading: { tr: 'Tinnitusa özgü örnek', en: 'A tinnitus-specific example' },
        body: {
          tr: `**Düşünce:** "Ses yüzünden hiçbir şeye odaklanamıyorum, işimi kaybedeceğim." Kaygı 85.

**Destekleyen:** Bugün bir raporu bitirmek iki saat yerine üç saat sürdü. Sessiz odada ses belirgindi.

**Karşı:** Rapor bitti ve geri gönderilmedi. Son altı ayda performans görüşmem olumlu geçti. Odaklanma zorluğu en çok sabah uykusuz kalktığım günlerde oluyor; ses her gün aynı ama odaklanma farklı. Ofiste hafif bir ortam sesi açınca daha iyi gidiyor.

**Dengeli:** "Ses, özellikle uykusuz günlerde dikkatimi daha çok çekiyor ve bazı işler daha uzun sürüyor. Yine de işimi yapıyorum ve kimse bir eksik görmedi. Odaklanmayı zorlaştıran asıl şey uykusuzluk; ona çalışıyorum." Kaygı 45.`,
          en: `**Thought:** "I cannot focus on anything because of the sound; I will lose my job." Anxiety 85.

**For:** Today a report took three hours instead of two. The sound was prominent in the quiet room.

**Against:** The report was finished and not sent back. My performance review six months ago was positive. Focus is hardest on mornings after poor sleep; the sound is the same every day but focus differs. It goes better when I put light background sound on in the office.

**Balanced:** "The sound draws my attention more, especially on sleepless days, and some tasks take longer. Even so I am doing my job and no one has found fault. What really makes focus harder is poor sleep; I am working on that." Anxiety 45.`,
        },
      },
      {
        heading: { tr: 'Bu haftaki görev', en: 'This week\'s task' },
        kind: 'tip',
        body: {
          tr: `Her gün en az bir tam düşünce kaydı (yedi adım) yapın. İlk kayıtlar 10–15 dakika sürebilir; bir hafta sonra beş dakikaya iner, birkaç hafta sonra kâğıda gerek kalmadan zihinde yapılır. Aşağıdaki düğme kayıt formunu açar.`,
          en: `Do at least one complete thought record (all seven steps) every day. The first records may take 10–15 minutes; after a week they take five, and after a few weeks they happen in the mind without paper. The button below opens the record form.`,
        },
      },
    ],
    practice: { kind: 'thoughtRecord', minutes: 10 },
    keyTakeaway: {
      tr: 'Yeniden yapılandırma olumlu değil, kanıta dayalı düşünmektir; lehte ve aleyhte olguları tartıp dengeli cümleyi kurduğunuzda duygunun şiddeti düşer.',
      en: 'Restructuring is not positive but evidence-based thinking; when you weigh the facts for and against and build the balanced sentence, the intensity of the feeling drops.',
    },
    citations: ['fuller2020', 'beukes2018', 'hesser2012'],
  },
  {
    id: 'cbt.relax5',
    title: { tr: 'Derin gevşeme 5: hızlı gevşeme', en: 'Deep relaxation 5: rapid relaxation' },
    intro: {
      tr: 'Beşinci adımda gevşeme 20–30 saniyeye iner ve günün doğal akışına bağlanır. Günde 15–20 kez, önceden belirlediğiniz işaretlerle uygulanır: telefon çaldığında, kapıdan geçtiğinizde, su içtiğinizde.',
      en: 'In the fifth step relaxation comes down to 20–30 seconds and is tied to the natural flow of the day. It is practised 15–20 times a day at cues you choose in advance: when the phone rings, when you walk through a door, when you drink water.',
    },
    sections: [
      {
        heading: { tr: 'Gündelik işaretler', en: 'Everyday cues' },
        body: {
          tr: `Önceki adımlarda gevşeme belirli bir oturuma bağlıydı. Şimdi onu gün içine dağıtıyoruz. Öst'ün protokolünde kişi gün boyunca tekrar eden birkaç doğal olayı işaret olarak seçer ve her işaret geldiğinde 20–30 saniyelik bir gevşeme yapar. Günde 15–20 kez tekrarlanan bu kısa uygulamalar, gün boyu biriken gerginliği oluşmadan boşaltır.

İşaret olarak işe yarayanlar: telefon çalması veya bildirim sesi, saate bakmak, bir kapıdan geçmek, su içmek, bilgisayarda yeni bir sekme açmak, kırmızı ışıkta beklemek, merdiven çıkmak. İşaretin günde çok kez, fark edilir biçimde ve stresli olmayan bir bağlamda gerçekleşmesi gerekir. Üç dört işaret yeterlidir; telefonunuzun duvar kâğıdına ya da masanıza küçük bir renkli nokta koymak hatırlamaya yardım eder.`,
          en: `In the earlier steps relaxation was tied to a set session. Now we spread it through the day. In Öst's protocol the person chooses a few natural events that recur during the day as cues and does a 20–30 second relaxation each time one occurs. Repeated 15–20 times a day, these brief practices drain tension before it accumulates.

Cues that work: the phone ringing or a notification tone, looking at the clock, walking through a door, drinking water, opening a new tab on the computer, waiting at a red light, climbing stairs. The cue must occur many times a day, be noticeable and happen in a context that is not stressful. Three or four cues are enough; a small coloured dot on your phone wallpaper or your desk helps you remember.`,
        },
      },
      {
        heading: { tr: '20–30 saniyelik gevşeme', en: 'The 20–30 second relaxation' },
        kind: 'exercise',
        body: {
          tr: `1. İşareti fark edin.
2. Bir iki derin nefes alın.
3. Her nefes verişte zihninizden "gevşe" deyin.
4. Omuzlardan başlayarak bedeni hızla tarayın: yüz, çene, omuzlar, eller, karın. Gerginlik bulduğunuz yeri nefesle bırakın.
5. Yaptığınız işe devam edin.

Bu uygulama göze çarpmaz; toplantıda, kuyrukta, otobüste yapılabilir. Kimse fark etmez. Bir hafta boyunca günde en az 15 kez uygulayın; her uygulamayı saymak gerekmez, işaretler hatırlatacaktır.`,
          en: `1. Notice the cue.
2. Take one or two deep breaths.
3. On each out-breath say "relax" in your mind.
4. Scan the body quickly from the shoulders down: face, jaw, shoulders, hands, abdomen. Release any tension you find with the breath.
5. Carry on with what you were doing.

This practice is invisible; it can be done in a meeting, in a queue, on the bus. No one notices. For a week practise at least 15 times a day; you do not need to count each one, the cues will remind you.`,
        },
      },
      {
        heading: { tr: 'Tinnitusun kendisi bir işaret olarak', en: 'The tinnitus itself as a cue' },
        kind: 'tip',
        body: {
          tr: `Bu haftadan itibaren tinnitusu fark etmenin kendisini bir işaret yapmayı deneyin. Sesi fark ettiğiniz anda iki nefes, "gevşe", hızlı tarama. Bu, beynin ses ile gerginlik arasında kurduğu bağı ses ile gevşeme arasında yeni bir bağa dönüştürmeye başlar. Bir gecede olmaz; ama her tekrar, sesin anlamını biraz değiştirir.

Dikkat: sesi gevşeme ile "kapatmaya" çalışmayın. Gevşemenin amacı sesi yok etmek değil, sesle birlikte sakin kalabilmektir. Ses gevşemeden sonra da oradaysa uygulama yine başarılıdır.`,
          en: `From this week on, try making the noticing of tinnitus itself a cue. The moment you notice the sound: two breaths, "relax", quick scan. This begins to turn the link the brain has made between sound and tension into a new link between sound and relaxation. It does not happen overnight; but each repetition shifts the meaning of the sound a little.

Note: do not try to "switch off" the sound with relaxation. The purpose of relaxation is not to remove the sound but to stay calm alongside it. If the sound is still there after relaxing, the practice has still worked.`,
        },
      },
    ],
    practice: {
      kind: 'checklist',
      minutes: 3,
      items: [
        { tr: 'Gün içinde sık tekrar eden üç dört işaret seçtim (telefon, kapı, su, saat…).', en: 'I chose three or four cues that recur often during the day (phone, door, water, clock…).' },
        { tr: 'Hatırlatıcı olarak bir yere küçük bir işaret koydum.', en: 'I placed a small reminder mark somewhere.' },
        { tr: 'Bugün en az 15 kez 20–30 saniyelik gevşeme yaptım.', en: 'Today I did the 20–30 second relaxation at least 15 times.' },
        { tr: 'Tinnitusu fark ettiğim en az üç anda hızlı gevşeme uyguladım.', en: 'I applied rapid relaxation in at least three moments when I noticed the tinnitus.' },
      ],
    },
    keyTakeaway: {
      tr: 'Günde 15–20 kez, gündelik işaretlerle yapılan 20–30 saniyelik gevşeme, gerginliğin birikmesini önler; sesi fark etmek de bir işaret olabilir.',
      en: 'A 20–30 second relaxation done 15–20 times a day at everyday cues stops tension from building; noticing the sound can itself be a cue.',
    },
    citations: ['ost1987', 'beukes2018'],
  },
  {
    id: 'cbt.exposure',
    title: { tr: 'Sese bilinçli maruz kalma', en: 'Deliberate exposure to the sound' },
    intro: {
      tr: 'Bu modül programın en zor ve en önemli adımlarından biridir. Haftalardır sesten uzaklaşmanın yollarını çalıştık; şimdi tam tersini yapacağız: sese bilerek, belirli bir süre ve güvenli koşullarda kulak vereceksiniz. Bunun nedeni, kaçınmanın korkuyu beslemesidir.',
      en: 'This module is one of the hardest and most important steps of the programme. For weeks we have practised ways of moving away from the sound; now we will do the opposite: you will deliberately listen to the sound for a set time under safe conditions. The reason is that avoidance feeds fear.',
    },
    sections: [
      {
        heading: { tr: 'Korku-kaçınma döngüsü', en: 'The fear-avoidance loop' },
        body: {
          tr: `Tinnitus rahatsız ettiğinde doğal tepki ondan uzaklaşmaktır: televizyonu açmak, odadan çıkmak, dikkati zorla başka yere çekmek. Bu, kısa vadede rahatlatır. Ancak her kaçınma beyne aynı mesajı verir: "Bu ses tehlikeli, ondan kaçmak gerekiyor." Ses bir sonraki sefer daha büyük bir tehdit olarak gelir ve kaçınma daha da gerekli görünür. Buna korku-kaçınma döngüsü denir; kaygı bozukluklarında ve kronik ağrıda da aynı mekanizma çalışır.

Döngüyü kıran şey, korkulan uyaranla kontrollü biçimde kalmaktır. Sese güvenli bir ortamda, belirli bir süre, kaçmadan kulak verdiğinizde iki şey olur: kaygı önce yükselir, sonra kendiliğinden düşer (buna alışma denir) ve beyin "bu sese kulak verdim, hiçbir şey olmadı" bilgisini kaydeder. Tekrarlarla tehdit etiketi zayıflar. Tinnitus için internet temelli BDT programlarında bu, altıncı haftanın ana modülüdür.`,
          en: `When tinnitus is unpleasant the natural response is to move away from it: turn on the television, leave the room, force attention elsewhere. That brings short-term relief. But each avoidance sends the brain the same message: "This sound is dangerous; it must be escaped." Next time the sound arrives as a bigger threat and avoidance seems even more necessary. This is the fear-avoidance loop; the same mechanism operates in anxiety disorders and chronic pain.

What breaks the loop is staying with the feared stimulus in a controlled way. When you listen to the sound in a safe setting, for a set time, without escaping, two things happen: anxiety rises first and then falls by itself (this is habituation), and the brain records "I listened to this sound and nothing happened." With repetition the threat label weakens. In internet-based CBT programmes for tinnitus this is the core module of week six.`,
        },
      },
      {
        heading: { tr: 'Nasıl yapılır', en: 'How to do it' },
        kind: 'exercise',
        body: {
          tr: `1. **Hazırlık.** Sakin bir yerde oturun. Ortam sesi varsa kapatın; bu egzersizde ses yalnız olmalı. Kısa bir gevşeme (nefesle işaretli) yapın.
2. **Önce puanlayın.** Şu anki rahatsızlığınızı 0–10 arasında puanlayın.
3. **Dinleyin.** Dikkatinizi bilerek sese yöneltin. Sesi merakla inceleyin: perdesi, dokusu, bir mi birden çok mu, sabit mi dalgalı mı, hangi kulakta ya da başın neresinde. Sesi bir araştırmacı gibi betimleyin; yargılamadan.
4. **Kalın.** Kaygı yükselirse kaçmayın; nefesi verin ve dinlemeye devam edin. Dikkat dağılırsa sese geri getirin. Hedef, kaygının kendi başına düştüğünü yaşamaktır.
5. **Sonra puanlayın.** Süre bitince rahatsızlığı yeniden 0–10 puanlayın.

**Süre:** İlk gün 5 dakika. Her gün ya da iki günde bir 2–3 dakika artırarak bir hafta içinde 15 dakikaya çıkın. Günde bir kez, bir iki hafta boyunca. Sonrasında haftada bir iki "bakım" seansı yeterlidir.`,
          en: `1. **Prepare.** Sit somewhere calm. Turn off any background sound; in this exercise the sound should be alone. Do a short relaxation (cue-controlled breathing).
2. **Rate first.** Rate your current distress 0–10.
3. **Listen.** Deliberately turn your attention to the sound. Examine it with curiosity: its pitch, its texture, whether it is one sound or several, steady or fluctuating, in which ear or where in the head. Describe it like a researcher, without judging.
4. **Stay.** If anxiety rises, do not escape; breathe out and keep listening. If attention drifts, bring it back to the sound. The goal is to experience anxiety falling on its own.
5. **Rate after.** When the time is up, rate your distress 0–10 again.

**Duration:** Day one, 5 minutes. Add 2–3 minutes every day or every other day to reach 15 minutes within a week. Once a day for one to two weeks. After that one or two "maintenance" sessions a week are enough.`,
        },
      },
      {
        heading: { tr: 'Ne beklemeli', en: 'What to expect' },
        body: {
          tr: `İlk seanslarda ses daha gürültülü gelebilir; dikkat sese dönünce bu beklenir. Kaygı ilk dakikalarda yükselir, sonra çoğu kişide 5–10 dakika içinde düşmeye başlar. Puanlar seanstan seansa dalgalanır; önemli olan bir iki hafta içindeki eğilimdir: başlangıç puanı düşer, düşüş daha hızlı olur, ses daha az "olay" hâline gelir.

Bazı kişiler ilk seansta rahatlama hisseder; bazıları için birkaç gün gerekir. Puanlar hiç düşmüyorsa süreyi kısaltıp sıklığı artırın ve kaçınmadığınızdan emin olun: dinlerken aynı anda telefona bakmak, zihinde başka şeye kaçmak ya da sesi "ölçerek" tehdit değerlendirmesi yapmak örtülü kaçınmadır.`,
          en: `In the first sessions the sound may seem louder; that is expected when attention turns to it. Anxiety rises in the first minutes, then for most people starts to fall within 5–10 minutes. Scores fluctuate from session to session; what matters is the trend over one or two weeks: the starting score drops, the fall comes faster, the sound becomes less of an "event".

Some people feel relief in the first session; others need a few days. If the scores never fall, shorten the time and increase the frequency, and make sure you are not avoiding: looking at the phone while listening, escaping into other thoughts, or "measuring" the sound to assess threat are covert avoidance.`,
        },
      },
      {
        heading: { tr: 'Güvenlik', en: 'Safety' },
        kind: 'warning',
        body: {
          tr: `Bu egzersiz sese kulak vermektir; ses eklemek değildir. Tinnitusu "duymak için" sesi yükseltmeyin, kulaklık takmayın. Rahatsızlık 10 puana çıkıp birkaç dakika düşmüyorsa seansı kısa gevşeme ile bitirin ve ertesi gün daha kısa süreyle tekrar deneyin. Ses hassasiyeti (hiperakuzi) belirtileriniz varsa programın ses hassasiyeti bölümü bu egzersizi ayrı bir yöntemle ele alır. Egzersiz sonrası sürekli kötüleşme fark ederseniz ara verin ve bir uzmanla konuşun.`,
          en: `This exercise is about listening to the sound, not adding sound. Do not raise the volume or put on earphones "to hear" the tinnitus. If distress reaches 10 and does not fall for several minutes, end the session with a short relaxation and try again the next day for a shorter time. If you have symptoms of sound sensitivity (hyperacusis), the sound sensitivity section of the programme handles this exercise with a separate method. If you notice sustained worsening after the exercise, pause and talk to a specialist.`,
        },
      },
    ],
    practice: { kind: 'exposure', minutes: 5 },
    keyTakeaway: {
      tr: 'Kaçınma korkuyu besler; sese güvenli koşullarda 5 dakikadan 15 dakikaya çıkarak bilerek kulak vermek, kaygının kendi başına düştüğünü yaşatır ve tehdit etiketini zayıflatır.',
      en: 'Avoidance feeds fear; deliberately listening to the sound under safe conditions, building from 5 to 15 minutes, lets you experience anxiety falling on its own and weakens the threat label.',
    },
    citations: ['beukes2018', 'fuller2020', 'hesser2012'],
  },
  {
    id: 'cbt.relax6',
    title: { tr: 'Derin gevşeme 6: uygulamalı gevşeme', en: 'Deep relaxation 6: applied relaxation' },
    intro: {
      tr: 'Son adım, öğrendiğiniz hızlı gevşemeyi gerçekten gerginleştiren durumlarda kullanmaktır. Beceri artık hazır; şimdi işe koşulacak. Bu adım tamamlandığında gevşeme bir egzersiz olmaktan çıkar ve sesle, kaygıyla, günün zorluklarıyla karşılaştığınızda otomatik olarak devreye giren bir araç olur.',
      en: 'The final step is using the rapid relaxation you have learned in situations that genuinely raise tension. The skill is ready; now it goes to work. Once this step is complete, relaxation stops being an exercise and becomes a tool that switches on automatically when you meet the sound, anxiety or the strains of the day.',
    },
    sections: [
      {
        heading: { tr: 'Uygulama eğitimi', en: 'Application training' },
        body: {
          tr: `Öst'ün protokolünde son aşama "uygulama eğitimi"dir: kişi, kaygı yaratan durumları önce hafiften zora doğru sıralar ve hızlı gevşemeyi bu durumlarda sırayla dener. Tinnitus için bu durumlar genellikle şunlardır: sessiz bir odada oturmak, gece yatakta uyanmak, kalabalık ve gürültülü bir ortamda bulunmak, yorgun olmak, sesin aniden yükselmesi, başkalarına tinnitustan söz etmek, konsantrasyon gerektiren bir iş yapmak.

Yöntem: durum başladığında ilk gerginlik işaretini fark edin (omuz, çene, nefes, kalp atışı), 20–30 saniyelik gevşemeyi uygulayın, durumda kalmaya devam edin. Gevşeme durumu değiştirmez; sizin durum içindeki tepkinizi değiştirir. Her uygulama, "bu durumla baş edebiliyorum" kaydını güçlendirir.`,
          en: `The last stage of Öst's protocol is "application training": the person ranks anxiety-provoking situations from mild to hard and tries rapid relaxation in them in turn. For tinnitus these situations are usually: sitting in a quiet room, waking in bed at night, being in a crowded noisy place, being tired, the sound rising suddenly, telling others about the tinnitus, doing work that demands concentration.

The method: when the situation starts, notice the first sign of tension (shoulder, jaw, breath, heartbeat), apply the 20–30 second relaxation, and stay in the situation. Relaxation does not change the situation; it changes your reaction within it. Each application strengthens the record "I can handle this situation."`,
        },
      },
      {
        heading: { tr: 'Kendi listenizi yapın', en: 'Make your own list' },
        kind: 'exercise',
        body: {
          tr: `Sizi gerginleştiren beş altı durum yazın ve her birine 0–100 arasında bir gerginlik puanı verin. En düşük puanlıdan başlayın. Bu hafta her gün en az bir durumda hızlı gevşemeyi bilerek uygulayın; durumu aramak gerekmez, günün içinde zaten gelecektir. Bir durumda gevşeme üst üste birkaç kez işe yaradığında listede bir üst basamağa geçin.

Önceki haftanın maruz kalma egzersizi ile birleştirin: sese kulak verirken kaygı yükseldiğinde hızlı gevşemeyi kullanın, ama sesi dinlemeyi bırakmayın. Gevşeme burada kaçış değil, kalmanın aracıdır.`,
          en: `Write down five or six situations that make you tense and give each a tension score 0–100. Start with the lowest. This week deliberately apply rapid relaxation in at least one situation each day; you do not need to seek them out, the day will bring them. When relaxation has worked several times in a row in one situation, move up a rung on the list.

Combine it with last week's exposure exercise: when anxiety rises while listening to the sound, use rapid relaxation but do not stop listening. Here relaxation is not an escape but the means of staying.`,
        },
      },
      {
        heading: { tr: 'Bakım', en: 'Maintenance' },
        kind: 'tip',
        body: {
          tr: `- Haftada bir kez 15 dakikalık tam kas gevşetme (1. adım) beceriyi taze tutar.
- Günlük hızlı gevşemelere devam edin; bunlar artık alışkanlık olmalıdır.
- Stresli dönemlerde beceri zayıflarsa 2. ve 3. adıma birkaç gün dönün; sıfırdan başlamak gerekmez.
- Uygulamanın Egzersizler bölümündeki nefes ve kas gevşetme oturumları bu adımların rehberli sürümleridir.`,
          en: `- A full 15-minute muscle relaxation (step 1) once a week keeps the skill fresh.
- Keep the daily rapid relaxations; by now they should be a habit.
- If the skill weakens during stressful periods, return to steps 2 and 3 for a few days; there is no need to start from scratch.
- The breathing and muscle relaxation sessions in the Exercises section of the app are guided versions of these steps.`,
        },
      },
    ],
    practice: {
      kind: 'worksheet',
      minutes: 6,
      items: [
        { tr: 'En hafif durum ve gerginlik puanı (0–100)', en: 'Mildest situation and tension score (0–100)' },
        { tr: '2. durum ve puanı', en: 'Situation 2 and score' },
        { tr: '3. durum ve puanı', en: 'Situation 3 and score' },
        { tr: '4. durum ve puanı', en: 'Situation 4 and score' },
        { tr: 'En zor durum ve puanı', en: 'Hardest situation and score' },
        { tr: 'Bu hafta hızlı gevşemeyi hangi durumda, kaç kez uyguladınız ve ne oldu?', en: 'This week, in which situation did you apply rapid relaxation, how many times, and what happened?' },
      ],
    },
    keyTakeaway: {
      tr: 'Uygulamalı gevşeme, hızlı gevşemeyi hafiften zora sıralanmış gerçek durumlarda kullanmaktır; gevşeme durumu değil, durum içindeki tepkinizi değiştirir.',
      en: 'Applied relaxation means using rapid relaxation in real situations ranked from mild to hard; it changes not the situation but your reaction within it.',
    },
    citations: ['ost1987', 'beukes2018'],
  },
  {
    id: 'cbt.attention',
    title: { tr: 'Dikkati yönlendirme', en: 'Redirecting attention' },
    intro: {
      tr: 'Dikkat bir fener gibidir: bir yere yöneltildiğinde orası aydınlanır, gerisi kararır. Tinnitus feneri kendine çeker. Bu modülde feneri bilinçli olarak nasıl hareket ettireceğinizi ve tinnitusu dışlamadan dikkati genişletmeyi çalışacaksınız.',
      en: 'Attention is like a torch: wherever it points lights up, the rest goes dark. Tinnitus pulls the torch towards itself. In this module you will practise moving the torch deliberately and widening attention without shutting the tinnitus out.',
    },
    sections: [
      {
        heading: { tr: 'Dikkat eğitilebilir', en: 'Attention can be trained' },
        body: {
          tr: `Dikkat bir kas gibidir; kullanıldıkça güçlenir ve yönlendirilebilir hâle gelir. Tinnitusta sorun dikkatin "bozuk" olması değil, sesin yüksek öncelik almasıdır. Öncelik, sesin tehdit değeriyle (önceki modüller) ve dikkat alışkanlığıyla belirlenir. Alışkanlık kısmını egzersizle değiştirmek mümkündür.

İki yanlış strateji vardır. Birincisi sesi zorla görmezden gelmeye çalışmak: "Sese dikkat etme" komutu, dikkati sese çeker; beyaz ayıyı düşünmemeye çalışmak gibi. İkincisi dikkati sürekli meşgul tutarak sesi bastırmak: bu yorucudur ve meşguliyet bittiğinde ses daha güçlü döner. Doğru strateji dikkati **esnetmektir**: sesi dahil ederek, ama tek odak yapmadan, dikkati birçok uyaran arasında gezdirmek.`,
          en: `Attention is like a muscle; it strengthens with use and becomes steerable. In tinnitus the problem is not that attention is "broken" but that the sound takes high priority. Priority is set by the sound's threat value (earlier modules) and by habit. The habit part can be changed with exercise.

There are two wrong strategies. The first is trying to ignore the sound by force: the command "do not attend to the sound" draws attention to it, like trying not to think of a white bear. The second is suppressing the sound by keeping attention constantly busy: this is exhausting, and when the activity ends the sound returns stronger. The right strategy is to **stretch** attention: including the sound but not making it the single focus, moving attention among many stimuli.`,
        },
      },
      {
        heading: { tr: 'Üç egzersiz', en: 'Three exercises' },
        kind: 'exercise',
        body: {
          tr: `**1. Ses tarama (3 dakika).** Oturun, gözleri kapatın. Ortamdaki sesleri sayın: en uzaktan en yakına. Trafik, bir kapı, buzdolabı, nefesiniz, tinnitus. Her sese 20–30 saniye kulak verin, sonra bir sonrakine geçin. Tinnitus listedeki seslerden yalnızca biridir; ne atlanır ne de öne alınır.

**2. Dikkat kaydırma (3 dakika).** Dikkatinizi sırayla beş duyuya götürün: üç şey görün, üç ses duyun, üç dokunma hissedin, bir koku, bir tat. Sonra tekrar görmeye dönün. Tinnitus "duyma" turunda yer alır; diğer turlarda arka planda kalır. Bu egzersiz dikkatin ne kadar hızlı taşınabildiğini gösterir.

**3. Geniş dikkat (3 dakika).** Dikkati tek bir noktaya değil, bütün alana açın: bütün sesler, bütün beden, bütün oda aynı anda. Bu "yumuşak odak" hâlinde tinnitus büyük bir resmin küçük bir parçasıdır. Dikkat daralıp sese yapıştığında yeniden genişletin.

Günde bir kez 10 dakika, iki hafta. Egzersizler sesi azaltmak için değil, dikkatin sahibinin siz olduğunu hatırlatmak içindir.`,
          en: `**1. Sound scan (3 minutes).** Sit, close your eyes. Count the sounds around you, from farthest to nearest. Traffic, a door, the fridge, your breath, the tinnitus. Give each sound 20–30 seconds, then move to the next. The tinnitus is only one sound on the list; it is neither skipped nor put first.

**2. Attention shifting (3 minutes).** Take your attention through the five senses in turn: see three things, hear three sounds, feel three touches, one smell, one taste. Then return to seeing. The tinnitus belongs in the "hearing" round; in the other rounds it stays in the background. This exercise shows how quickly attention can be moved.

**3. Wide attention (3 minutes).** Open attention not to a single point but to the whole field: all sounds, the whole body, the whole room at once. In this "soft focus" the tinnitus is a small part of a large picture. When attention narrows and sticks to the sound, widen it again.

Once a day for 10 minutes, two weeks. The exercises are not meant to reduce the sound but to remind you that attention belongs to you.`,
        },
      },
      {
        heading: { tr: 'Konsantrasyon gerektiren işlerde', en: 'During tasks that demand concentration' },
        kind: 'tip',
        body: {
          tr: `- Sessiz ortamda çalışıyorsanız düşük düzeyde ortam sesi açın; dikkat için zemin oluşturur.
- İşi küçük parçalara bölün ve her parçanın başında dikkati bilerek işe yöneltin.
- Ses dikkati çektiğinde bunu bir hata saymayın; "fark ettim" deyin ve işe dönün. Her dönüş bir tekrardır, bir yenilgi değil.
- Yorgunken odaklanma herkes için zordur; sesi suçlamadan önce uykuyu kontrol edin.`,
          en: `- If you work in a quiet room, put on low-level background sound; it gives attention a ground.
- Break the task into small parts and deliberately point attention at the task at the start of each.
- When the sound pulls attention, do not count it as a failure; say "noticed" and return to the task. Each return is a repetition, not a defeat.
- Focus is hard for everyone when tired; check sleep before blaming the sound.`,
        },
      },
    ],
    practice: {
      kind: 'timer',
      minutes: 10,
      steps: [
        { tr: 'Ses tarama: gözleri kapatın. En uzaktaki sesten başlayın. Ne duyuyorsunuz?', en: 'Sound scan: close your eyes. Start from the farthest sound. What do you hear?', seconds: 60 },
        { tr: 'Daha yakın sesler: oda, cihazlar, nefes. Tinnitus da listede, yalnızca biri.', en: 'Nearer sounds: the room, devices, breath. The tinnitus is on the list too, just one of them.', seconds: 60 },
        { tr: 'Her sese sırayla 20 saniye kulak verin; sonra bir sonrakine geçin.', en: 'Give each sound 20 seconds in turn; then move to the next.', seconds: 60 },
        { tr: 'Dikkat kaydırma: gözleri açın. Üç şey görün. Üç ses duyun. Üç dokunma hissedin.', en: 'Attention shifting: open your eyes. See three things. Hear three sounds. Feel three touches.', seconds: 90 },
        { tr: 'Bir koku, bir tat. Sonra tekrar üç şey görün. Dikkatin ne kadar hızlı taşındığını fark edin.', en: 'One smell, one taste. Then see three things again. Notice how fast attention moves.', seconds: 90 },
        { tr: 'Geniş dikkat: bütün sesler, bütün beden, bütün oda aynı anda. Yumuşak odak.', en: 'Wide attention: all sounds, the whole body, the whole room at once. Soft focus.', seconds: 120 },
        { tr: 'Dikkat sese yapıştığında yeniden genişletin. Ses büyük resmin küçük bir parçası.', en: 'When attention sticks to the sound, widen it again. The sound is a small part of a big picture.', seconds: 90 },
        { tr: 'Birkaç nefes. Bitirin.', en: 'A few breaths. Finish.', seconds: 30 },
      ],
    },
    keyTakeaway: {
      tr: 'Sesi görmezden gelmeye çalışmak dikkati sese çeker; doğru yol dikkati esnetmek, sesi dışlamadan birçok uyaran arasında gezdirmektir.',
      en: 'Trying to ignore the sound draws attention to it; the right path is to stretch attention, moving it among many stimuli without shutting the sound out.',
    },
    citations: ['beukes2018', 'fuller2020', 'mckenna2017'],
  },
  {
    id: 'cbt.activity',
    title: { tr: 'Etkinlik planlama ve güvenlik davranışları', en: 'Activity planning and safety behaviours' },
    intro: {
      tr: 'Tinnitus sessizce hayatı daraltabilir: konserden vazgeçilir, arkadaş yemeği ertelenir, akşamlar televizyon karşısında geçer. Bu modül, sesin kıstığı etkinlikleri geri almayı ve "güvenlik davranışı" adı verilen, kısa vadede koruyup uzun vadede tinnitusu güçlendiren alışkanlıkları tanımayı hedefler.',
      en: 'Tinnitus can quietly narrow life: the concert is dropped, dinner with friends postponed, evenings spent in front of the television. This module aims to reclaim the activities the sound has squeezed out, and to recognise "safety behaviours", habits that protect in the short term and strengthen tinnitus in the long term.',
    },
    sections: [
      {
        heading: { tr: 'Daralan hayat', en: 'The narrowing life' },
        body: {
          tr: `Sıkıntı veren bir belirtiyle yaşayan kişi, enerjisini korumak için etkinlikleri azaltır. Bu mantıklı görünür; ama etkinlik azaldıkça keyif ve başarı deneyimleri de azalır, ruh hâli düşer ve düşük ruh hâli tinnitusu daha ağır hissettirir. Günler birbirine benzemeye başlar; ses, günün en belirgin olayı olur.

Davranışsal etkinleştirme, depresyon için en iyi kanıta sahip yöntemlerden biridir ve tinnitus BDT programlarının yedinci haftasında yer alır. İlke basittir: önce hareket, sonra motivasyon. Keyif almayı beklemeden, planlayarak etkinliğe dönmek. Ruh hâli etkinliği takip eder; tersi nadiren olur.`,
          en: `A person living with a distressing symptom reduces activities to conserve energy. That seems sensible; but as activity shrinks, so do experiences of pleasure and achievement, mood drops, and low mood makes tinnitus feel heavier. Days start to look alike; the sound becomes the most prominent event of the day.

Behavioural activation is among the best-evidenced methods for depression and sits in week seven of tinnitus CBT programmes. The principle is simple: action first, motivation second. Returning to activity by plan, without waiting to feel like it. Mood follows activity; the reverse rarely happens.`,
        },
      },
      {
        heading: { tr: 'Güvenlik davranışları', en: 'Safety behaviours' },
        body: {
          tr: `Güvenlik davranışı, tehlike hissini azaltmak için yapılan ama tehlikenin gerçek olmadığını öğrenmeyi engelleyen her şeydir. Tinnitusta sık görülenler:

- **Sessizlikten kaçınmak:** her ortamda bir ses açmak zorunda hissetmek; ses zenginleştirme ile farkı, zorunluluk hissidir.
- **Kulak tıkacı kullanmak:** gürültülü olmayan ortamlarda (lokanta, toplantı, ev) tıkaç takmak işitme sistemini sese daha duyarlı hâle getirir ve ses hassasiyetine zemin hazırlar.
- **Sesi kontrol etmek:** gün içinde "hâlâ orada mı, arttı mı" diye dinlemek, parmağıyla kulağı tıkayarak ölçmek.
- **Sürekli araştırmak:** internette yeni tedaviler aramak, forumlarda kötü hikâyeler okumak.
- **Konuşmaktan kaçınmak ya da sürekli konuşmak:** her ikisi de sesin önemini büyütür.

Bu davranışların hepsi anlaşılır. Ancak her biri beyne aynı mesajı verir: "Bu ses tehlikeli, önlem gerekiyor." Programın bu haftasında bir iki tanesini bilerek bırakacaksınız.`,
          en: `A safety behaviour is anything done to reduce the sense of danger that prevents learning the danger is not real. Common ones in tinnitus:

- **Avoiding silence:** feeling compelled to have sound on in every setting; the difference from sound enrichment is the sense of compulsion.
- **Using earplugs:** wearing plugs in places that are not loud (restaurant, meeting, home) makes the hearing system more sensitive to sound and lays the ground for sound sensitivity.
- **Checking the sound:** listening during the day to see "is it still there, has it grown", measuring by pressing a finger in the ear.
- **Constant researching:** searching online for new treatments, reading bad stories on forums.
- **Avoiding talking about it, or talking constantly:** both enlarge the importance of the sound.

All of these are understandable. But each sends the brain the same message: "This sound is dangerous; precautions are needed." This week you will deliberately drop one or two of them.`,
        },
      },
      {
        heading: { tr: 'Haftalık plan', en: 'The weekly plan' },
        kind: 'exercise',
        body: {
          tr: `1. Son aylarda azalttığınız ya da bıraktığınız etkinlikleri listeleyin: sosyal (arkadaş görmek), fiziksel (yürüyüş, spor), keyif (müzik, sinema, hobi), başarı (bir işi bitirmek, öğrenmek).
2. Her birine iki puan verin: keyif 0–10, önem 0–10.
3. Bu hafta için üç etkinlik seçin: biri kolay, biri orta, biri sizi biraz zorlayan. Gün ve saat belirleyin; "bir ara" planı değildir.
4. Etkinlikten önce ve sonra ruh hâlinizi 0–10 puanlayın.
5. Bırakacağınız bir güvenlik davranışı seçin ve bu hafta onu yapmadığınız günleri işaretleyin.

Gürültülü ortam planlıyorsanız (konser, düğün) gerçekten yüksek sesli ortamlarda kulak koruması kullanmak güvenlik davranışı değil, işitme sağlığıdır. Fark, ortamın ses düzeyidir: 85 desibel ve üstü koruma gerektirir; bir lokanta gerektirmez.`,
          en: `1. List the activities you have reduced or dropped in recent months: social (seeing friends), physical (walking, sport), pleasure (music, cinema, a hobby), achievement (finishing a task, learning).
2. Give each two scores: pleasure 0–10, importance 0–10.
3. Choose three activities for this week: one easy, one medium, one that stretches you a little. Set a day and time; "sometime" is not a plan.
4. Rate your mood 0–10 before and after the activity.
5. Choose one safety behaviour to drop and mark the days this week on which you did not do it.

If you plan a loud setting (concert, wedding), using hearing protection in genuinely loud environments is not a safety behaviour but hearing health. The difference is the sound level: 85 decibels and above warrants protection; a restaurant does not.`,
        },
      },
    ],
    practice: {
      kind: 'worksheet',
      minutes: 8,
      items: [
        { tr: 'Kolay etkinlik: ne, hangi gün, saat kaçta?', en: 'Easy activity: what, which day, what time?' },
        { tr: 'Orta etkinlik: ne, hangi gün, saat kaçta?', en: 'Medium activity: what, which day, what time?' },
        { tr: 'Zorlayıcı etkinlik: ne, hangi gün, saat kaçta?', en: 'Stretching activity: what, which day, what time?' },
        { tr: 'Bu hafta bırakacağım güvenlik davranışı', en: 'The safety behaviour I will drop this week' },
        { tr: 'Etkinlik sonrası notlar: önce/sonra ruh hâli puanları ve gözlemler', en: 'Notes after the activities: before/after mood scores and observations' },
      ],
    },
    keyTakeaway: {
      tr: 'Ruh hâli etkinliği izler; planlı etkinliklere dönmek ve kulak tıkacı, ses kontrolü gibi güvenlik davranışlarını bırakmak sesin hayattaki yerini küçültür.',
      en: 'Mood follows activity; returning to planned activities and dropping safety behaviours such as earplugs and sound checking shrinks the place of the sound in life.',
    },
    citations: ['fuller2020', 'beukes2018', 'juris2014'],
  },
