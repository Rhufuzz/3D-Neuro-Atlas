# AGENTS.md — handoff guide for AI coding agents

Read this first, then `docs/ROADMAP.md` (what to build next) and `docs/ARCHITECTURE.md` (how it fits together).
The product vision is `docs/SPEC.md`; treat it as the source of truth for features.

## Project in one paragraph

CORTEX-AETHER is a logged-in web app for students of an 11-week Biological & Cognitive Psychology course.
Today it has auth, a Three.js brain viewer with 66 selectable structures (ellipsoid placeholders at MNI152
coordinates), 8 text-based curriculum module pages, a literature list (92 DOIs), and a flashcard + quiz page.
Most of the spec (micro-scale cell/synapse lab, neuroimaging simulators, per-module simulations, mind-map,
spaced repetition, saved progress, real anatomical meshes) is still to be built.

## Origin

The app was first generated on the Abacus.AI app platform and then exported here. Platform-only pieces were
removed for this repo (an injected `<script>` in `app/layout.tsx`, a binary OG image, platform build settings in
`next.config.js`, a fixed Prisma client output path, and a platform-specific seed script). `package.json` was trimmed to
the dependencies the code actually imports. If you add a dependency, add it to `package.json` with an exact version.

## Hard rules

1. **Next.js 16 rules**
   - `params`, `searchParams` (pages, layouts, route handlers) are **Promises**: `const { id } = await params`.
   - `cookies()`, `headers()`, `draftMode()` must be awaited.
   - Middleware is `proxy.ts` exporting `proxy` (never `middleware.ts`). There is none today.
   - Turbopack is the bundler: never add a `webpack` key to `next.config.js`.
   - `next lint` no longer exists.
2. **Auth**: protect server pages/API routes with `const session = await auth()` from `@/auth` (Auth.js v5).
   There is no `getServerSession`/`authOptions`. Every API route that touches user data must return 401 when
   `session?.user` is missing and must take the user id from the session, never from the request.
   Everything under `app/(app)/` is already protected by `app/(app)/layout.tsx`.
3. **Content lives in `lib/data/*.ts`** (typed by `lib/data/types.ts`). Pages and the viewer read from it.
   Add structures/pathways/cards/questions/citations there, not inline in components. Keep ids stable —
   flashcards, quiz items, modules and `FlashcardProgress.cardId` refer to them.
4. **Never commit secrets.** `.env` is git-ignored; document new variables in `.env.example`.
   This repository is public: don't put server IPs, passwords or personal data in it.
5. **Hydration safety**: no `Math.random()`, `Date.now()`, `window`, `localStorage` during render — use
   `useEffect` or client-only components. Three.js code runs only in client components (`'use client'`).
6. **Database changes must be additive** (new tables/nullable columns). Production uses `prisma db push`
   (no migrations folder yet), so a destructive change would drop live data.
7. Keep the dark "bioluminescent neuro-glass" style: background `#05070B`, CSS utility classes in
   `app/globals.css` (`panel`, `panel-hover`, `glass-panel`, `glow-text`, `neuro-bg`, `range-neuro`).

## Verify your work

```bash
npm run typecheck           # must pass (the production build skips type checking: ignoreBuildErrors=true)
npm run build
AUTH_SMOKE_BASE=http://localhost:3000 npm run smoke   # with `npm run dev` running; prints AUTH SMOKE: PASS
```

There are no unit tests yet. For UI work, log in at `/signup` and click through the affected page.

## Where to add things

| Feature (spec section) | Put it in |
|---|---|
| New 3D behaviour (particles along pathways, meshes, CSF shader) | `components/atlas/brain-viewer.tsx` (consider splitting into `components/atlas/*`) |
| Atlas controls / side panels | `app/(app)/atlas/atlas-client.tsx` |
| Micro-scale lab (§3 Tier 2) | new route `app/(app)/micro/` + `components/micro/*` |
| Neuroimaging lab (§4) | new route `app/(app)/methods/` using `METHODS` in `lib/data/methods.ts` |
| Per-module simulations (§5) | `app/(app)/modules/[id]/page.tsx` renders a simulation component chosen by module id |
| Mind-map (§7.2) | new component reading `CONCEPT_NODES` / `CONCEPT_EDGES` from `lib/data/concept-graph.ts` |
| Exam scope everywhere (§7.1) | `lib/store.ts` already has `useStudyStore`, `inScope()`, `maxWeekFor()` — wire it into nav + pages |
| Spaced repetition + saved progress (§7.3) | API routes under `app/api/` using the existing Prisma models `FlashcardProgress` (SM-2 fields ready), `QuizAttempt`, `ModuleProgress` |

## Deployment

Production runs on the owner's VPS at `/opt/cortex-aether` (systemd `cortex-aether`, `127.0.0.1:3100`, nginx
`:8445`). After merging to `main`, the owner (or an agent with SSH access) runs `bash deploy/update.sh` there.
The VPS hosts other apps — never touch other nginx sites, ports or databases. See `docs/DEPLOYMENT_VPS.md`.

## Working conventions

- Small, focused commits; describe what changed and why.
- Update `docs/ROADMAP.md` checkboxes and the README status table when a feature lands.
- Be honest in docs: mark things ✅ only when they work end-to-end in the running app.
