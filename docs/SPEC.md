# SYSTEM SPECIFICATION: "CORTEX-AETHER" — Interactive 3D Neuro-Atlas, Multimodal Signal Visualizer & Biological/Cognitive Psychology Study Engine

## 1. ROLE & MULTI-AGENT ORCHESTRATION
You are an elite team of neuro-informatics engineers, creative WebGL/Three.js shader artists, and educational cognitive neuroscientists running on an Opus + Astra agent workflow. Your objective is to build a production-grade, interactive 3D web application that visualizes human brain anatomy, cellular neurobiology, multimodal neuroimaging dynamics (fMRI, EEG, ERP, DTI, Single-Cell, TMS, DBS), and cognitive psychology models, backed by verifiable peer-reviewed literature and structured around an 11-week Biological & Cognitive Psychology university curriculum.

Decompose execution across four specialized subagent tracks:
- **Subagent 1 (Neuro-Data, Curriculum & Citation Architect):** Construct the complete JSON database mapping MNI152 coordinates, anatomical structures, the 11-week course learning objectives, textbook references (Carlson & Birkett chapters; Cognitive Psychology Syllabus chapters), and real peer-reviewed scientific articles with authentic DOIs.
- **Subagent 2 (Multi-Scale 3D Geometry & Shader Artist):** Build the Three.js / WebGL2 rendering pipeline supporting three seamless zoom scales:
  1. **Macro-Scale:** Whole brain (lobes, subcortical nuclei, midbrain, hindbrain, brainstem, spinal cord, and CSF ventricular system).
  2. **Meso-Scale:** Functional pathways (Retina-LGN-V1 visual stream, Basal Ganglia motor loops, Language dual-stream & reading pathways, Hub-and-Spoke semantic network, and Hippocampus-Thalamus-Cortex sleep replay loop)[cite: 1].
  3. **Micro-Scale:** 3D interactive cellular and synaptic laboratory (Neuron & CNS Glial cell structures, axonal action potential propagation, pre/post-synaptic neurotransmission, drug modulation, and Long-Term Potentiation)[cite: 1].
- **Subagent 3 (Multimodal Signal & Cognitive Lab Engineer):** Build the interactive neuroimaging simulators (fMRI BOLD, 10-20 EEG rhythms, DTI tracts, Reaction Time / Mental Chronometry lab, and Perceptual Illusions viewer) with explicit Method Pros/Cons comparison matrices[cite: 1].
- **Subagent 4 (Active Learning UI/UX Engineer):** Build the "Bigger Picture" Interactive Mind-Map (linking biological and cognitive facts), Partial vs. Final Exam Filter, 3D Spatial Flashcards, and Canvas-Style Practice Exam / Quiz Engine[cite: 1].

---

## 2. VISUAL & ARTISTIC DIRECTION ("BIOLUMINESCENT NEURO-GLASS")
Combine the artistic elegance of Greg Dunn’s micro-etchings and the Allen Brain Atlas with practical academic clarity:
- **Environment & Materials:** Deep obsidian canvas (`#05070B`) with translucent subsurface-scattering (SSS) cortical lobes, toggleable stereotaxic grid, and distinct iridescent subcortical nuclei visible through adjustable X-Ray cortical opacity (`0.05` to `1.0`).
- **CSF & Ventricular System Layer:** Include a toggleable bioluminescent cyan fluid shader illustrating cerebrospinal fluid (CSF) distribution across the lateral ventricles, third and fourth ventricles, cerebral aqueduct, central canal of the spinal cord, and subarachnoid space (Week 7 learning objective)[cite: 1].
- **Neural Development Scrubber:** Include a morphological timeline slider demonstrating how the nervous system develops from birth and embryonic neural tube vesicles (prosencephalon, mesencephalon, rhombencephalon) into adult structures (Week 7 learning objective)[cite: 1].

---

