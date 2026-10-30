import type { BrainStructure, StructureGroup } from './types';
import { CORTICAL_AREAS, LOBES } from './structures-cortex';
import { DEEP_STRUCTURES } from './structures-deep';

export { CORTICAL_AREAS, LOBES, DEEP_STRUCTURES };

export const ALL_STRUCTURES: BrainStructure[] = [...CORTICAL_AREAS, ...DEEP_STRUCTURES, ...LOBES];

export const STRUCTURE_MAP: Record<string, BrainStructure> = Object.fromEntries(
  ALL_STRUCTURES.map((s: BrainStructure) => [s.id, s])
);

export function getStructure(id: string | null | undefined): BrainStructure | undefined {
  if (!id) return undefined;
  return STRUCTURE_MAP?.[id];
}

export interface GroupInfo {
  id: string;
  label: string;
  groups: StructureGroup[];
  layer: 'cortex' | 'subcortical' | 'brainstem' | 'csf';
}

/** Tree sections shown in the atlas explorer. */
export const ATLAS_SECTIONS: GroupInfo[] = [
  { id: 'frontal', label: 'Frontal Lobe', groups: ['frontal'], layer: 'cortex' },
  { id: 'parietal', label: 'Parietal Lobe', groups: ['parietal'], layer: 'cortex' },
  { id: 'occipital', label: 'Occipital Lobe', groups: ['occipital'], layer: 'cortex' },
  { id: 'temporal', label: 'Temporal Lobe', groups: ['temporal'], layer: 'cortex' },
  { id: 'limbic', label: 'Insula & Cingulate', groups: ['insula', 'cingulate'], layer: 'cortex' },
  { id: 'bg', label: 'Basal Ganglia', groups: ['basal-ganglia'], layer: 'subcortical' },
  { id: 'limbic-deep', label: 'Limbic (Hippocampus, Amygdala)', groups: ['limbic'], layer: 'subcortical' },
  { id: 'dien', label: 'Thalamus & Hypothalamus', groups: ['diencephalon', 'visual'], layer: 'subcortical' },
  { id: 'white', label: 'White Matter', groups: ['white-matter'], layer: 'subcortical' },
  { id: 'mid', label: 'Midbrain (Tectum & Tegmentum)', groups: ['midbrain'], layer: 'brainstem' },
  { id: 'hind', label: 'Pons, Medulla & Cerebellum', groups: ['hindbrain', 'cerebellum', 'spinal'], layer: 'brainstem' },
  { id: 'csf', label: 'CSF & Ventricular System', groups: ['ventricle'], layer: 'csf' },
];

export function structuresInSection(section: GroupInfo | undefined): BrainStructure[] {
  if (!section) return [];
  return ALL_STRUCTURES.filter(
    (s: BrainStructure) => s.kind !== 'lobe' && (section?.groups ?? []).includes(s.group)
  );
}

/** Expand lobe ids into member areas; pass through everything else. */
export function expandIds(ids: (string | null | undefined)[] | undefined | null): string[] {
  const out: string[] = [];
  (ids ?? []).forEach((id: string | null | undefined) => {
    if (!id) return;
    const s = STRUCTURE_MAP?.[id];
    if (s?.kind === 'lobe') out.push(...(s?.members ?? []));
    else out.push(id);
  });
  return out;
}

export function formatMni(v: [number, number, number] | undefined | null): string {
  if (!v) return '—';
  return `(${v.map((n: number) => (n > 0 ? '+' : '') + Math.round(n)).join(', ')})`;
}
