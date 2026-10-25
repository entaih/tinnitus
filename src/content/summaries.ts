/**
 * Two-minute module summaries (PM sprint 2 §B3): three honest bullets per module, ≤ 140 characters each, in the
 * module's own evidence language (no "cures" / "treats" / "goes away"). Attached to every module in
 * src/content/modules.ts (`Module.summary`); the module screen shows them first, and "Bugün yalnız özet yeter"
 * completes the day's task from them. The source chip stays the module's own citations.
 */
export interface ModuleSummary { tr: string[]; en: string[] }

export const SUMMARIES: Record<string, ModuleSummary> = {
  // --- Core CBT -----------------------------------------------------------------------------------------------
  'cbt.welcome': {
    tr: [
      'Hedef sesi yok etmek değil; dikkati daha az çekmesi, uykuyu daha az bozması, sizi daha az yormasıdır.',
      'Sekiz hafta, her hafta bir ana fikir ve bir uygulama; etki okumada değil günlük tekrarda ortaya çıkar.',
      'Benzer internet programlarında katılımcıların yaklaşık yarısı anlamlı düzelme bildirdi; herkeste aynı değil.',
    ],
    en: [
      'The aim is not to remove the sound but to shrink its place: less attention, less sleep disruption, less fatigue.',
      'Eight weeks, each with one key idea and one practice; the effect comes from daily repetition, not reading.',
      'In similar internet programmes about half of participants reported meaningful improvement; not everyone does.',
    ],
  },
  'cbt.psychoeducation': {
    tr: [
      'Ses kulakta başlasa da beyinde "önemli" olarak işaretlendiği için fark edilir; tehlike etiketi dikkati sabitler.',
      'Alışma, beynin sesi önemsiz saymayı öğrenmesidir; ses aynı kalsa da tepki azalır.',
      'Dikkat–kaygı–uyarılma döngüsünü kendi yaşamınızda çizmek, programın hangi halkaya dokunduğunu gösterir.',
    ],
    en: [
      'The sound starts in the ear but is noticed because the brain tags it as important; the threat label fixes attention.',
      'Habituation is the brain learning to treat the sound as unimportant; the sound may stay, the reaction fades.',
      'Drawing your own attention–anxiety–arousal loop shows which link the programme works on.',
    ],
  },
  'cbt.relax1': {
    tr: [
      'Gerginlik sesi büyütür; kas gevşetme bedene gerginlik ile gevşeme arasındaki farkı öğretir.',
      'Kas gruplarını sırayla 5–7 saniye gerip bırakın; günde iki kez, iki hafta.',
      'Bu adım sonraki hızlı gevşeme becerilerinin temelidir; ilk günlerde sesin belirginleşmesi olağandır.',
    ],
    en: [
      'Tension amplifies the sound; muscle relaxation teaches the body the difference between tension and release.',
      'Tense each muscle group in turn for 5–7 seconds, then release; twice a day for two weeks.',
      'This step is the base of the later rapid-relaxation skills; the sound standing out at first is normal.',
    ],
  },
  'cbt.relax2': {
    tr: [
      'Germe adımı bırakılır; yalnızca bırakarak gevşemek beceriyi 15 dakikadan 5–7 dakikaya indirir.',
      'Kas gruplarını sırayla tarayıp her nefes verişte bırakın; günde iki kez, iki hafta.',
      'Hedef, zamanla tek bir nefesle gevşeyebilmektir; bu modül o yolun ikinci basamağıdır.',
    ],
    en: [
      'The tensing step is dropped; release-only relaxation shortens the skill from 15 to 5–7 minutes.',
      'Scan the muscle groups in turn and let go on each out-breath; twice a day for two weeks.',
      'The goal is to relax on a single breath in time; this module is the second rung of that ladder.',
    ],
  },
  'cbt.soundEnrichment': {
    tr: [
      'Sessizlik çınlamayı öne çıkarır; kısık ve hoş bir arka plan sesi sessizliği doldurur.',
      'Ses karışma noktasının altında kalmalı: amaç sesi örtmek değil, arka plana karıştırmaktır.',
      'Gün boyu ve gece düşük düzeyde; yüksek ses ya da tam maskeleme alışmayı geciktirir.',
    ],
    en: [
      'Silence makes the sound stand out; a low, pleasant background sound fills the silence.',
      'Keep it below the mixing point: the aim is to blend the sound into the background, not to cover it.',
      'Low level through the day and at night; loud sound or full masking delays habituation.',
    ],
  },
  'cbt.thoughtDiary': {
    tr: [
      'Sıkıntıyı ses değil, ses hakkındaki otomatik yorum belirler.',
      'Dört sütun: olay, düşünce, duygu, şiddet; bu hafta değiştirmeden yalnızca yakalayıp yazın.',
      'Günde bir iki kayıt yeter; yazmak düşünceyle aranıza sorgulama mesafesi koyar.',
    ],
    en: [
      'Distress is set not by the sound but by the automatic interpretation of it.',
      'Four columns: situation, thought, feeling, intensity; this week only catch and write, do not change.',
      'One or two entries a day are enough; writing puts a questioning distance between you and the thought.',
    ],
  },
  'cbt.sleepGuidelines': {
    tr: [
      'Çınlama ve uykusuzluk birbirini besler; döngü uyku tarafından kırılabilir.',
      'Üç kural: sabit kalkış saati, yatakta yalnızca uyumak, uyuyamayınca kalkmak.',
      'Gece düşük düzeyde arka plan sesi sessizliği doldurur; saat kontrolü ve çaba uyanıklığı artırır.',
    ],
    en: [
      'Tinnitus and insomnia feed each other; the loop can be broken from the sleep side.',
      'Three rules: a fixed rise time, the bed only for sleep, getting up when sleep does not come.',
      'Low-level sound at night fills the silence; clock-watching and effort increase wakefulness.',
    ],
  },
  'cbt.relax3': {
    tr: [
      'Her nefes verişe "gevşe" sözcüğünü bağlamak, sözcüğü gevşemenin işareti hâline getirir.',
      'Günde iki kez 2–3 dakika; önce sakin anlarda, sonra sesin belirgin olduğu anlarda.',
      'Birkaç hafta tekrarla tek bir nefes gevşemeyi başlatır; ilk günlerde etki küçük olabilir.',
    ],
    en: [
      'Pairing the word "relax" with each out-breath turns the word into a cue for relaxation.',
      'Twice a day for 2–3 minutes; first in calm moments, then when the sound is prominent.',
      'With a few weeks of repetition one breath starts relaxation; the effect may be small at first.',
    ],
  },
  'cbt.negativeThoughts': {
    tr: [
      'Çınlamayla ilgili düşünceler birkaç tipik kalıpta bozulur: felaketleştirme, ya hep ya hiç, aşırı genelleme.',
      'Kalıbı adlandırmak düşünceyi yok etmez; onunla aranıza sorgulamak için gereken mesafeyi koyar.',
      'Günlükteki kayıtlarınızın yanına kalıp adını yazın; en sık tekrarlayan kalıp gelecek haftanın hedefidir.',
    ],
    en: [
      'Thoughts about tinnitus bend into a few typical patterns: catastrophising, all-or-nothing, overgeneralising.',
      'Naming the pattern does not remove the thought; it creates the distance you need to question it.',
      'Write the pattern name next to your diary entries; the most frequent one is next week\'s target.',
    ],
  },
  'cbt.positiveImagery': {
    tr: [
      'Zihin görüntülerle bedeni etkiler; bir imge nabzı ve kas gerginliğini değiştirebilir.',
      'Güvenli yer imgesi: beş duyuyla ayrıntılandırılmış, gevşemeden sonra girilen bir sahne.',
      'Sesi güvenli yerin dokusuna yerleştiren imge, onu düşman kategorisinden çıkarır; sesi kaybetmez.',
    ],
    en: [
      'The mind affects the body through images; an image can change pulse and muscle tension.',
      'Safe place imagery: a scene detailed with all five senses, entered after relaxation.',
      'An image that places the sound in the safe place\'s texture takes it out of the enemy category; it does not remove it.',
    ],
  },
  'cbt.relax4': {
    tr: [
      'Bir iş için gereken kaslar çalışırken gerisini bırakmak: seçici gevşeme.',
      'Üç kademe: oturarak, ayakta, hareket hâlinde; gün içinde birkaç kontrol noktası.',
      'Gevşeme bu adımda sandalyeden kalkıp gündelik hayata karışır.',
    ],
    en: [
      'Let go of every muscle a task does not need while the needed ones work: differential relaxation.',
      'Three stages: sitting, standing, moving; several check-points during the day.',
      'At this step relaxation leaves the chair and joins daily life.',
    ],
  },
  'cbt.restructuring': {
    tr: [
      'Yeniden yapılandırma olumlu değil, kanıta dayalı düşünmektir.',
      'Yedi adım: olay, düşünce, duygu, lehte kanıt, aleyhte kanıt, dengeli cümle, yeni duygu şiddeti.',
      'Dengeli cümle kurulduğunda duygunun şiddeti genellikle düşer; bu hafta günde bir kayıt.',
    ],
    en: [
      'Restructuring is not positive thinking but evidence-based thinking.',
      'Seven steps: situation, thought, feeling, evidence for, evidence against, balanced sentence, new intensity.',
      'When the balanced sentence is built the feeling usually eases; this week one record a day.',
    ],
  },
  'cbt.relax5': {
    tr: [
      'Günde 15–20 kez, 20–30 saniyelik hızlı gevşeme: nefes ver, "gevşe", omuzları ve çeneyi bırak.',
      'Gündelik işaretleri kullanın: telefon çaldığında, kapıdan geçerken, saate baktığınızda.',
      'Sesi fark etmek de bir işaret olabilir; böylece ses gerginlik yerine gevşemeyi çağırır.',
    ],
    en: [
      '15–20 times a day, 20–30 seconds of rapid relaxation: breathe out, "relax", drop shoulders and jaw.',
      'Use everyday cues: the phone ringing, walking through a door, looking at the clock.',
      'Noticing the sound can be a cue too; then the sound calls relaxation instead of tension.',
    ],
  },
  'cbt.exposure': {
    tr: [
      'Kaçınma korkuyu besler; sesi örtmeye çalışmak tehdit etiketini korur.',
      'Sessiz bir yerde sese bilerek kulak verin: 5 dakikadan başlayıp günde 2–3 dakika artırarak 15 dakikaya.',
      'Kaygı çoğu kez kendi başına düşer; düşmediği gün de normaldir, ertesi gün daha kısa deneyin.',
    ],
    en: [
      'Avoidance feeds fear; trying to cover the sound keeps the threat label in place.',
      'Listen to the sound deliberately in a quiet place: start at 5 minutes, add 2–3 a day up to 15.',
      'Anxiety usually falls on its own; a day when it does not is normal too, try shorter the next day.',
    ],
  },
  'cbt.relax6': {
    tr: [
      'Uygulama eğitimi: hızlı gevşemeyi hafiften zora sıralanmış gerçek durumlarda kullanmak.',
      'Kendi listenizi yapın (kalabalık, toplantı, sessiz oda) ve en kolaydan başlayın.',
      'Gevşeme durumu değil, durum içindeki tepkinizi değiştirir; bakım için haftada birkaç tekrar yeter.',
    ],
    en: [
      'Application training: using rapid relaxation in real situations ordered from easy to hard.',
      'Make your own list (crowd, meeting, quiet room) and start with the easiest.',
      'Relaxation changes your response in the situation, not the situation; a few repeats a week maintain it.',
    ],
  },
  'cbt.attention': {
    tr: [
      'Sesi görmezden gelmeye çalışmak dikkati sese çeker.',
      'Doğru yol dikkati esnetmek: sesi dışlamadan birçok uyaran arasında gezdirmek.',
      'Üç kısa egzersiz: günde 10 dakika, iki hafta boyunca.',
    ],
    en: [
      'Trying to ignore the sound pulls attention towards it.',
      'The way through is to stretch attention: move it among many stimuli without excluding the sound.',
      'Three short exercises: 10 minutes a day for two weeks.',
    ],
  },
  'cbt.activity': {
    tr: [
      'Ruh hâli etkinliği izler: bırakılan etkinliklere dönmek sıkıntıyı azaltır.',
      'Güvenlik davranışları (sürekli kulak tıkacı, ses kontrolü, sessiz ortamdan kaçma) kısa vadede rahatlatır, uzun vadede sesin önemini büyütür.',
      'Haftalık plan: üç planlı etkinlik, bırakılacak bir güvenlik davranışı.',
    ],
    en: [
      'Mood follows activity: returning to dropped activities lowers distress.',
      'Safety behaviours (constant earplugs, sound checking, avoiding quiet rooms) soothe now and make the sound loom larger later.',
      'Weekly plan: three planned activities, one safety behaviour to let go.',
    ],
  },
  'cbt.relapse': {
    tr: [
      'Kötü günler dalgalanmadır, geriye dönüş değil; beceriler silinmez.',
      'Erken uyarı işaretleri: uyku bozulması, sesi kontrol etme, kaçınmanın geri gelmesi.',
      'Bakım planı: bir iki haftalık yoğun uygulama sizi kaldığınız yere getirir.',
    ],
    en: [
      'Bad days are fluctuation, not relapse; skills are not erased.',
      'Early warning signs: sleep disruption, checking the sound, avoidance creeping back.',
      'Maintenance plan: one or two weeks of intensive practice brings you back to where you were.',
    ],
  },
  'cbt.hearingTactics': {
    tr: [
      'İşitme güçlüğü dinleme çabasını artırır; yorgunluk sesi büyütür.',
      'Ortamı düzenleyin: yüz yüze, ışık karşıdakinin yüzünde, arka plan gürültüsü az.',
      'Karşınızdakine ne istediğinizi söyleyin; işitme cihazı değerlendirmesi öncelikli adımdır.',
    ],
    en: [
      'Hearing difficulty raises listening effort; fatigue amplifies the sound.',
      'Arrange the setting: face to face, light on the other person\'s face, little background noise.',
      'Tell the other person what you need; a hearing-aid assessment is a priority step.',
    ],
  },
  'cbt.concentration': {
    tr: [
      'Konsantrasyon güçlüğü ses, uykusuzluk ve kaygının karışımıdır; tek nedeni ses değildir.',
      'Kısa tek görev blokları (25 dakika) ve düşük arka plan sesi işi kolaylaştırır.',
      'Ses dikkati çektiğinde: etiketle, bir nefes ver, işe geri dön.',
    ],
    en: [
      'Trouble concentrating is a mix of sound, poor sleep and anxiety; the sound is not the only cause.',
      'Short single-task blocks (25 minutes) and low background sound make work easier.',
      'When the sound pulls attention: label it, one out-breath, return to the task.',
    ],
  },
  'cbt.toolbox': {
    tr: [
      'Her beceri belirli bir duruma uyar: gerginlikte gevşeme, felaket düşüncesinde yeniden yapılandırma.',
      'Araç kutusu zor günde düşünmeden açılıp uygulanacak kişisel bir rehberdir.',
      'Bakım döneminde haftada bir gözden geçirin; en çok işe yarayan üç aracı en üste yazın.',
    ],
    en: [
      'Each skill fits a situation: relaxation for tension, restructuring for a catastrophic thought.',
      'The toolbox is a personal guide to open and use on a hard day without thinking.',
      'Review it weekly in the maintenance phase; put the three most useful tools at the top.',
    ],
  },
  // --- ACT -----------------------------------------------------------------------------------------------------
  'act.acceptance': {
    tr: [
      'Sesle mücadele ikinci bir ok gibi acıyı artırır.',
      'Kabul sesi onaylamak değil; değiştiremediğinizle savaşmayı bırakıp enerjiyi değiştirebildiğinize yöneltmektir.',
      'İstekli olma egzersizi: sese yer açarken nefesle kalın; sesin düzeyi değişmese de direnç azalır.',
    ],
    en: [
      'Struggling with the sound adds pain like a second arrow.',
      'Acceptance is not approving the sound; it is ending the fight with what you cannot change and investing in what you can.',
      'Willingness exercise: make room for the sound and stay with the breath; resistance eases even if the level does not.',
    ],
  },
  'act.defusion': {
    tr: [
      'Düşünceyle kaynaşmak onu gerçek yapar; "bu ses hiç geçmeyecek" bir olgu değil, bir düşüncedir.',
      '"Şu düşünceye sahibim ki…" demek ya da düşünceyi akıntıdaki bir yaprağa koymak gücünü azaltır.',
      'Ayrışma düşünceyi değiştirmez, onunla ilişkiyi değiştirir; ilk günlerde yapay gelebilir.',
    ],
    en: [
      'Fusing with a thought makes it feel true; "this sound will never go" is a thought, not a fact.',
      'Saying "I am having the thought that…" or placing the thought on a leaf in a stream reduces its grip.',
      'Defusion does not change the thought, it changes your relationship with it; it may feel artificial at first.',
    ],
  },
  'act.values': {
    tr: [
      '"Sesin yok olması" kontrolünüzde olmayan bir hedeftir; değerler ise ses varken de yürüyebileceğiniz yönlerdir.',
      'Yaşam alanlarını (ilişkiler, iş, sağlık, boş zaman) puanlayın: önem ve bugünkü uyum.',
      'En büyük fark olan alan bu haftanın yönüdür; seksen yaş egzersizi neyin önemli olduğunu gösterir.',
    ],
    en: [
      '"The sound disappearing" is a goal outside your control; values are directions you can walk even with the sound.',
      'Rate life areas (relationships, work, health, leisure): importance and how closely you live them now.',
      'The area with the largest gap is this week\'s direction; the age-eighty exercise shows what matters.',
    ],
  },
  'act.committed': {
    tr: [
      'Kararlı eylem, sesin durumuna bağlı olmayan küçük, somut ve zamanlı adımlardır.',
      'Engeller için eğer–o zaman planı: "Ses yükselirse yine de 10 dakika yürürüm."',
      'Haftalık döngü: bir değer, bir adım, bir engel planı; küçük adımlar iradeyi karara dönüştürür.',
    ],
    en: [
      'Committed action is small, concrete, timed steps that do not depend on how the sound is.',
      'An if–then plan for obstacles: "If the sound gets louder, I still walk for 10 minutes."',
      'Weekly cycle: one value, one step, one obstacle plan; small steps turn willpower into decisions.',
    ],
  },
  // --- Mindfulness ---------------------------------------------------------------------------------------------
  'mind.bodyScan': {
    tr: [
      'Beden taramasının amacı gevşemek değil, ne varsa fark etmektir; gevşeme olursa yan üründür.',
      'Dikkati ayaklardan başa taşıyın; çınlama da fark edilen şeylerden biridir, itmeden ya da tutmadan.',
      'Dağılan zihni geri getirmek başarısızlık değil, egzersizin kendisidir; burada 15 dakikalık kısa sürüm.',
    ],
    en: [
      'The body scan is not for relaxing but for noticing whatever is there; relaxation is a by-product.',
      'Move attention from feet to head; tinnitus is one of the things noticed, neither pushed away nor held.',
      'Bringing a wandering mind back is not failure, it is the exercise; here the 15-minute short version.',
    ],
  },
  'mind.breathingSpace': {
    tr: [
      'Üç dakikalık nefes alanı: fark et, nefeste topla, bedene genişle — kum saati biçiminde.',
      'Zor anlarda otomatik tepkinin yerine bir duraklama koyar.',
      'Sesi fark etmek egzersizin çağrısı olabilir; günde üç kez planlı, gerektiğinde ek.',
    ],
    en: [
      'The three-minute breathing space: notice, gather on the breath, expand to the body — an hourglass shape.',
      'It places a pause where the automatic reaction would be in hard moments.',
      'Noticing the sound can be the call to practise; three planned times a day, plus whenever needed.',
    ],
  },
  'mind.allowing': {
    tr: [
      'Acıyı ses değil, sese karşı direnç belirler.',
      'Sese bilerek yaklaşıp "burada olabilir" diyerek yer açmak, düzeyi değişmese de sıkıntıyı azaltabilir.',
      'Zor geldiği anlarda nefes alanına dönün; izin vermek vazgeçmek değildir.',
    ],
    en: [
      'Suffering is set not by the sound but by resistance to it.',
      'Approaching the sound deliberately and making room with "it can be here" can ease distress even if the level stays.',
      'When it feels hard, return to the breathing space; allowing is not giving up.',
    ],
  },
  'mind.thoughtsNotFacts': {
    tr: [
      'Düşünceler zihinsel olaylardır; hava durumu gibi gelir ve değişir.',
      '"Bu ses hiç geçmeyecek" cümlesine bir bulut gibi bakmak, onu olgu olarak yaşamaktan korur.',
      'Düşünce geldiğinde sorun: Bu bir olgu mu, bir düşünce mi? Şu an gerçekten ne oluyor?',
    ],
    en: [
      'Thoughts are mental events; like weather they come and pass.',
      'Looking at "this sound will never go" as a cloud keeps you from living it as a fact.',
      'When a thought comes, ask: is this a fact or a thought? What is actually happening right now?',
    ],
  },
  // --- CBT-I ---------------------------------------------------------------------------------------------------
  'cbti.education': {
    tr: [
      'Uykuyu uyku baskısı, biyolojik saat ve uyarılma düzeyi belirler; çınlama uyarılmayı besler.',
      'Altı haftalık yol: uyku günlüğü, uyaran kontrolü, uyku penceresi, gece düşünceleri, iniş pisti.',
      'Uyku ses varken de yeniden kurulabilir; uykusuzluk terapisi çınlaması olan kişilerde de sınanmıştır.',
    ],
    en: [
      'Sleep is set by sleep pressure, the body clock and arousal; tinnitus feeds arousal.',
      'The six-week path: sleep diary, stimulus control, sleep window, night-time thoughts, wind-down.',
      'Sleep can be rebuilt with the sound present; CBT-I has been tested in people with tinnitus.',
    ],
  },
  'cbti.stimulusControl': {
    tr: [
      'Yatak uyanıklığı öğrenmiştir; beş kural yatağı yeniden uykuya bağlar.',
      'Yatakta yalnızca uyumak, 15–20 dakikada uyuyamayınca kalkmak, sabit kalkış saati, gündüz uyumamak.',
      'İlk hafta daha yorgun hissetmek olağandır; iki üç haftada etkisi görülür.',
    ],
    en: [
      'The bed has learned wakefulness; five rules reconnect the bed with sleep.',
      'Bed only for sleep, get up after 15–20 minutes awake, a fixed rise time, no daytime naps.',
      'Feeling more tired in the first week is normal; the effect shows in two to three weeks.',
    ],
  },
  'cbti.compression': {
    tr: [
      'Yatakta geçen süre = ortalama uyku + 30 dakika, en az 5,5 saat.',
      'Verimlilik yüzde 85\'e ulaştıkça pencere her hafta 15 dakika genişler.',
      'Epilepsi, bipolar bozukluk, parasomni, gebelik ya da güvenlik kritik işte yalnızca uzmanla uygulanır.',
    ],
    en: [
      'Time in bed = average sleep time + 30 minutes, never under 5.5 hours.',
      'As efficiency reaches 85% the window widens by 15 minutes each week.',
      'With epilepsy, bipolar disorder, parasomnia, pregnancy or a safety-critical job, only with a specialist.',
    ],
  },
  'cbti.cognitions': {
    tr: [
      'Gece zihni uyku ve çınlama hakkında felaketleştirir; gece tartışma zamanı değildir.',
      'Dengeli cümleleri gündüz düşünce kaydıyla hazırlayın, gece yalnızca hatırlayın.',
      'Uyku çabası paradoksu: uyumaya çalışmak uyanık tutar; çabayı bırakmak hedeftir.',
    ],
    en: [
      'The night mind catastrophises about sleep and tinnitus; night is not the time to argue.',
      'Prepare balanced sentences with a daytime thought record; at night only recall them.',
      'The sleep-effort paradox: trying to sleep keeps you awake; letting go of effort is the goal.',
    ],
  },
  'cbti.windDown': {
    tr: [
      'Endişelere gündüz belirli bir zaman verin (15 dakika, yatak odası dışında).',
      'İniş pisti: her akşam aynı sırayla tekrarlanan 60–90 dakikalık hazırlık.',
      'Gevşemeyi yatakta değil, koltukta yapın; gece kısık arka plan sesi.',
    ],
    en: [
      'Give worries a fixed daytime slot (15 minutes, outside the bedroom).',
      'The runway: a 60–90 minute wind-down repeated in the same order every evening.',
      'Relax in a chair, not in bed; low background sound at night.',
    ],
  },
  'cbti.relapse': {
    tr: [
      'Kalıcı kurallar: sabit kalkış, yatakta yalnızca uyku, uyuyamayınca kalkmak.',
      'Kötü bir geceyi telafi etmeye çalışmayın; aynı saatte kalkın.',
      'Uyku bozulursa iki haftalık mini program kazanımları geri getirir.',
    ],
    en: [
      'Permanent rules: fixed rise time, bed only for sleep, get up when sleep does not come.',
      'Do not try to make up for a bad night; rise at the same time.',
      'If sleep slips, a two-week mini programme brings the gains back.',
    ],
  },
  // --- Hyperacusis ---------------------------------------------------------------------------------------------
  'hyper.education': {
    tr: [
      'Ses hassasiyeti işitme sisteminin "kazanç ayarının" yükselmesidir; sessizlik ve kaçınma kazancı artırır.',
      'Kademeli, kısık ses ve BDT birlikte kazancı düşürebilir ve toleransı artırabilir.',
      'Misofoni farklıdır: belirli seslere öfke ya da tiksinti; kademeli ses yerine uzman değerlendirmesi gerekir.',
    ],
    en: [
      'Hyperacusis is a raised "gain setting" of the hearing system; silence and avoidance raise it further.',
      'Gradual low-level sound together with CBT can lower the gain and build tolerance.',
      'Misophonia is different: anger or disgust at specific sounds; it needs specialist assessment, not graded sound.',
    ],
  },
  'hyper.hierarchy': {
    tr: [
      'Ses korkusu kaçınmayla büyür; hiyerarşi kaçınılan durumları kaygı puanına göre sıralar.',
      'Beş basamak, en düşükten başlayarak; her basamakta kaygı yarıya düşene kadar kalın.',
      'Kulak tıkacı olmadan, planlı ve tekrarlı; bir basamak kolaylaşınca sonrakine geçin.',
    ],
    en: [
      'Fear of sound grows with avoidance; the hierarchy orders avoided situations by anxiety score.',
      'Five rungs, starting from the lowest; stay on each rung until anxiety halves.',
      'Without earplugs, planned and repeated; move up once a rung becomes easy.',
    ],
  },
  'hyper.earplugs': {
    tr: [
      'Tıkaç yalnızca gerçekten yüksek (85 desibel üstü) ortamlar içindir.',
      'Gündelik ortamlarda ve gece kullanmak kazancı yükseltip hassasiyeti sürdürebilir.',
      'Dört haftalık bırakma planı: önce ev, sonra kafe ve otobüs; gece de tıkaç yok.',
    ],
    en: [
      'Earplugs are only for genuinely loud settings (above 85 decibels).',
      'Using them in everyday settings and at night can raise the gain and keep sensitivity going.',
      'A four-week weaning plan: home first, then cafés and buses; no plugs at night either.',
    ],
  },
};
