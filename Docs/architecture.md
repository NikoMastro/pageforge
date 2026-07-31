# PageForge Architecture

## Project Overview

PageForge is a monorepo application that manages dynamic landing pages and LinkBio pages. The project is organized into several main components:

- **Backend**: Express.js API server managing data and orchestrating builds
- **Crawler**: Serverless web crawler for URL analysis and Lighthouse metrics
- **Packages**: NPM workspaces containing reusable components and deployment tools
- **Frontend**: Main application and Internal management UI for creating and editing pages

---

## Top-Level Structure

### `/backend/` - API Server

**Role**: Core Express.js server providing REST APIs for all application features.

**Technology**: Node.js, Express, Firebase Admin, Google Cloud APIs

**Key Responsibilities**:
- Firestore data management (CRUD operations)
- Authentication and authorization (IAP users)
- Landing page and LinkBio JSON configuration management
- Build orchestration and deployment triggers
- Integration with Google Cloud services (BigQuery, Storage, Vertex AI)
- Cloud Build API interactions

**Structure**:
```
backend/
├── server.js                      - Main Express app entry point
├── config/
│   ├── firebase.js               - Firebase Admin SDK initialization
│   └── config.js                 - Environment configuration
├── core/
│   ├── baseRoute.js              - Base class for route handlers
│   └── routeRegistry.js          - Dynamic route registration system
├── middleware/
│   └── corsMiddleware.js         - CORS configuration
├── routes/                        - API endpoints organized by feature
│   ├── landingpages/             - Landing page management APIs
│   ├── linkbio/                  - LinkBio management APIs
│   ├── config/                   - Configuration management
│   ├── auth/                     - Authentication endpoints
│   ├── crawler/                  - Crawler integration
│   ├── experiment/               - A/B testing experiments
│   ├── vertexai/                 - AI/ML integration
│   ├── gcputils/                  - Azure utilities (BigQuery, GCS, etc.)
│   └── cloudfare/                - Cloudflare API integration
├── firestoreutils/               - Firestore helper functions
└── utils/                        - Cloud Build and other utilities
```

**Key Features**:
- RESTful API with modular route registration
- All routes extend `baseRoute.js` for consistency
- Firestore as primary database
- Integration with deployment pipelines

---

### `/crawler/` - Serverless Web Crawler

**Role**: Google Cloud Function for analyzing URLs and generating performance metrics.

**Technology**: TypeScript, Playwright, Lighthouse, Google Cloud Functions (Gen 2)

**Key Responsibilities**:
- URL content analysis and screenshot capture
- Lighthouse performance audits
- Network traffic interception
- Iframe detection and analysis
- Page interaction simulation
- Returns structured data for storage in Firestore

**Structure**:
```
crawler/
├── src/
│   ├── index.ts                  - Cloud Function entry point
│   ├── handlers/
│   │   └── analyze-url.ts        - Main URL analysis handler
│   ├── services/
│   │   ├── browser-manager.ts    - Playwright browser lifecycle
│   │   ├── capture-services.ts   - Screenshot and video capture
│   │   ├── crawler.ts            - Core crawling logic
│   │   ├── iframe-analyzer.ts    - Iframe detection
│   │   ├── lighthouse.ts         - Lighthouse integration
│   │   ├── network-interceptor.ts - Network monitoring
│   │   └── page-interactions.ts  - User interaction simulation
│   └── shared/
│       ├── config.ts             - Configuration
│       └── schema.ts             - Zod validation schemas
├── tsconfig.json
└── deploy.sh                     - Deployment script
```

**Deployment**: Standalone Cloud Function, not part of workspace build

---

## `/app/` - NPM Workspaces

The app directory contains the core workspace modules managed by npm workspaces.

### `app/static-websites/` - Shared Component Library

**Workspace Name**: `@pageforge/static-websites`

**Role**: React component library containing all UI components for landing pages and LinkBio pages.

**Technology**: TypeScript, React (no build step - consumed as source)

**Key Characteristics**:
- **No build step**: Components consumed directly as TypeScript source
- **Type-only package**: Provides types and React components
- **Shared across deployments**: Used by both pageforge, lp-deployment, and zt-deployment

