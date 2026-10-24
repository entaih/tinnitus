/**
 * Somatosensory self-management exercise programmes (treatment.md §5; adapted from the Antwerp protocols:
 * Michiels 2016 cervical multimodal physiotherapy; van der Wal 2020 orofacial treatment) and the guided
 * somatic-modulation self-test (Michiels 2018 Delphi criteria; Michiels 2022 RASST).
 * These are labelled "self-management exercises, not a substitute for physiotherapy" and carry stop rules.
 */
import type { L } from './modules';

export type ExerciseId = 'somatic.cervical' | 'somatic.orofacial' | 'somatic.posture';

export interface ExerciseStep {
  id: string;
  name: L;
  instruction: L;
  /** Timed hold or continuous work (seconds). When reps is also set, seconds is the hold per rep. */
  seconds?: number;
  reps?: number;
  sets?: number;
  /** Repeat the step for left and right. */
  perSide?: boolean;
  /** 'timer' steps run on the clock; 'reps' steps are counted by the user; 'read' steps are education only. */
  mode: 'timer' | 'reps' | 'read';
  /** Weeks in which the step is included (undefined = always). */
  fromWeek?: number;
}

export interface ExerciseProgramme {
  id: ExerciseId;
  title: L;
  intro: L;
  minutes: number;
  weeks: number;
  frequency: L;
  steps: ExerciseStep[];
  stopRules: L[];
  /** The mandatory "does not replace physiotherapy" label. */
  disclaimer: L;
  progression: L;
  citations: string[];
}

const NOT_PHYSIO: L = {
  tr: 'Bu egzersizler kendi kendine uygulanan destekleyici hareketlerdir; fizyoterapi, diş hekimi ya da hekim değerlendirmesinin yerine geçmez. Ağrı artarsa durun.',
  en: 'These are self-management exercises; they do not replace physiotherapy, dental or medical assessment. Stop if pain increases.',
};

const COMMON_STOP: L[] = [
  { tr: 'Egzersiz sırasında keskin, yayılan ya da artan ağrı olursa durun.', en: 'Stop if sharp, radiating or increasing pain occurs during the exercise.' },
  { tr: 'Baş dönmesi, bulantı, görme değişikliği, kolda uyuşma veya güçsüzlük olursa durun ve hekime başvurun.', en: 'Stop and seek medical advice if dizziness, nausea, visual change, numbness or weakness in an arm occurs.' },
  { tr: 'Tinnitus egzersiz sırasında geçici olarak değişebilir; bu beklenir. Egzersizden sonra bir saatten uzun süren belirgin kötüleşme olursa yükü azaltın.', en: 'Tinnitus may change temporarily during the exercise; that is expected. If marked worsening lasts more than an hour afterwards, reduce the load.' },
  { tr: 'Altı haftanın sonunda tinnitus ya da boyun/çene yakınmalarında değişiklik yoksa kendi kendine egzersizi bırakıp bir fizyoterapist ya da diş hekimine başvurun.', en: 'If there is no change in tinnitus or neck/jaw complaints after six weeks, stop self-exercise and see a physiotherapist or dentist.' },
  { tr: 'Yakın zamanda boyun travması, nörolojik belirti ya da şiddetli baş ağrısı varsa egzersize başlamadan önce tıbbi değerlendirme gerekir.', en: 'Recent neck trauma, neurological signs or severe headache require medical review before starting.' },
];

