/** Micro-scale lab content (Weeks 2, 3, 9). Text is concise exam-oriented summaries. */

export interface CellType { id: string; name: string; kind: 'neuron' | 'glia'; where: string; text: string; citations: string[] }

export const CELL_TYPES: CellType[] = [
  { id: 'multipolar', name: 'Multipolar motor neuron', kind: 'neuron', where: 'Spinal ventral horn, motor cortex', text: 'Many dendrites, one long myelinated axon. Lower motor neurons drive skeletal muscle at the neuromuscular junction via acetylcholine.', citations: [] },
  { id: 'pyramidal', name: 'Pyramidal neuron', kind: 'neuron', where: 'Cortex layers III & V, hippocampus CA1/CA3', text: 'Triangular soma, apical dendrite to layer I and basal dendrites; glutamatergic projection neuron. Their aligned dipoles generate the EEG; CA1 pyramidal synapses are the classic LTP site.', citations: ['bliss1973'] },
  { id: 'bipolar', name: 'Bipolar neuron', kind: 'neuron', where: 'Retina, olfactory epithelium', text: 'One dendrite and one axon on opposite poles. Retinal bipolar cells relay photoreceptor signals to ganglion cells (graded potentials).', citations: ['kuffler1953'] },
  { id: 'unipolar', name: 'Pseudo-unipolar neuron', kind: 'neuron', where: 'Dorsal root ganglia', text: 'A single process splits into a peripheral and a central branch; somatosensory afferents conduct without passing through the soma.', citations: [] },
  { id: 'purkinje', name: 'Purkinje cell', kind: 'neuron', where: 'Cerebellar cortex', text: 'Huge flat fan-shaped dendritic tree receiving ~200,000 parallel-fibre synapses; the sole (GABAergic, inhibitory) output of the cerebellar cortex.', citations: [] },
  { id: 'astrocyte', name: 'Astrocyte', kind: 'glia', where: 'CNS, everywhere', text: 'Star-shaped. End-feet wrap capillaries (blood–brain barrier, neurovascular coupling behind BOLD), take up glutamate and K⁺, and form the “tripartite synapse”.', citations: ['logothetis2008'] },
  { id: 'oligodendrocyte', name: 'Oligodendrocyte', kind: 'glia', where: 'CNS white matter', text: 'One cell myelinates segments of up to ~50 axons. Loss of CNS myelin causes multiple sclerosis.', citations: [] },
  { id: 'schwann', name: 'Schwann cell', kind: 'glia', where: 'Peripheral nervous system', text: 'Each cell wraps a single internode of one peripheral axon; supports regeneration after nerve injury. Target in Guillain–Barré syndrome.', citations: [] },
  { id: 'microglia', name: 'Microglia', kind: 'glia', where: 'CNS (resident immune cells)', text: 'Ramified surveillance cells that become amoeboid when activated; phagocytose debris and prune synapses during development.', citations: [] },
  { id: 'ependymal', name: 'Ependymal cells', kind: 'glia', where: 'Lining of ventricles & central canal', text: 'Ciliated epithelium that moves CSF; specialised ependyma of the choroid plexus secretes CSF.', citations: [] },
];

export interface Transmitter { id: string; name: string; type: string; receptors: string; source: string; role: string; color: string }

export const TRANSMITTERS: Transmitter[] = [
  { id: 'glu', name: 'Glutamate', type: 'Amino acid · excitatory', receptors: 'AMPA, NMDA, kainate (ionotropic); mGluR', source: 'Pyramidal & most projection neurons', role: 'Main fast excitation; NMDA-dependent LTP; excitotoxicity in stroke', color: '#22d3ee' },
  { id: 'gaba', name: 'GABA', type: 'Amino acid · inhibitory', receptors: 'GABA-A (Cl⁻ channel), GABA-B (GPCR)', source: 'Interneurons, striatal MSNs, Purkinje cells', role: 'Main fast inhibition; target of benzodiazepines, barbiturates, alcohol', color: '#a78bfa' },
  { id: 'ach', name: 'Acetylcholine', type: 'Monoamine-like · mixed', receptors: 'Nicotinic (ionotropic), muscarinic (GPCR)', source: 'Motor neurons, basal forebrain (nucleus basalis), PNS', role: 'Neuromuscular junction, attention & memory; lost early in Alzheimer’s', color: '#fbbf24' },
  { id: 'da', name: 'Dopamine', type: 'Catecholamine · neuromodulator', receptors: 'D1-like (Gs), D2-like (Gi)', source: 'Substantia nigra pc, VTA', role: 'Movement (nigrostriatal), reward prediction error (mesolimbic); Parkinson’s, schizophrenia, addiction', color: '#f472b6' },
  { id: '5ht', name: 'Serotonin (5-HT)', type: 'Indolamine · neuromodulator', receptors: '14 subtypes (5-HT3 ionotropic, rest GPCR)', source: 'Raphe nuclei', role: 'Mood, sleep–wake, appetite; SSRIs and psychedelics', color: '#34d399' },
  { id: 'ne', name: 'Noradrenaline', type: 'Catecholamine · neuromodulator', receptors: 'α₁, α₂, β adrenergic (GPCR)', source: 'Locus coeruleus', role: 'Arousal, vigilance, stress response; silent in REM sleep', color: '#fb923c' },
];

export interface Drug {
  id: string; name: string; system: string; site: 'synthesis' | 'vesicle' | 'release' | 'reuptake' | 'enzyme' | 'receptor';
  release: number; reuptake: number; efficacy: number; efflux: number; sign: 1 | -1;
  mechanism: string; effect: string; citations: string[];
}

