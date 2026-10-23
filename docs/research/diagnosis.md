# Evidence-Based Specification: ASSESSMENT & DIAGNOSIS Module for a Tinnitus Mobile App (iOS/Android)

Prepared: 2026-10-23. Research method: web search (extended mode) across guideline bodies, PubMed/PMC, publisher sites and registries. Full-text retrieval was blocked in this environment, so every statement below rests on abstracts, guideline summaries, executive summaries and secondary descriptions; items that could not be verified against primary full text are marked **[uncertain]**. Where numbers are given they were cross-checked across at least two independent snippets unless flagged.

Scope rule for the whole module: the app produces a **"probable profile" and a triage recommendation, never a medical diagnosis**. Every guideline reviewed (AAO-HNS 2014/2026, Cima 2019, NICE NG155, Japan 2020, VA/DoD 2024) places diagnosis with a clinician after targeted history, otoscopy and audiometry; the app's job is to collect structured data, screen for red flags, quantify distress with validated instruments, and route.

---

## 1. Clinical practice guidelines: what they require and where they diverge

### 1.1 AAO-HNS (Tunkel et al., 2014) and the AAO-HNSF Update (Adams et al., 2026)

**Tunkel DE et al. Clinical Practice Guideline: Tinnitus. Otolaryngol Head Neck Surg 2014;151(2 Suppl):S1–S40. doi:10.1177/0194599814545325.** Key points for an app:

- Statement 1: targeted history and physical examination at initial encounter to identify treatable conditions.
- Statement 2A (Recommendation): prompt comprehensive audiologic examination when tinnitus is **unilateral, persistent (≥6 months), or associated with hearing difficulty**. 2B (Option): initial audiologic exam may be obtained in anyone with tinnitus.
- Imaging (Strong recommendation against): no head/neck imaging *specifically to evaluate tinnitus* unless tinnitus is **unilateral, pulsatile, associated with focal neurologic abnormality, or asymmetric hearing loss**.
- Distinguish **bothersome vs non-bothersome** and **recent-onset (<6 months) vs persistent (≥6 months)**.
- Scope excludes pulsatile tinnitus and auditory hallucinations; pulsatile tinnitus is therefore an *exit criterion* from the self-management pathway.

**Adams ME et al. (first author per press coverage) Clinical Practice Guideline: Tinnitus Update. Otolaryngol Head Neck Surg, published 12 Oct 2026. doi:10.1002/ohn.70417.** Replaces 2014; **16 Key Action Statements**; evidence base 28 guidelines, 223 systematic reviews, 362 RCTs; applies to adults with tinnitus ≥6 months affecting quality of life. Confirmed from the AAO-HNSF press release, News-Medical and Hearing Review summaries:

- KAS 1 (Recommendation): targeted history and physical exam at first visit.
- KAS 2 (Strong recommendation): distinguish bothersome from non-bothersome tinnitus.
- KAS 3 (**Strong recommendation, new**): ask about **self-harm risk** in patients with bothersome tinnitus.
- KAS 5: obtain a comprehensive audiologic evaluation (press summaries say this now extends to all patients with tinnitus, broader than 2014) **[exact wording uncertain]**.
- KAS 6 (Strong recommendation against): no neuroradiologic imaging solely for tinnitus unless concerning features (same red-flag list as 2014 is implied) **[exact list uncertain]**.
- KAS 7: education about natural history and management options.
- New statements on **somatosensory tinnitus** (tinnitus modulated by head/neck/jaw movement), **cochlear implantation**, **bimodal neuromodulation** (Option), and **follow-up with validated outcome measures**; KAS 14A recommends against rTMS; against routine antidepressants/anticonvulsants/anxiolytics/intratympanic drugs and dietary supplements.

Implication: the app must (a) screen self-harm at every bothersome-tinnitus profile, (b) treat a somatosensory screen as a first-class subtype, (c) track outcomes with a validated instrument.

### 1.2 European multidisciplinary guideline (Cima et al., 2019)

**Cima RFF et al. A multidisciplinary European guideline for tinnitus: diagnostics, assessment, and treatment. HNO 2019;67(Suppl 1):10–42. doi:10.1007/s00106-019-0633-7.**

- Duration definitions: **acute <3 months; sub-acute 3–6 months; chronic ≥6 months**. Relevant because acute tinnitus with hearing loss needs urgent ENT (possible SSNHL), whereas chronic tinnitus is routed to stepped care.
- Diagnostic consensus: exclude physical cause (full ENT exam with otoscopy), audiometry, standardized questionnaires for distress, psychological referral when indicated. Diagnostic pathway chosen from history and basic tests rather than a rigid sequence.
- Only when clinically indicated: ABR and/or MRI for **unilateral tinnitus or asymmetric hearing loss**; high-frequency audiometry if normal standard audiogram but cochlear dysfunction suspected.
- Patients with **decompensation grade ≥2** (Biesinger/Goebel–Hiller grading) should have at least one disability measure (THI named) **[grade definitions not retrieved; uncertain]**.
- Treatment: GRADE-based; specialized stepped-care CBT for tinnitus is the only intervention supported by a high-quality trial.

### 1.3 NICE NG155 (2020, UK)

**NICE. Tinnitus: assessment and management. NG155, 11 March 2020. https://www.nice.org.uk/guidance/ng155** (NCBI Bookshelf NBK557037). Referral tiers (section 1.2) are the most explicit of any guideline and are adopted verbatim as the app's triage backbone:

| Tier | Trigger |
|---|---|
| **Immediate** (1.2.1) | Tinnitus associated with **high risk of suicide** → crisis mental health team; provide a safe place while waiting |
| **Immediate** (1.2.2) | **Sudden onset of significant neurological symptoms/signs** (e.g., facial weakness), **acute uncontrolled vestibular symptoms** (vertigo), or **suspected stroke** |
| **Within 24 h** (1.2.3) | Tinnitus with **hearing loss that developed suddenly (over ≤3 days) in the past 30 days** |
| **Within 2 weeks** (1.2.4) | **Distress affecting mental wellbeing** (prevents usual daily activities) even after first-contact support; **sudden hearing loss >30 days ago**; **rapidly worsening hearing loss (over 4–90 days)** |
| **Consider / routine** | **Persistent pulsatile tinnitus**; **persistent unilateral tinnitus**; tinnitus with **unilateral/asymmetric hearing loss**; **persistent objective tinnitus**; bothersome tinnitus despite first-contact support |

Investigations: audiological assessment; **offer imaging to people with pulsatile tinnitus**; for non-pulsatile unilateral/asymmetric cases, imaging per the hearing-loss guideline (MRI IAM). Questionnaires: **consider TFI** for adults (1.3.1); **consider TQ or Mini-TQ alongside TFI** if further psychological assessment is needed; VAS where questionnaires are unsuitable; assess sleep and quality of life.