export const EXERCISES: Record<ExerciseId, ExerciseProgramme> = {
  'somatic.cervical': {
    id: 'somatic.cervical',
    title: { tr: 'Boyun programı', en: 'Neck programme' },
    intro: {
      tr: 'Boyun kaynaklı (servikojenik) somatosensoriyel tinnitus için altı haftalık, günde 10–15 dakikalık program. Antwerp protokolünden uyarlanmıştır: duruş sıfırlama, derin boyun fleksörü eğitimi, hareket açıklığı, kürek kemiği stabilizasyonu, tetik nokta gevşetme ve germe. Randomize bir çalışmada altı haftalık çok bileşenli servikal fizyoterapi tinnitus şiddetini ve boyun yakınmalarını azalttı; katılımcıların yüzde 53\'ü belirgin düzelme bildirdi.',
      en: 'A six-week, 10–15 minutes a day programme for cervicogenic somatosensory tinnitus. Adapted from the Antwerp protocol: posture reset, deep neck flexor training, range of motion, scapular stabilisation, trigger-point release and stretching. In a randomised trial, six weeks of multimodal cervical physiotherapy reduced tinnitus severity and neck complaints; 53% of participants reported substantial improvement.',
    },
    minutes: 12,
    weeks: 6,
    frequency: { tr: 'Her gün bir kez; tetik nokta gevşetme günde en fazla iki kez.', en: 'Once a day; trigger-point release at most twice a day.' },
    steps: [
      {
        id: 'chinTuck', mode: 'reps', reps: 10, seconds: 5,
        name: { tr: 'Duruş sıfırlama: çene içeri', en: 'Posture reset: chin tuck' },
        instruction: {
          tr: 'Sırtınız ve başınızın arkası duvara değecek şekilde durun. Çeneyi hafifçe geriye, içeri çekin (başı yukarı değil, geriye kaydırın; ikinci bir çene oluşur). Boynun arkasında uzama hissedin. 5 saniye tutun, bırakın. 10 tekrar.',
          en: 'Stand with your back and the back of your head against a wall. Draw the chin gently back and in (slide the head back rather than tilting it up; a "double chin" forms). Feel the back of the neck lengthen. Hold 5 seconds, release. 10 repetitions.',
        },
      },
      {
        id: 'ccf', mode: 'reps', reps: 10, seconds: 10,
        name: { tr: 'Kraniyoservikal fleksiyon (derin boyun fleksörleri)', en: 'Craniocervical flexion (deep neck flexors)' },
        instruction: {
          tr: 'Sırt üstü uzanın, dizler bükülü, başın altında ince bir havlu. Başı kaldırmadan, yalnızca "evet" der gibi küçük bir baş sallama ile çeneyi hafifçe içeri çekin. Boynun önündeki yüzeysel kaslar (yutkunma kasları) sertleşmemeli; iki parmakla kontrol edin. 10 saniye tutun, 10 tekrar. 3. haftadan itibaren oturarak yapın.',
          en: 'Lie on your back, knees bent, a thin towel under the head. Without lifting the head, make a small nod as if saying "yes", drawing the chin gently in. The superficial muscles at the front of the neck (swallowing muscles) should not harden; check with two fingers. Hold 10 seconds, 10 repetitions. From week 3 do it sitting.',
        },
      },
      {
        id: 'rotation', mode: 'reps', reps: 10, perSide: true,
        name: { tr: 'Boyun hareketi: dönme', en: 'Neck mobility: rotation' },
        instruction: {
          tr: 'Oturun, omuzlar gevşek. Başı yavaşça sağa, rahat hissettiğiniz son noktaya kadar çevirin; zorlamayın. Bir saniye bekleyin, ortaya dönün. Her yöne 10 tekrar. Tinnitusta değişim olursa not edin, hareketi sürdürün.',
          en: 'Sit with shoulders relaxed. Turn the head slowly to the right as far as feels comfortable; do not force. Pause a second, return to centre. 10 repetitions each way. If the tinnitus changes, note it and continue the movement.',
        },
      },
      {
        id: 'sideFlexion', mode: 'reps', reps: 10, perSide: true,
        name: { tr: 'Boyun hareketi: yana eğme', en: 'Neck mobility: side flexion' },
        instruction: {
          tr: 'Kulağı omza doğru yavaşça yaklaştırın; omuz yukarı kalkmasın. Rahat son noktada bir saniye, ortaya dönün. Her yöne 10 tekrar.',
          en: 'Bring the ear slowly towards the shoulder without the shoulder rising. Pause a second at the comfortable end point, return to centre. 10 repetitions each way.',
        },
      },
      {
        id: 'scapular', mode: 'reps', reps: 10, sets: 2, seconds: 5,
        name: { tr: 'Kürek kemiği stabilizasyonu', en: 'Scapular stabilisation' },
        instruction: {
          tr: 'Oturun ya da ayakta durun. Kürek kemiklerini birbirine ve aşağı doğru çekin ("arka cebe koyar gibi"); omuzlar kulaklardan uzak. 5 saniye tutun. 2 set × 10 tekrar. 4. haftadan itibaren hafif bir direnç bandıyla.',
          en: 'Sitting or standing. Draw the shoulder blades together and down ("into the back pockets"); shoulders away from the ears. Hold 5 seconds. 2 sets × 10 repetitions. From week 4 with a light resistance band.',
        },
      },
      {
        id: 'triggerTrap', mode: 'timer', seconds: 75, perSide: true,
        name: { tr: 'Tetik nokta gevşetme: üst trapez', en: 'Trigger-point release: upper trapezius' },
        instruction: {
          tr: 'Omuz ile boyun arasındaki kasın en hassas noktasını parmaklarınızla ya da duvara dayadığınız bir topla bulun. Rahatsız ama ağrıtmayan bir basınçla 60–90 saniye sabit basın; nefes verirken kasın yumuşamasına izin verin. Günde en fazla iki kez.',
          en: 'Find the most tender spot in the muscle between shoulder and neck with your fingers or a ball against the wall. Hold steady pressure for 60–90 seconds, uncomfortable but not painful; let the muscle soften as you breathe out. At most twice a day.',
        },
      },
      {
        id: 'triggerLevator', mode: 'timer', seconds: 75, perSide: true,
        name: { tr: 'Tetik nokta gevşetme: levator skapula', en: 'Trigger-point release: levator scapulae' },
        instruction: {
          tr: 'Kürek kemiğinin üst iç köşesinde, boyna doğru uzanan kasın hassas noktasını bulun. 60–90 saniye sabit basınç. Baş dönmesi hissederseniz bırakın.',
          en: 'Find the tender spot at the upper inner corner of the shoulder blade, in the muscle running up to the neck. Steady pressure for 60–90 seconds. Release if you feel light-headed.',
        },
      },
      {
        id: 'triggerSCM', mode: 'timer', seconds: 60, perSide: true,
        name: { tr: 'Tetik nokta gevşetme: sternokleidomastoid', en: 'Trigger-point release: sternocleidomastoid' },
        instruction: {
          tr: 'Başı hafifçe aynı tarafa eğince boynun yan ön yüzünde belirginleşen kalın kası baş ve işaret parmağınızla nazikçe sıkın (bastırmayın; damarlar ve boyun önündeki yapılar üzerine basınç uygulamayın). 60 saniye hafif sıkma. Hassas bölge varsa yalnızca orada kalın.',
          en: 'Tilt the head slightly to the same side so the thick muscle on the side-front of the neck stands out; pinch it gently between thumb and index finger (do not press inward; apply no pressure on the vessels or structures at the front of the neck). Gentle pinch for 60 seconds. If there is a tender spot, stay only there.',
        },
      },
      {
        id: 'stretchTrap', mode: 'timer', seconds: 30, sets: 3, perSide: true,
        name: { tr: 'Germe: üst trapez', en: 'Stretch: upper trapezius' },
        instruction: {
          tr: 'Oturun, sağ elinizle sandalyenin altını tutun. Başı sola eğin ve hafifçe öne çevirin; sol el başın üstünde yalnızca ağırlık olarak dursun, çekmesin. Sağ omuz ile boyun arasında germe. 30 saniye, 3 tekrar, iki taraf.',
          en: 'Sit and hold the underside of the chair with your right hand. Tilt the head to the left and turn it slightly forward; the left hand rests on the head as weight only, no pulling. Feel the stretch between right shoulder and neck. 30 seconds, 3 repetitions, both sides.',
        },
      },
      {
        id: 'stretchLevator', mode: 'timer', seconds: 30, sets: 3, perSide: true,
        name: { tr: 'Germe: levator skapula', en: 'Stretch: levator scapulae' },
        instruction: {
          tr: 'Sağ elle sandalyeyi tutun. Burnunuzu sol koltuk altına doğru çevirip indirin; sol el başın üstünde ağırlık olarak. Sağ kürek kemiğinin üst köşesinde germe. 30 saniye, 3 tekrar, iki taraf.',
          en: 'Hold the chair with the right hand. Turn and lower your nose towards the left armpit; left hand on the head as weight. Feel the stretch at the upper corner of the right shoulder blade. 30 seconds, 3 repetitions, both sides.',
        },
      },
      {
        id: 'suboccipital', mode: 'timer', seconds: 30, sets: 3,
        name: { tr: 'Suboksipital gevşetme', en: 'Suboccipital release' },
        instruction: {
          tr: 'Sırt üstü uzanın. Elleri kenetleyip parmak uçlarını kafatasının alt kenarının hemen altına, boynun en üstüne yerleştirin. Başın ağırlığının parmaklara binmesine izin verin; çeneyi hafifçe içeri çekin. 30 saniye, 3 tekrar. Alternatif: iki tenis topunu bir çorapta kullanın.',
          en: 'Lie on your back. Interlace the hands and place the fingertips just below the base of the skull, at the very top of the neck. Let the weight of the head rest on the fingers; draw the chin slightly in. 30 seconds, 3 repetitions. Alternative: two tennis balls in a sock.',
        },
      },
      {
        id: 'ergonomics', mode: 'read',
        name: { tr: 'Ergonomi ve uyku duruşu', en: 'Ergonomics and sleep posture' },
        instruction: {
          tr: 'Ekranın üst kenarı göz hizasında; telefona bakarken telefonu kaldırın, başı indirmeyin. Her 30–45 dakikada bir ayağa kalkın ve çene içeri egzersizini 3 kez yapın. Uykuda baş omurgayla aynı hizada olacak yükseklikte yastık; yüzüstü uyumaktan kaçının. Stresle artan boyun gerginliği için programın gevşeme modülleri boyun egzersizlerinin tamamlayıcısıdır.',
          en: 'Top of the screen at eye level; when using the phone, raise the phone rather than lowering the head. Every 30–45 minutes stand up and do 3 chin tucks. For sleep, a pillow height that keeps the head in line with the spine; avoid sleeping on your front. For stress-related neck tension, the relaxation modules of the programme complement the neck exercises.',
        },
      },
    ],
    stopRules: COMMON_STOP,
    disclaimer: NOT_PHYSIO,
    progression: {
      tr: '1.–2. hafta: tüm adımlar, kraniyoservikal fleksiyon sırt üstü. 3.–6. hafta: kraniyoservikal fleksiyon oturarak, tutma 10 saniyeden 15 saniyeye. 4. haftadan itibaren kürek kemiği çalışması dirençli bantla. Altı haftada tinnitus/boyun değişimi yoksa fizyoterapiste sevk.',
      en: 'Weeks 1–2: all steps, craniocervical flexion lying down. Weeks 3–6: craniocervical flexion sitting, hold 10 to 15 seconds. From week 4, scapular work with a resistance band. No tinnitus/neck change after six weeks: refer to a physiotherapist.',
    },
    citations: ['michiels2016', 'michiels2018'],
  },
  'somatic.orofacial': {
    id: 'somatic.orofacial',
    title: { tr: 'Çene programı', en: 'Jaw programme' },
    intro: {
      tr: 'Çene eklemi (TME) ile ilişkili somatosensoriyel tinnitus için 6–9 haftalık, günde 10 dakikalık program: çene dinlenme pozisyonu, çiğneme kası masajı, Rocabado 6×6 kontrollü açma, yana ve öne hareket, bruksizm yönetimi. Randomize bir çalışmada dokuz haftalık orofasiyal tedavi, erken başlayan grupta tinnitus şiddetini daha fazla azalttı; yüzde 61\'i şiddette klinik olarak anlamlı düzelme bildirdi.',
      en: 'A 6–9 week, 10 minutes a day programme for somatosensory tinnitus related to the jaw joint (TMJ): jaw rest position, masticatory muscle massage, Rocabado 6×6 controlled opening, lateral and protrusive movement, bruxism management. In a randomised trial, nine weeks of orofacial treatment reduced tinnitus severity more in the early-start group; 61% reported clinically relevant improvement in severity.',
    },
    minutes: 10,
    weeks: 9,
    frequency: { tr: 'Masaj ve hareket günde bir kez; Rocabado açma günde altı kez; dinlenme pozisyonu saat başı kontrol.', en: 'Massage and mobility once a day; Rocabado opening six times a day; rest-position check hourly.' },
    steps: [
      {
        id: 'restPosition', mode: 'timer', seconds: 60,
        name: { tr: 'Çene dinlenme pozisyonu', en: 'Jaw rest position' },
        instruction: {
          tr: 'Dudaklar birbirine değiyor, dişler ayrık (birkaç milimetre), dil ucu üst ön dişlerin hemen arkasında damakta. Nefes burundan. Bu pozisyonu bir dakika sürdürün ve gün içinde saat başı kontrol edin: dişler temas ediyorsa çene gergindir. Telefonunuza sessiz bir saatlik hatırlatıcı kurun.',
          en: 'Lips together, teeth apart (a few millimetres), tip of the tongue on the palate just behind the upper front teeth. Breathe through the nose. Hold this position for one minute and check it hourly through the day: if the teeth are touching, the jaw is tense. Set a silent hourly reminder on your phone.',
        },
      },
      {
        id: 'masseter', mode: 'timer', seconds: 120, perSide: true,
        name: { tr: 'Masseter masajı', en: 'Masseter massage' },
        instruction: {
          tr: 'Dişleri hafifçe sıkınca yanakta sertleşen kası (masseter) bulun; sonra çeneyi gevşetin. İki üç parmakla, elmacık kemiğinden çene köşesine doğru yavaş dairesel hareketler ve hassas noktalarda 20–30 saniye sabit basınç. Her taraf 2 dakika. Ağrıtmayın.',
          en: 'Find the muscle that hardens in the cheek when you lightly clench (the masseter); then relax the jaw. With two or three fingers, slow circles from the cheekbone towards the angle of the jaw, with 20–30 seconds of steady pressure on tender spots. 2 minutes each side. Do not cause pain.',
        },
      },
      {
        id: 'temporalis', mode: 'timer', seconds: 90, perSide: true,
        name: { tr: 'Temporalis masajı', en: 'Temporalis massage' },
        instruction: {
          tr: 'Şakaklarda, dişleri sıkınca hareket eden geniş kası bulun. Parmak uçlarıyla kulağın üstünden alna doğru yavaş dairesel masaj; hassas noktalarda sabit basınç. Her taraf 1–2 dakika.',
          en: 'Find the broad muscle at the temples that moves when you clench. With fingertips, slow circles from above the ear towards the forehead; steady pressure on tender spots. 1–2 minutes each side.',
        },
      },
      {
        id: 'rocabado', mode: 'reps', reps: 6, seconds: 6,
        name: { tr: 'Rocabado 6×6: kontrollü ağız açma', en: 'Rocabado 6×6: controlled mouth opening' },
        instruction: {
          tr: 'Dil ucu damakta kalacak şekilde ağzı yavaşça açın; dil damaktan ayrılmadan açabildiğiniz kadar (genellikle iki parmak genişliği). Ağız açılırken çene düz insin, yana kaymasın; aynada kontrol edin. 6 saniyede açın, 6 saniyede kapatın. 6 tekrar, günde 6 kez.',
          en: 'Open the mouth slowly keeping the tip of the tongue on the palate; only as far as the tongue stays in contact (usually about two finger-widths). The jaw should drop straight, not deviate sideways; check in a mirror. Open over 6 seconds, close over 6 seconds. 6 repetitions, 6 times a day.',
        },
      },
      {
        id: 'lateral', mode: 'reps', reps: 10, perSide: true,
        name: { tr: 'Yana hareket', en: 'Lateral movement' },
        instruction: {
          tr: 'Dişler hafif aralık. Alt çeneyi yavaşça sağa kaydırın, bir saniye tutun, ortaya dönün. Rahat sınırda kalın; tıkırtı olabilir, ağrı olmamalı. Her yöne 10 tekrar.',
          en: 'Teeth slightly apart. Slide the lower jaw slowly to the right, hold a second, return to centre. Stay within comfort; a click may occur, pain should not. 10 repetitions each way.',
        },
      },
      {
        id: 'protrusive', mode: 'reps', reps: 10,
        name: { tr: 'Öne hareket', en: 'Protrusive movement' },
        instruction: {
          tr: 'Alt çeneyi yavaşça öne kaydırın (alt dişler üst dişlerin önüne), bir saniye tutun, geri alın. 10 tekrar.',
          en: 'Slide the lower jaw slowly forward (lower teeth in front of the upper), hold a second, return. 10 repetitions.',
        },
      },
      {
        id: 'relaxJaw', mode: 'timer', seconds: 60,
        name: { tr: 'Çene gevşetme', en: 'Jaw release' },
        instruction: {
          tr: 'Dinlenme pozisyonuna dönün. Her nefes verişte çenenin ağırlığıyla hafifçe aşağı sarktığını, dilin damakta yumuşadığını hissedin. Omuzlar ve alın da gevşek. Bir dakika.',
          en: 'Return to the rest position. On each out-breath feel the jaw hang slightly under its own weight and the tongue soften on the palate. Shoulders and forehead loose too. One minute.',
        },
      },
      {
        id: 'bruxism', mode: 'read',
        name: { tr: 'Bruksizm (diş sıkma) yönetimi', en: 'Bruxism (clenching) management' },
        instruction: {
          tr: 'Sabah çene yorgunluğu, diş aşınması ya da partnerinizin gece gıcırdatma fark etmesi bruksizme işaret eder. Gece plağı için diş hekimine başvurun; plak çalışmalarda orofasiyal tedavinin parçasıydı. Akşam kafein ve alkolü azaltın; yatmadan önce programın gevşeme egzersizini yapın. Gün içinde sakız çiğnemeyin, tırnak yemeyin, kalemi ısırmayın; esnerken çeneyi elinizle destekleyin. Alevlenme dönemlerinde birkaç gün yumuşak gıda.',
          en: 'Morning jaw fatigue, tooth wear or a partner noticing grinding at night point to bruxism. See a dentist about a night splint; the splint was part of orofacial treatment in the trials. Reduce caffeine and alcohol in the evening; do the programme\'s relaxation exercise before bed. During the day avoid chewing gum, nail biting and pen chewing; support the jaw with your hand when yawning. In a flare, a few days of soft food.',
        },
      },
    ],
    stopRules: [
      ...COMMON_STOP,
      { tr: 'Çene kilitlenirse (ağız açılmıyor ya da kapanmıyor) egzersizi durdurun ve diş hekimine başvurun.', en: 'If the jaw locks (mouth will not open or close), stop and see a dentist.' },
    ],
    disclaimer: NOT_PHYSIO,
    progression: {
      tr: '1.–3. hafta: dinlenme pozisyonu, masaj, Rocabado. 4.–9. hafta: yana ve öne hareketler eklenir; Rocabado açıklığı rahat sınırda kademeli artar. Bruksizm varsa diş hekimi görüşü 1. haftada alınır. Altı haftada değişiklik yoksa sevk.',
      en: 'Weeks 1–3: rest position, massage, Rocabado. Weeks 4–9: lateral and protrusive movements added; Rocabado opening increases gradually within comfort. With bruxism, dental advice in week 1. No change after six weeks: refer.',
    },
    citations: ['vanderwal2020', 'michiels2018'],
  },
  'somatic.posture': {
    id: 'somatic.posture',
    title: { tr: 'Duruş molası', en: 'Posture break' },
    intro: {
      tr: 'Beş dakikalık kısa duruş sıfırlama: gün içinde boyun ve çenede biriken gerginliği boşaltmak için. Haftalık programda haftada bir, ancak her gün masa başında birkaç kez tekrarlanabilir. Boyun kaynaklı tinnitusta kötü boyun duruşuyla artan ses, fizyoterapiye yanıtın öngörücülerinden biridir.',
      en: 'A five-minute posture reset for draining the tension that builds in the neck and jaw during the day. Once a week in the programme, but it can be repeated several times a day at the desk. In cervicogenic tinnitus, sound that increases with poor neck posture is one of the predictors of response to physiotherapy.',
    },
    minutes: 5,
    weeks: 12,
    frequency: { tr: 'Haftada en az bir kez; masa başında her 45 dakikada bir kısa sürüm.', en: 'At least once a week; a short version every 45 minutes at the desk.' },
    steps: [
      {
        id: 'scan', mode: 'timer', seconds: 30,
        name: { tr: 'Duruş taraması', en: 'Posture scan' },
        instruction: {
          tr: 'Olduğunuz yerde durun. Başınız omuzların önünde mi? Omuzlar kulaklara yakın mı? Dişler temas ediyor mu? Nefes göğüste mi, karında mı? Yalnızca fark edin.',
          en: 'Stay where you are. Is your head in front of the shoulders? Shoulders close to the ears? Teeth touching? Breath in the chest or the belly? Only notice.',
        },
      },
      {
        id: 'wallTuck', mode: 'reps', reps: 10, seconds: 5,
        name: { tr: 'Duvara karşı çene içeri', en: 'Chin tuck against the wall' },
        instruction: {
          tr: 'Sırt ve başın arkası duvarda. Çeneyi geriye kaydırın, boynun arkası uzasın. 5 saniye, 10 tekrar. Duvar yoksa oturarak, başın arkasında hafif el direnciyle.',
          en: 'Back and the back of the head against the wall. Slide the chin back, let the back of the neck lengthen. 5 seconds, 10 repetitions. Without a wall, do it seated with light hand resistance behind the head.',
        },
      },
      {
        id: 'shoulderRolls', mode: 'reps', reps: 10,
        name: { tr: 'Omuz çevirme', en: 'Shoulder rolls' },
        instruction: {
          tr: 'Omuzları yukarı, geriye, aşağı doğru yavaşça çevirin; her turda kürek kemiklerini "arka cebe" indirin. 10 tur.',
          en: 'Roll the shoulders slowly up, back and down; on each turn drop the shoulder blades "into the back pockets". 10 rolls.',
        },
      },
      {
        id: 'chestOpen', mode: 'timer', seconds: 30, sets: 2,
        name: { tr: 'Göğüs açma', en: 'Chest opener' },
        instruction: {
          tr: 'Elleri arkada kenetleyin ya da kapı pervazına dayayın; göğsü öne, omuzları geriye açın. Çene içeride kalsın. 30 saniye, 2 tekrar.',
          en: 'Clasp the hands behind you or rest them on a door frame; open the chest forward and the shoulders back. Keep the chin in. 30 seconds, 2 repetitions.',
        },
      },
      {
        id: 'jawCheck', mode: 'timer', seconds: 45,
        name: { tr: 'Çene ve dil kontrolü', en: 'Jaw and tongue check' },
        instruction: {
          tr: 'Dudaklar kapalı, dişler ayrık, dil damakta. Üç yavaş nefes; her verişte çene ve alın yumuşasın.',
          en: 'Lips together, teeth apart, tongue on the palate. Three slow breaths; let jaw and forehead soften on each out-breath.',
        },
      },
      {
        id: 'ergoSetup', mode: 'read',
        name: { tr: 'Çalışma alanı', en: 'Workstation' },
        instruction: {
          tr: 'Ekran üst kenarı göz hizasında, kol boyu uzaklıkta. Dizüstü bilgisayar kullanıyorsanız yükseltici ve ayrı klavye. Telefon göz hizasına kaldırılır. Sandalye sırtı bele destek verir; ayaklar yerde. 45 dakikada bir kalkma hatırlatıcısı.',
          en: 'Top of the screen at eye level, an arm\'s length away. With a laptop, a stand and a separate keyboard. The phone is raised to eye level. The chair back supports the lower back; feet on the floor. A stand-up reminder every 45 minutes.',
        },
      },
    ],
    stopRules: COMMON_STOP.slice(0, 3),
    disclaimer: NOT_PHYSIO,
    progression: { tr: 'Bu kısa rutinin ilerlemesi yoktur; sıklığı artırın.', en: 'This short routine has no progression; increase the frequency.' },
    citations: ['michiels2016'],
  },
};

