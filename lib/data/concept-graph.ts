export type ConceptType = 'structure' | 'concept' | 'disorder' | 'method';

export interface ConceptNode {
  id: string;
  label: string;
  type: ConceptType;
  weeks: number[];
  structureId?: string;
  note: string;
}

type N = [string, string, ConceptType, number[], string, string?];

const NODES: N[] = [
  // structures
  ['s-v1', 'V1', 'structure', [3, 4], 'Primary visual cortex — orientation, retinotopy.', 'v1'],
  ['s-lgn', 'LGN', 'structure', [4], 'Thalamic relay for vision.', 'lgn'],
  ['s-mt', 'V5/MT', 'structure', [4], 'Motion processing.', 'mt'],
  ['s-ffa', 'FFA / VWFA', 'structure', [3, 6], 'Fusiform faces (right) and words (left).', 'ffa'],
  ['s-spl', 'Parietal (SPL/IPL)', 'structure', [3, 4, 5], 'Dorsal stream, spatial attention, rotation.', 'ipl'],
  ['s-m1', 'M1', 'structure', [1, 5], 'Primary motor cortex, somatotopy.', 'm1'],
  ['s-striatum', 'Striatum', 'structure', [5, 9], 'Caudate + putamen: action selection, habits.', 'putamen'],
  ['s-stn', 'STN', 'structure', [5], 'Indirect pathway, DBS target.', 'stn'],
  ['s-sn', 'Substantia nigra', 'structure', [5], 'Nigrostriatal dopamine.', 'sn'],
  ['s-vta', 'VTA', 'structure', [9], 'Mesolimbic dopamine, prediction error.', 'vta'],
  ['s-cb', 'Cerebellum', 'structure', [5, 9], 'Motor learning, conditioning.', 'cerebellum'],
  ['s-broca', 'Broca’s area', 'structure', [1, 6], 'Speech production, syntax.', 'broca'],
  ['s-wern', 'Wernicke’s area', 'structure', [1, 6], 'Speech comprehension (pSTG).', 'wernicke'],
  ['s-atl', 'ATL hub', 'structure', [6, 9], 'Amodal semantic hub.', 'atl'],
  ['s-hipp', 'Hippocampus', 'structure', [1, 9, 10], 'Episodic memory, replay.', 'hippocampus'],
  ['s-amyg', 'Amygdala', 'structure', [9, 10], 'Fear, emotional memory.', 'amygdala'],
  ['s-pfc', 'Prefrontal (dlPFC/vmPFC)', 'structure', [3, 5, 10], 'Control, decision-making.', 'vmpfc'],
  ['s-insula', 'Insula / ACC', 'structure', [10], 'Interoception, empathy.', 'insula'],
  ['s-hypo', 'Hypothalamus', 'structure', [10, 11], 'HPA axis, sleep switch.', 'hypothalamus'],
  ['s-scn', 'SCN', 'structure', [11], 'Master circadian clock.', 'scn'],
  ['s-thal', 'Thalamus', 'structure', [4, 5, 11], 'Relay, spindles, BG output target.', 'thalamus'],
  ['s-bs', 'Brainstem (LC, raphe)', 'structure', [2, 11], 'Arousal, monoamines.', 'pons'],
  // concepts
  ['c-topdown', 'Top-down processing', 'concept', [3, 4, 6], 'Expectations shape perception.'],
  ['c-imagery', 'Mental imagery', 'concept', [3], 'Depictive, uses visual cortex.'],
  ['c-faces', 'Holistic face processing', 'concept', [3], 'Configural; inversion effect.'],
  ['c-streams', 'What / How streams', 'concept', [4], 'Ventral vs dorsal vision.'],
  ['c-illusion', 'Constancy & illusions', 'concept', [4], 'Inference about the world.'],
  ['c-actionsel', 'Action selection (Go/No-Go)', 'concept', [5], 'Direct vs indirect pathways.'],
  ['c-attention', 'Spatial attention', 'concept', [5], 'Posner cueing, networks.'],
  ['c-dualstream', 'Dual-stream language', 'concept', [6], 'Sound → meaning / articulation.'],
  ['c-reading', 'Dual-route reading', 'concept', [6], 'Lexical vs sub-lexical.'],
  ['c-semantic', 'Semantic memory', 'concept', [9], 'Hub-and-spoke.'],
  ['c-episodic', 'Episodic memory', 'concept', [9], 'Recollection, context.'],
  ['c-rpe', 'Reward prediction error', 'concept', [9], 'TD learning, dopamine.'],
  ['c-ltp', 'LTP / plasticity', 'concept', [2, 9], 'NMDA, AMPA, CaMKII.'],
  ['c-fear', 'Fear conditioning', 'concept', [10], 'Low and high roads.'],
  ['c-stress', 'Stress (HPA axis)', 'concept', [10], 'Cortisol and feedback.'],
  ['c-consol', 'Consolidation & replay', 'concept', [10, 11], 'Systems consolidation, sleep.'],
  ['c-reconsol', 'Reconsolidation', 'concept', [10], 'Labile on retrieval.'],
  ['c-sleep', 'Sleep stages & switch', 'concept', [11], 'Flip-flop, two-process.'],
  ['c-ap', 'Action potential', 'concept', [1, 2], 'Hodgkin–Huxley.'],
  // disorders
  ['d-prosop', 'Prosopagnosia', 'disorder', [3], 'Face blindness.'],
  ['d-akin', 'Akinetopsia', 'disorder', [4], 'Motion blindness.'],
  ['d-pd', 'Parkinson’s disease', 'disorder', [5], 'Dopamine loss.'],
  ['d-hd', 'Huntington’s disease', 'disorder', [5], 'Striatal degeneration.'],
  ['d-neglect', 'Hemispatial neglect', 'disorder', [5], 'Right TPJ damage.'],
  ['d-aphasia', 'Aphasias', 'disorder', [6], 'Broca, Wernicke, conduction.'],
  ['d-sd', 'Semantic dementia', 'disorder', [9], 'ATL atrophy.'],
  ['d-amnesia', 'Amnesia (H.M.)', 'disorder', [9], 'MTL resection.'],
  ['d-narco', 'Narcolepsy', 'disorder', [11], 'Orexin loss.'],
  // methods
  ['m-fmri', 'fMRI', 'method', [1], 'BOLD.'],
  ['m-eeg', 'EEG / ERP', 'method', [1, 6, 11], 'N400, sleep staging.'],
  ['m-tms', 'TMS', 'method', [1], 'Virtual lesion.'],
  ['m-dbs', 'DBS', 'method', [5], 'STN stimulation.'],
  ['m-single', 'Single-cell', 'method', [4, 9], 'Receptive fields, RPE.'],
];

