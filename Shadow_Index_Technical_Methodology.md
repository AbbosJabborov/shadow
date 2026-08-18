_Shadow Index Project — Technical Methodology_ 

_Working Paper v3_ 

# **A Deterministic Weight-of-Evidence Framework for Firm-Level Shadow Economy Risk, with Confidence Decoupled from Direction** 

## Shadow Index Project 

_·_ Working Paper v3 Prototype: synthetic demonstration data August 17, 2026 

## **Abstract** 

We describe a two-part system for flagging firm-level involvement in Uzbekistan’s shadow economy from a prototype dataset: a deterministic weight-of-evidence scorecard that converts seven firm-level forensic contradiction checks into a probability, a risk score, and—critically—a confidence figure computed independently of the probability’s direction; and a downstream largelanguage-model layer that turns the scorecard’s output into a plainlanguage case narrative without ever touching the arithmetic. The central methodological claim is narrow and falsifiable: probability answers _which way_ the evidence points, confidence answers _how much_ and _how decisive_ the evidence is, and conflating the two— which the system’s first implementation did—produces a number that looks precise but silently discards half of what the evidence actually says. We give the exact formulas, the calibration choices behind them, three fully traced worked examples against real code paths, and an explicit accounting of what in this pipeline is real mathematics versus illustrative demonstration data. 

**Keywords:** shadow economy; weight-of-evidence scorecard; tax compliance risk; forensic accounting signals; uncertainty quantification; large language models. 

## **1 The Problem with One Number** 

Every firm-level risk system eventually has to answer two questions that are easy to mistake for one: how likely is this firm to be involved in the shadow economy, and how sure are we? The first implementation of this system’s “AI Shadow Economy Analysis” card answered both with the same number, displayed twice—a 1–10 score derived from a probability, and that same probability shown again underneath the word _confidence_ . 

The failure mode is concrete. A clean firm with seven forensic checks all reading comfortably compliant would report a low probability (correctly) and, under the old design, a low “confidence” alongside it—as if having strong, complete evidence that a firm is _not_ involved somehow made the system less sure. Conversely, a firm with two signals that had barely tipped over their statutory threshold would report the same inflated confidence as a firm where every check was decisively, unambiguously flagged. Confidence, in other words, was tracking the score’s magnitude, not the 

evidence’s quality. 

Section 5 gives the fix: confidence is computed from evidence _coverage_ and _decisiveness_ —quantities that do not know or care which direction the probability points. Sections 3–4 first establish what the evidence actually is and how it becomes a probability at all. 

## **2 System Architecture** 

The pipeline has five parts. Four are deterministic arithmetic; the fifth is a schema-constrained language model that is structurally prevented from touching a single number the other four produce. Figure 1 gives the layout. 

Layers B and C are not sequential stages—they are two outputs of one pass over Layer A’s signals (Sections 4–5). Layer D reaches the narrative layer through a deliberately secondary path: the system prompt (Section 7) explicitly forbids treating regional macro context as evidence against a specific firm. 

This specification differs from an earlier draft for this project in one deliberate way. That draft named a positive-unlabeled (PU) learning classifier, Manski partialidentification bounds, and a Fay–Herriot small-area estimator as parts of the pipeline. None of those are implemented. This paper documents what runs today and files the remainder under Roadmap (Section 9) rather than presenting aspiration as architecture. 

## **3 Layer A — Forensic Contradiction Signals** 

Every signal in Layer A tests a firm’s own filings against each other, or against a second, independently sourced record of the same event—never against a peer average. A firm’s declared revenue either matches its point-of-sale settlement volume or it does not; that is a same-firm arithmetic fact, not a statistical inference. This is what makes the signals usable as hard evidence rather than circumstantial pattern-matching. The mechanism behind the invoice-chain check in particular is the third-party paper trail documented by Pomeranz [6]; the wage-bunching check follows the threshold-bunching logic of Kleven and Waseem [3]. 

Table 1 lists the seven checks as implemented in forensics.js. 

1 

_Shadow Index Project — Technical Methodology_ 

_Working Paper v3_ 



