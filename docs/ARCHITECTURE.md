# Architecture

## Routes

| Route | File | Type | Purpose |
|---|---|---|---|
| `/` | `app/page.tsx` | server | Redirects to `/atlas` (logged in) or `/login` |
| `/login`, `/signup` | `app/login/page.tsx`, `app/signup/page.tsx`, shared `app/login/auth-form.tsx` | client form | Credentials sign-in / account creation |
| `/atlas` | `app/(app)/atlas/page.tsx` → `atlas-client.tsx` | client | 3D viewer + controls + structure list + pathway player + info panel |
| `/modules` | `app/(app)/modules/page.tsx` | server | Grid of the 8 curriculum modules |
| `/modules/[id]` | `app/(app)/modules/[id]/page.tsx` | server | Module detail (`m1`…`m8`): goals, key concepts, structures, readings |
| `/literature` | `app/(app)/literature/page.tsx` | server | All citations grouped by week, DOI links |
| `/study` | `app/(app)/study/page.tsx` → `study-client.tsx` | client | Exam-scope toggle, flashcards, quiz |
| `/api/auth/[...nextauth]` | route handler | API | Auth.js handlers (`GET`/`POST` from `@/auth`) |
| `/api/auth/login` | route handler | API | JSON credential pre-check (returns clear error messages; not called by the current form) |
| `/api/signup` | route handler | API | Creates a user (bcrypt hash, password ≥ 6 chars) |

`app/(app)/layout.tsx` calls `auth()` and redirects to `/login` when there is no session; it also renders the
sidebar (modules listed from `MODULES`) and the sign-out button. The root `app/layout.tsx` forces the dark theme
and loads fonts (DM Sans, Plus Jakarta Sans, JetBrains Mono via `next/font/google` — needs internet at build time).

## Auth flow

`auth.ts` configures Auth.js v5: Credentials provider (email + bcrypt password check against `User.password`),
`PrismaAdapter`, `session.strategy = 'jwt'`, `trustHost: true`, custom sign-in page `/login`. The JWT/session
callbacks copy `id` and `role` onto `session.user` (typed in `types/next-auth.d.ts`). Sign-up posts to
`/api/signup`, then the form calls `signIn('credentials')`.

## Content data (`lib/data`)

All course content is static TypeScript, typed in `lib/data/types.ts`. Counts as of v0.1:

| File | Export | Count | Used by |
|---|---|---|---|
| `structures-cortex.ts` | `CORTICAL_AREAS`, `LOBES` | 24 areas, 5 lobes | atlas, viewer |
| `structures-deep.ts` | `DEEP_STRUCTURES` | 37 (subcortical, brainstem, cerebellum, spinal, white matter, ventricles) | atlas, viewer |
| `structures.ts` | `ALL_STRUCTURES`, `STRUCTURE_MAP`, `getStructure`, `ATLAS_SECTIONS`, `expandIds`, `formatMni` | 66 total | atlas, viewer, modules |
| `pathways.ts` | `PATHWAYS`, `PATHWAY_MAP` | 5 (visual, bg-motor, language, semantic, replay), 5 stages each | atlas |
| `curriculum.ts` | `MODULES`, `getModule`, `WEEK_TOPICS` | 8 modules (m1 W1–2, m2 W3, m3 W4, m4 W5, m5 W6, m6 W9, m7 W10, m8 W11) | nav, modules |
| `citations.ts` | `CITATIONS`, `getCitation` | 92 | literature, atlas, modules |
| `flashcards.ts` | `FLASHCARDS` | 80 | study |
| `quiz.ts` | `QUIZ` | 62 | study |
| `methods.ts` | `METHODS`, `DEV_STAGES`, `devStageAt` | 7 methods, 6 dev stages | atlas uses `devStageAt`; `METHODS` unused so far |
| `concept-graph.ts` | `CONCEPT_NODES`, `CONCEPT_EDGES` | 55 nodes, 77 edges | **unused so far** (for the mind-map) |

Each `BrainStructure` has an MNI152 coordinate (right hemisphere for bilateral ones), colour, description,
functions, clinical notes, weeks and citation ids. Pathway stages carry `highlight` structure ids and `paths`
(MNI polylines) — **the polylines are not rendered yet**; only the highlight is used.

## 3D viewer (`components/atlas/brain-viewer.tsx`)

- Plain Three.js inside a client component (`useEffect` creates renderer, scene, camera, `OrbitControls`;
  cleans up on unmount). Props: `opacity, showGrid, showCsf, showDeep, dev, selected, highlight, onSelect, compact`.
- Coordinates: `mni(x, y, z) = (x·S, (z−10)·S, −(y+18)·S)` with `S = 0.025` (MNI mm → scene units; +y up, −z anterior).
- Geometry is placeholder: hemispheres are deformed spheres; every structure is an ellipsoid with radii from the
  `RADII` table (mm) at its MNI coordinate, mirrored for bilateral structures.
- Material: one custom `ShaderMaterial` (fresnel rim, iridescence, highlight pulse, additive "flow" for ventricles).
- Interaction: raycast click → `onSelect(id)`; selection/highlight sets `uHi`; camera target lerps to the selection;
  the development slider scales the whole root group by `0.35 + 0.65·dev`.

## State

No global state is used by pages yet. `lib/store.ts` defines a persisted zustand store (`useStudyStore`, exam scope
`partial | final`) with helpers `inScope(weeks, scope)` and `maxWeekFor(scope)` (partial = weeks ≤ 7). The study
page currently keeps its own local scope state.

## Database (`prisma/schema.prisma`)

- `User` (email unique, bcrypt `password`, `role` default `student`), `Account`, `Session`, `VerificationToken` (Auth.js).
- `FlashcardProgress` (per user × card: SM-2 `easeFactor`, `interval`, `repetitions`, `lapses`, `dueAt`, …) — **no API yet**.
- `QuizAttempt` (mode, scope, score, total, answers JSON) — **no API yet**.
- `ModuleProgress` (per user × module, `completed`) — **no API yet**.

Schema changes are applied with `npx prisma db push` (no migration history yet). Keep changes additive.

## Styling

Tailwind 3 with CSS variables (`app/globals.css`, `tailwind.config.ts`), forced dark theme (`next-themes`).
Reusable classes: `panel`, `panel-hover`, `glass-panel`, `glow-text`, `neuro-bg`, `range-neuro`. Icons: lucide-react.
Toasts: sonner (`components/ui/sonner.tsx`).
