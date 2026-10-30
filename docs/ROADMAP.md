# Roadmap — spec coverage checklist

Legend: ✅ done and working · 🟡 partial / placeholder · ⬜ not started. Section numbers refer to `docs/SPEC.md`.
Update this file whenever a feature lands.

## §2 Visual direction

- 🟡 Obsidian `#05070B` canvas, glass/fresnel/iridescent materials — done as a custom shader; **no real subsurface scattering**.
- ✅ Toggleable stereotaxic grid.
- ✅ X-ray cortical opacity slider 0.05–1.0.
- 🟡 CSF layer — toggle shows glowing ventricle ellipsoids (lateral, 3rd, 4th, aqueduct, central canal); **no fluid shader, no subarachnoid space**.
- 🟡 Neural development scrubber — slider scales the brain and shows stage text (6 stages); **no neural-tube → vesicle → adult morphing**.

## §3 Multi-scale anatomy

- 🟡 Tier 1 macro: 66 selectable structures at MNI coordinates with descriptions/functions/clinical notes/citations — **ellipsoid placeholders, not anatomically accurate meshes**. Muscle-fibre anatomy ⬜.
- 🟡 Meso pathways: visual, basal-ganglia motor, language, hub-and-spoke semantic, sleep replay — stage-by-stage text + structure highlighting; **particle streams along `paths` not rendered**.
- ⬜ Tier 2 micro-scale zoom (camera transition into a cellular scene).
- ⬜ Neuron types + glial cells 3D models (Week 2).
- ⬜ Membrane & action-potential simulator (−70 mV, Na⁺/K⁺ pump, channels, refractory period, saltatory conduction).
- ⬜ Synaptic transmission 3D + neurotransmitter/neuromodulator comparison (Week 3).
- ⬜ Pharmacology & drug simulator (SSRIs, L-DOPA, benzodiazepines, cocaine, amphetamines, botulinum, curare/atropine).
- ⬜ LTP module (NMDA Mg²⁺ block, Ca²⁺, CaMKII, AMPA insertion, retrograde NO) (Week 9).

## §4 Neuroimaging & methods lab

- 🟡 Data only: 7 methods with pros/cons in `lib/data/methods.ts` (not shown in the UI).
- ⬜ fMRI BOLD clusters / DMN / task contrasts.
- ⬜ EEG 10-20 array, sleep rhythms, ERPs (N400/P600).
- ⬜ DTI tractography fibre bundles.
- ⬜ Single-cell (orientation tuning), TMS virtual lesion, lesion case studies (H.M., Gage, Tan, neglect), DBS targeting.
- ⬜ Reaction-time mini-lab (Donders subtraction, Posner cueing).
- ⬜ Method comparison radar charts.

## §5 Curriculum modules (Weeks 1–11)

- 🟡 All 8 modules exist as pages with goals, key concepts, related structures and readings (m1–m8).
- ⬜ M1 history timeline + AP simulator + methods matrix.
- ⬜ M2 bottom-up vs top-down flow, perception vs imagery, FFA lesions (prosopagnosia, agnosia, akinetopsia).
- ⬜ M3 full retina → LGN → V1 → ventral/dorsal trace; illusions viewer (Müller-Lyer, Kanizsa, Ponzo, checker-shadow).
- ⬜ M4 motor chain + sarcomere, direct/indirect BG pathways, Parkinson's/Huntington's/DBS toggle, attention networks & neglect.
- ⬜ M5 language pathways, aphasia/dyslexia simulator, IAM word-superiority explorer, phoneme restoration, N400/P600.
- ⬜ M6 memory systems, VTA→NAcc reward circuit, hub-and-spoke, encoding specificity, familiarity vs recollection, DRM.
- ⬜ M7 emotion/stress/HPA/empathy circuits, consolidation + sleep replay animation, interference/RIF/reconsolidation.
- ⬜ M8 sleep stage EEG scrubber, VLPO flip-flop switch, SCN/melatonin clock, sleep disorders inspector.

## §6 Literature database

- ✅ 92 citations (≥ 40 required) with `https://doi.org/` links, mapped to weeks and topics, linked from atlas and modules.
- 🟡 DOIs have not been individually re-verified against doi.org — worth a scripted check.

## §7 Study HUD

- 🟡 Exam scope filter — toggle exists on `/study` only (local state). `lib/store.ts` is ready for an app-wide filter (nav, atlas, modules, literature).
- ⬜ "Bigger picture" force-directed mind-map (data ready: 55 nodes / 77 edges in `lib/data/concept-graph.ts`).
- 🟡 Flashcards — 80 text cards with flip + self-grade; **no SM-2 scheduling, no persistence, not 3D/spatial** (should hide labels / highlight structures in the viewer).
- 🟡 Practice quiz — 62 MCQs with instant feedback + score; **no per-goal tracker, no saved attempts, no camera rotation to the relevant circuit**.

## Platform / engineering

- ✅ Auth (sign up, log in, log out, protected routes).
- ✅ VPS deployment scripts (systemd + nginx + PostgreSQL), update script.
- ⬜ API routes for `FlashcardProgress`, `QuizAttempt`, `ModuleProgress`.
- ⬜ Automated tests beyond `scripts/auth-smoke.mjs`; CI.
- ⬜ Prisma migrations (currently `db push`).
- ⬜ Real TLS certificate / domain (currently self-signed on port 8445).

## Suggested build order

1. **Persist study progress**: API routes + SM-2 for flashcards, saved quiz attempts, module completion.
2. **App-wide exam scope** using `lib/store.ts` (nav toggle; filter modules, cards, quiz, literature, atlas list).
3. **Pathway particle streams** in the viewer (render `PathwayStage.paths` as animated flows) and quiz → camera focus.
4. **Mind-map** from the concept graph (2D force layout first, 3D later).
5. **Methods lab** with radar charts from `METHODS`, then EEG/ERP and RT mini-lab (cheap, high exam value).
6. **Per-module simulations**, starting with M4 basal ganglia (direct/indirect + PD/HD/DBS) and M8 flip-flop switch.
7. **Micro-scale lab**: action-potential simulator first (2D/1D plot is fine), then synapse + drugs, then LTP.
8. **Anatomical meshes** (e.g. open-licensed brain surface/subcortical meshes as glTF) to replace ellipsoids; CSF shader; neural-tube morphing.