**Structure**:
```
app/static-websites/
├── components/
│   ├── index.ts                  - Main exports: JsonLanding, LinkBioPage
│   ├── types.ts                  - Shared TypeScript types
│   ├── landingPage/              - Landing page components
│   │   ├── jsonLanding.tsx       - Main landing page renderer
│   │   ├── navbar.tsx
│   │   ├── hero.tsx
│   │   ├── footer.tsx
│   │   ├── buttons/              - Button components
│   │   └── widgets/              - Widget components
│   └── linkbio/                  - LinkBio components
│       ├── linkBioLanding.tsx    - Main LinkBio renderer
│       ├── profileCard.tsx
│       └── sectionCard.tsx
└── package.json
```

**Usage Pattern**:
```typescript
import { JsonLanding } from '@pageforge/static-websites';
import { LinkBioPage } from '@pageforge/static-websites';
```

---

### `app/frontend/` - Management UI

**Workspace Name**: `@pageforge/frontend`

**Role**: Internal React application for managing landing pages and LinkBio configurations.

**Technology**: React, TypeScript, Vite, Firebase, React Router

**Key Responsibilities**:
- Visual editor for landing pages and LinkBio
- JSON configuration management
- Preview rendering using `@pageforge/static-websites` components
- Video generation management
- A/B testing experiment management
- Configuration editing
- Component library preview
- URL testing interface

**Structure**:
```
app/frontend/
├── src/
│   ├── main.tsx                  - App entry point with routing
│   ├── layout.tsx                - Main layout wrapper
│   ├── builders/                 - Internal parsing logic (prev separate packages)
│   │   ├── landingPages/         - LP parsing (prev @pageforge/lp-builder)
│   │   │   ├── parse.ts
│   │   │   ├── componentMapper.ts
│   │   │   ├── config.types.ts
│   │   │   └── api.types.ts
│   │   └── linkbio/              - ZT parsing (prev @pageforge/linkbio-builder)
│   │       ├── parse.ts
│   │       └── types.ts
│   ├── pages/                    - Route pages
│   │   ├── landingPages/         - Landing page management
│   │   ├── linkbio/              - LinkBio management
│   │   ├── experiments/          - A/B testing experiments
│   │   ├── configs/              - Configuration editor
│   │   ├── vidGen/               - Video generation
│   │   ├── library/              - Component library
│   │   ├── url_tester/           - URL testing tool
│   │   └── devs/                 - Developer testing pages
│   ├── components/               - UI components
│   ├── api/                      - Backend API clients
│   ├── firebase/                 - Firebase initialization
│   ├── hooks/                    - React hooks
│   ├── services/                 - Business logic
│   └── types/                    - TypeScript types
├── vite.config.ts
├── tsconfig.json              - Includes paths: @builders/landingPages/*, @builders/linkbio/*
├── tailwind.config.js
└── firebase.json                 - Firebase hosting config
```

**Development**:
```bash
npm run dev -w @pageforge/frontend  # Start dev server
npm run build -w @pageforge/frontend # Build for production
```

---

### `app/deployment-runtime/` - Unified Deployment System

**Workspace Name**: `@pageforge/deployment-runtime`

**Role**: Unified Vite-based build system for deploying both Landing Pages and LinkBio sites.

**Technology**: Vite, React, TypeScript, Tailwind CSS v4

**Key Responsibilities**:
- Build static sites from JSON configurations received via environment variables
- Reassemble chunked configurations at build time
- Inject page data into HTML via Vite plugin
- Support both Landing Page and LinkBio deployments with single codebase

**Structure**:
```
app/deployment-runtime/
├── src/                         - Static source files (not generated)
│   ├── main.tsx                 - React entry point
│   ├── App.tsx                  - Router reading window.__PAGE_DATA__
│   └── styles.css               - Tailwind CSS with Steam + LinkBio presets
├── vite.config.ts               - Vite config with injectPageData() plugin
│                                - Contains reassembleChunks() function
├── dist/                        - Vite build output (deployment-ready)
├── tailwind.config.js
├── package.json
└── MIGRATION.md                 - Migration guide with Terraform instructions
```

**Build Process**:
1. **Vite Build** (`vite build`):
   - `injectPageData()` plugin executes:
     - Calls `reassembleChunks('_LP_CONFIG')` or `reassembleChunks('_ZT_CONFIG')`
     - Reads environment variables: `_<PREFIX>_1` through `_<PREFIX>_TOTAL`
     - Skips chunks with value "-" (padding from backend)
     - Reassembles complete JSON configuration
     - Injects as `window.__PAGE_DATA__` into HTML
   - Bundles static React files (main.tsx, App.tsx, styles.css)
   - Resolves `@pageforge/static-websites` via workspace link
   - Outputs optimized production build to `dist/`

