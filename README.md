<a href="https://pageforge-tau.vercel.app/library"> # PageForge — Landing Page Builder </a>

A visual builder that turns game landing pages and link-in-bio profiles into **versioned JSON configurations** — live WYSIWYG preview, revision history, A/B experiment tooling, and a one-click deployment pipeline.

> **Showcase repository.** This is a sanitized version of a production platform built for a client. Branding, credentials, infrastructure identifiers, and data have been removed or replaced. The GCP-based deployment pipeline is **disabled but kept in the code (commented out)** so the architecture stays reviewable; storage runs on **MongoDB** instead of Firestore so anyone can run and try the builder.

## What it does

- **Landing page editor** — compose pages from configurable sections (hero, Steam store widget, video player, screenshot carousel, media grid, feature columns, FAQ, footer…) with three presets (Basic / Widget / Full-Content), per-section solid/gradient/image backgrounds, and live preview in phone / macbook / desktop frames.
- **LinkBio editor** — link-in-bio profiles (stores, consoles, mobile, socials, footer) rendered from the same JSON-first pipeline.
- **Everything is versioned** — each save is an immutable revision with author, message, and timestamp; pages are plain JSON all the way down.
- **Experiments & configs** — A/B experiment definitions and shared configuration documents managed through the same storage layer.
- **URL Tester** — an in-process crawler (Playwright + Lighthouse) that audits any URL: performance scores, pixel/iframe detection, redirects (local runs only).
- **Media library** — read-only, folder-scoped Cloudinary browsing.

The five demo pages (four game landing pages — *Hades, Stardew Valley, Hollow Knight, Celeste* — and the *PageForge Games* LinkBio hub) are seeded from real Steam store data with official YouTube trailers, and are permanent: visitors can inspect them in the editor but not alter them.

## What's inside

```
├── app/
│   ├── frontend/            React + Vite builder UI (editors, previews, experiments)
│   ├── static-websites/     Shared React components that render page JSON (used by
│   │                        both the editor preview and the deployed pages)
│   └── deployment-runtime/  Vite app that hydrates a deployed page from its JSON
├── backend/                 Express API — page/config/experiment CRUD
│   ├── mongoutils/          MongoDB storage adapter (showcase storage)
│   ├── firestoreutils/      Original Firestore storage (kept for reference)
│   ├── config/showcase.js   Public-demo protection policy
│   ├── routes/              REST routes; GCP/Cloudflare ones disabled-but-visible
│   └── utils/               Cloud Build orchestration (disabled in showcase)
├── crawler/                 URL analyzer (Playwright + Lighthouse) — ran as a GCP
│                            Cloud Function in production, runs in-process here
├── api/                     Vercel serverless wrapper around the Express backend
├── scripts/                 Demo page seeding
└── Docs/                    Architecture & API docs + legacy deploy workflows
```

## How it worked in production

Pages were stored in **Firestore**, and "Deploy" pushed the page JSON to a **GCP Cloud Build** trigger that built `deployment-runtime` with the JSON baked in and published it to static hosting behind Cloudflare (with domain management and cache invalidation handled by companion services). Auth was **Google Identity-Aware Proxy** at the load balancer. All of that code is still here, commented out where it would require accounts you don't have.

## Run the showcase

Storage is a single MongoDB connection — a free [Atlas M0](https://www.mongodb.com/cloud/atlas) cluster is the easiest path.

```bash
npm install
cp .env.example .env   # then set MONGODB_URI to your cluster

# Terminal 1 — backend API
npm run dev:backend

# Terminal 2 — builder UI
npm run dev
```

The UI runs on `http://localhost:5173`, the API on `http://localhost:8080`. `dev:backend` loads `.env` automatically (Node `--env-file-if-exists`). Alternatively, `docker compose up` starts a local MongoDB + backend without Atlas.

Seed the demo pages (game LPs + LinkBio hub):

```bash
ADMIN_TOKEN=... node scripts/seed-demo-pages.js
```

### Showcase guardrails

Because the demo is publicly writable, the backend enforces:

| Protection | Detail |
|---|---|
| Page cap | max **10 pages** per collection |
| Self-cleaning | visitor-created pages **expire after 1 hour** (MongoDB TTL index) |
| Version cap | max **20 saved versions** per page (older versions pruned) |
| Size cap | max **1 MB** per document and per request body |
| Rate limits | per-IP, **120 reads/min · 20 writes/5 min** |
| Permanent pages | demo pages are **admin-locked** — modifying or deleting them requires the `x-admin-token` header matching `ADMIN_TOKEN` (fail closed) |
| Media library | **read-only**, scoped to a single Cloudinary folder |
| Input validation | no Mongo operator injection, no search-expression breakout |
| Crawlers | `robots.txt` asks bots to stay out of `/api/` |

See `backend/config/showcase.js`, `backend/mongoutils/storage.js`, and `backend/middleware/rateLimiter.js`.

### Deploy on Vercel

Import the repo — `vercel.json` builds the frontend and runs the backend as a serverless function under `/api`. Set the environment variables in the Vercel project:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | your MongoDB cluster (required) |
| `MONGODB_DB` | database name (default `pageforge`) |
| `ADMIN_TOKEN` | long random string protecting the permanent demo pages |
| `CLOUDINARY_URL` | `cloudinary://key:secret@cloud_name` for the media library |
| `CLOUDINARY_FOLDER` | folder served by the library (default `ShowcasePCH`) |

Then seed the demo pages against the deployment:

```bash
ADMIN_TOKEN=... API_URL=https://your-demo.vercel.app/api node scripts/seed-demo-pages.js
```

### URL Tester (local only)

The URL Tester drives the `crawler/` package **in-process**: Playwright loads the page, Lighthouse audits it, and a battery of pixel/iframe analyzers run. One-time setup:

```bash
npm run setup:crawler
```

In production the crawler was a GCP Cloud Function called through an authenticated proxy (`backend/routes/crawler/crawlerRoute.js`, kept for reference). Because it needs a real Chromium, the endpoint is disabled on the hosted Vercel demo.

### Media library (read-only)

In production the library was Cloudflare Images/Stream. The showcase serves a **read-only Cloudinary folder** instead (`backend/routes/library/cloudinaryLibraryRoute.js`): only list/get endpoints exist, results are scoped to one folder, responses are cached, and all upload/edit/delete endpoints return 403. Linking media by URL in the editor is a plain text field and stays available.

## Notes

- The **Deploy** buttons return HTTP 501 in the showcase — deployment needed the client's GCP pipeline.
- AI video generation (Vertex AI) and the Cloudflare integrations are disabled; their code remains for review.
- Legacy CI/CD workflows (Cloud Run deploys via Workload Identity Federation) are parked in `Docs/legacy-workflows/`.
- Demo page content (game art, screenshots, trailers) is hotlinked from Steam's public CDN and official YouTube channels for demonstration purposes; all rights belong to their respective owners.
