# Roadmap — spec coverage checklist

Legend: ✅ done and working · 🟡 partial / simplified · ⬜ not started. Section numbers refer to `docs/SPEC.md`.
Update this file whenever a feature lands. Simulations are **teaching models with illustrative values**, not
quantitative neuroscience models, unless stated otherwise.

## §2 Visual direction

- 🟡 Obsidian `#05070B` canvas, glass/fresnel materials — custom shader; **no true subsurface scattering**.
- ✅ Toggleable stereotaxic grid.
- ✅ X-ray cortical opacity slider 0.05–1.0.
- 🟡 CSF layer — ventricle system + subarachnoid shell; **no CSF flow/fluid simulation**.
- ✅ Neural development scrubber — neural tube → 3 primary → 5 secondary vesicles (with flexures) → smoothed
  lissencephalic brain → adult folded surface.

## §3 Multi-scale anatomy

- 🟡 Tier 1 macro: 66 selectable structures at MNI coordinates with descriptions/functions/clinical notes/citations.
  Brain surface and subcortical nuclei are real meshes built from MNI152 + Harvard-Oxford (`scripts/build_meshes.py`
  → `public/meshes/brain-v1.glb`); cortical areas and small brainstem nuclei are still ellipsoid markers.
- 🟡 Muscle-fibre / sarcomere anatomy — 2D sliding-filament lab on `/modules/m4` (cross-bridge cycle,
  length–tension, twitch summation/tetanus); no 3D fibre model.
- ✅ Meso pathways (visual, BG motor, language, semantic hub, sleep replay) with animated particle streams and
  stage-by-stage highlighting; deep links `/atlas?s=<structureId>`.
- 🟡 Tier 2 micro-scale (`/micro`, linked from the atlas): 3D zoom-through-scales scene
  (brain → neuron → synapse → ion channel) plus the original 2D labs; not yet a seamless zoom
  out of the atlas camera.
- 🟡 Neuron types + glial cells — 2D explorer (`/micro#cells`).
- ✅ Action-potential simulator — Hodgkin–Huxley integration, resting −70 mV, Na⁺/K⁺ gating, refractory period,
  TTX block, plus saltatory vs continuous conduction panel.
- 🟡 Synaptic transmission + drugs (SSRIs, L-DOPA, benzodiazepines, cocaine, amphetamine, botulinum, curare,
  atropine) — 2D SVG, illustrative values.
- ✅ LTP step-through (Mg²⁺ block, Ca²⁺, CaMKII, AMPA insertion, retrograde NO).

## §4 Neuroimaging & methods lab (`/methods`)

- ✅ Method comparison radar charts (spatial/temporal resolution, invasiveness, …).
- ✅ EEG 10-20 array with sleep rhythms; ERP panel (N400/P600).
- 🟡 fMRI/DTI/TMS/DBS/lesion — cards + 3D highlighting in the viewer; **no BOLD cluster rendering or real
  tractography fibres**.
- ✅ Single-cell orientation tuning curve.
- ✅ Reaction-time mini-lab (Donders subtraction, Posner cueing) — runs in the browser.

## §5 Curriculum modules (Weeks 1–11)

Each module page has goals/concepts/structures/readings, a **Mark complete** button (saved per user) and an
"Interactive simulations" grid (`components/modules/*`). All are 2D SVG/HTML models.

- ✅ M1 history timeline, levels of analysis; links to AP simulator and methods matrix.
- ✅ M2 top-down context (B/13), agnosias (prosopagnosia, akinetopsia, …), Thatcher illusion, mental rotation.
- ✅ M3 illusions (Müller-Lyer, Ponzo, Kanizsa, lightness), ventral/dorsal stream chain, centre–surround RF.
- ✅ M4 direct/indirect basal-ganglia rate model with normal/PD/HD/L-DOPA/DBS; neglect line bisection +
  cancellation; sliding-filament sarcomere lab (cross-bridge cycle, length–tension, tetanus).
- ✅ M5 aphasia classifier (fluency/comprehension/repetition → 8 syndromes), word-superiority flash task;
  N400/P600 in `/methods#erp`.
- ✅ M6 memory systems + H.M., DRM false memory, dopamine RPE raster, encoding specificity (Godden–Baddeley).
- ✅ M7 HPA axis stepper (acute vs chronic), reconsolidation (Nader), Iowa Gambling Task.
- ✅ M8 hypnogram + per-stage EEG, VLPO flip-flop (two-process model, orexin on/off), SCN/melatonin clock with
  screen-light toggle, sleep disorders inspector.

## §6 Literature database

- ✅ 92 citations (≥ 40 required) with `https://doi.org/` links, mapped to weeks/topics, cited from atlas, labs and
  module simulations (citation chips).
- 🟡 DOIs have not been individually re-verified against doi.org.

## §7 Study HUD

- ✅ App-wide exam scope toggle (Partial = Weeks 1–7 / Final = 1–11) in the nav; filters atlas, modules,
  mind-map, study items and literature.
- ✅ "Bigger picture" force-directed mind-map (`/mindmap`, 2D).
- ✅ Flashcards with SM-2 scheduling saved per user; cards with a structure hide the label and highlight it in 3D.
- ✅ Practice quiz with saved attempts, per-goal tracker and 3D focus on the relevant structure.

## Platform / engineering

- ✅ Auth (sign up, log in, log out, protected routes).
- ✅ API routes `/api/progress/{flashcards,quiz,modules}` (401 when signed out).
- ✅ VPS deployment scripts (systemd + nginx + PostgreSQL), update script.
- ⬜ Automated tests beyond `scripts/auth-smoke.mjs`; CI.
- ⬜ Prisma migrations (currently `db push`).
- ⬜ Real TLS certificate / domain (currently self-signed).

## Next candidates

1. BOLD cluster overlays and DTI fibre bundles in the viewer.
2. Seamless zoom from the atlas camera straight into the micro-scale scene (currently a separate scene on `/micro#zoom`).
3. Scripted DOI verification; unit tests for `lib/sm2.ts` and `lib/force-layout.ts`; CI.
4. Prisma migrations and a real TLS certificate.
5. Atlas visual-quality pass — real cortical-area meshes (Harvard-Oxford cortical) + materials/lighting
   overhaul to meet the owner's bar: as detailed as and more beautiful than
   <https://neurotorium.org/tool/brain-atlas/> (see AGENTS.md).

## Done in the AAA pass (83a14f7)

- ✅ Atlas visual pass (candidate 5): bloom + ACES tone mapping, cinematic intro + branded loading
  progress, starfield, idle cinematography, fake-SSS shader tint; **real Harvard-Oxford cortical
  parcellation baked per-vertex** (100% surface coverage, side-audited) — cortical coloring and
  picking now follow true anatomy; seed Voronoi kept as fallback.
- ✅ `/api/health` operational probe (DB-backed 200/503).