<!-- Start of picture text -->
Business record businesses.js<br>firm profile and declared filings<br>Layer A — Forensic Contradiction Rules forensics.js<br>seven same-document consistency checks: wage bunching · invoice chain · POS-vs-revenue<br>night/day power · persistent losses · two customs checks<br>seven raw signal values<br>Layers B and C — Weight-of-Evidence Scorecard shadow-score.js<br>one pass over the same seven signals<br>logit( P 0) + ∑ i wizi → probability, score coverage × decisiveness → confidence (independent)<br>score  ·  confidence  ·  evidence[]<br>primary evidence path<br>Layer E — Narrative Synthesis gemini.js context onlysecondary Layer D — Regional Context<br>Gemini 3.6 Flash, temperature 0.6, JSON-schema mimic-data.js<br>constrained; read-only, no scoring authority 11 causes + 6 indicators, illustrative<br>Structured JSON report<br>report interface + PDF export<br><!-- End of picture text -->

**Figure 1:** Pipeline architecture. Layers B and C are two outputs of a single pass over Layer A’s signals, not sequential stages. Layer D (dashed) reaches the narrative layer through a deliberately secondary path; the system prompt forbids treating regional macro context as evidence against a specific firm. 

“Sector-gated” means the two customs checks apply only to the nine trade-exposed sectors (wholesale and retail, logistics, manufacturing, construction, textiles, mining, food processing, agriculture, automotive trade). A professionalservices or software firm has no import declarations to check against, and the scorecard treats that as _missing_ evidence rather than as a clean result. This distinction turns out to matter a great deal for confidence (Section 5). 

Each signal’s flag boolean is the single source of truth for “contradiction found” throughout the system. The user interface’s forensic-signals card and the scorecard’s probability computation both read the same condition, so the two can never disagree about whether a line was crossed. 

independence assumption and pass through a logistic link. 

### **4.1 Peer-cohort prior** 

Scoring starts from a prior tied to the firm’s baseline sector/region risk tier, not a single flat rate for every firm (Table 2). This is the direct fix for a detection-density bias—an unadjusted administrative index tends to flag whichever districts have the most digital paper trail to check, not the most actual informality—because it means a Critical-tier firm with clean signals settles back near its peers instead of being auto-flagged by tier alone. 

## **4 Layer B — The Scorecard** 

The scoring method is a weight-of-evidence logistic scorecard—the same family of model used in credit-risk underwriting [8] and recommended by the OECD for tax administrations before enough audit-verified outcomes exist to fit a full regression [5]. Each applicable signal contributes a log-odds term sized by how far past its statutory threshold the firm sits; the terms sum under a conditional- 

### **4.2 Threshold, scale, and evidentiary weight** 

Each signal has a _threshold_ (exactly the flag line of Table 1), a _scale_ (how far past that line counts as one full unit of evidence), and a _weight_ (evidentiary strength—higher for same-document contradictions, lower for peer-relative patterns that have innocent explanations on their own). Table 3 gives the values. 

2 

_Shadow Index Project — Technical Methodology_ 

_Working Paper v3_ 

**Table 1:** The seven forensic contradiction signals (forensics.js). Each tests a firm’s own filings against each other or against an independently sourced record of the same event. 

|**Signal**|**Tests**|**Flag condition**|**Sector-gated**|
|---|---|---|---|
|Wage bunching|share of staff paid exactly minimum wage (1,050,000 UZS/mo)|share_>_30%|no|
|VAT invoice chain|declared sale vs. counterparty’s declared purchase, same transaction|gap_>_15%|no|
|Night/day electricity|off-hours vs. daytime industrial power draw ratio|ratio_>_0.55|no|
|POS vs. declared revenue|card and fscal-receipt volume vs. declared revenue|ratio_>_1.4_×_|no|
|Persistent losses|consecutive loss-making years while still operating|_≥_3 yrs, status Active|no|
|Mirror trade statistics|customs-declared import value vs. UN Comtrade partner-country export|gap_>_20%|yes|
|Customs value vs. COGS|customs-declared import value vs. declared cost of goods sold|gap_>_20%|yes|



**Table 2:** Prior probability by baseline risk tier. 

|**Tier**|**Prior**_P_0|logit(_P_0)|
|---|---|---|
|Low|4%|_−_3_._178|
|Moderate|10%|_−_2_._197|
|Elevated|20%|_−_1_._386|
|Critical|33%|_−_0_._708|



**Table 3:** Scorecard parameters. Weight encodes evidentiary strength: higher for same-document contradictions, lower for patterns with plausible innocent explanations. 

