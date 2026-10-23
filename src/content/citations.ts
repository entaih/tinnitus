/** Evidence registry. Every evidence chip in the app resolves to one of these entries. */
export interface Citation {
  id: string;
  authors: string;
  year: number;
  title: string;
  journal: string;
  doi?: string;
  url?: string;
  level: 'guideline' | 'rct' | 'expert';
  summary: { tr: string; en: string };
}

export const CITATIONS: Record<string, Citation> = {
  tunkel2014: { id: 'tunkel2014', authors: 'Tunkel DE et al.', year: 2014, title: 'Clinical practice guideline: Tinnitus', journal: 'Otolaryngol Head Neck Surg 151(2 Suppl):S1–S40', doi: '10.1177/0194599814545325', level: 'guideline',
    summary: { tr: 'Amerikan KBB Akademisi tinnitus kılavuzu: ayrıntılı öykü, işitme değerlendirmesi, hasta eğitimi, işitme cihazı ve BDT önerilir; ilaç ve takviye önerilmez.', en: 'AAO-HNS tinnitus guideline: history, audiology, education, hearing aids and CBT recommended; drugs and supplements not recommended.' } },
  adams2026: { id: 'adams2026', authors: 'Adams ME et al.', year: 2026, title: 'Clinical practice guideline: Tinnitus (Update)', journal: 'Otolaryngol Head Neck Surg', doi: '10.1002/ohn.70417', level: 'guideline',
    summary: { tr: '2026 güncellemesi: kendine zarar verme taraması, somatosensoriyel tinnitus ve valide sonuç ölçekleri eklendi.', en: '2026 update adds self-harm screening, somatosensory tinnitus and validated outcome measures.' } },
  nice2020: { id: 'nice2020', authors: 'NICE', year: 2020, title: 'Tinnitus: assessment and management (NG155)', journal: 'National Institute for Health and Care Excellence', url: 'https://www.nice.org.uk/guidance/ng155', level: 'guideline',
    summary: { tr: 'İngiltere kılavuzu: acil, 24 saat, 2 hafta ve rutin sevk ölçütleri; tinnitus için BDT önerilir; betahistin önerilmez.', en: 'UK guideline: immediate, 24-hour, 2-week and routine referral criteria; CBT recommended; betahistine not recommended.' } },
  cima2019: { id: 'cima2019', authors: 'Cima RFF et al.', year: 2019, title: 'A multidisciplinary European guideline for tinnitus', journal: 'HNO 67(Suppl 1):10–42', doi: '10.1007/s00106-019-0633-7', level: 'guideline',
    summary: { tr: 'Avrupa çok disiplinli kılavuzu: akut (<3 ay), subakut (3–6 ay), kronik (≥6 ay) sınıflaması; BDT için güçlü öneri.', en: 'European multidisciplinary guideline: acute (<3 m), sub-acute (3–6 m), chronic (≥6 m); strong recommendation for CBT.' } },
  chandrasekhar2019: { id: 'chandrasekhar2019', authors: 'Chandrasekhar SS et al.', year: 2019, title: 'Clinical practice guideline: Sudden hearing loss (update)', journal: 'Otolaryngol Head Neck Surg 161(1 Suppl):S1–S45', doi: '10.1177/0194599819859885', level: 'guideline',
    summary: { tr: 'Ani işitme kaybında 2 hafta içinde steroid tedavisi seçeneği; 2–6 haftada kurtarma tedavisi. Zaman kritiktir.', en: 'Steroids may be offered within 2 weeks of sudden hearing loss; salvage therapy at 2–6 weeks. Time-critical.' } },
  newman1996: { id: 'newman1996', authors: 'Newman CW, Jacobson GP, Spitzer JB', year: 1996, title: 'Development of the Tinnitus Handicap Inventory', journal: 'Arch Otolaryngol Head Neck Surg 122:143–148', doi: '10.1001/archotol.1996.01890140029007', level: 'guideline',
    summary: { tr: '25 maddelik THI; Türkçe geçerlilik: Aksoy ve ark. 2007. Dereceler: McCombe 2001.', en: '25-item THI; Turkish validation Aksoy et al. 2007; grades McCombe 2001.' } },
  meikle2012: { id: 'meikle2012', authors: 'Meikle MB et al.', year: 2012, title: 'The Tinnitus Functional Index', journal: 'Ear Hear 33:153–176', doi: '10.1097/AUD.0b013e31822f67c0', level: 'rct',
    summary: { tr: 'TFI 0–100; 13 puanlık değişim klinik olarak anlamlı kabul edilir.', en: 'TFI 0–100; a 13-point change is clinically meaningful.' } },
  kroenke2001: { id: 'kroenke2001', authors: 'Kroenke K, Spitzer RL, Williams JB', year: 2001, title: 'The PHQ-9: validity of a brief depression severity measure', journal: 'J Gen Intern Med 16:606–613', doi: '10.1046/j.1525-1497.2001.016009606.x', level: 'guideline',
    summary: { tr: 'PHQ-9 depresyon taraması; ≥10 pozitif tarama; 9. madde kendine zarar verme düşüncesini sorar.', en: 'PHQ-9 depression screen; ≥10 positive; item 9 screens self-harm thoughts.' } },
  spitzer2006: { id: 'spitzer2006', authors: 'Spitzer RL et al.', year: 2006, title: 'A brief measure for assessing generalized anxiety disorder: the GAD-7', journal: 'Arch Intern Med 166:1092–1097', doi: '10.1001/archinte.166.10.1092', level: 'guideline',
    summary: { tr: 'GAD-7 kaygı taraması; ≥10 olası kaygı bozukluğu.', en: 'GAD-7 anxiety screen; ≥10 probable anxiety disorder.' } },
  khalfa2002: { id: 'khalfa2002', authors: 'Khalfa S et al.', year: 2002, title: 'Psychometric normalization of a hyperacusis questionnaire', journal: 'ORL 64:436–442', doi: '10.1159/000067570', level: 'rct',
    summary: { tr: '14 maddelik hiperakuzi anketi; Türkçe uyarlama Erinç & Derinsu 2020; tinnitus örnekleminde eşik ≈16.', en: '14-item hyperacusis questionnaire; Turkish adaptation Erinç & Derinsu 2020; cutoff ≈16 in tinnitus samples.' } },
  espie2014: { id: 'espie2014', authors: 'Espie CA et al.', year: 2014, title: 'The Sleep Condition Indicator: a clinical screening tool to evaluate insomnia disorder', journal: 'BMJ Open 4:e004183', doi: '10.1136/bmjopen-2013-004183', level: 'rct',
    summary: { tr: '8 maddelik, ücretsiz uyku taraması; ≤16 olası insomnia.', en: '8-item free insomnia screen; ≤16 suggests probable insomnia disorder.' } },
  michiels2022: { id: 'michiels2022', authors: 'Michiels S et al.', year: 2022, title: 'The Rapid Screening for Somatosensory Tinnitus Tool', journal: 'Ear Hear 43:1466–1471', doi: '10.1097/AUD.0000000000001224', level: 'rct',
    summary: { tr: '4 soruluk somatosensoriyel tinnitus taraması; duyarlılık %82.5, özgüllük %79.', en: '4-item somatosensory tinnitus screen; sensitivity 82.5%, specificity 79%.' } },
  michiels2018: { id: 'michiels2018', authors: 'Michiels S et al.', year: 2018, title: 'Diagnostic criteria for somatosensory tinnitus: a Delphi process', journal: 'Trends Hear 22', doi: '10.1177/2331216518796403', level: 'expert',
    summary: { tr: 'Somatosensoriyel tinnitus için uzlaşı ölçütleri (boyun/çene hareketiyle değişim, eşlik eden ağrı).', en: 'Consensus criteria for somatosensory tinnitus (modulation by neck/jaw, accompanying pain).' } },
  michiels2016: { id: 'michiels2016', authors: 'Michiels S et al.', year: 2016, title: 'Does multi-modal cervical physical therapy improve tinnitus in patients with cervicogenic somatic tinnitus?', journal: 'Man Ther 26:125–131', doi: '10.1016/j.math.2016.08.005', level: 'rct',
    summary: { tr: '6 haftalık servikal fizyoterapi RKÇ: tinnitus şiddeti ve boyun yakınmaları azaldı.', en: '6-week cervical physiotherapy RCT: tinnitus severity and neck complaints decreased.' } },
  vanderwal2020: { id: 'vanderwal2020', authors: 'van der Wal A et al.', year: 2020, title: 'Treatment of somatosensory tinnitus: a randomized controlled trial studying the effect of orofacial treatment', journal: 'J Clin Med 9:705', doi: '10.3390/jcm9030705', level: 'rct',
    summary: { tr: 'Çene (TME) kaynaklı tinnitusta 9 haftalık orofasiyal tedavi tinnitus şiddetini azalttı.', en: '9-week orofacial treatment reduced tinnitus severity in TMD-related tinnitus.' } },
  fuller2020: { id: 'fuller2020', authors: 'Fuller T et al.', year: 2020, title: 'Cognitive behavioural therapy for tinnitus', journal: 'Cochrane Database Syst Rev CD012614', doi: '10.1002/14651858.CD012614.pub2', level: 'guideline',
    summary: { tr: 'Cochrane: BDT, tinnitusun yaşam kalitesine etkisini azaltır (28 çalışma, 2 733 katılımcı).', en: 'Cochrane: CBT reduces the impact of tinnitus on quality of life (28 trials, 2,733 participants).' } },
  beukes2018: { id: 'beukes2018', authors: 'Beukes EW et al.', year: 2018, title: 'Internet-based cognitive behavioural therapy for adults with tinnitus in the UK: a randomised controlled trial', journal: 'Ear Hear 39:423–433', doi: '10.1097/AUD.0000000000000505', level: 'rct',
    summary: { tr: 'İnternet tabanlı rehberli BDT (8 hafta): yüz yüze BDT kadar etkili; kullanıcıların ~%50’sinde anlamlı iyileşme.', en: 'Guided internet CBT (8 weeks): non-inferior to face-to-face; ~50% achieve meaningful change.' } },
  hesser2012: { id: 'hesser2012', authors: 'Hesser H et al.', year: 2012, title: 'A randomized controlled trial of internet-delivered CBT and ACT for tinnitus', journal: 'J Consult Clin Psychol 80:649–661', doi: '10.1037/a0027021', level: 'rct',
    summary: { tr: 'Kabul ve Kararlılık Terapisi (ACT), BDT ile eşdeğer etkili bulundu.', en: 'Acceptance and Commitment Therapy was as effective as CBT.' } },
  mckenna2017: { id: 'mckenna2017', authors: 'McKenna L et al.', year: 2017, title: 'Mindfulness-based cognitive therapy as a treatment for chronic tinnitus: a randomized controlled trial', journal: 'Psychother Psychosom 86:351–361', doi: '10.1159/000478267', level: 'rct',
    summary: { tr: 'Bilinçli farkındalık temelli BDT, gevşeme eğitimine göre tinnitus sıkıntısını daha fazla azalttı.', en: 'MBCT reduced tinnitus distress more than relaxation training.' } },
  sereda2018: { id: 'sereda2018', authors: 'Sereda M et al.', year: 2018, title: 'Sound therapy (using amplification devices and/or sound generators) for tinnitus', journal: 'Cochrane Database Syst Rev CD013094', doi: '10.1002/14651858.CD013094.pub2', level: 'guideline',
    summary: { tr: 'Ses terapisi tek başına düşük kanıt düzeyinde; BDT ve danışmanlıkla birlikte kullanılmalı.', en: 'Sound therapy alone has low-certainty evidence; use alongside counselling/CBT.' } },
  scherer2019: { id: 'scherer2019', authors: 'Scherer RW, Formby C; TRTT Group', year: 2019, title: 'Effect of tinnitus retraining therapy vs standard of care on tinnitus-related quality of life', journal: 'JAMA Otolaryngol Head Neck Surg 145:597–608', doi: '10.1001/jamaoto.2019.0821', level: 'rct',
    summary: { tr: 'TRT çalışması: plasebo ses üreteçleri gerçek olanlar kadar etkili; etkin bileşen danışmanlıktır.', en: 'TRTT: placebo sound generators worked as well as real ones; counselling is the active ingredient.' } },
  okamoto2010: { id: 'okamoto2010', authors: 'Okamoto H et al.', year: 2010, title: 'Listening to tailor-made notched music reduces tinnitus loudness', journal: 'PNAS 107:1207–1210', doi: '10.1073/pnas.0911268107', level: 'rct',
    summary: { tr: 'Tinnitus frekansı etrafında 1 oktav çentikli müzik 12 ayda gürlüğü azalttı; sonraki RKÇ (Stein 2016) olumsuz. Deneysel.', en: '1-octave notched music reduced loudness over 12 months; later RCT (Stein 2016) negative. Experimental.' } },
  stein2016: { id: 'stein2016', authors: 'Stein A et al.', year: 2016, title: 'Clinical trial on tonal tinnitus with tailor-made notched music training', journal: 'BMC Neurol 16:38', doi: '10.1186/s12883-016-0558-7', level: 'rct',
    summary: { tr: 'Çift kör RKÇ (n=100): yarım oktav çentikli müzik plasebodan farklı değildi.', en: 'Double-blind RCT (n=100): half-octave notched music was not different from placebo.' } },
  sendesen2024: { id: 'sendesen2024', authors: 'Sendesen E, Türkyılmaz MD', year: 2024, title: 'Can residual inhibition predict the success of sound enrichment treatment for tinnitus?', journal: 'Brain Behav 14:e70083', doi: '10.1002/brb3.70083', level: 'rct',
    summary: { tr: 'Rezidüel inhibisyonu olan kişilerde ses zenginleştirme 6 ayda THI ve gürlüğü anlamlı azalttı; olmayanlarda azaltmadı.', en: 'Sound enrichment improved THI and loudness at 6 months only in residual-inhibition-positive patients.' } },
  vielsmeier2020: { id: 'vielsmeier2020', authors: 'Vielsmeier V et al.', year: 2020, title: 'One step closer towards a reliable tinnitus pitch-match frequency determination using repetitive recursive matching', journal: 'Audiol Neurotol 25:190–200', doi: '10.1159/000505308', level: 'rct',
    summary: { tr: 'Tekrarlı 2AFC perde eşlemesi güvenilir (α 0.80–0.95); ≥3 tekrar ve medyan önerilir.', en: 'Repeated 2AFC pitch matching is reliable (α 0.80–0.95); ≥3 runs with the median recommended.' } },
  wunderlich2015: { id: 'wunderlich2015', authors: 'Wunderlich R et al.', year: 2015, title: 'Evaluation of iPod-based automated tinnitus pitch matching', journal: 'J Am Acad Audiol 26:205–212', doi: '10.3766/jaaa.26.2.9', level: 'rct',
    summary: { tr: 'Taşınabilir cihazda kendi kendine perde eşlemesi klinik odyometreyle karşılaştırılabilir güvenilirlikte.', en: 'Self-administered pitch matching on a portable device had reliability comparable to clinic procedures.' } },
  chen2021: { id: 'chen2021', authors: 'Chen CH et al.', year: 2021, title: 'Diagnostic accuracy of smartphone-based audiometry for hearing loss detection: meta-analysis', journal: 'JMIR Mhealth Uhealth 9:e28378', doi: '10.2196/28378', level: 'rct',
    summary: { tr: 'Akıllı telefon odyometrisi: duyarlılık %89, özgüllük %93; kalibre edilmemiş kulaklıkla 8–14 dB hata olabilir.', en: 'Smartphone audiometry: sensitivity 89%, specificity 93%; uncalibrated earphones can err by 8–14 dB.' } },
  marks2023: { id: 'marks2023', authors: 'Marks E et al.', year: 2023, title: 'Cognitive behavioural therapy for insomnia (CBTi) as a treatment for tinnitus-related insomnia: a randomised controlled trial', journal: 'Cogn Behav Ther 52:91–109', doi: '10.1080/16506073.2022.2084155', level: 'rct',
    summary: { tr: 'Uykusuzluk için BDT (CBT-I), odyoloji temelli bakıma göre uykuyu ve tinnitus sıkıntısını daha fazla iyileştirdi.', en: 'CBT-I improved sleep and tinnitus distress more than audiology-based care.' } },
  formby2015: { id: 'formby2015', authors: 'Formby C et al.', year: 2015, title: 'A sound therapy-based intervention to expand the auditory dynamic range for loudness among persons with sensorineural hearing losses', journal: 'Semin Hear 36:77–110', doi: '10.1055/s-0035-1546958', level: 'rct',
    summary: { tr: 'Danışmanlık + düşük düzeyli pembe gürültü, ses toleransını (rahatsızlık eşiğini) ~10 dB artırdı.', en: 'Counselling + low-level pink noise expanded loudness tolerance by ~10 dB.' } },
  juris2014: { id: 'juris2014', authors: 'Jüris L et al.', year: 2014, title: 'Cognitive behaviour therapy for hyperacusis: a randomized controlled trial', journal: 'Behav Res Ther 54:30–37', doi: '10.1016/j.brat.2014.01.001', level: 'rct',
    summary: { tr: 'Hiperakuzi için BDT: ses toleransında orta–büyük etki; 12 ayda korundu.', en: 'CBT for hyperacusis: moderate–large effects on tolerance, maintained at 12 months.' } },
  conlon2020: { id: 'conlon2020', authors: 'Conlon B et al.', year: 2020, title: 'Bimodal neuromodulation combining sound and tongue stimulation reduces tinnitus symptoms (TENT-A1)', journal: 'Sci Transl Med 12:eabb2830', doi: '10.1126/scitranslmed.abb2830', level: 'rct',
    summary: { tr: 'Dil + ses uyarımı (Lenire) 12 haftada THI’yı anlamlı azalttı; yalnızca ses ile taklit edilemez; cihaz gerektirir.', en: 'Tongue + sound stimulation (Lenire) reduced THI at 12 weeks; cannot be replicated with sound alone; needs a device.' } },
  wegner2018: { id: 'wegner2018', authors: 'Wegner I et al.', year: 2018, title: 'Betahistine for tinnitus', journal: 'Cochrane Database Syst Rev CD013093', doi: '10.1002/14651858.CD013093.pub2', level: 'guideline',
    summary: { tr: 'Betahistin tinnitusta plasebodan farksız.', en: 'Betahistine is no better than placebo for tinnitus.' } },
  sereda2022: { id: 'sereda2022', authors: 'Sereda M et al.', year: 2022, title: 'Ginkgo biloba for tinnitus', journal: 'Cochrane Database Syst Rev CD013514', doi: '10.1002/14651858.CD013514.pub2', level: 'guideline',
    summary: { tr: 'Ginkgo biloba tinnitus şiddetini azaltmaz.', en: 'Ginkgo biloba does not reduce tinnitus severity.' } },
  ost1987: { id: 'ost1987', authors: 'Öst LG', year: 1987, title: 'Applied relaxation: description of a coping technique and review of controlled studies', journal: 'Behav Res Ther 25:397–409', doi: '10.1016/0005-7967(87)90017-9', level: 'rct',
    summary: { tr: 'Uygulamalı gevşeme: 6 aşamalı (kas gevşetme → hızlı gevşeme) kanıta dayalı protokol; tinnitus iBDT programlarının temelidir.', en: 'Applied relaxation: 6-step protocol used as the backbone of tinnitus iCBT programmes.' } },
  wasano2026: { id: 'wasano2026', authors: 'Wasano K et al.', year: 2026, title: 'Smartphone-delivered CBT app for tinnitus: a sham-controlled randomized trial', journal: 'JAMA Otolaryngol Head Neck Surg', level: 'rct',
    summary: { tr: 'Sahte kontrollü uygulama RKÇ’si (n=60): 16 haftada THI gruplar arası −20 puan.', en: 'Sham-controlled app RCT (n=60): THI −20 points between groups at 16 weeks.' } },
};

export const citation = (id: string): Citation | undefined => CITATIONS[id];
