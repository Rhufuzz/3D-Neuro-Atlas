/**
 * Concrete "do this, watch for that" instructions for each simulation.
 * Keys: `micro:<section>`, `methods:<section>`, `module:<id>`.
 * Keep steps tied to controls that actually exist in the sim.
 */
export const TRY_THIS: Record<string, string[]> = {
  'micro:zoom': [
    'Drag the scale slider from whole brain down to a single ion channel, pausing at each scale.',
    'At each pause, name one fact you learned at that scale this week (e.g. hippocampus → systems level; ion channel → Na⁺ gating).',
  ],
  'micro:cells': [
    'Open every cell type once and write its one-line job (astrocyte = feed + clean, oligodendrocyte = myelin, microglia = immune).',
    'Predict which cell type multiple sclerosis attacks before you check the clinical note.',
  ],
  'micro:action-potential': [
    'Set Pulse amplitude to 5 µA/cm² — the membrane wobbles but never spikes. That is subthreshold.',
    'Raise the amplitude step by step until the first all-or-none spike appears; remember that value — it is the threshold. Then raise it further and count the spikes: intensity codes firing RATE, not spike size.',
    'Tick "Second pulse", set Inter-pulse interval to 2 ms — pulse 2 fails (absolute refractory). Widen to ~15 ms — it fires again.',
    'Tick TTX: no spike at any amplitude, because voltage-gated Na⁺ channels are blocked — the same mechanism local anaesthetics use.',
  ],
  'micro:conduction': [
    'Race continuous vs saltatory conduction over the same distance and note the speed difference.',
    'Then demyelinate the axon and watch the signal weaken, stutter or die — the multiple sclerosis scenario.',
  ],
  'micro:synapse': [
    'Pick serotonin and apply an SSRI: reuptake is blocked, so transmitter lingers longer in the cleft.',
    'Switch to dopamine and compare L-DOPA (more transmitter made) with cocaine/amphetamine (reuptake/release) — note WHERE in the cleft each drug acts.',
    'Before you apply each drug, predict whether firing goes up or down, then check yourself.',
  ],
  'micro:ltp': [
    'Step through in order, and before revealing each step, say out loud what must change next.',
    'At the Mg²⁺-block step, answer: what removes the block? (Depolarisation from strong high-frequency input.)',
    'Finish by tracing the full loop: Ca²⁺ → CaMKII → more AMPA receptors → bigger future response.',
  ],
  'methods:compare': [
    'Hide and show axes on the radar and rank the methods by spatial, then by temporal resolution.',
    'Answer with the chart: which method tracks a seizure spread millisecond-by-millisecond (EEG), and which one localises it to millimetres (fMRI)?',
    'Decide which method you would use to causally test whether the FFA is necessary for face recognition — and why the radar says fMRI alone cannot answer that.',
  ],
  'methods:in-3d': [
    'Load one BOLD paradigm overlay and watch where activity appears; then load a lesion case covering a similar area.',
    'Contrast the two: the blob shows involvement, the lesion shows necessity.',
    'Spin the brain and try to name each highlighted structure before clicking it.',
  ],
  'methods:eeg': [
    'Click electrodes from frontal (F) to occipital (O) and note which cortex sits beneath each.',
    'Switch the rhythm band from beta to alpha to theta: watch the frequency drop as the band slows.',
    'Switch to the sleep stages and find which stage dominates the first third of the night (N3 slow waves).',
  ],
  'methods:erp': [
    'Step through the sentence pairs and find the N400 — the negative peak ~400 ms after a semantic oddity.',
    'Then find the P600 ~600 ms after the syntactic anomaly, and note it is a positivity, not a negativity.',
    'Explain in one sentence why language researchers average many trials to see these peaks at all.',
  ],
  'methods:single-cell': [
    'Rotate the bar in 15° steps and watch the firing rate peak at this cell\u2019s preferred orientation.',
    'Shrink the bar while keeping the best orientation: the response drops — orientation alone is not enough, the bar must fill the receptive field.',
    'Predict what a complex cell would do differently if the bar shifted position (answer: barely changes).',
  ],
  'methods:rt': [
    'Run all Donders blocks in order (simple → choice → go/no-go) and subtract your mean RTs — each added decision stage has a cost.',
    'Then run the Posner task and compare your valid- vs invalid-cue RTs; the difference is the cueing benefit.',
    'Write down one source of noise that makes single trials useless and averaging necessary.',
  ],
  'module:m1': [
    'Scrub the phrenology→networks timeline and open two landmark links — notice how each new method answered a question the previous one could not.',
    'For each level of analysis, say what a memory explanation at that level looks like (molecules → LTP, systems → hippocampus, behaviour → recall).',
    'Finish with the threshold hunt: in the Micro-Scale Lab, find the smallest pulse amplitude that still fires a spike.',
  ],
  'module:m2': [
    'In the B/13 demo, cover the context with your hand and see that the centre glyph is physically identical in every condition.',
    'Toggle the Thatcher illusion upright/inverted and explain why the grotesque features vanish upside-down (configural processing switches off).',
    'Run mental rotation trials at small and large angles and watch your own RT grow with angular disparity — the signature of an analogue process.',
    'In the agnosia explorer, compare prosopagnosia with visual object agnosia: a double dissociation between face and object machinery.',
  ],
  'module:m3': [
    'For each illusion (Müller-Lyer, Ponzo, Kanizsa, lightness), state the brain\u2019s mis-applied assumption BEFORE reading the explanation.',
    'Grow the light spot over the ON-centre receptive field: peak firing when the spot fills the centre but not the surround; uniform full-field light silences it.',
    'Walk the retino-geniculo-striate chain and trace the same pathway in 3D in the atlas (deep links from the guided path).',
  ],
  'module:m4': [
    'Switch the basal-ganglia model to the Parkinsonian state and watch the indirect pathway over-inhibit the thalamus; then toggle L-DOPA and DBS to rebalance it.',
    'In the neglect sim, bisect the line and see the rightward bias; then try cancellation and note what gets missed on the left.',
    'Slide the sarcomere through its length range: peak force near resting length, dropping at both extremes (the length–tension curve).',
  ],
  'module:m5': [
    'In the aphasia classifier set fluent + good comprehension + poor repetition → conduction aphasia (arcuate fasciculus), then contrast with nonfluent + good comprehension + poor repetition (Broca\u2019s).',
    'Run the word-superiority flash task and explain why a letter is identified better inside a word than alone.',
    'Finish in the Methods Lab: find the N400 for semantic anomalies and the P600 for syntactic ones.',
  ],
  'module:m6': [
    'Toggle H.M.\u2019s profile in the memory-systems map and check which systems survive (procedural, priming) and which are lost (episodic, semantic).',
    'Take the DRM test: did you "remember" the unseen lure? That is your semantic network filling gaps.',
    'In the reward-prediction raster, set expectation high with no reward and find the negative dip at reward time — that is the dopamine error signal.',
    'Match contexts in the encoding-specificity demo (learn land → recall land vs water) and compare recall.',
  ],
  'module:m7': [
    'Step the HPA cascade in the acute condition, then toggle chronic stress and note the raised baseline and blunted recovery.',
    'In the reconsolidation sim, infuse the protein-synthesis inhibitor WITHOUT reactivation (memory survives) and WITH reactivation (memory erased) — reactivation makes memory labile again.',
    'Play the Iowa Gambling Task to 50 cards: notice you start avoiding the bad decks before you can explain why — somatic markers lead insight.',
  ],
  'module:m8': [
    'Scrub the hypnogram through the night: N3 dominates early cycles, REM grows longer toward morning.',
    'In the flip-flop model, switch to sleep-deprived and watch Process S push the switch; find the moment orexin would fight to keep you awake.',
    'In the SCN clock, toggle screen light in the late evening and watch melatonin release shift later — the mechanism behind "just one more episode".',
  ],
};
