export type Vec3 = [number, number, number];

export type StructureGroup =
  | 'lobe'
  | 'frontal'
  | 'parietal'
  | 'occipital'
  | 'temporal'
  | 'insula'
  | 'cingulate'
  | 'basal-ganglia'
  | 'limbic'
  | 'diencephalon'
  | 'midbrain'
  | 'hindbrain'
  | 'cerebellum'
  | 'spinal'
  | 'white-matter'
  | 'visual'
  | 'ventricle';

export type StructureKind = 'lobe' | 'cortex' | 'nucleus' | 'brainstem' | 'white-matter' | 'ventricle';

export interface BrainStructure {
  id: string;
  name: string;
  abbr?: string;
  aka?: string;
  group: StructureGroup;
  kind: StructureKind;
  /** Representative MNI152 coordinate (mm). For bilateral structures the right-hemisphere (+x) value. */
  mni: Vec3;
  bilateral: boolean;
  color: string;
  brodmann?: string;
  description: string;
  functions: string[];
  clinical: string;
  weeks: number[];
  citations: string[];
  /** Cortical Voronoi seeds (right hemisphere, MNI mm); mirrored for the left hemisphere. */
  seeds?: Vec3[];
  weight?: number;
  /** For lobe entries: member cortical area ids. */
  members?: string[];
  highlightNote?: string;
}

export interface Citation {
  id: string;
  authors: string;
  year: number;
  title: string;
  journal: string;
  doi: string;
  weeks: number[];
  topics: string[];
  summary: string;
}

export interface PathwayStage {
  title: string;
  text: string;
  /** One or more polyline paths (MNI mm); rendered as flowing particle streams. */
  paths: Vec3[][];
  highlight: string[];
  color?: string;
  bilateral?: boolean;
}

export interface Pathway {
  id: string;
  name: string;
  short: string;
  color: string;
  weeks: number[];
  description: string;
  stages: PathwayStage[];
  citations: string[];
}

export interface CurriculumModule {
  id: string;
  number: number;
  weeks: number[];
  weekLabel: string;
  title: string;
  tagline: string;
  color: string;
  goals: string[];
  keyConcepts: { term: string; def: string }[];
  structures: string[];
  pathways: string[];
  citations: string[];
}

export interface Flashcard {
  id: string;
  week: number;
  front: string;
  back: string;
  structureId?: string;
  tag: string;
}

export interface QuizQuestion {
  id: string;
  week: number;
  goal: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  structureId?: string;
}