|**Signal**|**Threshold**|**Scale**|**Weight**|
|---|---|---|---|
|POS vs. revenue|1.40|0.40|1.1|
|VAT invoice chain|0.15|0.15|0.9|
|Customs vs. COGS|0.20|0.20|0.8|
|Mirror trade|0.20|0.20|0.7|
|Wage bunching|0.30|0.20|0.5|
|Night/day electricity|0.55|0.20|0.5|
|Persistent losses|3 yrs|2 yrs|0.4|



### **4.3 The formula** 

For each applicable signal _i_ with raw value _ri_ , threshold _ti_ , scale _si_ , and weight _wi_ : 











where _P_ 0 is the tier prior of Table 2 and _σ_ ( _·_ ) is the logistic function. 

A signal at or below its threshold contributes exactly zero. “No evidence of a problem” is not the same as “evidence there is not one,” and the formula does not let a clean reading manufacture negative suspicion. The cap at _z_ = 3 is a conservatism device: no single signal, however extreme, can alone drive the probability to certainty. Section 4.4 

**Table 4:** Full contribution trace, Termiz Chegara Logistika (Critical baseline, all seven checks flagged). Live output of computeShadowProbability(). 

|**Signal**|**raw**|**excess**|_z_|_wz_|
|---|---|---|---|---|
|POS vs. revenue|3.31_×_|1.91|3.00<sup>†</sup>|3.300|
|VAT invoice chain|55%|0.40|2.67|2.400|
|Customs vs. COGS|49%|0.29|1.45|1.160|
|Wage bunching|75.8%|0.46|2.29|1.145|
|Night/day electricity|91%|0.36|1.80|0.900|
|Mirror trade|45.1%|0.25|1.26|0.878|
|Persistent losses|6 yrs|3|1.50|0.600|
|**Total**||||**10.383**|



> †Raw _z_ would be 4.78; the cap at _z_ = 3 engages here (Section 4.3). 

shows it engaging. 

### **4.4 Worked example — full derivation** 

Termiz Chegara Logistika (Critical baseline; Logistics and Transport; status Active) trips all seven checks. Every term in Table 4 is the live output of computeShadowProbability(). 

Summing the contributions: 







## **5 Layer C — Confidence, Decoupled from Direction** 

Confidence answers a different question than probability: not _which way_ the evidence points, but how much evidence exists and how decisively it sits away from the line separating “flagged” from “clean.” It is built from two quantities, computed over the same signal loop as Section 4 but summed independently of the sign of _z_ . 

### **5.1 Coverage** 

Coverage is the fraction of the seven possible checks that were even applicable to this firm. A non-trade-exposed 

3 

_Shadow Index Project — Technical Methodology_ 

_Working Paper v3_ 

firm has no customs record to check and caps out at 5 _/_ 7; a firm under review has its persistent-losses check gated off entirely (Section 3), capping it at 6 _/_ 7. Fewer applicable checks means a narrower evidence base, independent of what the available checks say. 

### **5.2 Decisiveness** 

For every applicable signal, decisiveness is an _unsigned_ distance from the threshold. A value sitting exactly on the line is the weakest possible evidence regardless of which side it lands on; a value far from the line in either direction is strong evidence either way. The distance saturates through 1 _− e_<sup>_−x_</sup> so that a couple of extreme signals cannot alone manufacture near-certainty: 







The 70/30 split weights how-decisive over how-muchevidence: a firm with complete coverage but every value sitting exactly on its threshold line should not outrank a firm with slightly fewer applicable checks whose values are unambiguous. Confidence is clipped to [10 _,_ 96]—never absolute certainty, and never treated as fully uninformative even from a single decisive signal. 

### **5.3 Three cases, traced** 

The point of this section is empirical, not merely definitional. Table 5 shows three businesses run through the live scorecard. 

Read Toshkent and Termiz side by side: opposite ends of the probability scale, both landing at high confidence— because in both cases the evidence is complete and unambiguous, just pointing in different directions. Andijon is the case that actually stress-tests the design. A high score built partly out of two barely-tipped-over signals lands at meaningfully lower confidence than either of the decisive cases, despite outscoring Toshkent by seven points. A system that only ever showed probability would have no way to express that. 

### **5.4 Why not simply widen a confidence interval?** 

A Wilson or Wald interval around the probability would conflate the same two things this section separates. Interval width in a logistic model is driven mechanically by how far the log-odds sits from zero, which is exactly the “which way” quantity, not an independent “how much evidence” quantity. Coverage and decisiveness were chosen because they are computable directly from what is actually missing or ambiguous in the evidence, rather than derived algebraically from the probability itself. 

## **6 Layer D — Regional Macro Context** 

