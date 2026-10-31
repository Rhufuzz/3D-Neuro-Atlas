import type { Vec3 } from './types';

/**
 * Simulated neuroimaging overlays for the atlas viewer. BOLD "activation" clusters are
 * illustrative task-paradigm blobs (teaching metaphor, not real fMRI data); DTI bundles are
 * schematic major white-matter courses (control-point polylines in MNI mm), not tractography.
 */

export interface Paradigm {
  id: string;
  name: string;
  desc: string;
  color: string;
  /** Cluster centres (right hemisphere for bilateral ones) + radius in mm. */
  clusters: { at: Vec3; r: number }[];
  cites: string[];
}

export const PARADIGMS: Paradigm[] = [
  {
    id: 'motor', name: 'Motor (hand)', color: '#ff4fa3',
    desc: 'Finger-tapping style activation: contralateral M1 hand knob, SMA, and cerebellar lobules — the movement network.',
    clusters: [
      { at: [40, -20, 58], r: 11 }, { at: [-40, -20, 58], r: 9 },
      { at: [4, 4, 58], r: 8 }, { at: [20, -58, -24], r: 10 }, { at: [-20, -58, -24], r: 9 },
    ],
    cites: ['penfield1937', 'albin1989'],
  },
  {
    id: 'language', name: 'Language', color: '#b57bff',
    desc: 'Sentence comprehension: left Broca and Wernicke areas plus their weaker right homologues — the classic lateralisation demo.',
    clusters: [
      { at: [-50, 18, 10], r: 12 }, { at: [-56, -44, 10], r: 12 },
      { at: [50, 18, 10], r: 7 }, { at: [54, -42, 12], r: 6 },
    ],
    cites: ['hickok2007', 'dronkers2007'],
  },
  {
    id: 'memory', name: 'Episodic memory', color: '#34f5c5',
    desc: 'Encoding/retrieval: hippocampi, parahippocampal cortex and posterior cingulate — the core of the episodic network.',
    clusters: [
      { at: [26, -26, -12], r: 10 }, { at: [-26, -26, -12], r: 10 },
      { at: [22, -34, -14], r: 7 }, { at: [-22, -34, -14], r: 7 }, { at: [2, -32, 26], r: 9 },
    ],
    cites: ['squire2004', 'scoville1957'],
  },
  {
    id: 'vision', name: 'Motion (V5)', color: '#2ee6ff',
    desc: 'Moving-dot stimulus: V1 plus area V5/MT — the paradigm that made a single visual area famous (Zeki).',
    clusters: [
      { at: [0, -84, 6], r: 13 }, { at: [45, -68, 2], r: 10 }, { at: [-45, -68, 2], r: 10 },
    ],
    cites: ['felleman1991', 'ogawa1990'],
  },
];

export interface Tract {
  id: string;
  name: string;
  color: string;
  desc: string;
  /** One polyline per side (or a single crossing bundle). Points in MNI mm. */
  paths: Vec3[];
  bilateral: boolean;
  cites: string[];
}

export const TRACTS: Tract[] = [
  {
    id: 'arcuate', name: 'Arcuate fasciculus', color: '#b57bff',
    desc: 'The dorsal language highway: superior temporal → inferior frontal, arching around the Sylvian fissure. Cut it and repetition fails (conduction aphasia).',
    paths: [[-58, -38, 4], [-56, -28, 11], [-50, -16, 19], [-45, -2, 23], [-46, 8, 15], [-49, 16, 8]],
    bilateral: true,
    cites: ['catani2005', 'catani2008'],
  },
  {
    id: 'cst', name: 'Corticospinal tract', color: '#ff4fa3',
    desc: 'Motor output: M1 → internal capsule → cerebral peduncle → pyramids → spinal cord. The tract DBS electrodes and strokes threaten.',
    paths: [[36, -22, 58], [24, -18, 40], [15, -12, 22], [9, -14, 2], [8, -22, -22], [7, -32, -42], [5, -46, -56]],
    bilateral: true,
    cites: ['catani2008', 'penfield1937'],
  },
  {
    id: 'uncinate', name: 'Uncinate fasciculus', color: '#ff8fb8',
    desc: 'Hooking connection between temporal pole and orbitofrontal cortex — emotion, memory and semantic control.',
    paths: [[38, 6, -28], [43, 2, -12], [37, 14, -2], [28, 26, -8], [20, 32, -4]],
    bilateral: true,
    cites: ['catani2008'],
  },
  {
    id: 'or', name: 'Optic radiations', color: '#2ee6ff',
    desc: 'LGN → primary visual cortex around the ventricles. Damage causes a quadrantanopia you can predict from the quadrant.',
    paths: [[24, -26, -8], [30, -40, 0], [30, -55, 8], [22, -68, 9], [13, -78, 6]],
    bilateral: true,
    cites: ['basser1994', 'catani2008'],
  },
  {
    id: 'cc', name: 'Corpus callosum (forceps minor)', color: '#ffd166',
    desc: 'Callosal fibres crossing between the frontal poles — the bridge that split-brain studies made famous.',
    paths: [[-16, 34, 22], [-8, 42, 27], [0, 44, 29], [8, 42, 27], [16, 34, 22]],
    bilateral: false,
    cites: ['gazzaniga2005', 'catani2008'],
  },
];
