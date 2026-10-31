/**
 * Guided learning paths per module: a playful step-by-step route through the material,
 * each step pointing at an interactive piece of the app. Written to TEACH intuitively
 * (metaphors first, jargon second), aligned with the course learning goals.
 */

export interface LearnStep {
  title: string;
  body: string;
  /** Optional interactive destination for this step. */
  link?: { href: string; label: string };
  /** Indices (0-based) into the module's learning goals this step covers. */
  goals?: number[];
}

export const LEARN: Record<string, LearnStep[]> = {
  m1: [
    {
      title: 'Why a brain? The big question',
      body: 'Everything you think, feel and decide happens in about 1.4 kg of tissue. The core promise of biological psychology: for every mental event there is a brain event. The historical journey — phrenology bumps → Broca’s patient “Tan” → earliest evidence that specific brain areas do specific jobs → fMRI — is really the story of learning how to catch the brain in the act. Start by seeing which method catches what.',
      link: { href: '/methods#compare', label: 'Compare methods on the radar chart →' },
      goals: [0],
    },
    {
      title: 'Levels of analysis: weather, not raindrops',
      body: '“Why did it rain?” can be answered with molecules, air pressure or a weather map — all correct, different levels. The brain works the same way: molecules → synapses → neurons → networks → systems → behaviour. Memory is not “in” one molecule; it emerges across levels. Whenever a topic feels like loose facts, ask: at which level am I looking?',
      goals: [1],
    },
    {
      title: 'Meet the neuron',
      body: 'A neuron is a cell built to carry a signal. Dendrites are the antennas (they listen), the soma integrates (it decides), the axon is the cable (it transmits), terminal buttons are the speakers (they pass the message on chemically). Glia are the supporting cast: astrocytes feed and clean, oligodendrocytes insulate, microglia are the immune cells. Explore them until you can name every part and its job.',
      link: { href: '/micro#cells', label: 'Open the cell explorer →' },
      goals: [4],
    },
    {
      title: 'The resting potential: a tiny battery',
      body: 'The membrane sits at about −70 mV — a charged battery waiting to discharge. Two forces fight over the ions: diffusion (like → dislike areas) and electrostatic pressure (like charges repel). The Na⁺/K⁺-pump hoards K⁺ inside and shoves Na⁺ out, so the inside stays negative. No battery, no signal — everything in this course rides on this voltage.',
      link: { href: '/micro#action-potential', label: 'See the membrane in the HH simulator →' },
      goals: [3],
    },
    {
      title: 'The action potential: dominoes with a reset',
      body: 'Cross threshold (~−55 mV) and voltage-gated Na⁺ channels snap open: the spike is all-or-none, like dominoes — strength of the stimulus does not change the spike, only how often they fire. Then Na⁺ channels inactivate (absolute refractory: nothing can happen) and K⁺ restores the balance. Challenge: in the simulator, set the pulse to 5 µA — nothing; 20 µA — spike. Find the threshold yourself.',
      link: { href: '/micro#action-potential', label: 'Find the threshold →' },
      goals: [3],
    },
    {
      title: 'Going fast: myelin and saltatory conduction',
      body: 'Unmyelinated axons conduct slowly, like walking. Myelin lets the signal jump node-to-node (saltatory = “leaping”) — fast, cheap and compact. That is why losing myelin (multiple sclerosis) slows or blocks signals. Compare both conduction types and note why the signal re-freshens at each node.',
      link: { href: '/micro#conduction', label: 'Compare conduction speeds →' },
      goals: [3],
    },
    {
      title: 'Checkpoint: prove it',
      body: 'You can now trace a signal from dendrite to terminal — and you know which method catches which brain event. Time to test it: the drill below asks exactly the questions the exam asks about these weeks.',
      goals: [2, 5],
    },
  ],
  m2: [
    {
      title: 'Bottom-up meets top-down',
      body: 'Perception is 90% detective work: the eyes deliver fragments (bottom-up), your brain supplies expectations (top-down). The same input can yield different percepts depending on what the brain expects — that is why context changes what you see. Look for the moment in the demo where identical input produces different perception.',
      link: { href: '/modules/m2', label: 'Try the top-down context demo →' },
      goals: [0],
    },
    {
      title: 'Imagery: perception in reverse?',
      body: 'Kosslyn’s image-scanning experiments: imagining walking across a map takes longer for greater distances — imagery keeps metric space. Pearson: imagery is weak top-down perception, sharing real visual machinery. If imagery recruits the visual cortex, imagining should be able to prime perception — it does.',
      link: { href: '/modules/m2', label: 'Run the image-scanning demo →' },
      goals: [1],
    },
    {
      title: 'Mental rotation: the analogue mind',
      body: 'Shepard & Metzler tilted two 3D shapes and measured judgement time: RT rises linearly with angular difference — as if the mind physically rotates the object. A linear function is the fingerprint of an analogue process. Play the rotation task and check your own RT–angle slope.',
      link: { href: '/modules/m2', label: 'Do the mental rotation task →' },
      goals: [2],
    },
    {
      title: 'Faces are special',
      body: 'The fusiform face area responds to faces, and faces are processed configurally — as a whole, not feature-by-feature. Proof: the Thatcher illusion — grotesque inverted features are invisible in an upside-down face, because configural processing switches off. Try the toggle until the effect clicks.',
      link: { href: '/modules/m2', label: 'Toggle the Thatcher illusion →' },
      goals: [3],
    },
    {
      title: 'When the face module breaks',
      body: 'Prosopagnosia: after (usually right) fusiform damage, patients cannot recognise faces — yet detect faces as faces, and recognise other objects fine. A double dissociation that proves faces get their own machinery. Now assemble the whole story: expectation, imagery, rotation, faces.',
      goals: [3],
    },
  ],
  m3: [
    {
      title: 'The eye-to-brain highway',
      body: 'Light → retina → ganglion cell axons leave the eye as the optic nerve. At the optic chiasm the world splits: left visual field → right brain, right field → left brain (that is why a right tract lesion blinds the LEFT field). Then → LGN of the thalamus (the relay) → V1. Follow the particles in the 3D pathway.',
      link: { href: '/atlas?s=v1', label: 'Trace the visual pathway in 3D →' },
      goals: [0],
    },
    {
      title: 'The retina already computes: edges',
      body: 'Retinal ganglion cells have centre-surround receptive fields (ON-centre: light in the middle excites, light around inhibits). The clever part: a uniform surface gives weak response, but an EDGE crossing the field gives a strong one — the retina is an edge detector before the brain ever sees anything. Grow the light spot in the simulator and watch excitation fight inhibition.',
      link: { href: '/modules/m3', label: 'Play with centre–surround fields →' },
      goals: [1],
    },
    {
      title: 'V1: bars, edges, motion',
      body: 'Hubel & Wiesel found V1 cells that respond to oriented bars (simple cells), position-independent orientation (complex cells), and — stacking complex cells — motion direction. The retina says “where is the edge”; V1 says “which way is it oriented, and is it moving”. Colour: cones do trichromatic coding (RGB), ganglion cells redo it as opponent pairs (red–green, blue–yellow) — that is why there is no “reddish green”.',
      goals: [1],
    },
    {
      title: 'Two streams: what and how',
      body: 'After V1 the road splits: ventral → temporal (“what”: identity), dorsal → parietal (“how”: where, and how to act). Patient D.F. could not SAY the orientation of a slot but could POST a letter into it — perception and action run on separate rails. Damage the “what” road → agnosia; damage the “how” road → optic ataxia.',
      link: { href: '/modules/m3', label: 'Walk the two-streams chain →' },
      goals: [3],
    },
    {
      title: 'Illusions: the brain’s best guesses',
      body: 'Perception is constructive: the brain infers the most likely world from incomplete data, using regularities (Gestalt laws: good continuation, closure, similarity…). Illusions are the guesses failing in public — Müller-Lyer (misapplied depth scaling), Kanizsa (the brain draws contours that are not printed). After the demos, explain WHY each illusion fools you — that is the exam skill.',
      link: { href: '/modules/m3', label: 'Break your perception with the illusion demos →' },
      goals: [4],
    },
  ],
  m4: [
    {
      title: 'The motor hierarchy',
      body: 'Movement is a chain of command: premotor/SMA plan (the “what and when”), M1 executes (the “how”, via the corticospinal tract), the spinal cord wires out. M1 is a distorted body map — the homunculus — with hands and face over-represented because precision demands real estate. Penfield proved it by electrically stimulating awake brains.',
      link: { href: '/atlas?s=m1', label: 'Find M1 in the 3D atlas →' },
      goals: [0],
    },
    {
      title: 'Where force comes from: the sarcomere',
      body: 'At the bottom of the hierarchy, muscles shorten by molecular rowing: myosin heads tug actin filaments — the sliding-filament mechanism. Ca²⁺ says “go”, ATP detaches the heads, and length determines force (the length–tension curve). You do not need molecular detail for the exam, but the principle explains rigour mortis and why posture depends on muscle length.',
      link: { href: '/modules/m4', label: 'Run the sarcomere lab →' },
      goals: [2],
    },
    {
      title: 'The basal ganglia: go / no-go',
      body: 'The BG is a gatekeeper: the direct pathway says GO (releases the thalamus), the indirect says NO-GO (tightens it). Dopamine turns the GO up (D1) and the NO-GO down (D2). Parkinson’s = dopamine gone → gate stuck closed → bradykinesia; Huntington’s = NO-GO gone → gate flapping open → chorea; L-DOPA and STN-DBS reopen the gate. Move through all five modes until you can predict each one.',
      link: { href: '/modules/m4', label: 'Drive the basal-ganglia simulator →' },
      goals: [1, 3],
    },
    {
      title: 'The cerebellum: calibration',
      body: 'The cerebellum does not start movement — it fine-tunes it: timing, coordination, and error correction learned from practice. Damage → ataxia: movements still happen (BG and M1 work) but become clumsy and overshooting. Think of it as the suspension of the motor system.',
      link: { href: '/atlas?s=cerebellum', label: 'See the cerebellum in 3D →' },
      goals: [0],
    },
    {
      title: 'Attention: the spotlight and its costs',
      body: 'Posner: a central cue directs attention (endogenous, slow); a peripheral flash grabs it (exogenous, fast, automatic). Valid cues speed responses, invalid slow them. Attention has limits — it binds features (Treisman) and is spatially limited, which is exactly what right-parietal damage exposes: hemispatial neglect, where the left world stops existing for attention (not for the eyes).',
      link: { href: '/methods#rt', label: 'Run the Posner cueing task →' },
      goals: [4, 5],
    },
  ],
  m5: [
    {
      title: 'Two classical language hubs',
      body: 'Broca (left inferior frontal): production — damage there gives effortful, telegraphic speech with intact comprehension. Wernicke (posterior superior temporal): comprehension — fluent but empty speech. They are connected by the arcuate fasciculus; cutting it gives conduction aphasia (good comprehension and production, broken repetition). Note the lateralisation: ~95% of right-handers have this in the LEFT hemisphere.',
      link: { href: '/atlas?s=broca', label: 'See Broca and Wernicke in 3D →' },
      goals: [0, 1],
    },
    {
      title: 'The aphasia decision tree',
      body: 'Diagnose like a neurologist with three questions: Is speech fluent? Is comprehension intact? Is repetition intact? Eight answers → eight syndromes (Broca, Wernicke, conduction, global, transcortical sensory/motor, anomic, mixed). Drill the classifier until every case lands in the right box — the exam presents exactly such clinical cases.',
      link: { href: '/modules/m5', label: 'Use the aphasia classifier →' },
      goals: [1],
    },
    {
      title: 'Two routes to read a word',
      body: 'The dual-route model: the lexical route reads familiar words whole (needed for irregular spellings like “yacht”); the sub-lexical route sounds words out letter-by-letter (needed for new words). Damage the lexical route → surface dyslexia (regularise irregular words); damage the sub-lexical route → phonological dyslexia (can’t read nonwords). Left fusiform VWFA is the visual word detector that literacy trains.',
      link: { href: '/modules/m5', label: 'Test the word-superiority flash task →' },
      goals: [2],
    },
    {
      title: 'Psycholinguistics: the small parts',
      body: 'Phonemes (smallest sound units, ~40 in English) build morphemes (smallest meaning units) build the lexicon (your mental dictionary — it keeps growing with age and education). Speech errors respect these units: slips of the tongue swap phonemes or morphemes but never produce impossible structures — evidence the brain stores language in structured pieces.',
      goals: [0],
    },
    {
      title: 'Words in context: the big effects',
      body: 'Word superiority: a letter is recognised better inside a word — McClelland & Rumelhart’s interactive-activation model explains it (word level feeds back to letters). Phoneme restoration: a cough replacing a sound is “heard” anyway — top-down fills gaps. Ambiguous words lengthen eye fixations; N400 (semantics) and P600 (syntax) ERP waves show the brain noticing meaning and structure violations within milliseconds.',
      link: { href: '/methods#erp', label: 'See the N400/P600 ERP lab →' },
      goals: [3, 4],
    },
  ],
  m6: [
    {
      title: 'The memory systems map',
      body: '“Memory” is several systems: declarative (episodic: events; semantic: facts) vs non-declarative (procedural skills, priming, conditioning). Each has its own brain address — that is why amnesia can erase events while a patient still learns to play the piano better. Squire’s taxonomy is the exam’s favourite map.',
      link: { href: '/atlas?s=hippocampus', label: 'See the memory structures in 3D →' },
      goals: [0],
    },
    {
      title: 'H.M.: the case that drew the map',
      body: 'After bilateral hippocampus removal, H.M. could not form new episodic memories (anterograde amnesia) — but his old memories, IQ and procedural learning stayed. Conclusion: the hippocampus is necessary to STORE new long-term memories, not to retrieve old ones, and not for skills. Careful: the exam loves the precise version of that sentence.',
      link: { href: '/modules/m6', label: 'Re-read the key concepts, then continue →' },
      goals: [1],
    },
    {
      title: 'LTP: the memory synapse',
      body: 'Learning lives in synapses. In long-term potentiation, strong coincident activity unlocks NMDA receptors (they need glutamate AND depolarisation — a coincidence detector), Ca²⁺ enters, and AMPA receptors get inserted: the synapse answers faster next time. Step through the mechanism once slowly and once quickly — you should be able to narrate it.',
      link: { href: '/micro#ltp', label: 'Step through LTP →' },
      goals: [5],
    },
    {
      title: 'Dopamine: the teaching signal',
      body: 'Dopamine neurons do not fire for reward per se — they fire for reward PREDICTION ERROR: more than expected (positive spike), as expected (nothing), less than expected (dip). That error signal is the engine of reinforcement learning: it tells the brain to repeat whatever predicted the surprise. Watch the raster shift from reward to cue.',
      link: { href: '/modules/m6', label: 'Watch the prediction-error raster →' },
      goals: [2],
    },
    {
      title: 'Semantic memory: the hub and spokes',
      body: 'Word meanings live in a hub-and-spoke network: modality spokes (sound, action, colour) around a transmodal hub in the anterior temporal lobes. Semantic dementia shrinks the hub: meanings dissolve while the spokes stay. Encoding specificity (Tulving): retrieval works best when cues match encoding — the Godden & Baddeley divers proved it underwater.',
      link: { href: '/atlas?s=atl', label: 'Locate the ATL hub →' },
      goals: [3, 4],
    },
    {
      title: 'False memories & familiarity',
      body: 'DRM: study “bed, pillow, dream…” and people confidently “remember” SLEEP — the gist creates false memories, proving memory is reconstruction, not playback. Recognition has two flavours: fast familiarity (perirhinal) and recollection with source detail (hippocampus) — source monitoring asks “did I really experience this?”. Run the DRM demo on yourself.',
      link: { href: '/modules/m6', label: 'Experience the DRM illusion →' },
      goals: [4],
    },
  ],
  m7: [
    {
      title: 'Fear fast and slow: the two roads',
      body: 'LeDoux: the thalamus sends a crude fast copy straight to the amygdala (low road: jump first) and a detailed copy via the cortex (high road: verify). Fear conditioning lives in the amygdala; the prefrontal cortex can regulate it (fear extinction). Snakes and email notifications use the same circuit.',
      link: { href: '/atlas?s=amygdala', label: 'Find the amygdala in 3D →' },
      goals: [0],
    },
    {
      title: 'The stress response: HPA axis',
      body: 'Stress → hypothalamus releases CRH → pituitary releases ACTH → adrenal cortex releases cortisol. Cortisol mobilises energy and, crucially, feeds back to the hippocampus and hypothalamus to shut the system down. Acute stress sharpens; chronic stress wears the hippocampus down (allostatic load). Step the axis and then break the feedback loop to see the consequences.',
      link: { href: '/modules/m7', label: 'Walk the HPA stepper →' },
      goals: [2],
    },
    {
      title: 'Emotions in the brain and body',
      body: 'Emotion = components, not one thing: subjective feeling, bodily/autonomic response, expressive behaviour (facial expressions are biologically prepared and universally recognised). Key regions: amygdala (fear/threat), insula + ACC (empathy for pain — they light up when YOU or SOMEONE ELSE hurts), vmPFC (integrating bodily signals into decisions).',
      goals: [0, 1],
    },
    {
      title: 'Decisions and the body: somatic markers',
      body: 'Damasio: the body votes. vmPFC patients perform fine on logic tests but ruin their lives — on the Iowa Gambling Task they keep drawing from the bad deck, never developing the gut warning healthy players get. Emotion is not the enemy of reason; it is part of the machinery.',
      link: { href: '/modules/m7', label: 'Play the Iowa Gambling Task →' },
      goals: [1],
    },
    {
      title: 'Memory under stress: interference, reconsolidation, sleep',
      body: 'Forgetting is mostly interference: proactive (old blocks new) and retroactive (new overwrites old). Reactivated memories become labile again — reconsolidation (Nader’s anisomycin study) — which is why recalling a memory can edit it. Sleep then replays the day: hippocampus → thalamus (sleep spindles) → cortex, migrating memories into long-term storage. Mood matters too: mood-congruent memory retrieves what matches your current mood; the emotional binding model says the amygdala binds emotional items tightly while the hippocampus keeps context.',
      goals: [4, 3],
    },
  ],
  m8: [
    {
      title: 'The stages of a night',
      body: 'Wake → N1 (theta, drifting) → N2 (spindles + K-complexes) → N3 (delta: deep, restorative slow-wave sleep) → REM (awake-looking EEG, dreams, body paralysed). The hypnogram cycles ~90 min, with deep sleep dominating early and REM late. Read a hypnogram the way you would read a story: deep sleep first, dreams last.',
      link: { href: '/modules/m8', label: 'Draw and read the hypnogram →' },
      goals: [0],
    },
    {
      title: 'The flip-flop switch',
      body: 'Sleep control is a switch, not a dial: the VLPO (sleep-active, GABA) and the arousal nuclei (LC-noradrenaline, TMN-histamine, raphe-serotonin) mutually inhibit — the winner takes all, which is why transitions are fast and why you cannot be “half asleep”. Orexin from the lateral hypothalamus stabilises the wake side; lose orexin → narcolepsy with cataplexy. Damage the VLPO → insomnia. Flip the switch in the simulator.',
      link: { href: '/modules/m8', label: 'Flip the VLPO switch →' },
      goals: [1, 4],
    },
    {
      title: 'The clock: two processes',
      body: 'When you sleep = Process S (homeostatic pressure, adenosine build-up while awake) times Process C (the SCN circadian rhythm). The SCN sits above the optic chiasm, gets light via melanopsin ipRGCs, and times melatonin from the pineal. Light at night resets the clock — try the screen-light toggle and watch melatonin crash. Zeitgebers (time-givers) set it; without them it free-runs (~25 h).',
      link: { href: '/modules/m8', label: 'Toggle the light and watch the clock →' },
      goals: [2, 3],
    },
    {
      title: 'When sleep breaks',
      body: 'Each circuit failure = a disorder: orexin loss → narcolepsy (sleep attacks); VLPO damage → insomnia; lost REM atonia → REM behaviour disorder (dream enactment, early Parkinson’s sign); circadian misalignment → shift-work/jet-lag insomnia. Also seasonal rhythms: the SCN times them via melatonin length — hibernators and hamsters prove it experimentally.',
      link: { href: '/modules/m8', label: 'Diagnose the sleep disorders →' },
      goals: [4],
    },
    {
      title: 'Why we sleep: memory',
      body: 'Sleep is when the day gets consolidated: slow oscillations, spindles and ripples coordinate replay from hippocampus to cortex (Wilson & McNaughton replayed rats’ place maps in sleep). Sleep deprivation before learning blocks encoding; after learning blocks consolidation. Now connect the whole story: stages → switch → clock → function. You are ready for the drill.',
      link: { href: '/modules/m8', label: 'Review the replay pathway →' },
      goals: [0],
    },
  ],
};