export const CONCEPT_NODES: ConceptNode[] = NODES.map((n: N) => ({
  id: n[0],
  label: n[1],
  type: n[2],
  weeks: n[3],
  note: n[4],
  structureId: n[5],
}));

export const CONCEPT_EDGES: [string, string][] = [
  ['s-lgn', 's-v1'], ['s-v1', 's-mt'], ['s-v1', 's-ffa'], ['s-v1', 's-spl'], ['s-thal', 's-lgn'],
  ['c-topdown', 's-v1'], ['c-topdown', 's-pfc'], ['c-imagery', 's-v1'], ['c-imagery', 's-spl'],
  ['c-faces', 's-ffa'], ['d-prosop', 's-ffa'], ['d-prosop', 'c-faces'],
  ['c-streams', 's-ffa'], ['c-streams', 's-spl'], ['c-streams', 's-mt'], ['d-akin', 's-mt'],
  ['c-illusion', 's-v1'], ['c-illusion', 'c-topdown'],
  ['c-actionsel', 's-striatum'], ['c-actionsel', 's-stn'], ['c-actionsel', 's-thal'], ['c-actionsel', 's-m1'],
  ['s-sn', 's-striatum'], ['d-pd', 's-sn'], ['d-pd', 'm-dbs'], ['m-dbs', 's-stn'], ['d-hd', 's-striatum'],
  ['s-cb', 's-m1'], ['c-attention', 's-spl'], ['c-attention', 's-pfc'], ['d-neglect', 's-spl'], ['d-neglect', 'c-attention'],
  ['c-dualstream', 's-broca'], ['c-dualstream', 's-wern'], ['c-dualstream', 's-atl'], ['d-aphasia', 's-broca'], ['d-aphasia', 's-wern'],
  ['c-reading', 's-ffa'], ['c-reading', 's-wern'], ['c-reading', 'c-topdown'], ['m-eeg', 'c-dualstream'],
  ['c-semantic', 's-atl'], ['d-sd', 's-atl'], ['d-sd', 'c-semantic'],
  ['c-episodic', 's-hipp'], ['d-amnesia', 's-hipp'], ['d-amnesia', 'c-episodic'],
  ['c-rpe', 's-vta'], ['c-rpe', 's-striatum'], ['m-single', 'c-rpe'], ['m-single', 's-v1'],
  ['c-ltp', 's-hipp'], ['c-ltp', 'c-episodic'], ['c-ap', 'c-ltp'], ['c-ap', 'm-single'],
  ['c-fear', 's-amyg'], ['c-fear', 's-thal'], ['c-stress', 's-hypo'], ['c-stress', 's-hipp'], ['s-amyg', 's-hipp'],
  ['s-insula', 's-pfc'], ['c-fear', 's-pfc'], ['c-reconsol', 's-amyg'], ['c-reconsol', 'c-consol'],
  ['c-consol', 's-hipp'], ['c-consol', 's-thal'], ['c-consol', 'c-sleep'],
  ['c-sleep', 's-hypo'], ['c-sleep', 's-bs'], ['c-sleep', 's-scn'], ['d-narco', 's-hypo'], ['d-narco', 'c-sleep'],
  ['m-eeg', 'c-sleep'], ['m-fmri', 's-ffa'], ['m-tms', 's-v1'], ['m-tms', 's-m1'], ['s-scn', 's-hypo'],
];
