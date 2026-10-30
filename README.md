# CORTEX-AETHER · Interactive 3D Neuro-Atlas

An interactive 3D neuro-atlas and study engine for an 11-week **Biological & Cognitive Psychology** course
(Carlson & Birkett + Cognitive Psychology syllabus). The full product vision is in [`docs/SPEC.md`](docs/SPEC.md).

> **Status: early, partial build (v0.1).** The foundation works (accounts, a WebGL brain viewer with
> selectable structures, 8 curriculum module pages, a 92-entry literature list, flashcards and a quiz),
> but most of the spec's simulations are **not built yet**. See [`docs/ROADMAP.md`](docs/ROADMAP.md) for the
> exact checklist. AI agents: start with [`AGENTS.md`](AGENTS.md).

## What works today

| Area | State | Notes |
|---|---|---|
| Sign up / log in / log out | ✅ | Email + password (Auth.js v5 credentials, bcrypt, JWT sessions). All app pages require login. |
| 3D Atlas (`/atlas`) | 🟡 | Three.js viewer: 66 structures (24 cortical areas, 37 deep/brainstem/ventricle structures, 5 lobes) placed at MNI152 coordinates as glass-shaded **ellipsoid placeholders** (not real meshes). Click to select, cortex opacity 0.05–1, stereotaxic grid, CSF (ventricles) toggle, development slider (scales the brain + stage text), 5 pathways with stage-by-stage highlighting. |
| Curriculum modules (`/modules`, `/modules/m1..m8`) | 🟡 | 8 modules (Weeks 1–11) with goals, key concepts, structures and readings. **Text only — no per-module simulations yet.** |
| Literature (`/literature`) | ✅ | 92 citations with DOI links, grouped by week. DOIs were not individually re-verified. |
| Study tools (`/study`) | 🟡 | Partial/Final scope toggle, 80 flashcards (self-grade buttons just advance, no spaced repetition yet), 62-question quiz with instant feedback and score. Nothing is saved to the database yet. |
| Micro-scale (neurons, synapses, LTP), neuroimaging lab, illusions, mind-map | ⬜ | Not started (data for methods and the concept graph exists in `lib/data`). |

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

The app runs on an Ubuntu VPS next to other apps: systemd service on `127.0.0.1:3100`, nginx TLS on port `8445`.
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
