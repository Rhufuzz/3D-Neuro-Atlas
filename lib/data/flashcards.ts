import type { Flashcard } from './types';

type Row = [string, number, string, string, string | undefined, string];

const ROWS: Row[] = [
  // Week 1 — history & methods
  ['f1-01', 1, 'Which patient gave his name to Broca’s area, and what was his deficit?', '“Tan” (Leborgne): severe non-fluent speech production with relatively preserved comprehension; lesion in left inferior frontal gyrus (Dronkers et al., 2007 re-imaged it).', 'broca', 'History'],
  ['f1-02', 1, 'What does a double dissociation demonstrate?', 'That two functions rely on separable processes/regions: lesion A impairs X not Y, lesion B impairs Y not X.', undefined, 'Methods'],
  ['f1-03', 1, 'Spatial vs temporal resolution of fMRI?', '≈ 1–3 mm spatial; poor temporal (seconds) because the BOLD response peaks ~5–6 s after neural activity.', undefined, 'Methods'],
  ['f1-04', 1, 'Spatial vs temporal resolution of EEG/ERP?', 'Millisecond temporal resolution, but poor spatial resolution (inverse problem; skull smearing).', undefined, 'Methods'],
  ['f1-05', 1, 'What does the BOLD signal best correlate with (Logothetis, 2001)?', 'Local field potentials (synaptic input and intracortical processing) more than spiking output.', undefined, 'Methods'],
  ['f1-06', 1, 'Why is TMS called a “virtual lesion” technique?', 'It transiently disrupts cortical processing in healthy people, allowing causal claims with no reorganisation confound.', 'm1', 'Methods'],
  ['f1-07', 1, 'What does DTI measure?', 'Directional (anisotropic) diffusion of water; fractional anisotropy and tractography reconstruct white-matter tracts.', 'corpus-callosum', 'Methods'],
  ['f1-08', 1, 'Donders’ subtractive logic?', 'Stage duration = RT(task with stage) − RT(task without); e.g. choice RT − simple RT = decision time. Assumes pure insertion.', undefined, 'Methods'],
  ['f1-09', 1, 'What did split-brain research reveal?', 'After callosotomy each hemisphere can process information independently; the left is typically verbal, the right visuospatial (Gazzaniga).', 'corpus-callosum', 'History'],
  ['f1-10', 1, 'Where is CSF produced and how does it flow?', 'Choroid plexus of the ventricles: lateral → interventricular foramen → third → cerebral aqueduct → fourth → subarachnoid space / central canal.', 'lat-ventricles', 'Anatomy'],
  // Week 2 — neurons & synapses
  ['f2-01', 2, 'Resting membrane potential and its basis?', '≈ −70 mV; K⁺ leak channels (high internal K⁺) plus the 3Na⁺/2K⁺-ATPase pump.', undefined, 'Neuron'],
  ['f2-02', 2, 'Rising phase of the action potential?', 'Voltage-gated Na⁺ channels open at threshold (~−55 mV); Na⁺ rushes in, driving Vm toward E_Na (~+50 mV).', undefined, 'Neuron'],
  ['f2-03', 2, 'What ends the action potential?', 'Na⁺ channel inactivation plus delayed opening of voltage-gated K⁺ channels → repolarisation and after-hyperpolarisation.', undefined, 'Neuron'],
  ['f2-04', 2, 'Absolute vs relative refractory period?', 'Absolute: Na⁺ channels inactivated, no AP possible. Relative: stronger stimulus needed during K⁺-driven hyperpolarisation.', undefined, 'Neuron'],
  ['f2-05', 2, 'Saltatory conduction?', 'In myelinated axons the AP jumps between nodes of Ranvier — faster, energy-efficient conduction.', undefined, 'Neuron'],
  ['f2-06', 2, 'Four CNS glia and roles?', 'Astrocytes (BBB, K⁺/glutamate buffering, tripartite synapse), oligodendrocytes (CNS myelin), microglia (immune), ependymal cells (line ventricles, CSF).', undefined, 'Glia'],
  ['f2-07', 2, 'How do SSRIs act?', 'Block the serotonin transporter (SERT), increasing synaptic 5-HT; e.g. fluoxetine.', 'raphe', 'Pharmacology'],
  ['f2-08', 2, 'Cocaine vs amphetamine at the dopamine synapse?', 'Cocaine blocks DAT reuptake; amphetamine reverses DAT/VMAT2 causing non-vesicular DA efflux.', 'nacc', 'Pharmacology'],
  ['f2-09', 2, 'Benzodiazepine mechanism?', 'Positive allosteric modulators of GABA-A receptors — increase Cl⁻ channel opening frequency.', undefined, 'Pharmacology'],
  ['f2-10', 2, 'Botulinum toxin vs curare?', 'Botulinum cleaves SNARE proteins, blocking ACh release; curare is a nicotinic ACh receptor antagonist. Both cause paralysis.', undefined, 'Pharmacology'],
  ['f2-11', 2, 'Why is L-DOPA given instead of dopamine?', 'Dopamine cannot cross the blood–brain barrier; L-DOPA can and is converted to DA by AADC.', 'sn', 'Pharmacology'],
  ['f2-12', 2, 'Ionotropic vs metabotropic receptors?', 'Ionotropic: ligand-gated ion channels (fast, ms). Metabotropic: G-protein coupled, second messengers (slow, long-lasting).', undefined, 'Synapse'],
  // Week 3
  ['f3-01', 3, 'Bottom-up vs top-down processing?', 'Bottom-up: stimulus-driven feed-forward. Top-down: expectations/attention modulate sensory areas via feedback.', 'v1', 'Perception'],
  ['f3-02', 3, 'Kosslyn’s island-scanning finding?', 'Time to scan between locations on an imagined map increased linearly with distance — images preserve metric space.', undefined, 'Imagery'],
  ['f3-03', 3, 'Evidence that imagery uses V1?', 'Imagery activates early visual cortex retinotopically (Kosslyn 1995); TMS to V1 impairs imagery.', 'v1', 'Imagery'],
  ['f3-04', 3, 'Shepard & Metzler mental rotation result?', 'RT to judge same/mirror increases linearly with angular disparity (~60°/s).', 'spl', 'Imagery'],
  ['f3-05', 3, 'Where is the FFA and what does it prefer?', 'Lateral mid-fusiform gyrus (right > left); responds more to faces than objects/houses.', 'ffa', 'Faces'],
  ['f3-06', 3, 'The face-inversion effect shows…', 'Upright faces are processed configurally/holistically; inversion disrupts this disproportionately vs objects.', 'ffa', 'Faces'],
  ['f3-07', 3, 'Prosopagnosia?', 'Inability to recognise familiar faces; acquired (fusiform lesions) or developmental.', 'ffa', 'Faces'],
  // Week 4
  ['f4-01', 4, 'Where do optic fibres cross?', 'At the optic chiasm: nasal retinal fibres decussate so each hemisphere receives the contralateral visual field.', 'optic', 'Vision'],
  ['f4-02', 4, 'LGN layers?', '6 layers: 1–2 magnocellular (motion, coarse), 3–6 parvocellular (colour, detail); koniocellular between.', 'lgn', 'Vision'],
  ['f4-03', 4, 'Simple vs complex cells?', 'Simple: oriented bar at a specific location (separate ON/OFF zones). Complex: orientation, position-invariant, often direction-selective.', 'v1', 'Vision'],
  ['f4-04', 4, 'Area specialised for motion; lesion effect?', 'V5/MT; akinetopsia (motion blindness).', 'mt', 'Vision'],
  ['f4-05', 4, 'Area associated with colour; lesion effect?', 'V4; cerebral achromatopsia.', 'v4', 'Vision'],
  ['f4-06', 4, 'Patient DF and the two-streams hypothesis?', 'Ventral damage: could not report slot orientation but posted a card accurately — vision-for-action spared (dorsal).', 'it', 'Vision'],
  ['f4-07', 4, 'Gregory’s explanation of the Müller-Lyer illusion?', 'Fins act as depth cues (corners), triggering inappropriate size-constancy scaling.', undefined, 'Illusions'],
  ['f4-08', 4, 'What does the checker-shadow illusion demonstrate?', 'Lightness perception infers surface reflectance by discounting illumination — top-down inference.', 'v1', 'Illusions'],
  // Week 5
  ['f5-01', 5, 'Direct pathway sequence?', 'Cortex → striatum (D1, excited by DA) ⊣ GPi/SNr ⊣ thalamus → cortex: net facilitation of movement.', 'putamen', 'Basal ganglia'],
  ['f5-02', 5, 'Indirect pathway sequence?', 'Striatum (D2, inhibited by DA) ⊣ GPe ⊣ STN → GPi ⊣ thalamus: net suppression of movement.', 'gpe', 'Basal ganglia'],
  ['f5-03', 5, 'Core pathology of Parkinson’s disease?', 'Degeneration of dopaminergic neurons in the substantia nigra pars compacta.', 'sn', 'Basal ganglia'],
  ['f5-04', 5, 'Most common DBS target for PD?', 'Subthalamic nucleus (or GPi); high-frequency stimulation reduces pathological output.', 'stn', 'Basal ganglia'],
  ['f5-05', 5, 'Huntington’s disease mechanism?', 'CAG-repeat HTT mutation; early loss of striatal (caudate) indirect-pathway neurons → chorea.', 'caudate', 'Basal ganglia'],
  ['f5-06', 5, 'Role of the cerebellum in movement?', 'Error-based motor learning, coordination and timing; damage → ataxia, intention tremor.', 'cerebellum', 'Motor'],
  ['f5-07', 5, 'Endogenous vs exogenous attention?', 'Endogenous: voluntary, goal-driven, slower (central cue). Exogenous: stimulus-driven, automatic, fast (peripheral cue); IOR later.', 'spl', 'Attention'],
  ['f5-08', 5, 'Dorsal vs ventral attention networks?', 'Dorsal (IPS/FEF, bilateral): top-down orienting. Ventral (TPJ/VFC, right-lateralised): reorienting to salient events.', 'ipl', 'Attention'],
  ['f5-09', 5, 'Hemispatial neglect lesion site?', 'Typically right inferior parietal lobule/TPJ; neglect of left space.', 'ipl', 'Attention'],
  // Week 6
  ['f6-01', 6, 'Broca’s vs Wernicke’s aphasia?', 'Broca: non-fluent, agrammatic, comprehension relatively spared. Wernicke: fluent, paraphasic, poor comprehension.', 'wernicke', 'Language'],
  ['f6-02', 6, 'Conduction aphasia hallmark?', 'Impaired repetition with fluent speech and good comprehension (arcuate fasciculus / SMG).', 'smg', 'Language'],
  ['f6-03', 6, 'Dual-stream model of speech?', 'Ventral (bilateral temporal): sound → meaning. Dorsal (left temporo-parieto-frontal): sound → articulation.', 'a1', 'Language'],
  ['f6-04', 6, 'Surface vs phonological dyslexia?', 'Surface: lexical route impaired — irregular words regularised (YACHT → “yatched”). Phonological: sub-lexical route impaired — nonwords fail.', 'ag', 'Reading'],
  ['f6-05', 6, 'Visual word form area?', 'Left occipito-temporal (fusiform) region specialised for letter strings through literacy.', 'ffa', 'Reading'],
  ['f6-06', 6, 'Word-superiority effect & explanation?', 'Letters better identified in words (Reicher, 1969); IAM: word units feed back to letter units.', undefined, 'Reading'],
  ['f6-07', 6, 'Phonemic restoration?', 'Listeners “hear” a phoneme replaced by a cough — top-down lexical/contextual filling-in (Warren, 1970).', 'a1', 'Language'],
  ['f6-08', 6, 'N400 vs P600?', 'N400: semantic incongruity (“He spread his toast with socks”). P600: syntactic violation/reanalysis.', undefined, 'ERP'],
  // Week 9
  ['f9-01', 9, 'What did H.M.’s surgery remove and what was lost?', 'Bilateral medial temporal lobes; profound anterograde amnesia for declarative memory, intact procedural learning (mirror drawing).', 'hippocampus', 'Memory'],
  ['f9-02', 9, 'Squire’s taxonomy — non-declarative systems & substrates?', 'Procedural (striatum), priming (neocortex), classical conditioning (amygdala/cerebellum), non-associative (reflex pathways).', 'putamen', 'Memory'],
  ['f9-03', 9, 'Dopamine neuron response pattern (Schultz)?', 'Burst to unexpected reward; after learning, burst shifts to predictive cue; dip if expected reward omitted.', 'vta', 'Learning'],
  ['f9-04', 9, 'Hub-and-spoke model?', 'Modality-specific spokes (vision, sound, praxis, words) converge on an amodal hub in the bilateral ATL.', 'atl', 'Semantics'],
  ['f9-05', 9, 'Semantic dementia?', 'Progressive bilateral ATL atrophy causing amodal loss of conceptual knowledge across all modalities.', 'atl', 'Semantics'],
  ['f9-06', 9, 'Godden & Baddeley (1975)?', 'Divers recalled words better when learning and test environments matched (land/underwater) — context-dependent memory.', undefined, 'Memory'],
  ['f9-07', 9, 'Familiarity vs recollection?', 'Familiarity: graded sense of knowing (perirhinal). Recollection: retrieval of specific details (hippocampus).', 'phc', 'Memory'],
  ['f9-08', 9, 'DRM critical lure?', 'An unpresented associate (e.g. “sleep” after bed, rest, tired…) falsely recalled at high rates.', undefined, 'Memory'],
  ['f9-09', 9, 'Why is the NMDA receptor a coincidence detector?', 'Needs glutamate binding AND depolarisation to expel the Mg²⁺ block; Ca²⁺ entry then triggers LTP.', 'hippocampus', 'LTP'],
  ['f9-10', 9, 'Role of CaMKII in LTP?', 'Ca²⁺-activated kinase that autophosphorylates, phosphorylates AMPA receptors and drives their insertion.', 'hippocampus', 'LTP'],
  // Week 10
  ['f10-01', 10, 'LeDoux’s low road?', 'Sensory thalamus → lateral amygdala directly: fast, crude threat detection before cortical analysis.', 'amygdala', 'Emotion'],
  ['f10-02', 10, 'Empathy for pain (Singer, 2004)?', 'Anterior insula and ACC activated for own and partner’s pain; sensory cortex only for own pain.', 'insula', 'Emotion'],
  ['f10-03', 10, 'HPA axis sequence?', 'Hypothalamus (PVN) CRH → anterior pituitary ACTH → adrenal cortex cortisol; negative feedback at hippocampus/hypothalamus.', 'hypothalamus', 'Stress'],
  ['f10-04', 10, 'Chronic stress effects on hippocampus?', 'Dendritic atrophy, reduced neurogenesis, impaired memory and feedback regulation (McEwen; Lupien).', 'hippocampus', 'Stress'],
  ['f10-05', 10, 'Somatic-marker hypothesis?', 'vmPFC associates options with bodily emotional signals; vmPFC patients choose risky decks in the Iowa Gambling Task.', 'vmpfc', 'Emotion'],
  ['f10-06', 10, 'Reconsolidation (Nader 2000)?', 'Anisomycin in the amygdala after reactivation erased a consolidated fear memory — retrieval renders memory labile.', 'amygdala', 'Memory'],
  ['f10-07', 10, 'Proactive vs retroactive interference?', 'Proactive: old learning impairs new. Retroactive: new learning impairs old.', undefined, 'Memory'],
  ['f10-08', 10, 'Hippocampal replay during sleep?', 'Place-cell sequences from waking are reactivated during SWS sharp-wave ripples, coordinated with cortex (Wilson & McNaughton; Ji & Wilson).', 'hippocampus', 'Consolidation'],
  // Week 11
  ['f11-01', 11, 'EEG of stage N2?', 'Sleep spindles (11–16 Hz, thalamocortical) and K-complexes.', 'thalamus', 'Sleep'],
  ['f11-02', 11, 'EEG of N3 and REM?', 'N3: high-amplitude delta (<2 Hz) slow waves. REM: low-voltage mixed frequency, sawtooth waves, REMs, muscle atonia.', undefined, 'Sleep'],
  ['f11-03', 11, 'The VLPO flip-flop switch?', 'VLPO (sleep-active, GABA/galanin) and arousal nuclei (LC, TMN, raphe) mutually inhibit; orexin stabilises the wake side.', 'vlpo', 'Sleep'],
  ['f11-04', 11, 'Cause of narcolepsy with cataplexy?', 'Loss of orexin (hypocretin) neurons in the lateral hypothalamus (orexin receptor-2 mutation in dogs; Lin et al., 1999).', 'lh', 'Sleep'],
  ['f11-05', 11, 'Two-process model?', 'Process S: homeostatic sleep pressure (adenosine) rising with wake. Process C: circadian alerting signal from the SCN.', 'scn', 'Circadian'],
  ['f11-06', 11, 'How is the SCN entrained by light?', 'Melanopsin ipRGCs → retinohypothalamic tract → SCN; SCN controls pineal melatonin via a multisynaptic sympathetic route.', 'scn', 'Circadian'],
  ['f11-07', 11, 'Ralph et al. (1990) SCN transplant result?', 'Transplanted SCN restored rhythms with the donor’s period — the SCN determines circadian period.', 'scn', 'Circadian'],
  ['f11-08', 11, 'REM sleep behaviour disorder?', 'Absence of REM atonia → dream enactment; associated with pontine (SLD) dysfunction and later Parkinson’s.', 'pons', 'Sleep'],
];

export const FLASHCARDS: Flashcard[] = ROWS.map((r: Row) => ({
  id: r[0],
  week: r[1],
  front: r[2],
  back: r[3],
  structureId: r[4],
  tag: r[5],
}));

export const FLASHCARD_MAP: Record<string, Flashcard> = Object.fromEntries(
  FLASHCARDS.map((c: Flashcard) => [c.id, c])
);