## 3. MULTI-SCALE ANATOMICAL & CELLULAR ARCHITECTURE

### Tier 1: Macro-Anatomy & Nervous System Structure (Weeks 1–11)
Render selectable, anatomically accurate 3D meshes for:
- **Cerebral Lobes & Cortical Areas:** Frontal (M1, Premotor/SMA, Broca's Area, dlPFC, vmPFC, OFC), Parietal (S1, Superior/Inferior Parietal Lobules, Angular & Supramarginal Gyri), Occipital (Primary Visual Cortex V1, Extrastriate V2–V5/MT), Temporal (Primary Auditory A1, Wernicke's Area, Fusiform Face Area [FFA], Inferior Temporal Cortex, Anterior Temporal Lobe "Semantic Hub"), Insular Cortex, and Cingulate Cortex (ACC & PCC)[cite: 1].
- **Subcortical & Limbic Structures:** Thalamus (highlighting the Lateral Geniculate Nucleus [LGN/LCN] for vision and sleep spindle relay), Basal Ganglia (Caudate, Putamen, Globus Pallidus Internus/Externus, Subthalamic Nucleus, Nucleus Accumbens), Hippocampus, Amygdala, and Hypothalamus (highlighting the Suprachiasmatic Nucleus [SCN] biological clock and sleep/wake centers)[cite: 1].
- **Midbrain, Hindbrain, Brainstem & Spinal Cord:** Tectum (Superior/Inferior Colliculi), Tegmentum (Substantia Nigra, Ventral Tegmental Area [VTA], Periaqueductal Gray), Pons (Locus Coeruleus, Raphe Nuclei), Medulla Oblongata, Cerebellum, and Spinal Cord (dorsal/ventral roots) plus peripheral Muscle fiber anatomy (Week 5 & Week 7 learning objectives)[cite: 1].

### Tier 2: Micro-Scale 3D Cellular & Synaptic Zoom View (Weeks 2, 3 & 9)
Clicking "Zoom to Micro-Scale" transitions the camera into an interactive 3D cellular scene covering three core modules:
1. **Neuron & Glial Cells Module (Week 2):**
   - 3D models of neuron types (multipolar, bipolar, unipolar, interneurons) detailing dendrites, soma, axon hillock, myelin sheath, Nodes of Ranvier, and terminal buttons[cite: 1].
   - 3D models of Central Nervous System (CNS) glial cells and their roles: Astrocytes (blood-brain barrier, nutrient/ion support), Oligodendrocytes (CNS myelin formation), Microglia (immune phagocytosis), and Ependymal cells (CSF production)[cite: 1].
   - Interactive Membrane & Action Potential Simulator: Visualize resting membrane potential (`-70 mV`), Na+/K+ pump, electrostatic pressure vs. diffusion, depolarization threshold, voltage-gated Na+ and K+ channel dynamics, refractory periods, and saltatory conduction jumping across Nodes of Ranvier[cite: 1].
2. **Synaptic Neurotransmission & Pharmacology Module (Week 3):**
   - 3D visualization of Presynaptic (synthesis, axonal transport, vesicle docking, voltage-gated Ca2+ influx, exocytosis), Synaptic Cleft (diffusion), and Postsynaptic stages (ionotropic vs. metabotropic receptor binding, EPSPs vs. IPSPs), plus concentration regulation via enzymatic deactivation and reuptake transporters[cite: 1].
   - Neurotransmitters vs. Neuromodulators comparison: Glutamate, GABA, Acetylcholine, Dopamine, Norepinephrine, Serotonin, Histamine, Orexin/Hypocretin, and Endorphins[cite: 1].
   - **Interactive Pharmacology & Drug Simulator:** Allow users to administer specific agonists and antagonists discussed in the course (e.g., SSRIs, L-DOPA, Benzodiazepines, Cocaine, Amphetamines, Botulinum toxin, Curare/Atropine) and animate how each alters synthesis, release, receptor binding, or reuptake[cite: 1].
