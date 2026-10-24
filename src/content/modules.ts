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
      {
        heading: { tr: 'Neden iki hafta', en: 'Why two weeks' },
        body: {
          tr: `Öst'ün protokolünde her adım bir iki hafta sürer ve toplam eğitim 8–12 hafta alır. Bu süre keyfi değildir: gevşeme bir bilgi değil, bir motor beceridir; bisiklete binmek ya da bir enstrüman çalmak gibi tekrarla yerleşir. İki haftalık düzenli uygulamanın ardından beden, "bırak" komutunu daha az çabayla uygular ve bir sonraki adım (nefesle işaretli gevşeme) bu temelin üstüne kurulur.

Günlük kayıtta gevşeme sonrası gerginlik puanınızı not etmeye devam edin. Puanlar bir çizgi gibi değil, dalgalı bir eğri gibi düşer; iki haftanın sonunda ortalamaya bakın.`,
          en: `In Öst's protocol each step lasts one to two weeks and the whole training takes 8–12 weeks. That time is not arbitrary: relaxation is not a piece of knowledge but a motor skill; like riding a bicycle or playing an instrument it settles in through repetition. After two weeks of regular practice the body carries out the "release" command with less effort, and the next step (cue-controlled breathing) is built on that foundation.

Keep noting your post-relaxation tension score in the daily record. Scores fall not in a straight line but as a wavy curve; at the end of the two weeks look at the average.`,
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
      {
        heading: { tr: 'Bir örnek kayıt', en: 'A sample entry' },
        body: {
          tr: `**Durum:** Pazartesi 08.15, işe giderken araçta, radyo kapalı.
**Otomatik düşünce:** "Sabahtan bu kadar yüksekse bugün hiçbir şey yapamayacağım."
**Duygu ve şiddeti:** Kaygı 70, bıkkınlık 60.
**Ne yaptım:** Radyoyu açtım, sesi yüksek yaptım, toplantıyı erteleme bahanesi düşündüm.

Bu kaydın değerini dördüncü haftada göreceksiniz: "hiçbir şey yapamayacağım" cümlesi bir falcılık örneğidir; radyoyu yüksek açmak ise bir güvenlik davranışıdır. Şimdilik yalnızca bu dört satırı yakalamak yeterlidir.`,
          en: `**Situation:** Monday 8.15 am, in the car on the way to work, radio off.
**Automatic thought:** "If it is this loud in the morning I will not get anything done today."
**Feeling and intensity:** Anxiety 70, weariness 60.
**What I did:** Turned the radio on, turned it up, thought of an excuse to postpone the meeting.

You will see the value of this entry in week four: "I will not get anything done" is an example of fortune telling; turning the radio up is a safety behaviour. For now, catching these four lines is enough.`,
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

İyi haber, uykunun tinnitustan bağımsız olarak düzeltilebilir olmasıdır. Marks ve arkadaşlarının 2023 tarihli randomize çalışmasında uykusuzluk için BDT, tinnitus eğitimi ve ses zenginleştirmesine dayalı bakıma kıyasla uykuda ve tinnitus sıkıntısında daha büyük düzelme sağladı. Uykuyu hedeflemek tinnitusa da iyi gelir.`,
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
      {
        heading: { tr: 'Sık sorulanlar', en: 'Common questions' },
        body: {
          tr: `- **Nefesim sıkışıyor.** Altı saniyelik veriş zorlayıcı geliyorsa dört saniyeye inin; ritmin yavaş ve rahat olması sayıdan önemlidir. Baş dönmesi olursa nefesi derinleştirmeyi bırakın ve normal nefese dönün.
- **Sözcük işe yaramıyor gibi.** İlk hafta sözcük boş bir etikettir; eşleşme tekrarla oluşur. İki hafta sonunda sözcüğü gün içinde söylediğinizde omuzların kendiliğinden düştüğünü fark edebilirsiniz.
- **Hangi adımda kalmalıyım?** Bu adımı en az bir hafta günde iki kez uyguladıktan ve 2–3 dakikada belirgin gevşeme hissettikten sonra dördüncü adıma geçin.`,
          en: `- **My breath feels tight.** If the six-second out-breath feels forced, drop to four; a slow, comfortable rhythm matters more than the count. If you feel light-headed, stop deepening the breath and return to normal breathing.
- **The word does not seem to work.** In the first week the word is an empty label; the pairing forms with repetition. After two weeks you may notice your shoulders dropping by themselves when you say the word during the day.
- **When should I move on?** After practising this step twice daily for at least a week and feeling clear relaxation within 2–3 minutes, move to step four.`,
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
          tr: `- **Felaketleştirme:** "Bu ses sonunda beni delirtecek." Olası en kötü sonucu olacakmış gibi ele almak.
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
      {
        heading: { tr: 'Düşünce ile duygu arasındaki bağ', en: 'The link between thought and feeling' },
        body: {
          tr: `Kalıpları tanırken duyguya da bakın. Her kalıbın tipik bir duygusu vardır: felaketleştirme kaygı, zorunluluk cümleleri öfke ve suçluluk, zihinsel süzgeç umutsuzluk, aşırı genelleme çaresizlik üretir. Günlükteki duygu sütunu, hangi kalıbın işlediğine dair ipucu verir: öfke hissediyorsanız bir "olmalı" cümlesi arayın; umutsuzluk varsa günün iyi saatlerinin silinip silinmediğine bakın.

Bu ilişki iki yönlü çalışır. Kalıbı tanıyıp düşünceye mesafe koyduğunuzda duygu birkaç puan düşer; düşen duygu ise bir sonraki düşüncenin daha az çarpık olmasını sağlar. Gelecek hafta bu döngüyü bilinçli olarak kullanacaksınız.`,
          en: `As you recognise patterns, look at the feeling too. Each pattern has a typical feeling: catastrophising produces anxiety, should statements anger and guilt, the mental filter hopelessness, overgeneralising helplessness. The feeling column in the diary gives a clue to which pattern is at work: if you feel anger, look for a "should" sentence; if hopelessness, check whether the good hours of the day have been erased.

The link works both ways. When you recognise the pattern and put distance between yourself and the thought, the feeling drops a few points; the lowered feeling then lets the next thought be less distorted. Next week you will use this loop deliberately.`,
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
      {
        heading: { tr: 'Günlük hayattan örnekler', en: 'Examples from daily life' },
        body: {
          tr: `- **Bilgisayarda:** Ekrana yaklaşırken boyun öne uzar, omuzlar kalkar. Gerekli olan yalnızca gözler ve parmaklardır. Omuzları indirin, çeneyi geri çekin, nefes verin.
- **Telefonda:** Telefonu omuzla sıkıştırmak boyun ve çeneyi gerer. Elinizle tutun ya da hoparlörü kullanın; diğer el serbest.
- **Araçta:** Direksiyonu "gerektiği kadar" tutun; kırmızı ışıkta omuz ve çene taraması.
- **Yürürken:** Çanta tek omuzda ise omuz kalkar; çantayı değiştirin ya da sırt çantası kullanın.
- **Yemek yerken:** Çiğnerken çene zaten çalışıyor; omuzlar ve alın ona katılmak zorunda değil.`,
          en: `- **At the computer:** Leaning towards the screen pushes the neck forward and lifts the shoulders. Only the eyes and fingers are needed. Lower the shoulders, draw the chin back, breathe out.
- **On the phone:** Pinning the phone with the shoulder tenses neck and jaw. Hold it in the hand or use the speaker; the other hand free.
- **In the car:** Hold the wheel "as much as needed"; a shoulder and jaw scan at red lights.
- **Walking:** A bag on one shoulder lifts that shoulder; switch sides or use a backpack.
- **Eating:** The jaw is already working while chewing; shoulders and forehead need not join in.`,
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
      {
        heading: { tr: 'Sık karşılaşılan zorluklar', en: 'Common difficulties' },
        body: {
          tr: `- **Unutuyorum.** İşaret seçimi yeterince belirgin değildir. İlk hafta telefonunuza saat başı sessiz bir hatırlatıcı kurun; ikinci haftadan itibaren işaretler kendi başına çalışmaya başlar.
- **Gevşeme çok sığ.** 20–30 saniyede derin gevşeme beklenmez; hedef gerginliğin birikmesini engellemektir. Akşam toplam gerginlik puanınıza bakın; sığ ama sık gevşeme, günün sonunda belirgin fark yaratır.
- **Başkalarının yanında garip hissediyorum.** Uygulama görünmezdir; iki nefes ve omuzların inmesi kimse tarafından fark edilmez.`,
          en: `- **I forget.** The cues are not distinctive enough. In the first week set a silent hourly reminder on your phone; from the second week the cues begin to work on their own.
- **The relaxation is too shallow.** Deep relaxation is not expected in 20–30 seconds; the goal is to stop tension accumulating. Look at your total tension score in the evening; shallow but frequent relaxation makes a clear difference by the end of the day.
- **I feel awkward around others.** The practice is invisible; two breaths and shoulders dropping are noticed by no one.`,
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
      {
        heading: { tr: 'Bir örnek', en: 'An example' },
        body: {
          tr: `Durum: akşam yemeğinde kalabalık bir lokanta, gerginlik puanı 60. Giriş öncesi iki nefes, "gevşe". Masaya otururken hızlı tarama: omuzlar kalkmış, çene sıkı; bırakın. Konuşma sırasında ses belirginleşince kaçmak yerine yeniden iki nefes; sesi dışlamayın, masadaki konuşmaya dikkati genişletin. Yemeğin sonunda gerginlik 30. Kayıt: "Kaldım, gevşedim, ses oradaydı, yemek güzeldi."

Bu kayıtlar sekiz hafta boyunca birikir ve bakım döneminde "ben bunu yapabiliyorum" kanıtı olarak işe yarar.`,
          en: `Situation: a busy restaurant at dinner, tension score 60. Two breaths before going in, "relax". Sitting down, a quick scan: shoulders up, jaw tight; let go. When the sound comes forward during conversation, two breaths again instead of escaping; do not shut the sound out, widen attention to the talk at the table. By the end of the meal tension is 30. Record: "I stayed, I relaxed, the sound was there, the meal was good."

These records accumulate over eight weeks and serve in the maintenance period as evidence that "I can do this".`,
        },
      },
      {
        heading: { tr: 'Gevşeme ile kaçınma arasındaki fark', en: 'The difference between relaxation and avoidance' },
        body: {
          tr: `Bir uyarı: hızlı gevşeme, rahatsız edici durumdan "kurtulmak" için kullanıldığında güvenlik davranışına dönüşebilir. Ölçüt niyettir. "Gevşiyorum ki bu ortamda kalabileyim" yaklaşmadır; "gevşiyorum ki ses gitsin" kaçınmadır. İlkinde ses oradayken sakin kalmayı öğrenirsiniz; ikincisinde ses gitmediğinde hayal kırıklığı gelir ve gevşeme "işe yaramadı" diye bırakılır.

Her uygulamadan sonra kendinize bir soru sorun: Durumda kaldım mı? Kaldıysanız egzersiz amacına ulaşmıştır; sesin ne yaptığı ikincildir.`,
          en: `A caution: rapid relaxation can turn into a safety behaviour when used to "get rid of" an unpleasant situation. The criterion is intention. "I relax so that I can stay in this setting" is approach; "I relax so that the sound goes" is avoidance. In the first you learn to stay calm while the sound is there; in the second, disappointment follows when the sound does not go, and relaxation is dropped as "not working".

After each application ask yourself one question: Did I stay in the situation? If you did, the exercise reached its goal; what the sound did is secondary.`,
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
  {
    id: 'cbt.relapse',
    title: { tr: 'Geriye dönüşleri önleme', en: 'Preventing setbacks' },
    intro: {
      tr: 'Sekiz haftanın sonuna geldiniz. Tinnitus dalgalanır; kötü günler ve kötü haftalar olacaktır. Bu modül, kötü bir dönemin program öncesine dönüş anlamına gelmediğini ve erken işaretleri fark edip ne yapacağınızı önceden planlamayı anlatır.',
      en: 'You have reached the end of the eight weeks. Tinnitus fluctuates; there will be bad days and bad weeks. This module explains why a bad period does not mean a return to before the programme, and how to plan ahead for recognising early signs and knowing what to do.',
    },
    sections: [
      {
        heading: { tr: 'Dalgalanma ile geriye dönüş arasındaki fark', en: 'The difference between a fluctuation and a relapse' },
        body: {
          tr: `Tinnitus şiddeti yorgunluk, hastalık, stres, gürültü, uykusuzluk ve mevsimle değişir. Programı tamamlamış kişilerin çoğu da zaman zaman sesin yükseldiği günler yaşar. Bu bir **dalgalanmadır**: birkaç gün ile bir hafta sürer, tetikleyicisi genellikle bellidir ve beceriler kullanıldığında geçer.

**Geriye dönüş** ise sıkıntının haftalarca sürmesi ve eski kalıpların (kaçınma, ses kontrolü, felaketleştirme, uykusuzluk döngüsü) geri gelmesidir. Geriye dönüşler de olur ve çoğu, becerilerin bir süre kullanılmamasıyla ilişkilidir. İyi haber: öğrendiğiniz beceriler silinmez. Bir iki haftalık yoğun uygulama genellikle sizi kaldığınız yere getirir; sekiz haftaya yeniden gerek yoktur.

Önemli bir tuzak: "Ses yine yükseldi, demek ki hiçbir şey işe yaramadı." Bu, tanıdığınız bir kalıp: ya hep ya hiç. Sekiz hafta önce yazdığınız ilk çalışma kâğıdına bakın; neyin değiştiğini oradan görün.`,
          en: `Tinnitus severity changes with fatigue, illness, stress, noise, lack of sleep and the seasons. Most people who have completed the programme still have days when the sound rises. That is a **fluctuation**: it lasts a few days to a week, the trigger is usually obvious, and it passes when the skills are used.

A **relapse** is distress lasting for weeks with the old patterns returning (avoidance, sound checking, catastrophising, the insomnia loop). Relapses happen too, and most are linked to the skills going unused for a while. The good news: what you have learned is not erased. One or two weeks of intensive practice usually bring you back to where you were; another eight weeks are not needed.

One important trap: "The sound is up again, so nothing worked." That is a pattern you know: all-or-nothing. Look at the first worksheet you wrote eight weeks ago and see from there what has changed.`,
        },
      },
      {
        heading: { tr: 'Erken uyarı işaretleri', en: 'Early warning signs' },
        body: {
          tr: `Her kişinin kendi işaretleri vardır. Sık görülenler:

- Sesi gün içinde "kontrol etmeye" başlamak.
- Sessizlikten yeniden kaçınmak; kulak tıkacı ya da sürekli ses ihtiyacı.
- Uyku düzeninin bozulması; yatakta uyanık kalarak dinlemek.
- İnternette tedavi aramaya dönmek.
- Etkinlikleri iptal etmek, sosyal planlardan çekilmek.
- Gevşeme ve dikkat egzersizlerini "artık gerek yok" diye bırakmak.
- "Bu böyle sürüp gidecek" tarzı düşüncelerin günlüğe girmeden dolaşması.

İşaretlerden ikisi iki haftadan uzun sürdüğünde bakım planınızı devreye sokun.`,
          en: `Each person has their own signs. Common ones:

- Starting to "check" the sound during the day.
- Avoiding silence again; needing earplugs or constant sound.
- Sleep routine breaking down; lying awake in bed listening.
- Returning to online searches for treatments.
- Cancelling activities, withdrawing from social plans.
- Dropping relaxation and attention exercises because "they are no longer needed".
- Thoughts like "this will go on forever" circulating without entering the diary.

When two of these signs last longer than two weeks, activate your maintenance plan.`,
        },
      },
      {
        heading: { tr: 'Bakım planı', en: 'The maintenance plan' },
        kind: 'exercise',
        body: {
          tr: `Aşağıdaki çalışma kâğıdı kişisel bakım planınızı oluşturur. Planı bir yerde görünür tutun; gerektiğinde açıp okumak için yazılır.

**Rutin (iyi dönemlerde):** haftada bir 15 dakikalık tam gevşeme, günlük hızlı gevşemeler, haftada bir iki kısa maruz kalma seansı, aylık kısa değerlendirme (uygulama hatırlatacaktır).

**Kötü bir dönemde (ilk iki hafta):** günlük derin gevşeme (2. ya da 3. adım), her gün bir düşünce kaydı, her gün 10 dakika maruz kalma, uyku kurallarına geri dönüş, bir güvenlik davranışını bırakma. Sesle ilgili araştırmayı durdurma.

**Yardım alma eşiği:** dört haftalık yoğun uygulamaya rağmen sıkıntı sürüyorsa, uyku ciddi biçimde bozulduysa, ruh hâli belirgin düştüyse veya sesin niteliği değiştiyse (yeni başlayan tek taraflılık, nabız gibi atma, işitmede düşüş, baş dönmesi) bir uzmana başvurun. Kendinize zarar verme düşünceleri için beklemeyin: 112.`,
          en: `The worksheet below builds your personal maintenance plan. Keep it somewhere visible; it is written to be opened and read when needed.

**Routine (in good periods):** one full 15-minute relaxation a week, daily rapid relaxations, one or two short exposure sessions a week, a brief monthly check (the app will remind you).

**In a bad period (first two weeks):** daily deep relaxation (step 2 or 3), one thought record every day, 10 minutes of exposure every day, a return to the sleep rules, dropping one safety behaviour. Stopping research about the sound.

**Threshold for seeking help:** if distress continues despite four weeks of intensive practice, if sleep is seriously disrupted, if mood has clearly dropped, or if the character of the sound has changed (new one-sidedness, pulsing, a drop in hearing, dizziness), see a specialist. Do not wait with thoughts of self-harm: 112.`,
        },
      },
    ],
    practice: {
      kind: 'worksheet',
      minutes: 10,
      items: [
        { tr: 'Sekiz haftada neyin değiştiğini üç cümleyle yazın (ilk çalışma kâğıdınıza bakın).', en: 'Write in three sentences what has changed in eight weeks (look at your first worksheet).' },
        { tr: 'Benim erken uyarı işaretlerim (en az üç)', en: 'My early warning signs (at least three)' },
        { tr: 'En çok işe yarayan üç beceri', en: 'The three skills that helped most' },
        { tr: 'Kötü bir dönemde ilk iki hafta yapacaklarım', en: 'What I will do in the first two weeks of a bad period' },
        { tr: 'Destek alacağım kişi ya da uzman', en: 'The person or professional I will turn to for support' },
      ],
    },
    keyTakeaway: {
      tr: 'Kötü günler dalgalanmadır, geriye dönüş değil; beceriler silinmez ve bir iki haftalık yoğun uygulama sizi kaldığınız yere getirir.',
      en: 'Bad days are fluctuations, not relapses; the skills are not erased and one or two weeks of intensive practice bring you back to where you were.',
    },
    citations: ['beukes2018', 'fuller2020'],
  },
  {
    id: 'cbt.hearingTactics',
    title: { tr: 'İşitme taktikleri', en: 'Hearing tactics' },
    intro: {
      tr: 'Tinnitusla birlikte işitme güçlüğü yaşayan kişilerde iletişim çabası günü yorar ve yorgunluk sesi büyütür. Bu modül, dinlemeyi kolaylaştıran pratik taktikleri ve işitme cihazı değerlendirmesinin neden öncelikli olduğunu anlatır.',
      en: 'For people who have hearing difficulty alongside tinnitus, the effort of communication tires the day and fatigue magnifies the sound. This module covers practical tactics that make listening easier and why a hearing-aid evaluation is a priority.',
    },
    sections: [
      {
        heading: { tr: 'İşitme kaybı ve tinnitus', en: 'Hearing loss and tinnitus' },
        body: {
          tr: `Tinnitusu olan kişilerin büyük bölümünde bir derece işitme kaybı vardır; çoğu bunu fark etmez çünkü kayıp genellikle yüksek frekanslarda başlar ve konuşmanın yalnızca bazı sesleri (s, f, ş gibi) kaybolur. Sonuç: kalabalıkta anlamak zorlaşır, televizyon açılır, "efendim?" sayısı artar. Beyin eksik sinyali tamamlamak için daha çok çalışır; bu çaba gün sonunda yorgunluk ve gerginlik olarak birikir.

Kılavuzlar, işitme kaybı iletişimi etkiliyorsa işitme cihazı değerlendirmesini önerir; cihazlar hem konuşmayı kolaylaştırır hem de dış sesleri güçlendirerek tinnitusun zemine karışmasına yardım eder. Avrupa'da çok merkezli bir çalışmada işitme cihazı, tinnitus için tek başına uygulanan yöntemler arasında en büyük etkilerden birini gösterdi. Bu yüzden programınızda odyoloji randevusu bir "görev" olarak yer alır.`,
          en: `Most people with tinnitus have some degree of hearing loss; many do not realise it because the loss usually starts at high frequencies and only some speech sounds (s, f, sh) are lost. The result: understanding in crowds gets harder, the television goes up, the number of "pardon?" rises. The brain works harder to fill in the missing signal; that effort accumulates by evening as fatigue and tension.

Guidelines recommend a hearing-aid evaluation when hearing loss affects communication; aids make speech easier and, by amplifying outside sounds, help tinnitus blend into the ground. In a European multicentre trial, hearing aids showed one of the largest effects among single treatments for tinnitus. That is why an audiology appointment appears as a "task" in your programme.`,
        },
      },
      {
        heading: { tr: 'Ortamı düzenlemek', en: 'Arranging the setting' },
        body: {
          tr: `- Konuşan kişinin yüzünü görün; dudak ve yüz ifadesi anlamanın yüzde otuzunu taşır. Işık konuşanın yüzüne düşsün, sizin arkanızda olmasın.
- Lokantada duvara yakın, köşe masası seçin; sırtınız kalabalığa dönük olsun. Hoparlör ve mutfak kapısından uzak durun.
- Evde televizyon ya da müzik açıkken konuşma yapmayın; birini kapatın.
- Toplantıda konuşanın karşısına değil, yanına yakın oturun; gündemi önceden isteyin.
- Telefonda konuşurken sessiz bir odaya geçin; görüntülü arama dudak okumaya izin verir.`,
          en: `- See the speaker's face; lips and expression carry about a third of understanding. Have the light fall on the speaker's face, not behind you.
- In a restaurant choose a corner table near a wall with your back to the crowd. Keep away from speakers and the kitchen door.
- At home do not hold conversations with the television or music on; switch one off.
- In meetings sit close to the speaker rather than opposite; ask for the agenda in advance.
- On the phone move to a quiet room; video calls allow lip reading.`,
        },
      },
      {
        heading: { tr: 'Konuşmayı yönetmek', en: 'Managing the conversation' },
        body: {
          tr: `- Karşınızdakine ne yapmasını istediğinizi açıkça söyleyin: "Yüzüme bakarak ve biraz yavaş konuşursanız daha iyi anlıyorum." Bağırmak anlamayı artırmaz; net ve yavaş konuşma artırır.
- "Efendim?" yerine duyduğunuz kısmı tekrarlayın: "Saat yedide buluşalım dediniz, nerede?" Böylece karşınızdaki yalnızca eksik parçayı tekrarlar.
- Anladığınızı varsaymayın; tahmin ederek başınızı sallamak yanlış anlaşılmalara yol açar.
- Dinleme yorgunluğu gerçektir. Uzun sosyal etkinliklerde kısa molalar planlayın; sessiz bir yere beş dakika çıkmak çoğu zaman yeter.
- İşitme güçlüğünden söz etmek, tinnitustan söz etmekten daha kolaydır ve insanlar genellikle yardımcı olmak ister.`,
          en: `- Tell the other person clearly what you need: "I understand better if you face me and speak a little slower." Shouting does not improve understanding; clear, slow speech does.
- Instead of "pardon?", repeat the part you heard: "You said let's meet at seven; where?" Then the other person repeats only the missing piece.
- Do not assume you understood; nodding on a guess leads to misunderstandings.
- Listening fatigue is real. Plan short breaks during long social events; five minutes somewhere quiet is often enough.
- Talking about hearing difficulty is easier than talking about tinnitus, and people usually want to help.`,
        },
      },
      {
        heading: { tr: 'Odyoloji randevusu', en: 'The audiology appointment' },
        kind: 'tip',
        body: {
          tr: `Uygulamadaki işitme taraması bir tarama aracıdır; klinik odyometrinin yerine geçmez. Odyoloji randevusunda tam işitme testi, tinnitusun işitme kaybı ile ilişkisi ve işitme cihazı seçenekleri değerlendirilir. Cihaz denemesi genellikle birkaç haftalık alışma gerektirir; ilk günlerde sesler fazla keskin gelebilir, bu normaldir. Tinnitus için özel "ses üreteci" programı olan cihazlar vardır; ancak Cochrane derlemesine göre ses üreteci eklentisinin danışmanlığa ek katkısı gösterilmemiştir, karar işitme ihtiyacına göre verilmelidir.`,
          en: `The hearing screen in the app is a screening tool; it does not replace clinical audiometry. At the audiology appointment a full hearing test, the link between tinnitus and hearing loss and hearing-aid options are assessed. A trial of aids usually needs a few weeks of adjustment; in the first days sounds may seem too sharp, which is normal. Some aids have a dedicated "sound generator" programme for tinnitus; but according to the Cochrane review the generator add-on has not been shown to add to counselling, so the decision should rest on hearing need.`,
        },
      },
    ],
    practice: {
      kind: 'checklist',
      minutes: 4,
      items: [
        { tr: 'Odyoloji randevusu aldım ya da tarihini belirledim.', en: 'I booked an audiology appointment or set a date for it.' },
        { tr: 'En az bir sosyal ortamda oturma yerimi işitmeye göre seçtim.', en: 'In at least one social setting I chose my seat with hearing in mind.' },
        { tr: 'Bir yakınıma nasıl konuşmasını istediğimi söyledim.', en: 'I told someone close to me how I would like them to speak.' },
        { tr: '"Efendim?" yerine duyduğum kısmı tekrarlamayı denedim.', en: 'I tried repeating the part I heard instead of "pardon?".' },
      ],
    },
    keyTakeaway: {
      tr: 'İşitme güçlüğü dinleme çabasını artırır ve yorgunluk sesi büyütür; ortamı düzenlemek, karşınızdakine ne istediğinizi söylemek ve işitme cihazı değerlendirmesi öncelikli adımlardır.',
      en: 'Hearing difficulty raises listening effort and fatigue magnifies the sound; arranging the setting, telling others what you need and a hearing-aid evaluation are the priority steps.',
    },
    citations: ['tunkel2014', 'sereda2018', 'nice2020'],
  },
  {
    id: 'cbt.concentration',
    title: { tr: 'Konsantrasyon yönetimi', en: 'Managing concentration' },
    intro: {
      tr: 'Okurken satırı kaybetmek, toplantıda konuşmayı kaçırmak, bir işi yarım bırakmak: tinnitusu olan kişilerin en sık dile getirdiği yakınmalardan biri konsantrasyondur. Bu isteğe bağlı modül, dikkat egzersizlerinin üzerine çalışma düzenine dair pratik yöntemler ekler.',
      en: 'Losing the line while reading, missing the thread in a meeting, leaving a task half done: concentration is one of the most common complaints of people with tinnitus. This optional module adds practical methods for organising work on top of the attention exercises.',
    },
    sections: [
      {
        heading: { tr: 'Neden odaklanmak zorlaşır', en: 'Why focusing gets harder' },
        body: {
          tr: `Konsantrasyon güçlüğünün üç kaynağı vardır ve genellikle birlikte işler. Birincisi dikkatin sese kayması: beyin sesi öncelikli saydığı sürece her sessiz an dikkati böler. İkincisi uykusuzluk: kötü bir gecenin ertesi günü herkes için odaklanma zordur; ses suçlanır ama asıl etken uykudur. Üçüncüsü kaygı: "Odaklanamıyorum, işimi yapamayacağım" düşüncesi bir ikinci iş yükü yaratır ve dikkatin bir kısmını kendine ayırır.

Bu üç kaynağı birbirinden ayırmak, çözümü de ayırır. Günlük kayıtlarınıza bakın: odaklanmanın en zor olduğu günler uykusuz günler mi? Ses en çok sessiz işlerde mi rahatsız ediyor? Kaygı mı yoksa ses mi önce geliyor?`,
          en: `Concentration difficulty has three sources, and they usually work together. First, attention drifting to the sound: as long as the brain counts the sound as a priority, every quiet moment splits attention. Second, lack of sleep: the day after a bad night focus is hard for everyone; the sound gets blamed but sleep is the real factor. Third, anxiety: the thought "I cannot focus, I will not be able to do my job" creates a second workload and takes a share of attention for itself.

Separating these three sources separates the solutions. Look at your daily records: are the days when focus is hardest the sleepless ones? Does the sound bother you most during quiet tasks? Does anxiety or the sound come first?`,
        },
      },
      {
        heading: { tr: 'Çalışma düzeni', en: 'Organising work' },
        body: {
          tr: `- **Kısa bloklar.** 25 dakika odaklanmış çalışma, 5 dakika mola. Molada hızlı gevşeme ve kısa bir yürüyüş. Dört bloktan sonra uzun mola.
- **Tek görev.** Aynı anda iki iş yapmak dikkati böler; ses bu bölünmede boşluğa yerleşir. Bir seferde tek sekme, tek belge.
- **Zor işi sabaha.** Yorgunlukla ses fark edilirliği artar; en çok dikkat isteyen işi günün en dinç saatine koyun.
- **Ortam sesi.** Sessiz ofiste düşük düzeyde pembe gürültü ya da doğa sesi; sözlü müzik dikkati böler.
- **Başlangıç ritüeli.** Her bloğun başında 30 saniye: nefes, "gevşe", göreve bakış. Bu küçük ritüel dikkati bilerek işe yöneltir.
- **Yazılı not.** Aklınıza gelen başka işleri bir kâğıda yazıp bırakın; zihin onları tutmak zorunda kalmaz.`,
          en: `- **Short blocks.** 25 minutes of focused work, 5 minutes off. In the break, rapid relaxation and a short walk. A longer break after four blocks.
- **One task.** Doing two things at once splits attention; the sound settles into the gap. One tab, one document at a time.
- **Hard work in the morning.** Fatigue raises how noticeable the sound is; put the task that needs most attention into the freshest hour of the day.
- **Background sound.** In a quiet office, low-level pink noise or nature sound; music with lyrics splits attention.
- **A starting ritual.** 30 seconds at the start of each block: breath, "relax", a look at the task. This small ritual points attention deliberately at the work.
- **Written notes.** Write other tasks that come to mind on paper and leave them; the mind no longer has to hold them.`,
        },
      },
      {
        heading: { tr: 'Ses dikkati çektiğinde', en: 'When the sound pulls attention' },
        kind: 'exercise',
        body: {
          tr: `Çalışırken sesi fark ettiğinizde üç adımlık kısa bir yöntem uygulayın:

1. **Etiketle:** "Ses fark edildi." Yargı yok, ölçüm yok.
2. **Nefes:** Bir nefes verişte "gevşe".
3. **Geri dön:** Göreve bakın ve kaldığınız cümleyi ya da satırı yüksek sesle ya da içinizden okuyun.

Bu üç adım 10 saniye sürer. Günde yirmi kez tekrarlanması bir başarısızlık değil, dikkat kasının yirmi tekrarlık antrenmanıdır. Bir hafta boyunca bir çalışma oturumunda kaç kez geri döndüğünüzü sayın; sayı genellikle azalır, azalmasa bile geri dönüş hızlanır.`,
          en: `When you notice the sound while working, apply a short three-step method:

1. **Label:** "Sound noticed." No judgement, no measuring.
2. **Breath:** "Relax" on one out-breath.
3. **Return:** Look at the task and read the sentence or line you were on, aloud or silently.

These three steps take 10 seconds. Repeating them twenty times a day is not a failure; it is twenty repetitions of training for the attention muscle. For a week, count how many times you return in one work session; the number usually falls, and even if it does not, the return gets faster.`,
        },
      },
      {
        heading: { tr: 'İş yerinde', en: 'At work' },
        kind: 'tip',
        body: {
          tr: `Tinnitus görünmez olduğu için iş yerinde anlaşılması zordur. Yöneticinize ya da ekibinize söylemek zorunda değilsiniz; ancak sessiz bir çalışma alanı, kulaklıkla düşük düzeyde ortam sesi ya da gürültülü ortamda molalar gibi küçük düzenlemeler çoğu iş yerinde kolayca sağlanır. Bunları "işitme ile ilgili bir durum" olarak istemek yeterlidir.`,
          en: `Because tinnitus is invisible it is hard to understand at work. You do not have to tell your manager or team; but small adjustments such as a quiet work area, low-level background sound through earphones, or breaks in noisy settings are easy to arrange in most workplaces. Asking for them as "a hearing-related condition" is enough.`,
        },
      },
    ],
    practice: {
      kind: 'checklist',
      minutes: 3,
      items: [
        { tr: 'Bugün en az iki 25 dakikalık tek görev bloğu çalıştım.', en: 'Today I worked at least two 25-minute single-task blocks.' },
        { tr: 'En zor işi günün en dinç saatine koydum.', en: 'I put the hardest task in the freshest hour of the day.' },
        { tr: 'Sessiz ortamda düşük düzeyde ortam sesi kullandım.', en: 'I used low-level background sound in the quiet setting.' },
        { tr: 'Ses dikkatimi çektiğinde etiketle–nefes–geri dön yöntemini uyguladım.', en: 'When the sound pulled my attention I used label–breath–return.' },
      ],
    },
    keyTakeaway: {
      tr: 'Konsantrasyon güçlüğü ses, uykusuzluk ve kaygının karışımıdır; kısa tek görev blokları, ortam sesi ve etiketle–nefes–geri dön yöntemi dikkati işe geri getirir.',
      en: 'Concentration difficulty is a mix of the sound, poor sleep and anxiety; short single-task blocks, background sound and label–breath–return bring attention back to the work.',
    },
    citations: ['beukes2018', 'fuller2020'],
  },
  {
    id: 'cbt.toolbox',
    title: { tr: 'Araç kutunuz', en: 'Your toolbox' },
    intro: {
      tr: 'Sekiz haftada bir dizi beceri öğrendiniz. Bu kısa modül, hepsini tek bir sayfada toplar: hangi aracı ne zaman kullanacağınızı gösteren kişisel bir rehber. Programın bakım döneminde ve zor günlerde buraya dönün.',
      en: 'Over eight weeks you have learned a set of skills. This short module gathers them on one page: a personal guide to which tool to use when. Return here during the maintenance period and on hard days.',
    },
    sections: [
      {
        heading: { tr: 'Beceriler ve kullanım yerleri', en: 'The skills and where they fit' },
        body: {
          tr: `- **Hızlı gevşeme (20–30 sn):** Ses fark edildiğinde, gerginlik yükselirken, uykuya dalmadan önce. Günde 15–20 kez.
- **Nefesle işaretli gevşeme (2–3 dk):** Yoğun bir günün ortasında, toplantı öncesinde, gece uyanınca.
- **Tam kas gevşetme (15 dk):** Haftada bir bakım; stresli dönemlerde günlük.
- **Düşünce kaydı:** Duygunun şiddeti 50'nin üzerine çıktığında; "bu böyle sürecek" tarzı cümleler belirdiğinde.
- **Kalıp adlandırma:** Kayıt yapacak zaman yokken; "felaketleştirme" demek bile mesafe açar.
- **Olumlu imgeleme / güvenli yer:** Uykuya dalarken, kaygılı bekleyişlerde.
- **Maruz kalma (5–15 dk):** Sesten kaçındığınızı fark ettiğinizde; haftada bir iki bakım seansı.
- **Dikkat egzersizleri (10 dk):** Sesin dikkati sürekli çektiği dönemlerde; sessiz işlerde çalışmadan önce.
- **Etkinlik planı:** Hayat daraldığında, ruh hâli düştüğünde; haftalık üç planlı etkinlik.
- **Uyku kuralları:** Sabit kalkış, yatak yalnızca uyku için, 15–20 dakikada kalk; her zaman.
- **Ses zenginleştirme:** Sessiz ortamlarda, gece; karışma noktasının altında.
- **İşitme taktikleri:** Kalabalık ortamlarda; odyoloji takibi.`,
          en: `- **Rapid relaxation (20–30 s):** When the sound is noticed, as tension rises, before falling asleep. 15–20 times a day.
- **Cue-controlled breathing (2–3 min):** In the middle of a busy day, before a meeting, on waking at night.
- **Full muscle relaxation (15 min):** Weekly maintenance; daily in stressful periods.
- **Thought record:** When the intensity of a feeling passes 50; when "this will go on forever" sentences appear.
- **Naming the pattern:** When there is no time for a record; even saying "catastrophising" opens distance.
- **Positive imagery / safe place:** While falling asleep, during anxious waiting.
- **Exposure (5–15 min):** When you notice you are avoiding the sound; one or two maintenance sessions a week.
- **Attention exercises (10 min):** In periods when the sound keeps pulling attention; before quiet work.
- **Activity plan:** When life narrows, when mood drops; three planned activities a week.
- **Sleep rules:** Fixed rise time, bed only for sleep, up after 15–20 minutes; always.
- **Sound enrichment:** In quiet settings, at night; below the mixing point.
- **Hearing tactics:** In crowded settings; audiology follow-up.`,
        },
      },
      {
        heading: { tr: 'Hangi durumda hangisi', en: 'Which one in which situation' },
        body: {
          tr: `- **Ses aniden yükseldi:** Hızlı gevşeme → kalıp adlandırma ("duygusal akıl yürütme: yükseldi gibi hissediyorum") → gerekirse ortam sesi. Ölçmeyin.
- **Gece uyandım:** Saate bakma → nefesle gevşeme yatakta → 15–20 dakika sonra kalk, loş ışık, düşük ses → uyku gelince dön.
- **Kötü bir hafta:** Günlük derin gevşeme + bir düşünce kaydı + 10 dakika maruz kalma + bir planlı etkinlik. İki hafta sürdür.
- **Sosyal plan öncesi kaygı:** Düşünce kaydı (falcılık?) → işitme taktikleri → plana git; iptal etmek güvenlik davranışıdır.
- **"Hiçbir şey işe yaramıyor":** İlk çalışma kâğıdını aç → ya hep ya hiç kalıbını adlandır → bakım planına bak.`,
          en: `- **The sound rose suddenly:** Rapid relaxation → name the pattern ("emotional reasoning: it feels louder") → background sound if needed. Do not measure.
- **I woke at night:** No clock → breathing relaxation in bed → up after 15–20 minutes, dim light, low sound → back when sleepy.
- **A bad week:** Daily deep relaxation + one thought record + 10 minutes of exposure + one planned activity. Keep it up for two weeks.
- **Anxiety before a social plan:** Thought record (fortune telling?) → hearing tactics → go; cancelling is a safety behaviour.
- **"Nothing works":** Open the first worksheet → name the all-or-nothing pattern → look at the maintenance plan.`,
        },
      },
      {
        heading: { tr: 'Kendi araç kutunuz', en: 'Your own toolbox' },
        kind: 'exercise',
        body: {
          tr: `Aşağıya kendi sıralamanızı yazın: sizin için en çok işe yarayan üç araç, en çok zorlandığınız durum ve o durumda ilk yapacağınız şey. Bu sayfa sizin olsun; genel liste değil, kişisel rehber.`,
          en: `Below, write your own ranking: the three tools that work best for you, the situation you find hardest, and the first thing you will do in it. Let this page be yours; a personal guide, not a general list.`,
        },
      },
      {
        heading: { tr: 'Bakım döneminde', en: 'In the maintenance period' },
        body: {
          tr: `Program dokuzuncu haftadan itibaren pekiştirme dönemine geçer: modül okuması azalır, uygulama sürer. Aylık kısa bir değerlendirme (THI) sizi ve uygulamayı eğilim konusunda bilgilendirir; 7 puanlık değişim anlamlı sayılır, tek bir ölçüme değil iki üç ölçümün yönüne bakın.

Araç kutusu zamanla değişebilir. Üç ay sonra bu sayfaya dönüp sıralamayı güncelleyin: bazı araçlar artık otomatikleşmiş, bazıları gereksizleşmiş, yeni durumlar ortaya çıkmış olabilir. Sayfanın güncel olması, zor bir günde işe yaramasının koşuludur.`,
          en: `From week nine the programme moves into a consolidation period: module reading decreases, practice continues. A brief monthly check (THI) informs you and the app about the trend; a 7-point change counts as meaningful, so look at the direction of two or three measurements rather than a single one.

The toolbox can change over time. Return to this page after three months and update the ranking: some tools may have become automatic, some unnecessary, new situations may have arisen. Keeping the page current is the condition for it working on a hard day.`,
        },
      },
    ],
    practice: {
      kind: 'worksheet',
      minutes: 5,
      items: [
        { tr: 'Benim için en çok işe yarayan üç araç', en: 'The three tools that work best for me' },
        { tr: 'En çok zorlandığım durum', en: 'The situation I find hardest' },
        { tr: 'O durumda ilk yapacağım şey', en: 'The first thing I will do in that situation' },
        { tr: 'Haftalık bakım rutinim (gün ve saat)', en: 'My weekly maintenance routine (day and time)' },
      ],
    },
    keyTakeaway: {
      tr: 'Her beceri belirli bir duruma uyar; araç kutusu, zor günde düşünmeden açılıp uygulanacak kişisel bir rehberdir.',
      en: 'Each skill fits a particular situation; the toolbox is a personal guide to be opened and used on a hard day without having to think.',
    },
    citations: ['beukes2018', 'ost1987'],
  },
];

// ---------------------------------------------------------------------------------------------
// ACT alternative (Hesser 2012 / Westin 2011)
// ---------------------------------------------------------------------------------------------
const ACT: Module[] = [
  {
    id: 'act.acceptance',
    title: { tr: 'Kabul: mücadeleyi bırakmak', en: 'Acceptance: dropping the struggle' },
    intro: {
      tr: 'Kabul ve Kararlılık Terapisi (ACT), düşünceleri değiştirmek yerine onlarla ilişkiyi değiştirmeyi önerir. Tinnitus için internet üzerinden uygulanan ACT, randomize bir çalışmada BDT ile eşdeğer bulundu. Bu modül ilk ilkeyi ele alır: sesle mücadele, sesin kendisinden daha yorucu olabilir.',
      en: 'Acceptance and Commitment Therapy (ACT) proposes changing the relationship with thoughts rather than the thoughts themselves. Internet-delivered ACT for tinnitus was found equivalent to CBT in a randomised trial. This module takes up the first principle: the struggle with the sound can be more exhausting than the sound.',
    },
    sections: [
      {
        heading: { tr: 'İki ok', en: 'Two arrows' },
        body: {
          tr: `Eski bir benzetme: bir ok size isabet ettiğinde acı duyarsınız. Sonra ikinci bir ok gelir: "Neden ben? Bu ne zaman geçecek? Dayanamıyorum." İlk ok tinnitustur; onu seçmediniz. İkinci ok, sesle kurduğunuz mücadeledir: onu bastırmaya, ölçmeye, ondan kaçmaya ve ona kızmaya harcanan enerji. ACT'nin gözlemi, ikinci okun çoğu zaman birinciden daha fazla acı verdiğidir.

Mücadele doğaldır; sorun çözen bir zihnin yapması gerekeni yapmasıdır. Ancak tinnitus, çözülecek bir sorun gibi davranmaz. Ses kontrolümüzde değildir; sesle ilişkimiz ise kontrolümüzdedir. Kabul, sesi sevmek, onaylamak ya da pes etmek değildir. Kabul, değiştiremediğiniz şeyle savaşmayı bırakıp enerjiyi değiştirebildiğiniz şeylere yöneltmektir.`,
          en: `An old analogy: when an arrow hits you, you feel pain. Then a second arrow comes: "Why me? When will this end? I cannot bear it." The first arrow is the tinnitus; you did not choose it. The second arrow is the struggle you have built with the sound: the energy spent suppressing, measuring, escaping and resenting it. ACT's observation is that the second arrow often hurts more than the first.

Struggle is natural; it is a problem-solving mind doing what it should. But tinnitus does not behave like a problem to be solved. The sound is not within our control; our relationship with it is. Acceptance is not liking the sound, approving of it or giving up. Acceptance is ceasing to fight what you cannot change and directing energy towards what you can.`,
        },
      },
      {
        heading: { tr: 'Kontrol tuzağı', en: 'The control trap' },
        body: {
          tr: `Şu deneyi yapın: önümüzdeki 30 saniye boyunca tinnitusu duymamaya çalışın. Ne oldu? Dikkat sese gitti. Zihin, dış dünyada işe yarayan bir kuralı ("istemediğin şeyden kurtul") iç dünyaya uyguladığında ters sonuç alır. İstenmeyen bir sesi, düşünceyi ya da duyguyu bastırma çabası onu güçlendirir.

Son aylarda sesi kontrol etmek için neler yaptığınızı düşünün: sessizlikten kaçınmak, forumlarda saatler, ilaç ve takviyeler, sesi örten yüksek müzik, sinirlenmek, kendinize kızmak. Her birinin kısa vadeli etkisi ve uzun vadeli maliyeti nedir? Çoğu kişi bu listeyi yazdığında mücadelenin bedelini görür: zaman, para, uyku, ilişkiler, keyif. Bu, mücadelede başarısız olduğunuz anlamına gelmez; kuralın bu alanda işlemediği anlamına gelir.`,
          en: `Try this: for the next 30 seconds, try not to hear the tinnitus. What happened? Attention went to the sound. When the mind applies a rule that works in the outside world ("get rid of what you do not want") to the inner world, it backfires. The effort to suppress an unwanted sound, thought or feeling strengthens it.

Think about what you have done in recent months to control the sound: avoiding silence, hours on forums, medicines and supplements, loud music to cover it, getting angry, blaming yourself. What is the short-term effect and the long-term cost of each? When most people write this list they see the price of the struggle: time, money, sleep, relationships, pleasure. That does not mean you failed at the struggle; it means the rule does not work in this domain.`,
        },
      },
      {
        heading: { tr: 'İstekli olma egzersizi', en: 'The willingness exercise' },
        kind: 'exercise',
        body: {
          tr: `Bu egzersiz, BDT'deki maruz kalmanın ACT'deki karşılığıdır: sese kulak vermek, ama onu değiştirme niyeti olmadan.

1. Rahat oturun, gözleri kapatın. Birkaç nefes.
2. Dikkati sese getirin. Onu bir misafir gibi karşılayın: "Buradasın." Hoş geldin demek zorunda değilsiniz; sadece oradalığını kabul edin.
3. Sesi merakla betimleyin: perdesi, dokusu, hareketi, bedende nerede hissedildiği. Olduğu gibi, olmasını istediğiniz gibi değil.
4. Sesle birlikte ortaya çıkan duyguyu fark edin: öfke, korku, bıkkınlık. Ona da yer açın. Bedende nerede? Hangi şekilde?
5. Her nefes verişte sesin ve duygunun etrafındaki direnci yumuşatın. Sesi azaltmak için değil, direnci azaltmak için. Omuzlar, çene, karın.
6. Bir dakika boyunca sesi ve duyguyu olduğu gibi tutun; itmeden, tutmadan.
7. Dikkati bütün odaya genişletin ve bitirin.

Günde bir kez, 8–10 dakika, bir hafta. Rahatsızlık azalırsa güzel; azalmazsa da egzersiz işe yaramıştır, çünkü amaç rahatsızlığı azaltmak değil, onunla birlikte var olmayı öğrenmektir.`,
          en: `This exercise is ACT's counterpart to exposure in CBT: listening to the sound, but without the intention of changing it.

1. Sit comfortably, close your eyes. A few breaths.
2. Bring attention to the sound. Receive it like a guest: "You are here." You need not say welcome; just acknowledge its presence.
3. Describe the sound with curiosity: its pitch, texture, movement, where it is felt in the body. As it is, not as you wish it were.
4. Notice the feeling that arises with the sound: anger, fear, weariness. Make room for that too. Where in the body? What shape?
5. On each out-breath soften the resistance around the sound and the feeling. Not to reduce the sound, but to reduce the resistance. Shoulders, jaw, belly.
6. For one minute hold the sound and the feeling as they are; without pushing, without clinging.
7. Widen attention to the whole room and finish.

Once a day, 8–10 minutes, for a week. If discomfort decreases, good; if not, the exercise has still worked, because the aim is not to reduce discomfort but to learn to exist alongside it.`,
        },
      },
    ],
    practice: {
      kind: 'timer',
      minutes: 9,
      steps: [
        { tr: 'Oturun, gözleri kapatın. Birkaç nefes.', en: 'Sit, close your eyes. A few breaths.', seconds: 45 },
        { tr: 'Dikkati sese getirin. Bir misafir gibi: "Buradasın."', en: 'Bring attention to the sound. Like a guest: "You are here."', seconds: 60 },
        { tr: 'Sesi merakla betimleyin: perde, doku, hareket, bedende yer. Olduğu gibi.', en: 'Describe the sound with curiosity: pitch, texture, movement, place in the body. As it is.', seconds: 90 },
        { tr: 'Sesle gelen duyguyu fark edin. Ona da yer açın. Bedende nerede?', en: 'Notice the feeling that comes with the sound. Make room for it too. Where in the body?', seconds: 90 },
        { tr: 'Her nefes verişte direnci yumuşatın. Sesi değil, direnci. Omuzlar, çene, karın.', en: 'On each out-breath soften the resistance. Not the sound, the resistance. Shoulders, jaw, belly.', seconds: 90 },
        { tr: 'Sesi ve duyguyu olduğu gibi tutun. İtmeden, tutmadan.', en: 'Hold the sound and the feeling as they are. Without pushing, without clinging.', seconds: 90 },
        { tr: 'Dikkati bütün odaya genişletin. Gözleri açın.', en: 'Widen attention to the whole room. Open your eyes.', seconds: 30 },
      ],
    },
    keyTakeaway: {
      tr: 'Sesle mücadele ikinci bir ok gibi acıyı artırır; kabul, sesi onaylamak değil, değiştiremediğinizle savaşmayı bırakıp enerjiyi değiştirebildiğinize yöneltmektir.',
      en: 'The struggle with the sound adds pain like a second arrow; acceptance is not approving of the sound but ceasing to fight what you cannot change and directing energy to what you can.',
    },
    citations: ['hesser2012', 'fuller2020'],
  },
  {
    id: 'act.defusion',
    title: { tr: 'Ayrışma: düşünceleri düşünce olarak görmek', en: 'Defusion: seeing thoughts as thoughts' },
    intro: {
      tr: '"Bu ses beni mahvedecek" cümlesi zihinde belirdiğinde onu bir gerçek gibi yaşarız. ACT buna "kaynaşma" der: düşünceyle o kadar iç içe geçeriz ki düşüncenin bir düşünce olduğunu unuturuz. Ayrışma, düşünceyi değiştirmeden ona bir adım geriden bakmayı öğretir.',
      en: 'When the sentence "this sound will destroy me" appears, we live it as a fact. ACT calls this "fusion": we become so entangled with the thought that we forget it is a thought. Defusion teaches us to step back from the thought without changing it.',
    },
    sections: [
      {
        heading: { tr: 'Düşünce ile olgu arasındaki fark', en: 'The difference between a thought and a fact' },
        body: {
          tr: `Zihin durmaksızın cümleler üretir; bu onun işidir. Cümlelerin bir kısmı doğru, bir kısmı yanlış, çoğu ise yalnızca tahmindir. Sorun yanlış düşünceler değil, düşüncelere gerçek muamelesi yapmaktır. "Bu gece uyuyamayacağım" düşüncesi gerçek sayıldığında kaygı yükselir, beden uyanır ve düşünce kendini doğrular.

BDT'de düşünceyi sorgular ve kanıt tartarız. ACT farklı bir yol sunar: düşünceyi doğru ya da yanlış diye yargılamadan, ona "zihnimin ürettiği bir cümle" olarak bakmak. İki yol birbirini dışlamaz; düşünce sorgulama size yorucu geliyorsa ya da tartışma düşünceyi daha da büyütüyorsa ayrışma daha hafif bir yol olabilir.`,
          en: `The mind produces sentences without pause; that is its job. Some are true, some false, most are just guesses. The problem is not wrong thoughts but treating thoughts as reality. When the thought "I will not sleep tonight" is taken as fact, anxiety rises, the body wakes up and the thought confirms itself.

In CBT we question the thought and weigh the evidence. ACT offers a different path: looking at the thought as "a sentence my mind produced" without judging it true or false. The two paths do not exclude each other; if questioning thoughts feels exhausting, or if arguing makes the thought bigger, defusion may be a lighter path.`,
        },
      },
      {
        heading: { tr: 'Ayrışma teknikleri', en: 'Defusion techniques' },
        kind: 'exercise',
        body: {
          tr: `Her birini en az bir kez deneyin; size uyan iki üçünü günlük hayata alın.

- **"Şu düşünceye sahibim ki…"** Düşünceyi bu kalıpla söyleyin: "Şu düşünceye sahibim ki bu ses beni mahvedecek." Sonra: "Şu düşünceye sahip olduğumu fark ediyorum ki…" Her ek, düşünce ile aranıza bir katman koyar.
- **Akıntıdaki yapraklar.** Gözleri kapatın, bir dere hayal edin. Her düşünce geldiğinde onu bir yaprağın üstüne koyun ve akıp gitmesini izleyin. Düşünceyi hızlandırmayın, durdurmayın. Tinnitusla ilgili düşünceler de birer yapraktır. 5 dakika.
- **Teşekkür et.** Zihin bir uyarı ürettiğinde: "Teşekkürler zihin, bunu daha önce de söylemiştin." Alaycı değil, nazik.
- **Düşünceyi şarkı söyle.** En ağır cümleyi bir çocuk şarkısının melodisiyle içinizden söyleyin. Cümle aynı, gücü farklı.
- **Yolcu benzetmesi.** Siz bir otobüs sürücüsüsünüz; tinnitus ve onunla ilgili düşünceler arkada oturan gürültücü yolcular. Bağırabilirler, yol tarif edebilirler; direksiyon sizde. Yolcuları indirmeye çalışmak otobüsü durdurur; onları arkada bırakıp sürmek sizi gideceğiniz yere götürür.`,
          en: `Try each at least once; take the two or three that suit you into daily life.

- **"I am having the thought that…"** Say the thought in this frame: "I am having the thought that this sound will destroy me." Then: "I notice I am having the thought that…" Each addition puts a layer between you and the thought.
- **Leaves on a stream.** Close your eyes, imagine a stream. Each time a thought arrives, place it on a leaf and watch it drift away. Do not speed the thought up or stop it. Thoughts about tinnitus are leaves too. 5 minutes.
- **Say thank you.** When the mind produces a warning: "Thank you, mind, you have said that before." Not sarcastic, kind.
- **Sing the thought.** Sing the heaviest sentence silently to the tune of a children's song. Same sentence, different power.
- **The passengers.** You are a bus driver; the tinnitus and the thoughts about it are noisy passengers at the back. They can shout and give directions; the wheel is yours. Trying to throw the passengers off stops the bus; leaving them at the back and driving takes you where you are going.`,
        },
      },
      {
        heading: { tr: 'Ne beklemeli', en: 'What to expect' },
        body: {
          tr: `Ayrışma düşünceyi yok etmez; düşüncenin davranışınızı yönetme gücünü azaltır. "Bu gece uyuyamayacağım" düşüncesi gelmeye devam eder, ama artık yatakta saatlerce dinlemenize yol açmaz. Başarı ölçütü düşüncenin kaybolması değil, düşünceye rağmen yapmak istediğinizi yapmaktır.

İlk günlerde teknikler yapay gelebilir. Bu normaldir; alışkanlık hâline gelmesi birkaç hafta alır. "Şu düşünceye sahibim ki" kalıbı çoğu kişi için en kolay başlangıçtır.`,
          en: `Defusion does not remove the thought; it reduces the thought's power to run your behaviour. "I will not sleep tonight" keeps coming, but it no longer leads to hours of listening in bed. The measure of success is not that the thought disappears but that you do what you want to do despite it.

In the first days the techniques may feel artificial. That is normal; becoming a habit takes a few weeks. The "I am having the thought that" frame is the easiest start for most people.`,
        },
      },
    ],
    practice: {
      kind: 'timer',
      minutes: 6,
      steps: [
        { tr: 'Gözleri kapatın. Yavaş akan bir dere hayal edin; üstünde yapraklar.', en: 'Close your eyes. Imagine a slowly flowing stream with leaves on it.', seconds: 45 },
        { tr: 'Her düşünce geldiğinde onu bir yaprağa koyun ve akıp gitmesini izleyin.', en: 'Each time a thought arrives, place it on a leaf and watch it drift away.', seconds: 90 },
        { tr: 'Tinnitusla ilgili bir düşünce geldiğinde: o da bir yaprak. Hızlandırmayın, durdurmayın.', en: 'When a thought about tinnitus arrives: that is a leaf too. Do not speed it up or stop it.', seconds: 90 },
        { tr: 'Dere durduysa ya da yaprağa bindiyseniz, fark edin ve kıyıya dönün.', en: 'If the stream has stopped or you have climbed onto a leaf, notice and return to the bank.', seconds: 90 },
        { tr: 'Son yaprakları izleyin. Gözleri açın.', en: 'Watch the last leaves. Open your eyes.', seconds: 45 },
      ],
    },
    keyTakeaway: {
      tr: 'Düşünceyle kaynaşmak onu gerçek yapar; "şu düşünceye sahibim ki" demek ya da düşünceyi akıntıdaki bir yaprağa koymak, onu değiştirmeden gücünü azaltır.',
      en: 'Fusing with a thought makes it feel real; saying "I am having the thought that" or placing it on a leaf in the stream reduces its power without changing it.',
    },
    citations: ['hesser2012'],
  },
  {
    id: 'act.values',
    title: { tr: 'Değerler: pusulayı bulmak', en: 'Values: finding the compass' },
    intro: {
      tr: 'Tinnitus hayatın merkezine yerleştiğinde günler sesi yönetmekle geçer ve asıl önemli şeyler kenara itilir. Bu modül pusulayı yeniden kurmaya yöneliktir: sizin için gerçekten neyin önemli olduğunu adlandırmak ve sesin kıstığı alanlarda yeniden adım atmak.',
      en: 'When tinnitus settles at the centre of life, days are spent managing the sound and what really matters is pushed aside. This module is about resetting the compass: naming what truly matters to you and stepping back into the areas the sound has squeezed.',
    },
    sections: [
      {
        heading: { tr: 'Hedef ile değer arasındaki fark', en: 'The difference between a goal and a value' },
        body: {
          tr: `Hedef, ulaşılıp bitirilen bir şeydir: bir sınavı geçmek, bir yolculuğa çıkmak. Değer ise bir yön, bir pusula ibresidir: "iyi bir anne olmak", "öğrenmeye açık kalmak", "bedenime iyi bakmak". Değere ulaşılmaz; değer yönünde yürünür. Batıya ulaşamazsınız ama batıya doğru gidebilirsiniz.

Tinnitusla ilgili en sık görülen hedef "sesin yok olması"dır. Bu hedef kontrolünüzde değildir ve hayatı bekleme odasına çevirir: "Ses geçince gezeceğim, ses geçince kitabı bitireceğim." ACT bu hedefi değil, altındaki değeri sorar: Ses geçseydi hayatınızda ne yapardınız? Yanıt genellikle değerlerinizdir: bağ kurmak, yaratmak, dinlenmek, katkıda bulunmak. İyi haber, bunlara ses varken de yürüyebilmenizdir.`,
          en: `A goal is something reached and finished: passing an exam, taking a trip. A value is a direction, a compass needle: "being a good parent", "staying open to learning", "taking care of my body". Values are not reached; they are walked towards. You cannot arrive at west, but you can head west.

The most common goal around tinnitus is "the sound disappearing". That goal is not within your control and turns life into a waiting room: "I will travel once the sound goes, I will finish the book once the sound goes." ACT asks not about this goal but about the value beneath it: if the sound went, what would you do with your life? The answer is usually your values: connection, creating, resting, contributing. The good news is that you can walk towards these while the sound is there.`,
        },
      },
      {
        heading: { tr: 'Yaşam alanları', en: 'Life domains' },
        kind: 'exercise',
        body: {
          tr: `Aşağıdaki alanları düşünün. Her biri için iki şey yazın: bu alanda nasıl bir insan olmak istiyorsunuz (değer) ve şu anda bu yönde ne kadar yürüyorsunuz (0–10).

- **Yakın ilişkiler:** eş, aile, çocuklar.
- **Arkadaşlık ve toplum:** dostlar, komşular, gönüllülük.
- **İş ve öğrenme:** meslek, beceri, merak.
- **Sağlık ve beden:** hareket, uyku, beslenme.
- **Dinlenme ve keyif:** hobi, doğa, sanat, oyun.
- **Anlam:** inanç, doğa, katkı; sizin için ne anlama geliyorsa.

Değer puanı ile yürüme puanı arasındaki fark büyükse, orası sesin en çok yer kapladığı alandır. Bu, suçlama değil, haritadır. Bir sonraki modülde bu haritadan somut adımlar çıkaracağız.`,
          en: `Consider the domains below. For each, write two things: what kind of person you want to be in this domain (the value) and how much you are currently walking in that direction (0–10).

- **Close relationships:** partner, family, children.
- **Friendship and community:** friends, neighbours, volunteering.
- **Work and learning:** occupation, skill, curiosity.
- **Health and body:** movement, sleep, food.
- **Rest and enjoyment:** hobbies, nature, art, play.
- **Meaning:** faith, nature, contribution; whatever it means to you.

Where the gap between the value score and the walking score is large, that is where the sound takes up the most room. This is a map, not a verdict. In the next module we will turn this map into concrete steps.`,
        },
      },
      {
        heading: { tr: 'Seksen yaş egzersizi', en: 'The eightieth birthday exercise' },
        body: {
          tr: `Gözlerinizi kapatın ve seksen yaşınızdaki doğum gününüzü hayal edin. Sevdiğiniz insanlar oradadır ve biri ayağa kalkıp sizin hakkınızda konuşur: nasıl bir insan olduğunuzu, neleri önemsediğinizi, hayatınızı nasıl yaşadığınızı. Ne söylemesini isterdiniz?

Bu konuşmada "tinnitusu olmadı" ya da "sessizlikte yaşadı" cümlelerinin yer alması pek olası değildir. Konuşmada yer alan şeyler değerlerinizdir. Bunları aşağıya yazın. Zorlanırsanız tersinden sorun: bugünkü gibi devam ederse konuşma nasıl olurdu, ve bunun neresini değiştirmek isterdiniz?`,
          en: `Close your eyes and imagine your eightieth birthday. The people you love are there and one of them stands up to speak about you: what kind of person you were, what you cared about, how you lived your life. What would you want them to say?

That speech is unlikely to include "they never had tinnitus" or "they lived in silence". What it does include are your values. Write them below. If you struggle, ask it the other way round: if things carry on as they are today, what would the speech sound like, and which part would you want to change?`,
        },
      },
      {
        heading: { tr: 'Değerler ve tinnitus', en: 'Values and tinnitus' },
        body: {
          tr: `Tinnitus bazı değerlere giden yolu gerçekten zorlaştırır: gürültülü ortamlarda sosyal olmak, sessizlikte okumak, bölünmeden uyumak. ACT bunu inkâr etmez. Sorduğu şey şudur: bu değere giden başka yollar var mı? "Arkadaşlarımla konser" zorsa "arkadaşlarımla yürüyüş" aynı değere hizmet eder. "Sessiz kütüphanede okumak" zorsa "ortam sesiyle evde okumak" da öyle.

Değerin kendisi değişmez; ona giden yol esnektir. Sesin kapattığı kapıyı zorlamak yerine aynı odaya açılan başka bir kapı bulmak, mücadeleyi bırakıp yürümeye devam etmenin somut biçimidir.`,
          en: `Tinnitus genuinely makes the road to some values harder: being sociable in noisy places, reading in silence, sleeping without interruption. ACT does not deny this. What it asks is: are there other roads to this value? If "a concert with friends" is hard, "a walk with friends" serves the same value. If "reading in a silent library" is hard, so does "reading at home with background sound".

The value itself does not change; the road to it is flexible. Finding another door into the same room, rather than forcing the door the sound has closed, is the concrete form of dropping the struggle and continuing to walk.`,
        },
      },
    ],
    practice: {
      kind: 'worksheet',
      minutes: 10,
      items: [
        { tr: 'Yakın ilişkiler: değerim ve yürüme puanım (0–10)', en: 'Close relationships: my value and walking score (0–10)' },
        { tr: 'Arkadaşlık ve toplum: değerim ve puanım', en: 'Friendship and community: my value and score' },
        { tr: 'İş ve öğrenme: değerim ve puanım', en: 'Work and learning: my value and score' },
        { tr: 'Sağlık ve beden: değerim ve puanım', en: 'Health and body: my value and score' },
        { tr: 'Dinlenme ve keyif: değerim ve puanım', en: 'Rest and enjoyment: my value and score' },
        { tr: 'Seksen yaş konuşmasında duymak istediğim üç cümle', en: 'Three sentences I would want to hear in the eightieth birthday speech' },
      ],
    },
    keyTakeaway: {
      tr: '"Sesin yok olması" kontrolünüzde olmayan bir hedeftir; altındaki değerler ise ses varken de yürüyebileceğiniz yönlerdir.',
      en: '"The sound disappearing" is a goal outside your control; the values beneath it are directions you can walk in while the sound is there.',
    },
    citations: ['hesser2012'],
  },
  {
    id: 'act.committed',
    title: { tr: 'Kararlı eylem', en: 'Committed action' },
    intro: {
      tr: 'Değerler bir yön verir; kararlı eylem o yönde atılan somut, küçük ve ölçülebilir adımlardır. Bu modül değer haritanızı haftalık bir eylem planına çevirir ve engeller ortaya çıktığında (ses, yorgunluk, kaygı) ne yapacağınızı önceden belirler.',
      en: 'Values give a direction; committed action is the concrete, small, measurable steps taken in that direction. This module turns your values map into a weekly action plan and decides in advance what to do when obstacles appear (the sound, fatigue, anxiety).',
    },
    sections: [
      {
        heading: { tr: 'Küçük, somut, zamanlı', en: 'Small, concrete, scheduled' },
        body: {
          tr: `Değer: "iyi bir arkadaş olmak." Eylem: "Cuma akşamı 19.00'da Ayşe'yi arayıp yarım saat konuşmak." Fark, eylemin ne zaman yapıldığını ve yapılıp yapılmadığını bilebilmenizdir. Büyük hedefler ("daha sosyal olmak") ertelenir; küçük eylemler yapılır.

Kararlı eylemin dört özelliği vardır: bir değere bağlıdır, somuttur, bu hafta yapılabilir ve tinnitusun durumuna bağlı değildir. Sonuncusu önemlidir: "Ses iyi olursa yürüyüşe çıkarım" bir eylem planı değil, bekleme planıdır. Plan, ses ne olursa olsun geçerlidir; ses eşlik edebilir.

Bu haftanın üç eylemini seçerken bir kolay, bir orta, bir zorlayıcı seçin. Kolay olan yapılacak diye değil, hareketi başlatmak için oradadır.`,
          en: `Value: "being a good friend." Action: "Call Ayşe on Friday at 7 pm and talk for half an hour." The difference is that you can know when the action happens and whether it happened. Big goals ("being more sociable") get postponed; small actions get done.

Committed action has four features: it is tied to a value, it is concrete, it can be done this week and it does not depend on the state of the tinnitus. The last matters: "I will go for a walk if the sound is good" is not an action plan but a waiting plan. The plan holds whatever the sound does; the sound may come along.

When choosing this week's three actions, pick one easy, one medium, one stretching. The easy one is there not because it needs doing but to get movement started.`,
        },
      },
      {
        heading: { tr: 'Engeller ve istekli olma', en: 'Obstacles and willingness' },
        body: {
          tr: `Her eylemin bir bedeli vardır: ses eşlik edecek, yorgun olacaksınız, kaygı gelecek, zihin "bugün olmaz" diyecek. ACT'de buna istekli olma sorusu denir: "Bu eylemi yapmak için bu rahatsızlığa yer açmaya istekli miyim?" Soru "rahatsızlığı sevmek" değil, "rahatsızlıkla birlikte gitmek" sorusudur.

Her eylem için engeli önceden yazın ve bir "eğer–o zaman" planı kurun: "Eğer yola çıkmadan ses yükselirse, o zaman hızlı gevşeme yapıp yine çıkarım." "Eğer zihin 'yarın yaparım' derse, o zaman 'teşekkürler zihin' der ve ayakkabılarımı giyerim." Bu planlar, karar anındaki iradeyi önceden verilmiş bir karara dönüştürür.`,
          en: `Every action has a price: the sound will come along, you will be tired, anxiety will arrive, the mind will say "not today". In ACT this is the willingness question: "Am I willing to make room for this discomfort in order to do this action?" The question is not about liking the discomfort but about going with it.

For each action write the obstacle in advance and set an "if–then" plan: "If the sound rises before I leave, then I do rapid relaxation and leave anyway." "If the mind says 'I will do it tomorrow', then I say 'thank you, mind' and put on my shoes." These plans turn willpower at the moment of decision into a decision already made.`,
        },
      },
      {
        heading: { tr: 'Haftalık döngü', en: 'The weekly cycle' },
        kind: 'exercise',
        body: {
          tr: `1. Pazar akşamı (ya da haftanızın başı): değer haritasından en büyük açığı olan iki alanı seçin.
2. Her alan için bir eylem; artı bir kolay eylem. Toplam üç.
3. Gün, saat, yer. Engel ve eğer–o zaman planı.
4. Hafta içinde yapıldıkça işaretleyin. Yapılamayan eylem başarısızlık değil, bilgidir: engel neydi, plan neyi kaçırdı?
5. Hafta sonu: ne öğrendiniz? Gelecek hafta aynı eylem mi, bir adım büyüğü mü?

Bu döngü programın geri kalanında ve sonrasında devam eder. Ses hâlâ orada olabilir; hayat yine de genişler. ACT çalışmalarında tinnitus sıkıntısındaki azalmanın büyük bölümü, sesin değil, sesle mücadelenin ve kaçınmanın azalmasıyla açıklanır.`,
          en: `1. Sunday evening (or the start of your week): choose the two domains with the biggest gap on your values map.
2. One action for each domain, plus one easy action. Three in total.
3. Day, time, place. Obstacle and if–then plan.
4. Tick them off during the week. An action not done is not a failure but information: what was the obstacle, what did the plan miss?
5. At the end of the week: what did you learn? Next week the same action, or one step bigger?

This cycle continues through the rest of the programme and beyond. The sound may still be there; life widens anyway. In ACT trials, much of the reduction in tinnitus distress is explained not by the sound but by the reduction in struggle and avoidance.`,
        },
      },
      {
        heading: { tr: 'Küçük adımların gücü', en: 'The power of small steps' },
        body: {
          tr: `Kararlı eylemde en sık yapılan hata, ilk haftada çok büyük adımlar seçmektir: "her gün spor", "her hafta bir arkadaş görmek". Başarısızlık zihne "yapamıyorum" kanıtı verir. Bunun yerine o kadar küçük başlayın ki yapmamak zor olsun: beş dakikalık yürüyüş, bir mesaj, tek bir sayfa. Küçük adım tamamlandığında zihin "yaptım" kaydını alır ve bir sonraki adım biraz büyür.

Ses her adımda eşlik edecektir; bu normaldir. Adımı "ses yokken yapılacak" diye ertelemek, ACT'nin tam olarak kırmak istediği bekleme tuzağıdır.`,
          en: `The most common mistake in committed action is choosing steps that are too big in the first week: "exercise every day", "see a friend every week". Failure gives the mind evidence that "I cannot". Instead start so small that not doing it is hard: a five-minute walk, one message, a single page. When the small step is done the mind records "I did it" and the next step grows a little.

The sound will come along on every step; that is normal. Postponing the step "until the sound is gone" is exactly the waiting trap ACT wants to break.`,
        },
      },
    ],
    practice: {
      kind: 'worksheet',
      minutes: 8,
      items: [
        { tr: 'Eylem 1 (kolay): ne, hangi değer için, gün ve saat', en: 'Action 1 (easy): what, for which value, day and time' },
        { tr: 'Eylem 1 için engel ve eğer–o zaman planı', en: 'Obstacle and if–then plan for action 1' },
        { tr: 'Eylem 2 (orta): ne, hangi değer için, gün ve saat', en: 'Action 2 (medium): what, for which value, day and time' },
        { tr: 'Eylem 2 için engel ve eğer–o zaman planı', en: 'Obstacle and if–then plan for action 2' },
        { tr: 'Eylem 3 (zorlayıcı): ne, hangi değer için, gün ve saat', en: 'Action 3 (stretching): what, for which value, day and time' },
        { tr: 'Eylem 3 için engel ve eğer–o zaman planı', en: 'Obstacle and if–then plan for action 3' },
      ],
    },
    keyTakeaway: {
      tr: 'Kararlı eylem, sesin durumuna bağlı olmayan küçük ve zamanlı adımlardır; engeller için önceden kurulan eğer–o zaman planları iradeyi karara dönüştürür.',
      en: 'Committed action means small, scheduled steps that do not depend on the state of the sound; if–then plans set in advance turn willpower into a decision already made.',
    },
    citations: ['hesser2012', 'fuller2020'],
  },
];

// ---------------------------------------------------------------------------------------------
// Mindfulness (MBCT-lite; McKenna/Marks 2017). App adaptation: 10–20 min/day instead of 45 — stated in text.
// ---------------------------------------------------------------------------------------------
const MIND: Module[] = [
  {
    id: 'mind.bodyScan',
    title: { tr: 'Beden taraması', en: 'Body scan' },
    intro: {
      tr: 'Beden taraması, bilinçli farkındalık temelli bilişsel terapinin (MBCT) en iyi kanıta sahip bileşenidir. Dikkati bedenin bölgelerinde sırayla dolaştırır; amaç gevşemek değil, ne varsa onu fark etmektir. Orijinal protokolde 30–40 dakikadır; bu uygulama 15 dakikalık kısaltılmış bir uyarlama sunar.',
      en: 'The body scan is the best-evidenced component of mindfulness-based cognitive therapy (MBCT). It moves attention through the regions of the body in turn; the aim is not to relax but to notice whatever is there. In the original protocol it lasts 30–40 minutes; this app offers a shortened 15-minute adaptation.',
    },
    sections: [
      {
        heading: { tr: 'Farkındalık ile gevşeme arasındaki fark', en: 'The difference between mindfulness and relaxation' },
        body: {
          tr: `Gevşeme egzersizleri bedeni belirli bir duruma götürmeyi hedefler. Farkındalık egzersizleri hedefsizdir: bedende ne varsa (gerginlik, ağrı, uyuşma, hiçbir şey) onu olduğu gibi fark etmek. Gevşeme çoğu zaman yan ürün olarak gelir, ama gelmediğinde egzersiz başarısız olmamıştır.

Bu fark tinnitus için önemlidir. McKenna ve arkadaşlarının 2017 tarihli randomize çalışmasında MBCT, gevşeme eğitimiyle karşılaştırıldı; her iki grup da iyileşti, ancak MBCT tinnitus sıkıntısını daha fazla azalttı ve etki altı ayda sürdü. Fark, muhtemelen farkındalığın sesle mücadeleyi bırakmayı öğretmesinden gelir: sesi gidermeye çalışmadan onunla birlikte olmak.`,
          en: `Relaxation exercises aim to bring the body to a certain state. Mindfulness exercises have no goal: noticing whatever is in the body (tension, pain, numbness, nothing) as it is. Relaxation often comes as a by-product, but when it does not, the exercise has not failed.

This difference matters for tinnitus. In the 2017 randomised trial by McKenna and colleagues, MBCT was compared with relaxation training; both groups improved, but MBCT reduced tinnitus distress more and the effect held at six months. The difference probably comes from mindfulness teaching you to drop the struggle with the sound: being with it without trying to make it go away.`,
        },
      },
      {
        heading: { tr: 'Tutum', en: 'The attitude' },
        body: {
          tr: `Beden taramasında dikkat bir el feneri gibi bedende dolaşır. Her bölgede şu sorular vardır: Burada ne hissediyorum? Sıcaklık, basınç, karıncalanma, temas, hiçbir şey? Fark edilen şey iyi ya da kötü diye etiketlenmez; yalnızca fark edilir.

Zihin dağılacaktır: planlar, anılar, tinnitus. Dağıldığını fark etmek egzersizin bir hatası değil, tam merkezidir; her fark ediş bir farkındalık anıdır. Zihin nereye gittiyse nazikçe not edin ("düşünme", "ses") ve dikkati kaldığınız bölgeye geri getirin. Yüz kez dağılırsa yüz kez geri getirin.

Tinnitus bu egzersizde özel bir yere sahip değildir; bedende fark edilen şeylerden biridir. Dikkat sese gittiğinde ona da birkaç saniye aynı merakla bakın (nerede, nasıl bir doku) ve sonra bedene dönün.`,
          en: `In the body scan, attention moves through the body like a torch. In each region the questions are: What do I feel here? Warmth, pressure, tingling, contact, nothing? What is noticed is not labelled good or bad; it is just noticed.

The mind will wander: plans, memories, tinnitus. Noticing that it has wandered is not a fault in the exercise but its very centre; each noticing is a moment of mindfulness. Gently note where the mind went ("thinking", "sound") and bring attention back to the region you were on. If it wanders a hundred times, bring it back a hundred times.

The tinnitus has no special place in this exercise; it is one of the things noticed in the body. When attention goes to the sound, look at it for a few seconds with the same curiosity (where, what texture) and then return to the body.`,
        },
      },
      {
        heading: { tr: 'Uygulama', en: 'Practice' },
        kind: 'tip',
        body: {
          tr: `- Sırt üstü uzanın ya da oturun; uyuyakalma eğiliminiz varsa oturun.
- Günde bir kez, iki hafta boyunca. MBCT programında günlük ev uygulaması 45 dakikadır; 15 dakikalık bu uyarlama henüz çalışmalarla sınanmamıştır, ancak düzenli uygulama ilkesi aynıdır.
- "Doğru hissetmek" diye bir şey yoktur. Sıkıntı, huzursuzluk ve sabırsızlık da fark edilecek şeylerdir.
- Egzersiz sırasında ses yükselmiş gibi gelirse bu, dikkatin içe dönmesiyle beklenen bir etkidir; haftalar içinde azalır.`,
          en: `- Lie on your back or sit; if you tend to fall asleep, sit.
- Once a day for two weeks. In the MBCT programme daily home practice is 45 minutes; this 15-minute adaptation has not yet been tested in trials, but the principle of regular practice is the same.
- There is no such thing as "feeling it right". Boredom, restlessness and impatience are things to notice too.
- If the sound seems louder during the exercise, that is an expected effect of attention turning inward; it lessens over the weeks.`,
        },
      },
    ],
    practice: {
      kind: 'timer',
      minutes: 15,
      steps: [
        { tr: 'Uzanın ya da oturun. Gözleri kapatın. Bedenin bütününü ve yerle temasını fark edin. Nefes gelip gidiyor.', en: 'Lie down or sit. Close your eyes. Notice the body as a whole and its contact with the surface. The breath comes and goes.', seconds: 60 },
        { tr: 'Dikkati sol ayağa götürün: parmaklar, taban, topuk. Ne var? Sıcaklık, karıncalanma, temas, hiçbir şey.', en: 'Take attention to the left foot: toes, sole, heel. What is there? Warmth, tingling, contact, nothing.', seconds: 60 },
        { tr: 'Sol bacak: baldır, diz, uyluk. Yalnızca fark edin. Zihin dağıldıysa nazikçe dönün.', en: 'Left leg: calf, knee, thigh. Only notice. If the mind has wandered, return gently.', seconds: 60 },
        { tr: 'Sağ ayak: parmaklar, taban, topuk.', en: 'Right foot: toes, sole, heel.', seconds: 60 },
        { tr: 'Sağ bacak: baldır, diz, uyluk.', en: 'Right leg: calf, knee, thigh.', seconds: 60 },
        { tr: 'Kalçalar ve bel. Altınızdaki yüzeyle temas. Nefesle birlikte belin hareketi.', en: 'Hips and lower back. Contact with the surface beneath. The movement of the lower back with the breath.', seconds: 60 },
        { tr: 'Karın ve göğüs. Nefes alışta genişleme, verişte çekilme. Değiştirmeden izleyin.', en: 'Abdomen and chest. Expansion on the in-breath, falling on the out-breath. Watch without changing.', seconds: 60 },
        { tr: 'Sırt ve omuzlar. Gerginlik varsa onu da fark edin; gidermeye çalışmayın.', en: 'Back and shoulders. If there is tension, notice that too; do not try to remove it.', seconds: 60 },
        { tr: 'Kollar ve eller: üst kol, dirsek, ön kol, avuç, parmaklar.', en: 'Arms and hands: upper arm, elbow, forearm, palm, fingers.', seconds: 60 },
        { tr: 'Boyun ve boğaz. Yutkunma, nefesin geçişi.', en: 'Neck and throat. Swallowing, the passage of the breath.', seconds: 45 },
        { tr: 'Yüz: çene, dudaklar, yanaklar, gözler, alın. Kulaklar ve başın içi. Ses de buradaysa, bir doku gibi fark edin.', en: 'Face: jaw, lips, cheeks, eyes, forehead. The ears and the inside of the head. If the sound is here too, notice it like a texture.', seconds: 90 },
        { tr: 'Bütün beden: tepeden ayağa tek bir bütün. Nefes bütün bedene giriyor ve çıkıyor.', en: 'The whole body: one whole from crown to feet. The breath enters and leaves the whole body.', seconds: 90 },
        { tr: 'Yavaşça odaya dönün. Sesler, ışık, parmaklar. Hazır olunca gözleri açın.', en: 'Slowly return to the room. Sounds, light, fingers. Open your eyes when ready.', seconds: 45 },
      ],
    },
    keyTakeaway: {
      tr: 'Beden taramasının amacı gevşemek değil, ne varsa fark etmektir; tinnitus da bedende fark edilen şeylerden biridir ve dağılan zihni geri getirmek egzersizin kendisidir.',
      en: 'The aim of the body scan is not to relax but to notice whatever is there; the tinnitus is one of the things noticed in the body, and bringing back the wandering mind is the exercise itself.',
    },
    citations: ['mckenna2017'],
  },
  {
    id: 'mind.breathingSpace',
    title: { tr: 'Üç dakikalık nefes alanı', en: 'The three-minute breathing space' },
    intro: {
      tr: 'MBCT programının en taşınabilir egzersizi: gün içinde, özellikle zor bir anda, üç adımda dikkati toplayan kısa bir mola. Tinnitus öne çıktığında, kaygı yükseldiğinde ya da otomatik pilota kapıldığınızı fark ettiğinizde kullanılır.',
      en: 'The most portable exercise of the MBCT programme: a short pause in three steps that gathers attention during the day, especially in a hard moment. Used when the tinnitus comes forward, when anxiety rises or when you notice you have slipped onto autopilot.',
    },
    sections: [
      {
        heading: { tr: 'Kum saati', en: 'The hourglass' },
        body: {
          tr: `Nefes alanı bir kum saati gibidir: geniş başlar, daralır, yeniden genişler. Birinci dakikada dikkat geniştir ve şu anda ne olduğunu sorar: düşünceler, duygular, beden duyumları, ses. İkinci dakikada dikkat tek bir noktaya, nefese daralır. Üçüncü dakikada yeniden genişler ve bütün bedeni, sonra odayı ve günü kapsar.

Egzersiz, zor anlarda otomatik tepkinin (sesi kontrol etmek, kaçmak, kızmak) yerine bir duraklama koyar. Üç dakika sesin durumunu değiştirmez; sizin sesle ilişkinizi o an için değiştirir ve bir sonraki adımı bilinçle seçmenize alan açar.`,
          en: `The breathing space is like an hourglass: it begins wide, narrows, then widens again. In the first minute attention is wide and asks what is happening right now: thoughts, feelings, body sensations, the sound. In the second minute attention narrows to a single point, the breath. In the third it widens again to take in the whole body, then the room and the day.

The exercise puts a pause in place of the automatic reaction in hard moments (checking the sound, escaping, getting angry). Three minutes do not change the state of the sound; they change your relationship with it for that moment and open space to choose the next step consciously.`,
        },
      },
      {
        heading: { tr: 'Üç adım', en: 'The three steps' },
        kind: 'exercise',
        body: {
          tr: `**1. Fark etme (1 dk).** Dik ama rahat oturun. Gözleri kapatın ya da bakışı indirin. Sorun: Şu anda zihnimde ne var? Düşünceleri cümle olarak fark edin. Hangi duygular var? Adlandırın: kaygı, bıkkınlık, sakinlik. Bedende ne var? Gerginlik, ağırlık, ses. Hiçbirini değiştirmeyin; yalnızca kaydedin.

**2. Toplanma (1 dk).** Dikkati nefese daraltın. Karında ya da burun ucunda nefesin hissedildiği yere. Her alış, her veriş. Zihin dağılırsa nefese dönün. Nefes, şu ana açılan kapıdır.

**3. Genişleme (1 dk).** Dikkati nefesten bütün bedene açın: duruş, yüz ifadesi, temas noktaları. Gerginlik varsa nefesi oraya gönderin; "gitmesi gerekmiyor, burada olabilir." Sonra odayı, sesleri ve önünüzdeki günü dahil edin. Gözleri açın.`,
          en: `**1. Noticing (1 min).** Sit upright but at ease. Close your eyes or lower your gaze. Ask: What is in my mind right now? Notice thoughts as sentences. What feelings are there? Name them: anxiety, weariness, calm. What is in the body? Tension, heaviness, the sound. Change none of it; only record.

**2. Gathering (1 min).** Narrow attention to the breath. To the place where it is felt, in the belly or at the tip of the nose. Each in-breath, each out-breath. When the mind wanders, return to the breath. The breath is the door into the present.

**3. Widening (1 min).** Open attention from the breath to the whole body: posture, facial expression, points of contact. If there is tension, send the breath there; "it does not have to go, it can be here." Then include the room, the sounds and the day ahead. Open your eyes.`,
        },
      },
      {
        heading: { tr: 'Ne zaman', en: 'When' },
        kind: 'tip',
        body: {
          tr: `- Planlı: günde üç kez, belirli saatlerde (sabah, öğle, akşam). Bu, beceriyi kurar.
- Tepkisel: ses öne çıktığında, bir düşünce döngüsü başladığında, uykuya dalamadığınızda. Bu, beceriyi kullanır.
- Üç dakika bulunamadığında bir dakikalık sürüm: her adıma yirmi saniye.
- Tinnitusu fark etmenin kendisini bir çağrı olarak kullanın: ses geldi, nefes alanı zamanı.`,
          en: `- Planned: three times a day at set times (morning, midday, evening). This builds the skill.
- Responsive: when the sound comes forward, when a thought loop starts, when you cannot fall asleep. This uses the skill.
- When three minutes are not available, a one-minute version: twenty seconds per step.
- Use the noticing of tinnitus itself as the call: the sound has come, time for a breathing space.`,
        },
      },
      {
        heading: { tr: 'Sonrasında ne yapmalı', en: 'What to do afterwards' },
        body: {
          tr: `Nefes alanı bir karar noktası yaratır. Üç dakikanın sonunda dört seçenek vardır:

- **Yeniden girmek:** Yaptığınız işe, artık otomatik pilotta değil, bilinçli olarak dönmek.
- **Bedene dönmek:** Gerginlik yüksekse kısa bir gevşeme ya da yürüyüş.
- **Düşünceye bakmak:** Bir düşünce döngüsü varsa "düşünceler olgu değildir" tutumunu ya da bir düşünce kaydını kullanmak.
- **Zor olana yaklaşmak:** Ses öne çıkmışsa "izin verme" tutumuyla ona birkaç dakika yer açmak.

Hangi seçeneği seçtiğiniz, o ana bağlıdır. Önemli olan seçimin tepki değil, karar olmasıdır.`,
          en: `The breathing space creates a decision point. At the end of the three minutes there are four options:

- **Re-enter:** Return to what you were doing, consciously now rather than on autopilot.
- **Return to the body:** If tension is high, a short relaxation or a walk.
- **Look at the thought:** If a thought loop is running, use the "thoughts are not facts" stance or a thought record.
- **Approach what is hard:** If the sound has come forward, make room for it for a few minutes with the "allowing" stance.

Which option you choose depends on the moment. What matters is that the choice is a decision, not a reaction.`,
        },
      },
    ],
    practice: {
      kind: 'timer',
      minutes: 3,
      steps: [
        { tr: 'Fark etme: Şu anda zihnimde ne var? Hangi duygular? Bedende ne var? Yalnızca kaydedin.', en: 'Noticing: What is in my mind right now? What feelings? What is in the body? Only record.', seconds: 60 },
        { tr: 'Toplanma: Dikkati nefese daraltın. Her alış, her veriş. Dağılınca nefese dönün.', en: 'Gathering: Narrow attention to the breath. Each in, each out. When it wanders, return to the breath.', seconds: 60 },
        { tr: 'Genişleme: Bütün beden, duruş, temas. Sonra oda, sesler, gün. Gözleri açın.', en: 'Widening: The whole body, posture, contact. Then the room, the sounds, the day. Open your eyes.', seconds: 60 },
      ],
    },
    keyTakeaway: {
      tr: 'Üç dakikalık nefes alanı fark etme, toplanma ve genişleme adımlarıyla zor anlarda otomatik tepkinin yerine bir duraklama koyar; sesi fark etmek egzersizin çağrısı olabilir.',
      en: 'The three-minute breathing space puts a pause in place of the automatic reaction in hard moments through noticing, gathering and widening; noticing the sound can be its cue.',
    },
    citations: ['mckenna2017'],
  },
  {
    id: 'mind.allowing',
    title: { tr: 'İzin vermek: sese bilerek yaklaşmak', en: 'Allowing: turning towards the sound' },
    intro: {
      tr: 'MBCT programının beşinci haftasında dikkat, bilerek zor olana çevrilir. Tinnitus için bu, sese yaklaşmak demektir: ondan kaçmadan, onu değiştirmeden, ona yer açarak. Bu modül BDT\'deki maruz kalmanın farkındalık temelli karşılığıdır.',
      en: 'In week five of the MBCT programme, attention is deliberately turned towards what is difficult. For tinnitus this means approaching the sound: without escaping it, without changing it, by making room for it. This module is the mindfulness-based counterpart of exposure in CBT.',
    },
    sections: [
      {
        heading: { tr: 'Direnç ve acı', en: 'Resistance and suffering' },
        body: {
          tr: `Zor bir deneyime karşı ilk tepkimiz direnmektir: kasılmak, uzaklaşmak, "bu olmamalı" demek. Direnç anlaşılırdır, ama deneyimi iki katına çıkarır: artık yalnızca ses değil, sese karşı mücadele de vardır. Farkındalık geleneğinde buna "acı = ağrı × direnç" denir. Ağrı (ses) sabitse, acıyı belirleyen dirençtir.

İzin vermek, direnci bilerek bırakmaktır. Sesi onaylamak, sevmek ya da ona teslim olmak değil; "şu anda burada ve burada olmasına izin veriyorum" demektir. İlk denemelerde bu yapay gelebilir; ses yükselmiş gibi olabilir, huzursuzluk artabilir. Bunlar yaklaşmanın işaretleridir, hatanın değil.`,
          en: `Our first response to a difficult experience is to resist: to tighten, move away, say "this should not be". Resistance is understandable, but it doubles the experience: now there is not only the sound but also the struggle against it. In the mindfulness tradition this is put as "suffering = pain × resistance". If the pain (the sound) is fixed, what determines the suffering is the resistance.

Allowing means deliberately setting resistance down. Not approving of the sound, liking it or surrendering to it; it means saying "it is here right now and I allow it to be here". In the first attempts this may feel artificial; the sound may seem louder, restlessness may rise. These are signs of approaching, not of error.`,
        },
      },
      {
        heading: { tr: 'Egzersiz', en: 'The exercise' },
        kind: 'exercise',
        body: {
          tr: `1. Oturun. Birkaç dakika nefesle yerleşin.
2. Dikkati bilerek tinnitusa çevirin. Kaçmadan, "işte burada" diyerek.
3. Sesin bedende nerede hissedildiğini bulun: kulak, başın içi, boyun, göğüs. Gerginliğin nerede toplandığını fark edin; çoğu kişide çene, omuzlar ya da karın.
4. Nefesi o bölgeye gönderin. Her nefes alışta bölgeyi yumuşakça açın; her verişte "burada olabilir, izin veriyorum" deyin.
5. Direnç geri geldiğinde (gelecektir) onu da fark edin: "işte direnç." Ona da yer açın.
6. Sese bir isim verin ve ona kısa bir cümle söyleyin: "Seni duyuyorum. Burada olabilirsin. Benim gidecek yerlerim var."
7. Dikkati genişletin: bütün beden, oda, gün.

Günde bir kez, 10–12 dakika, iki hafta. Egzersizi en zor saatte, örneğin gece yatmadan önce yapmayı deneyin.`,
          en: `1. Sit. Settle with the breath for a few minutes.
2. Deliberately turn attention to the tinnitus. Without escaping, saying "here it is".
3. Find where the sound is felt in the body: the ear, inside the head, the neck, the chest. Notice where tension gathers; for most people the jaw, shoulders or belly.
4. Send the breath to that region. On each in-breath open the region softly; on each out-breath say "it can be here, I allow it".
5. When resistance returns (it will), notice that too: "here is resistance." Make room for it as well.
6. Give the sound a name and say a short sentence to it: "I hear you. You can be here. I have places to go."
7. Widen attention: the whole body, the room, the day.

Once a day, 10–12 minutes, for two weeks. Try doing the exercise at the hardest hour, for instance before bed at night.`,
        },
      },
      {
        heading: { tr: 'Günlük hayata taşımak', en: 'Taking it into daily life' },
        kind: 'tip',
        body: {
          tr: `Gün içinde ses öne çıktığında bu yöntemin otuz saniyelik sürümünü kullanın: fark et ("ses burada"), bedende bul, nefesle yumuşat, izin ver, devam et. Zamanla "izin vermek" sese karşı varsayılan tutum olur ve dikkat sesi tehlike olarak işaretlemeyi bırakır. MBCT çalışmasında katılımcıların sesle ilişkisindeki değişim, sesin düzeyindeki değişimden bağımsızdı; gürlük aynı kalsa da sıkıntı azaldı.`,
          en: `When the sound comes forward during the day, use the thirty-second version of this method: notice ("the sound is here"), find it in the body, soften with the breath, allow, continue. Over time "allowing" becomes the default stance towards the sound and attention stops tagging it as danger. In the MBCT trial, the change in participants' relationship with the sound was independent of change in its level; distress fell even where loudness stayed the same.`,
        },
      },
      {
        heading: { tr: 'Ne zaman zor gelir', en: 'When it feels hard' },
        body: {
          tr: `İzin vermek, sesin yükseldiği günlerde en zor ve en gereklidir. Zorlandığınızda ölçeği küçültün: bütün sese değil, sesin bir bölümüne (örneğin yalnızca bedende hissedildiği yere) izin verin; on dakika değil iki dakika. Egzersizin sonunda rahatsızlık hâlâ yüksekse bu, egzersizin işe yaramadığı anlamına gelmez; direnci bırakmak bir beceridir ve beceriler tekrarla gelir.

Bazı günler izin vermek yerine kısa gevşeme ya da nefes alanı daha uygun olabilir. Her ikisi de aynı doğrultuda çalışır. Sesi kovmaya çalışan hiçbir yöntem bu listede yoktur; ölçüt budur.`,
          en: `Allowing is hardest and most necessary on the days when the sound is up. When you struggle, reduce the scale: allow not the whole sound but part of it (for instance only the place it is felt in the body); two minutes rather than ten. If discomfort is still high at the end, that does not mean the exercise failed; setting resistance down is a skill, and skills come with repetition.

On some days a short relaxation or a breathing space may suit better than allowing. Both work in the same direction. No method that tries to chase the sound away is on this list; that is the criterion.`,
        },
      },
    ],
    practice: {
      kind: 'timer',
      minutes: 11,
      steps: [
        { tr: 'Oturun. Nefesle yerleşin. Beden, temas, nefes.', en: 'Sit. Settle with the breath. Body, contact, breath.', seconds: 90 },
        { tr: 'Dikkati bilerek sese çevirin. "İşte burada."', en: 'Deliberately turn attention to the sound. "Here it is."', seconds: 60 },
        { tr: 'Ses bedende nerede? Kulak, baş, boyun, göğüs. Gerginlik nerede toplanıyor?', en: 'Where is the sound in the body? Ear, head, neck, chest. Where does tension gather?', seconds: 90 },
        { tr: 'Nefesi o bölgeye gönderin. Alışta aç, verişte "burada olabilir, izin veriyorum."', en: 'Send the breath to that region. Open on the in-breath; on the out-breath "it can be here, I allow it."', seconds: 120 },
        { tr: 'Direnç geldiğinde: "işte direnç." Ona da yer açın.', en: 'When resistance comes: "here is resistance." Make room for it too.', seconds: 90 },
        { tr: 'Sese bir cümle: "Seni duyuyorum. Burada olabilirsin. Benim gidecek yerlerim var."', en: 'A sentence to the sound: "I hear you. You can be here. I have places to go."', seconds: 60 },
        { tr: 'Dikkati genişletin: bütün beden, oda, gün. Gözleri açın.', en: 'Widen attention: the whole body, the room, the day. Open your eyes.', seconds: 60 },
      ],
    },
    keyTakeaway: {
      tr: 'Acıyı ses değil, sese karşı direnç belirler; sese bilerek yaklaşıp "burada olabilir" diyerek yer açmak, sesin düzeyi değişmese de sıkıntıyı azaltır.',
      en: 'Suffering is set not by the sound but by resistance to it; deliberately approaching the sound and making room with "it can be here" reduces distress even when the level of the sound does not change.',
    },
    citations: ['mckenna2017', 'hesser2012'],
  },
  {
    id: 'mind.thoughtsNotFacts',
    title: { tr: 'Düşünceler olgu değildir', en: 'Thoughts are not facts' },
    intro: {
      tr: 'MBCT\'nin altıncı haftası düşüncelere ayrılmıştır: onları değiştirmeye ya da tartışmaya değil, zihinsel olaylar olarak görmeye. "Bu ses hiç geçmeyecek" düşüncesi, gökyüzünden geçen bir bulut gibi izlenebilir; bulut ne kadar koyu olursa olsun gökyüzü değildir.',
      en: 'Week six of MBCT is devoted to thoughts: not to changing or arguing with them but to seeing them as mental events. The thought "this sound will never stop" can be watched like a cloud crossing the sky; however dark the cloud, it is not the sky.',
    },
    sections: [
      {
        heading: { tr: 'Zihinsel olaylar olarak düşünceler', en: 'Thoughts as mental events' },
        body: {
          tr: `Düşünceler, duyumlar ve sesler gibi zihinde beliren ve kaybolan olaylardır. Ancak onlara duyumlardan farklı davranırız: içeriklerine inanırız. "Sesi duyuyorum" ile "bu ses hayatımı mahvediyor" aynı türden görünür, oysa ilki bir gözlem, ikincisi bir yorumdur. Zihin yorumları gözlem kılığında sunar.

Ruh hâli düşünce içeriğini belirler. Yorgun ve kaygılı bir akşam, aynı sesi "dayanılmaz" diye yorumlar; dinlenmiş bir sabah "arka planda" der. Ses değişmemiştir; zihnin hava durumu değişmiştir. Düşünceyi ruh hâlinin bir belirtisi olarak görmek, ona olgu muamelesi yapmaktan korur: "Zihnim bugün bu tür cümleler üretiyor; demek ki yorgunum."`,
          en: `Thoughts are events that appear and vanish in the mind, like sensations and sounds. But we treat them differently from sensations: we believe their content. "I hear the sound" and "this sound is ruining my life" look like the same kind of thing, yet the first is an observation and the second an interpretation. The mind presents interpretations dressed as observations.

Mood shapes the content of thoughts. A tired, anxious evening interprets the same sound as "unbearable"; a rested morning says "in the background". The sound has not changed; the mind's weather has. Seeing a thought as a symptom of mood protects you from treating it as fact: "My mind is producing this kind of sentence today; so I must be tired."`,
        },
      },
      {
        heading: { tr: 'Düşünceleri izleme egzersizi', en: 'The thought-watching exercise' },
        kind: 'exercise',
        body: {
          tr: `1. Oturun, nefesle birkaç dakika yerleşin.
2. Dikkati nefesten düşüncelere kaydırın. Zihni bir sinema perdesi ya da gökyüzü gibi düşünün; düşünceler perdedeki görüntüler ya da geçen bulutlardır.
3. Bir düşünce belirdiğinde onu fark edin, kısaca etiketleyin ("plan", "anı", "ses hakkında", "endişe") ve geçmesini izleyin. Düşünceyi takip etmeyin, tartışmayın, kovmayın.
4. Tinnitusla ilgili bir düşünce geldiğinde özellikle dikkat edin: bu bir olgu mu, yorum mu? Hangi ruh hâli bunu üretiyor? Sonra onun da geçmesini izleyin.
5. Kendinizi bir düşüncenin içinde bulduğunuzda (olacaktır) bunu fark edin: "düşünceye kapıldım." Nefese dönün, sonra yeniden izlemeye başlayın.
6. Son bir dakikada nefese dönün ve bitirin.

10 dakika, günde bir kez, bir hafta. İzlenecek düşünce bulamazsanız bu da bir gözlemdir; zihin bazen sessizdir.`,
          en: `1. Sit, settle with the breath for a few minutes.
2. Shift attention from the breath to thoughts. Think of the mind as a cinema screen or the sky; thoughts are the images on the screen or the clouds passing.
3. When a thought appears, notice it, label it briefly ("plan", "memory", "about the sound", "worry") and watch it pass. Do not follow, argue with or chase it away.
4. When a thought about tinnitus arrives, pay particular attention: is this a fact or an interpretation? Which mood is producing it? Then watch it pass too.
5. When you find yourself inside a thought (you will), notice that: "caught in a thought." Return to the breath, then start watching again.
6. In the last minute return to the breath and finish.

10 minutes, once a day, for a week. If you cannot find a thought to watch, that is an observation too; the mind is sometimes quiet.`,
        },
      },
      {
        heading: { tr: 'Düşünce geldiğinde sorulacak sorular', en: 'Questions to ask when a thought arrives' },
        kind: 'tip',
        body: {
          tr: `Gün içinde ağır bir düşünce belirdiğinde kısa sorular yardımcı olur:

- Bu bir gözlem mi, yorum mu?
- Hangi ruh hâlinin ürünü? Yorgunluk, uykusuzluk, kaygı?
- Bu düşünceyi daha önce de düşündüm mü? Ne oldu?
- Bu düşünceye bir bulut gibi bakabilir miyim?

Bu sorular düşünceyi çürütmek için değildir; onun bir düşünce olduğunu hatırlatmak içindir. MBCT'de tekrarlayan düşünce kalıplarını tanımak, geriye dönüşleri önlemenin merkezinde yer alır: olumsuz düşünceler güçlenmeye başladığında bunu bir uyarı sinyali olarak görüp bakım uygulamalarını artırmak.`,
          en: `When a heavy thought appears during the day, short questions help:

- Is this an observation or an interpretation?
- Which mood is it a product of? Tiredness, lack of sleep, anxiety?
- Have I thought this before? What happened?
- Can I look at this thought like a cloud?

These questions are not meant to refute the thought; they are reminders that it is a thought. In MBCT, recognising recurring thought patterns is central to preventing relapse: when negative thoughts start gaining strength, treat it as a warning signal and increase the maintenance practices.`,
        },
      },
    ],
    practice: {
      kind: 'timer',
      minutes: 10,
      steps: [
        { tr: 'Oturun. Nefesle yerleşin.', en: 'Sit. Settle with the breath.', seconds: 90 },
        { tr: 'Dikkati düşüncelere kaydırın. Zihin bir gökyüzü; düşünceler geçen bulutlar.', en: 'Shift attention to thoughts. The mind a sky; thoughts the clouds passing.', seconds: 60 },
        { tr: 'Bir düşünce belirdiğinde etiketleyin: plan, anı, ses hakkında, endişe. Geçmesini izleyin.', en: 'When a thought appears, label it: plan, memory, about the sound, worry. Watch it pass.', seconds: 120 },
        { tr: 'Sesle ilgili bir düşünce: gözlem mi, yorum mu? Hangi ruh hâli? Onu da bırakın.', en: 'A thought about the sound: observation or interpretation? Which mood? Let it go too.', seconds: 120 },
        { tr: 'Düşünceye kapıldığınızı fark ettiğinizde: "kapıldım." Nefese dönün, yeniden izleyin.', en: 'When you notice you are caught in a thought: "caught." Return to the breath, watch again.', seconds: 120 },
        { tr: 'Nefese dönün. Bitirin.', en: 'Return to the breath. Finish.', seconds: 60 },
      ],
    },
    keyTakeaway: {
      tr: 'Düşünceler, zihnin hava durumuna göre değişen zihinsel olaylardır; "bu ses hiç geçmeyecek" cümlesine bir bulut gibi bakmak, onu olgu olarak yaşamaktan korur.',
      en: 'Thoughts are mental events that change with the mind\'s weather; looking at "this sound will never stop" like a cloud protects you from living it as a fact.',
    },
    citations: ['mckenna2017'],
  },
];

// ---------------------------------------------------------------------------------------------
// CBT-I (Marks 2023): education → stimulus control → sleep compression → cognitions → wind-down → relapse
// ---------------------------------------------------------------------------------------------
const CBTI: Module[] = [
  {
    id: 'cbti.education',
    title: { tr: 'Uyku ve tinnitus: nasıl işler', en: 'Sleep and tinnitus: how it works' },
    intro: {
      tr: 'Tinnitusu olan kişilerin yaklaşık yarısı uykusuzluktan yakınır; klinik örneklemlerde bu oran daha yüksektir. Uykusuzluk için bilişsel davranışçı terapi (CBT-I), tinnitusa bağlı uykusuzlukta randomize bir çalışmada odyoloji temelli bakımdan daha etkili bulundu. Bu modül uykunun nasıl düzenlendiğini ve altı haftalık programın yapısını anlatır.',
      en: 'About half of people with tinnitus report insomnia; in clinic samples the share is higher. Cognitive behavioural therapy for insomnia (CBT-I) was found more effective than audiology-based care for tinnitus-related insomnia in a randomised trial. This module explains how sleep is regulated and the structure of the six-week programme.',
    },
    sections: [
      {
        heading: { tr: 'Uykuyu düzenleyen iki sistem', en: 'The two systems that regulate sleep' },
        body: {
          tr: `**Uyku baskısı.** Uyanık kaldığınız her saat beyinde uyku ihtiyacı birikir; uyuduğunuzda boşalır. Gündüz uykusu ve geç kalkmak bu baskıyı azaltır, gece uykuya dalmayı zorlaştırır.

**Biyolojik saat.** Yaklaşık 24 saatlik bir ritim, uyanıklık ve uyku zamanlarını belirler; sabah ışığı ve sabit kalkış saati ile ayarlanır. Düzensiz saatler saati şaşırtır.

Üçüncü bir etken uyarılmadır: kaygı, gerginlik ve "uyumalıyım" baskısı sinir sistemini uyanık tutar. Tinnitus bu üçüncü etkeni besler: sessiz yatak odasında ses öne çıkar, dikkat sese kilitlenir, uyarılma artar. Birkaç kötü geceden sonra yatak "uyanık kalınan yer" olarak öğrenilir.

CBT-I bu üç sistemi birlikte hedefler: uyku baskısını artırmak (uyku sıkıştırma), saati sabitlemek (kalkış saati), uyarılmayı azaltmak (uyaran kontrolü, bilişsel çalışma, gevşeme).`,
          en: `**Sleep pressure.** Every hour awake builds up need for sleep in the brain; sleeping discharges it. Daytime naps and sleeping late reduce this pressure and make falling asleep at night harder.

**The body clock.** A roughly 24-hour rhythm sets times for wakefulness and sleep; it is set by morning light and a fixed rise time. Irregular hours confuse the clock.

A third factor is arousal: anxiety, tension and the pressure to "have to sleep" keep the nervous system awake. Tinnitus feeds this third factor: in the quiet bedroom the sound comes forward, attention locks onto it, arousal rises. After a few bad nights the bed is learned as "the place where I lie awake".

CBT-I targets all three systems together: raising sleep pressure (sleep compression), fixing the clock (rise time), reducing arousal (stimulus control, cognitive work, relaxation).`,
        },
      },
      {
        heading: { tr: 'Altı haftalık yol', en: 'The six-week path' },
        body: {
          tr: `- **1. hafta:** Bu modül, uyku hijyeni, uyku günlüğü, gece için ses zenginleştirme.
- **2. hafta:** Uyaran kontrolü: yatak yalnızca uyku için, 15 dakika kuralı, sabit kalkış.
- **3. hafta:** Uyku sıkıştırma: yatakta geçen süreyi gerçek uyku süresine yaklaştırmak.
- **4. hafta:** Uyku ve tinnitus hakkındaki düşüncelerle çalışmak.
- **5. hafta:** Gevşeme, endişe zamanı ve yatış öncesi rutin.
- **6. hafta:** Kazanımları korumak.

Programın bel kemiği uyku günlüğüdür: her sabah yatış saati, uykuya dalma süresi, gece uyanmaları, kalkış saati. Uygulama bu verilerden uyku verimliliğini (uyku süresi ÷ yatakta geçen süre) hesaplar; üçüncü haftadaki uyku penceresi bu veriye dayanır. Günlüğü bugünden başlayarak her sabah doldurun; tahmin yeterlidir, saat sayımı değil.`,
          en: `- **Week 1:** This module, sleep hygiene, the sleep diary, sound enrichment for the night.
- **Week 2:** Stimulus control: bed only for sleep, the 15-minute rule, a fixed rise time.
- **Week 3:** Sleep compression: bringing time in bed closer to actual sleep time.
- **Week 4:** Working with thoughts about sleep and tinnitus.
- **Week 5:** Relaxation, worry time and the pre-bed routine.
- **Week 6:** Keeping the gains.

The backbone of the programme is the sleep diary: each morning, bedtime, time to fall asleep, night wakings, rise time. The app calculates sleep efficiency from this (time asleep ÷ time in bed); the sleep window in week three rests on this data. Fill in the diary every morning starting today; an estimate is enough, not clock-counting.`,
        },
      },
      {
        heading: { tr: 'Uyku hakkında gerçekler', en: 'Facts about sleep' },
        kind: 'tip',
        body: {
          tr: `- Herkesin sekiz saate ihtiyacı yoktur; 6–9 saat arası normal aralıktır. Gündüz işlevselliğiniz iyiyse süre yeterlidir.
- Gece kısa uyanmalar normaldir; çoğu kişi gecede birkaç kez uyanır ve hatırlamaz.
- Bir kötü gece ertesi günü bozar ama telafi edilir; beden ertesi gece daha derin uyur.
- Uykusuzluğu "sesin yüzünden" diye açıklamak, uykuyu sesin düzelmesine bağlar; oysa uyku ses varken de düzelir. Marks çalışmasında CBT-I alanların yüzde seksenine yakını uykusuzluğunun düzeldiğini bildirdi.`,
          en: `- Not everyone needs eight hours; 6–9 hours is the normal range. If you function well in the day, the amount is enough.
- Brief night wakings are normal; most people wake several times a night and do not remember.
- One bad night spoils the next day but is made up; the body sleeps more deeply the following night.
- Explaining insomnia "because of the sound" ties sleep to the sound improving; yet sleep improves while the sound is there. In the Marks trial close to eighty per cent of those receiving CBT-I reported their insomnia had improved.`,
        },
      },
      {
        heading: { tr: 'Önemli uyarı', en: 'Important notice' },
        kind: 'warning',
        body: {
          tr: `Bu programın üçüncü haftasındaki uyku sıkıştırma, yatakta geçen süreyi geçici olarak kısaltır. Epilepsi, bipolar bozukluk, uyurgezerlik gibi parasomniler ya da güvenlik açısından kritik bir işiniz (sürücülük, ağır makine, vardiya) varsa bu adımı yalnızca bir hekim ya da uyku uzmanıyla birlikte uygulayın. Bu durumlar sizin için geçerliyse programın diğer bileşenlerine (uyaran kontrolü, bilişsel çalışma, gevşeme) devam edin ve sıkıştırma modülünü atlayın.`,
          en: `Sleep compression in week three of this programme temporarily shortens time in bed. If you have epilepsy, bipolar disorder, a parasomnia such as sleepwalking, or a safety-critical job (driving, heavy machinery, shift work), apply that step only together with a doctor or sleep specialist. If any of these apply to you, continue with the other components (stimulus control, cognitive work, relaxation) and skip the compression module.`,
        },
      },
    ],
    practice: {
      kind: 'checklist',
      minutes: 4,
      items: [
        { tr: 'Uyku günlüğünü bu sabahtan başlayarak dolduruyorum.', en: 'I am filling in the sleep diary from this morning on.' },
        { tr: 'Haftanın her günü için tek bir kalkış saati belirledim.', en: 'I set one rise time for every day of the week.' },
        { tr: 'Yatak odasında gece için düşük düzeyde ortam sesi kurdum.', en: 'I set up low-level background sound in the bedroom for the night.' },
        { tr: 'Gündüz uykusunu bıraktım ya da 20 dakikayla sınırladım.', en: 'I stopped napping or limited naps to 20 minutes.' },
        { tr: 'Uyku sıkıştırma için uyarıdaki durumların bende olup olmadığını kontrol ettim.', en: 'I checked whether any of the conditions in the notice about sleep compression apply to me.' },
      ],
    },
    keyTakeaway: {
      tr: 'Uyku baskısı, biyolojik saat ve uyarılma uykuyu belirler; tinnitus uyarılmayı besler ama uyku, ses varken de uyku günlüğü ve altı haftalık CBT-I ile yeniden kurulabilir.',
      en: 'Sleep pressure, the body clock and arousal determine sleep; tinnitus feeds arousal, but sleep can be rebuilt while the sound is there through the sleep diary and six weeks of CBT-I.',
    },
    citations: ['marks2023', 'espie2014'],
  },
  {
    id: 'cbti.stimulusControl',
    title: { tr: 'Uyaran kontrolü', en: 'Stimulus control' },
    intro: {
      tr: 'Uykusuzluk için en güçlü kanıta sahip tek davranışsal yöntem. Amaç, yatak ile uyku arasındaki bağı yeniden kurmak ve yatak ile uyanıklık, endişe ve tinnitus dinleme arasındaki bağı koparmaktır. Kurallar basit, uygulama iki üç hafta sabır ister.',
      en: 'The single behavioural method with the strongest evidence for insomnia. The aim is to rebuild the link between bed and sleep and to break the link between bed and wakefulness, worry and listening to tinnitus. The rules are simple; applying them takes two to three weeks of patience.',
    },
    sections: [
      {
        heading: { tr: 'Yatak neyi öğrendi', en: 'What the bed has learned' },
        body: {
          tr: `Haftalarca yatakta uyanık kalıp sesi dinlemek, kaygılanmak ya da telefona bakmak, yatağı bir koşullu uyaran hâline getirir: yatağa girmek uykuyu değil uyanıklığı çağırır. Pek çok kişi "kanepede uyuyakalıyorum ama yatağa geçince uyanıyorum" der; bu, öğrenmenin kanıtıdır.

Uyaran kontrolü bu öğrenmeyi tersine çevirir. Yatakta yalnızca uyunursa ve uyanıklık her seferinde yataktan dışarı taşınırsa, birkaç hafta içinde yatak yeniden uykuyu çağırır. Yöntem Bootzin tarafından 1970'lerde geliştirilmiş, o zamandan beri onlarca çalışmada doğrulanmıştır; Marks ve arkadaşlarının tinnitus çalışmasında da CBT-I paketinin temel parçasıydı.`,
          en: `Weeks of lying awake in bed listening to the sound, worrying or looking at the phone turn the bed into a conditioned cue: getting into bed calls up wakefulness, not sleep. Many people say "I fall asleep on the sofa but wake up when I move to bed"; that is the evidence of learning.

Stimulus control reverses this learning. If the bed is used only for sleep and wakefulness is carried out of the bed every time, within a few weeks the bed calls up sleep again. The method was developed by Bootzin in the 1970s and confirmed in dozens of studies since; it was a core part of the CBT-I package in the Marks tinnitus trial too.`,
        },
      },
      {
        heading: { tr: 'Beş kural', en: 'The five rules' },
        kind: 'exercise',
        body: {
          tr: `1. **Yalnızca uykunuz gelince yatın.** Yorgunluk ile uykululuk farklıdır; uykululuk göz kapaklarının ağırlaşması, esnemedir.
2. **Yatak yalnızca uyku ve yakınlık için.** Okuma, telefon, televizyon, yemek, planlama, tinnitusu dinleme: hiçbiri yatakta değil.
3. **15 dakika kuralı.** Yaklaşık 15–20 dakika içinde uyuyamadıysanız kalkın. Başka bir odaya geçin, loş ışıkta sakin bir şey yapın (kitap, hafif müzik, gevşeme). Uykunuz gelince yatağa dönün. Gerekirse tekrarlayın; ilk gecelerde üç dört kez olabilir.
4. **Gece uyanınca da aynı.** 15–20 dakika içinde uyuyamıyorsanız kalkın.
5. **Sabit kalkış saati.** Ne kadar uyuduğunuzdan bağımsız, her gün aynı saat. Alarm kurun, ertelemeyin.

**Tinnitusa uyarlama:** Kalktığınızda gittiğiniz yerde de düşük ortam sesi olsun; yatak odasındaki ses sabit ve aralıksız olsun. Yatakta uyanıkken sesi "ölçmeyin"; fark ettiğiniz anda bu, kalkma kuralını uygulamanın işaretidir.`,
          en: `1. **Go to bed only when sleepy.** Tiredness and sleepiness differ; sleepiness is heavy eyelids, yawning.
2. **The bed is for sleep and intimacy only.** Reading, phone, television, food, planning, listening to the tinnitus: none of it in bed.
3. **The 15-minute rule.** If you have not fallen asleep in about 15–20 minutes, get up. Move to another room, do something calm in dim light (a book, soft music, relaxation). Return to bed when sleepy. Repeat if needed; in the first nights it may be three or four times.
4. **The same on waking at night.** If you cannot get back to sleep within 15–20 minutes, get up.
5. **A fixed rise time.** Regardless of how much you slept, the same time every day. Set an alarm, do not snooze.

**Adaptation for tinnitus:** Have low background sound in the place you move to as well; keep the bedroom sound steady and uninterrupted. Do not "measure" the sound while awake in bed; the moment you notice yourself doing it, that is the cue to apply the get-up rule.`,
        },
      },
      {
        heading: { tr: 'İlk hafta ne olur', en: 'What happens in the first week' },
        body: {
          tr: `İlk gecelerde daha az uyuyabilirsiniz; bu yöntemin işleyişinin parçasıdır. Daha az uyku, ertesi gece daha yüksek uyku baskısı demektir ve yatakta geçen uyanık süre hızla kısalır. Çoğu kişi ikinci haftada farkı görür.

Kalkmak soğuk, karanlık ya da zahmetli görünebilir. Gitmek için önceden bir yer hazırlayın: bir koltuk, battaniye, loş lamba, kitap, düşük sesli bir hoparlör. Kalkmak için gereken irade, hazırlık yapıldığında azalır.

Yatağa dönmek için "uyku gelmesini" bekleyin, "yeterince kalktım" hissini değil. Bu farkı ilk gecelerde ayırt etmek zordur; şüphede kalınca biraz daha bekleyin.`,
          en: `In the first nights you may sleep less; that is part of how the method works. Less sleep means higher sleep pressure the next night, and the time spent awake in bed shortens quickly. Most people see the difference in the second week.

Getting up may seem cold, dark or tiresome. Prepare a place to go in advance: an armchair, a blanket, a dim lamp, a book, a speaker at low volume. The willpower needed to get up drops when the preparation is done.

Return to bed when sleepiness arrives, not when you feel "I have been up long enough". The difference is hard to tell in the first nights; when in doubt, wait a little longer.`,
        },
      },
      {
        heading: { tr: 'Güvenlik', en: 'Safety' },
        kind: 'warning',
        body: {
          tr: `Gece kalkarken düşme riski olan kişiler (ileri yaş, denge sorunu, baş dönmesi) yolu aydınlatmalı ve gerekirse yatakta oturarak uyanıklığı geçirmelidir; ışığı açıp oturmak da yatak ile uyku bağını korumaya yardımcı olur. Gündüz belirgin uykululuk gelişirse araç kullanmayın ve kalkış saatini kademeli olarak 15 dakika ileri alın.`,
          en: `People at risk of falling when getting up at night (older age, balance problems, dizziness) should light the way and, if needed, sit up in bed to pass the wakefulness; turning on the light and sitting up also helps protect the bed–sleep link. If marked daytime sleepiness develops, do not drive and move the rise time later by 15 minutes in steps.`,
        },
      },
    ],
    practice: {
      kind: 'checklist',
      minutes: 4,
      items: [
        { tr: 'Gece kalkmak için bir yer hazırladım: koltuk, battaniye, loş ışık, düşük ses.', en: 'I prepared a place to go at night: armchair, blanket, dim light, low sound.' },
        { tr: 'Yatakta telefon, televizyon ve okuma yok.', en: 'No phone, television or reading in bed.' },
        { tr: 'Uyuyamadığımda 15–20 dakika içinde kalktım (bu hafta en az üç gece).', en: 'When I could not sleep I got up within 15–20 minutes (at least three nights this week).' },
        { tr: 'Her sabah aynı saatte kalktım; alarmı ertelemedim.', en: 'I got up at the same time every morning; I did not snooze.' },
        { tr: 'Uyku günlüğünü her sabah doldurdum.', en: 'I filled in the sleep diary every morning.' },
      ],
    },
    keyTakeaway: {
      tr: 'Yatak uyanıklığı öğrenmiştir; yatakta yalnızca uyumak, 15–20 dakikada kalkmak ve sabit kalkış saati iki üç haftada yatağı yeniden uykuya bağlar.',
      en: 'The bed has learned wakefulness; sleeping only in bed, getting up after 15–20 minutes and a fixed rise time re-link the bed with sleep within two to three weeks.',
    },
    citations: ['marks2023'],
  },
  {
    id: 'cbti.compression',
    title: { tr: 'Uyku sıkıştırma', en: 'Sleep compression' },
    intro: {
      tr: 'Uykusuzluk yaşayan kişiler genellikle yatakta uyuduklarından çok daha uzun süre geçirir; bu uzun süre uykuyu seyreltir ve yüzeyselleştirir. Uyku sıkıştırma, yatakta geçen süreyi gerçek uyku süresine yaklaştırarak uykuyu yoğunlaştırır. Bu, CBT-I\'nin en etkili ve en zor bileşenidir.',
      en: 'People with insomnia usually spend far longer in bed than they sleep; that long span dilutes sleep and makes it shallow. Sleep compression brings time in bed closer to actual sleep time and so concentrates sleep. It is the most effective and the hardest component of CBT-I.',
    },
    sections: [
      {
        heading: { tr: 'Önce güvenlik', en: 'Safety first' },
        kind: 'warning',
        body: {
          tr: `Yatakta geçen süreyi kısaltmak ilk bir iki hafta gündüz uykululuğunu artırabilir. Aşağıdaki durumlardan biri sizde varsa bu modülü bir hekim ya da uyku uzmanı ile birlikte uygulayın; tek başınıza başlamayın:

- Epilepsi veya nöbet öyküsü
- Bipolar bozukluk
- Uyurgezerlik, uyku terörü gibi parasomniler
- Güvenlik açısından kritik iş: profesyonel sürücülük, ağır makine, gece vardiyası, sağlık nöbetleri
- Gebelik, kontrolsüz bir tıbbi durum ya da uyku apnesi şüphesi

Bu durumlarda uyaran kontrolü, bilişsel çalışma ve gevşeme modüllerine devam edin; bu modülü atlayın.`,
          en: `Shortening time in bed can increase daytime sleepiness in the first week or two. If any of the following apply to you, use this module together with a doctor or sleep specialist; do not start alone:

- Epilepsy or a history of seizures
- Bipolar disorder
- Parasomnias such as sleepwalking or sleep terrors
- A safety-critical job: professional driving, heavy machinery, night shifts, on-call clinical work
- Pregnancy, an uncontrolled medical condition or suspected sleep apnoea

In these cases continue with stimulus control, cognitive work and relaxation; skip this module.`,
        },
      },
      {
        heading: { tr: 'Mantık', en: 'The rationale' },
        body: {
          tr: `Diyelim ki saat 23.00'te yatıyor, 07.30'da kalkıyorsunuz: yatakta 8,5 saat. Günlüğünüz ortalama 6 saat uyuduğunuzu gösteriyor. Uyku verimliliği 6 ÷ 8,5 = yüzde 70. Geri kalan 2,5 saat uyanık, sesle ve endişeyle geçiyor ve yatağı uyanıklığa bağlıyor.

Uyku sıkıştırma yatakta geçen süreyi uyku süresine indirir. Uyku baskısı yükselir, uykuya dalma hızlanır, gece uyanmaları azalır ve uyku derinleşir. İlk hafta toplam uyku biraz azalabilir; ama verimlilik yükselir ve sonra pencere adım adım genişletilir. Marks çalışmasında bu yöntem CBT-I paketinin merkezindeydi ve katılımcıların yüzde doksan dördü programı tamamladı.`,
          en: `Say you go to bed at 11 pm and get up at 7.30 am: 8.5 hours in bed. Your diary shows you sleep 6 hours on average. Sleep efficiency is 6 ÷ 8.5 = 70 per cent. The remaining 2.5 hours are spent awake, with the sound and with worry, and they bind the bed to wakefulness.

Sleep compression reduces time in bed to sleep time. Sleep pressure rises, falling asleep gets faster, night wakings fall and sleep deepens. In the first week total sleep may dip a little; but efficiency rises and the window is then widened step by step. In the Marks trial this method was at the centre of the CBT-I package and ninety-four per cent of participants completed the programme.`,
        },
      },
      {
        heading: { tr: 'Uyku pencerenizi hesaplamak', en: 'Calculating your sleep window' },
        kind: 'exercise',
        body: {
          tr: `1. Son 7 gecenin uyku günlüğünden **ortalama toplam uyku süresini** bulun (örnek: 6 saat).
2. **Yatakta geçirilecek süre = ortalama uyku + 30 dakika** (örnek: 6 saat 30 dakika). Bu süre hiçbir zaman **5,5 saatin altına** inmez.
3. Kalkış saatinizi sabit tutun (örnek: 07.00). Yatış saati geriye doğru hesaplanır: 07.00 − 6 sa 30 dk = **00.30**.
4. Pencerenin dışında yatakta olmayın: 00.30'dan önce yatmayın, 07.00'den sonra kalmayın. Uyaran kontrolü kuralları pencerenin içinde de geçerlidir.
5. Her hafta günlükten uyku verimliliğini hesaplayın: uyku süresi ÷ yatakta geçen süre.
   - **Verimlilik yüzde 85 veya üstü:** pencereyi **15 dakika** genişletin (yatış saatini 15 dakika öne alın).
   - **Yüzde 80–85:** pencereyi koruyun.
   - **Yüzde 80'in altı:** pencereyi 15 dakika daraltın (5,5 saat alt sınırını aşmadan).
6. Gündüz işlevselliğiniz iyi ve uyku verimli olana kadar haftalık ayarlamaya devam edin; çoğu kişi 3–5 haftada kendi doğal süresine ulaşır.

Aşağıdaki araç, ortalama uyku sürenizi ve kalkış saatinizi girdiğinizde pencereyi hesaplar.`,
          en: `1. From the last 7 nights of the sleep diary, find your **average total sleep time** (example: 6 hours).
2. **Time in bed = average sleep + 30 minutes** (example: 6 hours 30 minutes). This never goes **below 5.5 hours**.
3. Keep your rise time fixed (example: 7.00 am). Bedtime is counted backwards: 7.00 − 6 h 30 min = **00.30**.
4. Do not be in bed outside the window: do not go to bed before 00.30, do not stay after 7.00. The stimulus control rules still apply inside the window.
5. Each week calculate sleep efficiency from the diary: time asleep ÷ time in bed.
   - **Efficiency 85 per cent or more:** widen the window by **15 minutes** (move bedtime 15 minutes earlier).
   - **80–85 per cent:** keep the window.
   - **Below 80 per cent:** narrow the window by 15 minutes (never below the 5.5-hour floor).
6. Keep adjusting weekly until daytime functioning is good and sleep is efficient; most people reach their natural length in 3–5 weeks.

The tool below calculates the window when you enter your average sleep time and rise time.`,
        },
      },
      {
        heading: { tr: 'İlk haftayı atlatmak', en: 'Getting through the first week' },
        kind: 'tip',
        body: {
          tr: `- Yatış saatine kadar uyanık kalmak zor olabilir: ayakta kalın, loş ama yeterli ışıkta hafif bir uğraş bulun, kanepede uyuyakalmayın.
- Gündüz uykululuk gelirse kısa yürüyüş, gün ışığı, soğuk su. Gündüz uyumayın; uyku baskısı gece için saklanır.
- Yorgunlukla tinnitus daha belirgin gelebilir. Bu geçicidir; uyku düzelince geriler.
- Pencereyi "cezalandırıcı" olarak görmeyin; bu, uykunun yoğunlaştırıldığı kısa bir dönemdir ve her hafta genişler.`,
          en: `- Staying awake until bedtime can be hard: stay on your feet, find a light activity in dim but sufficient light, do not fall asleep on the sofa.
- If daytime sleepiness comes: a short walk, daylight, cold water. Do not nap; the sleep pressure is saved for the night.
- With tiredness the tinnitus may seem more prominent. That is temporary; it recedes as sleep improves.
- Do not see the window as "punishing"; it is a short period in which sleep is concentrated, and it widens every week.`,
        },
      },
    ],
    practice: { kind: 'sleepWindow', minutes: 5 },
    keyTakeaway: {
      tr: 'Yatakta geçen süre = ortalama uyku + 30 dakika, en az 5,5 saat; verimlilik yüzde 85\'e ulaştıkça pencere her hafta 15 dakika genişler. Epilepsi, bipolar bozukluk, parasomni ya da güvenlik açısından kritik işte yalnızca uzmanla uygulanır.',
      en: 'Time in bed = average sleep + 30 minutes, never under 5.5 hours; as efficiency reaches 85 per cent the window widens by 15 minutes each week. With epilepsy, bipolar disorder, parasomnia or a safety-critical job, only under specialist supervision.',
    },
    citations: ['marks2023'],
  },
  {
    id: 'cbti.cognitions',
    title: { tr: 'Uyku ve tinnitus hakkındaki düşünceler', en: 'Thoughts about sleep and tinnitus' },
    intro: {
      tr: '"Bu sesle asla uyuyamam." "Yarın mahvolacağım." "Sekiz saat uyumalıyım." Uykuyla ilgili düşünceler gece yatakta en yüksek sesle konuşur ve uyanıklığı besler. Bu modül, uyku ve tinnitus hakkındaki felaketleştirici inançları tanımayı ve onlara gece yarısı değil, gündüz yanıt vermeyi öğretir.',
      en: '"I can never sleep with this sound." "Tomorrow will be ruined." "I must get eight hours." Thoughts about sleep speak loudest in bed at night and feed wakefulness. This module teaches recognising catastrophic beliefs about sleep and tinnitus and answering them in the day, not at midnight.',
    },
    sections: [
      {
        heading: { tr: 'Gece zihni', en: 'The night mind' },
        body: {
          tr: `Gece yarısı zihin farklı çalışır: yorgunluk yargıyı zayıflatır, karanlık belirsizliği artırır, sessizlik sesi büyütür. Gündüz gülüp geçeceğiniz bir düşünce ("asla uyuyamayacağım") gece bir olgu gibi gelir. Bu düşünce kaygıyı, kaygı uyarılmayı, uyarılma uyanıklığı artırır ve düşünce kendini doğrular.

Uykuyla ilgili düşüncelerin üç kalıbı vardır: uykunun sonuçlarını felaketleştirme ("yarın hiçbir şey yapamam"), uyku hakkında katı kurallar ("sekiz saat şart") ve tinnitusa teslimiyet ("ses varken uyku imkânsız"). Üçü de yanlışlanabilir; ama gece değil, gündüz.`,
          en: `At midnight the mind works differently: fatigue weakens judgement, darkness increases uncertainty, silence magnifies the sound. A thought you would laugh off in daytime ("I will never sleep") arrives at night like a fact. The thought raises anxiety, anxiety raises arousal, arousal raises wakefulness, and the thought confirms itself.

Thoughts about sleep come in three patterns: catastrophising the consequences of sleep ("I will not be able to do anything tomorrow"), rigid rules about sleep ("eight hours are essential") and surrender to the tinnitus ("sleep is impossible with the sound"). All three can be tested; but in the day, not at night.`,
        },
      },
      {
        heading: { tr: 'Gündüz yapılacak düşünce kayıtları', en: 'Thought records to do in the day' },
        kind: 'exercise',
        body: {
          tr: `Gece beliren üç düşünceyi gündüz, dinlenmişken bir düşünce kaydına alın. Her biri için kanıt tartın ve dengeli cümleyi yazın. Örnekler:

- **"Bu sesle asla uyuyamam."** Karşı kanıt: günlükte geçen hafta beş gece uyudum; ses her gece oradaydı. Kanepede ses varken uyuyakaldım. Dengeli: "Ses uykuya dalmayı zorlaştırabiliyor ama engellemiyor; çoğu gece sonunda uyuyorum."
- **"Yarın mahvolacağım."** Karşı kanıt: önceki kötü gecelerin ertesi günleri yorucuydu ama geçti; işler yapıldı. Dengeli: "Yarın yorgun olacağım, bu bir felaket değil. Yorgun günleri daha önce de geçirdim."
- **"Sekiz saat uyumalıyım."** Karşı kanıt: 6–9 saat normal aralık; gündüz işlevim altı saatle de iyiydi. Dengeli: "Bedenim ihtiyacı olanı alır; saat saymak uykuyu getirmez."

Dengeli cümleleri bir karta ya da telefon notuna yazın. Gece düşünce geldiğinde tartışmayın; kartı hatırlayın, nefes verin, uyaran kontrolü kuralını uygulayın.`,
          en: `Take three thoughts that appear at night into a thought record in the day, when rested. Weigh the evidence for each and write the balanced sentence. Examples:

- **"I can never sleep with this sound."** Against: the diary shows I slept five nights last week; the sound was there every night. I fell asleep on the sofa with the sound. Balanced: "The sound can make falling asleep harder but does not prevent it; most nights I sleep in the end."
- **"Tomorrow will be ruined."** Against: the days after previous bad nights were tiring but passed; things got done. Balanced: "I will be tired tomorrow; that is not a disaster. I have had tired days before."
- **"I must get eight hours."** Against: 6–9 hours is the normal range; my daytime functioning was fine on six. Balanced: "My body takes what it needs; counting hours does not bring sleep."

Write the balanced sentences on a card or a phone note. When the thought comes at night, do not argue; recall the card, breathe out, apply the stimulus control rule.`,
        },
      },
      {
        heading: { tr: 'Uyku çabası paradoksu', en: 'The sleep effort paradox' },
        body: {
          tr: `Uyku, çabayla gelmeyen tek şeylerden biridir. "Uyumalıyım" düşüncesi performans kaygısı yaratır ve uyanıklığı artırır. Bazı kişiler için tam tersi işe yarar: yatakta rahatça uzanıp "uyanık kalmaya" niyetlenmek. Buna paradoksal niyet denir ve uykuya dalma kaygısı yüksek kişilerde kanıt vardır. Deneyin: gözler açık, karanlıkta, "biraz daha uyanık kalayım" diye düşünerek sakince uzanın. Uyku çoğu zaman kendi gelir.

Tinnitus için benzer bir paradoks geçerlidir: sesi duymamaya çalışmak sesi büyütür; sese "orada olabilirsin" demek onu küçültür. İzin vermek (bilinçli farkındalık modülü) ve ses zenginleştirme bu tutumun araçlarıdır.`,
          en: `Sleep is one of the few things that does not come with effort. The thought "I must sleep" creates performance anxiety and increases wakefulness. For some people the opposite works: lying comfortably in bed intending to "stay awake". This is called paradoxical intention and has evidence in people with high sleep-onset anxiety. Try it: eyes open, in the dark, lying calmly while thinking "let me stay awake a little longer". Sleep usually comes on its own.

A similar paradox holds for tinnitus: trying not to hear the sound magnifies it; telling the sound "you can be there" shrinks it. Allowing (the mindfulness module) and sound enrichment are the tools of this stance.`,
        },
      },
      {
        heading: { tr: 'Gece için kısa kart', en: 'A short card for the night' },
        body: {
          tr: `Gece beliren düşüncelere uzun yanıtlar işlemez; kısa, önceden hazırlanmış cümleler işler. Telefon notuna ya da yatak başına şu türden üç dört cümle yazın:

- "Ses burada; uyku yine de gelir. Geçen hafta beş gece geldi."
- "Yorgun bir yarın bir felaket değil."
- "Saat saymak uykuyu getirmez; nefese dönüyorum."
- "On beş dakika geçtiyse kalkıyorum; bu bir kural, bir yenilgi değil."

Kartı gece okumak için değil, hatırlamak için yazıyorsunuz. Bir iki hafta sonra cümleler ezberlenir ve gece zihni onları kendi üretmeye başlar.`,
          en: `Long answers do not work for thoughts that appear at night; short, prepared sentences do. Write three or four sentences of this kind in a phone note or by the bed:

- "The sound is here; sleep still comes. Last week it came five nights."
- "A tired tomorrow is not a disaster."
- "Counting hours does not bring sleep; I return to the breath."
- "If fifteen minutes have passed I get up; that is a rule, not a defeat."

You write the card not to read at night but to remember. After a week or two the sentences are memorised and the night mind starts producing them itself.`,
        },
      },
    ],
    practice: { kind: 'thoughtRecord', minutes: 10 },
    keyTakeaway: {
      tr: 'Gece zihni uyku ve tinnitus hakkında felaketleştirir; dengeli cümleleri gündüz hazırlayıp gece tartışmadan hatırlamak ve uyku çabasını bırakmak uyanıklığı azaltır.',
      en: 'The night mind catastrophises about sleep and tinnitus; preparing balanced sentences in the day, recalling them at night without arguing and dropping the effort to sleep reduce wakefulness.',
    },
    citations: ['marks2023', 'fuller2020'],
  },
  {
    id: 'cbti.windDown',
    title: { tr: 'Yatış öncesi rutin ve endişe zamanı', en: 'The wind-down routine and worry time' },
    intro: {
      tr: 'Uyku bir düğmeyle açılmaz; beden ve zihin için bir iniş pisti gerekir. Bu modül, yatıştan önceki 60–90 dakikayı düzenlemeyi, günün endişelerini yatak odasının dışında bırakmak için "endişe zamanı" yöntemini ve gevşemeyi uykuya uyarlamayı anlatır.',
      en: 'Sleep does not switch on with a button; body and mind need a landing strip. This module covers organising the 60–90 minutes before bed, the "worry time" method for leaving the day\'s worries outside the bedroom, and adapting relaxation for sleep.',
    },
    sections: [
      {
        heading: { tr: 'Endişe zamanı', en: 'Worry time' },
        body: {
          tr: `Zihin, çözülmemiş sorunları gece yatakta açar çünkü gün içinde onlara zaman ayrılmamıştır. Endişe zamanı, bu işe gündüz belirli bir yer verir: akşam yemeğinden sonra, yataktan en az iki saat önce, 15–20 dakika. Bir kâğıda aklınızdaki endişeleri yazın; her birinin yanına "yapılacak bir şey var mı, varsa ilk adım ne?" sorusunun cevabını ekleyin. Yapılacak bir şey yoksa yanına "şimdilik yapılacak bir şey yok" yazın. Kâğıdı kapatın.

Gece bir endişe geldiğinde: "Bunu yazdım; yarın endişe zamanında bakacağım." Tartışmayın, çözmeye çalışmayın. Zihin, endişenin bir yeri olduğunu öğrendiğinde yatakta onu açmaya daha az ihtiyaç duyar. Tinnitusla ilgili endişeler ("ses kötüleşiyor mu?") de bu kâğıda yazılır; ilk adım genellikle "programa devam, sabah kaydı yap"tır.`,
          en: `The mind opens unsolved problems in bed at night because no time was given to them during the day. Worry time gives this work a set place in the day: after dinner, at least two hours before bed, 15–20 minutes. Write the worries on your mind on a sheet of paper; beside each add the answer to "is there something to do, and if so what is the first step?" If there is nothing to do, write "nothing to do for now". Close the sheet.

When a worry comes at night: "I have written this down; I will look at it tomorrow in worry time." Do not argue, do not try to solve. When the mind learns that worry has a place, it needs to open it in bed less often. Worries about tinnitus ("is the sound getting worse?") go on the sheet too; the first step is usually "continue the programme, do the morning record".`,
        },
      },
      {
        heading: { tr: 'İniş pisti: son 60–90 dakika', en: 'The landing strip: the last 60–90 minutes' },
        kind: 'exercise',
        body: {
          tr: `Her akşam aynı sırayla tekrarlanan bir rutin, bedene "uyku geliyor" sinyali verir. Örnek bir dizi; kendinize uyarlayın:

- **−90 dk:** Ekranlar kapanır ya da gece moduna geçer. İş e-postası yok. Işıklar kısılır.
- **−60 dk:** Hafif bir uğraş: kitap, hafif müzik, örgü, bulmaca. Kafein ve alkol yok; ağır yemek yok.
- **−45 dk:** Ilık duş ya da ayak banyosu; bedenin ardından soğuması uykuya yardım eder.
- **−30 dk:** Yatak odasında ortam sesi açılır (uyku zamanlayıcısı en az 90 dakika). Yarın için küçük hazırlıklar.
- **−15 dk:** Gevşeme: yalnızca bırakma ya da nefesle işaretli gevşeme, yatağın dışında bir koltukta.
- **0:** Uyku geldiğinde yatağa; pencerenin başlangıcından önce değil.

Rutin uzun olmak zorunda değildir; sıra ve tekrar önemlidir. Üç dört hafta içinde rutinin ilk adımı bile uykululuk getirmeye başlar.`,
          en: `A routine repeated in the same order every evening signals "sleep is coming" to the body. An example sequence; adapt it to yourself:

- **−90 min:** Screens off or in night mode. No work email. Lights dimmed.
- **−60 min:** A light activity: a book, soft music, knitting, a puzzle. No caffeine or alcohol; no heavy meal.
- **−45 min:** A warm shower or foot bath; the body cooling afterwards helps sleep.
- **−30 min:** Background sound on in the bedroom (sleep timer at least 90 minutes). Small preparations for tomorrow.
- **−15 min:** Relaxation: release-only or cue-controlled breathing, in a chair outside the bed.
- **0:** To bed when sleepy; not before the start of the window.

The routine need not be long; order and repetition matter. Within three or four weeks even the first step of the routine begins to bring sleepiness.`,
        },
      },
      {
        heading: { tr: 'Gevşemeyi uykuya uyarlamak', en: 'Adapting relaxation to sleep' },
        kind: 'tip',
        body: {
          tr: `- Yatakta uzun gevşeme oturumu yapmayın; yatak uyku içindir. Gevşemeyi yatmadan önce koltukta yapın, yatağa gevşemiş girin.
- Gece uyanınca yatakta 2–3 dakikalık nefesle gevşeme uygundur; sonrasında hâlâ uyanıksanız kalkın.
- Gevşeme uykuyu "getirmek" için değildir; bu beklenti çabaya dönüşür. Amaç bedeni iniş için hazırlamaktır; uyku kendi gelir.
- Olumlu imgeleme (güvenli yer) uykuya geçişte iyi çalışır; sesi yerin dokusuna katın.`,
          en: `- Do not do long relaxation sessions in bed; the bed is for sleep. Relax in a chair before bed and get into bed already relaxed.
- On waking at night, 2–3 minutes of breathing relaxation in bed is fine; if still awake afterwards, get up.
- Relaxation is not meant to "bring" sleep; that expectation turns into effort. The aim is to prepare the body for landing; sleep comes on its own.
- Positive imagery (the safe place) works well for the transition into sleep; fold the sound into the texture of the place.`,
        },
      },
    ],
    practice: {
      kind: 'checklist',
      minutes: 4,
      items: [
        { tr: 'Endişe zamanı için akşam 15–20 dakikalık sabit bir saat belirledim.', en: 'I set a fixed 15–20 minute slot in the evening for worry time.' },
        { tr: 'Endişeleri ve ilk adımları bir kâğıda yazdım.', en: 'I wrote the worries and first steps on a sheet of paper.' },
        { tr: 'Yatıştan 90 dakika önce ekranları kapattım ya da gece moduna aldım.', en: 'I turned screens off or to night mode 90 minutes before bed.' },
        { tr: 'Gevşemeyi yatağın dışında bir koltukta yaptım.', en: 'I did the relaxation in a chair outside the bed.' },
        { tr: 'Rutini bu hafta en az dört gece aynı sırayla uyguladım.', en: 'I followed the routine in the same order at least four nights this week.' },
      ],
    },
    keyTakeaway: {
      tr: 'Endişelere gündüz belirli bir zaman vermek ve her akşam aynı sırayla tekrarlanan 60–90 dakikalık iniş pisti kurmak, zihne ve bedene uykunun geldiğini öğretir.',
      en: 'Giving worries a set time in the day and building a 60–90 minute landing strip repeated in the same order every evening teaches mind and body that sleep is coming.',
    },
    citations: ['marks2023', 'ost1987'],
  },
  {
    id: 'cbti.relapse',
    title: { tr: 'Uyku kazanımlarını korumak', en: 'Keeping the sleep gains' },
    intro: {
      tr: 'Altı haftalık uyku programının sonundasınız. Uyku, yaşam olaylarıyla dalgalanır: hastalık, seyahat, stres, bir bebek. Bu modül kötü bir gecenin ya da haftanın eski döngüye dönüş olmaması için ne yapacağınızı ve hangi kuralları kalıcı tutacağınızı belirler.',
      en: 'You are at the end of the six-week sleep programme. Sleep fluctuates with life events: illness, travel, stress, a baby. This module sets what to do so that a bad night or week does not become a return to the old loop, and which rules to keep for good.',
    },
    sections: [
      {
        heading: { tr: 'Kalıcı kurallar ve esnek kurallar', en: 'Permanent rules and flexible rules' },
        body: {
          tr: `**Kalıcı tutulacaklar:** sabit kalkış saati (hafta sonu en fazla bir saat sapma), yatakta yalnızca uyku, uyuyamayınca kalkmak, gündüz uyumamak, yatak odasında ortam sesi. Bunlar alışkanlık olmalı; programın bittiği anlamına gelmez.

**Esnetilebilecekler:** uyku penceresi (artık doğal sürenize ulaştınız; iyi dönemlerde pencereyi izlemeye gerek yoktur), yatış öncesi rutinin ayrıntıları, günlük tutma (haftada bir gözden geçirme yeterlidir).

**Yeniden sıkılaştırılacaklar:** iki hafta üst üste uyku verimliliği yüzde 80'in altına düştüğünde ya da uykuya dalma süresi 30 dakikayı aştığında pencereyi yeniden daraltın ve günlüğü yeniden başlatın. İki haftalık "mini program" genellikle yeterlidir.`,
          en: `**To keep for good:** the fixed rise time (at most one hour of drift at weekends), the bed only for sleep, getting up when sleep does not come, no napping, background sound in the bedroom. These should be habits; they do not end with the programme.

**Can be loosened:** the sleep window (you have reached your natural length; in good periods there is no need to track it), the details of the wind-down routine, the diary (a weekly review is enough).

**To tighten again:** when sleep efficiency falls below 80 per cent for two weeks in a row or time to fall asleep exceeds 30 minutes, narrow the window again and restart the diary. A two-week "mini programme" is usually enough.`,
        },
      },
      {
        heading: { tr: 'Kötü bir geceden sonra', en: 'After a bad night' },
        body: {
          tr: `Bir kötü gece normaldir ve telafi edilir. Ertesi gün yapılmaması gerekenler: erken yatmak, gündüz uyumak, geç kalkmak, "telafi etmeye" çalışmak. Bunlar uyku baskısını dağıtır ve bir kötü geceyi üç kötü geceye çevirir. Yapılacak: aynı saatte kalkmak, gün ışığı, hareket, akşam rutinine sadık kalmak. Beden ertesi gece daha derin uyur.

Kötü bir dönem (bir haftadan uzun) başladığında nedeni arayın: seyahat, hastalık, yeni bir stres, kafein artışı, tinnitusta geçici bir alevlenme. Nedene yönelik basit bir düzeltme ve iki haftalık mini program çoğu zaman yeterlidir. Uykusuzluk dört haftadan uzun sürerse ve gündüz işlevselliğinizi bozuyorsa bir uyku uzmanına başvurun; uyku apnesi, huzursuz bacak ya da başka bir neden olabilir.`,
          en: `One bad night is normal and gets made up. What not to do the next day: go to bed early, nap, sleep in, try to "catch up". These dissipate sleep pressure and turn one bad night into three. What to do: get up at the same time, daylight, movement, keep to the evening routine. The body sleeps more deeply the following night.

When a bad period (longer than a week) starts, look for the cause: travel, illness, new stress, more caffeine, a temporary flare of tinnitus. A simple correction aimed at the cause plus the two-week mini programme is usually enough. If insomnia lasts longer than four weeks and impairs daytime functioning, see a sleep specialist; sleep apnoea, restless legs or another cause may be present.`,
        },
      },
      {
        heading: { tr: 'Uyku ve tinnitus birlikte', en: 'Sleep and tinnitus together' },
        kind: 'tip',
        body: {
          tr: `Uyku düzeldikçe tinnitus gündüz de daha az rahatsız eder; Marks çalışmasında CBT-I alan grupta tinnitus sıkıntısı ve psikolojik sıkıntı da azaldı. Tersi de doğrudur: tinnitus programındaki beceriler (gevşeme, düşünce kaydı, izin verme) uykuyu korur. İki programı birbirinden ayrı görmeyin; aynı sinir sistemine aynı yönden yaklaşırlar.

Aşağıdaki plan, uyku için kişisel bakım planınızdır. Yazın ve görünür bir yerde tutun.`,
          en: `As sleep improves, tinnitus bothers you less in the day too; in the Marks trial the CBT-I group also showed reduced tinnitus distress and psychological distress. The reverse holds as well: the skills from the tinnitus programme (relaxation, thought records, allowing) protect sleep. Do not see the two programmes as separate; they approach the same nervous system from the same direction.

The plan below is your personal maintenance plan for sleep. Write it and keep it somewhere visible.`,
        },
      },
      {
        heading: { tr: 'Sık sorulanlar', en: 'Common questions' },
        body: {
          tr: `- **Tatilde ne olur?** Kalkış saatini en fazla bir saat kaydırın; döndüğünüzde ilk günden eski saate geçin. İki üç gecelik sapma telafi edilir.
- **Uyku ilacı kullanıyorum.** Programdaki kurallar ilaçla birlikte de uygulanır; azaltma ya da bırakma kararını yalnızca hekiminizle verin.
- **Eşim farklı saatlerde uyuyor.** Kalkış saati kişiseldir; yatış saati farklı olabilir. Yatak odasındaki ortam sesi her ikinize de uygun düşük bir düzeyde olsun.
- **Günlüğü bırakabilir miyim?** Evet; haftada bir hafızadan gözden geçirme yeterlidir. Kötü bir dönemde yeniden başlatın.`,
          en: `- **What about holidays?** Shift the rise time by at most one hour; on your return go back to the old time from the first day. A deviation of two or three nights is made up.
- **I take sleep medication.** The rules in the programme apply alongside medication; decide on reducing or stopping it only with your doctor.
- **My partner sleeps at different hours.** The rise time is personal; bedtime can differ. Keep the background sound in the bedroom at a low level that suits you both.
- **Can I stop the diary?** Yes; a weekly review from memory is enough. Restart it in a bad period.`,
        },
      },
    ],
    practice: {
      kind: 'worksheet',
      minutes: 8,
      items: [
        { tr: 'Kalıcı kalkış saatim (hafta içi ve hafta sonu)', en: 'My permanent rise time (weekdays and weekends)' },
        { tr: 'Altı haftada en çok işe yarayan iki kural', en: 'The two rules that helped most over six weeks' },
        { tr: 'Benim erken uyarı işaretlerim (ör. yatakta telefon, gündüz uyku, sesi dinlemek)', en: 'My early warning signs (e.g. phone in bed, napping, listening to the sound)' },
        { tr: 'İki haftalık mini programım: hangi kuralları yeniden sıkılaştıracağım?', en: 'My two-week mini programme: which rules will I tighten again?' },
        { tr: 'Uzmana başvurma eşiğim', en: 'My threshold for seeing a specialist' },
      ],
    },
    keyTakeaway: {
      tr: 'Sabit kalkış, yatakta yalnızca uyku ve uyuyamayınca kalkmak kalıcı kurallardır; kötü bir geceyi telafi etmeye çalışmak yerine aynı saatte kalkmak ve gerektiğinde iki haftalık mini program uygulamak kazanımları korur.',
      en: 'A fixed rise time, the bed only for sleep and getting up when sleep does not come are permanent rules; getting up at the same time instead of trying to catch up, and a two-week mini programme when needed, keep the gains.',
    },
    citations: ['marks2023'],
  },
];

// ---------------------------------------------------------------------------------------------
// Hyperacusis (Jüris 2014 CBT; Formby 2015 graded pink noise; stop earplug use in ordinary environments)
// ---------------------------------------------------------------------------------------------
const HYPER: Module[] = [
  {
    id: 'hyper.education',
    title: { tr: 'Ses hassasiyeti: ne olur, ne yardımcı olur', en: 'Sound sensitivity: what happens and what helps' },
    intro: {
      tr: 'Hiperakuzi, çoğu kişinin rahat bulduğu gündelik seslerin rahatsız edici, hatta ağrılı gelmesidir: tabak sesleri, trafik, çocuk sesleri, bir kapının çarpması. Tinnitusu olan kişilerin önemli bir bölümünde görülür. Bu modül mekanizmayı, kaçınmanın rolünü ve kademeli ses programının mantığını anlatır.',
      en: 'Hyperacusis is when everyday sounds most people find comfortable are unpleasant or even painful: crockery, traffic, children\'s voices, a door slamming. It affects a sizeable share of people with tinnitus. This module explains the mechanism, the role of avoidance and the rationale of the graded sound programme.',
    },
    sections: [
      {
        heading: { tr: 'Kazanç ayarı', en: 'The gain setting' },
        body: {
          tr: `İşitme sistemi, gelen sesin düzeyine göre kendi "kazancını" ayarlar; tıpkı bir mikrofon ön yükselticisi gibi. Uzun süre sessizlikte kalındığında ya da kulak tıkacıyla sesler azaltıldığında sistem kazancı yükseltir: zayıf sesleri duyabilmek için. Sonra normal bir ses geldiğinde yükseltilmiş kazançla işlenir ve çok yüksek algılanır. Bu, hiperakuziyi sürdüren temel mekanizmadır ve iyi haberi şudur: kazanç ayarı değiştirilebilir.

Bunun üstüne psikolojik bir katman biner. Rahatsız edici bir ses deneyiminden sonra benzer sesler tehdit olarak işaretlenir; beden gerilir, dikkat sese kilitlenir, ses "daha da yüksek" gelir. Ses korkusu ile kaçınma birbirini besler: kaçındıkça kazanç yükselir, kazanç yükseldikçe sesler daha rahatsız eder, daha çok kaçınılır.`,
          en: `The hearing system sets its own "gain" according to the level of incoming sound, like a microphone preamplifier. After long periods in silence, or when sounds are reduced with earplugs, the system turns the gain up in order to hear faint sounds. When a normal sound then arrives, it is processed at the raised gain and perceived as far too loud. This is the core mechanism maintaining hyperacusis, and the good news is that the gain setting can be changed.

A psychological layer sits on top. After an unpleasant sound experience, similar sounds get tagged as threats; the body tenses, attention locks onto the sound, the sound seems "even louder". Fear of sound and avoidance feed each other: the more you avoid, the higher the gain; the higher the gain, the more sounds hurt; the more you avoid.`,
        },
      },
      {
        heading: { tr: 'Ne yardımcı olur', en: 'What helps' },
        body: {
          tr: `İki yaklaşımın randomize çalışmalarda kanıtı vardır ve birlikte kullanılır:

- **Kademeli ses:** Düşük düzeyde pembe gürültüyü her gün dinlemek ve düzeyi haftalar içinde yavaşça artırmak. Formby ve arkadaşlarının çalışmasında danışmanlıkla birlikte düşük düzeyli ses, rahatsızlık eşiğini yaklaşık 10 desibel yükseltti. Sistemin kazancı, güvenli ve kontrollü ses ile aşağı ayarlanır.
- **Bilişsel davranışçı terapi:** Jüris ve arkadaşlarının 2014 tarihli çalışmasında hiperakuzi için BDT, ses toleransı ve hiperakuzi anketlerinde orta–büyük etki gösterdi ve etki 12 ayda korundu. BDT bileşenleri: ses korkusunu anlamak, güvenlik davranışlarını (kulak tıkacı, kaçınma) bırakmak ve bir ses hiyerarşisi üzerinden kademeli maruz kalma.

Bu programda ikisi birlikte yürür: her gün pembe gürültü oturumu (Sesler bölümündeki hiperakuzi ön ayarı) ve iki haftada bir bir BDT modülü.`,
          en: `Two approaches have evidence from randomised trials and are used together:

- **Graded sound:** Listening to low-level pink noise every day and raising the level slowly over weeks. In the trial by Formby and colleagues, low-level sound combined with counselling raised the discomfort threshold by about 10 decibels. The system's gain is turned down with safe, controlled sound.
- **Cognitive behavioural therapy:** In the 2014 trial by Jüris and colleagues, CBT for hyperacusis showed moderate-to-large effects on sound tolerance and hyperacusis questionnaires, maintained at 12 months. The CBT components: understanding fear of sound, dropping safety behaviours (earplugs, avoidance) and graded exposure through a sound hierarchy.

In this programme the two run together: a daily pink-noise session (the hyperacusis preset in the Sounds section) and a CBT module every two weeks.`,
        },
      },
      {
        heading: { tr: 'Misofoni farkı', en: 'The difference from misophonia' },
        body: {
          tr: `Hiperakuzide sorun sesin **yüksekliğidir**; birçok ses türü rahatsız eder. Misofonide ise sorun **belirli** seslerdir: çiğneme, nefes, klavye tıkırtısı; ses düzeyi düşük olsa da öfke, iğrenme ya da panik doğurur. İkisi farklı durumlardır ve farklı ele alınır: misofoni için ses programı önerilmez, psikolojik yaklaşımlar ve uzman değerlendirmesi önerilir. Rahatsızlığınız belirli seslere ve belirli kişilere bağlıysa bu program yerine bir uzmanla görüşün.`,
          en: `In hyperacusis the problem is the **loudness** of sound; many kinds of sound are unpleasant. In misophonia the problem is **specific** sounds: chewing, breathing, keyboard clicks; even at low level they trigger anger, disgust or panic. The two are different conditions and are handled differently: the sound programme is not recommended for misophonia; psychological approaches and specialist assessment are. If your distress is tied to specific sounds and specific people, talk to a specialist instead of following this programme.`,
        },
      },
      {
        heading: { tr: 'Kademeli ses programı', en: 'The graded sound programme' },
        kind: 'exercise',
        body: {
          tr: `- **Ses:** Pembe gürültü (Sesler bölümünde "hiperakuzi" ön ayarı). Doğa sesleri de uygundur; aniden değişen sesler değil.
- **Başlangıç düzeyi:** Açıkça rahat, hatta "fazla kısık" gelen düzey. Hiçbir zaman rahatsız edici olmamalıdır.
- **Artış:** Her hafta düzeyi bir adım (yaklaşık 2–3 desibel) artırın; rahatsızlık olursa bir önceki düzeyde bir hafta daha kalın.
- **Süre:** Günde iki kez 30–60 dakika ile başlayın; birkaç hafta içinde mümkünse günün büyük kısmına yayın.
- **Kulaklık:** Gürültü için kulaklık kullanılabilir, ancak ses düzeyi sınırı açık ve düzey düşük olmalı. Hoparlör tercih edilir.
- **Süre:** 8–12 hafta. Altı haftada tolere edilen düzeyde hiçbir ilerleme yoksa kulak tıkacı kullanımını ve kaçınmayı gözden geçirin ve bir odyoloğa başvurun.`,
          en: `- **Sound:** Pink noise (the "hyperacusis" preset in the Sounds section). Nature sounds are fine too; not sounds that change suddenly.
- **Starting level:** A level that is clearly comfortable, even "too quiet". It must never be unpleasant.
- **Increase:** Raise the level one step (about 2–3 decibels) each week; if it becomes unpleasant, stay a further week at the previous level.
- **Dose:** Start with 30–60 minutes twice a day; within a few weeks spread it over most of the day if you can.
- **Earphones:** Earphones can be used for the noise, but with the volume limit on and the level low. A speaker is preferred.
- **Duration:** 8–12 weeks. If there is no progress in the tolerated level after six weeks, review earplug use and avoidance and see an audiologist.`,
        },
      },
    ],
    practice: {
      kind: 'checklist',
      minutes: 4,
      items: [
        { tr: 'Rahatsız eden seslerin belirli sesler değil, yüksek sesler olduğunu doğruladım (misofoni değil).', en: 'I confirmed that the sounds that bother me are loud sounds rather than specific sounds (not misophonia).' },
        { tr: 'Sesler bölümünde hiperakuzi ön ayarını açıp rahat bir başlangıç düzeyi seçtim.', en: 'I opened the hyperacusis preset in the Sounds section and chose a comfortable starting level.' },
        { tr: 'Bugün iki kez 30 dakika pembe gürültü dinledim.', en: 'Today I listened to pink noise for 30 minutes twice.' },
        { tr: 'Günlük kayıtta en rahatsız eden sesi ve rahatsızlık düzeyini not ettim.', en: 'In the daily record I noted the most unpleasant sound and the level of discomfort.' },
      ],
    },
    keyTakeaway: {
      tr: 'Hiperakuzi, sessizlik ve kaçınmayla yükselen bir kazanç ayarıdır; kademeli düşük düzeyli ses ve BDT birlikte kazancı düşürür ve toleransı artırır.',
      en: 'Hyperacusis is a gain setting that rises with silence and avoidance; graded low-level sound and CBT together turn the gain down and raise tolerance.',
    },
    citations: ['juris2014', 'formby2015', 'khalfa2002'],
  },
  {
    id: 'hyper.hierarchy',
    title: { tr: 'Ses hiyerarşisi: kademeli yaklaşma', en: 'The sound hierarchy: graded approach' },
    intro: {
      tr: 'Pembe gürültü işitme sisteminin kazancını aşağı çeker; gerçek seslere kademeli yaklaşma ise ses korkusunu azaltır. Bu modülde kaçındığınız durumları hafiften zora sıralayıp her hafta bir basamak yukarı çıkacağınız kişisel bir hiyerarşi oluşturacaksınız.',
      en: 'Pink noise turns down the gain of the hearing system; graded approach to real sounds reduces fear of sound. In this module you will rank the situations you avoid from mild to hard and build a personal hierarchy in which you climb one rung each week.',
    },
    sections: [
      {
        heading: { tr: 'Neden hiyerarşi', en: 'Why a hierarchy' },
        body: {
          tr: `Ses korkusu, diğer korkular gibi işler: kaçınıldıkça büyür, kontrollü biçimde karşılaşıldıkça küçülür. Ancak "karşılaşma" rastgele ya da aniden olmamalıdır; bir düğünde hoparlörün yanında oturmak maruz kalma değil, kötü bir deneyimdir. Kademeli maruz kalma, zorluk basamaklarını önceden belirler ve her basamakta kaygı düşene kadar kalır. Jüris ve arkadaşlarının BDT protokolünde bu, tedavinin merkezidir.

Hiyerarşi kişiseldir: biri için lokanta 3, konser 9 iken; bir başkası için çocuk parkı 7, otobüs 4 olabilir. Önemli olan sıralamanın sizin kaygı puanlarınıza dayanmasıdır.`,
          en: `Fear of sound works like other fears: it grows with avoidance and shrinks with controlled encounters. But the "encounter" should not be random or sudden; sitting next to the speaker at a wedding is not exposure but a bad experience. Graded exposure sets the rungs of difficulty in advance and stays on each rung until anxiety drops. In the CBT protocol of Jüris and colleagues this is the centre of treatment.

The hierarchy is personal: for one person a restaurant is a 3 and a concert a 9; for another a playground is a 7 and the bus a 4. What matters is that the ranking rests on your own anxiety scores.`,
        },
      },
      {
        heading: { tr: 'Hiyerarşiyi kurmak', en: 'Building the hierarchy' },
        kind: 'exercise',
        body: {
          tr: `1. Son aylarda sesi nedeniyle kaçındığınız ya da kulak tıkacıyla girdiğiniz 8–10 durum yazın: mutfakta bulaşık, çarşı, kafe, otobüs, sinema, çocuklarla oyun, toplantı, spor salonu, düğün.
2. Her birine kaygı puanı verin (0–100).
3. Puanlara göre sıralayın; en az beş basamak seçin: yaklaşık 20, 40, 60, 80 ve en üst.
4. Her basamak için "nasıl" yazın: süre (10 dakikadan başlayın), konum (hoparlörden uzak), kiminle (ilk seferde bir yakınınızla).
5. Kuralı belirleyin: Basamakta kaygı 100 üzerinden en az yarıya düşene kadar kalın; aynı basamağı iki üç kez tekrarlayın; ardından bir üst basamağa geçin.

**Kulak tıkacı olmadan.** Hiyerarşideki durumların hiçbiri gerçekten zararlı düzeyde (85 desibel üstü, saatlerce) değildir; tıkaçla girmek maruz kalmayı geçersiz kılar. Gerçekten yüksek ortamlar (konser, inşaat) ayrı bir kategoridir ve orada koruma işitme sağlığıdır.`,
          en: `1. Write down 8–10 situations you have avoided because of sound in recent months, or entered with earplugs: washing up, the market, a café, the bus, the cinema, playing with children, a meeting, the gym, a wedding.
2. Give each an anxiety score (0–100).
3. Rank them; choose at least five rungs: around 20, 40, 60, 80 and the top.
4. For each rung write "how": duration (start with 10 minutes), position (away from the speaker), with whom (with someone close the first time).
5. Set the rule: stay on a rung until anxiety has at least halved out of 100; repeat the same rung two or three times; then move up one rung.

**Without earplugs.** None of the situations in the hierarchy is at a genuinely harmful level (over 85 decibels for hours); entering with plugs cancels the exposure. Truly loud settings (a concert, a building site) are a separate category, and there protection is hearing health.`,
        },
      },
      {
        heading: { tr: 'Her basamakta', en: 'On each rung' },
        body: {
          tr: `- Girmeden önce: kısa gevşeme, kaygı puanı, "ses rahatsız edici olabilir ama zararlı değil" cümlesi.
- İçerideyken: bedeni tarayın; omuzlar, çene, eller. Sesi dışlamaya çalışmayın, onu da duyun. Dikkati ortamın geri kalanına genişletin: insanlar, renkler, konuşma.
- Çıkmayın: kaygı yükselince ilk dakikada çıkmak kaçınmayı pekiştirir. Planladığınız süre boyunca kalın; süre dolunca kaygı puanını yeniden verin.
- Sonra: deneyimi not edin. Beklenen ile olan arasındaki fark genellikle öğreticidir: "Lokanta 70 bekledim, 45 oldu, 20 dakika sonra 30'a düştü."

Tolerans arttıkça gürültü programındaki pembe gürültü düzeyi de artırılabilir; iki yol birbirini destekler. Altı hafta sonunda hiyerarşide ilerleme yoksa bir odyolog ya da psikologla görüşün.`,
          en: `- Before going in: a short relaxation, the anxiety score, the sentence "the sound may be unpleasant but it is not harmful".
- Inside: scan the body; shoulders, jaw, hands. Do not try to shut the sound out; hear it too. Widen attention to the rest of the setting: people, colours, conversation.
- Do not leave: leaving in the first minute when anxiety rises reinforces avoidance. Stay for the planned time; when it is up, rate anxiety again.
- Afterwards: note the experience. The gap between expectation and reality is usually instructive: "I expected the restaurant to be 70; it was 45 and fell to 30 after 20 minutes."

As tolerance grows, the pink-noise level in the sound programme can rise too; the two paths support each other. If there is no progress on the hierarchy after six weeks, talk to an audiologist or psychologist.`,
        },
      },
      {
        heading: { tr: 'Tinnitus ve hiperakuzi birlikte', en: 'Tinnitus and hyperacusis together' },
        body: {
          tr: `Hiperakuzisi olan kişilerde ses zenginleştirme kuralı değişir: tinnitus için önerilen "karışma noktasının altı" ilkesi yerine, hiperakuzi için "açıkça rahat düzey" ilkesi geçerlidir ve bu genellikle daha düşüktür. Ses yükseldiğinde tinnitusun arttığını hissederseniz düzeyi düşürün; hassasiyet azaldıkça tinnitus için uygun düzeye zamanla yaklaşırsınız.

BDT programındaki "sese bilinçli maruz kalma" modülü tinnitus sesine kulak vermeyi hedefler, dış seslere değil; hiperakuzide dış seslere yaklaşma bu hiyerarşi üzerinden yapılır. İkisini karıştırmayın: tinnitusa kulak verirken ortam sesi kapalı, hiyerarşi basamaklarında ise gerçek ortam sesi vardır.`,
          en: `For people with hyperacusis the sound enrichment rule changes: instead of the "below the mixing point" principle recommended for tinnitus, the "clearly comfortable level" principle for hyperacusis applies, and that is usually lower. If you feel the tinnitus increase when the sound is turned up, lower the level; as sensitivity falls you gradually approach the level suited to tinnitus.

The "deliberate exposure to the sound" module in the CBT programme is about listening to the tinnitus, not to outside sounds; in hyperacusis, approaching outside sounds is done through this hierarchy. Do not mix the two: while listening to the tinnitus the background sound is off; on the hierarchy rungs there is real ambient sound.`,
        },
      },
    ],
    practice: {
      kind: 'hierarchy',
      minutes: 10,
      items: [
        { tr: 'Evde bulaşık yıkamak, 15 dakika', en: 'Washing up at home, 15 minutes' },
        { tr: 'Sakin bir kafede 20 dakika oturmak', en: 'Sitting 20 minutes in a quiet café' },
        { tr: 'Gündüz otobüsle 20 dakikalık yolculuk', en: 'A 20-minute bus ride in the daytime' },
        { tr: 'Kalabalık bir lokantada 30 dakika', en: '30 minutes in a busy restaurant' },
        { tr: 'Sinema salonunda bir film', en: 'A film in a cinema' },
      ],
    },
    keyTakeaway: {
      tr: 'Ses korkusu kaçınmayla büyür; kaygı puanına göre sıralanmış beş basamaklı bir hiyerarşide, kulak tıkacı olmadan, her basamakta kaygı yarıya düşene kadar kalarak yukarı çıkılır.',
      en: 'Fear of sound grows with avoidance; on a five-rung hierarchy ranked by anxiety score, without earplugs, you climb by staying on each rung until anxiety has halved.',
    },
    citations: ['juris2014', 'formby2015'],
  },
  {
    id: 'hyper.earplugs',
    title: { tr: 'Kulak tıkaçları: ne zaman, ne zaman değil', en: 'Earplugs: when and when not' },
    intro: {
      tr: 'Kulak tıkacı, hiperakuzide en sık görülen ve en çok zarar veren güvenlik davranışıdır. Gürültülü ortamlarda işitmeyi korur; gündelik ortamlarda ise işitme sisteminin kazancını yükseltir ve hassasiyeti artırır. Bu kısa modül aradaki çizgiyi netleştirir ve bırakma planı sunar.',
      en: 'Earplugs are the most common and most damaging safety behaviour in hyperacusis. In loud settings they protect hearing; in everyday settings they raise the gain of the hearing system and increase sensitivity. This short module draws the line and offers a weaning plan.',
    },
    sections: [
      {
        heading: { tr: 'Koruma ile kaçınma arasındaki çizgi', en: 'The line between protection and avoidance' },
        body: {
          tr: `İşitme için tehlike, ses düzeyi ile süreye bağlıdır. Kabaca: 85 desibel ve üstü seslere günde sekiz saatten uzun maruz kalmak işitmeye zarar verebilir; düzey her 3 desibel arttığında güvenli süre yarıya iner. Konser, gece kulübü, matkap, motosiklet, havai fişek: bunlar koruma gerektirir. Lokanta, çarşı, ofis, otobüs, çocuk parkı, bulaşık: bunlar değil. Bu ortamların ses düzeyi genellikle 60–75 desibel arasındadır ve işitme için zararsızdır; rahatsız edici gelmesi hassasiyetin, tehlikenin değil, göstergesidir.

Gündelik ortamda tıkaç takmak üç şey yapar: işitme sisteminin kazancını yükseltir (sesler çıkınca daha da yüksek gelir), beyne "bu ortam tehlikeli" mesajı verir ve kademeli ses programının etkisini siler. Hiperakuzi protokollerinin ortak kuralı budur: gündelik ortamlarda tıkaç kullanımını bırakmak.`,
          en: `Danger to hearing depends on level and duration. Roughly: exposure to 85 decibels and above for more than eight hours a day can damage hearing; for every 3-decibel rise the safe time halves. Concerts, nightclubs, drills, motorcycles, fireworks: these call for protection. Restaurants, markets, offices, buses, playgrounds, washing up: these do not. Their levels are usually 60–75 decibels and harmless to hearing; if they feel unpleasant, that is a sign of sensitivity, not of danger.

Wearing plugs in everyday settings does three things: it raises the gain of the hearing system (sounds seem even louder when they come off), it tells the brain "this setting is dangerous" and it erases the effect of the graded sound programme. This is the shared rule of hyperacusis protocols: stop earplug use in ordinary environments.`,
        },
      },
      {
        heading: { tr: 'Bırakma planı', en: 'The weaning plan' },
        kind: 'exercise',
        body: {
          tr: `Tıkacı bir anda bırakmak zor gelebilir; kademeli plan:

1. **Hafta 1:** Tıkaç olmadan girebildiğiniz ortamların listesini yapın; evde ve sakin ortamlarda tıkaç yok. Tıkacı cebinizde taşıyabilirsiniz, ama kulağınızda değil.
2. **Hafta 2:** Orta ortamlarda (kafe, çarşı, otobüs) ilk 10 dakika tıkaçsız; rahatsızlık olursa ara verin, dışarı çıkın, tıkaç takmayın; sonra geri dönün.
3. **Hafta 3:** Orta ortamlarda tamamen tıkaçsız. Tıkacı artık cebinizde de taşımayın; "var ama kullanmıyorum" da güvenlik davranışıdır.
4. **Hafta 4 ve sonrası:** Tıkaç yalnızca gerçekten yüksek ortamlar için: konser, inşaat, motosiklet, havai fişek. Buralarda müzisyen tıkaçları (düz filtreli, 15–20 desibel) sesi bozmadan azaltır.

Tıkaç yerine: hoparlörden uzak oturmak, gürültülü ortamda kısa molalar, giriş öncesi gevşeme, dikkati ortamın geri kalanına genişletmek.`,
          en: `Dropping plugs at once can feel hard; a graded plan:

1. **Week 1:** List the settings you can enter without plugs; no plugs at home or in quiet settings. You may carry the plugs in your pocket, but not in your ears.
2. **Week 2:** In medium settings (café, market, bus) the first 10 minutes without plugs; if it gets unpleasant, take a break, step outside, do not insert the plugs; then return.
3. **Week 3:** Medium settings entirely without plugs. Stop carrying the plugs in your pocket too; "available but unused" is still a safety behaviour.
4. **Week 4 onwards:** Plugs only for genuinely loud settings: concerts, building sites, motorcycles, fireworks. There, musician's plugs (flat filter, 15–20 decibels) reduce sound without distorting it.

Instead of plugs: sitting away from the speaker, short breaks in noisy settings, relaxation before going in, widening attention to the rest of the setting.`,
        },
      },
      {
        heading: { tr: 'Geceleri', en: 'At night' },
        kind: 'warning',
        body: {
          tr: `Tıkaçla uyumak hem tinnitusu hem hiperakuziyi kötüleştirir: tam sessizlikte kazanç en yüksek düzeye çıkar ve sabah her ses daha sert gelir. Gece için tıkaç yerine düşük düzeyde ortam sesi kullanın; eşinizin horlaması gibi bir sorun varsa tıkaç yerine beyaz gürültü ya da ayrı oda seçeneğini değerlendirin. Kulaklıkla ses dinleyerek uyumayın; hoparlör tercih edin.`,
          en: `Sleeping with plugs worsens both tinnitus and hyperacusis: in complete silence the gain rises to its highest and every sound in the morning hits harder. Use low-level background sound for the night instead of plugs; if a partner's snoring is the issue, consider white noise or a separate room rather than plugs. Do not sleep with earphones in; prefer a speaker.`,
        },
      },
      {
        heading: { tr: 'Ses düzeylerini tanımak', en: 'Knowing sound levels' },
        body: {
          tr: `Hangi ortamın gerçekten yüksek olduğunu kestirmek için kaba bir ölçek:

- 30–40 desibel: sessiz oda, fısıltı.
- 50–60 desibel: normal konuşma, sakin ofis, yağmur.
- 65–75 desibel: lokanta, çarşı, trafikli cadde, elektrikli süpürge. İşitme için zararsız; hassas kulağa yüksek gelir.
- 85–95 desibel: yoğun trafik, motosiklet, çim biçme makinesi, bazı spor salonları. Uzun sürede koruma gerektirir.
- 100 desibel ve üstü: konser, gece kulübü, matkap, havai fişek. Her zaman koruma.

Telefonunuzdaki bir ses ölçer uygulaması kaba bir fikir verir; doğru ölçüm için kalibre edilmiş cihaz gerekir. Çoğu kişi için şaşırtıcı sonuç, kaçındıkları ortamların 70 desibelin altında kalmasıdır.`,
          en: `A rough scale for judging which settings are genuinely loud:

- 30–40 decibels: a quiet room, a whisper.
- 50–60 decibels: normal conversation, a calm office, rain.
- 65–75 decibels: a restaurant, a market, a busy street, a vacuum cleaner. Harmless to hearing; loud to a sensitive ear.
- 85–95 decibels: heavy traffic, a motorcycle, a lawnmower, some gyms. Protection needed for long exposure.
- 100 decibels and above: a concert, a nightclub, a drill, fireworks. Always protection.

A sound meter app on your phone gives a rough idea; precise measurement needs a calibrated device. For most people the surprising result is that the settings they avoid stay below 70 decibels.`,
        },
      },
    ],
    practice: {
      kind: 'checklist',
      minutes: 3,
      items: [
        { tr: 'Gündelik ortamları (ev, kafe, çarşı, otobüs, ofis) tıkaçsız girilecekler listesine aldım.', en: 'I listed everyday settings (home, café, market, bus, office) as settings to enter without plugs.' },
        { tr: 'Gerçekten yüksek ortamları (konser, inşaat, motosiklet) koruma gerektirenler listesine aldım.', en: 'I listed genuinely loud settings (concert, building site, motorcycle) as settings that need protection.' },
        { tr: 'Bu hafta tıkaçları kulağımda değil cebimde taşıdım.', en: 'This week I carried the plugs in my pocket, not in my ears.' },
        { tr: 'Gece tıkaç yerine düşük düzeyde ortam sesi kullandım.', en: 'At night I used low-level background sound instead of plugs.' },
      ],
    },
    keyTakeaway: {
      tr: 'Tıkaç yalnızca gerçekten yüksek (85 desibel üstü) ortamlar içindir; gündelik ortamlarda ve gece kullanmak kazancı yükseltir ve hassasiyeti sürdürür, bu yüzden dört haftalık planla bırakılır.',
      en: 'Plugs are only for genuinely loud (over 85 decibel) settings; using them in everyday settings and at night raises the gain and maintains sensitivity, so they are dropped over a four-week plan.',
    },
    citations: ['juris2014', 'formby2015', 'chandrasekhar2019'],
  },
];

// ---------------------------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------------------------
export const MODULE_LIST: Module[] = [...CBT, ...ACT, ...MIND, ...CBTI, ...HYPER];
export const MODULES: Record<string, Module> = Object.fromEntries(MODULE_LIST.map((m) => [m.id, m]));

export const getModule = (id: string): Module | undefined => MODULES[id];

/** Track membership, derived from the id prefix (cbt.hearingTactics is scheduled on the hearing track but belongs to the CBT content track). */
export const trackOf = (id: string): ModuleTrack => (id.split('.')[0] as ModuleTrack);

export const TRACK_ORDER: ModuleTrack[] = ['cbt', 'act', 'mind', 'cbti', 'hyper'];

/** Modules per track, in programme order. */
export const MODULES_BY_TRACK: Record<ModuleTrack, Module[]> = {
  cbt: CBT, act: ACT, mind: MIND, cbti: CBTI, hyper: HYPER,
};

/** Headline citation for each track's evidence chip. */
export const TRACK_CITATION: Record<ModuleTrack, string> = {
  cbt: 'fuller2020', act: 'hesser2012', mind: 'mckenna2017', cbti: 'marks2023', hyper: 'juris2014',
};