/** Multipliers relative to an untreated synapse of the same transmitter system. */
export const DRUGS: Drug[] = [
  { id: 'ssri', name: 'SSRI (fluoxetine)', system: 'Serotonin', site: 'reuptake', release: 1, reuptake: 0.2, efficacy: 1, efflux: 0, sign: 1, mechanism: 'Blocks the serotonin transporter (SERT) so 5-HT lingers in the cleft.', effect: 'Antidepressant after weeks (receptor adaptation); acute side effects nausea, anxiety.', citations: ['wong2005'] },
  { id: 'ldopa', name: 'L-DOPA', system: 'Dopamine', site: 'synthesis', release: 1.8, reuptake: 1, efficacy: 1, efflux: 0, sign: 1, mechanism: 'Crosses the BBB and is converted to dopamine by surviving nigral terminals — more DA per vesicle.', effect: 'Restores movement in Parkinson’s disease; long-term dyskinesias and “on–off” fluctuations.', citations: ['cotzias1967'] },
  { id: 'benzo', name: 'Benzodiazepine (diazepam)', system: 'GABA', site: 'receptor', release: 1, reuptake: 1, efficacy: 1.9, efflux: 0, sign: -1, mechanism: 'Positive allosteric modulator of GABA-A: increases Cl⁻ channel opening frequency when GABA binds.', effect: 'Anxiolytic, sedative, anticonvulsant, muscle relaxant; impairs memory consolidation.', citations: ['rudolph2011'] },
  { id: 'cocaine', name: 'Cocaine', system: 'Dopamine', site: 'reuptake', release: 1, reuptake: 0.15, efficacy: 1, efflux: 0, sign: 1, mechanism: 'Blocks DAT (and SERT/NET); dopamine accumulates in nucleus accumbens.', effect: 'Euphoria, arousal; high addiction liability via the mesolimbic reward pathway.', citations: ['ritz1987'] },
  { id: 'amph', name: 'Amphetamine', system: 'Dopamine', site: 'release', release: 1.3, reuptake: 0.3, efficacy: 1, efflux: 0.35, sign: 1, mechanism: 'Enters via DAT, empties vesicles (VMAT2) and reverses DAT — dopamine is pumped OUT even without action potentials.', effect: 'Stimulant; ADHD treatment at low doses; psychosis at high doses.', citations: ['sulzer2005'] },
  { id: 'botox', name: 'Botulinum toxin', system: 'Acetylcholine (NMJ)', site: 'release', release: 0.05, reuptake: 1, efficacy: 1, efflux: 0, sign: 1, mechanism: 'Protease that cleaves SNARE proteins (SNAP-25) so vesicles cannot fuse.', effect: 'Flaccid paralysis (botulism); cosmetic and dystonia treatment in tiny doses.', citations: ['schiavo1992'] },
  { id: 'curare', name: 'Curare (d-tubocurarine)', system: 'Acetylcholine (NMJ)', site: 'receptor', release: 1, reuptake: 1, efficacy: 0.1, efflux: 0, sign: 1, mechanism: 'Competitive antagonist at nicotinic ACh receptors on the muscle endplate.', effect: 'Paralysis without loss of consciousness; basis of surgical muscle relaxants.', citations: [] },
  { id: 'atropine', name: 'Atropine', system: 'Acetylcholine (muscarinic)', site: 'receptor', release: 1, reuptake: 1, efficacy: 0.12, efflux: 0, sign: 1, mechanism: 'Competitive antagonist at muscarinic ACh receptors (parasympathetic targets).', effect: 'Dilated pupils, tachycardia, dry mouth; antidote to nerve-agent poisoning.', citations: [] },
];

export interface LtpStep { id: string; title: string; text: string }

export const LTP_STEPS: LtpStep[] = [
  { id: 'rest', title: '1 · Baseline transmission', text: 'Glutamate released by CA3 Schaffer collaterals binds AMPA and NMDA receptors on CA1. AMPA receptors let Na⁺ in (small EPSP); NMDA channels stay plugged by Mg²⁺ at resting potential.' },
  { id: 'tetanus', title: '2 · High-frequency tetanus', text: 'A 100 Hz burst summates AMPA EPSPs and strongly depolarises the postsynaptic spine — the “postsynaptic” half of Hebb’s coincidence.' },
  { id: 'mg', title: '3 · Mg²⁺ block expelled', text: 'Depolarisation electrostatically repels Mg²⁺ from the NMDA pore. NMDA receptors are coincidence detectors: they need BOTH glutamate (presynaptic activity) AND depolarisation (postsynaptic activity).' },
  { id: 'ca', title: '4 · Ca²⁺ influx', text: 'Ca²⁺ floods the spine through NMDA channels. Blocking NMDA receptors (AP5) prevents LTP induction but not ordinary transmission.' },
  { id: 'camkii', title: '5 · CaMKII activation', text: 'Ca²⁺/calmodulin activates CaMKII, which autophosphorylates (a molecular memory switch) and phosphorylates AMPA receptors, increasing their conductance.' },
  { id: 'ampa', title: '6 · AMPA receptor insertion', text: 'Extra AMPA receptors are trafficked into the postsynaptic density — silent synapses become active and the EPSP grows (early LTP, ~1–3 h).' },
  { id: 'no', title: '7 · Retrograde messenger & late LTP', text: 'Nitric oxide diffuses back to the presynaptic terminal to boost release. Late LTP needs PKA/CREB-driven gene expression and protein synthesis, enlarging the spine.' },
];
