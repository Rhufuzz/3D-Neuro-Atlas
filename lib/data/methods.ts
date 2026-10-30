export interface MethodInfo {
  id: string;
  name: string;
  color: string;
  measures: string;
  pros: string[];
  cons: string[];
  /** 0–10 ratings; higher = better (for invasiveness and cost: 10 = least invasive / cheapest). */
  scores: { spatial: number; temporal: number; invasiveness: number; cost: number; causal: number };
  citations: string[];
}

export const METHODS: MethodInfo[] = [
  { id: 'fmri', name: 'fMRI', color: '#60B5FF', measures: 'BOLD haemodynamic response (deoxy-Hb)', pros: ['~1–3 mm spatial resolution', 'Whole-brain, non-invasive', 'Deep structures visible'], cons: ['Sluggish (seconds)', 'Indirect, correlational', 'Expensive, noisy scanner'], scores: { spatial: 8, temporal: 3, invasiveness: 9, cost: 2, causal: 2 }, citations: ['ogawa1990', 'logothetis2001', 'logothetis2008'] },
  { id: 'eeg', name: 'EEG / ERP', color: '#FF9149', measures: 'Summed postsynaptic potentials of pyramidal cells at the scalp', pros: ['Millisecond timing', 'Cheap and portable', 'Sleep staging, ERPs (N400/P600)'], cons: ['Poor spatial resolution', 'Inverse problem', 'Insensitive to deep sources'], scores: { spatial: 2, temporal: 10, invasiveness: 10, cost: 9, causal: 1 }, citations: ['kutas1980', 'aserinsky1953'] },
  { id: 'dti', name: 'DTI', color: '#80D8C3', measures: 'Anisotropic water diffusion along axons', pros: ['Maps white-matter tracts in vivo', 'Non-invasive', 'Clinical tract integrity (FA)'], cons: ['Crossing-fibre ambiguity', 'No direction of signalling', 'Structural, not functional'], scores: { spatial: 7, temporal: 1, invasiveness: 9, cost: 3, causal: 1 }, citations: ['basser1994', 'catani2008'] },
  { id: 'single', name: 'Single-cell', color: '#FF90BB', measures: 'Action potentials from individual neurons', pros: ['Exact spiking, µm precision', 'Receptive-field mapping', 'Gold-standard timing'], cons: ['Invasive (mostly animals)', 'Tiny sample of neurons', 'Sampling bias to large cells'], scores: { spatial: 10, temporal: 10, invasiveness: 1, cost: 4, causal: 3 }, citations: ['hubel1959', 'schultz1997'] },
  { id: 'tms', name: 'TMS', color: '#A19AD3', measures: 'Induced currents transiently disrupt/excite cortex', pros: ['Causal “virtual lesion”', 'Healthy participants', 'Good timing control'], cons: ['Superficial cortex only', 'ca. 1 cm spatial spread', 'Discomfort, seizure risk (rare)'], scores: { spatial: 5, temporal: 7, invasiveness: 7, cost: 6, causal: 9 }, citations: ['walsh2000', 'pascualleone2000'] },
  { id: 'dbs', name: 'DBS', color: '#FF6363', measures: 'Chronic high-frequency stimulation of deep nuclei', pros: ['Treats PD, dystonia, OCD, depression', 'Adjustable & reversible', 'Causal intervention'], cons: ['Neurosurgery required', 'Patients only', 'Mechanism debated'], scores: { spatial: 8, temporal: 6, invasiveness: 1, cost: 1, causal: 8 }, citations: ['benabid2009', 'mayberg2005'] },
  { id: 'lesion', name: 'Lesion studies', color: '#72BF78', measures: 'Behavioural deficits after brain damage', pros: ['Necessity of a region', 'Double dissociations', 'Classic historical cases'], cons: ['Lesions are messy and large', 'Reorganisation after injury', 'Rare cases'], scores: { spatial: 4, temporal: 1, invasiveness: 5, cost: 7, causal: 8 }, citations: ['dronkers2007', 'scoville1957', 'damasio1994'] },
];

export interface DevStage {
  t: number;
  label: string;
  age: string;
  text: string;
}

/** Neural-development scrubber key frames (t ∈ [0,1]). */
export const DEV_STAGES: DevStage[] = [
  { t: 0, label: 'Neural tube', age: 'Week 3–4', text: 'The neural plate folds and fuses into the neural tube. Its lumen becomes the ventricular system and central canal; failure to close causes spina bifida or anencephaly.' },
  { t: 0.22, label: 'Three primary vesicles', age: 'Week 4', text: 'The rostral tube swells into the prosencephalon (forebrain), mesencephalon (midbrain) and rhombencephalon (hindbrain).' },
  { t: 0.45, label: 'Five secondary vesicles', age: 'Week 5–6', text: 'Prosencephalon → telencephalon (cerebral hemispheres, basal ganglia, hippocampus) + diencephalon (thalamus, hypothalamus). Rhombencephalon → metencephalon (pons, cerebellum) + myelencephalon (medulla). Flexures bend the tube.' },
  { t: 0.68, label: 'Lissencephalic fetal brain', age: '~Week 20', text: 'Telencephalic hemispheres expand over the diencephalon and midbrain. Neurons migrate radially along radial glia; the cortical surface is still largely smooth.' },
  { t: 0.86, label: 'Gyrification', age: 'Week 24–40', text: 'Primary sulci (central, lateral, calcarine) then secondary and tertiary folds form, greatly increasing cortical surface area.' },
  { t: 1, label: 'Adult brain', age: 'Postnatal → adult', text: 'Synaptogenesis, pruning and myelination continue into the mid-20s; prefrontal cortex myelinates last.' },
];

export function devStageAt(t: number): DevStage {
  const safe = Math.max(0, Math.min(1, t ?? 1));
  let cur = DEV_STAGES[0];
  DEV_STAGES.forEach((s: DevStage) => {
    if (safe >= s.t - 0.0001) cur = s;
  });
  return cur ?? DEV_STAGES[DEV_STAGES.length - 1];
}
