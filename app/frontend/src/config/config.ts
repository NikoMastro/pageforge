type EnvRecord = Record<string, string | boolean | undefined>;

const resolveEnvSource = (): EnvRecord => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env as EnvRecord;
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env as EnvRecord;
  }
  return {};
};

const rawEnv: EnvRecord = resolveEnvSource();

const readEnv = (key: string): string | undefined => {
  const value = rawEnv[key];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
};

const sanitizeBaseUrl = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '/api';
  }

  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');
  return withoutTrailingSlash.length > 0 ? withoutTrailingSlash : '/api';
};

const resolveLocalBackendFallback = (): string | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  const origin = window.location.origin;
  if (!origin) {
    return undefined;
  }

  if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return 'http://localhost:8080';
  }

  return undefined;
};

const resolveBackendUrl = (): string => {
  const envBackendUrl = readEnv('VITE_BACKEND_URL');
  if (envBackendUrl) {
    return sanitizeBaseUrl(envBackendUrl);
  }
  const localFallback = resolveLocalBackendFallback();
  if (localFallback) {
    return sanitizeBaseUrl(localFallback);
  }
  return '/api';
};

export const backendUrl = resolveBackendUrl();
export const videoLibraryEndpoint = readEnv('VITE_VIDEO_LIBRARY_ENDPOINT');
export const deploymentCacheUrl = readEnv('VITE_DEPLOYMENT_CACHE_URL');
export const publicDeployBaseUrl = readEnv('VITE_PUBLIC_DEPLOY_BASE_URL');

export const pixelBaseUrl = '/px';
export const pixelPftagProduction = '/px/pftag.js';
export const pixelPftagPreproduction = '/px/preprod_pftag.js';

export const VEO_MODEL_IDS = [
  'veo-2.0-generate-001',
  'veo-2.0-generate-exp',
  'veo-2.0-generate-preview',
  'veo-3.0-generate-001',
  'veo-3.0-fast-generate-001',
  'veo-3.1-generate-preview',
  'veo-3.1-fast-generate-preview',
] as const;

export type VeoModelId = (typeof VEO_MODEL_IDS)[number];

export const DEFAULT_VEO_MODEL_ID: VeoModelId = 'veo-3.0-generate-001';

export const defaultExperimentFetchLimit = 100;


// TODO: CHECK AND REMOVE IF NOT USED ANYMORE
export const firebaseApiKey = readEnv('VITE_FIREBASE_API_KEY');
export const firebaseAuthDomain = readEnv('VITE_FIREBASE_AUTH_DOMAIN');


export const firebaseProjectId = readEnv('VITE_FIREBASE_PROJECT_ID');
export const firebaseStorageBucket = readEnv('VITE_FIREBASE_STORAGE_BUCKET');
export const firebaseMessagingSenderId = readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID');
export const firebaseAppId = readEnv('VITE_FIREBASE_APP_ID');
export const firebaseMeasurementId = readEnv('VITE_FIREBASE_MEASUREMENT_ID');

export const readFrontendEnv = (key: string, fallback?: string): string | undefined => {
  const value = readEnv(key);
  return value ?? fallback;
};
