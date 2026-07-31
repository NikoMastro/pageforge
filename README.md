# PageForge — Landing Page Builder

A visual builder that turns landing pages and link-in-bio profiles into versioned JSON configurations, with live WYSIWYG preview, configuration management, A/B experiment tooling, and a one-click deployment pipeline.

> **Showcase repository.** This is a sanitized version of a production platform built for a client. Branding, credentials, infrastructure identifiers, and data have been removed or replaced. The GCP-based deployment pipeline is **disabled but kept in the code (commented out)** so the architecture stays reviewable; storage runs on **MongoDB** instead of Firestore so anyone can run and try the builder.

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
│   ├── routes/              REST routes; GCP/Cloudflare ones disabled-but-visible
│   └── utils/               Cloud Build orchestration (disabled in showcase)
├── crawler/                 GCP Cloud Function: Lighthouse/URL analysis (reference)
├── api/                     Vercel serverless wrapper around the Express backend
└── Docs/                    Architecture & API docs + legacy deploy workflows
```

## How it worked in production

Pages were stored in **Firestore**, and "Deploy" pushed the page JSON to a **GCP Cloud Build** trigger that built `deployment-runtime` with the JSON baked in and published it to static hosting behind Cloudflare (with domain management and cache invalidation handled by companion services). Auth was **Google Identity-Aware Proxy** at the load balancer. All of that code is still here, commented out where it would require accounts you don't have.

## Run the showcase

Storage is a single MongoDB connection — a free [Atlas M0](https://www.mongodb.com/cloud/atlas) or local Docker works.

```bash
npm install

# Terminal 1 — MongoDB + backend (Docker)
docker compose up

# Terminal 2 — builder UI
npm run dev
```

Or without Docker: run MongoDB yourself and `MONGODB_URI=... npm run dev:backend`.

The UI runs on `http://localhost:5173`, the API on `http://localhost:8080`. See `.env.example` for configuration.

### Showcase guardrails

Because the demo is publicly writable, the backend enforces:
- max **50 pages** per collection,
- max **20 saved versions** per page (older versions pruned),
- max **1 MB** per document.

See `backend/mongoutils/storage.js`.

### Deploy on Vercel

Import the repo — `vercel.json` builds the frontend and runs the backend as a serverless function under `/api`. Set `MONGODB_URI` (and optionally `MONGODB_DB`) in the Vercel project's environment variables.

## Notes

- The **Deploy** buttons return HTTP 501 in the showcase — deployment needed the client's GCP pipeline.
- Media library, AI video generation (Vertex AI), URL crawler, and Cloudflare integrations are disabled for the same reason; their code remains for review.
- Legacy CI/CD workflows (Cloud Run deploys via Workload Identity Federation) are parked in `Docs/legacy-workflows/`.