3. **Long-Term Potentiation (LTP) & Synaptic Plasticity Module (Week 9):**
   - Animate high-frequency stimulation, postsynaptic depolarization, expulsion of the Mg2+ block from NMDA receptors, Ca2+ influx, CaMKII activation, insertion of additional AMPA receptors into the postsynaptic dendritic spine, and retrograde nitric oxide signaling[cite: 1].

---

## 4. MULTIMODAL NEUROIMAGING & RESEARCH METHODS LAB (WEEKS 1 & 2)
Build an interactive **Neuro-Methods Switcher & Evaluation Matrix** that visualizes brain activity while teaching the exact methodological trade-offs required for the exam[cite: 1]:
- **fMRI (BOLD Hemodynamics):** Volumetric activation clusters showing top-down vs. bottom-up flow, Default Mode Network, and task contrasts[cite: 1].
- **EEG & Event-Related Potentials (ERPs):** 10-20 electrode array showing sleep stages (Delta, Theta, Alpha, Beta, Sleep Spindles, K-Complexes) and language/cognitive ERPs (e.g., **N400** for semantic anomalies and **P600** for syntactic violations in Week 6)[cite: 1].
- **DTI / White Matter Tractography:** 3D fiber bundles (Corpus Callosum, Arcuate Fasciculus, Optic Radiation, Corticospinal Tract, Nigrostriatal & Mesolimbic pathways).
- **Invasive & Perturbation Methods:** Single-Cell Recording (e.g., Hubel & Wiesel V1 orientation tuning curves in Week 4), Transcranial Magnetic Stimulation (TMS virtual lesions), Lesion Case Studies (H.M., Phineas Gage, Tan, hemispatial neglect), and Deep Brain Stimulation (DBS electrode targeting the Subthalamic Nucleus / Globus Pallidus in Parkinson’s disease in Week 5)[cite: 1].
- **Reaction Time (RT) & Mental Chronometry Mini-Lab (Week 2):** Include an interactive Donders subtractive/additive factors & Posner spatial cueing reaction time widget showing how RT measures reveal hidden cognitive processes like selective attention[cite: 1].
- **Method Pros & Cons Comparison Drawer:** Every method displays a comparative radar chart rating Spatial Resolution, Temporal Resolution, Invasiveness, Cost, and Causal vs. Correlational inference, paired with specific landmark case studies[cite: 1].

---

## 5. CURRICULUM-ALIGNED INTERACTIVE SIMULATIONS (WEEKS 1–11)
Provide an interactive **Course Simulation Selector** organized by the exact weekly syllabus modules and textbook mappings[cite: 1]:

### Module 1: Historical Foundations, Methods & Neural Communication (Weeks 1–2)
- *Scope:* Partial & Final Exam | Carlson & Birkett Ch. 1–3, 6; Cognitive Psychology Syllabus Ch. 1[cite: 1].
- *Interactive Simulation:* Trace the historical convergence of biological psychology and cognitive psychology (from phrenology, localizationism, and behaviorism to the cognitive revolution and modern cognitive neuroscience), alongside the 3D Action Potential and Neuro-Methods Matrix[cite: 1].

### Module 2: Neurotransmission, Top-Down/Bottom-Up Flow, Imagery & Face Perception (Week 3)
- *Scope:* Partial & Final Exam | Carlson & Birkett Ch. 4 (pp. 99–118); Cognitive Psychology Syllabus Ch. 2[cite: 1].
- *Interactive Simulation:*
  - Animate **Bottom-Up (stimulus-driven)** vs. **Top-Down (expectation/goal-driven)** signal flow across the cortical hierarchy[cite: 1].
  - Visualize **Visual Perception vs. Mental Imagery** overlap (showing top-down frontoparietal working memory recruitment of V1 and higher visual areas during mental rotation/imagery)[cite: 1].
  - Highlight the **Fusiform Face Area (FFA)** and simulate clinical lesions causing **Prosopagnosia**, **Visual Agnosia**, and **Akinetopsia**[cite: 1].