Independently of firm-level scoring, each of Uzbekistan’s 14 regions carries a MIMIC-inspired macro dataset: 11 “causes” (tax burden, labor-market rigidity, corruption control, unemployment, GDP per capita, and others) and 6 “indicators” (currency-demand ratio, large-denomination banknote share, electricity-consumption index, labor-force participation, real GDP growth) in the tradition of Schneider and Enste [7]. 

Every variable’s value is generated deterministically: linear interpolation between a literature-informed plausible range, positioned by the region’s existing shadow-index score, plus a small deterministic jitter keyed to the region and variable name so that figures are not perfectly collinear. This is worth stating with complete precision, because it is easy to imply more than it is. _No structural equation model is fitted._ There are no estimated factor loadings, no latentvariable regression, and nothing resembling the causal identification a real MIMIC study requires. The layer exists to give the narrative model (Section 7) regional texture to write about. It is a presentation dataset, not a statistical estimate, and it never contributes a term to the firm-level probability of Section 4. 

**Known limitation.** Breusch [1] documents precisely how MIMIC-style claims mislead when the “model” is asserted rather than fitted against real covariance structure. Layer D avoids that failure mode by not claiming to be a fitted model in the first place—but a reader skimming the interface without this paper could still mistake “MIMIC causes/indicators” for real regional statistics. The system prompt in Section 7 is the only enforcement mechanism preventing that conflation from reaching the narrative output. 

## **7 Layer E — Narrative Synthesis** 

A single Gemini 3.6 Flash call, constrained to a nine-field JSON schema (notes, executiveSummary, forensicFindings, causesAnalysis, indicatorsAnalysis, conclusion, estimatedIndex, confidencePercent, keyRiskFactors), turns the scorecard’s alreadycomputed numbers plus Layer D’s regional context into a case narrative. It has no scoring authority: every number in the preliminary screening block handed to the model—score, probability, confidence, per-signal evidence—was computed in Sections 4–5 before the model ever runs. 

The system instruction enforces the asymmetry Figure 1 draws visually, in three explicit rules: 

1. Forensic signals (Section 3) are direct evidence about this specific firm; a single flagged signal should anchor the assessment. 

4 

_Shadow Index Project — Technical Methodology_ 

_Working Paper v3_ 

**Table 5:** Three cases through the live scorecard. Toshkent and Termiz sit at opposite ends of the probability scale yet both report high confidence, because in both the evidence is complete and unambiguous. Andijon scores seven points above Toshkent yet reports lower confidence, because two of its flags sit within one point of their thresholds. 

|**Firm**|**Evidence state**|**Score**|_P_ **Conf.**|**Coverage **|**Note**|
|---|---|---|---|---|---|
|Toshkent Metall Profl|all 7 checks clean|2/10|10%<br>59%|86% (6/7)|losses gated (Under Review); avg. decisiveness 48%|
|Andijon Mashinasozlik Zavodi|fagged, but marginally|9/10|84%<br>54%|—|wage bunching 30.9% vs. 30%; COGS gap 20.3% vs. 20%|
|Termiz Chegara Logistika|all 7 decisively fagged|10/10|99%<br>89%|100% (7/7)|avg. decisiveness 84%|



2. MIMIC causes and indicators (Section 6) are regional context only; the model is instructed never to treat a macro variable alone as evidence against a specific firm. 

3. estimatedIndex must stay within 2 points of the scorecard’s own score unless a forensic signal is flagged, in which case the model may diverge further but must cite the specific signal driving the divergence. 

Every call is logged—console line, local .jsonl file, and an in-memory ring buffer surfaced at GET /api/usage—with prompt, thought, and completion token counts plus latency, so cost and behavior are auditable in aggregate rather than only per report. 

**Known limitation.** Temperature is set to 0.6, not 0, meaning the narrative can phrase the same underlying numbers differently across two runs on the same firm. An earlier draft specification called for temperature 0 plus a hard posthoc check that every numeric token in the output exists in the input payload (“numeric token invariance”). Neither is implemented yet; it is the most concrete and cheapest item in the roadmap (Section 9). 

   - traceable to the input payload—cheap, mechanical, and closing the one place this pipeline currently tolerates non-determinism. 

3. **Region-level partial identification.** Manski [4] bounds for aggregating firm-level lower bounds into a district total, rather than treating Layer D as free-standing context. 

4. **Replace Layer D’s interpolation** with a fitted structural model, or relabel it more conservatively than “MIMIC” until one exists. 

