import type { Vec3 } from './types';

export interface Contrast { id: string; label: string; text: string; highlight: string[]; focus: string; citations: string[] }
export interface Tract { id: string; label: string; text: string; color: string; bilateral: boolean; paths: Vec3[][]; highlight: string[]; citations: string[] }
export interface Target { id: string; label: string; focus: string; highlight: string[]; text: string; citations: string[] }

/** fMRI BOLD contrasts rendered as glowing clusters on the 3D brain. */
export const FMRI_CONTRASTS: Contrast[] = [
  { id: 'faces', label: 'Faces > Houses', focus: 'ffa', highlight: ['ffa'], text: 'Right fusiform gyrus responds more to faces than to objects or houses (FFA); the reverse contrast lights up the parahippocampal place area.', citations: ['kanwisher1997'] },
  { id: 'places', label: 'Houses > Faces', focus: 'phc', highlight: ['phc'], text: 'Scenes and buildings drive parahippocampal cortex (PPA) more than faces — a classic double dissociation of category-selective cortex.', citations: ['kanwisher1997'] },
  { id: 'motor', label: 'Finger tapping > Rest', focus: 'm1', highlight: ['m1', 'premotor', 'putamen', 'cerebellum', 'thalamus'], text: 'Contralateral M1 hand knob, premotor/SMA, putamen, thalamus and ipsilateral cerebellum — the motor loop seen in BOLD.', citations: ['penfield1937'] },
  { id: 'language', label: 'Sentences > Non-words', focus: 'broca', highlight: ['broca', 'wernicke', 'atl', 'smg'], text: 'Left-lateralised perisylvian network: IFG (Broca), posterior STG/MTG (Wernicke), anterior temporal lobe — dorsal and ventral streams.', citations: ['hickok2007'] },
  { id: 'attention', label: 'Cued attention (dorsal network)', focus: 'spl', highlight: ['spl', 'ipl', 'premotor', 'dlpfc'], text: 'IPS/SPL and frontal eye fields orient attention voluntarily; the right-lateralised ventral TPJ network reorients to unexpected targets.', citations: ['corbetta2002'] },
  { id: 'dmn', label: 'Rest > Task (default mode)', focus: 'pcc', highlight: ['pcc', 'vmpfc', 'ag', 'hippocampus'], text: 'Posterior cingulate/precuneus, medial PFC, angular gyrus and hippocampus deactivate during demanding tasks and activate during mind-wandering and autobiographical recall.', citations: ['logothetis2008'] },
  { id: 'imagery', label: 'Visual imagery > Rest', focus: 'v1', highlight: ['v1', 'v2v3', 'spl'], text: 'Imagining a visual scene re-engages early visual cortex retinotopically (weaker than perception), plus parietal and frontal control regions.', citations: ['kosslyn1995', 'pearson2019'] },
];

/** Schematic DTI tractography bundles (MNI mm, left hemisphere unless bilateral). */
export const DTI_TRACTS: Tract[] = [
  { id: 'arcuate', label: 'Arcuate fasciculus', color: '#f472b6', bilateral: false, highlight: ['broca', 'wernicke'], citations: ['catani2005'], text: 'Arches around the Sylvian fissure linking posterior temporal cortex (Wernicke) to inferior frontal cortex (Broca); damage → conduction aphasia (poor repetition).',
    paths: [[[-56, -44, 4], [-54, -50, 16], [-44, -42, 30], [-40, -20, 32], [-44, 0, 26], [-48, 16, 14]], [[-58, -36, 0], [-50, -46, 22], [-42, -26, 30], [-42, -4, 28], [-46, 12, 18]]] },
  { id: 'cst', label: 'Corticospinal tract', color: '#60a5fa', bilateral: true, highlight: ['m1', 'pons', 'medulla'], citations: ['catani2008'], text: 'From M1 through the corona radiata and posterior limb of the internal capsule, cerebral peduncle, pons and medullary pyramids, then decussates into the spinal cord.',
    paths: [[[-36, -22, 62], [-28, -18, 36], [-22, -14, 10], [-16, -18, -12], [-10, -24, -30], [-6, -36, -46], [-3, -42, -62]], [[-22, -14, 70], [-22, -16, 40], [-20, -14, 12], [-14, -20, -14], [-8, -26, -32], [-4, -38, -50]]] },
  { id: 'cc', label: 'Corpus callosum', color: '#facc15', bilateral: false, highlight: ['corpus-callosum'], citations: ['gazzaniga2005'], text: 'Largest commissure: ~200 million axons link homologous areas of the two hemispheres. Callosotomy produces the split-brain syndrome.',
    paths: [[[-40, 20, 30], [-18, 18, 26], [0, 16, 22], [18, 18, 26], [40, 20, 30]], [[-40, -10, 40], [-16, -10, 32], [0, -10, 28], [16, -10, 32], [40, -10, 40]], [[-36, -50, 30], [-14, -40, 22], [0, -38, 16], [14, -40, 22], [36, -50, 30]]] },
  { id: 'optic', label: 'Optic radiation', color: '#34d399', bilateral: true, highlight: ['lgn', 'v1'], citations: ['catani2008'], text: 'LGN → V1 via Meyer’s loop (inferior fibres sweep into the temporal lobe). Temporal lesions cause a contralateral upper-quadrant field cut.',
    paths: [[[-22, -24, -4], [-34, -20, -10], [-38, -44, -4], [-28, -72, 2], [-12, -92, 4]], [[-22, -26, -2], [-30, -40, 6], [-26, -66, 10], [-10, -90, 10]]] },
  { id: 'uncinate', label: 'Uncinate fasciculus', color: '#fb923c', bilateral: true, highlight: ['atl', 'ofc', 'amygdala'], citations: ['catani2008'], text: 'Hook-shaped bundle joining the anterior temporal lobe and amygdala to orbitofrontal cortex — implicated in semantic and socio-emotional processing.',
    paths: [[[-40, 8, -32], [-34, 4, -18], [-28, 14, -10], [-24, 30, -14], [-20, 42, -14]]] },
  { id: 'ifof', label: 'Inferior fronto-occipital fasciculus', color: '#a78bfa', bilateral: true, highlight: ['it', 'ofc', 'v2v3'], citations: ['catani2008'], text: 'Long ventral association pathway from occipital cortex through the external capsule to the frontal lobe — part of the ventral semantic stream.',
    paths: [[[-24, -86, 2], [-34, -60, 0], [-34, -30, 2], [-30, 0, -4], [-26, 24, 2], [-24, 44, 2]]] },
  { id: 'fornix', label: 'Fornix', color: '#22d3ee', bilateral: true, highlight: ['hippocampus', 'hypothalamus'], citations: ['eichenbaum2007'], text: 'Main hippocampal output: arches over the thalamus to the mammillary bodies and septum (Papez circuit). Damage impairs episodic memory.',
    paths: [[[-28, -22, -14], [-24, -36, 0], [-14, -36, 14], [-4, -18, 18], [-3, -2, 8], [-4, -8, -10]]] },
];

