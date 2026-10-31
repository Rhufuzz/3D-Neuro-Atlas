# CORTEX-AETHER · Interactive 3D Neuro-Atlas

An interactive 3D neuro-atlas and study engine for an 11-week **Biological & Cognitive Psychology** course
(Carlson & Birkett + Cognitive Psychology syllabus). The full product vision is in [`docs/SPEC.md`](docs/SPEC.md).

> **Status: v0.2 — most of the spec is built.** Accounts, a WebGL atlas with real MNI152-derived meshes,
> micro-scale and methods labs, 8 modules with interactive simulations, a mind-map, and saved spaced-repetition
> study tools. Simulations are 2D teaching models with illustrative values. Remaining gaps (3D micro
> zoom, BOLD/DTI rendering, CI, migrations, real TLS) are listed in [`docs/ROADMAP.md`](docs/ROADMAP.md).
> AI agents: start with [`AGENTS.md`](AGENTS.md).

## What works today

| Area | State | Notes |
|---|---|---|
| Sign up / log in / log out | ✅ | Email + password (Auth.js v5 credentials, bcrypt, JWT sessions). All app pages require login. |
| 3D Atlas (`/atlas`) | 🟡 | Three.js viewer: 66 structures; brain surface + subcortical nuclei are real meshes (MNI152 + Harvard-Oxford, `public/meshes/brain-v1.glb`), cortical areas are still ellipsoid markers. Cortex opacity, grid, CSF (ventricles + subarachnoid shell), neural-tube → adult development scrubber, 5 pathways with particle streams, `?s=<id>` deep links. No true SSS. |
| Micro-scale lab (`/micro`) | ✅ | 3D zoom-through-scales scene (brain → neuron → synapse → ion channel, scroll-driven), Hodgkin–Huxley AP simulator, conduction, neuron/glia explorer, synapse + drug simulator, LTP steps. |
| Methods lab (`/methods`) | 🟡 | Radar comparison, EEG 10-20 + rhythms, ERPs (N400/P600), tuning curve, RT mini-lab (Donders, Posner), fMRI/DTI/TMS/DBS/lesion cards. No BOLD/DTI rendering. |
| Curriculum modules (`/modules`, `/modules/m1..m8`) | ✅ | 8 modules with **guided learning paths** (step-by-step intuition → interactive practice), **tickable learning goals**, key concepts, saved "Mark complete", interactive simulations, and a **playful drill** (exam-style questions with instant feedback + flashcard round, attempt saved per user; e.g. basal-ganglia PD/HD/DBS model, VLPO flip-flop, aphasia classifier, DRM, IGT, sliding-filament sarcomere lab). |
| Mind-map (`/mindmap`) | ✅ | Force-directed concept graph (2D). |
| Literature (`/literature`) | ✅ | 95 citations with DOI links, grouped by week. `npm run checkdois`: 0 dead (55 resolve, 40 publisher-bot-walled). |
| Exam Prep (`/exam`) | ✅ | Exam dates/material/countdowns, the full 65-question official sample exam with answer key (exam mode + check-as-you-go study mode), all weekly learning goals as a tick-off tracker, and the study-guide tips. |
| Study tools (`/study`) | ✅ | App-wide Partial/Final scope, SM-2 flashcards and quiz attempts saved per user, per-goal tracker, 3D structure focus. |

## Tech stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 3 · Three.js 0.170 (raw, no R3F) ·
Auth.js / next-auth 5 beta · Prisma 6 + PostgreSQL · zustand · lucide-react · sonner.

## Run locally

Requirements: Node ≥ 20.9 and a PostgreSQL database.

```bash
cp .env.example .env          # set DATABASE_URL and AUTH_SECRET/NEXTAUTH_SECRET; NEXTAUTH_URL=http://localhost:3000
npm install --legacy-peer-deps
npx prisma db push            # creates the tables
npm run dev                   # http://localhost:3000  -> create an account at /signup
```

Useful scripts: `npm run typecheck`, `npm run build`, `npm run seed` (optional admin from `SEED_ADMIN_*`),
`AUTH_SMOKE_BASE=http://localhost:3000 npm run smoke` (end-to-end auth test; creates a throwaway `smoke_*@example.com` user).

## Deploy to a VPS

The app runs on an Ubuntu VPS next to other apps: systemd service on `127.0.0.1:3100`, nginx TLS on
port `8445` (self-signed) and `8446` (valid Let's Encrypt via `ptclab-backup.duckdns.org`).
Full runbook: [`docs/DEPLOYMENT_VPS.md`](docs/DEPLOYMENT_VPS.md). Updating after a push to `main`:

```bash
ssh root@YOUR_VPS_IP
cd /opt/cortex-aether && bash deploy/update.sh
```

## Repository layout

```
app/                 routes (App Router). (app)/ = logged-in area; login/, signup/, api/
components/atlas/    brain-viewer.tsx — the Three.js scene
lib/data/            ALL content: structures, pathways, curriculum, flashcards, quiz, citations, methods, concept graph
lib/                 db.ts (Prisma client), store.ts (exam-scope store, not wired yet), utils.ts
prisma/schema.prisma database schema (users + progress tables)
scripts/             seed.ts, auth-smoke.mjs
deploy/              VPS scripts, systemd unit, nginx site
docs/                SPEC, ARCHITECTURE, ROADMAP, DEPLOYMENT_VPS
```

## Documentation

- [`AGENTS.md`](AGENTS.md) — handoff guide and rules for AI coding agents
- [`docs/SPEC.md`](docs/SPEC.md) — original product specification (verbatim)
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the code fits together
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — spec checklist: done / partial / not started, and suggested build order
- [`docs/DEPLOYMENT_VPS.md`](docs/DEPLOYMENT_VPS.md) — server setup, operations, troubleshooting