2. **Runtime** (in browser):
   - `main.tsx` renders `App.tsx`
   - `App.tsx` reads `window.__PAGE_DATA__`
   - Conditionally renders:
     - `<JsonLanding>` from `@pageforge/static-websites` for Landing Pages
     - `<LinkBioPage>` from `@pageforge/static-websites` for LinkBio

**Key Simplifications**:
- No separate generate step (no `load-config.ts` or `generate-html.ts` scripts)
- No runtime builder packages (parsing done by backend before chunking)
- Static source files (no file generation)
- Single package for both LP and ZT deployments
- Vite plugin handles all config injection

**Environment Variables Expected**:
```bash
# For Landing Pages:
_LP_CONFIG_TOTAL=45    # Number of chunks
_LP_CONFIG_1="{..."    # First chunk
_LP_CONFIG_2="..."     # Second chunk
...
_LP_CONFIG_45="..."}"  # Last chunk
# Some may be "-" for padding

# For LinkBio:
_ZT_CONFIG_TOTAL=20
_ZT_CONFIG_1="{..."
...
```
---

## Build & Deployment Flows

### Unified Build Flow (Landing Pages & LinkBio)

```
1. Trigger Build
   Backend API → Cloud Build → npm run build in deployment-runtime/

2. Vite Build with Plugin (vite build)
   ├─> injectPageData() plugin executes
   │   ├─> reassembleChunks('_LP_CONFIG') or reassembleChunks('_ZT_CONFIG')
   │   │   ├─> Read _<PREFIX>_TOTAL from environment
   │   │   ├─> Loop through _<PREFIX>_1 to _<PREFIX>_TOTAL
   │   │   ├─> Skip chunks with value "-" (padding)
   │   │   ├─> Concatenate all chunks
   │   │   └─> Parse JSON
   │   │
   │   └─> Inject window.__PAGE_DATA__ into HTML
   │
   ├─> Bundle static React files:
   │   ├─> src/main.tsx (entry point)
   │   ├─> src/App.tsx (router with conditional rendering)
   │   └─> src/styles.css (Tailwind with presets)
   │
   ├─> Resolve @pageforge/static-websites via workspace link
   │   ├─> JsonLanding component (for LP)
   │   └─> LinkBioPage component (for ZT)
   │
   └─> Output: dist/ folder (production-ready static site)

3. Deploy
   └─> Upload dist/ to static hosting (Firebase Hosting, GCS, or CDN)
```

### Runtime Flow

```
Browser loads static site
├─> index.html with <script>window.__PAGE_DATA__={...}</script>
├─> main.tsx renders App.tsx
└─> App.tsx:
    ├─> const pageData = window.__PAGE_DATA__
    └─> Conditional render:
        ├─> if (pageData.type === 'landing') → <JsonLanding content={pageData} />
        └─> else → <LinkBioPage config={pageData} />
```

---

## Architecture Principles

### Component Separation

**Static Websites (`@pageforge/static-websites`)**
- Shared React component library
- Single source of truth for UI components
- Consumed as TypeScript source (no build step)
- Separate directories for Landing Pages and LinkBio components
- No cross-contamination between component types

**Builders (Internal to Frontend)**
- Migrated from separate packages to `app/frontend/src/builders/`
- Used only by visual editor for parsing and validation
- `builders/landingPages/` - LP parsing logic (previously `@pageforge/lp-builder`)
- `builders/linkbio/` - ZT parsing logic (previously `@pageforge/linkbio-builder`)
- Not used by deployment (configs pre-chunked by backend)

**Deployment Runtime (`@pageforge/deployment-runtime`)**
- Unified build system for both LP and ZT
- Static source files (no generation)
- Vite plugin reassembles chunked configs at build time
- Conditional rendering based on config type

### Workspace Dependencies

