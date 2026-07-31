# NPM Workspaces in PageForge

This document explains the NPM workspaces architecture in the PageForge monorepo, including their roles, dependencies, and how they communicate with each other.

---

## Table of Contents

1. [What are NPM Workspaces?](#what-are-npm-workspaces)
2. [Workspace Structure](#workspace-structure)
3. [Workspace Roles](#workspace-roles)
4. [Dependency Graph](#dependency-graph)
5. [How Workspaces Communicate](#how-workspaces-communicate)
6. [Development Workflow](#development-workflow)
7. [Build Order](#build-order)
8. [Common Patterns](#common-patterns)
9. [Troubleshooting](#troubleshooting)

---

## What are NPM Workspaces?

NPM Workspaces is a built-in feature that allows managing multiple packages within a single repository (monorepo). In PageForge, this enables:

- **Shared dependencies**: Install once at root, use in all packages
- **Local package linking**: Import from other workspaces without publishing
- **Unified commands**: Run scripts across all or specific workspaces
- **Version control**: All packages in one repository
- **Efficient development**: Changes immediately available to dependent packages

### Why Workspaces for PageForge?

```
Traditional Approach (without workspaces):
1. Publish @pageforge/static-websites to npm registry
2. Wait for package to be available
3. Update version in frontend/package.json
4. npm install in pageforge
5. Test changes
❌ Slow, requires publishing for every change

With Workspaces:
1. Edit @pageforge/static-websites
2. Changes immediately available to pageforge
3. Test instantly
✅ Fast iteration, no publishing needed
```

---

## Workspace Structure

### Root Configuration

**File**: `package.json` (root)

```json
{
  "name": "pageforge-monorepo",
  "private": true,
  "workspaces": [
    "app/static-websites",
    "app/frontend",
    "app/deployment-runtime"
  ]
}
```

**Key Points**:
- `"private": true` - Prevents accidentally publishing the root package
- `"workspaces"` array - Lists all workspace directories
- Each path must contain a `package.json` with a unique `"name"`

### Workspace Directory Tree

```
pageforge-monorepo/
├── package.json                           ← Root workspace config
├── node_modules/                          ← Shared dependencies
│   ├── react/                             ← Installed once, shared by all
│   ├── typescript/                        ← Shared TypeScript
│   └── @pageforge/                            ← Symlinks to workspace packages
│       ├── static-websites → ../../app/static-websites/
│       ├── frontend → ../../app/frontend/
│       └── deployment-runtime → ../../app/deployment-runtime/
├── app/
│   ├── static-websites/                   ← @pageforge/static-websites
│   │   └── package.json
│   ├── frontend/                          ← @pageforge/frontend
│   │   ├── package.json
│   │   └── src/
│   │       └── builders/                  ← Builders (used by editor)
│   │           ├── landingPages/
│   │           └── linkbio/
│   └── deployment-runtime/                ← @pageforge/deployment-runtime
│       ├── package.json
│       ├── vite.config.ts
│       └── src/                           ← Static files
│           ├── main.tsx
│           ├── App.tsx
│           └── styles.css
└── backend/                               ← Not a workspace (separate)
    └── package.json
```

---

## Workspace Roles

### 1. @pageforge/static-websites

**Name**: `@pageforge/static-websites`
**Location**: `app/static-websites/`
**Type**: React Component Library
**Build**: None (source consumed directly)

**Purpose**:
- Provides shared React components for rendering landing pages and LinkBio pages
- Single source of truth for UI components
- Consumed by pageforge, lp-deployment, and zt-deployment

**Exports**:
```json
{
  "exports": {
    ".": "./components/index.ts",
    "./*": "./components/*"
  }
}
```

**Key Features**:
- No build step (TypeScript source consumed directly)
- Uses `peerDependencies` for React (expects consumer to provide)
- Separate component folders: `landingPage/` and `linkbio/`

**Dependencies**:
- None (depends only on React via peerDependencies)

**Consumers**:
- ✅ `@pageforge/frontend` - Preview and editing
- ✅ `@pageforge/lp-deployment` - Landing page builds
- ✅ `@pageforge/zt-deployment` - LinkBio builds

---

### 2. @pageforge/frontend

**Name**: `@pageforge/frontend`
**Location**: `app/frontend/`
**Type**: React Web Application
**Build**: Vite (dev server + production build)

**Purpose**:
- Internal management UI for creating and editing landing pages and LinkBio pages
- Visual editor with live preview
- Configuration management
- Deployment triggering

**Dependencies**:
```json
{
  "@pageforge/static-websites": "*"  // UI components for preview
}
```

**Internal Code** (`src/builders/`):
- `builders/landingPages/` - LP parsing/rendering utils (previously `@pageforge/lp-builder`)
  - `parse.ts` - `parseLandingPageFromServer()` function
  - `componentMapper.ts` - Type to component mapping
  - `config.types.ts`, `api.types.ts` - TypeScript interfaces
- `builders/linkbio/` - LinkBio parsing/rendering utils (previously `@pageforge/linkbio-builder`)
  - `parse.ts` - `parseLinkBioFromServer()` function
  - `types.ts` - LinkBio TypeScript types

**TypeScript Paths**:
```json
{
  "@builders/landingPages/*": ["./src/builders/landingPages/*"],
  "@builders/linkbio/*": ["./src/builders/linkbio/*"]
}
```

**What it does**:
1. Provides visual editors for LP and LinkBio
2. Uses `@pageforge/static-websites` components for live preview
3. Uses internal builders (src/builders/) for parsing/validation
4. Saves configurations to Firestore
5. Triggers deployments via backend API

**Communication**:
- Imports components from `@pageforge/static-websites` for rendering
- Imports types and parsers from internal `@builders/*` paths
- Makes API calls to backend (not a workspace)

---

### 3. @pageforge/deployment-runtime

**Name**: `@pageforge/deployment-runtime`
**Location**: `app/deployment-runtime/`
**Type**: Vite Build Package
**Build**: `vite build`

**Purpose**:
- Unified build system for both Landing Pages and LinkBio deployments
- Receives JSON configuration via environment variables at build time
- Generates optimized static sites ready for CDN deployment

**Exports**:
```json
{
  "main": "./vite.config.ts",
  "type": "module"
}
```

**Key Files**:
- `vite.config.ts` - Vite configuration with `injectPageData()` plugin
  - Plugin includes `reassembleChunks()` function (reads `_LP_CONFIG_*` or `_ZT_CONFIG_*` env vars)
  - Injects `window.__PAGE_DATA__` into HTML at build time
- `src/main.tsx` - Static React entry point
- `src/App.tsx` - Static router that reads `window.__PAGE_DATA__` and conditionally renders
- `src/styles.css` - Static CSS with Tailwind presets (Steam + LinkBio)

**Dependencies**:
```json
{
  "@pageforge/static-websites": "*",  // JsonLanding and LinkBioPage components
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.1.1",
  "vite": "^7.0.5"
}
```

**Build Process**:
1. **Vite Build** (`vite build`):
   - `injectPageData()` plugin runs:
     - Calls `reassembleChunks('_LP_CONFIG')` or `reassembleChunks('_ZT_CONFIG')`
     - Reads environment variables up to `_<PREFIX>_TOTAL`
     - Reassembles chunked JSON configuration
     - Injects as `window.__PAGE_DATA__` in HTML
   - Bundles static React files (main.tsx, App.tsx)
   - Resolves `@pageforge/static-websites` components
   - Outputs to `dist/` folder

2. **Runtime** (in browser):
   - `main.tsx` renders `App.tsx`
   - `App.tsx` reads `window.__PAGE_DATA__`
   - Conditionally renders `<JsonLanding>` or `<LinkBioPage>` based on config type

**Communication**:
- No separate builder packages needed for deployment
- Imports `JsonLanding` and `LinkBioPage` directly from `@pageforge/static-websites`
- Backend still chunks JSON config into env vars (unchanged)

**Note**: Builders have been migrated to `app/frontend/src/builders/` and are now used only by the visual editor, not by deployments

---

## Dependency Graph

### Visual Dependency Flow

```
┌─────────────────────────────────────────────────────┐
│              @pageforge/static-websites                 │
│           (React Components Library)                │
│  • JsonLanding component                            │
│  • LinkBioPage component                            │
│  • All UI widgets and sections                      │
└──────────────────┬─────────────┬────────────────────┘
                   │             │
                   │             │
        ┌──────────▼──────────┐  │
        │  @pageforge/frontend    │  │
        │  (Management UI)    │  │
        │  Internal builders: │  │
        │  • src/builders/LP  │  │
        │  • src/builders/ZT  │  │
        └─────────────────────┘  │
                                 │
                   ┌─────────────▼────────────┐
                   │ @pageforge/deployment-runtime│
                   │   (Unified Vite Build)   │
                   │  • Receives LP or ZT     │
                   │    config via env vars   │
                   │  • Injects via plugin    │
                   │  • Renders at runtime    │
                   └──────────────────────────┘
```

### Dependency Matrix

| Package | Depends On | Depended On By |
|---------|------------|----------------|
| **@pageforge/static-websites** | None | frontend, deployment-runtime |
| **@pageforge/frontend** | static-websites | None |
| **@pageforge/deployment-runtime** | static-websites | None |

**Note**: Builders (LP and LinkBio) are now internal to `@pageforge/frontend` (`src/builders/`) and not separate workspace packages.

### Dependency Resolution

When you run `npm install` at the root:

1. **Hoisting**: Shared dependencies installed at root `node_modules/`
2. **Symlinking**: Workspace packages linked in `node_modules/@pageforge/`
3. **Resolution**: Imports resolve to symlinked directories

Example:
```typescript
// In app/frontend/src/component.tsx
import { JsonLanding } from '@pageforge/static-websites';

// Resolves to:
// node_modules/@pageforge/static-websites → ../../app/static-websites/components/index.ts
```

---

## How Workspaces Communicate

### 1. Import/Export Pattern

**Source Package** (`@pageforge/static-websites`):
```typescript
// app/static-websites/components/index.ts
export { JsonLanding } from './landingPage/jsonLanding';
export { LinkBioPage } from './linkbio/linkBioLanding';
export { Hero } from './landingPage/hero/hero';
export { Navbar } from './landingPage/navbar';
// ... more exports
```

**Consumer Package** (`@pageforge/frontend`):
```typescript
// app/frontend/src/pages/landingPages/[e]/page.tsx
import { JsonLanding } from '@pageforge/static-websites';

// Use the component
<JsonLanding content={myConfig} />
```

### 2. Type Sharing

**Source Package** (`@pageforge/lp-builder`):
```typescript
// app/landingPages/builder/config.types.ts
export interface BackendMetadata {
  user: string;
  type: string;
  page_name: string;
  // ...
}

export interface LandingPageConfig {
  sections: Section[];
  metadata?: BackendMetadata;
  // ...
}
```

**Consumer Package** (`@pageforge/frontend`):
```typescript
// app/frontend/src/types/config.types.ts
import type {
  BackendMetadata,
  LandingPageConfig
} from '@builders/landingPages/config.types';

// Re-export or extend
export type { BackendMetadata };

export interface ExtendedConfig extends LandingPageConfig {
  // Add frontend-specific fields
  internalId: string;
}
```

### 3. Function Sharing

**Source Package** (Frontend internal builders):
```typescript
// app/frontend/src/builders/landingPages/parse.ts
export function parseLandingPageFromServer(data: any): ParsedConfig {
  // Parse logic
  return {
    landingPageData: normalized,
    metadata: data.metadata
  };
}
```

**Consumer Package** (`@pageforge/frontend` pages):
```typescript
// app/frontend/src/pages/landingPages/[e]/page.tsx
import { parseLandingPageFromServer } from '@builders/landingPages/parse';

const rawData = await loadConfig();
const parsed = parseLandingPageFromServer(rawData);
// Use parsed data for preview
```

**Note**: Deployment runtime no longer uses separate builder packages - it receives pre-chunked config via environment variables and reassembles at build time.

### 4. Build-Time vs Runtime Communication

**Build-Time** (used during `vite build` in deployment-runtime):
```typescript
// vite.config.ts plugin
function reassembleChunks(prefix: string) {
  // Reads _LP_CONFIG_* or _ZT_CONFIG_* env vars
  // Reassembles JSON configuration
  // Returns complete config object
}

// Plugin injects window.__PAGE_DATA__ at build time
```

**Runtime** (bundled in final application):
```typescript
// Used in React app
import { JsonLanding, LinkBioPage } from '@pageforge/static-websites';

// Reads config injected at build time
const App = () => {
  const pageData = window.__PAGE_DATA__;
  return pageData.type === 'landing'
    ? <JsonLanding content={pageData} />
    : <LinkBioPage config={pageData} />;
};
```

### 5. Workspace Communication Examples

#### Example 1: Frontend Previewing a Landing Page

```typescript
// app/frontend/src/pages/landingPages/[e]/page.tsx

// 1. Import parser from internal builders
import { parseLandingPageFromServer } from '@builders/landingPages/parse';

// 2. Import component from static-websites workspace
import { JsonLanding } from '@pageforge/static-websites';

function LandingPageEditor() {
  const [config, setConfig] = useState(null);

  // 3. Parse configuration using internal builder
  const parsedConfig = parseLandingPageFromServer(rawConfig);

  // 4. Render preview using static-websites component
  return (
    <div>
      <JsonLanding content={parsedConfig.landingPageData} isPreview={true} />
    </div>
  );
}
```

#### Example 2: Deployment Building a Site

```typescript
// app/deployment-runtime/vite.config.ts

function reassembleChunks(prefix: string) {
  // 1. Read total count from env
  const totalEnvVar = `_${prefix}_TOTAL`;
  const total = parseInt(process.env[totalEnvVar] || '0');

  // 2. Read and concatenate all chunks
  let fullConfig = '';
  for (let i = 1; i <= total; i++) {
    const chunk = process.env[`_${prefix}_${i}`] || '';
    if (chunk === '-') continue; // Skip padding chunks
    fullConfig += chunk;
  }

  // 3. Parse and return
  return JSON.parse(fullConfig);
}

function injectPageData(): Plugin {
  return {
    name: 'inject-page-data',
    transformIndexHtml(html) {
      // 4. Reassemble config from environment variables
      const lpConfig = reassembleChunks('LP_CONFIG');
      const ztConfig = reassembleChunks('ZT_CONFIG');

      // 5. Inject into HTML
      const pageData = lpConfig || ztConfig;
      return html.replace(
        '</head>',
        `<script>window.__PAGE_DATA__=${JSON.stringify(pageData)}</script></head>`
      );
    }
  };
}
```

---

## Development Workflow

### Installing Dependencies

```bash
# Install all workspace dependencies from root
npm install

# This will:
# 1. Install shared dependencies to root node_modules/
# 2. Create symlinks for workspace modules
# 3. Run prepare scripts if any
```

### Running Commands

**Run in specific workspace**:
```bash
# Using -w flag
npm run dev -w @pageforge/frontend
npm run build -w @pageforge/deployment-runtime

# Shorthand (defined in root package.json)
npm run dev                        # Runs dev in @pageforge/frontend
npm run build:deployment-runtime   # Builds @pageforge/deployment-runtime
```

**Run in all workspaces**:
```bash
# Run build in all workspaces (if present)
npm run build --workspaces --if-present

# Run type-check in all workspaces
npm run type-check --workspaces --if-present
```

### Making Changes

**Scenario**: Update a component in `@pageforge/static-websites`

```bash
# 1. Edit component
vim app/static-websites/components/landingPage/hero.tsx

# 2. Changes immediately available to consumers
# No build step needed (static-websites has no build)

# 3. Test in pageforge
npm run dev -w @pageforge/frontend
# Open browser and see changes live

# 4. If TypeScript errors, run type-check
npm run type-check -w @pageforge/static-websites
```

**Scenario**: Update builder logic in frontend

```bash
# 1. Edit source
vim app/frontend/src/builders/landingPages/parse.ts

# 2. No build step needed (consumed as TypeScript source)
# Changes immediately available within frontend

# 3. Test in frontend
npm run dev -w @pageforge/frontend
```

### Development Tips

**Hot Module Replacement (HMR)**:
- Frontend uses Vite with HMR
- Changes to `@pageforge/static-websites` trigger hot reload
- Changes to internal builders (`src/builders/`) trigger hot reload

**No TypeScript Watch Mode Needed**:
- All packages consumed as TypeScript source
- No compilation step during development
- Vite handles TypeScript on-the-fly

---

## Build Order

When building all workspaces, follow this order to respect dependencies:

### Dependency-Based Build Order

```
1. @pageforge/static-websites
   ├─ No dependencies
   └─ No build step (skip)

2. @pageforge/frontend
   ├─ Depends on: static-websites
   └─ BUILD: npm run build -w @pageforge/frontend

3. @pageforge/deployment-runtime
   ├─ Depends on: static-websites
   └─ BUILD: npm run build -w @pageforge/deployment-runtime
```

### Automated Build Script

```bash
# Root package.json script
npm run build --workspaces --if-present

# This runs build in all workspaces that have a "build" script
# NPM handles dependency order automatically
```

### Manual Build Order

```bash
# Build all workspace packages that have a build script
npm run build -w @pageforge/frontend
npm run build -w @pageforge/deployment-runtime

# Note: static-websites has no build step
```

---

## Common Patterns

### Pattern 1: Shared Components

**Goal**: Share UI components across all packages

**Implementation**:
```typescript
// @pageforge/static-websites (source)
export const Button = ({ label, onClick }) => (
  <button onClick={onClick}>{label}</button>
);

// @pageforge/frontend (consumer)
import { Button } from '@pageforge/static-websites';
<Button label="Save" onClick={handleSave} />

// @pageforge/lp-deployment (consumer - via generated code)
import { Button } from '@pageforge/static-websites';
<Button label="Click Me" onClick={...} />
```

**Benefits**:
- Single source of truth
- Consistent UI across all deployments
- Changes propagate to all consumers

### Pattern 2: Shared Types

**Goal**: Share TypeScript interfaces across packages

**Implementation**:
```typescript
// @pageforge/lp-builder (source)
export interface LandingPageConfig {
  sections: Section[];
  metadata: Metadata;
}

// @pageforge/frontend (consumer)
import type { LandingPageConfig } from '@pageforge/lp-builder/config.types.js';
const config: LandingPageConfig = { /* ... */ };

// @pageforge/lp-deployment (consumer)
import type { LandingPageConfig } from '@pageforge/lp-builder/config.types.js';
function process(config: LandingPageConfig) { /* ... */ }
```

**Benefits**:
- Type safety across workspace boundaries
- Consistent data structures
- Compiler catches incompatibilities

### Pattern 3: Build-Time Utilities

**Goal**: Reassemble chunked configuration at build time

**Implementation**:
```typescript
// @pageforge/deployment-runtime (vite.config.ts)
function reassembleChunks(prefix: string) {
  const total = parseInt(process.env[`_${prefix}_TOTAL`] || '0');
  let fullConfig = '';
  for (let i = 1; i <= total; i++) {
    const chunk = process.env[`_${prefix}_${i}`] || '';
    if (chunk === '-') continue;
    fullConfig += chunk;
  }
  return JSON.parse(fullConfig);
}

function injectPageData(): Plugin {
  return {
    name: 'inject-page-data',
    transformIndexHtml(html) {
      const pageData = reassembleChunks('LP_CONFIG') || reassembleChunks('ZT_CONFIG');
      return html.replace('</head>',
        `<script>window.__PAGE_DATA__=${JSON.stringify(pageData)}</script></head>`
      );
    }
  };
}
```

**Benefits**:
- No separate generate step
- Config injection happens during Vite build
- Simpler deployment pipeline
- Single unified package for LP and ZT

### Pattern 4: Selective Exports

**Goal**: Control what's exposed from a workspace

**Implementation**:
```typescript
// @pageforge/static-websites/components/index.ts
// Only export what consumers should use
export { JsonLanding } from './landingPage/jsonLanding';
export { LinkBioPage } from './linkbio/linkBioLanding';
export { Hero } from './landingPage/hero/hero';
// Internal components not exported

// Consumer can only import exported items
import { JsonLanding } from '@pageforge/static-websites';  // ✅ Works
import { InternalHelper } from '@pageforge/static-websites';  // ❌ Error
```

**Benefits**:
- Clear public API
- Prevents consumers from depending on internal implementation
- Easier to refactor internal code

---

## Troubleshooting

### Issue 1: "Cannot find module '@pageforge/...'"

**Symptoms**:
```
Error: Cannot find module '@pageforge/static-websites'
```

**Causes**:
- Workspace links not created
- Package not in workspaces array
- npm install not run

**Solutions**:
```bash
# Re-install dependencies to recreate links
rm -rf node_modules
npm install

# Check workspace links exist
ls -la node_modules/@pageforge/

# Verify workspaces configuration
cat package.json | grep -A 10 workspaces
```

### Issue 2: "Module has no exported member"

**Symptoms**:
```typescript
import { MyType } from '@builders/landingPages/types';
// Error: Module has no exported member 'MyType'
```

**Causes**:
- Export not in source file
- Wrong import path
- TypeScript path mapping misconfigured

**Solutions**:
```bash
# Check exports in source
grep "export.*MyType" app/frontend/src/builders/landingPages/types.ts

# Verify tsconfig.json paths
cat app/frontend/tsconfig.json | grep -A 5 paths

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Issue 3: Changes Not Reflected

**Symptoms**:
- Updated code in workspace but changes not appearing

**Causes**:
- Vite cache not cleared
- Using old build artifacts

**Solutions**:
```bash
# Clear Vite cache
rm -rf app/frontend/.vite
rm -rf app/frontend/node_modules/.vite
rm -rf app/deployment-runtime/.vite

# Restart dev server
npm run dev -w @pageforge/frontend
```

### Issue 4: Version Conflicts

**Symptoms**:
```
ERESOLVE unable to resolve dependency tree
```

**Causes**:
- Different versions of same package in different workspaces
- Peer dependency conflicts

**Solutions**:
```bash
# Use overrides in root package.json
{
  "overrides": {
    "react": "^19.1.0",
    "typescript": "^5.8.3"
  }
}

# Then reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: Circular Dependencies

**Symptoms**:
- Build hangs
- Import loops

**Causes**:
- Workspace A imports from B, B imports from A

**Solutions**:
- Restructure to have clear dependency hierarchy
- Extract shared code to a new workspace
- Use dependency injection instead of direct imports

**Current PageForge Structure** (no circular deps):
```
static-websites ← frontend, deployment-runtime

✅ All dependencies flow one direction
```

---

## Summary

### Key Takeaways

1. **Workspaces Enable**:
   - Fast development iteration
   - Code sharing without publishing
   - Unified dependency management
   - Clear package boundaries

2. **Communication Patterns**:
   - Import/export between packages
   - Type sharing for consistency
   - Build-time vs runtime dependencies
   - Symlink resolution via node_modules

3. **Dependency Flow**:
   - `static-websites` provides components (no dependencies)
   - Builders now internal to frontend (no separate packages)
   - `deployment-runtime` unified build for both LP and ZT
   - Frontend uses static-websites and internal builders

4. **Development Workflow**:
   - Edit source in any workspace
   - No build step needed (all TypeScript source)
   - Changes immediately available
   - Use workspace-specific commands

5. **Best Practices**:
   - Keep dependencies unidirectional
   - Use `"*"` for workspace dependencies
   - Export only public API
   - Document workspace roles
   - Follow consistent naming (`@pageforge/...`)

### Workspace Reference

| Workspace | Role | Build | Dependencies | Exports |
|-----------|------|-------|--------------|---------|
| **@pageforge/static-websites** | Components | None | None | React components |
| **@pageforge/frontend** | Management UI | Vite | static-websites | None (app) |
| **@pageforge/deployment-runtime** | Unified Deploy | Vite | static-websites | None (app) |

**Note**: Builders (LP and ZT) are internal to `@pageforge/frontend` at `src/builders/` - not separate packages.

For more details on architecture, see [Architecture.md](./Architecture.md).
