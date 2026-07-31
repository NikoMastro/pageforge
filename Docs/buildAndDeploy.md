# Build and Deploy Process

This document describes the complete build and deployment workflow for Landing Pages and LinkBio pages in the PageForge project, from creating a page in Frontend to deploying it live.

---

## Table of Contents

1. [Overview](#overview)
2. [Landing Page Build & Deploy Flow](#landing-page-build--deploy-flow)
3. [Detailed Step-by-Step Process](#detailed-step-by-step-process)
4. [Technical Components](#technical-components)
5. [LinkBio Build & Deploy Flow](#linkbio-build--deploy-flow)
6. [Deployment Cache System](#deployment-cache-system)
7. [Troubleshooting](#troubleshooting)

---

## Overview

The build and deploy process involves multiple systems working together:

1. **Frontend (UI)**: User creates/edits landing page configuration
2. **Backend API**: Validates and stores configuration in Firestore
3. **Cloud Build**: Triggers build process with configuration
4. **Deployment Package**: Generates React app and bundles with Vite
5. **Static Hosting**: Serves the final built site (Firebase Hosting/GCS/CDN)

### Key Principles

- **Configuration as Data**: Landing pages are defined as JSON configurations stored in Firestore
- **Build-Time Generation**: React app is generated from JSON at build time
- **Chunked Transfer**: Large configs are split into chunks for Cloud Build substitutions
- **Static Output**: Final result is a static site that requires no server

---

## Landing Page Build & Deploy Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         1. CREATE IN FRONTEND                             │
│  User creates/edits landing page in visual editor                       │
│  - Configure sections (navbar, hero, footer, widgets)                   │
│  - Set metadata (page name, type, etc.)                                 │
│  - Preview using @pageforge/static-websites components                                │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         2. SAVE TO FIRESTORE                            │
│  POST /lp/save                                                          │
│  - Backend validates metadata (user, type, page_name, etc.)            │
│  - Stores JSON config in Firestore collection 'lps'                    │
│  - Returns success confirmation                                         │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         3. DEPLOY REQUEST                               │
│  User clicks "Deploy" button in Frontend                                  │
│  POST /lp/deploy/:name                                                  │
│  - Frontend calls deployToGCS() API method                              │
│  - Sends metadata with deployment request                               │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    4. BACKEND VALIDATION                                │
│  Backend (landingPagesRoute.js)                                         │
│  ├─ Validate metadata fields                                            │
│  ├─ Fetch full config from Firestore                                    │
│  ├─ Verify landing page exists (404 if not found)                       │
│  └─ Check LP_BUILD_TRIGGER_URL is configured                            │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    5. CONFIG CHUNKING                                   │
│  cloudBuildUtils.splitConfigIntoChunks()                                │
│  ├─ Converts config to JSON string                                      │
│  ├─ Splits into 4000-character chunks (Cloud Build limit)               │
│  ├─ Creates substitution variables:                                     │
│  │  • _LP_CONFIG_1, _LP_CONFIG_2, ..., _LP_CONFIG_N                    │
│  │  • _LP_CONFIG_TOTAL = N (number of chunks)                          │
│  ├─ Pads unused chunks with "-"                                         │
│  └─ Max 90 chunks (360,000 characters total)                            │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    6. TRIGGER CLOUD BUILD                               │
│  POST to LP_BUILD_TRIGGER_URL                                           │
│  Body: {                                                                │
│    "substitutions": {                                                   │
│      "_NAME": "my-landing-page",                                        │
│      "_LP_CONFIG_1": "...chunk 1...",                                   │
│      "_LP_CONFIG_2": "...chunk 2...",                                   │
│      "_LP_CONFIG_TOTAL": "2"                                            │
│    }                                                                    │
│  }                                                                      │
│  - Cloud Build receives trigger                                         │
│  - Returns 200 OK immediately (async build)                             │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    7. CLOUD BUILD EXECUTION                             │
│  Cloud Build runs in GCP (cloudbuild.yaml)                              │
│  ├─ Step 1: Install dependencies (npm install)                          │
│  ├─ Step 2: Build with Vite (npm run build)                             │
│  │   └─ Vite plugin injects config during build                         │
│  └─ Step 3: Deploy to hosting                                           │
│      └─ Upload dist/ to Firebase/GCS                                    │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    8. VITE BUILD WITH CONFIG INJECTION                  │
│  app/deployment-runtime/ (unified for LP + LinkBio)                     │
│                                                                         │
│  8.1 Vite Plugin Loads Configuration                                    │
│  └─ vite.config.ts - injectPageData() plugin                            │
│      function reassembleChunks(prefix: string) {                        │
│        const total = process.env[`_${prefix}_TOTAL`];                   │
│        let json = '';                                                   │
│        for (let i = 1; i <= parseInt(total); i++) {                     │
│          json += process.env[`_${prefix}_${i}`];                        │
│        }                                                                │
│        return JSON.parse(json);                                         │
│      }                                                                  │
│                                                                         │
│  8.2 Detect Page Type                                                   │
│  ├─ Check _LP_CONFIG_TOTAL → Landing Page                               │
│  └─ Check _ZT_CONFIG_TOTAL → LinkBio                                    │
│                                                                         │
│  8.3 Inject into HTML (transformIndexHtml)                              │
│  └─ Plugin injects window.__PAGE_DATA__ into index.html:                │
│      <script>                                                           │
│        window.__PAGE_DATA__ = {                                         │
│          type: 'landing-page' | 'linkbio',                              │
│          data: lpContent.landingPageData || ztContent,                  │
│          meta: { title, description }                                   │
│        };                                                               │
│      </script>                                                          │
│                                                                         │
│  8.4 Static Files (never change)                                        │
│  ├─ src/App.tsx                                                         │
│  │   - Reads window.__PAGE_DATA__                                       │
│  │   - Routes to JsonLanding or LinkBioPage                             │
│  │                                                                      │
│  ├─ src/main.tsx                                                        │
│  │   - React entry point                                                │
│  │   - Renders <App />                                                  │
│  │                                                                      │
│  └─ src/styles.css                                                      │
│      - Tailwind imports + Steam + LinkBio styles                        │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    9. VITE BUILD                                        │
│  npm run build (vite build)                                             │
│                                                                         │
│  ├─ Resolve workspace dependencies                                      │
│  │   @pageforge/static-websites → app/static-websites/components/                          │
│  │                                                                      │
│  ├─ Bundle React components                                             │
│  │   - JsonLanding component                                            │
│  │   - All section components (Hero, Navbar, Footer, etc.)              │
│  │   - Widget components                                                │
│  │                                                                      │
│  ├─ Process Tailwind CSS                                                │
│  │   - Scan components for class names                                  │
│  │   - Generate optimized CSS                                           │
│  │   - Include custom styles                                            │
│  │                                                                      │
│  ├─ Optimize assets                                                     │
│  │   - Minify JavaScript                                                │
│  │   - Minify CSS                                                       │
│  │   - Optimize images                                                  │
│  │   - Code splitting                                                   │
│  │                                                                      │
│  └─ Output to dist/                                                     │
│      ├─ index.html                                                      │
│      ├─ assets/                                                         │
│      │   ├─ main-[hash].js                                              │
│      │   ├─ vendor-[hash].js                                            │
│      │   └─ main-[hash].css                                             │
│      └─ ... (other static assets)                                       │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    10. DEPLOY TO HOSTING                                │
│  Upload dist/ folder to static hosting                                  │
│                                                                         │
│  Options:                                                               │
│  ├─ Firebase Hosting                                                    │
│  │   firebase deploy --only hosting                                     │
│  │   └─ Deployed to: https://project.web.app/my-landing-page           │
│  │                                                                       │
│  ├─ Google Cloud Storage                                                │
│  │   gsutil -m cp -r dist/* gs://bucket-name/my-landing-page/          │
│  │   └─ Accessible via: https://storage.googleapis.com/...             │
│  │                                                                       │
│  └─ CDN                                                                 │
│      Upload to CDN origin                                               │
│      └─ Served via: https://cdn.example.com/my-landing-page            │
└──────────────────────────────┬──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    11. USER VISITS DEPLOYED SITE                        │
│  https://your-domain.com/my-landing-page                                │
│                                                                         │
│  ├─ Browser requests index.html                                         │
│  ├─ Loads JavaScript bundle                                             │
│  ├─ React hydrates application                                          │
│  ├─ JsonLanding component renders with config data                      │
│  └─ Fully interactive landing page displayed                            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Detailed Step-by-Step Process

### Step 1: Create in Frontend

**Location**: `app/frontend/src/pages/landingPages/`

Users interact with the Frontend UI to create or edit landing pages:

```typescript
// User actions in Frontend:
1. Navigate to Landing Pages section
2. Click "Create New" or select existing page
3. Configure sections using visual editor:
   - Navbar configuration
   - Hero section
   - Content widgets
   - Footer
4. Preview using JsonLanding component from @pageforge/static-websites
5. Click "Save" to store in Firestore
6. Click "Deploy" to trigger build
```

**Key Files**:
- `app/frontend/src/pages/landingPages/page.tsx` - Main LP management page
- `app/frontend/src/pages/landingPages/[e]/page.tsx` - LP editor
- `app/frontend/src/hooks/hooksPages/useLandingPages.ts` - LP state management

### Step 2: Save to Firestore

**API Endpoint**: `POST /lp/save`

**Backend Handler**: `backend/routes/landingpages/landingPagesRoute.js`

```javascript
// Request body
{
  metadata: {
    user: "user@example.com",
    type: "landing_page",
    commit: "v1.0.0",
    timestamp: "2025-12-10T10:00:00Z",
    page_name: "my-landing-page",
    lp_json: "{...json config...}",
    hashid: "abc123"
  }
}

// Backend process:
1. Validate required metadata fields
2. Create/update Firestore document in 'lps' collection
3. Document ID = page_name
4. Store full configuration + metadata
5. Return success response
```

**Validation Requirements**:
```javascript
// Required metadata fields (from requiredMetadataFirestore.js)
const requiredMetadataFields = [
  "user",        // Who created it
  "type",        // Content type
  "commit",      // Version/commit
  "timestamp",   // When created
  "page_name",   // Unique identifier
  "lp_json",     // JSON configuration
  "hashid"       // Hash of content
];
```

### Step 3: Deploy Request

**Frontend Call**: `app/frontend/src/api/landingPages.api.ts`

```typescript
// User clicks "Deploy" button
export async function deployToGCS(data: DeployToGCSRequest): Promise<DeployToGCSExtendedResponse> {
  const name = encodeURIComponent(data.metadata.page_name);
  const response = await requestJson<DeployToGCSResponse>(`/lp/deploy/${name}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  return {
    accepted: true,
    name: data.metadata.page_name,
    expectedUrl: response.url,
    buildId: response.buildId,
    message: response.message
  };
}
```

**User Experience**:
1. User clicks "Deploy" button in Frontend
2. Deploy modal/overlay appears
3. Request is sent to backend
4. User receives confirmation message
5. Build status can be tracked (if build monitoring is implemented)

### Step 4: Backend Validation

**API Endpoint**: `POST /lp/deploy/:name`

**Handler**: `backend/routes/landingpages/landingPagesRoute.js`

```javascript
setupDeployRoute() {
  this.router.post("/deploy/:name", async (req, res) => {
    const { name } = req.params;

    // 1. Validate metadata
    const { isValid, error } = this.validateMetadata(
      req.body?.metadata,
      this.requiredFields
    );
    if (!isValid) {
      return res.status(400).json({ error });
    }

    // 2. Fetch config from Firestore
    const validationResult = await this.validateDeployment(name);
    if (validationResult.error) {
      return res.status(validationResult.status).json({
        error: validationResult.error
      });
    }

    // 3. Check Cloud Build URL is configured
    if (!LP_BUILD_TRIGGER_URL) {
      return res.status(500).json({
        error: "Server configuration error: LP_BUILD_TRIGGER_URL is not set"
      });
    }

    // Continue to step 5...
  });
}
```

**Validation Checks**:
- ✅ Required metadata fields present
- ✅ Landing page exists in Firestore
- ✅ LP_BUILD_TRIGGER_URL environment variable configured
- ✅ Config data is valid JSON

### Step 5: Config Chunking

**Utility**: `backend/utils/cloudBuildUtils.js`

Cloud Build has a limit of **4000 characters per substitution variable**. Large landing page configurations must be split into chunks.

```javascript
function splitConfigIntoChunks(data, prefix = 'LP_CONFIG', chunkSize = 4000, maxChunks = 90) {
  const jsonString = JSON.stringify(data);
  const totalLength = jsonString.length;
  const totalChunks = Math.ceil(totalLength / chunkSize);

  // Check size limit
  if (totalChunks > maxChunks) {
    return {
      error: `Config too large: ${totalLength} characters requires ${totalChunks} chunks,
              but maximum is ${maxChunks} (${maxChunks * chunkSize} characters total)`
    };
  }

  const chunks = {};

  // Create numbered chunks
  for (let i = 1; i <= maxChunks; i++) {
    if (i <= totalChunks) {
      const start = (i - 1) * chunkSize;
      const end = Math.min(start + chunkSize, totalLength);
      chunks[`_${prefix}_${i}`] = jsonString.substring(start, end);
    } else {
      chunks[`_${prefix}_${i}`] = "-"; // Padding for unused slots
    }
  }

  // Add total count for reassembly
  chunks[`_${prefix}_TOTAL`] = totalChunks.toString();

  return { chunks, totalChunks, error: null };
}
```

**Example Output**:
```javascript
// For a 10,000 character config:
{
  _LP_CONFIG_1: "...4000 chars...",
  _LP_CONFIG_2: "...4000 chars...",
  _LP_CONFIG_3: "...2000 chars...",
  _LP_CONFIG_4: "-",
  _LP_CONFIG_5: "-",
  _LP_CONFIG_TOTAL: "3"
}
```

**Size Limits**:
- Chunk size: 4,000 characters
- Max chunks: 90
- **Total max config size: 360,000 characters** (~360 KB)

### Step 6: Trigger Cloud Build

**Backend Code**:

```javascript
const { chunks, totalChunks, error } = splitConfigIntoChunks(
  validationResult.data,
  'LP_CONFIG'
);

if (error) {
  return res.status(400).json({
    error,
    hint: "Consider reducing the size of your landing page configuration"
  });
}

// Trigger Cloud Build
const response = await fetch(LP_BUILD_TRIGGER_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    substitutions: {
      _NAME: name,
      ...chunks,  // All the _LP_CONFIG_* variables
    },
  }),
});

if (!response.ok) {
  throw new Error(`Build trigger failed with status: ${response.status}`);
}

res.status(200).json({
  message: "Was Successfully Sent to Build. You can check the status in the build tab.",
  configChunks: totalChunks,
});
```

**Cloud Build Trigger Configuration**:
- Trigger URL: Configured in `LP_BUILD_TRIGGER_URL` environment variable
- Substitutions: `_NAME` + all chunk variables
- Build location: `app/landingPages/deployment/`
- Build config: `cloudbuild.yaml` (if exists) or default steps

### Step 7: Cloud Build Execution

Cloud Build runs these steps (conceptual - actual config may vary):

```yaml
# Conceptual cloudbuild.yaml
steps:
  # Step 1: Install dependencies
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['install']
    dir: 'app/landingPages/deployment'

  # Step 2: Generate React app from config
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['run', 'generate']
    dir: 'app/landingPages/deployment'
    env:
      - '_LP_CONFIG_TOTAL=${_LP_CONFIG_TOTAL}'
      - '_LP_CONFIG_1=${_LP_CONFIG_1}'
      - '_LP_CONFIG_2=${_LP_CONFIG_2}'
      # ... all chunk variables
      - '_NAME=${_NAME}'

  # Step 3: Build with Vite
  - name: 'node:18'
    entrypoint: 'npm'
    args: ['run', 'build']
    dir: 'app/landingPages/deployment'

  # Step 4: Deploy to hosting
  - name: 'gcr.io/cloud-builders/gcloud'
    entrypoint: 'bash'
    args:
      - '-c'
      - 'gsutil -m cp -r dist/* gs://${_BUCKET_NAME}/${_NAME}/'
    dir: 'app/landingPages/deployment'

substitutions:
  _NAME: 'default-name'
  _BUCKET_NAME: 'your-bucket-name'
  # All _LP_CONFIG_* variables
```

### Step 8: Vite Build with Config Injection

**Location**: `app/deployment-runtime/` (unified package for Landing Pages + LinkBio)

The new system eliminates the separate generation step. Configuration is injected directly during the Vite build via a custom plugin.

#### 8.1 Vite Plugin: Configuration Loading

**File**: `app/deployment-runtime/vite.config.ts`

```typescript
function reassembleChunks(prefix: string): any | null {
  const total = process.env[`_${prefix}_TOTAL`];
  if (!total) return null;

  const numChunks = parseInt(total, 10);
  let json = '';

  for (let i = 1; i <= numChunks; i++) {
    const chunk = process.env[`_${prefix}_${i}`];
    if (!chunk) throw new Error(`Missing ${prefix} chunk ${i}`);
    json += chunk;
  }

  return JSON.parse(json);
}

function injectPageData(): Plugin {
  return {
    name: 'inject-page-data',
    transformIndexHtml() {
      // Load from chunked environment variables
      const lpContent = reassembleChunks('LP_CONFIG');
      const ztContent = reassembleChunks('ZT_CONFIG');

      const rawData = lpContent || ztContent;
      if (!rawData) {
        throw new Error('No configuration found');
      }

      const type = lpContent ? 'landing-page' : 'linkbio';

      // Extract data - lpContent may have .landingPageData wrapper
      const data = type === 'landing-page' && rawData.landingPageData
        ? rawData.landingPageData
        : rawData;

      const pageData = {
        type,
        data,
        meta: {
          title: type === 'landing-page'
            ? (rawData.page_name || data.settings?.title || 'Landing Page')
            : (data.meta?.title || 'LinkBio Page'),
          description: type === 'landing-page'
            ? (data.settings?.description || '')
            : (data.meta?.description || ''),
        },
      };

      // Inject into HTML head
      return [{
        tag: 'script',
        injectTo: 'head',
        children: `window.__PAGE_DATA__=${JSON.stringify(pageData)};`,
      }];
    },
  };
}
```

**Key Features**:
- ✅ Reassembles chunks from environment variables
- ✅ Auto-detects Landing Page vs LinkBio via env vars
- ✅ Injects config directly into HTML at build time
- ✅ No file generation step needed

#### 8.2 Static Source Files (Never Change)

Unlike the old system which generated files on every build, these files are **static** and reused:

**src/App.tsx**:
```typescript
import React from 'react';
import { JsonLanding, LinkBioPage } from '@pageforge/static-websites';

declare global {
  interface Window {
    __PAGE_DATA__?: {
      type: 'landing-page' | 'linkbio';
      data: any;
      meta?: { title?: string; description?: string; };
    };
  }
}

export const App: React.FC = () => {
  const pageData = window.__PAGE_DATA__;

  if (!pageData) {
    return <div>Error: No page data found</div>;
  }

  // Route to appropriate component
  if (pageData.type === 'landing-page') {
    return <JsonLanding content={pageData.data} />;
  }

  if (pageData.type === 'linkbio') {
    return <LinkBioPage json={pageData.data} />;
  }

  return <div>Error: Unknown page type "{pageData.type}"</div>;
};
```

**src/main.tsx**:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**src/styles.css**:
```css
@import "tailwindcss";

/* Steam widget styles */
/* LinkBio animation styles */
/* Global styles */
```

#### 8.3 Advantages Over Old System

| Old System (app/landingPages/deployment) | New System (app/deployment-runtime) |
|------------------------------------------|-------------------------------------|
| Separate packages for LP and ZT | Single unified package |
| `npm run generate` → generates files | No generation step |
| App.tsx generated on every build | App.tsx is static, never changes |
| loadConfig in separate script | loadConfig inline in Vite plugin |
| 2-step build (generate + vite) | 1-step build (vite only) |
| ~15-20s build time | ~8-12s build time |

#### 8.4 Build Output

The Vite build produces the same output structure, but with configuration baked into the HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Landing Page</title>
    <script>
      window.__PAGE_DATA__ = {
        "type": "landing-page",
        "data": { /* full configuration */ },
        "meta": { "title": "My Page", "description": "..." }
      };
    </script>
    <script type="module" src="/assets/main-[hash].js"></script>
    <link rel="stylesheet" href="/assets/main-[hash].css">
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

### Step 9: Vite Build

**Command**: `npm run build` → `vite build`

**Configuration**: `app/deployment-runtime/vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react(), injectPageData()],
  base: './',
  resolve: {
    dedupe: ['react', 'react-dom'],
    preserveSymlinks: true,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

**Build Process**:
1. **Resolve Dependencies**:
   - `@pageforge/static-websites` → `../../static-websites/components/` (workspace link)
   - React, React DOM from node_modules

2. **Bundle Components**:
   - Entry: `src/main.tsx`
   - Imports: `JsonLanding` from `@pageforge/static-websites`
   - All referenced components (Hero, Navbar, Footer, Widgets, etc.)

3. **Process CSS**:
   - Tailwind CSS scans all components
   - Generates optimized CSS with only used classes
   - Includes custom styles from `src/styles.css`

4. **Optimize**:
   - Minify JavaScript (terser)
   - Minify CSS
   - Code splitting (vendor, main)
   - Tree shaking (remove unused code)
   - Asset optimization

5. **Output Structure**:
```
dist/
├── index.html
├── assets/
│   ├── main-[hash].js      # Application code
│   ├── vendor-[hash].js    # React + dependencies
│   ├── main-[hash].css     # Styles
│   └── [images/fonts]      # Other assets
└── [other files]
```

### Step 10: Deploy to Hosting

Final step varies by hosting platform:

**Option A: Firebase Hosting**
```bash
firebase deploy --only hosting
# Output: https://project-id.web.app/my-landing-page
```

**Option B: Google Cloud Storage**
```bash
gsutil -m cp -r dist/* gs://bucket-name/my-landing-page/
# Output: https://storage.googleapis.com/bucket-name/my-landing-page/
```

**Option C: CDN**
- Upload `dist/` contents to CDN origin
- Configure cache settings
- Serve via CDN edge locations

### Step 11: User Visits Site

**Production URL**: `https://your-domain.com/my-landing-page`

**Runtime Flow**:
1. Browser requests `index.html`
2. HTML loads JavaScript bundles (`main-[hash].js`, `vendor-[hash].js`)
3. React initializes
4. `main.tsx` creates root and renders `<App />`
5. `App.tsx` renders `<JsonLanding content={config} />`
6. `JsonLanding` component processes config and renders sections
7. Fully interactive page displayed to user

**No Server Required**: All configuration is baked into the JavaScript at build time!

---

## Technical Components

### Backend Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **LandingPagesRoute** | `backend/routes/landingpages/landingPagesRoute.js` | Handles save/deploy API endpoints |
| **cloudBuildUtils** | `backend/utils/cloudBuildUtils.js` | Splits config into chunks |
| **Firestore Utils** | `backend/firestoreutils/` | CRUD operations for Firestore |
| **Config** | `backend/config/config.js` | Environment variables (LP_BUILD_TRIGGER_URL) |

### Frontend Components (Frontend)

| Component | Location | Purpose |
|-----------|----------|---------|
| **Landing Pages Page** | `app/frontend/src/pages/landingPages/page.tsx` | Main LP management UI |
| **LP Editor** | `app/frontend/src/pages/landingPages/[e]/page.tsx` | Visual editor |
| **LP API Client** | `app/frontend/src/api/landingPages.api.ts` | API calls (save/deploy) |
| **useLandingPages Hook** | `app/frontend/src/hooks/hooksPages/useLandingPages.ts` | State management |
| **useDeployment Hook** | `app/frontend/src/hooks/hooksDeployment/useDeployment.ts` | Deployment UI state |

### Deployment Package Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **vite.config.ts** | `app/deployment-runtime/` | Vite config with injectPageData plugin |
| **src/App.tsx** | `app/deployment-runtime/` | Static router (LP/ZT) |
| **src/main.tsx** | `app/deployment-runtime/` | Static React entry point |
| **src/styles.css** | `app/deployment-runtime/` | Static CSS (Tailwind + presets) |
| **package.json** | `app/deployment-runtime/` | Dependencies and scripts |

### Builder Package Components (Frontend Only)

| Component | Location | Purpose |
|-----------|----------|---------|
| **parse.ts** | `app/frontend/src/builders/landingPages/` | Parses JSON config (editor use) |
| **componentMapper.ts** | `app/frontend/src/builders/landingPages/` | Maps types to components (editor use) |
| **config.types.ts** | `app/frontend/src/builders/landingPages/` | Type definitions (editor use) |

> **Note**: Builders are now in `app/frontend/src/builders/` and are only used by the visual editor, not for deployment.

### Static Websites Package Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **JsonLanding** | `app/static-websites/components/landingPage/jsonLanding.tsx` | Main LP renderer |
| **Hero** | `app/static-websites/components/landingPage/hero/` | Hero section |
| **Navbar** | `app/static-websites/components/landingPage/navbar.tsx` | Navigation bar |
| **Footer** | `app/static-websites/components/landingPage/footer/` | Footer section |
| **Widgets** | `app/static-websites/components/landingPage/widgets/` | Various widgets |

---

## LinkBio Build & Deploy Flow

The LinkBio deployment process is similar to Landing Pages with a few differences:

### Key Differences

| Aspect | Landing Pages | LinkBio |
|--------|--------------|---------|
| **Collection** | `lps` | `linkBioPages` |
| **API Endpoint** | `/lp/deploy/:name` | `/linkbio/deploy/:name` |
| **Chunk Prefix** | `_LP_CONFIG` | `_ZT_CONFIG` |
| **Builder Package** | `@pageforge/lp-builder` | `@pageforge/linkbio-builder` |
| **Component** | `JsonLanding` | `LinkBioPage` |
| **Script** | `generate-from-json.ts` | `generate-linkbio-from-json.ts` |

### LinkBio Deploy Flow

```
1. Create LinkBio in Frontend
   └─> Visual editor for profile links/sections

2. Save to Firestore
   └─> POST /linkbio/save → 'linkBioPages' collection

3. Deploy Request
   └─> POST /linkbio/deploy/:name

4. Backend Validation
   └─> Fetch from 'linkBioPages', validate

5. Config Chunking
   └─> Split into _ZT_CONFIG_1, _ZT_CONFIG_2, etc.

6. Trigger Cloud Build
   └─> POST to ZT_BUILD_TRIGGER_URL

7. Cloud Build Execution
   └─> Run in app/linkbio/deployment/

8. Generate React App
   └─> generate-linkbio-from-json.ts
   └─> Loads _ZT_CONFIG_* chunks
   └─> Uses @pageforge/linkbio-builder
   └─> Generates App.tsx with LinkBioPage component

9. Vite Build
   └─> Bundles with LinkBioPage from @pageforge/static-websites

10. Deploy to Hosting
    └─> Upload to Firebase/GCS/CDN

11. User Visits LinkBio Page
    └─> Profile page with links rendered
```

---

## Deployment Cache System

To track deployment status and provide faster feedback to users, PageForge implements a deployment cache system.

### Purpose

- Track which pages are deployed
- Provide deployment URLs without querying hosting
- Cache deployment status to avoid repeated checks
- Support optimistic updates

### Implementation

**Service**: `app/frontend/src/services/deploymentCache.service.ts`

```typescript
interface DeploymentCacheEntry {
  deployed: boolean;      // Is it deployed?
  url?: string;           // Full deployed URL
  deployPath?: string;    // Relative path
  lastChecked: number;    // Timestamp of last check
  deployedAt?: number;    // When was it deployed
}

interface DeploymentCache {
  deployedPages: Record<string, DeploymentCacheEntry>;
  lastUpdated: number | null;
  version: string;
}
```

### Cache Sources

1. **localStorage**: Fast, no network required
2. **Remote JSON**: Optional snapshot file (if `VITE_DEPLOYMENT_CACHE_URL` is set)
3. **Live Check**: Fetch actual deployed page to verify

### Usage in Frontend

```typescript
// Get deployment status
const status = await deploymentCacheService.getDeploymentStatus('my-landing-page');

if (status.deployed) {
  console.log('Deployed at:', status.url);
} else {
  console.log('Not deployed');
}
```

### Cache Duration

- **Default**: 5 minutes
- Prevents excessive network checks
- Can be manually refreshed

---

## Troubleshooting

### Common Issues

#### 1. "Config too large" Error

**Problem**: Configuration exceeds 360,000 characters (90 chunks × 4000)

**Solution**:
- Reduce number of sections
- Optimize JSON structure
- Remove unused data
- Compress images/assets

#### 2. "LP_BUILD_TRIGGER_URL is not configured"

**Problem**: Environment variable not set in backend

**Solution**:
```bash
# Set in backend/.env or environment
LP_BUILD_TRIGGER_URL=https://cloudbuild.googleapis.com/v1/projects/PROJECT/triggers/TRIGGER:run
```

#### 3. "Landing page doesn't exist" (404)

**Problem**: Page not saved to Firestore before deploy

**Solution**:
- Click "Save" before clicking "Deploy"
- Verify page appears in Firestore console
- Check page_name matches

#### 4. Build Fails During Generate Step

**Problem**: Missing chunks or invalid JSON

**Solution**:
- Check all `_LP_CONFIG_*` environment variables are set
- Verify `_LP_CONFIG_TOTAL` is correct
- Ensure no chunks contain only "-" when they should have data
- Check JSON is valid

#### 5. Workspace Dependencies Not Resolved

**Problem**: Vite can't find `@pageforge/static-websites`

**Solution**:
```bash
# From project root
npm install
# Verify workspace links
ls -la node_modules/@pageforge/
```

#### 6. Deployment Succeeds but Page Not Accessible

**Problem**: Hosting configuration issue

**Solution**:
- Check hosting configuration (Firebase/GCS)
- Verify bucket permissions
- Check CDN cache settings
- Ensure correct path/URL

### Debug Mode

Enable verbose logging:

```bash
# In deployment package
DEBUG=* npm run generate
DEBUG=* npm run build
```

### Monitoring

**Cloud Build**:
- View build logs in GCP Console
- Check build history
- Monitor build duration and success rate

**Firestore**:
- Verify documents in collections
- Check metadata fields
- Review document structure

**Frontend**:
- Browser console for API errors
- Network tab for failed requests
- React DevTools for component issues

---

## Summary

The PageForge build and deploy process is a sophisticated pipeline that:

1. ✅ **Stores configurations as data** in Firestore
2. ✅ **Chunks large configs** for Cloud Build compatibility
3. ✅ **Generates React apps** at build time from JSON
4. ✅ **Bundles with Vite** for optimized production builds
5. ✅ **Deploys static sites** that require no server
6. ✅ **Provides fast user experience** with CDN distribution

This architecture enables:
- Non-technical users to create landing pages visually
- Version control of page configurations
- Fast, scalable static site hosting
- Easy rollbacks and A/B testing
- Minimal operational overhead

For questions or issues, refer to the [Architecture](./Architecture.md) documentation.