### Module 3: Eye, Retina, Visual Cortex & Constructive Perception (Week 4)
- *Scope:* Partial & Final Exam | Carlson & Birkett Ch. 6; Cognitive Psychology Syllabus Ch. 2–3[cite: 1].
- *Interactive Simulation:*
  - Trace the complete visual pathway: **Eye & Retina** (Photoreceptors: Rods & Cones $\rightarrow$ Bipolar Cells $\rightarrow$ Retinal Ganglion Cells; fovea vs. periphery; phototransduction & lateral inhibition) $\rightarrow$ Optic Chiasm $\rightarrow$ **Thalamus (Lateral Geniculate Nucleus / LGN)** $\rightarrow$ **Primary Visual Cortex (V1)** (Simple, Complex, and Hypercomplex/End-stopped cells reacting to orientation, movement, and spatial frequency) $\rightarrow$ **Ventral ("What")** and **Dorsal ("Where/How")** higher-order visual streams[cite: 1].
  - **Constructive Perception & Visual Illusions Viewer:** Interactive demonstrations (Müller-Lyer, Kanizsa Triangle, Ponzo, Checker-shadow illusion) explaining how top-down predictive construction leads to perceptual illusions[cite: 1].

### Module 4: Movement, Basal Ganglia, DBS & Attention/Action (Week 5)
- *Scope:* Partial & Final Exam | Carlson & Birkett Ch. 8; Cognitive Psychology Syllabus Ch. 4[cite: 1].
- *Interactive Simulation:*
  - **Motor Control & Muscle Anatomy:** Trace commands from Premotor Cortex & SMA (motor planning) $\rightarrow$ Primary Motor Cortex (M1) $\rightarrow$ Corticospinal tract $\rightarrow$ Neuromuscular junction & skeletal muscle fiber contraction (actin/myosin sarcomere mechanics), plus **Cerebellar** error-correction loops[cite: 1].
  - **Basal Ganglia Pathways & Disease Simulator:** Animate the excitatory **Direct Pathway** (movement facilitation) and inhibitory **Indirect Pathway** (movement suppression) across the Striatum (Caudate/Putamen), Globus Pallidus (GPi/GPe), Subthalamic Nucleus (STN), and Substantia Nigra pars compacta (SNc)[cite: 1].
  - **Pathology & DBS Toggle:** Simulate **Parkinson’s Disease** (SNc dopaminergic degeneration $\rightarrow$ overactive indirect pathway $\rightarrow$ hypokinesia/tremor) vs. **Huntington’s Disease** (degeneration of GABAergic/enkephalin striatal neurons in the indirect pathway $\rightarrow$ hyperkinesia/chorea), and toggle a **3D Deep Brain Stimulation (DBS)** lead in the STN showing high-frequency electrical pacing restoring thalamic output[cite: 1].
  - **Attention & Hemispatial Neglect:** Visualize Dorsal and Ventral Attention Networks, attentional bottlenecks/limitations, attention-to-action coupling, and simulate right Inferior Parietal Lobule / TPJ damage resulting in **Left Hemispatial Neglect**[cite: 1].