export const TMS_TARGETS: Target[] = [
  { id: 'tms-m1', label: 'M1 hand area', focus: 'm1', highlight: ['m1'], citations: ['walsh2000'], text: 'Single pulses evoke a motor-evoked potential (MEP) in the contralateral hand muscle — used to calibrate motor threshold.' },
  { id: 'tms-v1', label: 'Occipital pole (V1)', focus: 'v1', highlight: ['v1'], citations: ['pascualleone2000'], text: 'Pulses ~80–100 ms after a brief letter suppress its visibility; stronger pulses produce phosphenes.' },
  { id: 'tms-broca', label: 'Left IFG (Broca)', focus: 'broca', highlight: ['broca'], citations: ['walsh2000'], text: 'Repetitive TMS over left IFG causes speech arrest or slows naming — a reversible “virtual lesion”.' },
  { id: 'tms-ppc', label: 'Right parietal cortex', focus: 'ipl', highlight: ['ipl', 'spl'], citations: ['pascualleone2000'], text: 'rTMS over right PPC induces transient neglect-like bias in line bisection and visual search.' },
  { id: 'tms-dlpfc', label: 'Left DLPFC (rTMS therapy)', focus: 'dlpfc', highlight: ['dlpfc'], citations: ['pascualleone2000'], text: 'High-frequency rTMS over left DLPFC is an approved treatment for medication-resistant depression.' },
];

export const DBS_TARGETS: Target[] = [
  { id: 'dbs-stn', label: 'Subthalamic nucleus', focus: 'stn', highlight: ['stn'], citations: ['benabid2009'], text: 'High-frequency STN stimulation relieves Parkinsonian rigidity, bradykinesia and tremor, allowing L-DOPA reduction.' },
  { id: 'dbs-gpi', label: 'Globus pallidus internus', focus: 'gpi', highlight: ['gpi'], citations: ['benabid2009'], text: 'GPi DBS treats dystonia and L-DOPA-induced dyskinesia in Parkinson’s disease.' },
  { id: 'dbs-vim', label: 'Thalamus (VIM)', focus: 'thalamus', highlight: ['thalamus'], citations: ['benabid2009'], text: 'Ventral intermediate thalamic nucleus stimulation suppresses essential tremor.' },
  { id: 'dbs-scc', label: 'Subgenual cingulate (Cg25)', focus: 'acc', highlight: ['acc'], citations: ['mayberg2005'], text: 'Experimental DBS for treatment-resistant depression (Mayberg et al., 2005).' },
  { id: 'dbs-nacc', label: 'Nucleus accumbens / VC-VS', focus: 'nacc', highlight: ['nacc'], citations: ['benabid2009'], text: 'Ventral capsule/ventral striatum stimulation is used for severe obsessive–compulsive disorder.' },
];

export const LESION_CASES: Target[] = [
  { id: 'hm', label: 'Patient H.M. (1953)', focus: 'hippocampus', highlight: ['hippocampus', 'amygdala', 'phc'], citations: ['scoville1957', 'squire2004'], text: 'Bilateral medial temporal lobe resection for epilepsy → profound anterograde amnesia with spared working memory and motor skill learning (mirror drawing): MTL is necessary for declarative memory.' },
  { id: 'gage', label: 'Phineas Gage (1848)', focus: 'vmpfc', highlight: ['vmpfc', 'ofc'], citations: ['damasio1994'], text: 'Tamping iron through the left frontal lobe; intellect spared but personality, planning and social conduct changed — “Gage was no longer Gage”.' },
  { id: 'tan', label: 'Leborgne “Tan” (1861)', focus: 'broca', highlight: ['broca', 'insula'], citations: ['dronkers2007'], text: 'Could only say “tan” but understood speech. Broca localised the lesion to left inferior frontal gyrus; MRI shows it extended deeper (insula, white matter).' },
  { id: 'neglect', label: 'Hemispatial neglect', focus: 'ipl', highlight: ['ipl', 'smg', 'spl'], citations: ['corbetta2011'], text: 'Right temporo-parietal (TPJ/IPL) stroke: patients ignore the left side of space — copy only half a clock, bisect lines to the right, eat from one side of the plate.' },
  { id: 'prosop', label: 'Prosopagnosia', focus: 'ffa', highlight: ['ffa'], citations: ['kanwisher1997'], text: 'Fusiform lesions (often right/bilateral) abolish face recognition while object recognition is relatively spared.' },
];