```
┌──────────────────────────────────────────────────────┐
│              @pageforge/static-websites                  │
│        (React Components - No Build Step)            │
│  • landingPage/: JsonLanding, Navbar, Hero, Footer   │
│  • linkbio/: LinkBioPage, ProfileCard, SectionCard   │
└─────────────────┬──────────────┬─────────────────────┘
                  │              │
       ┌──────────▼──────────┐   │
       │  @pageforge/frontend    │   │
       │  (Management UI)    │   │
       │  Internal builders: │   │
       │  • src/builders/LP  │   │
       │  • src/builders/ZT  │   │
       └─────────────────────┘   │
                                 │
                  ┌──────────────▼──────────────┐
                  │  @pageforge/deployment-runtime  │
                  │    (Unified Vite Build)     │
                  │  • Reassembles LP/ZT config │
                  │  • Conditional rendering    │
                  └─────────────────────────────┘
```
│  • linkbio/: LinkBioPage, ProfileCard, SectionCard             │
└───────────────┬──────────────────────┬──────────────────────────┘
                │                      │
                │                      │
        ┌───────▼────────┐    ┌────────▼────────┐
        │  @pageforge/frontend  │    │  @pageforge/frontend  │
        │   (Preview UI)  │    │   (Preview UI)  │
        └─────────────────┘    └─────────────────┘
                │                      │
        ┌───────▼───────────┐  ┌──────▼──────────────┐
        │ @pageforge/lp-builder │  │@pageforge/linkbio-builder│
        │ (Parse & Render)  │  │  (Parse & Render)   │
        └─────────┬─────────┘  └──────┬──────────────┘
                  │                    │
          ┌───────▼────────┐   ┌──────▼───────────┐
          │Backend (SSR/API)│   │Backend (SSR/API) │
          └────────────────┘   └──────────────────┘
                  │                    │
        ┌─────────▼──────────┐ ┌──────▼─────────────┐
        │@pageforge/lp-deployment│ │@pageforge/zt-deployment│
        │   (Vite Build)     │ │   (Vite Build)     │
        └────────────────────┘ └────────────────────┘
```

### Data Flow

**Configuration Storage**:
```
Firestore → Backend API → JSON Configuration
```

**Build-Time Generation**:
```
JSON Config → Builder (parse) → React Code → Vite Bundle → Static Site
```

**Runtime Execution**:
```
Static Site (CDN) → Browser → React Hydration → Interactive Page
```

### Build vs. Runtime

**Build Time**:
- Builders parse JSON and generate React source code
- Vite bundles all dependencies into optimized chunks
- Static assets ready for CDN deployment
- No server-side rendering required

**Runtime**:
- Static HTML/CSS/JS served from CDN
- React hydrates on client side
- All interactions happen in browser
- No backend calls for page rendering

**Backend Role**:
- Manages JSON configurations in Firestore
- Triggers builds via Cloud Build API
- Provides preview/SSR using builders
- Serves API endpoints for management UI (pageforge)

---

## Docker Configuration

The project includes Docker Compose for local development:

```yaml
docker-compose.yml
├─> backend service    (Express API on port 8080)
└─> firestore-emulator (Firebase emulator for local development)

docker-compose.emulator-only.yml
└─> firestore-emulator only (for standalone testing)
```

**Local Development**:
```bash
# Start backend + Firestore emulator
docker compose up

# Backend available at: http://localhost:8080
# Firestore UI at: http://localhost:4000
```

---

## Development Workflow

### Working on Components

```bash
# Edit components in app/static-websites/components/
# Changes immediately available to all consumers via workspace links
npm run dev -w @pageforge/frontend  # Test in frontend UI
```

### Working on Builders

```bash
# Edit internal builder logic (now in frontend)
cd app/frontend/src/builders/landingPages/  # or linkbio/
vim parse.ts

# No build step needed - consumed as TypeScript source
# Changes immediately available in frontend dev server
npm run dev -w @pageforge/frontend
```

### Working on Backend

```bash
# Start with Docker
docker compose up

# Or run directly
cd backend/
npm run dev  # nodemon for auto-reload
```

### Working on Frontend

```bash
# From project root
npm run dev  # Alias for npm run dev -w @pageforge/frontend

# Or directly
cd app/frontend/
npm run dev  # Vite dev server with HMR
```

---

## Technology Stack

| Component | Technologies |
|-----------|-------------|
| **Backend** | Node.js, Express, Firebase Admin, Google Cloud APIs |
| **Crawler** | TypeScript, Playwright, Lighthouse, Cloud Functions |
| **Static Websites** | React, TypeScript, Emotion (CSS-in-JS) |
| **Frontend** | React, TypeScript, Vite, React Router, Firebase SDK |
| **Deployment Runtime** | Vite, React, TypeScript, Tailwind CSS v4 |
| **Infrastructure** | Docker, Cloud Build, Firebase Hosting, GCS |
| **Database** | Firestore |
| **Authentication** | Firebase Auth, Google IAP |