5. **Real administrative data feeds** —EHF e-invoicing, Humo/Uzcard POS settlement, ASKUE electricity telemetry, State Customs declarations—behind the statutory data-sharing agreements each requires, replacing the synthetic values in Table 6’s right-hand column one signal at a time. 

## **References** 

- [1] Breusch, T. (2005). The Canadian underground economy: an examination of Giles and Tedds. _Canadian Tax Journal_ . Critique of asserted-rather-than-fitted MIMIC claims (Section 6). 

## **8 Validation Status** 

What follows is an unusually direct accounting, by design: a scorecard whose limitations are asserted by the same document that built it is either honest or has not looked hard enough. Table 6 is the look. 

The single largest gap is the one every weight-ofevidence scorecard starts with: no audit-verified labels exist yet against which to check the thresholds and weights of Table 3. The positive-unlabeled learning correction of Elkan and Noto [2]—the standard way to recover true posterior probabilities once some positives are confirmed and the rest are merely unlabeled rather than known-negative—is the natural next step the moment labeled cases exist, and would replace Table 3’s hand-set weights with fitted ones. 

## **9 Roadmap** 

1. **Calibrate Table 3 on real outcomes.** Once auditconfirmed cases accumulate, fit weights via PUlearning [2] instead of literature-informed defaults. 

2. **Numeric-token invariance on Layer E output.** Reject and regenerate any narrative containing a figure not 

- [2] Elkan, C. and Noto, K. (2008). Learning classifiers from only positive and unlabeled data. _Proc. ACM SIGKDD_ . Posterior recovery from confirmed-positive-only labels (Sections 8–9). 

- [3] Kleven, H. and Waseem, M. (2013). Using notches to uncover optimization frictions and structural elasticities. _Quarterly Journal of Economics_ . Bunching at a threshold as a detectable behavioral signature (Section 3). 

- [4] Manski, C. (2003). _Partial Identification of Probability Distributions_ . Springer. Bounding rather than point-estimating under incomplete identification (Section 9). 

- [5] OECD (2017). _Compliance Risk Management: Developing Compliance Improvement Plans_ . Forum on Tax Administration. Expert-weighted scorecards as a defensible precalibration risk-ranking method (Sections 4, 8). 

- [6] Pomeranz, D. (2015). No taxation without information: deterrence and self-enforcement in the value added tax. _American Economic Review_ . Third-party paper-trail verification (Section 3). 

- [7] Schneider, F. and Enste, D. (2000). Shadow economies: size, causes, and consequences. _Journal of Economic Literature_ . 

5 

_Shadow Index Project — Technical Methodology_ 

_Working Paper v3_ 

**Table 6:** What is real versus illustrative, by layer. 

|**Layer**||**Mathematics**|**Underlying data**|
|---|---|---|---|
|A —|forensic signals|_real logic_: exact threshold comparisons|_synthetic_: deterministic per-business mock values|
|B —|probability, score|_real_: logistic scorecard, reproducible|weights/thresholds are literature-informed defaults, not ftted to audit outcomes|
|C —|confdence|_real_: coverage_×_decisiveness|0.3/0.7 split is a reasoned default, not empirically tuned|
|D —|regional context|_illustrative_: interpolation, not a ftted SEM|_synthetic_: generated, not sourced from GRP/LFS statistics|
|E —|narrative|schema-constrained generation|reasons over B–D’s outputs; temperature 0.6, no invariance check yet|



The MIMIC causes/indicators framework Layer D borrows its variable list from (Section 6). 

- [8] Siddiqi, N. (2012). _Credit Risk Scorecards: Developing and Implementing Intelligent Credit Scoring_ . Wiley. Weight-ofevidence scorecard construction (Section 4). 

## **A Reproducibility Map** 

Every formula in this paper is a direct transcription of running code, not a description of intended behavior. Any figure may be verified by opening the file it names. 

|**Section**|**File**|
|---|---|
|3 — forensic signals|src/lib/forensics.js|
|4–5 — scorecard, confdence|src/lib/shadow-score.js|
|6 — regional macro context|backend/lib/mimic-data.js|
|7 — prompt and schema|backend/lib/prompt.js|
||backend/lib/gemini.js|
|7 — usage logging|backend/lib/usage-logger.js|



Shadow Index — Working Paper v3. Synthetic demonstration data through- 

out. Deterministic scorecard live; audit-label calibration not yet run. 

6 

