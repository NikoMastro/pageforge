# Naming and Casing Conventions

This document defines the naming and casing standards for the PageForge project to ensure consistency across all codebases.


---

## Table of Contents

1. [File Naming Conventions](#file-naming-conventions)
2. [TypeScript/JavaScript Conventions](#typescriptjavascript-conventions)
3. [React Components](#react-components)
4. [Backend Conventions](#backend-conventions)
5. [CSS and Styling](#css-and-styling)
6. [Database and API](#database-and-api)
7. [Environment Variables](#environment-variables)

---

## File Naming Conventions

### General Rules

| File Type | Convention | Example |
|-----------|------------|---------|
| **React Components** | camelCase | `jsonLanding.tsx`, `hero.tsx` |
| **TypeScript Files** | camelCase | `useDeployment.ts`, `groups.service.ts` |
| **JavaScript Files** | camelCase | `baseRoute.js`, `savetoFirestore.js` |
| **API Files** | camelCase with `.api` suffix | `landingPages.api.ts`, `experiments.api.ts` |
| **Service Files** | camelCase with `.service` suffix | `groups.service.ts`, `pageforge.service.ts` |
| **Type Files** | camelCase with `.types` suffix | `config.types.ts`, `ui.types.ts` |
| **Utility Files** | camelCase with descriptive name | `cloudBuildUtils.js`, `firestoreParsers.ts` |
| **Hook Files** | camelCase starting with `use` | `useDeployment.ts`, `useExperiments.ts` |
| **Configuration Files** | camelCase or kebab-case | `config.ts`, `tailwind.config.js` |
| **Route Files** | camelCase with `Route` suffix | `landingPagesRoute.js`, `linkbioRoute.js` |

### Folder Naming

| Folder Type | Convention | Example |
|-------------|------------|---------|
| **React Components** | camelCase | `landingPage/`, `linkbio/` |
| **Feature Folders** | camelCase | `landingPages/`, `videoGeneration/` |
| **Backend Routes** | camelCase | `gcputils/`, `vertexai/` |
| **Hook Folders** | camelCase with `hooks` prefix | `hooksDeployment/`, `hooksExperiments/` |
| **Utility Folders** | lowercase or camelCase | `utils/`, `firestoreutils/` |

### Special Cases

```
✅ Correct:
- jsonLanding.tsx           (React component)
- useDeployment.ts          (React hook)
- groups.service.ts         (Service)
- landingPages.api.ts       (API client)
- config.types.ts           (Type definitions)
- cloudBuildUtils.js        (Utilities)

❌ Incorrect:
- json-landing.tsx          (kebab-case for components)
- UseDeployment.ts          (PascalCase for hooks)
- GroupsService.ts          (PascalCase for services)
- landing_pages_api.ts      (snake_case)
```

---

## TypeScript/JavaScript Conventions

### Variables

**Use `camelCase` for all variables**

```typescript
// ✅ Correct
const userName = 'John';
const isDeploymentReady = true;
const deploymentConfig = { ... };
const cardGroupsList = [];

// ❌ Incorrect
const user_name = 'John';           // snake_case
const UserName = 'John';            // PascalCase
const is-deployment-ready = true;   // kebab-case
```

### Constants

**Use `SCREAMING_SNAKE_CASE` for true constants**

```typescript
// ✅ Correct - True constants (never change)
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;
const STORAGE_KEY = 'json-card-groups';
const GCS_BUCKET_NAME = 'my-bucket';

// ✅ Correct - Configuration values that don't change at runtime
const DEFAULT_TIMEOUT = 5000;
const ALLOWED_FILE_TYPES = ['jpg', 'png', 'gif'];

// ⚠️ Use camelCase for const variables that are not true constants
const deploymentConfig = loadConfig();  // Value determined at runtime
const currentUser = getCurrentUser();   // Value changes
```

### Functions

**Use `camelCase` for all functions**

```typescript
// ✅ Correct
function fetchUserData() { ... }
function calculateTotalPrice() { ... }
function parseServerResponse() { ... }
async function deployDomains() { ... }

// ❌ Incorrect
function FetchUserData() { ... }       // PascalCase
function fetch_user_data() { ... }     // snake_case
```

### Classes

**Use `PascalCase` for all classes**

```javascript
// ✅ Correct
class BaseRoute { ... }
class RouteRegistry { ... }
class LandingPagesRoute extends BaseRoute { ... }

// ❌ Incorrect
class baseRoute { ... }               // camelCase
class landing_pages_route { ... }     // snake_case
```

### Interfaces and Types

**Use `PascalCase` for interfaces and type aliases**

```typescript
// ✅ Correct - Interfaces
export interface UserProfile { ... }
export interface DeploymentConfig { ... }
export interface CardGroupDTO { ... }
export interface UseDeploymentReturn { ... }

// ✅ Correct - Type Aliases
export type SectionType = 'navbar' | 'hero' | 'footer';
export type DeploymentStatus = 'pending' | 'success' | 'failed';

// ❌ Incorrect
export interface userProfile { ... }      // camelCase
export interface deployment_config { ... } // snake_case
export type section-type = ...            // kebab-case
```

### Enums

**Use `PascalCase` for enum names, `SCREAMING_SNAKE_CASE` for values**

```typescript
// ✅ Correct
enum DeploymentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED'
}

enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

// ❌ Incorrect
enum deploymentStatus { ... }          // camelCase
enum Deployment_Status { ... }         // mixed case
```

### Generic Type Parameters

**Use single uppercase letters or descriptive PascalCase**

```typescript
// ✅ Correct - Single letter
function identity<T>(arg: T): T { ... }
function merge<T, U>(obj1: T, obj2: U) { ... }

// ✅ Correct - Descriptive (for complex scenarios)
function createStore<TState, TAction>(reducer: Reducer<TState, TAction>) { ... }

// ❌ Incorrect
function identity<t>(arg: t): t { ... }        // lowercase
function merge<Type1, Type2>() { ... }         // inconsistent
```

---

## React Components

### Component Names

**Use `PascalCase` for all React component names**

```tsx
// ✅ Correct
export const JsonLanding: React.FC<JsonLandingProps> = ({ content }) => { ... }
export const Hero: React.FC<HeroProps> = ({ heading, subheading }) => { ... }
export const BackgroundMedia = ({ src, type }) => { ... }

// ❌ Incorrect
export const jsonLanding = () => { ... }       // camelCase
export const json-landing = () => { ... }      // kebab-case
export const JSON_LANDING = () => { ... }      // SCREAMING_SNAKE_CASE
```

### Props Interfaces

**Use `PascalCase` with `Props` suffix**

```tsx
// ✅ Correct
interface JsonLandingProps {
  content: LandingPageData;
  isPreview?: boolean;
}

interface HeroProps {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
}

// ❌ Incorrect
interface jsonLandingProps { ... }        // camelCase
interface JsonLanding_Props { ... }       // snake_case
interface IJsonLandingProps { ... }       // Hungarian notation (avoid I prefix)
```

### Component File Structure

```tsx
// ✅ Correct Component Structure
import React from 'react';
import type { ComponentProps } from './types';

interface JsonLandingProps {
  content: LandingPageData;
  isPreview?: boolean;
}

export const JsonLanding: React.FC<JsonLandingProps> = ({
  content,
  isPreview = false
}) => {
  // Component logic
  const [isLoading, setIsLoading] = useState(false);

  // Event handlers - use 'handle' prefix
  const handleSubmit = () => { ... };
  const handleClose = () => { ... };

  // Computed values
  const displayContent = useMemo(() => { ... }, [content]);

  return (
    <div className="json-landing">
      {/* JSX */}
    </div>
  );
};

export default JsonLanding;
```

### Event Handlers

**Use `handle` prefix for event handlers**

```tsx
// ✅ Correct
const handleClick = () => { ... };
const handleSubmit = (event: FormEvent) => { ... };
const handleInputChange = (value: string) => { ... };
const handleDeploymentClose = () => { ... };

// ❌ Incorrect
const onClick = () => { ... };              // Missing 'handle'
const submit = () => { ... };               // Not descriptive
const onButtonClick = () => { ... };        // 'on' prefix (reserved for props)
```

### Component Props (Callbacks)

**Use `on` prefix for callback props**

```tsx
// ✅ Correct
interface ButtonProps {
  onClick?: () => void;
  onHover?: () => void;
  onSubmit?: (data: FormData) => void;
}

<Button
  onClick={handleClick}
  onSubmit={handleSubmit}
/>

// ❌ Incorrect
interface ButtonProps {
  handleClick?: () => void;     // Don't use 'handle' in props
  clickHandler?: () => void;    // Inconsistent naming
}
```

### Boolean Props and State

**Use `is`, `has`, `should`, or `can` prefix**

```tsx
// ✅ Correct
const [isLoading, setIsLoading] = useState(false);
const [hasError, setHasError] = useState(false);
const [shouldRender, setShouldRender] = useState(true);
const [canEdit, setCanEdit] = useState(false);

interface ComponentProps {
  isVisible?: boolean;
  isDisabled?: boolean;
  hasPermission?: boolean;
  shouldAutoSave?: boolean;
}

// ❌ Incorrect
const [loading, setLoading] = useState(false);     // Not descriptive
const [visible, setVisible] = useState(true);      // Ambiguous
const [disabled, setDisabled] = useState(false);   // Missing prefix
```

---

## Backend Conventions

### Express Routes

**Use `camelCase` with `Route` suffix for route classes**

```javascript
// ✅ Correct
class LandingPagesRoute extends BaseRoute { ... }
class LinkbioRoute extends BaseRoute { ... }
class ExperimentRoute extends BaseRoute { ... }
class IAPUserRoute extends BaseRoute { ... }

// ❌ Incorrect
class LandingPages_Route { ... }         // snake_case
class landingPagesRoute { ... }          // camelCase (classes need PascalCase)
```

### API Endpoints

**Use kebab-case for URL paths**

```javascript
// ✅ Correct
app.use('/landing-pages', router);
app.get('/api/config-options', handler);
app.post('/api/deploy-domain', handler);

// ❌ Incorrect
app.use('/landingPages', router);        // camelCase in URL
app.use('/landing_pages', router);       // snake_case acceptable but inconsistent
```

### Firestore Collections

**Use camelCase for collection names**

```javascript
// ✅ Correct
const collectionName = 'landingPages';
const collectionName = 'linkBioPages';
const collectionName = 'experiments';
const collectionName = 'videoGeneration';

// ❌ Incorrect
const collectionName = 'landing_pages';  // snake_case
const collectionName = 'LandingPages';   // PascalCase
```

### Middleware Functions

**Use `camelCase` with descriptive names**

```javascript
// ✅ Correct
const corsMiddleware = require('./middleware/corsMiddleware');
const authMiddleware = (req, res, next) => { ... };
const validateRequest = (req, res, next) => { ... };

// ❌ Incorrect
const CorsMiddleware = ...               // PascalCase
const cors_middleware = ...              // snake_case
```

### Database Field Names

**Use camelCase for JSON/Firestore field names**

```javascript
// ✅ Correct - Firestore Document
{
  userId: 'abc123',
  createdAt: timestamp,
  displayName: 'John Doe',
  isActive: true,
  metadata: {
    lastLogin: timestamp,
    loginCount: 5
  }
}

// ❌ Incorrect
{
  user_id: 'abc123',          // snake_case
  UserID: 'abc123',           // PascalCase
  'display-name': 'John'      // kebab-case
}
```

---

## CSS and Styling

### CSS Classes (Tailwind)

**Use kebab-case for custom CSS classes**

```tsx
// ✅ Correct
<div className="landing-page">
<div className="hero-section">
<div className="button-primary">

// ❌ Incorrect
<div className="landingPage">          // camelCase
<div className="hero_section">         // snake_case
<div className="ButtonPrimary">        // PascalCase
```

### Tailwind CSS Classes

**Use Tailwind's standard format (lowercase with hyphens)**

```tsx
// ✅ Correct
<div className="flex items-center justify-between px-4 py-2 bg-blue-500">
<button className="text-white font-bold hover:bg-blue-600">

// Combined with custom classes
<div className="flex hero-section bg-gradient-to-r">
```

### CSS-in-JS (Emotion)

**Use camelCase for style object properties**

```tsx
// ✅ Correct
const styles = {
  container: css`
    display: flex;
    alignItems: center;
    backgroundColor: '#fff';
  `,
  headerText: css`
    fontSize: '24px';
    fontWeight: 'bold';
  `
};

// ❌ Incorrect
const styles = {
  Container: css`...`,              // PascalCase
  'header-text': css`...`,          // kebab-case
};
```

---

## Database and API

### API Endpoints

**REST API naming conventions**

```typescript
// ✅ Correct - RESTful endpoints
GET    /api/landing-pages           // List all
GET    /api/landing-pages/:id       // Get one
POST   /api/landing-pages           // Create
PUT    /api/landing-pages/:id       // Update
DELETE /api/landing-pages/:id       // Delete

GET    /api/link-bio-pages
POST   /api/experiments/:id/deploy

// ❌ Incorrect
GET    /api/getLandingPages         // Verb in URL
POST   /api/landing-pages/create    // Redundant 'create'
GET    /api/landingPages            // camelCase in URL
```

### API Request/Response Objects

**Use camelCase for JSON properties**

```typescript
// ✅ Correct - Request Body
{
  userId: "123",
  landingPageId: "abc",
  deploymentConfig: {
    targetEnvironment: "production",
    enableCaching: true
  }
}

// ✅ Correct - Response Body
{
  success: true,
  data: {
    deploymentId: "deploy-123",
    status: "pending",
    createdAt: "2025-12-10T10:00:00Z"
  }
}

// ❌ Incorrect
{
  user_id: "123",                   // snake_case
  DeploymentConfig: { ... },        // PascalCase
  "target-environment": "prod"      // kebab-case
}
```

### Query Parameters

**Use camelCase for query parameters**

```typescript
// ✅ Correct
GET /api/landing-pages?pageSize=10&sortBy=createdAt&filterBy=active

// API Client
const fetchPages = (params: {
  pageSize: number;
  sortBy: string;
  filterBy?: string;
}) => { ... };

// ❌ Incorrect
GET /api/landing-pages?page_size=10&sort-by=createdAt  // Mixed case
```

---

## Environment Variables

**Use `SCREAMING_SNAKE_CASE` for all environment variables**

```bash
# ✅ Correct
API_BASE_URL=https://api.example.com
FIREBASE_PROJECT_ID=my-project
GCS_BUCKET_NAME=my-bucket
NODE_ENV=production
MAX_RETRY_ATTEMPTS=3

# Prefixed variables for specific configs
_LP_CONFIG_HEADER='{"type": "navbar"}'
_ZT_CONFIG_PROFILE='{"name": "John"}'

# ❌ Incorrect
apiBaseUrl=...                    # camelCase
firebase-project-id=...           # kebab-case
gcsBucketName=...                 # camelCase
```

**Accessing in code:**

```typescript
// ✅ Correct
const apiUrl = process.env.API_BASE_URL;
const projectId = process.env.FIREBASE_PROJECT_ID;
const bucketName = process.env.GCS_BUCKET_NAME;

// Use camelCase for the variable names
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  apiKey: process.env.FIREBASE_API_KEY
};
```

---

## Special Patterns

### Hooks (React)

**Always start with `use` prefix, followed by descriptive name**

```typescript
// ✅ Correct
export const useDeployment = () => { ... };
export const useDeploymentStatus = () => { ... };
export const useExperiments = () => { ... };
export const useAuth = () => { ... };

// ❌ Incorrect
export const deploymentHook = () => { ... };   // Missing 'use'
export const UseDeployment = () => { ... };    // PascalCase
export const use_deployment = () => { ... };   // snake_case
```

### Services

**Use camelCase with `.service` suffix in filename**

```typescript
// File: groups.service.ts
const groupsService = {
  getAllGroups: async () => { ... },
  createGroup: async () => { ... },
  updateGroup: async () => { ... },
  deleteGroup: async () => { ... }
};

export default groupsService;
```

### API Clients

**Use camelCase with `.api` suffix in filename**

```typescript
// File: landingPages.api.ts
export const landingPagesApi = {
  fetchAll: async () => { ... },
  fetchById: async (id: string) => { ... },
  create: async (data: LandingPageData) => { ... },
  update: async (id: string, data: Partial<LandingPageData>) => { ... },
  delete: async (id: string) => { ... }
};
```

### Utility Functions

**Group related utilities in a module, use camelCase for functions**

```typescript
// File: cloudBuildUtils.js
const cloudBuildUtils = {
  triggerBuild: async (config) => { ... },
  getBuildStatus: async (buildId) => { ... },
  cancelBuild: async (buildId) => { ... }
};

module.exports = cloudBuildUtils;

// Or export individually
export const triggerBuild = async (config) => { ... };
export const getBuildStatus = async (buildId) => { ... };
export const cancelBuild = async (buildId) => { ... };
```

---

## Import/Export Conventions

### Named Exports (Preferred)

```typescript
// ✅ Correct - Named exports
export const Hero: React.FC<HeroProps> = () => { ... };
export const Navbar: React.FC<NavbarProps> = () => { ... };
export interface HeroProps { ... }
export type SectionType = 'hero' | 'navbar';

// Usage
import { Hero, Navbar, HeroProps } from './components';
```

### Default Exports

```typescript
// ✅ Correct - Default export for main component
const JsonLanding: React.FC<JsonLandingProps> = () => { ... };
export default JsonLanding;

// Usage
import JsonLanding from './jsonLanding';
```

### Barrel Exports (index.ts)

```typescript
// ✅ Correct - Barrel file
// File: components/index.ts
export { Hero } from './hero';
export { Navbar } from './navbar';
export { Footer } from './footer';
export * from './types';

// Usage
import { Hero, Navbar, Footer } from './components';
```

---

## Acronyms and Abbreviations

**Treat acronyms as words in camelCase and PascalCase**

```typescript
// ✅ Correct
const apiUrl = 'https://api.example.com';    // not API_URL in variable
const htmlContent = '<div>...</div>';        // not HTMLContent
const userId = '123';                        // not userID

class HttpClient { ... }                     // not HTTPClient
interface JsonLandingProps { ... }           // not JSONLandingProps
function parseGcsUrl() { ... }               // not parseGCSUrl

// ⚠️ Exception for 2-letter acronyms in PascalCase
class IAPUserRoute { ... }                   // IAP (Identity-Aware Proxy)
interface UIProps { ... }                    // UI is commonly capitalized

// ✅ Always SCREAMING_SNAKE_CASE for constants
const API_BASE_URL = '...';
const GCS_BUCKET_NAME = '...';
const IAP_CLIENT_ID = '...';
```

---

## Quick Reference Table

| Element | Convention | Example |
|---------|------------|---------|
| **Files** | | |
| React Components | camelCase | `jsonLanding.tsx` |
| TypeScript/JS files | camelCase | `useDeployment.ts` |
| Services | camelCase + `.service` | `groups.service.ts` |
| API clients | camelCase + `.api` | `landingPages.api.ts` |
| Types | camelCase + `.types` | `config.types.ts` |
| Hooks | `use` + camelCase | `useDeployment.ts` |
| **Code** | | |
| Variables | camelCase | `const userName` |
| Constants | SCREAMING_SNAKE_CASE | `const API_URL` |
| Functions | camelCase | `function fetchData()` |
| Classes | PascalCase | `class BaseRoute` |
| Interfaces/Types | PascalCase | `interface UserProps` |
| Enums | PascalCase | `enum Status` |
| Enum values | SCREAMING_SNAKE_CASE | `Status.IN_PROGRESS` |
| React Components | PascalCase | `const Hero = () => {}` |
| Props interfaces | PascalCase + `Props` | `interface HeroProps` |
| Event handlers | `handle` + camelCase | `const handleClick` |
| Callback props | `on` + PascalCase | `onClick={...}` |
| Boolean values | `is/has/should` + camelCase | `const isLoading` |
| **Styling** | | |
| CSS classes | kebab-case | `class="hero-section"` |
| CSS-in-JS | camelCase | `fontSize: '16px'` |
| **API/Database** | | |
| URL paths | kebab-case | `/api/landing-pages` |
| JSON properties | camelCase | `{ userId: "123" }` |
| Query params | camelCase | `?pageSize=10` |
| Firestore collections | camelCase | `landingPages` |
| Environment variables | SCREAMING_SNAKE_CASE | `API_BASE_URL` |

---

## Examples by Context

### Creating a New Feature

Let's say you're adding a new "Video Library" feature:

```
✅ Correct Structure:

📁 backend/routes/videoLibrary/
  └── videoLibraryRoute.js         ← camelCase + Route suffix

📁 app/frontend/src/
  ├── pages/videoLibrary/
  │   └── page.tsx                  ← Feature page
  ├── api/
  │   └── videoLibrary.api.ts       ← camelCase + .api suffix
  ├── services/
  │   └── videoLibrary.service.ts   ← camelCase + .service suffix
  ├── types/
  │   └── videoLibrary.types.ts     ← camelCase + .types suffix
  └── hooks/
      └── useVideoLibrary.ts        ← use + camelCase

📁 app/static-websites/components/videoLibrary/
  └── videoPlayer.tsx               ← camelCase component file
```

**Code examples:**

```typescript
// videoLibrary.types.ts
export interface VideoItem {
  id: string;
  title: string;
  duration: number;
  thumbnailUrl: string;
  isPublished: boolean;
}

export interface VideoLibraryConfig {
  maxVideos: number;
  allowedFormats: string[];
}

// videoLibrary.api.ts
export const videoLibraryApi = {
  fetchAllVideos: async (): Promise<VideoItem[]> => { ... },
  uploadVideo: async (file: File): Promise<VideoItem> => { ... },
  deleteVideo: async (videoId: string): Promise<void> => { ... }
};

// useVideoLibrary.ts
export const useVideoLibrary = () => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    const data = await videoLibraryApi.fetchAllVideos();
    setVideos(data);
    setIsLoading(false);
  }, []);

  return { videos, isLoading, fetchVideos };
};

// videoPlayer.tsx
interface VideoPlayerProps {
  videoUrl: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  autoPlay = false,
  onEnded
}) => {
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  return (
    <div className="video-player">
      {/* Component JSX */}
    </div>
  );
};
```

---

## Common Mistakes to Avoid

```typescript
// ❌ WRONG - Mixed conventions
const User_Name = "John";              // Mixed snake and Pascal
const getUserData = () => {}           // Verb in component/class name
interface iUserProps {}                // Hungarian notation prefix
const COMPONENT_NAME = () => {}        // SCREAMING_SNAKE_CASE for component

// ✅ CORRECT
const userName = "John";
const userData = fetchUserData();
interface UserProps {}
const ComponentName = () => {}

// ❌ WRONG - Inconsistent boolean naming
const loading = true;
const visible = false;
const disabled = true;

// ✅ CORRECT
const isLoading = true;
const isVisible = false;
const isDisabled = true;

// ❌ WRONG - Event handlers
const onClick = () => {}               // Use 'handle' prefix
const buttonClick = () => {}           // Not descriptive enough
const onClickHandler = () => {}        // Redundant

// ✅ CORRECT
const handleClick = () => {}
const handleButtonClick = () => {}
const handleSubmit = () => {}

// ❌ WRONG - File naming
Hero.tsx                              // PascalCase
Hero-Component.tsx                    // Kebab-case
use_deployment.ts                     // Snake-case
LandingPages.API.ts                   // Multiple capitals

// ✅ CORRECT
hero.tsx                              // Component file (camelCase)
jsonLanding.tsx                       // Component file (camelCase)
useDeployment.ts                      // Hook file
landingPages.api.ts                   // API file
```
### Tools

Consider using these tools to enforce conventions:

- **ESLint**: Configure naming convention rules
