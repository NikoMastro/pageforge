# Frontend - PageForge Management UI

Frontend is the internal management application for creating, editing, previewing, and deploying Landing Pages and LinkBio pages in the PageForge ecosystem. It's a React-based web application that provides a visual interface for managing all page configurations.

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Directory Structure](#directory-structure)
6. [Routing](#routing)
7. [Core Components](#core-components)
8. [State Management](#state-management)
9. [API Integration](#api-integration)
10. [Authentication](#authentication)
11. [Development](#development)
12. [Configuration](#configuration)

---

## Overview

**Package Name**: `@pageforge/frontend`
**Type**: React Web Application
**Build Tool**: Vite
**Purpose**: Visual editor and management interface for PageForge content

### What Frontend Does

Frontend serves as the central control panel for content creators and administrators to:

1. **Create and Edit** landing pages and LinkBio profiles using visual editors
2. **Preview** pages in real-time using the same components as production
3. **Manage** configurations stored in Firestore
4. **Deploy** pages to static hosting via backend API
5. **Test** components and configurations in isolated environments
6. **Monitor** video generation and A/B testing experiments
7. **Manage** media library and configuration files

### Key Characteristics

- **Internal Tool**: Not public-facing, requires authentication
- **Real-time Preview**: Uses `@pageforge/static-websites` components for WYSIWYG editing
- **Firestore Integration**: Direct connection to Firestore for data management
- **Workspace Consumer**: Imports from `@pageforge/static-websites`, `@pageforge/lp-builder`, and `@pageforge/linkbio-builder`
- **Hot Module Replacement**: Vite enables fast development with instant updates

---

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.0 | UI framework |
| **TypeScript** | 5.8.3 | Type safety |
| **Vite** | 6.3.5 | Build tool & dev server |
| **React Router** | 6.30.1 | Client-side routing |
| **Tailwind CSS** | 4.1.8 | Styling |
| **Firebase** | 12.1.0 | Authentication & Firestore |

### Key Dependencies

| Package | Purpose |
|---------|---------|
| `@pageforge/static-websites` | Preview components (JsonLanding, LinkBioPage) |
| `@pageforge/lp-builder` | Landing page parsing/validation |
| `@pageforge/linkbio-builder` | LinkBio parsing/validation |
| `@monaco-editor/react` | Code editor for JSON editing |
| `@headlessui/react` | Accessible UI components |
| `@heroicons/react` | Icon library |
| `@emotion/react` | CSS-in-JS (used by static-websites) |
| `zod` | Runtime validation |

### Development Tools

- **ESLint**: Code linting
- **TypeScript**: Type checking
- **PostCSS**: CSS processing
- **Autoprefixer**: Browser compatibility

---

## Architecture

### Component Hierarchy

```
App (main.tsx)
└─ AuthProvider
   └─ Router
      └─ Routes
         └─ RequireAllowed
            └─ Layout
               ├─ NotificationsProvider
               ├─ TopNavigationProvider
               ├─ Navigation (Sidebar)
               └─ Main Content
                  └─ Page Components
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Actions                            │
│  Edit config → Preview → Save → Deploy                          │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend UI Layer                            │
│  • Visual Editors (Landing Pages, LinkBio)                      │
│  • Preview using @pageforge/static-websites components                        │
│  • State management with hooks                                  │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Client Layer                           │
│  • landingPages.api.ts                                          │
│  • linkBioPages.api.ts                                          │
│  • experiments.api.ts                                           │
│  • videoGeneration.api.ts                                       │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend API                                │
│  POST /lp/save        - Save landing page                       │
│  POST /lp/deploy/:id  - Deploy landing page                     │
│  GET  /lp/list        - List landing pages                      │
│  POST /linkbio/save   - Save LinkBio                            │
│  POST /linkbio/deploy/:id - Deploy LinkBio                      │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Firestore Database                         │
│  Collections:                                                   │
│  • lps (Landing Pages)                                          │
│  • linkBioPages (LinkBio Pages)                                 │
│  • experiments (A/B Tests)                                      │
│  • videoGeneration (Video Jobs)                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Features

### 1. Landing Pages Management

**Route**: `/` (Landing Pages List)

**Capabilities**:
- ✅ List all landing pages with search/filter
- ✅ Create new landing page from scratch
- ✅ Duplicate existing landing pages
- ✅ Edit landing page title
- ✅ Delete landing pages
- ✅ Deploy landing pages
- ✅ View deployment status
- ✅ Pagination for large lists

**Route**: `/landing-pages/:id` (Landing Page Editor)

**Editor Features**:
- Visual section editor (Navbar, Hero, Footer, Widgets)
- Real-time preview using `JsonLanding` component
- JSON editor with Monaco for advanced editing
- Component configuration panels
- Save to Firestore
- Deploy directly from editor
- Version history tracking

### 2. LinkBio Pages Management

**Route**: `/linkbio` (LinkBio List)

**Capabilities**:
- ✅ List all LinkBio pages
- ✅ Create new LinkBio profile
- ✅ Edit LinkBio configurations
- ✅ Deploy LinkBio pages
- ✅ Preview LinkBio pages

**Route**: `/linkbio/:id` (LinkBio Editor)

**Editor Features**:
- Profile information editor
- Link/section management
- Social media links
- Custom styling options
- Real-time preview using `LinkBioPage` component
- Deploy functionality

### 3. Video Generation

**Route**: `/vidGen` (Video Generation List)

**Capabilities**:
- ✅ View video generation jobs
- ✅ Monitor video processing status
- ✅ Download generated videos
- ✅ Retry failed jobs

**Route**: `/vidGen/:id` (Video Details)

**Features**:
- Job details and metadata
- Video preview
- Download options
- Error logs if failed

### 4. A/B Testing Experiments

**Route**: `/experiments` (Experiments List)

**Capabilities**:
- ✅ List all experiments
- ✅ Create new experiments
- ✅ View experiment status
- ✅ Monitor experiment results

**Route**: `/experiments/:id` (Experiment Details)

**Features**:
- Variant configuration
- Traffic allocation
- Results dashboard
- Statistical analysis

### 5. Configuration Management

**Route**: `/configs` (Configs List)

**Capabilities**:
- ✅ Manage global configurations
- ✅ Edit JSON configurations
- ✅ Version control
- ✅ Export/import configs

**Route**: `/configs/:id` (Config Editor)

**Features**:
- Monaco editor for JSON
- Validation
- Schema checking
- Save and deploy

### 6. Media Library

**Route**: `/library` (Media Library)

**Capabilities**:
- ✅ Upload images and videos
- ✅ Organize media files
- ✅ Preview media
- ✅ Copy URLs for use in pages
- ✅ Delete unused media

### 7. URL Tester

**Route**: `/url_tester`

**Features**:
- Test URL accessibility
- Check page load times
- Validate SSL certificates
- Preview page content
- Lighthouse integration (via crawler)

### 8. Developer Tools

**Route**: `/dev_components` (Component Testing)

**Features**:
- Test individual components
- Preview all widget types
- Test notification system
- Component props testing

**Route**: `/dev_lps` (Landing Page Testing)

**Features**:
- Test landing page configurations
- Validate JSON structures
- Test rendering edge cases

**Route**: `/dev_sandbox` (Sandbox)

**Features**:
- Experimental features
- Quick prototyping
- Component playground

**Route**: `/dev_testlinkbio` (LinkBio Testing)

**Features**:
- Test LinkBio configurations
- Profile rendering tests

---

## Directory Structure

```
app/frontend/
├── src/
│   ├── main.tsx                    # Application entry point
│   ├── layout.tsx                  # Main layout wrapper
│   ├── app.tsx                     # (Legacy dashboard)
│   ├── vite-env.d.ts              # Vite type definitions
│   │
│   ├── api/                        # API client modules
│   │   ├── index.ts               # Unified API exports
│   │   ├── baseClient.ts          # Base HTTP client
│   │   ├── landingPages.api.ts    # Landing pages API
│   │   ├── linkBioPages.api.ts    # LinkBio pages API
│   │   ├── experiments.api.ts     # Experiments API
│   │   ├── videoGeneration.api.ts # Video gen API
│   │   ├── mediaLibrary.api.ts    # Media API
│   │   ├── configurations.api.ts  # Config API
│   │   ├── iap.api.ts            # Auth API
│   │   ├── firestoreParsers.ts   # Data parsers
│   │   └── landingPagesMapper.ts # Data mapping
│   │
│   ├── components/                 # React components
│   │   ├── index.ts               # Component exports
│   │   │
│   │   ├── layout/                # Layout components
│   │   │   ├── navigation.tsx     # Sidebar navigation
│   │   │   ├── searchbar.tsx      # Search functionality
│   │   │   ├── authContext.tsx    # Auth provider
│   │   │   └── topNavigationContext.tsx # Nav state
│   │   │
│   │   ├── ui/                    # Reusable UI components
│   │   │   ├── cards/             # Card components
│   │   │   ├── modals/            # Modal dialogs
│   │   │   ├── notifications/     # Toast notifications
│   │   │   ├── pagination/        # Pagination controls
│   │   │   └── ...                # Other UI elements
│   │   │
│   │   ├── landingpagesconfig/    # LP editor components
│   │   │   ├── newLpConfiguration.tsx
│   │   │   ├── settings/          # Component settings panels
│   │   │   └── ...
│   │   │
│   │   └── linkbioconfig/         # LinkBio editor components
│   │       ├── linkBioPreview.tsx
│   │       └── ...
│   │
│   ├── pages/                      # Page components (routes)
│   │   ├── landingPages/          # LP management
│   │   │   ├── page.tsx           # LP list
│   │   │   └── [e]/               # LP editor
│   │   │       ├── page.tsx       # Editor
│   │   │       └── landingPage/   # Preview
│   │   │           └── page.tsx
│   │   │
│   │   ├── linkbio/               # LinkBio management
│   │   │   ├── page.tsx           # ZT list
│   │   │   └── [e]/               # ZT editor
│   │   │       ├── page.tsx
│   │   │       └── bioPage/
│   │   │
│   │   ├── experiments/           # A/B testing
│   │   │   ├── page.tsx           # List
│   │   │   └── [e]/page.tsx       # Details
│   │   │
│   │   ├── vidGen/                # Video generation
│   │   │   ├── page.tsx           # List
│   │   │   └── [e]/page.tsx       # Details
│   │   │
│   │   ├── configs/               # Configurations
│   │   │   ├── page.tsx           # List
│   │   │   └── [e]/page.tsx       # Editor
│   │   │
│   │   ├── library/               # Media library
│   │   │   ├── page.tsx           # Library
│   │   │   └── [e]/page.tsx       # Editor
│   │   │
│   │   ├── url_tester/            # URL testing
│   │   │   └── page.tsx
│   │   │
│   │   └── devs/                  # Developer tools
│   │       ├── testComponents/
│   │       ├── testLps/
│   │       ├── sandbox/
│   │       └── testlinkbio/
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── index.ts               # Hook exports
│   │   ├── hooksPages/            # Page-related hooks
│   │   │   └── useLandingPages.ts
│   │   ├── hooksDeployment/       # Deployment hooks
│   │   │   ├── useDeployment.ts
│   │   │   └── useDeploymentStatus.ts
│   │   ├── hooksExperiments/      # Experiment hooks
│   │   ├── hooksMedia/            # Media hooks
│   │   └── hooksConfigs/          # Config hooks
│   │
│   ├── services/                   # Business logic services
│   │   ├── index.ts               # Service exports
│   │   ├── groups.service.ts      # Group management
│   │   ├── pageforge.service.ts       # Core service
│   │   └── deploymentCache.service.ts # Deployment cache
│   │
│   ├── firebase/                   # Firebase configuration
│   │   ├── auth.ts                # Auth setup
│   │   ├── firestore.ts           # Firestore setup
│   │   └── config.ts              # Firebase config
│   │
│   ├── types/                      # TypeScript types
│   │   ├── index.ts               # Type exports
│   │   ├── config.types.ts        # Config types
│   │   ├── api.types.ts           # API types
│   │   ├── ui.types.ts            # UI types
│   │   └── ...                    # Other types
│   │
│   ├── utils/                      # Utility functions
│   │   └── ...                    # Helper functions
│   │
│   ├── config/                     # App configuration
│   │   ├── config.ts              # Environment config
│   │   └── ...                    # Other configs
│   │
│   └── styles/                     # Global styles
│       └── App.css                # Main stylesheet
│
├── public/                         # Static assets
├── index.html                      # HTML entry point
├── package.json                    # Dependencies & scripts
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript config
├── tailwind.config.js              # Tailwind CSS config
├── postcss.config.cjs              # PostCSS config
└── firebase.json                   # Firebase hosting config
```

---

## Routing

### Route Structure

Frontend uses **React Router v6** with a file-based naming convention similar to Next.js:

- `page.tsx` - Main page component
- `[e]/page.tsx` - Dynamic route with parameter `e` (entity/edit)

### Complete Route Map

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | LandingPagesPage | Landing pages list |
| `/landing-pages/:id` | JsonPreview | Landing page editor |
| `/landing-pages/:id/landingPage` | LandingPageViewer | LP preview |
| `/linkbio` | LinkBioPage | LinkBio pages list |
| `/linkbio/:id` | LinkBioEditorPage | LinkBio editor |
| `/linkbio/:id/bioPage` | LinkBioViewer | ZT preview |
| `/experiments` | ExperimentsPage | Experiments list |
| `/experiments/:id` | ExperimentDetailPage | Experiment details |
| `/vidGen` | VideoGenerationPage | Video jobs list |
| `/vidGen/:id` | VideoGenerationDetailPage | Video details |
| `/configs` | ConfigsListPage | Configurations list |
| `/configs/:id` | ConfigsEditorPage | Config editor |
| `/library` | LibraryPage | Media library |
| `/library/:id` | LibraryEditorPage | Media editor |
| `/url_tester` | UrlTesterPage | URL testing tool |
| `/dev_components` | TestPage | Component testing |
| `/dev_lps` | TestLpsPage | LP testing |
| `/dev_sandbox` | SandboxPage | Sandbox |
| `/dev_testlinkbio` | TestLinkBioPage | ZT testing |

### Route Protection

All routes are wrapped with `RequireAllowed` component:

```tsx
<Route
  path="/"
  element={
    <RequireAllowed>
      <Layout>
        <LandingPagesPage />
      </Layout>
    </RequireAllowed>
  }
/>
```

**Authentication Flow**:
1. User attempts to access route
2. `RequireAllowed` checks authentication via `AuthProvider`
3. If authenticated → render page
4. If not authenticated → redirect to login

---

## Core Components

### Layout Components

#### Layout (`layout.tsx`)

Main application layout wrapper.

**Features**:
- Sidebar navigation
- Top navigation bar with search
- Background styling
- Notification system
- Context providers

**Structure**:
```tsx
<NotificationsProvider>
  <TopNavigationProvider>
    <Navigation />    {/* Sidebar */}
    <main>
      {children}      {/* Page content */}
    </main>
  </TopNavigationProvider>
</NotificationsProvider>
```

#### Navigation (`components/layout/navigation.tsx`)

Sidebar navigation menu.

**Features**:
- Route navigation with icons
- Active route highlighting
- Create new page buttons
- Search bar integration
- User profile menu
- Logout functionality

**Navigation Items**:
- Landing Pages
- LinkBio Pages
- Experiments
- Video Generation
- Configurations
- Media Library
- URL Tester
- Developer Tools (conditional)

### UI Components

#### JsonCardsGroup (`components/ui/cards/jsonCardsGroup.tsx`)

Displays cards in a grid layout with grouping.

**Features**:
- Grid/list view toggle
- Card grouping by tags
- Drag-and-drop organization
- Actions (edit, duplicate, delete, deploy)
- Deployment status badges

#### Modals

**EditTitleModal**: Edit page title
**DeleteConfirmModal**: Confirm deletions
**DeploymentModal**: Deployment progress

#### Notifications (`components/ui/notifications/`)

Toast notification system.

**Types**:
- Success (green)
- Error (red)
- Warning (yellow)
- Info (blue)
- Deployment success (with URL link)

**Usage**:
```tsx
const { success, error, deploymentSuccess } = useNotifications();

success('Landing page saved!');
error('Failed to deploy');
deploymentSuccess('my-page', 'https://example.com/my-page');
```

### Editor Components

#### Landing Page Editor (`components/landingpagesconfig/`)

Visual editor for landing pages.

**Components**:
- `newLpConfiguration.tsx` - Main editor container
- `settings/` - Configuration panels for each section type
  - `navbarSettings.tsx`
  - `heroSettings.tsx`
  - `footerSettings.tsx`
  - `widgetSettings.tsx`

**Features**:
- Section list with drag-and-drop
- Add/remove sections
- Configure section properties
- Real-time preview
- JSON view/edit mode

#### LinkBio Editor (`components/linkbioconfig/`)

Visual editor for LinkBio pages.

**Components**:
- `linkBioPreview.tsx` - Preview component
- Configuration forms for profile, links, sections

---

## State Management

### Context Providers

#### AuthProvider (`components/layout/authContext.tsx`)

Manages authentication state.

**Provides**:
- `user` - Current user object
- `loading` - Auth loading state
- `isAllowed` - Authorization check
- `logout` - Logout function

**Usage**:
```tsx
const { user, isAllowed, logout } = useAuth();
```

#### NotificationsProvider (`components/ui/notifications/`)

Manages notification toast state.

**Provides**:
- `success(message, options)` - Show success notification
- `error(message, options)` - Show error notification
- `warning(message, options)` - Show warning
- `info(message, options)` - Show info
- `deploymentSuccess(name, url)` - Show deployment success with link

#### TopNavigationProvider (`components/layout/topNavigationContext.tsx`)

Manages top navigation state.

**Provides**:
- `searchQuery` - Current search query
- `setSearchQuery` - Update search query
- Navigation metadata

### Custom Hooks

#### useLandingPages (`hooks/hooksPages/useLandingPages.ts`)

Manages landing page data.

**Returns**:
```typescript
{
  pages: LandingPageConfig[],      // All landing pages
  loading: boolean,                 // Loading state
  error: Error | null,              // Error state
  refresh: () => void,              // Refresh data
  updateTitle: (id, title) => void, // Update title
  duplicate: (id) => void,          // Duplicate page
  deploy: (id) => void              // Deploy page
}
```

#### useDeployment (`hooks/hooksDeployment/useDeployment.ts`)

Manages deployment UI state.

**Returns**:
```typescript
{
  deploymentOverlayOpen: boolean,
  deployingConfig: { id, name } | null,
  openDeployment: (config) => void,
  closeDeployment: () => void
}
```

#### useDeploymentStatus (`hooks/hooksDeployment/useDeploymentStatus.ts`)

Checks deployment status of pages.

**Returns**:
```typescript
{
  status: DeploymentStatus,
  loading: boolean,
  refresh: () => void
}
```

#### usePagination (`hooks/hooksPages/usePagination.ts`)

Manages pagination state.

**Returns**:
```typescript
{
  currentPage: number,
  itemsPerPage: number,
  totalPages: number,
  paginatedItems: T[],
  goToPage: (page) => void,
  nextPage: () => void,
  prevPage: () => void
}
```

---

## API Integration

### API Client Architecture

**Base Client** (`api/baseClient.ts`):
- Centralized HTTP client
- Request/response interceptors
- Error handling
- Authentication headers

**API Modules**:

#### landingPages.api.ts

```typescript
export const landingPagesApi = {
  fetchAll: () => Promise<LandingPageRecord[]>,
  fetchById: (id: string) => Promise<LandingPageRecord>,
  saveToFirestore: (data) => Promise<SaveResponse>,
  deployToGCS: (data) => Promise<DeployResponse>,
  delete: (id: string) => Promise<void>
};
```

#### linkBioPages.api.ts

```typescript
export const linkBioPagesApi = {
  fetchAll: () => Promise<LinkBioRecord[]>,
  fetchById: (id: string) => Promise<LinkBioRecord>,
  save: (data) => Promise<SaveResponse>,
  deploy: (id: string) => Promise<DeployResponse>
};
```

#### experiments.api.ts

```typescript
export const experimentsApi = {
  listExperiments: () => Promise<Experiment[]>,
  getExperiment: (id: string) => Promise<Experiment>,
  createExperiment: (data) => Promise<Experiment>,
  updateExperiment: (id, data) => Promise<Experiment>
};
```

### API Request Flow

```
Component
  └─> Custom Hook (e.g., useLandingPages)
      └─> API Module (e.g., landingPages.api.ts)
          └─> Base Client (baseClient.ts)
              └─> Backend API (HTTP request)
                  └─> Firestore/Cloud Build
```

---

## Authentication

### Firebase Authentication

Frontend uses Firebase Authentication with Google Sign-In.

**Setup** (`firebase/auth.ts`):
```typescript
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
```

### Authorization

**IAP (Identity-Aware Proxy)** integration for backend API:
- Backend validates IAP headers
- Frontend includes IAP token in requests
- User permissions checked in `iap.api.ts`

### AuthContext

**Usage**:
```tsx
import { useAuth } from './components/layout/authContext';

function MyComponent() {
  const { user, isAllowed, logout } = useAuth();

  if (!isAllowed) {
    return <div>Unauthorized</div>;
  }

  return <div>Hello {user?.email}</div>;
}
```

---

## Development

### Running Frontend Locally

```bash
# From project root
npm run dev

# Or directly
npm run dev -w @pageforge/frontend

# Opens at http://localhost:5173
```

### Development Server Features

**Vite Dev Server**:
- Hot Module Replacement (HMR)
- Fast refresh for React components
- Instant updates on file changes
- Source maps for debugging

**Proxy Configuration** (`vite.config.ts`):
```typescript
server: {
  port: 5173,
  proxy: {
    '/api': {
      target: 'http://localhost:3002',  // Backend API
      changeOrigin: true
    }
  }
}
```

### Making Changes

**Component Development**:
```bash
# 1. Edit component
vim app/frontend/src/components/ui/myComponent.tsx

# 2. Changes reflect immediately (HMR)
# 3. Check browser for updates
```

**Using Workspace Dependencies**:
```typescript
// Import from @pageforge/static-websites
import { JsonLanding } from '@pageforge/static-websites';

// Changes to static-websites components update instantly
// No rebuild needed (static-websites has no build step)
```

**Using Builder Packages**:
```bash
# If you modify builder workspaces, rebuild them first
npm run build -w @pageforge/lp-builder

# Then frontend will use updated version
```

### Testing

**Component Testing Page**: `/dev_components`
- Test individual UI components
- Preview all widget types
- Test notifications
- Debug component props

**Landing Page Testing**: `/dev_lps`
- Test LP configurations
- Validate JSON structures
- Test edge cases

**Sandbox**: `/dev_sandbox`
- Experimental features
- Quick prototyping
- Test new ideas

### Building for Production

```bash
# Build pageforge
npm run build -w @pageforge/frontend

# Output: app/frontend/dist/
# Contains: index.html, assets/, etc.
```

**Build Configuration** (`vite.config.ts`):
```typescript
build: {
  outDir: 'dist',
  emptyOutDir: true,
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    output: {
      manualChunks: undefined  // Auto chunking
    }
  }
}
```

---

## Configuration

### Environment Variables

**File**: `.env` (in `app/frontend/`)

```bash
# Backend API URL
VITE_BACKEND_URL=http://localhost:3002

# Firebase Configuration
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...

# Deployment Cache
VITE_DEPLOYMENT_CACHE_URL=https://...

# Public Deploy Base URL
VITE_PUBLIC_DEPLOY_BASE_URL=https://...
```

### Vite Configuration

**File**: `vite.config.ts`

**Key Features**:
```typescript
{
  plugins: [react()],

  // Path aliases
  resolve: {
    alias: {
      '@': './src',
      '@components': './src/components',
      '@services': './src/services',
      '@types': './src/types',
      '@hooks': './src/hooks',
      '@static-websites': '../static-websites/components'
    }
  },

  // Dev server
  server: {
    port: 5173,
    proxy: { /* ... */ }
  },

  // Build options
  build: {
    outDir: 'dist',
    sourcemap: false
  }
}
```

### Tailwind Configuration

**File**: `tailwind.config.js`

```javascript
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../static-websites/components/**/*.{js,ts,jsx,tsx}'  // Include static-websites
  ],
  theme: {
    extend: { /* custom theme */ }
  }
}
```

### TypeScript Configuration

**File**: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@services/*": ["./src/services/*"]
    }
  }
}
```

---

## Key Workflows

### Creating a New Landing Page

1. **Navigate** to Landing Pages (`/`)
2. **Click** "Create New" button
3. **Edit** in visual editor:
   - Add sections (Navbar, Hero, Footer, Widgets)
   - Configure each section
   - Preview in real-time
4. **Save** to Firestore
5. **Deploy** when ready

### Editing an Existing Page

1. **Navigate** to Landing Pages (`/`)
2. **Click** on page card
3. **Editor opens** with current configuration
4. **Make changes** in visual editor or JSON view
5. **Preview** changes
6. **Save** updates
7. **Deploy** new version

### Deploying a Page

1. **From List View**:
   - Click deploy icon on card
   - Confirmation dialog appears
   - Click "Deploy"

2. **From Editor**:
   - Click deploy button in toolbar
   - Deployment starts immediately

3. **Process**:
   - Frontend → Backend API (`POST /lp/deploy/:id`)
   - Backend → Cloud Build trigger
   - Cloud Build → Generate & build
   - Hosting → Static site live
   - Notification shows success with URL

### Managing Groups

1. **Create Group**:
   - Click "New Group" in sidebar
   - Enter name and color
   - Save

2. **Add Pages to Group**:
   - Drag page card onto group
   - Or use card menu → "Add to Group"

3. **View Grouped Pages**:
   - Click group in sidebar
   - See filtered list

---

## Best Practices

### Component Organization

- Keep components small and focused
- Use TypeScript interfaces for props
- Extract reusable logic into hooks
- Separate UI from business logic

### State Management

- Use context for global state
- Use hooks for component state
- Use services for shared logic
- Keep API calls in API modules

### Performance

- Use React.memo for expensive components
- Lazy load routes with React.lazy
- Optimize images and assets
- Use pagination for large lists
- Implement virtual scrolling for huge lists

### Code Style

- Follow naming conventions (see [namingCasing.md](./namingCasing.md))
- Use TypeScript types consistently
- Document complex logic with comments
- Use ESLint rules

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module '@pageforge/static-websites'"

**Solution**:
```bash
# Reinstall dependencies
cd ../..  # Go to root
npm install
```

#### 2. HMR Not Working

**Solutions**:
- Check Vite dev server is running
- Clear browser cache
- Restart dev server
- Check console for errors

#### 3. API Requests Failing

**Check**:
- Backend is running (`docker compose up`)
- Proxy configuration in `vite.config.ts`
- Network tab in browser DevTools
- Backend logs for errors

#### 4. Authentication Not Working

**Check**:
- Firebase configuration in `.env`
- User has permissions
- IAP headers being sent
- Backend authentication middleware

#### 5. Preview Not Matching Production

**Reasons**:
- Using different component versions
- Environment variables differ
- Build process modifies output
- Check workspace links are correct

---

## Summary

### Frontend at a Glance

**Purpose**: Internal management UI for PageForge content
**Technology**: React + TypeScript + Vite
**Users**: Content creators, administrators, developers
**Key Features**: Visual editing, real-time preview, deployment

### Key Capabilities

1. ✅ **Create & Edit** landing pages and LinkBio pages
2. ✅ **Preview** in real-time using production components
3. ✅ **Save** to Firestore database
4. ✅ **Deploy** to static hosting
5. ✅ **Manage** video generation and experiments
6. ✅ **Test** components and configurations

### Architecture Highlights

- **Workspace Consumer**: Uses `@pageforge/static-websites`, `@pageforge/lp-builder`, `@pageforge/linkbio-builder`
- **React Router**: Client-side routing with protection
- **Context Providers**: Auth, notifications, navigation state
- **Custom Hooks**: Reusable logic for data fetching and state
- **API Modules**: Organized API clients for backend integration
- **Vite**: Fast development with HMR

### Related Documentation

- [Architecture](./Architecture.md) - Overall system architecture
- [Workspaces](./workspaces.md) - NPM workspaces structure
- [Build & Deploy](./buildAndDeploy.md) - Deployment process
- [Naming Conventions](./namingCasing.md) - Code style guide

---

Frontend is the heart of the PageForge content management system, providing a powerful yet intuitive interface for creating and managing dynamic web content.
