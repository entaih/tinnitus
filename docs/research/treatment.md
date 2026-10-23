# Treatment & Rehabilitation Module — Evidence-Based Specification
### Tinnitus mobile app (iOS/Android, Expo)

*Research date: 23 October 2026. Prepared as a clinical-research input to product specification. Web access in this session was limited to search snippets (direct PDF/HTML fetch was blocked), so figures marked "(verify)" were taken from abstracts, secondary summaries or manufacturer materials and should be checked against the full text before being used in regulatory or marketing copy.*

---

## 0. How to read this document

**Evidence grades (GRADE-like):**
- **High** – multiple well-conducted RCTs / meta-analyses with consistent effects.
- **Moderate** – RCTs with some limitations (small n, no sham, single group) or consistent lower-quality evidence.
- **Low** – small or unblinded trials, inconsistent results, or industry-controlled data only.
- **Very low** – uncontrolled series, mechanistic/preclinical, or contradictory data.

**Headline conclusions for product design**

1. Cognitive-behavioural therapy (CBT), including internet/app-delivered CBT, is the only intervention with consistent moderate-certainty evidence for reducing tinnitus distress. It must be the spine of the module. Effect sizes: d ≈ 0.5–0.7 vs. waitlist for guided iCBT; d ≈ 0.3 vs. active controls.
2. Sound therapy *alone* has weak evidence (Cochrane 2018: low certainty; UNITI 2025: smallest effect of four arms), but sound is a useful adjunct for sleep, hyperacusis desensitisation, and as "sound enrichment" inside CBT. Two 2026 RCTs (French Sci Rep; Chinese MOST) are more positive but are not yet replicated independently.
3. The largest clinically meaningful single-modality effects in head-to-head data are CBT and hearing aids (UNITI 2025). The app should therefore screen for hearing loss and push users toward amplification rather than pretending sound files replace it.
4. Bimodal neuromodulation (Lenire; Michigan device) works only with the electrical/somatosensory arm. The sound-only arms of both pivotal trials were clearly inferior; an app cannot replicate the active ingredient and must not imply it does.
5. Insomnia is the most treatable comorbidity: CBT-I beats audiology sleep care (Marks 2023). Build a full CBT-I track, not just "sleep sounds".
6. Somatosensory tinnitus responds to cervical/orofacial physiotherapy (two RCTs, 2016/2020). A guided home-exercise track is justified for screened users (low–moderate certainty).
7. Do not recommend ginkgo, zinc, betahistine, antidepressants/anxiolytics for tinnitus per se, or rTMS. Melatonin: mixed, low-quality; present as "possible sleep aid, not a tinnitus treatment".
8. Track outcomes with TFI (primary) using a 13-point MCID (Meikle 2012; non-inferiority margin used by Beukes 2018) with a sensitivity read-out at 9 points (Engelke 2025). THI MCID: 7 (Zeman 2011) to 11 (Engelke 2025).
9. AAO-HNSF published an updated tinnitus guideline on 12 October 2026 (replacing Tunkel 2014) adding statements on somatosensory tinnitus, cochlear implantation, bimodal neuromodulation, self-harm screening and follow-up; it keeps CBT, counselling, sound-based therapy and hearing-aid evaluation, and still recommends against routine drugs, supplements and rTMS. E-health/app CBT is flagged as a research need, not an endorsed modality. Verify key-action-statement wording before citing.

---

## 1. Cognitive behavioural therapy (CBT), iCBT and ACT

### 1.1 Core evidence

| Source | Design | Key result | Grade |
|---|---|---|---|
| Fuller T et al. 2020, *Cochrane Database Syst Rev* CD012614.pub2, doi:10.1002/14651858.CD012614.pub2 | 28 RCTs, 2,733 adults | CBT vs. waitlist/no treatment: tinnitus-specific QoL SMD −0.56 (95% CI −0.83 to −0.30; 10 studies, n=537; low certainty). CBT vs. other active controls: SMD −0.30 (−0.55 to −0.05; 12 studies, n=966; low). CBT vs. audiological care: THI MD −5.65 (−9.79 to −1.50; 3 studies, n=444; **moderate**). Depression improved; anxiety/generic QoL uncertain; no data at 6–12 months. | Moderate (vs. audiological care); Low (others) |
| Beukes EW et al. 2018, *Ear Hear* 39(3):423-433, doi:10.1097/AUD.0000000000000505 | UK RCT, audiologist-guided iCBT vs. weekly monitoring, n=146 | TFI d = 0.70 (95% CI 0.4–1.0); clinically significant change (≥13 TFI) in 51% vs. 5% | Moderate |
| Beukes EW et al. 2018, *JAMA Otolaryngol Head Neck Surg* 144(12):1126-1133, doi:10.1001/jamaoto.2018.2238 | UK non-inferiority RCT, guided iCBT vs. face-to-face care, n=92 | Between-group TFI difference 5.18, inside the prespecified 13-point non-inferiority margin → iCBT non-inferior | Moderate |
| Beukes EW et al. 2022, *J Med Internet Res* 24(2):e27584, doi:10.2196/27584 | US RCT, iCBT vs. weekly monitoring, n=158 | ITT TFI 36.6 vs. 46.3; d = 0.46 (0.14–0.77); reliable-change criterion 22.7 TFI | Moderate |
| Beukes EW et al. 2022, *Internet Interv* 30:100583 (US 1-year follow-up); UK 1-year d = 1.04 within-group, 46% clinically significant | Repeated-measures | Gains maintained to 12 months | Low–Moderate |
| Beukes EW et al. 2021 "Dismantling iCBT for tinnitus" (ETSU works; *Int J Audiol* / *J Clin Med* – verify venue) | RCT, applied relaxation alone vs. full iCBT | Within-group d = 0.68 (AR only) vs. 0.87 (full iCBT), completers | Low |
| Hesser H et al. 2012, *J Consult Clin Psychol* 80(4):649-661, doi:10.1037/a0027021 | Internet CBT vs. internet ACT vs. monitored forum, n=99 | THI vs. control at post: CBT d = 0.70, ACT d = 0.68; between-treatment d = 0.16 (n.s.); 1-yr within-group d = 1.34 | Moderate |
| Westin VZ et al. 2011, *Behav Res Ther* 49(11):737-747, doi:10.1016/j.brat.2011.08.001 | ACT vs. TRT vs. waitlist, n=64 | ACT > TRT and WL on THI; reliable improvement ACT ≈ 55% vs. TRT ≈ 20% (verify time point); effects held at 6 & 18 months | Low–Moderate (single trial) |
| ACT meta-analysis 2023, *Indian J Otolaryngol Head Neck Surg*, doi:10.1007/s12070-023-03878-z | Pooled ACT vs. untreated control | THI MD −17.67 (95% CI −23.50 to −11.84) | Low (heterogeneous, small trials) |
| Internet-based therapies meta-analysis 2024, *J Pers Med* 14(8):813, doi:10.3390/jpm14080813 | RCTs to Feb 2024 | Intervention: THI −17.97 (d 0.85), TFI −24.56 (d 0.80); controls: THI −13.7 (d 0.55), TFI −4.25 | Low–Moderate |
| Kalmeda smartphone CBT: Walter U et al. 2023, *PLOS Digit Health* 2(9):e0000337, doi:10.1371/journal.pdig.0000337; 9-month extension *JMIR* 2025;27:e59575, doi:10.2196/59575 | RCT, n=187, delayed-start control | Tinnitus Questionnaire effect size ≈1.15 at 3 months, 1.38 at 9 months (within-group; verify); PHQ-9 and PSQ-20 improved; **no change in loudness**; no side effects | Moderate (no sham) |
| Wasano K et al. 2026, *JAMA Otolaryngol Head Neck Surg*, doi:10.1001/jamaoto.2026.0858 | Japan, **sham-app-controlled** RCT, n=60, 16 wk + 8 wk follow-up | THI between-group −20.4 (95% CI −28.2 to −12.6) at wk 16; −18.3 (−26.4 to −10.1) at wk 24; no benefit in subgroups without hearing loss, low baseline THI, or high anxiety/depression (small n) | Moderate (small) |

**Guideline position:** NICE NG155 (2020) recommends a stepped approach: digital CBT first-line → group MBCT/ACT/CBT → individual CBT by psychologists. AAO-HNSF 2014 and 2026 recommend CBT for persistent bothersome tinnitus. VA/DoD 2024 recommends CBT and *suggests* sound therapy combined with CBT. German S3 (2021/22) recommends counselling + CBT-based psychotherapy.

### 1.2 Exact module structure used in the iCBT trials (Kaldo/Andersson → Beukes)

The UK/US programme has **21 modules** (Spanish adaptation: 22), released **2–3 modules per week over 8 weeks**, with **16 recommended + 5 optional** modules. Each module = text + audio/video + worksheet + weekly diary; audiologist/psychologist asynchronous messaging ≈ 10–15 min/participant/week. Recommended home practice: **deep relaxation 10–15 min twice daily**, with a daily CBT exercise of 10–20 min (verify exact minutes from Beukes 2016 *Internet Interv* "Development and technical functionality").