### Module 5: Biology & Cognition of Language (Week 6)
- *Scope:* Partial & Final Exam | Carlson & Birkett Ch. 14; Cognitive Psychology Syllabus Ch. 9[cite: 1].
- *Interactive Simulation:*
  - **Language Comprehension & Production Pathways:** Compare spoken language (A1 $\rightarrow$ Wernicke's Area $\rightarrow$ Arcuate Fasciculus $\rightarrow$ Broca's Area $\rightarrow$ Motor Cortex) versus reading and writing pathways (V1 $\rightarrow$ Visual Word Form Area / Angular Gyrus $\rightarrow$ Phonological vs. Direct Lexical routes)[cite: 1].
  - **Aphasia & Dyslexia Simulator:** Compare lesion profiles and symptoms across **Broca’s Aphasia**, **Wernicke’s Aphasia**, **Conduction Aphasia**, **Global Aphasia**, **Transcortical Aphasias**, and **Surface vs. Phonological vs. Direct Dyslexia**[cite: 1].
  - **Psycholinguistics & Cognitive Models Explorer:** Interactive inspector covering phonemes, morphemes, mental lexicon, phoneme/morpheme speech errors (spoonerisms, stranding), **Chomsky’s Phrase Structure Grammar**, the **Word Superiority Effect** via **McClelland & Rumelhart’s (1981) Interactive Activation Model** (visualizing excitatory/inhibitory connections between feature, letter, and word levels), the **Phoneme Restoration Effect**, eye-tracking fixation durations on lexically ambiguous words, real-time syntactic/semantic interaction (N400/P600), language acquisition, and narrative inferences[cite: 1].

### Module 6: Biology & Cognition of Learning and Memory (Week 9 — Final Exam Exclusive)
- *Scope:* Final Exam Only | Carlson & Birkett Ch. 13; Cognitive Psychology Syllabus Ch. 5–6[cite: 1].
- *Interactive Simulation:*
  - Compare sensory, working, and long-term memory (declarative: episodic vs. semantic; non-declarative: procedural, priming, conditioning)[cite: 1].
  - **Reinforcement Learning Circuit:** Animate mesolimbic dopaminergic bursts from the **VTA to the Nucleus Accumbens**, Dorsal Striatum, and Prefrontal Cortex during reward prediction[cite: 1].
  - **Hub-and-Spoke Model of Semantic Memory:** Visualize the amodal semantic **Hub** in the bilateral **Anterior Temporal Lobes (ATL)** connected via white-matter tracts to modality-specific cortical **Spokes** (visual, auditory, motor, praxis, and emotional cortices)[cite: 1].
  - **Cognitive Memory Phenomena:** Interactive modules demonstrating retrieval cues, **Encoding Specificity** & **Context-Dependent Memory**, **Familiarity** (perirhinal cortex) vs. **Source Monitoring / Recollection** (hippocampus & prefrontal cortex), and experimental induction of **False Memories** (DRM paradigm)[cite: 1].

### Module 7: Biology of Emotions & Memory Consolidation Processes (Week 10 — Final Exam Exclusive)
- *Scope:* Final Exam Only | Carlson & Birkett Ch. 11, 18 (pp. 581–591); Cognitive Psychology Syllabus Ch. 7–8[cite: 1].
- *Interactive Simulation:*
  - **Emotion, Stress & Empathy Circuits:** Highlight the Amygdala, Insula, ACC, OFC, vmPFC, and Hypothalamic-Pituitary-Adrenal (HPA) axis (cortisol stress cascade and hippocampal impact); compare volitional vs. spontaneous facial expression pathways (M1 vs. subcortical basal ganglia/brainstem pathways) and mirror-system / anterior insula mechanisms of subjective feelings and **Empathy**[cite: 1].
  - **Memory Consolidation & Sleep Replay Loop:** Animate the **Standard Model of Systems Consolidation** and live **Sleep Memory Replay** showing synchronized dialogue between **Hippocampal Sharp-Wave Ripples**, **Thalamic Sleep Spindles**, and **Neocortical Slow Oscillations** transferring episodic traces to permanent cortical storage[cite: 1].
  - **Interference, Reconsolidation & Emotional Memory:** Compare **Proactive vs. Retroactive Interference**, the **Inhibition Account of Retrieval-Induced Forgetting** (prefrontal suppression of competing traces), memory **Reactivation/Reconsolidation**, **Mood-Congruent vs. Mood-Dependent Memory**, and the **Emotional Binding Model** (amygdala-hippocampal binding of item and emotional context)[cite: 1].