Note: a draft (2019) placed suicide risk in the 24-h tier; the final guideline made it immediate.

### 1.4 Japanese guideline (Ogawa et al., 2020)

**Ogawa K, Sato H, Takahashi M, et al. Clinical practice guidelines for diagnosis and treatment of chronic tinnitus in Japan. Auris Nasus Larynx 2020;47(1):1–6. doi:10.1016/j.anl.2019.09.007.** Chronic = **≥3 months, non-pulsatile**. Recommended assessments (grade 1B): **THI, pure-tone audiometry, pitch matching, loudness balance**. Strong recommendation for educational counseling and for hearing aids when hearing loss is present; against pharmacotherapy. Treatment aim is distress reduction, not sound elimination.

### 1.5 Other 2021–2026 guidance

- **VA/DoD Clinical Practice Guideline for Tinnitus (2024; JAMA Otolaryngol Head Neck Surg, March 2025; https://www.healthquality.va.gov/guidelines/CD/tinnitus/)**: 25 recommendations, 2 algorithms. Suggests validated subjective measures (**TFI, THI**) to monitor outcomes and **advises against psychoacoustic measures (loudness match, MML) as outcome measures**; suggests hearing aids with hearing loss, CBT ± sound therapy, educational counseling; patient summary instructs immediate care for suicidal thoughts.
- **German S3 guideline chronic tinnitus (Mazurek et al., HNO 2022; PMC9581878)** and **BSA Practice Guidance: Tinnitus in adults (Oct 2021; review due Oct 2026)**: consistent red-flag list.
- **Stegeman et al., BMJ Open 2023** (systematic review of guidelines) and **Tinnitus Guidelines and Their Evidence Base, J Clin Med 2023;12(9):3087**: all guidelines converge on counseling and CBT; divergence concerns sound therapy and devices.
- **Pulsatile tinnitus**: a 2025 medRxiv systematic review (doi:10.1101/2025.02.25.25322858) found no evidence favoring one imaging pathway; RadioGraphics 2024 (doi:10.1148/rg.240030) and a 2025 narrative review (PMC12317842) describe CTA/CTV, MRI/MRA (TOF) and DSA for suspected dural AV fistula. For the app this is simply: **pulsatile = clinician referral with imaging; no self-management route.**

### 1.6 Consolidated red-flag set (union of guidelines)

1. Pulsatile / heartbeat-synchronous tinnitus (NICE: consider referral + imaging; AAO-HNS: imaging trigger).
2. Unilateral tinnitus (persistent) or tinnitus with asymmetric hearing (AAO-HNS, Cima, NICE).
3. Sudden hearing loss (≤3 days onset, within 30 days) → 24 h (NICE); SSNHL definition from **Chandrasekhar et al., AAO-HNS SHL Update 2019, Otolaryngol Head Neck Surg 161(1 Suppl):S1–S45, doi:10.1177/0194599819859885**: sensorineural loss **≥30 dB at ≥3 contiguous frequencies within 72 h**.
4. Focal neurological signs (facial weakness, diplopia, dysarthria, limb weakness) → immediate.
5. Acute uncontrolled vertigo → immediate.
6. High suicide risk → immediate crisis referral.
7. Objective tinnitus (audible to others), otorrhea/ear pain/head trauma (secondary sources; routine ENT).
8. Rapidly progressive hearing loss (4–90 days) → 2 weeks (NICE).

Asymmetric hearing loss thresholds in the literature (no consensus): CNS vestibular-schwannoma guideline recommends MRI for interaural difference **>10 dB at ≥2 contiguous frequencies or ≥15 dB at any single frequency**; Durakovic et al. (Laryngoscope 2019, doi:10.1002/lary.27504) favoured **≥20 dB at two adjacent frequencies or ≥15 dB at any two frequencies 2–8 kHz**; "Rule 3000" uses ≥15 dB at 3 kHz. An app with smartphone thresholds should use the *more conservative* rule (≥15 dB at any single frequency or ≥10 dB at two contiguous) only to *flag*, never to clear.

---

## 2. Validated questionnaires: scoring, cutoffs, licensing, Turkish versions

### 2.1 Tinnitus Handicap Inventory (THI)

- **Newman CW, Jacobson GP, Spitzer JB. Arch Otolaryngol Head Neck Surg 1996;122(2):143–148.** 25 items; three subscales (functional 12, emotional 8, catastrophic 5); responses **Yes = 4, Sometimes = 2, No = 0**; total 0–100.
- Grading (**McCombe A et al., Clin Otolaryngol 2001;26(5):388–393, doi:10.1046/j.1365-2273.2001.00490.x**): **Grade 1 slight 0–16; Grade 2 mild 18–36; Grade 3 moderate 38–56; Grade 4 severe 58–76; Grade 5 catastrophic 78–100** (odd totals are impossible because items score 0/2/4, which is why the bands skip 17, 37, 57, 77).
- MCID: commonly cited 7 points (Zeman et al. 2011); a 2025 re-estimation (PMC12207346) gives lower TFI MCID (≈9) and notes MCID rises with baseline severity. Treat a **≥7-point THI change** as meaningful, and the **≥20% THI reduction** criterion used in Kim et al. 2025 as "clinically significant response."
- Licensing: widely reproduced (ATA, ASHA NOMS); PhenX lists it as "freely available; permission not required"; many clinic forms state "reproduced with permission of Craig Newman." **[Uncertain for commercial apps — obtain written permission from the author/JAMA Network before embedding item text in a paid product.]**
- Turkish: **THI-TR validated (Aksoy S et al., Int Tinnitus J 2007; Cronbach α 0.88; ICC 0.78–0.90)**. A confirmatory factor analysis (J Psychosom Res 2014) questions the three-factor structure; use the total score.

### 2.2 Tinnitus Functional Index (TFI)

- **Meikle MB et al. Ear Hear 2012;33(2):153–176. doi:10.1097/AUD.0b013e31822f67c0.** 25 items, 11-point (0–10) scales; items 1 and 3 are asked as 0–100 % and must be divided by 10 before scoring.
- Subscales (confirmed across clinical-trial SAPs and the Swiss-German validation): **Intrusive 1–3; Sense of control 4–6; Cognitive 7–9; Sleep 10–12; Auditory 13–15; Relaxation 16–18; Quality of life 19–22; Emotional 23–25**. Subscale and total scores = **mean of answered items × 10 → 0–100**. Missing data: compute the total only if ≥19 of 25 items answered; subscale only if ≥2 of 3 (≥3 of 4 for QoL) answered **[rule from the OHSU scoring sheet; uncertain]**.
- Severity bands (Meikle 2012 / Henry 2016 "TFI: development, validation, outcomes research, and clinical application", Hear Res): **0–17 not a problem; 18–31 small problem; 32–53 moderate problem; 54–72 big problem; 73–100 very big problem**. A large-sample grading proposal exists (Jacquemin et al., Ear Hear 2022) **[bands not retrieved]**.
- **MCID = 13 points** (Meikle 2012, anchor CGI-I + 0.5 SD); 2025 re-estimate 7.3–9.4 points. Specify 13 as the conservative in-app threshold for "meaningful change."
- Licensing: **copyright Oregon Health & Science University (OHSU #1740)**; academic license free, **commercial use requires an OHSU license before download/reproduction**. The app must not ship TFI items without this license.
- Turkish: "Caglar O, Guclu O, Oymak S, Derekoy F. Reliability and usability of the Turkish Tinnitus Functional Index" exists as a reference **[statistics not retrieved; uncertain]**. Also validated in Turkish: **Tinnitus Primary Function Questionnaire (TPFQ-T; Turk Arch Otorhinolaryngol 2025, α 0.88)** and **International Tinnitus Inventory (Tr-ITI; 2023, α 0.909, test–retest 0.993)** — the ITI is short and free, a good fallback if the TFI license is not obtained.

### 2.3 Tinnitus Questionnaire (TQ) and Mini-TQ

- Hallam RS et al. 1988; German version Goebel & Hiller 1998. 52 items, 0/1/2 ("not true/partly true/true"); **total based on 40–41 scored items, two counted twice → 0–84**; five domains (emotional distress, intrusiveness, auditory perceptual difficulties, sleep disturbance, somatic complaints). German grades: **0–30 mild (grade 1), 31–46 moderate, 47–59 severe, 60–84 very severe**.
- **Mini-TQ (Hiller & Goebel, Int J Audiol 2004)**: 12 items, 0/1/2, total 0–24; conventional bands **0–7 compensated/not or lightly distressed; 8–12 moderately; 13–18 severely; 19–24 most severely distressed** (ENT & Audiology News notes no official grading, so label these as "conventional"). Mini-TQ-15 (2022/2023) adds 3 items.
- Licensing: TQ/Mini-TQ German versions are published by Hogrefe (commercial) **[uncertain]**; English TQ reproduced in Hallam's manual.
- Turkish: **TQ 12-T validated (Gürses E, Müjdeci B, Aksoy S; correlation with full TQ >0.90; test–retest 0.89)**.

### 2.4 Tinnitus Severity Index (TSI)

Meikle MB, Griest SE, Stewart BJ, Press LS (ARO abstract 1995); Oregon Tinnitus Clinic. **12 items; reported total range 12–56; clinic mean 38–40** (AudiologyOnline, Meikle). Item scales are mixed (some 1–5, some 1–4), which explains the odd range **[item scoring uncertain]**. Used in Folmer et al. 1999 (severity vs depression). No published grading bands; recommend **not** using as a primary instrument — superseded by the TFI from the same group.

### 2.5 Visual analogue / numeric rating scales

**Adamchic I et al. Am J Audiol 2012;21(2):215–225. doi:10.1044/1059-0889(2012/12-0010)**: VAS loudness and VAS annoyance (0–100 mm) test–retest r = 0.80 and 0.79; correlation with TQ up to r = 0.67; **MCID 10–15 points on 0–100** (≈1–1.5 on 0–10). Recommended app items: "How loud is your tinnitus right now?" and "How annoying/bothersome?" 0–10 NRS; also "% of waking time aware" (0–100). MCID scoping review (J Clin Med 2023;12(22):7117): ≥15 % of scale range is a safe generic MCID.

### 2.6 Case-history instruments: TSCHQ and ESIT-SQ

- **TSCHQ (Langguth B et al., Prog Brain Res 2007;166:525–536)**: 35 items, Tinnitus Research Initiative consensus; free for research use. Covers onset, onset-related events, laterality, pulsatility, sound quality, constancy, loudness/annoyance (0–100), effect of sounds/sleep/stress/caffeine, somatic modulation, hearing, hyperacusis, headache, vertigo, TMJ/neck pain, treatments.
- **ESIT-SQ (Genitsaridi E et al., Hear Res 2019;377:353–359, doi:10.1016/j.heares.2019.02.017)**: **39 items — Part A 17 general (demographics, hearing, health), Part B 22 tinnitus-specific**; contains all TSCHQ items; available in ≥7 languages free for research. No Turkish version found **[uncertain]**.
- Recommendation: build the app's intake from ESIT-SQ/TSCHQ item concepts (laterality, pulsatility, onset/duration, sound character, constancy, somatic modulation, hearing, hyperacusis, vertigo, headache, TMJ/neck pain, medications, noise exposure). These concepts are not copyrightable; verbatim text should follow the open licences of the source.

### 2.7 Hyperacusis

- **Khalfa Hyperacusis Questionnaire (Khalfa S et al., ORL 2002;64(6):436–442)**: 14 items, 4-point (0–3), **total 0–42**; original cutoff **≥28** = strong hypersensitivity; later validations propose **16** (Italian; Japanese full-form) and a 10-item/30-point form with cutoff 8 (Int J Audiol 2022). **Turkish adaptation: Erinç & Derinsu, Medeniyet Med J 2020;35:142–150 (n = 529)**; Turkish tinnitus/ULL validation (**Eur Arch Otorhinolaryngol 2022, doi:10.1007/s00405-022-07727-7; n = 140; cutoff 16.5** against ULL ≤90 dB); a **2025 Turkish revision (HQ-R, 12 items, cutoff 14; PubMed 40197138)** reports construct-validity problems with the 14-item Turkish form. For a Turkish app: use HQ-R (12 items, cutoff 14) or HQ with cutoff ≈16; flag ≥28 as "strong."
- **Inventory of Hyperacusis Symptoms (Greenberg & Carlos, Ear Hear 2018)**: 25 items, 4-point, **total 25–100**; original cutoff 69; UK validation (Ear Hear 2021) proposes **56** (specificity 82 % vs 48 %); Persian cutoff 48. No Turkish version found.
- Henry's **Tinnitus and Hearing Survey (THS)** (free, VA/NCRAR) has a 2-item hyperacusis section useful as a screen **[item text not retrieved]**.

### 2.8 Mental health, sleep, cognition

- **PHQ-9 (Kroenke, Spitzer & Williams, J Gen Intern Med 2001)**: 9 items 0–3, total 0–27; **5/10/15/20 = mild/moderate/moderately severe/severe; ≥10 = screen positive**; **item 9 (self-harm thoughts) any score >0 triggers the suicide-risk pathway**. Public domain (Pfizer). Turkish: Sarı et al. 2016 (α 0.84).
- **GAD-7 (Spitzer et al., Arch Intern Med 2006)**: 7 items 0–3, total 0–21; **5/10/15; ≥10 = probable anxiety disorder**. Public domain. Turkish: Konkan R et al., Arch Neuropsychiatry 2013.
- **Insomnia Severity Index (Morin 1993; Bastien 2001; Morin et al., Sleep 2011)**: 7 items 0–4, total 0–28; **0–7 none; 8–14 subthreshold; 15–21 moderate; 22–28 severe**; ≥10 optimal community cutoff. **Copyright C. Morin; licensed via Mapi Research Trust — commercial use requires a license.** Turkish: Boysan M et al. 2010.
- **Tinnitus Cognitions Questionnaire (Wilson & Henry, Int Tinnitus J 1998;4(1):23–30)**: 26 items 0–4; items 1–13 negative, 14–26 positive (reverse scored); **total 0–104**; higher = more negative cognitions. Factor structure confirmed (Ear Hear 2017). No formal cutoff; use quartiles or report subscale means.
- **Fear of Tinnitus Questionnaire (Cima RFF et al., 2011)**: 17 dichotomous statements, **total 0–17**. **Tinnitus Catastrophizing Scale (Cima, Crombez, Vlaeyen 2011)**: 13 items from the Pain Catastrophizing Scale, 5-point, reported range 0–65 (implies 1–5 scoring) **[uncertain]**. Both from Maastricht group; permission from authors advisable.
- Predictor note: in the Swedish LifeGene sample, **hyperacusis had OR 12.1 (95 % CI 7.06–20.6) for THI ≥58** (Cederroth CR et al., J Clin Med 2020;9(8):2412), so the hyperacusis screen is a high-yield severity predictor.

### 2.9 Licensing summary for the product team

| Instrument | Status | Action |
|---|---|---|
| THI | Author copyright; widely reproduced free | Written permission from Newman / JAMA Network for commercial app **[uncertain]** |
| TFI | OHSU copyright | **Commercial license required** |
| TQ / Mini-TQ | Hogrefe (German); Hallam (English) | License check |
| ESIT-SQ / TSCHQ | Free for research (TRI/ESIT) | Confirm commercial terms; concepts reusable |
| Khalfa HQ, IHS, TCQ, FTQ, TCS | Journal-published; no fee reported | Attribute; request author permission |
| PHQ-9, GAD-7 | Public domain | Free |
| ISI | Mapi Research Trust | **Commercial license required** |
| ITI, TPFQ (Turkish versions exist) | Open journal publications | Attribute |

---

## 3. Psychoacoustic characterization on a smartphone

### 3.1 What the evidence supports

- Guidelines treat pitch/loudness matching as *characterization*, not diagnosis (Japan 2020 recommends them; VA/DoD 2024 advises against using them as outcome measures). The app should present results as "your tinnitus profile" and use them to (i) personalize sound therapy frequency, (ii) run the RI test, (iii) inform the hearing-loss link.
- **Wunderlich R et al. Evaluation of iPod-based automated tinnitus pitch matching. J Am Acad Audiol 2015;26(2):205–212. doi:10.3766/jaaa.26.2.9**: self-administered **recursive two-interval forced choice (2AFC)** with loudness matching and octave-confusion check; 17 patients, 2 sessions; test–retest comparable to clinical audiometer procedure; iPod matches were systematically lower in frequency.
- **Vielsmeier V et al. One step closer towards a reliable tinnitus pitch-match frequency determination using repetitive recursive matching. Audiol Neurotol 2020;25(4):190–200. doi:10.1159/000505308**: 117 patients, 10 sessions; **mean within-subject SD 0.41 octaves; Cronbach α 0.80–0.95**; reliability increases across repetitions. Companion work (Prog Brain Res 2020/2021) shows **narrow-band noise (NBN) as the matching stimulus outperforms pure tones**, and that matching a pure tone to a noise-like percept gives the largest errors; recommended step size ≈1/12 octave (one semitone).
- **Hoare DJ et al. Agreement and reliability of tinnitus loudness matching and pitch likeness rating. PLoS One 2014;9(12):e114553**: individual-level agreement for single dominant pitch is weak; group means are reliable; loudness matching shows a learning effect between sessions. Design implication: **repeat the match ≥3 times and use the median; report a confidence band, not a single Hz value.**
- **Hébert S, Fournier P. Clinical validation of a new tinnitus assessment technology. Front Neurol 2017;8:38**: tablet/standalone device, likeness ratings and loudness matching reproducible across platforms; simulators ("malingerers") choose lower frequencies and ~10 dB louder matches, and loudness at the predominant pitch discriminated real from simulated tinnitus (specificity 94.4 % in the 2013 PLoS One precursor, Fournier & Hébert).
- **Henry JA et al.** (VA NCRAR, JAAA 2013 "Tinnitus Evaluation System"; J Rehabil Res Dev 2001 computer-automated pitch matching) established the automated protocol: pitch match → loudness match in dB SL → octave confusion → MML → RI.
- Loudness matches are typically **5–15 dB SL** (Fournier & Hébert 2013) or **6–20 dB SL** (Moore review); ~69 % of patients ≤10 dB SL (Reed 1960). Values >30 dB SL are atypical and suggest misunderstanding or simulation.
- Commercial references: **Tinnitracks** (notched music; CE-marked in Germany) and the **"TinnitusTester"** app were named in the brief but **no peer-reviewed validation of either tool's frequency determination was found [uncertain]**; cite Wunderlich/Vielsmeier for the method instead.

### 3.2 Recommended in-app protocol (ear-level earphones, quiet room, phone volume locked)

Pre-conditions: ambient noise check via microphone (abort if >40 dBA estimated) **[engineering heuristic, not from literature]**; earphone model declared; calibration profile loaded (see §4).

1. **Ear/laterality and sound-type selection** (tone / ringing / hiss / buzz / multiple).
2. **Pitch matching — recursive 2AFC with NBN (1/3-octave) stimuli**: start pair 1 kHz vs 8 kHz; "which sounds more like your tinnitus?"; halve the interval each step down to 1 semitone (≈6 %); 6–8 steps; repeat the whole run 3 times; **pitch estimate = median; reliability flag if range >1 octave**. Allow method-of-adjustment slider (125 Hz–16 kHz log scale, 1/12-octave steps) as an alternative for users who prefer it; record which method was used.
3. **Octave confusion test**: present f, f/2 and 2f at equal loudness; ask which is closest; if f/2 or 2f chosen, re-run step 2 anchored there.
4. **Loudness matching**: at the matched frequency, find the user's threshold (ascending 2 dB steps), then adjust the stimulus until "equally loud as tinnitus"; record **dB SL** (level above threshold). Expected 5–20 dB SL; prompt a repeat if >30 dB SL.
5. **Minimum masking level (MML)**: broadband (white or pink) noise starting at threshold, ascending in **2–3 dB steps** (Fournier 2018 used 3 dB; Hu 2021/Sendesen 2024 used 5 dB from 0 dB); MML = lowest level at which tinnitus is completely inaudible. If not masked by the device's safe maximum (cap at ~85–90 dB SPL equivalent), record "not maskable."
6. **Residual inhibition (RI)**: present the **same broadband (or 1/3-octave NBN centred on the pitch) noise at MML + 10 dB for 60 s** (Vernon & Meikle protocol; NCT06646302; Hu et al. 2021 used 60-s third-octave NBN at tinnitus pitch; a pilot hearing-aid RI study used 30–60 s at +10 dB above MML). Immediately after offset, the user rates tinnitus loudness every 5–10 s on a 0–10 slider (0 = gone) until it returns to baseline, up to 5 min. Outcomes: **RI type** (complete / partial / none / rebound), **depth** (minimum rating relative to baseline), **duration** (seconds until rating returns to ≥baseline−1). Define **RI-positive = any period with rating ≤50 % of baseline lasting ≥5 s**, **complete RI = rating 0 for ≥5 s** **[operational thresholds are the author's synthesis; the literature does not fix them]**. Hu et al. (Trends Hear 2021;25, doi:10.1177/2331216520986303) used "substantial" depth of suppression over 10 trials to classify susceptibility; 46 of 74 (62 %) met it.
7. Report: pitch (Hz, ±band), loudness (dB SL), MML (dB SL), RI type/duration, and a plain-language interpretation.

Safety: all stimuli ≤ 90 dB SPL equivalent at the calibrated profile; total RI exposure ≤ 3 trials per session.

### 3.3 Why RI matters for triage into sound therapy

- Prevalence of RI among tinnitus patients 60–80 % (reviews citing Vernon & Meikle 2003, Roberts et al. 2006/2008). **Roberts LE et al. (2008, J Assoc Res Otolaryngol)** showed RI depth is greatest for maskers centred in the hearing-loss/tinnitus-spectrum region; **Fournier P et al. (Hear Res 2018, "A new method for assessing masking and residual inhibition")** standardized the MRIL (masking/RI level) method with pulsed BBN or NBN.
- **Hu et al. 2021**: hearing loss at the tinnitus frequency increases RI susceptibility (p = .0043); chronicity reduces susceptibility only in normal-hearing subjects (OR 0.63).
- **Sendesen E, Türkyılmaz MD. Can residual inhibition predict the success of sound enrichment treatment for tinnitus? Brain Behav 2024;14(10):e70083. doi:10.1002/brb3.70083 (PMC11460611)**: RI+ vs RI− groups, all given sound enrichment; at 1, 3 and 6 months **THI, MML, tinnitus loudness level and psychosomatic scores decreased significantly only in the RI+ group**; between-group differences at 6 months p < .05. Companion paper (Brain Behav 2024;14(5), PMC11077254): sound enrichment effective within 1 month when RI positive and tinnitus pitch lies in a region with 45–55 dB HL loss.
- A 2024 JSLHR paper derives an MCID for MML (doi:10.1044/2024_JSLHR-24-00374) **[value not retrieved]**.
- Design rule: **RI-positive → prioritize sound-based self-management (masking/enrichment); RI-negative → prioritize CBT-based/attention modules**; both are offered, only the ordering changes. State explicitly that RI predicts *likelihood of benefit*, not a diagnosis.

---

## 4. Smartphone hearing screening: validity, calibration, disclaimers

### 4.1 Evidence by tool

- **Pooled accuracy**: meta-analysis of 25 studies (Chen et al., JMIR mHealth uHealth 2021, PMC8477297): smartphone audiometry vs PTA **sensitivity 89 % (83–93), specificity 93 % (87–97)**; against speech thresholds sensitivity 91 %, specificity 88 %, AUC 0.93. Only 36 % of studies reported RETSPL-based calibration. Systematic review (PMC9769434, 2022): uHear, DIN, hearTest and hearScreen are the best-validated.
- **hearScreen/hearTest (hearX)**: 97.8 % agreement with conventional audiometry (single study); within 1 dB of reference levels at 20/30/40 dB after calibration with Sennheiser HD202 (Swanepoel et al., Int J Audiol 2014). Without calibration, thresholds differed from automated audiometry by **>8 dB HL in a booth and >14 dB HL in a waiting room**.
- **uHear (Unitron)**: multiple studies; tends to overestimate thresholds at low frequencies; acceptable for detecting ≥40 dB HL loss **[specific figures not retrieved]**.
- **Mimi**: sensitivity 1.00 / specificity 0.72 in one 2023 comparison; 0.971 / 0.912 in another; overestimates thresholds 5–8 dB at 0.5–2 kHz.
- **SHOEBOX**: 100 % sensitivity / 95.9 % specificity for 40 dB PTA in quiet (adults, 2016 study); 93.3 % / 94.5 % in children (2013); vendor-reported 95 % / 91 % at 30 dB HL for the online screener. A 2024 head-to-head found SHOEBOX and hearWHO both better than self-report questionnaires for moderate-to-severe loss.
- **Digits-in-noise (DIN) / hearWHO**: **De Sousa KC et al. 2020** antiphasic DIN **sensitivity 90 %, specificity 84 %** for hearing loss; WHO states ">85 %". hearWHO returns a **0–100 score; <50 = likely hearing loss, 50–75 = intermediate/monitor, >75 = good** (peer-reviewed description, PMC11950885) **[official WHO referral rule not found; uncertain]**. South African English smartphone DIN pass/refer **SRT cutoff −9.55 dB SNR** (Potgieter et al., Int J Audiol 2016); Mandarin antiphasic DIN cutoffs **≥−15.8 dB (mild+) / ≥−14.2 dB (moderate+)** (Int J Audiol 2025). Global hearWHO use: De Sousa et al., Digit Health 2022. Independent field data vary widely (Tanzania n = 29: sensitivity 0.45, specificity 0.11; South Africa: 0.67/0.71 for moderate-severe loss, κ 0.32) — DIN is robust to transducer but sensitive to language competence and attention.
- **Earphone effects**: Accuracy of self-hearing-test apps across earphone styles (Am J Audiol 2018, doi:10.1044/2018_AJA-17-0070): with the *specified* transducer (e.g., Apple EarPods) screening for >25 dB HL loss was accurate; manufacturers should specify the earphone model.

### 4.2 Specification

- Offer **two tiers**: (A) **DIN test** (language-specific, antiphasic, ~3 min; Turkish digit triplets must be recorded and normed — no Turkish DIN validation found **[gap]**) as the transducer-agnostic primary screen; (B) **pure-tone threshold estimate** at 0.5, 1, 2, 3, 4, 6, 8 kHz per ear, only with a recognized earphone from a calibration table (RETSPL-derived offsets per model; fall back to "uncalibrated — screening only" with a larger uncertainty band).
- Decision thresholds for the profile: PTA4 (0.5/1/2/4 kHz) >25 dB HL = "possible hearing loss"; interaural asymmetry ≥15 dB at any frequency or ≥10 dB at two contiguous frequencies = "possible asymmetry → audiology"; high-frequency notch (4–6 kHz ≥20 dB worse than 2 and 8 kHz) = "noise-exposure pattern"; DIN score <50 (hearWHO scale) or SRT above language-specific refer cutoff = "refer."
- **Mandatory disclaimers** (derived from the calibration literature and the hearWHO "first step" wording): "This is a hearing *screening*, not a hearing test. Results depend on your earphones, phone volume and surroundings and can be off by 10 dB or more. A clinical audiogram is needed to diagnose hearing loss." Never display a "normal hearing" verdict with uncalibrated earphones; display "no screening concern" instead.

---

## 5. Subtyping / phenotyping used in research

### 5.1 Etiological and clinical subtypes (profile labels the app can assign *probabilistically*)

| Profile | Operational criteria for the app (self-report ± screen) | Source |
|---|---|---|
| **Somatosensory** | **Michiels S et al. Diagnostic criteria for somatosensory tinnitus: a Delphi process. Trends Hear 2018;22, doi:10.1177/2331216518796403** — 16 criteria in 3 categories (somatic modulation; tinnitus characteristics; accompanying symptoms); no single criterion is diagnostic. **Rapid Screening for Somatosensory Tinnitus Tool (RaSST; Michiels et al., Ear Hear 2022;43(5):1466–1471, doi:10.1097/AUD.0000000000001224)**: 4 items — (1) tinnitus and neck/jaw pain increase/decrease together, (2) suboccipital muscle tension, (3) somatic modulation by head/neck/jaw movement or pressure, (4) bruxism; **accuracy 82.2 %, sensitivity 82.5 %, specificity 79 %**. Item 1 carries the most single-item value. | Michiels 2018, 2022; AAO-HNSF 2026 new KAS |
| **TMJ-related / cervical** | Somatosensory profile + jaw pain/clicking/bruxism (TMJ) or neck pain/stiffness, onset after neck trauma (cervical). Edvall NK et al. (Front Neurosci 2019) showed TMJ complaints raise tinnitus distress. | Edvall 2019 |
| **Pulsatile** | Rhythmic, heartbeat-synchronous; ask "does it change when you press on the side of your neck or turn your head?" → always clinician + imaging. | NICE; RadioGraphics 2024 |
| **Ménière's-type** | **Lopez-Escamez JA et al. J Vestib Res 2015;25(1):1–7, doi:10.3233/VES-150549**: Definite = ≥2 spontaneous vertigo episodes **20 min–12 h**, audiometrically documented low–mid-frequency SNHL in the affected ear, fluctuating aural symptoms (hearing, tinnitus, fullness); Probable = ≥2 episodes **20 min–24 h** with fluctuating aural symptoms. App can only flag "possible" → ENT. | Lopez-Escamez 2015 |
| **Otosclerosis-type** | Progressive hearing loss in young/middle adulthood, family history, low-pitched tinnitus, paradoxically better hearing in noise; conductive pattern cannot be confirmed by air-conduction screening → audiology/ENT. | Standard otology texts **[not searched]** |
| **Ototoxic** | Onset during/after aminoglycosides, cisplatin/carboplatin, loop diuretics, high-dose salicylates/NSAIDs, quinine, some macrolides; usually bilateral, high-frequency loss. → clinician review of medication. | Standard pharmacology **[not searched]** |
| **Noise-induced** | Onset after acoustic trauma/occupational or recreational noise; 4–6 kHz notch on screen. | Standard |
| **Age-related (presbycusis-associated)** | Age ≥60, gradual bilateral high-frequency loss, no red flags. | Standard |
| **Acute vs chronic** | <3 months acute; 3–6 months sub-acute; ≥6 months chronic (Cima 2019); Japan uses ≥3 months; AAO-HNS uses ≥6 months "persistent". | Cima 2019 |
| **Constant vs occasional** | STOP/LifeGene: mean THI 29.7 (constant) vs 10.8 (occasional) (JCI Insight 2022). | Cederroth group |

### 5.2 Data-driven phenotypes

- **Genitsaridi E et al. A review and a framework of variables for defining and characterizing tinnitus subphenotypes. Brain Sci 2020;10(12):938**: eight data-driven studies, k-means/hierarchical/latent-class; no consistent cluster solution; warns that clustering always returns groups.
- **Niemann U et al. Phenotyping chronic tinnitus patients using self-report questionnaire data: cluster analysis and visual comparison. Sci Rep 2020;10:16411** (Schlee lab; X-means on 1,228 patients; radar-chart visualisation).
- **Brain Sci 2023;13(4):572** (Nottingham/ESIT): 2,772 patients; t-SNE + k-means best recovered ENT endotypes; 18–20 clusters.
- **Kim SJ, Shin SH, Byun SW, Lee HY. Tinnitus subtyping and personalized treatment via audiometric and psychometric clustering. Yonsei Med J 2025;66(10):685–694, doi:10.3349/ymj.2025.0088**: 311 patients; inputs PTA, ULL, THI, VAS, BDI, BAI; k-means → **3 subtypes: severe tinnitus with normal hearing; hearing-loss-dominant; mild psychosomatic**; clinically significant response (≥20 % THI drop) 59.4 % overall, **68.3 % (cluster 2) vs 61.5 % vs 51.7 %** (p < .01).
- **Brain Sci 2026;16(8):894** (EAE treatment): 564 patients, K-prototype clustering → 5 phenotypes from demographic, hearing, tinnitus and emotional variables.
- **UNITI (EU, ended Sept 2023)**: ML distress classification from AEP + clinical data, SVM AUC 92.5 %, sensitivity 84.8 %, specificity 83.0 % (J Clin Med 2023;12(11):3843); decision-support/subtype outputs **not yet published [uncertain]**.
- **npj Digit Med 2024** (TrackYourTinnitus intensive longitudinal data): tinnitus-related *thoughts* in daily diaries were the strongest predictor of clinical improvement — supports including a 1-item daily cognition rating.
- **Cederroth-group epidemiology**: hyperacusis OR 3.5 for any tinnitus, 7.4 for self-rated severe, **12.1 for THI ≥58** (J Clin Med 2020;9:2412); headache and TMJ complaints associate with distress (Lugo 2020; Edvall 2019); sex-dependent familial aggregation (Trpchevska 2020).

### 5.3 Predictors of distress (for the "risk of high distress" score)

- Multivariable model, 301 older adults with hearing loss (Front Neurol 2025, PMC12325010): **poor sleep OR 2.82, anxiety OR 1.97, severe hearing loss OR 3.45, hypertension 2.12, older age 2.42; validation AUC 0.76**.
- 285-patient SEM study (Front Psychiatry 2026): anxiety and sleep disturbance independent predictors; anxiety fully mediates depression → tinnitus severity.
- Beukes et al. 2021 (UK cross-sectional): insomnia, hearing-related distress and anxiety strongest predictors of severity.
- Noise sensitivity (single item) predicted distress at follow-up (Front Audiol Otol 2025).
- Catastrophizing: consistently associated conceptually (Cima's fear-avoidance model; Sci Rep 2023 cognitive model) but **no regression isolating TCS as predictor was retrieved [uncertain]**.
- Therefore the app's distress-risk composite = GAD-7 ≥10, ISI ≥15, HQ ≥16 (or HQ-R ≥14), PHQ-9 ≥10, TCQ upper tertile, each contributing a flag; ≥2 flags = "high-distress profile" → recommend clinician-delivered CBT rather than self-help alone (NICE 2-week criterion if distress prevents daily activities).

---

## 6. Recommended app-based assessment flow

### 6.1 Principles

1. Red flags first, before any questionnaire, and re-checked at every monthly re-assessment.
2. Validated instruments in fixed order, with licensed text only.
3. Psychoacoustics and hearing screen are optional modules, never gating referral.
4. Output = probable profile + triage tier + confidence, with language "may indicate… a clinician must confirm."

### 6.2 Stage A — Safety and red-flag screen (≈2 min; 12 items; mandatory)

A1. Thoughts of harming yourself or that life is not worth living in the past 2 weeks? (PHQ-9 item 9 wording) → if yes: show crisis resources, offer call button (local emergency/112 and crisis line), tier **URGENT-MH**.
A2. New facial weakness, numbness, slurred speech, double vision, severe sudden headache, or limb weakness? → **IMMEDIATE-NEURO** (emergency).
A3. Severe spinning dizziness right now or in the last 48 h that you cannot control? → **IMMEDIATE-NEURO**.
A4. Did your hearing drop suddenly (within 3 days) in the last 30 days? → **24-HOUR ENT** (possible SSNHL).
A5. Hearing getting rapidly worse over the last 1–3 months? → **2-WEEK ENT**.
A6. Does the sound pulse in time with your heartbeat? → **ROUTINE ENT + imaging** (no self-management-only route).
A7. Only in one ear, or much louder in one ear? → **AUDIOLOGY/ENT** (unilateral).
A8. Hearing clearly worse in one ear? → **AUDIOLOGY/ENT** (asymmetry).
A9. Can other people hear the sound? / clicking you can hear objectively? → **ROUTINE ENT**.
A10. Ear discharge, ear pain, recent head injury or ear surgery? → **ROUTINE ENT**.
A11. Episodes of spinning vertigo lasting 20 min–12 h with fullness/fluctuating hearing? → **ROUTINE ENT (Ménière's-type)**.
A12. Started a new medicine known to affect hearing (chemotherapy, IV antibiotics, high-dose aspirin, "water pills") in the last 3 months? → **CLINICIAN REVIEW**.

### 6.3 Stage B — Case history (ESIT-SQ/TSCHQ concepts; ≈5 min)

Onset date and trigger; duration class (acute <3 m / sub-acute 3–6 m / chronic ≥6 m); laterality; sound character (tonal/noise/multiple/musical); constancy (constant/intermittent/occasional); % of waking time aware; loudness and annoyance NRS 0–10; variation with stress/sleep/caffeine/alcohol; effect of environmental sound (louder/quieter/no change — a first RI/masking indicator); somatic modulation (RaSST 4 items); jaw/neck pain, bruxism, headache; noise exposure history; hearing aid use; family history; medications; comorbid sleep/mental health history.

### 6.4 Stage C — Severity and comorbidity instruments (≈10 min; first visit and every 4–12 weeks)

Primary: **TFI** (licensed) — else **THI**; **Mini-TQ** optional. Comorbidity: **PHQ-9, GAD-7, ISI, Khalfa HQ (or HQ-R in Turkish)**. Optional CBT-module baseline: TCQ, FTQ.

### 6.5 Stage D — Optional measurement modules

D1. Hearing screen (DIN ± calibrated pure tones).
D2. Psychoacoustic profile (pitch, loudness, MML, RI) per §3.2.

### 6.6 Decision rules (evaluated top-down; first matching tier wins; lower tiers still receive the self-management plan where safe)

```
IF A1 = yes OR PHQ9_item9 > 0                       → TIER 0  URGENT mental-health crisis referral (NICE 1.2.1; AAO-HNSF 2026 KAS 3)
ELSE IF A2 = yes OR A3 = yes                        → TIER 0  IMMEDIATE emergency/neurology (NICE 1.2.2)
ELSE IF A4 = yes                                    → TIER 1  ENT within 24 h (NICE 1.2.3; SSNHL ≥30 dB/3 freq/72 h)
ELSE IF A5 = yes
     OR (TFI ≥ 54 OR THI ≥ 58) AND "distress prevents daily activities" = yes
     OR PHQ-9 ≥ 20 OR GAD-7 ≥ 15                    → TIER 2  Clinician/ENT + psychology within 2 weeks (NICE 1.2.4)
ELSE IF A6 = yes (pulsatile)
     OR A7 = yes (unilateral) OR A8 = yes
     OR A9/A10/A11/A12 = yes
     OR screen asymmetry ≥15 dB any freq / ≥10 dB two contiguous
     OR Ménière-pattern                             → TIER 3  Routine ENT referral with audiology (imaging decision by clinician; AAO-HNS/NICE/Cima)
ELSE IF screen PTA4 > 25 dB HL OR DIN refer
     OR self-reported hearing difficulty
     OR duration ≥ 6 months and never had audiometry  → TIER 4  Audiology evaluation recommended (AAO-HNS 2A; AAO-HNSF 2026 KAS 5) + start self-management
ELSE                                                → TIER 5  Self-management program (education, sound, CBT modules) with re-assessment at 4 and 12 weeks
```

Profile tagging (applied in parallel, non-exclusive):
- **Somatosensory-probable** if RaSST ≥2 of 4 (or item 1 positive) → add neck/jaw module and physiotherapy/dentistry suggestion (AAO-HNSF 2026).
- **Hyperacusis-present** if HQ ≥16 (HQ-R ≥14); **strong** if ≥28 → avoid high-level masking; sound-tolerance module.
- **High-distress** if ≥2 flags among GAD-7 ≥10, ISI ≥15, PHQ-9 ≥10, HQ ≥16, TCQ upper tertile → recommend clinician-delivered CBT (NICE), not self-help alone.
- **Insomnia-dominant** if ISI ≥15 → CBT-I module.
- **Hearing-loss-dominant** if screen PTA4 >25 dB or self-report → hearing-aid counselling (Japan 2020 strong rec; VA/DoD).
- **RI-positive** → sound-therapy-first ordering; **RI-negative/not maskable** → CBT/attention-first.
- **Acute (<3 m)** without red flags → reassurance + 4-week re-check with explicit instruction that new hearing change = 24-h referral.

Severity bands displayed to the user: TFI 0–17 / 18–31 / 32–53 / 54–72 / 73–100; THI grades 1–5 (McCombe). Change feedback: TFI ≥13 points or THI ≥7 points (or ≥20 %) = "meaningful change"; VAS ≥1.5/10.

### 6.7 Wording and regulatory notes

- Always: "This result is a *probable profile* based on your answers. It is not a diagnosis. Only an ENT doctor or audiologist can diagnose the cause of tinnitus." (All five guidelines place diagnosis with clinicians.)
- Hearing screen caveat per §4.2.
- Crisis path must function offline and be reachable from every screen.
- Re-screen red flags at every scheduled reassessment; a new "yes" overrides the current tier.
- Log instrument version and license for each questionnaire to satisfy copyright audits (TFI/OHSU, ISI/Mapi).

---

## 7. Key uncertainties and verification tasks before build

1. Obtain full text of AAO-HNSF 2026 update (doi:10.1002/ohn.70417) to confirm KAS numbering, the exact imaging red-flag list and the somatosensory/outcome-measure statements.
2. Confirm TFI missing-data rules and licensing cost with OHSU; confirm THI commercial permission.
3. Retrieve Caglar et al. Turkish TFI statistics; decide between TFI-TR and ITI-TR/TPFQ-T.
4. Validate the Turkish Khalfa HQ cutoff (16.5 vs HQ-R 14) in the target population.
5. No Turkish DIN test found: commission recording/norming or use pure-tone screen with calibrated earphones.
6. RI positivity thresholds (depth ≥50 %, ≥5 s) are operational proposals; pilot against the Hu 2021/Sendesen 2024 procedures.
7. hearWHO referral rule (score <50) is from a secondary peer-reviewed description, not WHO documentation.
8. TSI item scoring unverified; recommend exclusion.

---

## 8. Reference list (abbreviated; all cited inline above)

- Adams ME et al. Clinical Practice Guideline: Tinnitus Update. Otolaryngol Head Neck Surg 2026. doi:10.1002/ohn.70417 (press release: entnet.org; summaries: News-Medical 12 Oct 2026; Hearing Review).
- Adamchic I et al. Am J Audiol 2012;21:215–225. doi:10.1044/1059-0889(2012/12-0010).
- Cederroth CR et al. Association between hyperacusis and tinnitus. J Clin Med 2020;9(8):2412. doi:10.3390/jcm9082412.
- Chandrasekhar SS et al. CPG: Sudden Hearing Loss (Update). Otolaryngol Head Neck Surg 2019;161(1S):S1–S45. doi:10.1177/0194599819859885.
- Chen CH et al. Diagnostic accuracy of smartphone-based audiometry: meta-analysis. JMIR mHealth uHealth 2021 (PMC8477297).
- Cima RFF et al. HNO 2019;67(Suppl 1):10–42. doi:10.1007/s00106-019-0633-7.
- De Sousa KC et al. Global use and outcomes of the hearWHO mHealth hearing test. Digit Health 2022. doi:10.1177/20552076221113204; De Sousa 2020 antiphasic DIN validation.
- Durakovic N et al. What defines asymmetric sensorineural hearing loss? Laryngoscope 2019. doi:10.1002/lary.27504.
- Fournier P, Hébert S. Hear Res 2018 (MRIL method). PubMed 29708062.
- Genitsaridi E et al. ESIT-SQ. Hear Res 2019;377:353–359; Genitsaridi E et al. Brain Sci 2020;10(12):938.
- Hébert S, Fournier P. Front Neurol 2017;8:38. doi:10.3389/fneur.2017.00038.
- Hiller W, Goebel G. Mini-TQ. Int J Audiol 2004;43:600–604.
- Hoare DJ et al. PLoS One 2014;9(12):e114553.
- Hu S et al. Trends Hear 2021;25. doi:10.1177/2331216520986303.
- Khalfa S et al. ORL 2002;64:436–442; Erinç M, Derinsu U. Medeniyet Med J 2020;35:142–150; Turkish HQ/ULL study Eur Arch Otorhinolaryngol 2022 doi:10.1007/s00405-022-07727-7; Turkish HQ-R 2025 PubMed 40197138.
- Kim SJ et al. Yonsei Med J 2025;66(10):685–694. doi:10.3349/ymj.2025.0088.
- Langguth B et al. TSCHQ/consensus. Prog Brain Res 2007;166:525–536.
- Lopez-Escamez JA et al. J Vestib Res 2015;25:1–7. doi:10.3233/VES-150549.
- McCombe A et al. Clin Otolaryngol 2001;26:388–393. doi:10.1046/j.1365-2273.2001.00490.x.
- Meikle MB et al. Ear Hear 2012;33:153–176. doi:10.1097/AUD.0b013e31822f67c0; OHSU TFI licence (OHSU #1740).
- Michiels S et al. Trends Hear 2018;22. doi:10.1177/2331216518796403; Michiels S et al. RaSST. Ear Hear 2022;43(5):1466–1471. doi:10.1097/AUD.0000000000001224.
- Newman CW et al. Arch Otolaryngol Head Neck Surg 1996;122:143–148; Aksoy S et al. Turkish THI, Int Tinnitus J 2007.
- NICE NG155 (2020). https://www.nice.org.uk/guidance/ng155.
- Niemann U et al. Sci Rep 2020;10:16411. doi:10.1038/s41598-020-73402-8.
- Ogawa K et al. Auris Nasus Larynx 2020;47:1–6. doi:10.1016/j.anl.2019.09.007.
- Potgieter JM et al. Int J Audiol 2016;55(7):405–411 (SA English DIN, cutoff −9.55 dB).
- Sendesen E, Türkyılmaz MD. Brain Behav 2024;14(10):e70083. doi:10.1002/brb3.70083.
- Swanepoel DW et al. Int J Audiol 2014;53(12):841–849 (hearScreen calibration).
- Tunkel DE et al. Otolaryngol Head Neck Surg 2014;151(2S):S1–S40. doi:10.1177/0194599814545325.
- VA/DoD Clinical Practice Guideline for Tinnitus 2024; JAMA Otolaryngol Head Neck Surg 2025. https://www.healthquality.va.gov/guidelines/CD/tinnitus/.
- Vielsmeier V et al. Audiol Neurotol 2020;25:190–200. doi:10.1159/000505308.
- Wilson PH, Henry JL. TCQ. Int Tinnitus J 1998;4:23–30; Cima RFF et al. FTQ/TCS 2011.
- Wunderlich R et al. J Am Acad Audiol 2015;26(2):205–212. doi:10.3766/jaaa.26.2.9.
- Frontiers in Neurology 2025 prediction model (PMC12325010); Front Psychiatry 2026 SEM study; Brain Sci 2023;13:572; Brain Sci 2026;16:894; J Clin Med 2023;12:3843 (UNITI ML); J Clin Med 2023;12:7117 (MCID scoping review); PMC12207346 (THI/TFI MCID 2025).
