import type { Pathway, Vec3 } from './types';

const ATL: Vec3 = [40, 14, -32];

export const PATHWAYS: Pathway[] = [
  {
    id: 'visual', name: 'Retina → LGN → V1 → Ventral & Dorsal Streams', short: 'Visual stream', color: '#22e5ff', weeks: [3, 4],
    description: 'The geniculostriate pathway carries ~90% of retinal output to V1, from where the ventral ("what") stream runs to inferior temporal cortex and the dorsal ("where/how") stream to posterior parietal cortex.',
    citations: ['hubel1962', 'goodale1992', 'felleman1991'],
    stages: [
      { title: 'Retina → optic nerve', text: 'Photoreceptors → bipolar cells → retinal ganglion cells (centre-surround receptive fields). Ganglion-cell axons leave the eye as the optic nerve.', bilateral: true, highlight: ['optic'], paths: [[[32, 52, -34], [26, 36, -28], [12, 16, -20], [0, 4, -16]]] },
      { title: 'Optic chiasm → optic tract → LGN', text: 'At the chiasm, fibres from the nasal hemiretinae cross. Each optic tract therefore carries the contralateral visual hemifield to the LGN (and branches to the superior colliculus and SCN).', bilateral: true, highlight: ['optic', 'lgn', 'sc'], paths: [[[0, 4, -16], [10, -4, -14], [18, -16, -10], [22, -25, -6]], [[18, -16, -10], [10, -28, -6], [5, -33, -4]]] },
      { title: 'Optic radiation → V1', text: 'LGN relay neurons project via the optic radiation. Inferior fibres loop forward into the temporal lobe (Meyer\'s loop, upper visual field) before reaching the calcarine cortex.', bilateral: true, highlight: ['lgn', 'v1'], paths: [[[22, -25, -6], [32, -18, -12], [36, -36, -2], [30, -62, 4], [12, -92, 4]]] },
      { title: 'Ventral stream — "what"', text: 'V1 → V2 → V4 → fusiform/inferior temporal cortex → anterior temporal lobe. Builds increasingly invariant object, face and word representations for perception and recognition.', bilateral: true, highlight: ['v1', 'v2v3', 'v4', 'ffa', 'it', 'atl'], paths: [[[12, -94, 4], [26, -88, -6], [30, -74, -14], [40, -54, -18], [54, -30, -24], ATL]] },
      { title: 'Dorsal stream — "where / how"', text: 'V1 → V2/V3 → MT/V5 → intraparietal sulcus & superior parietal lobule. Codes spatial location and motion and guides reaching and grasping (Goodale & Milner).', bilateral: true, highlight: ['v1', 'v2v3', 'mt', 'ipl', 'spl'], paths: [[[12, -94, 4], [26, -90, 12], [46, -70, 4], [38, -54, 44], [24, -58, 62]]] },
    ],
  },
  {
    id: 'bg-motor', name: 'Basal Ganglia Motor Loops (Direct / Indirect)', short: 'Motor loops', color: '#ff4fa3', weeks: [5],
    description: 'Cortico-basal ganglia-thalamo-cortical loop. The direct pathway (D1) releases the thalamus from GPi inhibition ("go"); the indirect pathway (D2) via GPe and STN increases GPi inhibition ("no-go"). Dopamine from SNc facilitates go and suppresses no-go.',
    citations: ['albin1989', 'delong1990', 'benabid2009'],
    stages: [
      { title: 'Cortex → striatum', text: 'Motor and premotor cortex send glutamatergic projections to the putamen (motor loop) and caudate (associative loop).', bilateral: true, highlight: ['m1', 'premotor', 'putamen', 'caudate'], paths: [[[30, -18, 62], [30, -6, 40], [25, 2, 6]], [[26, 2, 64], [18, 8, 30], [13, 12, 10]]] },
      { title: 'Direct pathway (D1): striatum ⊣ GPi', text: 'D1 medium spiny neurons inhibit GPi/SNr. Inhibiting the inhibitor disinhibits the thalamus → movement is facilitated.', bilateral: true, highlight: ['putamen', 'gpi'], color: '#4ade80', paths: [[[25, 2, 2], [20, -2, -1], [16, -6, -3]]] },
      { title: 'Indirect pathway (D2): striatum ⊣ GPe ⊣ STN → GPi', text: 'D2 neurons inhibit GPe, which releases the STN; the glutamatergic STN excites GPi → more thalamic inhibition → movement suppressed.', bilateral: true, highlight: ['putamen', 'gpe', 'stn', 'gpi'], color: '#f87171', paths: [[[25, 2, 2], [20, -3, 0], [15, -10, -4], [11, -14, -6], [16, -6, -3]]] },
      { title: 'GPi ⊣ thalamus (VA/VL) → cortex', text: 'GPi output tonically inhibits ventral anterior/ventral lateral thalamus, which excites SMA/premotor cortex — closing the loop.', bilateral: true, highlight: ['gpi', 'thalamus', 'premotor', 'm1'], paths: [[[16, -6, -3], [12, -12, 4], [11, -14, 8], [20, -8, 32], [28, 0, 60]]] },
      { title: 'Nigrostriatal dopamine', text: 'SNc dopamine excites D1 (direct) and inhibits D2 (indirect) neurons. Its loss in Parkinson\'s disease tips the balance toward "no-go" → bradykinesia.', bilateral: true, highlight: ['sn', 'putamen', 'caudate'], color: '#facc15', paths: [[[12, -17, -11], [18, -8, -4], [25, 2, 2]], [[12, -17, -11], [14, 0, 2], [13, 12, 10]]] },
    ],
  },
  {
    id: 'language', name: 'Language Dual-Stream & Reading Pathways', short: 'Language', color: '#b57bff', weeks: [6],
    description: 'Hickok & Poeppel\'s dual-stream model (left-dominant): a dorsal stream maps sound onto articulation via the arcuate fasciculus, a ventral stream maps sound onto meaning in the temporal lobe. Reading adds a visual route through the VWFA.',
    citations: ['hickok2007', 'catani2005', 'dehaene2011'],
    stages: [
      { title: 'Auditory input → A1 → pSTG', text: 'Speech sounds are analysed spectro-temporally in Heschl\'s gyrus and phonologically in posterior superior temporal gyrus/sulcus (Wernicke\'s area).', highlight: ['a1', 'wernicke'], paths: [[[-50, -20, 8], [-58, -32, 10], [-58, -44, 16]]] },
      { title: 'Dorsal stream: arcuate fasciculus → Broca', text: 'Sensorimotor interface (area Spt) and the arcuate fasciculus link pSTG to the inferior frontal gyrus — required for repetition and speech production. Damage → conduction aphasia.', highlight: ['wernicke', 'smg', 'broca'], paths: [[[-58, -44, 16], [-52, -46, 30], [-46, -28, 34], [-44, -4, 28], [-50, 14, 16]]] },
      { title: 'Broca → premotor / M1 (articulation)', text: 'Inferior frontal gyrus plans articulatory sequences executed by ventral premotor and face M1.', highlight: ['broca', 'premotor', 'm1'], paths: [[[-50, 14, 16], [-54, 4, 26], [-58, -6, 24]]] },
      { title: 'Ventral stream: sound → meaning', text: 'Middle and anterior temporal cortex map phonology onto lexical-semantic representations (bilateral, left-biased), reaching IFG via the extreme capsule/uncinate fasciculus.', highlight: ['a1', 'wernicke', 'it', 'atl', 'broca'], paths: [[[-58, -30, 2], [-60, -14, -10], [-50, 4, -26], [-40, 14, -32]], [[-40, 14, -32], [-40, 24, -10], [-48, 28, 4]]] },
      { title: 'Reading: V1 → VWFA → angular gyrus / pSTG', text: 'Written words reach the left fusiform Visual Word Form Area, then connect to phonology (pSTG/SMG) and meaning (AG, ATL). Alexia follows VWFA or AG damage.', highlight: ['v1', 'ffa', 'ag', 'wernicke'], paths: [[[-10, -94, 4], [-30, -78, -12], [-44, -56, -16], [-48, -60, 10], [-46, -64, 34], [-58, -46, 18]]] },
    ],
  },
  {
    id: 'semantic', name: 'Hub-and-Spoke Semantic Network', short: 'Semantic hub', color: '#d58cff', weeks: [9],
    description: 'Modality-specific "spokes" (vision, audition, praxis, words, touch, valence) converge on a bilateral, amodal hub in the anterior temporal lobes, which generalises across concepts (Patterson et al., 2007).',
    citations: ['patterson2007', 'lambonralph2017'],
    stages: [
      { title: 'Visual & auditory spokes', text: 'Shape and colour features (IT/V4) and sound features (A1/STG) feed the ATL hub.', bilateral: true, highlight: ['atl', 'it', 'v4', 'a1'], paths: [[[30, -76, -14], [44, -40, -22], ATL], [[52, -20, 8], [56, -4, -12], ATL]] },
      { title: 'Praxis & somatosensory spokes', text: 'Action knowledge (SMG, premotor) and tactile features (S1) — especially important for tools and manipulable objects.', bilateral: true, highlight: ['atl', 'smg', 'premotor', 's1'], paths: [[[56, -34, 36], [56, -16, 4], ATL], [[48, 4, 46], [50, 10, 0], ATL], [[50, -24, 48], [54, -12, 10], ATL]] },
      { title: 'Verbal spokes', text: 'Word-form knowledge (Wernicke, Broca) connects names to concepts.', bilateral: true, highlight: ['atl', 'wernicke', 'broca'], paths: [[[60, -42, 14], [58, -14, -10], ATL], [[50, 18, 14], [44, 18, -10], ATL]] },
      { title: 'Valence / smell / taste spoke', text: 'Orbitofrontal cortex and insula contribute emotional value and chemosensory features.', bilateral: true, highlight: ['atl', 'ofc', 'insula'], paths: [[[26, 38, -18], [34, 24, -26], ATL], [[40, 2, 4], [42, 10, -16], ATL]] },
      { title: 'Bilateral hub integration', text: 'Both ATLs interact (anterior commissure) to form amodal, transmodal concepts; atrophy in semantic dementia degrades all spokes\' access to meaning.', highlight: ['atl'], paths: [[[40, 14, -32], [20, 8, -20], [0, 4, -14], [-20, 8, -20], [-40, 14, -32]]] },
    ],
  },
  {
    id: 'replay', name: 'Hippocampus–Thalamus–Cortex Sleep Replay Loop', short: 'Sleep replay', color: '#34f5c5', weeks: [10, 11],
    description: 'Active systems consolidation: during slow-wave sleep, cortical slow oscillations group thalamic spindles, which group hippocampal sharp-wave ripples carrying replayed memory traces back to neocortex (Diekelmann & Born, 2010).',
    citations: ['diekelmann2010', 'wilson1994', 'ji2007', 'frankland2005'],
    stages: [
      { title: 'Wake encoding: cortex → entorhinal → hippocampus', text: 'Distributed cortical patterns converge via entorhinal cortex (perforant path) onto the hippocampus, which rapidly binds them into an index.', bilateral: true, highlight: ['it', 'ag', 'dlpfc', 'phc', 'hippocampus'], paths: [[[54, -30, -24], [26, -18, -26], [28, -20, -16]], [[46, -64, 36], [30, -44, -6], [26, -30, -10]], [[42, 34, 30], [30, 6, -14], [28, -12, -18]]] },
      { title: 'Sharp-wave ripples (SWS)', text: 'During NREM slow-wave sleep the hippocampus emits 150–250 Hz sharp-wave ripples that compress and replay waking sequences (Wilson & McNaughton, 1994).', bilateral: true, highlight: ['hippocampus'], paths: [[[28, -10, -20], [28, -22, -14], [26, -32, -6], [24, -38, 2]]] },
      { title: 'Hippocampus → thalamus: spindles', text: 'Ripples nest within 11–15 Hz thalamo-cortical sleep spindles generated by the thalamic reticular nucleus.', bilateral: true, highlight: ['hippocampus', 'thalamus'], paths: [[[24, -38, 2], [14, -32, 18], [5, -10, 14], [5, -8, -6], [9, -12, 6]]] },
      { title: 'Thalamus → neocortex: slow oscillations', text: '<1 Hz cortical slow oscillations synchronise spindles and ripples, opening windows for synaptic plasticity in cortical networks.', bilateral: true, highlight: ['thalamus', 'dlpfc', 'pcc', 'it'], paths: [[[11, -18, 7], [24, 10, 24], [42, 34, 30]], [[11, -18, 7], [6, -34, 24], [5, -46, 30]], [[11, -18, 7], [36, -20, -6], [54, -30, -24]]] },
      { title: 'Systems consolidation', text: 'Repeated replay strengthens cortico-cortical connections, so remote memories gradually become less hippocampus-dependent (standard consolidation; cf. multiple trace theory).', bilateral: true, highlight: ['dlpfc', 'pcc', 'it', 'atl', 'hippocampus'], paths: [[[42, 34, 30], [46, -10, 20], [54, -30, -24]], [[5, -46, 30], [30, -50, 10], [54, -30, -24]], [[54, -30, -24], [40, -14, -28], ATL]] },
    ],
  },
];

export const PATHWAY_MAP: Record<string, Pathway> = Object.fromEntries(PATHWAYS.map((p: Pathway) => [p.id, p]));