### Module 8: Biology of Sleep & Circadian Rhythms (Week 11 — Final Exam Exclusive)
- *Scope:* Final Exam Only | Carlson & Birkett Ch. 9[cite: 1].
- *Interactive Simulation:*
  - **Sleep Stages & EEG Architecture:** Scrub through Awake (Beta/Alpha), NREM Stage 1–2 (Theta, Spindles, K-Complexes), NREM Stage 3 Slow-Wave Sleep (Delta waves, glymphatic clearance, metabolic/memory restoration), and REM Sleep (desynchronized Beta/Theta, PGO waves, rapid eye movements, pontine muscle atonia), plus effects of sleep deprivation[cite: 1].
  - **Arousal vs. Sleep-Promoting Flip-Flop Switch:** Visualize the **Ventrolateral Preoptic Area (VLPO)** (GABAergic sleep promotion) inhibiting the ascending arousal system (**Acetylcholine** in pons/basal forebrain, **Norepinephrine** in Locus Coeruleus, **Serotonin** in Raphe Nuclei, **Histamine** in Tuberomammillary Nucleus, and **Orexin/Hypocretin** in Lateral Hypothalamus stabilizing the flip-flop switch), plus adenosine homeostatic pressure[cite: 1].
  - **Biological Clock & Seasonal Rhythms:** Trace the retinohypothalamic tract from melanopsin ganglion cells $\rightarrow$ **Suprachiasmatic Nucleus (SCN)** (Clock/Cycle & Per/Cry transcriptional-translational feedback loop) $\rightarrow$ Pineal Gland (**Melatonin** secretion for circadian and seasonal rhythms)[cite: 1].
  - **Sleep Disorders Inspector:** Simulate neural disruptions in **Insomnia**, **Narcolepsy** (orexin/hypocretin neuron loss & cataplexy), **REM Sleep Behavior Disorder**, and **Somnambulism**[cite: 1].

---

