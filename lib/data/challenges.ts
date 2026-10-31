export interface ChallengeInfo {
  challenge: string;
  solutionHint: string;
}

export const CHALLENGES: Record<string, ChallengeInfo> = {
  m1: {
    challenge: 'Challenge: Find the exact threshold current where the squid axon first fires an action potential (typically between 10 and 12 µA/cm²).',
    solutionHint: 'Start at 5 µA (subthreshold wobble), then step up by 2 µA until the first sharp spike appears.',
  },
  m2: {
    challenge: 'Challenge: Verify Shepard & Metzler’s mental rotation law: double the angular disparity between shapes and observe how your decision time scales linearly.',
    solutionHint: 'Compare a 45° tilt vs a 135° tilt — cognitive rotation speed is constant at ~60° per second.',
  },
  m3: {
    challenge: 'Challenge: Find the stimulus condition that completely cancels out a retinal ganglion cell’s centre–surround response.',
    solutionHint: 'Flood both the ON-centre and the OFF-surround simultaneously with uniform full-field light (excitation cancels inhibition).',
  },
  m4: {
    challenge: 'Challenge: In the basal ganglia circuit model, switch to Parkinsonism and test whether L-DOPA or DBS restores balanced output to the thalamus.',
    solutionHint: 'Select Parkinsonism (loss of dopamine, STN overactivity), then toggle L-DOPA or DBS to suppress STN.',
  },
  m5: {
    challenge: 'Challenge: Diagnose a patient with nonfluent speech, intact language comprehension, and impaired repetition. What is the classic syndrome?',
    solutionHint: 'Broca’s aphasia — lesion in the left inferior frontal gyrus.',
  },
  m6: {
    challenge: 'Challenge: Explain why semantic spreading activation causes high false-alarm rates for unstudied critical lures in the DRM paradigm.',
    solutionHint: 'Studied words (bed, rest, tired) automatically pre-activate the semantic node for "sleep".',
  },
  m7: {
    challenge: 'Challenge: Compare acute vs chronic HPA-axis stress: why does chronic stress lead to hippocampal receptor downregulation?',
    solutionHint: 'Prolonged high cortisol exposure damages hippocampal feedback loops, impairing shutdown.',
  },
  m8: {
    challenge: 'Challenge: In the two-process sleep model, explain how high sleep pressure (Process S) overrides circadian alertness (Process C) during sleep deprivation.',
    solutionHint: 'Adenosine accumulation in the basal forebrain increases homeostatic drive past the VLPO tipping threshold.',
  },
};