Week-by-week (reconstructed from the UK protocol, NCT02370810, and Beukes 2016):

| Week | Recommended modules | Optional modules |
|---|---|---|
| 1 | Welcome & how to use the programme; Psychoeducation (what tinnitus is, hearing system, why it's noticed, habituation model); Deep relaxation step 1 (progressive muscle relaxation, 10–15 min × 2/day) | — |
| 2 | Relaxation step 2 (release-only/short PMR); Sound enrichment (using low-level ambient sound; never silence; mixing-point concept); Thought diary introduction | Sound enrichment (expanded) |
| 3 | Sleep guidelines (sleep hygiene + stimulus control adapted to tinnitus); Relaxation step 3 (cue-controlled breathing) | Sleep management (full) |
| 4 | Identifying negative thoughts (automatic thoughts about tinnitus); Positive imagery; Relaxation step 4 (differential relaxation) | Concentration/attention management |
| 5 | Cognitive restructuring (evidence for/against, alternative thoughts); Relaxation step 5 (rapid relaxation) | Hearing tactics (communication strategies for hearing loss) |
| 6 | Exposure to tinnitus (deliberate focused listening, 5→15 min, to extinguish fear/avoidance); Relaxation step 6 (applied relaxation in situ) | Sound sensitivity (hyperacusis graded exposure) |
| 7 | Attention shifting/refocusing exercises; Activity scheduling & reducing safety behaviours (avoiding silence/earplugs) | — |
| 8 | Relapse prevention (maintenance plan, early-warning signs, "my toolbox"); Summary; post-treatment TFI | — |

Six of the 15 core CBT modules are relaxation (Öst's applied relaxation sequence: PMR → release-only → cue-controlled → differential → rapid → applied). This maps well to an app: each step is a 5–15 min guided audio delivered twice daily.

**Dose:** 8 weeks; ~20–45 min/day (reading + exercise + relaxation); 1 contact/week. Face-to-face CBT trials in Cochrane: typically 6–10 weekly sessions of 60–120 min. Kalmeda: 5 stages, ~10–15 min/day, 3–9 months.

**Effect-size expectations for the app** (what to tell stakeholders): guided iCBT d ≈ 0.5–0.7 vs. no treatment; 40–50% of users achieving ≥13-point TFI change at 8 weeks; sham-controlled app effect on THI ≈ −18 to −20 points (one trial, n=60). Unguided apps show smaller effects (Oto RCT: 9 TFI points more than no-treatment control at 6 months, d = 0.62; dropout 21%).

**ACT content worth including** (Westin/Hesser): acceptance and defusion exercises ("leaves on a stream", "tinnitus as a passenger"), values clarification, committed action, willingness exposure to tinnitus. ACT and CBT are equivalent at 1 year (Hesser 2012); offer ACT-flavoured modules as an alternate path for users who dislike thought-challenging.

---

## 2. Mindfulness-based approaches

| Source | Design | Result | Grade |
|---|---|---|---|
| McKenna L, Marks EM, Hallsworth CA, Schaette R. 2017, *Psychother Psychosom* 86(6):351-361, doi:10.1159/000478267 | RCT, MBCT (8 weekly 2-h group sessions + 45-min home practice) vs. relaxation training, n=75 | Tinnitus Questionnaire: MBCT better by 6.3 points post-treatment (95% CI 1.3–11.4, p=0.016) and 7.2 at 6 months; d ≈ 0.56 at 6 months; both arms improved distress, anxiety, depression, loudness | Moderate (single trial, active control) |
| McKenna L, Marks EM, Vogt F. 2018, *Ear Hear* 39(2):359-366 | Uncontrolled clinic series, n=182 | Significant THI reduction, increased acceptance/mindfulness | Very low |
| Mindfulness systematic review 2019 (Rademaker et al., *J Clin Med* 8(11):1848) | 7 studies, n=425, 3 RCTs | Possible beneficial effect on distress (p<0.01); high heterogeneity | Low |
| Gans JJ et al. 2014 (MBTSR pilot) | Pilot, n≈13 | Pre-post THI improvement | Very low |
| Beukes et al. 2023 protocol, *Trials* 24:271, doi:10.1186/s13063-023-07299-9 | iCBT vs. internet-MBTSR vs. WL non-inferiority RCT | **Results not yet published** as of this search | — |

**Protocol content (MBCT for tinnitus, McKenna/Marks):** 8 weekly sessions: (1) automatic pilot & raisin exercise; (2) body scan (30–40 min audio); (3) mindful breathing / 3-minute breathing space; (4) mindful movement/stretching; (5) "allowing/letting be" – deliberately bringing attention to tinnitus; (6) thoughts are not facts; (7) self-care & activity; (8) maintenance. Home practice 45 min/day in the original; app adaptation 10–20 min/day is reasonable but untested (mark as adaptation).

**Breathing protocols:** No tinnitus-specific RCT isolates a breathing protocol. Slow-paced breathing (≈6 breaths/min, 5–10 min) has moderate evidence for state anxiety and sleep onset in general populations; present as a relaxation tool within applied relaxation (step 3, cue-controlled breathing), not as a tinnitus treatment. Grade: very low for tinnitus-specific outcomes.

**Design implication:** Offer mindfulness as a parallel track (user preference or after non-response to CBT per NICE stepped care). Body scan is the single best-evidenced mindfulness component (part of MBCT in McKenna 2017), keep it at 15–30 min.

---

## 3. Sound therapy

### 3.1 Systematic evidence

| Source | Result | Grade |
|---|---|---|
| Sereda M et al. 2018, *Cochrane Database Syst Rev* CD013094.pub2 | 8 studies, n=590. No evidence that sound generators, hearing aids or combination devices beat waitlist/placebo/education; no device superior to another; adverse effects not assessed | Low (certainty of evidence) |
| Tinnitus Retraining Therapy Trial: Scherer RW, Formby C et al. 2019, *JAMA Otolaryngol Head Neck Surg* 145(7):597-608, doi:10.1001/jamaoto.2019.0821 | n=151 (military), 3 arms: TRT (counselling + sound generators), partial TRT (counselling + **placebo** sound generators), standard of care. Primary: Tinnitus Questionnaire over 18 months. All arms improved; **no significant between-arm differences**; counselling arms equivalent → counselling is the active ingredient; sound generators add nothing measurable (Formby, Yang, Scherer 2022 secondary analysis, *JSLHR*, doi:10.1044/2021_JSLHR-21-00210) | High (for "SG adds nothing over counselling") |
| UNITI: Schoisswohl S et al. 2025, *Nat Commun* 16, doi:10.1038/s41467-025-66165-1 (NCT04663828) | n=461, 5 EU sites, 12 weeks; single vs. combined treatments (CBT, hearing aids, sound therapy, structured counselling). THI change −11.7 (single) vs. −14.9 (combination), p=0.034 (ITT; per-protocol n.s.). **CBT and hearing aids largest single-treatment effects; sound therapy smallest**; no synergy, stronger treatment compensates for weaker | High |
| French multicentre sound-therapy RCT 2026, *Sci Rep*, doi:10.1038/s41598-026-67678-5 | n=145, mild hearing loss; double-blind placebo amplification vs. sound generators vs. combined; 12 weeks. TFI change −21 (SG), −18 (combined) vs. −6 (placebo), p<0.001; GRC responders 88% / 77% / 33% | Moderate (single trial, no amplification-only arm, short) |
| MOST trial 2026 (China), PMC12766481 | n=440, 9 months, four sound therapies; all improved THI; digital frequency-customised relieving sound (DFCRS) best | Low–Moderate (no no-sound control; verify design) |
| Sendesen E et al. 2024, *Brain Behav* 14:e70083 | n=67; RI-positive patients (n=38) had larger THI/VAS gains from sound enrichment at 6 months than RI-negative (n=29) | Low |

### 3.2 Specific sound modalities and parameters

**(a) Broadband/white/pink noise, nature sounds — "sound enrichment" (TRT/PTM style)**
- Parameters (Jastreboff TRT; TRTT protocol): bilateral ear-level or environmental sound set **just below the mixing point** (level at which tinnitus and noise begin to blend) — never masking, never annoying; target **≥ 8 h/day** (TRTT prescribed ≥8 h; actual use lower); programme duration 12–18 months. Counselling: 1–2 h initial directive counselling + follow-ups.
- Evidence: counselling, not the sound, drives the effect (TRTT). Sound enrichment remains a *guideline-endorsed option* (AAO-HNSF 2014/2026 "may recommend"; VA/DoD 2024 "suggest, combined with CBT"; NICE: amplification only if hearing loss affects communication; sound generators/hearing aids not to be offered for tinnitus alone without hearing loss).
- Nature sounds vs. noise: preference-driven; Handscomb 2006 (*Acta Otolaryngol* Suppl 556) found bedside sound users preferred nature sounds; no comparative RCT shows a difference in outcome. Grade: very low for "which sound".
- **App rule:** user chooses from a library; app enforces an *in-app loudness calibration* (user sets level to just below mixing point against their own tinnitus) and caps output; recommends use whenever in quiet, esp. at night; records hours/day.

**(b) Tailor-made notched music training (TMNMT)**
- Okamoto H, Stracke H, Stoll W, Pantev C. 2010, *PNAS* 107(3):1207-1210, doi:10.1073/pnas.0911268107: n=39 (3 groups), **1-octave notch** centred on the tinnitus frequency, self-chosen music, ~12 h/week for 12 months; reduced loudness and auditory-cortex activity; tonal tinnitus ≤ 8 kHz required.
- Teismann H et al. 2011, *PLoS ONE* 6(9):e24685: short intensive (5 days × 6 h) — loudness reduction only for tinnitus frequency ≤ 8 kHz; no distress change.
- Stein A et al. 2016, *BMC Neurol* 16:38, doi:10.1186/s12883-016-0558-7: double-blind RCT, n=100, 2 h/day for 3 months, **½-octave notch** (energy-equalised); primary outcomes (loudness/distress) not significantly different from placebo at 3 months; a small loudness effect at 1-month follow-up and in post-hoc analyses. Essentially negative.
- Meta-analyses: Tavanai E et al. 2024, *Eur Arch Otorhinolaryngol* 281:5033-5049, doi:10.1007/s00405-024-08732-8 (7 trials; pooled THI effects reported at 3 and 6 months, verify numbers); Scarpa A et al. 2024, *Am J Otolaryngol*, doi:10.1016/j.amjoto.2024.104464 (3 studies; **no significant difference vs. ordinary music on THI**); Jiang et al. 2025, *Eur Arch Otorhinolaryngol* (notched vs. conventional music: THI MD −8.62 at 3 months, −24.61 at 6 months; small, heterogeneous; a Letter to the Editor disputes it).
- **Grade: Low** (benefit on loudness possible; no reliable benefit on distress). If offered: tonal tinnitus with reliable pitch match ≤ 8 kHz, 1-octave notch (Pantev's group argues the ½-octave notch in Stein 2016 was too narrow), ≥ 1–2 h/day for ≥ 3 months; present as optional "experimental" with explicit expectation setting. Tinnitracks (Germany) is built on this and is reimbursed via selective contracts, not via BfArM DiGA listing.

**(c) Acoustic coordinated reset (Tass; "RESET")**
- Tass PA et al. 2012, *Restor Neurol Neurosci* 30(2):137-159 (RESET, n=63, single-blind, positive on TQ/VAS). Hauptmann C et al. 2015, *Biomed Res Int* 569052 (RESET Real Life, n=200, open-label, 66.9% CGI-I improved at 12 months). **Hoare DJ et al. 2022** (RESET2; Nottingham; *Brain Sci* 12(3):317, PMC8946033): double-blind, placebo-controlled RCT; primary outcome not different (p=0.85), nor any secondary; open-label extension no change.
- **Grade: Low–very low; do not implement.**

**(d) Fractal tones (Widex Zen)**
- Herzfeld, Ciurlia-Guy, Sweetow 2014 (*Hearing Review*, cohort, THI −30 within programme incl. counselling + amplification); Sweetow, Kuk, Caporali 2015 (controlled, minimal-amplification-need subjects, counselling-only control did not improve). Industry-sponsored, no independent RCT. **Grade: Low.** Fractal/musical ambient sound may be used as one option in the library; no claims.

**(e) Amplitude-modulated / 40 Hz / 10 Hz modulated sounds, residual inhibition (RI)**
- Reavis KM et al. 2012, *JARO* 13:561-571: AM tones produce temporary suppression (RI) more often than other stimuli. Tyler R et al. 2014, *Am J Audiol* 23:303-308: 40 Hz AM pitch-matched "S-tones" > broadband noise for tinnitus reduction in 56 subjects (short-term). Neff P et al. 2017 (*Hear Res* 350:1-10) and 2019 (*Prog Brain Res* 262): 10 Hz AM at tinnitus frequency – only trends over pure tones; 40 Hz n.s. Registered 2024/25 trial NCT06646302 tests 40 Hz burst-modulated sound for deeper/longer RI (no results).
- RI prevalence: roughly 60–80% of patients show some RI after 30–60 s of matched noise; susceptibility relates to hearing loss and chronicity (medRxiv 2020). RI depth/duration seconds–minutes; no evidence of lasting benefit from repeated RI.
- **Grade: Very low for sustained benefit; Moderate that RI is a reliable *acute* effect.** App use: offer an "RI relief" tool (60 s of pitch-centred narrow-band noise at ~10 dB above tinnitus match loudness, or 10 Hz/40 Hz AM) for momentary relief and as a *phenotyping* step (RI+ users may do better with sound enrichment; Sendesen 2024). Do not market 40 Hz as a treatment.

**(f) Sound enrichment for sleep**
- Handscomb L. 2006, *Acta Otolaryngol* Suppl 556:21-26 (n=39, uncontrolled; PSQI improved, p=0.001; preferred sounds: nature/water). Theodoroff SM et al. 2017, *Am J Audiol* 26:543-554, doi:10.1044/2017_AJA-17-0022 (RCT of a sleep sound device: matched sound vs. noise vs. bedside generator – all groups improved, no clear winner). NICE evidence review for sound therapy found no sleep-specific benefit over controls.
- **Grade: Low.** Practical parameters: continuous low-level sound (pink/brown noise or nature, below mixing point), timer ≥ 90 min or all night, pillow speaker/room speaker preferred over earbuds; combine with CBT-I rather than replace it.

**(g) Hearing aids and combination devices**
- Sereda 2018 (low certainty, no superiority). UNITI 2025: hearing aids among the largest single-arm effects. European multicentre cohort (Ear Hear 2025, "Predictors of tinnitus symptom relief with hearing aids", PubMed 39748158): THI −11.6 and TFI −12.8 after 6 weeks, plateau by 12 weeks. 2013–2024 narrative review of hearing-aid-based therapy (PMC12007085): mean THI change −23 in uncontrolled studies.
- NICE: offer amplification when hearing loss affects communication; AAO-HNSF 2014/2026: hearing-aid evaluation for bothersome tinnitus with documented hearing loss. **Grade: Moderate** (for tinnitus with hearing loss).
- **App rule:** in-app hearing screen (pure-tone sweep or digits-in-noise); if ≥ mild loss or self-reported communication difficulty → "see an audiologist for hearing-aid evaluation" as a top-priority task; integrate hearing-aid use hours into the plan.

**(h) Cochlear implants**
- Meta-analysis 2024 (PMC11431415, 28 studies, n=853): THI MD −14.02 (95% CI −15.29 to −12.76) after CI; effect may wane over time. Prospective cohort 2024 (*Commun Med* 4:…; n=323, 2 years): 90% reduced THI, 61.6% >30% reduction. Single-sided deafness RCT (Wendrich 2024). AAO-HNSF 2026 adds a CI statement (verify wording). **Grade: Moderate (for CI candidates).** App role: education + referral trigger for severe–profound loss / SSD.

### 3.3 Parameter sheet for the app's sound engine

| Use case | Signal | Level | Dose | Duration |
|---|---|---|---|---|
| Daytime sound enrichment | Pink/brown noise, nature, fractal/ambient music (user choice) | Just **below mixing point** (user-calibrated vs. own tinnitus); ≤ 65 dBA equivalent cap; never above loudness-discomfort | Whenever in quiet; aim 2–8 h/day; log hours | Continuous through programme; taper in weeks 9–12 |
| Sleep | As above, continuous, no abrupt stops; room/pillow speaker | Lowest level that reduces tinnitus prominence | Sleep timer 90 min–all night | Throughout CBT-I track |
| Hyperacusis desensitisation | Pink noise (Formby; Vernon & Press 1998) | Start clearly comfortable (e.g., 20–30 dB SL), increase 2–3 dB/week toward conversational levels, never aversive | 2 × 30–60 min/day building to several h/day | 8–12 weeks (LDL gains ≈ +10–12 dB reported with counselling + generators) |
| RI "relief" tool | Narrow-band noise centred on pitch match (±½ octave) or 10 Hz AM tone | ~10 dB SL above tinnitus loudness match, capped | 60 s on → rate suppression | On-demand; also used for phenotyping |
| Notched music (optional/experimental) | User's music, 1-octave notch at pitch match (≤ 8 kHz) | Comfortable listening | 1–2 h/day | ≥ 3 months |

---

## 4. Bimodal neuromodulation

### 4.1 Lenire (Neuromod Devices; tongue + sound)

| Trial | Design | Result | Notes |
|---|---|---|---|
| TENT-A1: Conlon B et al. 2020, *Sci Transl Med* 12(564):eabb2830, doi:10.1126/scitranslmed.abb2830 | n=326, 3 stimulation-parameter arms, 12 weeks, 60 min/day | THI mean ≈ −14.6 points (PS1) at 12 weeks (verify); 86% of compliant participants improved (any change); ~80% sustained at 12 months; no between-arm differences; habituation of effect in weeks 7–12 | No sham/no-treatment control |
| TENT-A2: Conlon B et al. 2022, *Sci Rep* 12:10845, doi:10.1038/s41598-022-13875-x | n=191, setting switched at 6 weeks | THI ≈ −18.5 to −20.3 at 12 weeks (sources conflict); 91% of 111 followed had sustained improvement at 12 months | No control |
| TENT-A3: Boedts M et al. 2024, *Nat Commun* 15:6806, doi:10.1038/s41467-024-50473-z (NCT05227365) | n=112, single-arm *controlled*: **Stage 1 sound-only 6 weeks → Stage 2 bimodal 6 weeks** | Responder (>7 THI improvement): moderate-or-worse tinnitus **58.6% bimodal vs. 43.2% sound-only**; no advantage in full cohort; manufacturer cites 70.5% | Basis for FDA De Novo DEN210033 (6 March 2023) |
| Real-world: *Commun Med* 2025, doi:10.1038/s43856-025-00837-3 (n=220, US clinic) | Retrospective | 91.5% clinically meaningful reduction | Industry-linked; selection bias |

Stimulus: personalised audio (tones across the audiogram range on a broadband-like background, level set to audiogram) delivered via headphones, time-locked with electrical pulses to a 32-electrode tongue array; 2 × 30 min/day for 12 weeks. **Grade: Moderate for bimodal > sound-only in moderate-severe tinnitus; Low for absolute efficacy (no sham).** AAO-HNSF 2026 lists bimodal neuromodulation as an option with a call for independent replication.

### 4.2 Michigan auditory-somatosensory (Shore)

- Marks KL et al. 2018, *Sci Transl Med* 10(422):eaal3175 (n=20 crossover, 28 days, 30 min/day): loudness and TFI reduced with bimodal, not with sound-only.
- Jones GR, Martel DT, Riffle TL, … Shore SE. 2023, *JAMA Netw Open* 6(6):e2315914, doi:10.1001/jamanetworkopen.2023.15914: n=99 with **somatic tinnitus** (modulated by jaw/neck manoeuvres); double-blind crossover; 30 min/day for 6 weeks per phase with washout; sound = personal tinnitus spectrum at 40 dB SL; electrical stimulation of cervical (C2) or facial somatosensory region with millisecond-precise timing relative to sound. Bisensory: statistically significant and clinically meaningful reductions in TFI and THI, loudness −14.1 dB (per-protocol; ITT −5.8 dB, p=0.08); effects persisted into washout; **auditory-only: no cumulative effect**. Device (Auricle Inc.) not FDA-cleared as of 2026 (verify).
- **Grade: Moderate (single academic RCT, somatic-tinnitus subgroup).**

### 4.3 What an app can and cannot approximate

| Component | App feasible? | Evidence if sound-only |
|---|---|---|
| Personalised, audiogram-shaped tones / tinnitus-spectrum sound | Yes (with in-app audiometry) | TENT-A3 Stage 1: 43% responders (>7 THI) — an *active comparator*, not a bimodal effect; Shore: no cumulative effect |
| Precisely timed electrical somatosensory pulses (tongue/neck/face) | **No** (requires hardware; timing in ms) | — |
| Pairing sound with *self-performed* somatic manoeuvres (jaw clench, neck pressure) | Technically yes | **No evidence**; manoeuvres modulate tinnitus acutely but the therapeutic effect depends on electrically evoked, precisely timed somatosensory input. Do not claim. |
| Daily 60-min structured listening + adherence tracking + habituation of settings every 6 weeks | Yes | Supports engagement; no efficacy claim |

**Spec:** Provide education on Lenire/Shore devices, eligibility (moderate–severe THI/TFI, somatic modulation for Michigan device), and a referral pathway. Optionally offer a "personalised spectrum listening" session (20–30 min/day) labelled as sound enrichment, not neuromodulation.

---

## 5. Somatosensory tinnitus: physiotherapy evidence and app-guidable protocols

| Source | Design | Result | Grade |
|---|---|---|---|
| Michiels S et al. 2016, *Man Ther* 26:125-131, doi:10.1016/j.math.2016.08.005 (protocol: *Trials* 2014;15:297) | RCT, n=38, cervicogenic somatic tinnitus; immediate vs. 6-week delayed start; **max 12 sessions × 30 min over 6 weeks** of multimodal cervical PT (mobilisation, trigger-point therapy, deep-neck-flexor/craniocervical flexion training, home exercises) | TFI and Neck Bournemouth Questionnaire decreased; 53% substantial tinnitus improvement post-treatment, 24% maintained at 6-week follow-up | Low–Moderate |
| Michiels S et al. 2017, *Musculoskelet Sci Pract* 29:33-37 | Prognostic analysis | Responders: tinnitus and neck complaints **co-vary** (p=0.001); **low-pitched tinnitus** and tinnitus that **increases with poor cervical posture**; adj. R² 0.357 | Low |
| van der Wal A, Michiels S et al. 2020, *J Clin Med* 9(3):705, doi:10.3390/jcm9030705 (protocol *Trials* 2018;19:554) | RCT, n=80, TMD-related tinnitus; early vs. delayed; up to **18 sessions over 9 weeks** orofacial physiotherapy + education + occlusal splint if bruxism | Early-start TFI reduction larger (p=0.042); 61% clinically relevant improvement in severity, 46% in annoyance | Low–Moderate |
| Fabrizia et al. 2025, *J Oral Rehabil* 52, doi:10.1111/joor.13796 | SR/MA, 5 RCTs, n=329 (TMD + tinnitus) | Multidisciplinary non-invasive orofacial treatment most effective | Moderate |
| Manual-therapy SR/MA 2022 (PMC9256884) | RCTs of cervical/TMJ manual therapy | Favourable short-term effects; small studies | Low |
| Michiels S et al. 2018, *Trends Hear* (Delphi diagnostic criteria) | Consensus | Somatosensory tinnitus likely if: tinnitus modulated by somatic manoeuvres; onset/fluctuation tied to neck/jaw pain, trauma, posture; co-varying symptoms; unilateral tinnitus ipsilateral to pain; increased muscle tension/trigger points | — |

**App-guided protocol (adapted from the Antwerp protocols; label as "self-management exercises, not a substitute for physiotherapy"):**

*Screening (week 0):* Delphi criteria questionnaire + guided somatic-modulation test (jaw clench, jaw protrusion, lateral jaw shift, head rotation against resistance, pressure on temples/mastoid — user rates loudness change). Positive = ≥1 manoeuvre changes loudness/pitch **and** neck/jaw symptoms.

*Cervical track (6 weeks, 10–15 min/day):*
1. Posture reset: chin tuck against wall, 10 × 5 s.
2. Craniocervical flexion (deep neck flexor) training: supine, nod without lifting head, hold 10 s × 10, progress to sitting (weeks 3–6).
3. Cervical mobility: slow rotation/side-flexion to comfortable end-range, 10 each way.
4. Scapular stabilisation: scapular retraction/depression, 2 × 10; later with band.
5. Self-trigger-point release: upper trapezius, levator scapulae, sternocleidomastoid – 60–90 s sustained pressure (ball), 1–2/day.
6. Stretching: upper trapezius, levator scapulae, suboccipital release, 3 × 30 s.
7. Ergonomics/sleep posture education; stress-related muscle tension link to relaxation module.

*Orofacial/TMD track (6–9 weeks, 10 min/day):*
1. Jaw rest position awareness ("lips together, teeth apart, tongue on palate"), hourly check prompts.
2. Masseter/temporalis self-massage 2 min/side.
3. Controlled mouth opening with tongue on palate (Rocabado 6×6), 6 reps × 6/day.
4. Lateral/protrusive mobility exercises, 10 reps.
5. Bruxism management: nocturnal splint referral (dentist), caffeine/alcohol advice, relaxation before bed.
6. Avoid gum, nail-biting, wide yawning; soft diet in flare.

*Progression/stop rules:* if TFI/VAS unchanged after 6 weeks or pain increases → refer to physiotherapist/dentist; red flags (neurological signs, trauma, severe headache) → medical review.

---

## 6. Sleep, hyperacusis, misophonia

### 6.1 CBT-I for tinnitus-related insomnia
- Insomnia prevalence in tinnitus: 10–80%, most studies >40% (Asnis GM et al. 2018, *Clin Med Insights Ear Nose Throat*); clinic samples ≈ 69%.
- **Marks E, Hallsworth C, Vogt F, Klein H, McKenna L. 2023, *Cogn Behav Ther* 52(2):91-109, doi:10.1080/16506073.2022.2084155** (protocol *Trials* 2019;20:667): RCT, n=102, three arms – **CBT-I** (group, 6 × 2-h weekly sessions; sleep restriction, stimulus control, cognitive therapy for sleep/tinnitus beliefs, relaxation, sleep hygiene, use of sound), **Audiology-Based Care (ABC)** (tinnitus education, sound enrichment, sleep hygiene), **Sleep Support Group (SSG)**. CBT-I superior to ABC on ISI and sleep efficiency post-treatment and at 6 months; ABC superior to SSG; tinnitus distress, psychological distress and QoL also improved. Snippet figures suggest ISI reductions of ≈ −5.5 (CBT-I vs. ABC) and ≈ −9.7 (CBT-I vs. SSG) (verify); completion 94%, 80% self-reported improved insomnia. **Grade: Moderate** (single RCT, strong design).
- Tinnibot RCT 2026 (below) also reduced insomnia severity. Kalmeda improved PSQ-20.

**App CBT-I track (6 weeks):** sleep diary (ISI at baseline/wk 3/wk 6); week 1 psychoeducation + sleep hygiene + bedtime sound enrichment; week 2 stimulus control (bed only for sleep, 15-min rule, fixed rise time); week 3 sleep-restriction/compression (time-in-bed = average total sleep time + 30 min, min 5.5 h; titrate +15 min when sleep efficiency ≥ 85%); week 4 cognitive work on sleep/tinnitus catastrophising ("I'll never sleep with this noise"); week 5 relaxation/wind-down + worry time; week 6 relapse prevention. Contraindication flags for sleep restriction: epilepsy, bipolar disorder, parasomnias, safety-critical occupations – require clinician.

### 6.2 Hyperacusis desensitisation
- Formby C et al. 2003 (*J Acoust Soc Am* 114:55-58): 2 weeks of ear-level noise generators raised LDLs in normal hearers. Formby C, Hawley ML, Sherlock LP et al. 2015, *Semin Hear* 36(2):77-110: randomised placebo-controlled 2×2 (counselling ± active/placebo generators) in sensorineural hearing loss; counselling + sound generators produced the largest dynamic-range expansion (~10–12 dB LDL gain reported in secondary sources; verify). Jüris L et al. 2014, *Behav Res Ther* 54:30-37: CBT for hyperacusis RCT (n=60) – moderate–large effects on LDL and hyperacusis questionnaires, maintained at 12 months. 2024 AJA combined programme (psychoeducation + sound exposure + counselling, n=30 uncontrolled): +23.7 dB accepted sound. Systematic review 2025 (PubMed 42309185): sound-generator therapy reduces hyperacusis symptoms (few RCTs). **Grade: Low–Moderate.**
- Protocol: pink-noise graded exposure (Vernon & Press 1998): begin at comfortable level, increase level and/or duration weekly, 8–12 weeks; **stop ear-plug use in ordinary environments** (avoidance maintains hyperacusis); CBT components: fear of sound, safety behaviours, graded exposure hierarchy. Screen with Hyperacusis Questionnaire (Khalfa) ≥ 28 or Inventory of Hyperacusis Symptoms.

### 6.3 Misophonia distinction
- Swedo SE et al. 2022, *Front Neurosci* 16:841816 (Delphi consensus): misophonia = decreased tolerance to **specific** sounds/associated cues (eating, breathing, clicking), with anger/disgust/anxiety; not loudness-dependent. Hyperacusis = intolerance to **loudness** across sounds. Pain hyperacusis is a separate phenotype.
- Treatment: CBT (Jager IJ et al. 2020/21, *Depress Anxiety* 38(7):708-718; group CBT RCT, maintained at 1 year). Sound-generator desensitisation is **not** indicated for misophonia; app should screen (e.g., Amsterdam Misophonia Scale or Duke Misophonia Questionnaire short form), educate, and route to CBT/psychology rather than the hyperacusis sound track. **Grade: Low.**

---

## 7. Pharmacological agents and supplements (patient-education content: what NOT to recommend)

| Agent | Evidence | Position |
|---|---|---|
| Betahistine | Wegner I et al. 2018, *Cochrane* CD013093.pub2: 5 RCTs, n≈305; no effect vs. placebo (moderate–very low certainty). NICE NG155: **do not offer**. | Do not recommend |
| Ginkgo biloba | Sereda M et al. 2022, *Cochrane* CD013514: 12 RCTs, ~1,900; little/no effect on severity, loudness, QoL (low–very low). | Do not recommend |
| Zinc | Person OC et al. 2016, *Cochrane* CD009832: 3 RCTs, n=209; no benefit. | Do not recommend |
| Melatonin | Hurtuk A et al. 2011, *Ann Otol Rhinol Laryngol* 120(7):433-440: crossover, n=61, 3 mg nightly 30 days; greater improvement in tinnitus matching and self-rated tinnitus vs. placebo. Nocini R et al. 2024, *Acta Biomed* 95(2):e2024006: 6 studies, n=176, THI WMD −12.5 (95% CI −18.5 to −6.5), I² 71%, low quality. AAO-HNSF: do not routinely recommend. | Not a tinnitus treatment; may be discussed with a clinician for sleep; low-certainty |
| Antidepressants (incl. SSRIs/TCAs) | Baldo P et al. 2012, *Cochrane* CD003853: insufficient evidence; AAO-HNSF against routine use for tinnitus; treat comorbid depression on its own merits | Not for tinnitus per se |
| Benzodiazepines / anticonvulsants (gabapentin, carbamazepine) | Hoekstra CE et al. 2011, *Cochrane* CD007960 (anticonvulsants: no benefit); AAO-HNSF against; dependence risk | Do not recommend |
| Intratympanic drugs: AM-101 (esketamine; Auris) – TACTT2 (2016) & TACTT3 (2017) phase 3 failed co-primary endpoints in acute tinnitus; OTO-313 (gacyclidine; Otonomy) – phase 2 2022, n≈153, failed TFI ≥13 responder endpoint (high placebo response), development discontinued (Maxwell KS et al. 2023, *Otol Neurotol*, PubMed 37341760) | No approved tinnitus drug | Educate: "no pill works yet" |
| Other supplements (B12, magnesium, lipoflavonoids, CBD, "tinnitus formulas") | No RCT evidence; AAO-HNSF 2014/2026 recommend against dietary supplements | Do not recommend |
| Ototoxic/aggravating drugs (high-dose salicylates, loop diuretics, aminoglycosides, cisplatin, some quinine) | Mechanistic/observational | Education: review with prescriber, never stop without advice |

Patient-education framing: evidence summaries + placebo-response explanation (OTO-313 placebo responders) + "red-flag supplements marketing" literacy.

---

## 8. Neuromodulation and emerging treatments (education content; nothing for the app to deliver)

| Modality | Latest evidence | Grade / status |
|---|---|---|
| rTMS | Kitsis et al. 2026, *Laryngoscope*, doi:10.1002/lary.70633: 26 RCTs, n=1,576; rTMS SMD −0.15 (−0.37 to 0.07; n.s.); Frontiers Neurosci 2025 (16 RCTs, n=1,105): short-term THI benefit at 1 month, none at 6 months; AAO-HNSF 2014/2026 recommend against routine use | Low; not recommended |
| tDCS / tRNS | Kitsis 2026: tDCS SMD −0.36 (−0.75 to 0.02; n.s.); tRNS – systematic review only, no pooled effect | Very low |
| Vagus nerve stimulation paired with tones (MicroTransponder) | Tyler R et al. 2017, *Sci Rep* 7:11960: implanted pilot n=30; THI improvement not significant vs. control (p=0.34); 50% vs. 28% clinically meaningful responders; pivotal trial planned, no results found; company focus moved to stroke (Vivistim) | Very low; investigational |
| Transcutaneous VNS / nerve stimulation | 2026 ERL meta (doi:10.1007/s00405-026-10541-0): "nerve and acoustic stimulation" THI MD −8.70 vs. sham (heterogeneous) | Low |
| EEG neurofeedback (alpha/delta; sLORETA) | Güntensperger D et al. 2019, *Neural Plast* 2019:3540898: distress reduced, loudness returned to baseline; 2020 *Restor Neurol Neurosci*: no between-protocol difference; rt-fMRI neurofeedback vs. CBT trial NCT05737888 ongoing (n=21 interim) | Low |
| Low-level laser / photobiomodulation | Chen et al. 2020, *Brain Sci* 10(12):931: 11 studies, n=670, no THI difference vs. placebo; 2025 SR: efficacy uncertain | Low; not recommended |
| Heidelberg neuro-music therapy | Argstatter H et al. 2015, *J Psychosom Res* 78(3):285-292: controlled 2-centre trial, n=290; counselling (1×50 min) vs. counselling + 8 × 50-min music-therapy sessions; clinically meaningful improvement 66% vs. 33%; OR 4.34 (2.33–8.09); durability unknown | Low–Moderate (not randomised; one group) |
| Psychedelics / ketamine | Ketamine phase 2 NCT03336398 (n=42) completed 2024, no published results; psilocybin: preclinical (mouse 2024 preprint) and 2025/26 pilot registrations (NCT06405607, NCT06835699) | Very low; investigational |
| Gene therapy | No tinnitus programme. Otoferlin gene therapies (DB-OTO, AAV1-hOTOF) target congenital deafness, not tinnitus | None |
| Cochlear/bimodal devices | See §3.2(h), §4 | — |

---

## 9. Digital therapeutics: regulatory status, features, outcomes, gaps

| Product | Regulatory | Content | Evidence | Gaps |
|---|---|---|---|---|
| **Kalmeda** (mynoise GmbH, Germany) | BfArM DiGA, listed 25 Sep 2020, permanently listed (confirmed 2022); Stiftung Warentest "good (2.1)" | 5-stage CBT (psychoeducation → attention → cognition → relaxation → maintenance), relaxation audio, sound library, 10–15 min/day, 9 months | RCT n=187 (PLOS Digit Health 2023; JMIR 2025): TQ, PHQ-9, PSQ-20 improved; d ≈ 1.15–1.38 within-group; no loudness effect; delayed-start control, not sham | No hearing screen, no CBT-I, no hyperacusis/somatosensory tracks, no outcome-driven adaptation, German-centric |
| **Meine Tinnitus App** (Sonormed) | BfArM DiGA permanently listed (Mar 2022) | Counselling + sound/relaxation | Manufacturer study only (verify) | Thin public evidence |
| **Tinnitracks** (Sonormed) | Not DiGA; reimbursed via selective insurer contracts; CE | Notched music (Okamoto method) | Rests on TMNMT literature (Stein 2016 negative) | Single mechanism, low evidence |
| **Oto** (UK) | CE class I wellness app (verify) | CBT-based audio sessions, sound therapy, sleep, coach option | RCT 2025, *Speech Lang Hear*, doi:10.1080/2050571X.2025.2526235: TFI 9 points better than no-treatment control at 6 months (p=.006), d = 0.62; 21% dropout | No sham; unguided; no hearing/somatosensory components |
| **MindEar / Tinnibot** (Australia/NZ) | Wellness app; CE/FDA status unclear | CBT chatbot + sound + optional telepsychology | RCT 2026 (PMC13097093): n=105, Tinnibot vs. Woebot vs. waitlist, 8 weeks; only Tinnibot reached clinically meaningful TFI reduction; also reduced insomnia, anxiety, depression. Earlier: 42% (bot only) vs. 64% (hybrid with clinician) clinically significant | Chatbot engagement; best outcomes still need a human |
| **ReSound Relief / Beltone Tinnitus Calmer** (GN) | Companion wellness apps | Sound library, relaxation, education, hearing-aid streaming | No RCT found | No structured CBT, no outcomes |
| **Widex Zen Therapy** | Hearing-aid feature + counselling programme | Fractal tones, amplification, counselling, relaxation | Cohort/controlled, industry (THI −30 incl. all components) | No independent RCT |
| **Searchfield prototype polytherapeutic** (Univ. Auckland) | Research | Goal-based counselling, passive + game-based sound via bone-conduction | RCT 2022 (*Front Neurol* 13:958730): TFI −16.4/−17.8 (6/12 wk) vs. white-noise app −10.8/−10.1; responders 65% vs. 43% | Small n; hardware dependency |
| **UC Irvine app (Goshtasbi/Djalilian 2025)** | Research | Daily customised sound + weekly interactive CBT modules | RCT n=92 (*Ann Otol Rhinol Laryngol*): TFI −16.7 vs. −1.9; 38% ≥20-point improvement; PHQ-9/GAD-7 improved | Waitlist control |
| **Japanese therapeutic app (Wasano 2026)** | Investigational (SaMD pathway) | Education + CBT modules + self-monitoring | Sham-controlled RCT n=60: THI −20.4 between-group at 16 weeks | Small; subgroup limits |

**Common gaps our module can close:** (1) no assessment-driven personalisation (hyperacusis, insomnia, somatosensory, hearing loss) — all current apps give one path; (2) no CBT-I; (3) no somatosensory exercise track; (4) no hearing screening/referral integration; (5) no RI phenotyping; (6) no outcome-based adaptation rules; (7) no relapse-prevention/maintenance phase; (8) mostly unguided — add human/asynchronous coaching option since guided > unguided (Tinnibot hybrid 64% vs. 42%; Beukes guided d 0.46–0.70 vs. Oto unguided 9 points); (9) no safety screening for self-harm (now in AAO-HNSF 2026).

---

## 10. Acute tinnitus (< 3 months)

- **Sudden sensorineural hearing loss (SSNHL):** Chandrasekhar SS et al. 2019, *Otolaryngol Head Neck Surg* 161(1_suppl):S1-S45, doi:10.1177/0194599819859885: audiometry within 14 days; corticosteroids may be offered as initial therapy **within 2 weeks** of onset (option); **intratympanic steroid salvage recommended for incomplete recovery at 2–6 weeks**; hyperbaric oxygen + steroids option within 2 weeks (initial) or 1 month (salvage); do not routinely order CT/labs, antivirals, vasodilators. **Grade: Moderate (steroids), strong guideline recommendation (salvage).**
- Tinnitus accompanying SSNHL: complete remission ≈ 44% at 3 months overall; 65% with mild loss vs. 23% with severe loss (*Otol Neurotol* 2016 cohort).
- Acute tinnitus without hearing loss: German S3 guideline (Mazurek B et al. 2022, *HNO* 70:795-827, doi:10.1007/s00106-022-01207-4) defers to the sudden-hearing-loss guideline; no evidence for steroids without hearing loss. Wallhäusser-Franke E et al. 2017, *Front Neurol* 8:605: acute-tinnitus cohort, complete remission 11% by month 6; psychological distress early predicts chronic disability; authors argue for early psychological intervention. **No RCT shows early CBT prevents chronification (Grade: very low).** AM-101 (acute inner-ear tinnitus) phase 3 trials failed.
- **App "acute pathway":** (1) triage questions on day 0: sudden/unilateral hearing drop, aural fullness, vertigo, pulsatile tinnitus, head trauma, neurological symptoms → "see ENT/urgent care within 24–72 h; steroids are time-sensitive"; (2) hearing self-check; (3) hearing protection education (noise ≥ 85 dBA; concerts; avoid further ototoxic exposure); (4) *avoid silence* (sound enrichment) and avoid earplug overuse; (5) brief psychoeducation and reassurance ("most people's tinnitus becomes less noticeable"); (6) start light CBT modules 1–3 + sleep protection; (7) re-assess at 4 and 12 weeks; if persistent and bothersome at 12 weeks → full chronic programme. Do not claim prevention of chronic tinnitus.

---

## 11. Outcome measures and MCIDs for tracking

| Instrument | Scale | MCID / responder threshold | Source |
|---|---|---|---|
| **TFI** (primary) | 0–100 | **13 points** (anchor+distribution; Meikle MB et al. 2012, *Ear Hear* 33:153-176); 14 (Fackrell K et al. 2022, *Ear Hear*, UK clinical sample); **9 (7.3–9.4)** at 12 weeks (Engelke M et al. 2025, *Otolaryngol Head Neck Surg*, n=359 UNITI data; larger change needed at higher baseline and longer intervals); reliable change ≈ 20–23 (Beukes) | Use ≥13 = responder; ≥9 = "improving"; ≥20 = "large response" |
| **THI** | 0–100 | 7 (Zeman F et al. 2011); **11 (7.8–12)** (Engelke 2025, n=364); 20 points = one severity grade | Secondary |
| Tinnitus Questionnaire (TQ) | 0–84 | ≈ 5–12 (Adamchic 2012; scoping review 2023 PMC10671865 notes wide variation) | Optional |
| Loudness VAS/NRS | 0–10 / 0–100 | ≈ 10–15 mm; low reliability; do not use as primary | Weekly momentary rating |
| Minimum masking level | dB | MCID derived 2024 (*JSLHR* 67, doi:10.1044/2024_JSLHR-24-00374; verify value) | Phenotyping only |
| ISI | 0–28 | 6–8 points (Morin 2011: ≥8 = treatment response); ISI < 8 remission | Sleep track |
| PHQ-9 / GAD-7 | 0–27 / 0–21 | 5 / 4 points | Safety & mood |
| Hyperacusis Questionnaire (Khalfa) | 0–42 | ≥28 = hyperacusis; MCID not established | Hyperacusis track |
| Neck Bournemouth Questionnaire | 0–70 | 13 points (Bolton 2004) | Somatosensory |
| Tinnitus acceptance (TAQ), self-efficacy | — | — | Process measures |

Measurement schedule: TFI + ISI + PHQ-9 + GAD-7 at baseline, week 4, week 8, week 12, then monthly to 12 months; weekly 1-item loudness/annoyance NRS; daily 10-s check-in during active phases.

---

## 12. Personalised programme generator

### 12.1 Assessment inputs → profile flags

| Input | Flag | Threshold |
|---|---|---|
| TFI (or THI) | `severity` | TFI <25 mild; 25–50 moderate; >50 severe (THI: ≤16 slight, 18–36 mild, 38–56 moderate, 58–76 severe, ≥78 catastrophic) |
| Onset | `acute` vs `chronic` | <3 months = acute pathway (§10) |
| Red-flag screen | `urgent_referral` | sudden unilateral loss, pulsatile, neuro signs, otalgia/discharge, head trauma → block programme start until seen |
| Hearing self-check / self-report | `hearing_loss` | failed screen or HHIA-S ≥10 or "difficulty following conversations" |
| Khalfa HQ / sound-tolerance items | `hyperacusis` | HQ ≥28 or LDL self-report of discomfort to everyday sounds |
| Misophonia screen | `misophonia` | positive → exclude from sound-exposure track; psych route |
| ISI | `insomnia` | ISI ≥10 (≥15 = clinical) |
| PHQ-9 / GAD-7 / item 9 | `mood`, `anxiety`, `risk` | PHQ-9 ≥10 or GAD-7 ≥10 → mood emphasis; PHQ-9 ≥20 or item 9 >0 → safety protocol + clinician referral (programme may continue in parallel) |
| Somatic screen (Delphi criteria + manoeuvre test) | `somatosensory` (cervical / tmd) | ≥1 modulating manoeuvre + neck/jaw symptoms |
| Pitch/loudness match (in-app) | `tonal_≤8kHz`, `loudness_match_dBSL` | reliable pitch (test-retest within ½ octave across 3 runs) |
| Residual inhibition test | `RI_positive` | ≥50% loudness reduction for ≥10 s after 60 s matched noise |
| Preference questionnaire | `prefers_act` / `prefers_mindfulness` / `prefers_sound` | user choice |
| Capacity | `time_budget` (15 / 30 / 45 min/day), `guided` (coach available?) | |

### 12.2 Tracks (building blocks)

| Track | Who | Dose | Duration | Evidence |
|---|---|---|---|---|
| **A. Core CBT** (21 modules, §1.2) | everyone chronic | 2–3 modules/week; 15–30 min/day incl. 10–15 min relaxation ×2 | 8 weeks + 4 weeks consolidation | Moderate |
| **A′. ACT variant** | `prefers_act` or CBT non-response | same | 8 weeks | Moderate |
| **B. Mindfulness (MBCT-lite)** | `prefers_mindfulness`, or step-up at week 8 | 15–30 min/day (body scan, breathing space, "allowing") | 8 weeks | Moderate |
| **C. Sound enrichment** | everyone (default on); emphasised if `RI_positive`, `prefers_sound`, `insomnia` | below mixing point; 2–8 h/day; nightly | 12 weeks, taper | Low (adjunct) |
| **D. CBT-I** | `insomnia` | 6 weekly modules + daily sleep diary | 6 weeks (start week 2) | Moderate |
| **E. Hyperacusis graded exposure** | `hyperacusis`, not `misophonia` | pink noise 2 × 30–60 min/day, +2–3 dB/week; earplug-weaning plan; exposure hierarchy | 8–12 weeks | Low–Moderate |
| **F. Somatosensory exercises** | `somatosensory` (cervical/TMD) | 10–15 min/day; posture prompts | 6–9 weeks | Low–Moderate |
| **G. Hearing pathway** | `hearing_loss` | referral task in week 1; hearing-tactics module; HA-use logging | ongoing | Moderate |
| **H. Mood/anxiety emphasis** | `mood`/`anxiety` | behavioural activation + extra cognitive sessions; clinician referral if severe | 8 weeks | Moderate (CBT improves depression in Cochrane) |
| **I. Acute pathway** | `acute` | triage → protect → enrich → light CBT 1–3 → reassess | 12 weeks | Very low–Moderate (component-wise) |
| **J. Maintenance** | all completers | monthly check-ins, booster module, TFI quarterly | months 4–12 | Low (long-term iCBT data) |
| **K. Experimental (opt-in, labelled)** | `tonal_≤8kHz` with reliable match | notched music 1–2 h/day | 12 weeks | Low |

### 12.3 Composition rules (deterministic)

1. **Gate:** `urgent_referral` → show referral, allow only education/sound; recheck after medical review. `acute` → Track I.
2. **Everyone chronic:** A (or A′) + C + J. Time budget allocates: 15 min/day → A only (1 module/wk is too slow; use 2/wk and 5-min relaxations); 30 min → A + one add-on; 45 min → A + up to two add-ons.
3. **Add-on priority (if more flags than capacity):** `risk/mood severe` (H + referral) > `insomnia` (D) > `hyperacusis` (E) > `somatosensory` (F) > `hearing_loss` (G is a referral task, always included, low time cost) > K.
4. **Sound track tailoring:** `RI_positive` or `prefers_sound` → default 4–8 h/day target with reminders; `hyperacusis` → sound track replaced by E (pink noise, graded); `misophonia` → no sound exposure prescriptions, add psychoeducation + referral.
5. **Severity scaling:** severe (TFI >50 or THI ≥58) → recommend guided mode (coach messages weekly), start relaxation + exposure earlier (week 3), PHQ-9 ≥15 → clinician. Mild (TFI <25) → "light" 6-week version (modules 1–8, relapse prevention), sound optional.
6. **Comorbidity ordering:** insomnia track starts week 2 (after psychoeducation), hyperacusis exposure starts week 2, somatosensory starts week 1 (independent), mindfulness not concurrent with CBT in weeks 1–8 (cognitive load) unless `prefers_mindfulness` replaces A.

### 12.4 Example 12-week schedule (chronic, moderate TFI 42, insomnia ISI 16, RI-positive, no hyperacusis, 30 min/day)

| Week | Core CBT (A) | Sleep (D) | Sound (C) | Measures |
|---|---|---|---|---|
| 1 | Welcome, psychoeducation, PMR 10–15 min ×2 | — | Set mixing-point level; use in quiet; night timer | Baseline TFI, ISI, PHQ-9, GAD-7, pitch/RI |
| 2 | Release-only relaxation; sound-enrichment module; thought diary | Sleep diary + hygiene + bedtime sound | 2 h/day target | weekly NRS |
| 3 | Cue-controlled breathing; sleep guidelines | Stimulus control; fixed rise time | 2–4 h/day | — |
| 4 | Identifying negative thoughts; positive imagery; differential relaxation | Sleep compression (TIB = TST + 30 min) | 4 h/day | **TFI, ISI (week-4 check)** |
| 5 | Cognitive restructuring; rapid relaxation | Titrate TIB +15 min if SE ≥85% | 4 h/day | — |
| 6 | Exposure to tinnitus (5→15 min focused listening); applied relaxation | Cognitive work on sleep beliefs | 4 h/day | — |
| 7 | Attention shifting; activity scheduling; reduce safety behaviours | Wind-down routine, worry time | 4 h/day | — |
| 8 | Relapse-prevention plan; toolbox | Sleep relapse plan | continue | **TFI, ISI, PHQ-9, GAD-7 (post-treatment)** |
| 9–10 | Consolidation: practise 3 chosen tools; optional ACT/mindfulness taster | maintain | taper to "as needed" | — |
| 11–12 | Booster: review thought records, exposure, plan triggers | — | as needed | **TFI week 12**; move to Track J |

### 12.5 Adaptation rules (outcome-driven)

| Checkpoint | Rule | Action |
|---|---|---|
| Daily/weekly | Adherence < 50% of planned sessions for 2 weeks | Reduce dose (1 module/wk; 5-min relaxations), send motivational/problem-solving module, offer coach contact |
| Week 4 | TFI change < 7 **and** weekly annoyance NRS not improving | "Early non-response": switch relaxation style (PMR → breathing/imagery), bring exposure forward, add guided support; if `prefers_act` not set, offer ACT-flavoured modules. **Do not yet change track** (CBT effects accrue to week 8). |
| Week 4 | TFI worsened ≥ 13 or PHQ-9 ≥ 20 or item 9 > 0 | Safety protocol; clinician referral; continue only sound/relaxation until reviewed |
| Week 8 | TFI change ≥ 13 (responder) | Consolidate; taper sound; maintenance Track J |
| Week 8 | TFI change 9–12 ("improving") | Extend core track 4 weeks (weeks 9–12 full modules), keep add-ons |
| Week 8 | TFI change < 9 | **Change strategy:** (i) if CBT was unguided → guided; (ii) switch model (CBT → ACT or MBCT); (iii) re-screen flags (missed hearing loss, hyperacusis, somatosensory, depression); (iv) recommend clinician-delivered CBT per NICE step-up; (v) discuss device options (hearing aids; bimodal neuromodulation for moderate–severe) |
| Week 8 (sleep) | ISI not reduced ≥ 6 | Verify sleep-restriction adherence; extend CBT-I 2–4 weeks; refer if ISI ≥ 15 persists |
| Week 8 (hyperacusis) | No increase in tolerated level after 6 weeks | Check earplug use/avoidance; add CBT exposure hierarchy; refer to audiology |
| Week 6 (somatosensory) | No TFI/pain change | Stop self-exercises; refer to physiotherapist/dentist |
| Any time | Loudness NRS rises > 3 points for > 1 week with sound use | Lower sound level; check for over-loud use; consider hyperacusis |
| Months 4–12 | TFI rises ≥ 13 from post-treatment | Trigger booster block (4 weeks: modules 4–8 condensed) |

### 12.6 Safety and claims constraints

- Output-level cap and in-app calibration; sleep timer; warn against earbuds at night for hyperacusis users.
- Self-harm screening (PHQ-9 item 9; AAO-HNSF 2026 adds a self-harm statement) with crisis resources.
- Explicit non-claims: not a replacement for medical evaluation; cannot deliver bimodal neuromodulation; notched music/40 Hz/RI tools are "experimental relief", not treatment; no prevention-of-chronicity claim for the acute pathway.
- Regulatory: if marketed as treating tinnitus distress with CBT, this is likely SaMD (EU MDR class IIa/DiGA; FDA 510(k)/De Novo); plan an RCT with a sham/attention control (the Wasano 2026 design is a good template) and TFI primary endpoint with 13-point responder analysis.

---

## 13. Key references (selected)

- Fuller T, Cima R, Langguth B, et al. Cognitive behavioural therapy for tinnitus. *Cochrane Database Syst Rev* 2020;1:CD012614. doi:10.1002/14651858.CD012614.pub2
- Beukes EW, Baguley DM, Allen PM, Manchaiah V, Andersson G. Audiologist-guided internet-based CBT for adults with tinnitus in the UK: RCT. *Ear Hear* 2018;39:423-433.
- Beukes EW, Andersson G, Allen PM, Manchaiah V, Baguley DM. Guided internet-based CBT vs face-to-face clinical care for tinnitus. *JAMA Otolaryngol Head Neck Surg* 2018;144:1126-1133. doi:10.1001/jamaoto.2018.2238
- Beukes EW, Andersson G, Fagelson MA, Manchaiah V. Internet-based audiologist-guided CBT for tinnitus: RCT. *J Med Internet Res* 2022;24:e27584. doi:10.2196/27584
- Hesser H, Gustafsson T, Lundén C, et al. RCT of internet-delivered CBT and ACT for tinnitus. *J Consult Clin Psychol* 2012;80:649-661.
- Westin VZ, Schulin M, Hesser H, et al. ACT versus TRT for tinnitus: RCT. *Behav Res Ther* 2011;49:737-747.
- McKenna L, Marks EM, Hallsworth CA, Schaette R. MBCT as a treatment for chronic tinnitus: RCT. *Psychother Psychosom* 2017;86:351-361. doi:10.1159/000478267
- Sereda M, Xia J, El Refaie A, Hall DA, Hoare DJ. Sound therapy (amplification devices and/or sound generators) for tinnitus. *Cochrane Database Syst Rev* 2018;12:CD013094.
- Scherer RW, Formby C; TRTT Group. Effect of TRT vs standard of care on tinnitus-related QoL: RCT. *JAMA Otolaryngol Head Neck Surg* 2019;145:597-608. doi:10.1001/jamaoto.2019.0821
- Schoisswohl S, et al. Single versus combination treatment in tinnitus (UNITI). *Nat Commun* 2025. doi:10.1038/s41467-025-66165-1
- Efficacy of sound therapy in chronic tinnitus with mild hearing loss: multicentre double-blind placebo-controlled RCT. *Sci Rep* 2026. doi:10.1038/s41598-026-67678-5
- Okamoto H, Stracke H, Stoll W, Pantev C. *PNAS* 2010;107:1207-1210. Stein A, et al. *BMC Neurol* 2016;16:38. Tavanai E, et al. *Eur Arch Otorhinolaryngol* 2024;281:5033-5049. Scarpa A, et al. *Am J Otolaryngol* 2024.
- Hoare DJ, et al. Systematic evaluation of the T30 neurostimulator (acoustic CR): double-blind RCT with open-label extension. *Brain Sci* 2022 (PMC8946033).
- Conlon B, et al. *Sci Transl Med* 2020;12:eabb2830. Conlon B, et al. *Sci Rep* 2022;12:10845. Boedts M, et al. Combining sound with tongue stimulation for tinnitus: multi-site single-arm controlled pivotal trial (TENT-A3). *Nat Commun* 2024;15:6806. doi:10.1038/s41467-024-50473-z. FDA De Novo DEN210033 (6 Mar 2023).
- Marks KL, et al. *Sci Transl Med* 2018;10:eaal3175. Jones GR, Martel DT, Riffle TL, et al. Reversing synchronized brain circuits using targeted auditory-somatosensory stimulation: RCT. *JAMA Netw Open* 2023;6:e2315914. doi:10.1001/jamanetworkopen.2023.15914
- Michiels S, et al. Does multi-modal cervical physical therapy improve tinnitus in cervicogenic somatic tinnitus? *Man Ther* 2016;26:125-131. Michiels S, et al. Prognostic indicators. *Musculoskelet Sci Pract* 2017;29:33-37. van der Wal A, et al. *J Clin Med* 2020;9:705. doi:10.3390/jcm9030705
- Marks E, Hallsworth C, Vogt F, Klein H, McKenna L. CBT-I for tinnitus-related insomnia: RCT. *Cogn Behav Ther* 2023;52:91-109. doi:10.1080/16506073.2022.2084155
- Formby C, Hawley ML, Sherlock LP, et al. Sound therapy intervention to expand the auditory dynamic range: RCT. *Semin Hear* 2015;36:77-110. Jüris L, et al. CBT for hyperacusis: RCT. *Behav Res Ther* 2014;54:30-37.
- Swedo SE, et al. Consensus definition of misophonia. *Front Neurosci* 2022;16:841816. Jager IJ, et al. CBT for misophonia: RCT. *Depress Anxiety* 2021;38:708-718.
- Wegner I, et al. Betahistine for tinnitus. *Cochrane* 2018;CD013093. Sereda M, et al. Ginkgo biloba for tinnitus. *Cochrane* 2022;CD013514. Person OC, et al. Zinc. *Cochrane* 2016;CD009832. Hurtuk A, et al. Melatonin: can it stop the ringing? *Ann Otol Rhinol Laryngol* 2011;120:433-440. Nocini R, et al. *Acta Biomed* 2024;95:e2024006.
- Kitsis et al. Neuromodulation for subjective tinnitus: SR/MA of RCTs. *Laryngoscope* 2026. doi:10.1002/lary.70633. Tyler R, et al. VNS paired with tones: pilot RCT. *Sci Rep* 2017;7:11960. Argstatter H, et al. *J Psychosom Res* 2015;78:285-292.
- Walter U, et al. Smartphone-based CBT for chronic tinnitus (Kalmeda): RCT. *PLOS Digit Health* 2023;2:e0000337; 9-month follow-up *JMIR* 2025;27:e59575. Wasano K, et al. Mobile application as a digital therapeutic for chronic tinnitus: RCT. *JAMA Otolaryngol Head Neck Surg* 2026. doi:10.1001/jamaoto.2026.0858. Oto RCT: *Speech Lang Hear* 2025. doi:10.1080/2050571X.2025.2526235. Tinnibot RCT 2026 (PMC13097093). Searchfield GD, Sanders M. *Front Neurol* 2022;13:958730. Goshtasbi K, et al. *Ann Otol Rhinol Laryngol* 2025. doi:10.1177/00034894241297594
- Chandrasekhar SS, et al. Clinical practice guideline: sudden hearing loss (update). *Otolaryngol Head Neck Surg* 2019;161(1S):S1-S45. Wallhäusser-Franke E, et al. *Front Neurol* 2017;8:605.
- Tunkel DE, et al. Clinical practice guideline: tinnitus. *Otolaryngol Head Neck Surg* 2014;151(2S):S1-S40. AAO-HNSF. Clinical practice guideline: tinnitus update. *Otolaryngol Head Neck Surg* 2026. doi:10.1002/ohn.70417 (published 12 Oct 2026). NICE NG155 Tinnitus: assessment and management (2020). Cima RFF, et al. European multidisciplinary tinnitus guideline. *HNO* 2019;67(Suppl 1):10-42. Mazurek B, et al. S3 guideline chronic tinnitus. *HNO* 2022;70:795-827. VA/DoD Clinical Practice Guideline for Tinnitus, v1.0, July 2024.
- Meikle MB, et al. The Tinnitus Functional Index. *Ear Hear* 2012;33:153-176. Fackrell K, et al. *Ear Hear* 2022. Engelke M, et al. Estimation of MCID for THI and TFI. *Otolaryngol Head Neck Surg* 2025 (PMC12207346). Zeman F, et al. THI MCID. *Otolaryngol Head Neck Surg* 2011;145:282-287.