## 6. PEER-REVIEWED SCIENTIFIC LITERATURE DATABASE
Embed at least 40 real, peer-reviewed neuroscience and cognitive psychology citations with clickable DOI links (`https://doi.org/...`) directly mapped to the weekly syllabus topics, including:
- **Foundations, Parcellation & Methods:** Glasser et al. (2016) *Nature* (`10.1038/nature18933`); Donders (1969/1868) *Acta Psychol* (`10.1016/0001-6918(69)90065-1`); Posner (1980) *Q J Exp Psychol* (`10.1080/00335558008248231`).
- **Action Potential & Synapses:** Hodgkin & Huxley (1952) *J Physiol* (`10.1113/jphysiol.1952.sp004764`); Bliss & Lømo (1973) *J Physiol* (`10.1113/jphysiol.1973.sp010273` - Long-Term Potentiation).
- **Vision, Faces & Imagery:** Hubel & Wiesel (1962) *J Physiol* (`10.1113/jphysiol.1962.sp006837` - V1 simple/complex cells); Kanwisher, McDermott, & Chun (1997) *J Neurosci* (`10.1523/JNEUROSCI.17-11-04302.1997` - Fusiform Face Area); Kosslyn et al. (1995) *Nature* (`10.1038/378496a0` - Topographical V1 activation in mental imagery).
- **Motor Control, Basal Ganglia & Attention:** Alexander, DeLong, & Strick (1986) *Annu Rev Neurosci* (`10.1146/annurev.ne.09.030186.002041` - Basal ganglia circuits); Benabid et al. (1991) *Lancet* (`10.1016/0140-6736(91)91175-T` - Deep Brain Stimulation); Corbetta & Shulman (2002) *Nat Rev Neurosci* (`10.1038/nrn755` - Dorsal/Ventral attention networks & hemispatial neglect).
- **Language & Psycholinguistics:** McClelland & Rumelhart (1981) *Psychol Rev* (`10.1037/0033-295X.88.5.375` - Interactive Activation Model & Word Superiority Effect)[cite: 1]; Warren (1970) *Science* (`10.1126/science.167.3917.392` - Phoneme Restoration Effect); Hickok & Poeppel (2007) *Nat Rev Neurosci* (`10.1038/nrn2113`); Kutas & Hillyard (1980) *Science* (`10.1126/science.7350657` - N400 semantic processing).
- **Memory, Semantic Hub-and-Spoke & Consolidation:** Scoville & Milner (1957) *J Neurol Neurosurg Psychiatry* (`10.1136/jnnp.20.1.11`); Ralph, Jefferies, Patterson, & Rogers (2017) *Nat Rev Neurosci* (`10.1038/nrn.2016.150` - Hub-and-spoke semantic memory); Roediger & McDermott (1995) *J Exp Psychol Learn Mem Cogn* (`10.1037/0278-7393.21.4.803` - DRM false memory); Godden & Baddeley (1975) *Br J Psychol* (`10.1111/j.2044-8295.1975.tb01468.x` - Context-dependent memory); Anderson, Bjork, & Bjork (1994) *J Exp Psychol Learn Mem Cogn* (`10.1037/0278-7393.20.5.1063` - Retrieval-induced forgetting); Klinzing, Niethard, & Born (2019) *Nat Neurosci* (`10.1038/s41593-019-0467-3` - Systems consolidation & Hippocampal-Thalamic-Cortical sleep replay); Yonelinas (2002) *J Mem Lang* (`10.1006/jmla.2002.2864` - Familiarity vs. recollection).
- **Emotion & Sleep:** LeDoux (2000) *Annu Rev Neurosci* (`10.1146/annurev.neuro.23.1.155`); Mackay et al. (2004) *Mem Cognit* (`10.3758/BF03195840` - Emotional binding model); Saper, Scammell, & Lu (2005) *Nature* (`10.1038/nature04284` - Hypothalamic sleep/wake flip-flop switch).

---

## 7. ACTIVE SELF-STUDY & EXAM PREPARATION HUD
To operationalize the course study guide's pedagogical strategies, build three dedicated study tools directly into the interface[cite: 1]:
1. **Exam Scope Filter ("Partial Exam: Weeks 1–7" vs. "Final Exam: Weeks 1–11"):**
   - Toggling **Partial Exam Mode** isolates Weeks 1–7 (Carlson & Birkett Ch. 1–3, 4 [pp. 99–118], 6, 8, 14; Cognitive Psychology Syllabus Ch. 1–6, 9)[cite: 1].
   - Toggling **Final Exam Mode** unlocks the full curriculum including Weeks 9–11 (adding Carlson & Birkett Ch. 9, 11, 13, 18 [pp. 581–591]; Cognitive Psychology Syllabus Ch. 7–8)[cite: 1].
2. **"See the Bigger Picture" 3D Concept Mind-Map:**
   - An interactive force-directed graph overlay that visually connects biological structures (e.g., LGN, Striatum, ATL, SCN) to cognitive concepts (e.g., Constructive Perception, Procedural Learning, Hub-and-Spoke Semantics, Retrieval-Induced Forgetting) so students never feel like they are memorizing loosely related facts[cite: 1].
3. **3D Spatial Flashcards & Canvas-Style Practice Exam Engine:**
   - **Flashcard Rehearsal Mode:** Hides anatomical labels or highlights a 3D pathway and challenges the user to recall the structure, function, neurotransmitter, or clinical deficit, with spaced-repetition self-grading[cite: 1].
   - **Practice Exam & Weekly Learning Goal Tracker:** Interactive multiple-choice practice exam and weekly tutorial quiz simulator mapped 1-to-1 with every "I know / I understand" learning goal from Weeks 1–11, complete with instant feedback that rotates the 3D camera directly to the relevant brain circuit[cite: 1].
