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
  → `public/meshes/brain-v1.glb`). The brain surface carries the real Harvard-Oxford cortical
  parcellation baked per-vertex (colouring and picking follow true anatomy; seed Voronoi kept as
  fallback); small brainstem nuclei are still markers.
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

Each module page has guided learning paths (step-by-step intuition → interactive practice), tickable learning
goals, key concepts/structures/readings, a **Mark complete** button (saved per user), an "Interactive
simulations" grid (`components/modules/*`, all 2D SVG/HTML models), an exam-style drill with instant feedback,
and the arcade games listed under §7.

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

- ✅ 95 citations (≥ 40 required) with `https://doi.org/` links, mapped to weeks/topics, grouped by
  week, cited from atlas, labs and module simulations (citation chips). Scripted verification
  (`npm run checkdois`): **0 dead DOIs** — 55 resolve, 40 sit behind publisher bot-walls (403, not dead).

## §7 Study HUD

- ✅ **Home dashboard** (`/home`, post-login landing): continue-where-you-left-off (first uncompleted module),
  exam countdowns, a 4-step "how to use this app" guide, module grid with completion ticks, lab quick links.
- ✅ **Exam-readiness analytics** on `/home` (`/api/progress/readiness`): estimated course mastery vs 55%
  pass line, cards due today counter, and top 3 weakest learning goals to study next.
- ✅ **Study streak tracking**: consecutive study days counter displayed with fire badge on `/home`.
- ✅ **Mistake Review Mode** (`/study#mistakes`): rapid-fire drill on the student's personal error deck.
- ✅ **Interactive Simulation Challenges**: discovery puzzles with hints on module simulations (`SimChallenge`).
- ✅ **Printable Exam Reference Sheet** (`/exam/cheat-sheet`): print-optimized quick-revision sheet with key formulas,
  pharmacology matrix, aphasia table, and scope-filtered learning goals.
- ✅ **Automated daily PostgreSQL backups**: `scripts/backup.sh` (03:00 UTC daily cron, 14-day retention).
- ✅ **Wrong-answer → flashcard loop**: 1-click "Add to review deck" on missed drill, quiz, and sample-exam
  questions; creates user flashcards (`UserFlashcard`) that enter the SM-2 review queue.
- ✅ **Sample-exam analytics**: per-part breakdown (Part 1 Midterm vs Part 2 Post-midterm) with pass-range
  scores and auto-saved attempts (`SampleExamAttempt`).
- ✅ **Elaboration prompts**: "Explain in your own words" generation-effect boxes with confidence ratings
  (Clear / Shaky / Lost) per learning goal (`GoalElaboration`).
- ✅ First-visit onboarding tour (4 steps: modules → labs → spaced repetition → exam prep), dismissible.
- ✅ Guided-path steps and learning-goal ticks **synced to the account** (`/api/progress/learn`, `/api/progress/goals`;
  localStorage union-merged and migrated up on first load; offline fallback).
- ✅ **Try-this** guided micro-instructions above every lab section and module simulation
  (`lib/data/try-this.ts`) — concrete do-this-watch-for-that steps tied to the real controls.
- ✅ Curriculum back-links: every Micro/Methods section shows "Part of Module N", and atlas structures
  link the modules that teach them (weeks intersection).
- ✅ App-wide exam scope toggle (Partial = Weeks 1–7 / Final = 1–11) in the nav; filters atlas, modules,
  mind-map, study items and literature.
- ✅ Exam Prep page (`/exam`): exam logistics from the official manual (dates, 60-MC format, pass rules),
  the complete 65-question sample exam with the published key (exam + study modes), per-week learning
  goals from the study guide as an interactive checklist, and the study-strategy tips.
- ✅ "Bigger picture" force-directed mind-map (`/mindmap`, 2D).
- ✅ Flashcards with SM-2 scheduling saved per user; cards with a structure hide the label and highlight it in 3D.
- ✅ Practice quiz with saved attempts, per-goal tracker and 3D focus on the relevant structure.
- ✅ Module arcade on every module page: match game (term ↔ description), structure finder,
  60-second sprint (misses reviewed after), and an XP meter (Rookie → Brainiac) fed by guided
  steps, goals, drill and games.

## Platform / engineering

- ✅ Auth (sign up, log in, log out, protected routes).
- ✅ Mobile-first iOS shell: native-style bottom tab bar (Home/Atlas/Modules/Study/More) with iOS action
  sheet for labs/exam tools, safe-area insets (notch + home indicator), SF Pro system font, tactile press
  states, scroll-aware top bar with back buttons, and viewer-first atlas layout with selection bottom-card.
- ✅ API routes `/api/progress/{flashcards,quiz,modules}` (401 when signed out).
- ✅ VPS deployment scripts (systemd + nginx + PostgreSQL), update script.
- ✅ Automated tests: node:test suites for `lib/sm2.ts` and `lib/force-layout.ts` (`npm test`);
  GitHub Actions CI (typecheck → tests → build, DOI report).
- ✅ Prisma migrations: `000000000000_init` baselined from the `db push` schema (verified drift-free);
  live DB marked applied; `deploy.sh` runs `migrate deploy`. See `prisma/migrations/README.md`.
- 🟡 Real TLS: **valid Let's Encrypt certificate** served at `https://ptclab-backup.duckdns.org:8446`
  (reuses the host's existing LE cert; site config in `deploy/nginx-cortex-aether-le.conf`, auth
  smoke passes over it). A dedicated domain for the app itself needs the owner's DNS/token.

## Next candidates

1. Seamless zoom from the atlas camera straight into the micro-scale scene (atlas overlay exists; a true single-camera morph is the next step).
2. BOLD/DTI overlays with real datasets (currently illustrative geometry).
3. Visual polish beyond the AAA pass — true subsurface scattering, CSF flow simulation; owner's bar:
   as detailed as and more beautiful than <https://neurotorium.org/tool/brain-atlas/> (see AGENTS.md).
4. Dedicated domain for the app itself (certbot is installed; LE cert currently reuses
   `ptclab-backup.duckdns.org` and needs the owner's DNS/token).

## Done in the AAA pass (83a14f7)

- ✅ Atlas visual pass (candidate 5): bloom + ACES tone mapping, cinematic intro + branded loading
  progress, starfield, idle cinematography, fake-SSS shader tint; **real Harvard-Oxford cortical
  parcellation baked per-vertex** (100% surface coverage, side-audited) — cortical coloring and
  picking now follow true anatomy; seed Voronoi kept as fallback.
- ✅ `/api/health` operational probe (DB-backed 200/503).