export const getExercise = (id: string): ExerciseProgramme | undefined => (EXERCISES as Record<string, ExerciseProgramme>)[id];

/** Minutes a step takes (for progress and session logging). */
export function stepSeconds(s: ExerciseStep): number {
  const sides = s.perSide ? 2 : 1;
  const sets = s.sets ?? 1;
  if (s.mode === 'read') return 30;
  if (s.mode === 'timer') return (s.seconds ?? 60) * sets * sides;
  // reps: hold seconds + ~3 s transition each
  return ((s.seconds ?? 2) + 3) * (s.reps ?? 10) * sets * sides;
}

// ---------------------------------------------------------------------------------------------
// Somatic-modulation self-test (Michiels 2018 Delphi; manoeuvres from the Antwerp screening protocol)
// ---------------------------------------------------------------------------------------------
export type ModulationRating = 'louder' | 'same' | 'quieter' | 'pitch';

export interface Manoeuvre { id: string; name: L; instruction: L; seconds: number }

export const SELF_TEST: {
  title: L; intro: L; manoeuvres: Manoeuvre[]; ratings: Record<ModulationRating, L>;
  interpretation: { positive: L; negative: L; note: L }; citations: string[];
} = {
  title: { tr: 'Somatik modülasyon testi', en: 'Somatic modulation self-test' },
  intro: {
    tr: 'Bu kısa test, tinnitusun çene ve boyun hareketleriyle değişip değişmediğini sorar. Her hareketi yaklaşık 10 saniye sürdürüp tinnitusta ne olduğunu işaretleyin. Sessiz bir ortamda, oturarak yapın. Hareketler zorlanmadan, ağrı oluşturmadan yapılmalıdır; herhangi bir hareket ağrıya ya da baş dönmesine yol açarsa atlayın.',
    en: 'This short test asks whether your tinnitus changes with jaw and neck movements. Hold each manoeuvre for about 10 seconds and mark what happens to the tinnitus. Do it seated in a quiet setting. The manoeuvres should be done without strain or pain; skip any that cause pain or dizziness.',
  },
  manoeuvres: [
    { id: 'clench', seconds: 10, name: { tr: 'Dişleri sıkma', en: 'Jaw clench' }, instruction: { tr: 'Dişlerinizi orta kuvvetle sıkın ve 10 saniye tutun. Tinnitus değişiyor mu?', en: 'Clench your teeth with moderate force and hold for 10 seconds. Does the tinnitus change?' } },
    { id: 'protrusion', seconds: 10, name: { tr: 'Çeneyi öne itme', en: 'Jaw protrusion' }, instruction: { tr: 'Alt çeneyi öne doğru itin ve tutun.', en: 'Push the lower jaw forward and hold.' } },
    { id: 'lateralL', seconds: 10, name: { tr: 'Çeneyi sola kaydırma', en: 'Jaw shift to the left' }, instruction: { tr: 'Alt çeneyi sola kaydırın ve tutun.', en: 'Shift the lower jaw to the left and hold.' } },
    { id: 'lateralR', seconds: 10, name: { tr: 'Çeneyi sağa kaydırma', en: 'Jaw shift to the right' }, instruction: { tr: 'Alt çeneyi sağa kaydırın ve tutun.', en: 'Shift the lower jaw to the right and hold.' } },
    { id: 'rotResL', seconds: 10, name: { tr: 'Dirence karşı başı sola çevirme', en: 'Head rotation left against resistance' }, instruction: { tr: 'Sol elinizi sol şakağınıza koyun. Başı sola çevirmeye çalışırken elinizle engelleyin; baş hareket etmesin, yalnızca kaslar çalışsın. 10 saniye.', en: 'Place your left hand on your left temple. Try to turn the head left while your hand blocks it; the head does not move, only the muscles work. 10 seconds.' } },
    { id: 'rotResR', seconds: 10, name: { tr: 'Dirence karşı başı sağa çevirme', en: 'Head rotation right against resistance' }, instruction: { tr: 'Aynısını sağ elle, sağa doğru.', en: 'The same with the right hand, to the right.' } },
    { id: 'flexRes', seconds: 10, name: { tr: 'Dirence karşı başı öne eğme', en: 'Head flexion against resistance' }, instruction: { tr: 'Elinizi alnınıza koyun; başı öne eğmeye çalışırken elinizle engelleyin. 10 saniye.', en: 'Place a hand on your forehead; try to bend the head forward while the hand blocks it. 10 seconds.' } },
    { id: 'temples', seconds: 10, name: { tr: 'Şakaklara basınç', en: 'Pressure on the temples' }, instruction: { tr: 'İki elin parmaklarıyla şakaklara orta kuvvette basın ve tutun.', en: 'Press moderately on both temples with your fingers and hold.' } },
    { id: 'mastoid', seconds: 10, name: { tr: 'Kulak arkasına (mastoid) basınç', en: 'Pressure on the mastoid' }, instruction: { tr: 'Kulak memesinin arkasındaki kemik çıkıntıya her iki tarafta parmakla basın ve tutun.', en: 'Press with a finger on the bony bump behind each earlobe and hold.' } },
  ],
  ratings: {
    louder: { tr: 'Ses arttı', en: 'Louder' },
    same: { tr: 'Değişmedi', en: 'No change' },
    quieter: { tr: 'Ses azaldı', en: 'Quieter' },
    pitch: { tr: 'Perde/nitelik değişti', en: 'Pitch/quality changed' },
  },
  interpretation: {
    positive: {
      tr: 'En az bir hareket tinnitusun şiddetini ya da perdesini değiştirdi. Boyun veya çene ağrısı, gerginliği ya da bu bölgelerde geçirilmiş travma da varsa somatosensoriyel bileşen olasıdır. Programdaki boyun ve çene egzersizleri bu durum için tasarlanmıştır; altı haftada değişim olmazsa fizyoterapist ya da diş hekimi değerlendirmesi önerilir.',
      en: 'At least one manoeuvre changed the loudness or pitch of the tinnitus. If you also have neck or jaw pain, tension or past trauma in these areas, a somatosensory component is likely. The neck and jaw exercises in the programme are designed for this; if there is no change after six weeks, assessment by a physiotherapist or dentist is advised.',
    },
    negative: {
      tr: 'Hiçbir hareket tinnitusu değiştirmedi. Bu, somatosensoriyel bileşenin olası olmadığını gösterir; boyun ve çene egzersizleri genel gerginlik için yine de yararlı olabilir, ancak tinnitus için öncelikli değildir.',
      en: 'No manoeuvre changed the tinnitus. This makes a somatosensory component unlikely; the neck and jaw exercises may still help general tension but are not a priority for tinnitus.',
    },
    note: {
      tr: 'Sağlıklı kişilerin de bir bölümünde bu hareketler tinnitusu geçici olarak değiştirebilir; test bir tanı aracı değil, egzersiz programına yönlendirme aracıdır. Uzlaşı ölçütleri: Michiels ve ark. 2018.',
      en: 'In some people without a somatic cause these manoeuvres can also change tinnitus transiently; the test is not a diagnostic tool but a guide towards the exercise programme. Consensus criteria: Michiels et al. 2018.',
    },
  },
  citations: ['michiels2018', 'michiels2022'],
};

/** Positive = at least one manoeuvre changed the tinnitus (loudness or pitch). */
export const selfTestPositive = (ratings: Record<string, ModulationRating | undefined>): boolean =>
  Object.values(ratings).some((r) => r === 'louder' || r === 'quieter' || r === 'pitch');
