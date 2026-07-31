import { backendUrl } from '../config/config';

const DEFAULT_BASE_URL = backendUrl;

type HeadersRecord = Record<string, string>;

const buildHeaders = (init?: HeadersInit): Headers => {
  if (!init) return new Headers();
  if (init instanceof Headers) return new Headers(init);
  return new Headers(init);
};

export interface RequestOptions extends RequestInit {
  baseUrl?: string;
  skipAuth?: boolean;
}

const ensureAuthHeader = async (skipAuth?: boolean): Promise<HeadersRecord> => {
  if (skipAuth) return {};
  try {
    const { getFirebaseAuth } = await import('../firebase/config');
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user) return {};
    const token = await user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
};

const shouldAddContentType = (headers: Headers, method: string, body?: BodyInit | null): boolean => {
  if (!body) return false;
  if (method === 'GET') return false;
  if (typeof FormData !== 'undefined' && body instanceof FormData) return false;
  if (headers.has('Content-Type')) return false;
  return true;
};

export const resolveBaseUrl = () => DEFAULT_BASE_URL;

export async function requestJson<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const {
    baseUrl = DEFAULT_BASE_URL,
    skipAuth,
    headers: providedHeaders,
    method: rawMethod,
    body,
    ...rest
  } = options;

  const method = (rawMethod ?? 'GET').toUpperCase();
  const isGet = method === 'GET';
  const hasQuery = endpoint.includes('?');
  const cacheBuster = `_=${Date.now()}`;
  const suffix = isGet ? `${hasQuery ? '&' : '?'}${cacheBuster}` : '';
  const url = `${baseUrl}${endpoint}${suffix}`;

  const headers = buildHeaders(providedHeaders);
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'no-cache, no-store, max-age=0');
  }
  if (!headers.has('Pragma')) {
    headers.set('Pragma', 'no-cache');
  }

  const authHeader = await ensureAuthHeader(skipAuth);
  Object.entries(authHeader).forEach(([key, value]) => {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  });

  if (shouldAddContentType(headers, method, body)) {
    headers.set('Content-Type', 'application/json');
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      method,
      headers,
      body,
      ...(isGet ? { cache: 'no-store' as RequestCache } : {}),
    });
  } catch (error: any) {
    throw new Error(`Network error calling ${endpoint}: ${error?.message || error}`);
  }

  if (!response.ok) {
    let details = '';
    try {
      details = await response.text();
    } catch {
      /* noop */
    }
    const message = details ? ` - ${details}` : '';
    throw new Error(`HTTP ${response.status} on ${endpoint}${message}`);
  }

  try {
    return await response.json();
  } catch (error: any) {
    throw new Error(`Failed to parse JSON from ${endpoint}: ${error?.message || error}`);
  }
}

export type { RequestOptions as BaseRequestOptions };
