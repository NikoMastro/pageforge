import { requestJson } from './baseClient';
import { computeHashHex } from '../utils/backendPayload';
import type {
  ExperimentVariant,
  ExperimentMetadata,
  ExperimentRecord,
  ExperimentHistoryRecord,
  ExperimentListRecord,
  ExperimentSaveParams,
  ExperimentVariantPayload,
  FirestoreTimestamp,
  PixelConfig,
} from '../types/experiments';

export interface SaveExperimentRequest {
  metadata: ExperimentMetadata;
}

export interface SaveExperimentResponse {
  message: string;
  docId?: string;
}

const basePath = '/experiment';

const toIsoString = (value: unknown): string | undefined => {
  if (!value) {
    return undefined;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const candidate = new Date(trimmed);
    return Number.isNaN(candidate.getTime()) ? undefined : candidate.toISOString();
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  if (typeof value === 'number') {
    const millis = value < 2_000_000_000 ? value * 1000 : value;
    const candidate = new Date(millis);
    return Number.isNaN(candidate.getTime()) ? undefined : candidate.toISOString();
  }

  if (value && typeof value === 'object') {
    const ts = value as Record<string, unknown>;
    const secondsRaw = ts.seconds ?? ts._seconds;
    const nanosRaw = ts.nanoseconds ?? ts._nanoseconds;
    const seconds = typeof secondsRaw === 'number' ? secondsRaw : undefined;
    const nanos = typeof nanosRaw === 'number' ? nanosRaw : 0;

    if (typeof seconds === 'number') {
      const millis = seconds * 1000 + Math.floor(nanos / 1_000_000);
      const candidate = new Date(millis);
      return Number.isNaN(candidate.getTime()) ? undefined : candidate.toISOString();
    }

    const toDate = ts.toDate;
    if (typeof toDate === 'function') {
      const candidate = toDate.call(ts);
      return candidate instanceof Date && !Number.isNaN(candidate.getTime())
        ? candidate.toISOString()
        : undefined;
    }
  }

  return undefined;
};

const parseJsonSafe = <T = Record<string, unknown>>(value: unknown): T | null => {
  if (typeof value !== 'string') {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const pruneUndefined = (value: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  Object.entries(value).forEach(([key, entry]) => {
    if (entry !== undefined) {
      result[key] = entry as unknown;
    }
  });
  return result;
};

const sanitizeCustomPixelVars = (value: unknown): PixelConfig['customPixelVars'] => {
  if (!value) return undefined;
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (!entry || typeof entry !== 'object') {
          return null;
        }
        const raw = entry as Record<string, unknown>;
        const key = typeof raw.key === 'string' ? raw.key : undefined;
        const val = typeof raw.value === 'string' ? raw.value : undefined;
        if (!key) {
          return null;
        }
        return { key, value: val ?? '' };
      })
      .filter((item): item is { key: string; value: string } => Boolean(item) && item !== null && typeof item.key === 'string');
  }
  return undefined;
};

const sanitizePixelConfig = (value: unknown): PixelConfig | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const raw = value as Record<string, unknown>;
  const modeRaw = raw.pixelMode ?? raw.mode ?? raw.type;
  const allowedModes = new Set(['global', 'custom', 'pftag_prod', 'pftag_preprod']);
  const pixelMode = typeof modeRaw === 'string' && allowedModes.has(modeRaw) ? (modeRaw as PixelConfig['pixelMode']) : undefined;

  const gameId = typeof raw.gameId === 'string' ? raw.gameId : undefined;
  const partnerId = typeof raw.partnerId === 'string' ? raw.partnerId : undefined;
  const customPixelUrl = typeof raw.customPixelUrl === 'string' ? raw.customPixelUrl : undefined;
  const detectionType = typeof raw.detectionType === 'string' ? raw.detectionType : undefined;
  const mainUrl = typeof raw.mainUrl === 'string' ? raw.mainUrl : undefined;
  const fallbackUrl = typeof raw.fallbackUrl === 'string' ? raw.fallbackUrl : undefined;
  const customPixelVars = sanitizeCustomPixelVars(raw.customPixelVars);
  const isTest = typeof raw.isTest === 'boolean' ? raw.isTest : raw.isTest === 'true' ? true : raw.isTest === 'false' ? false : undefined;

  if (!pixelMode && !gameId && !partnerId && !customPixelUrl && !detectionType && !mainUrl && !fallbackUrl && !customPixelVars && typeof isTest === 'undefined') {
    return undefined;
  }

  return {
    pixelMode: pixelMode ?? 'global',
    gameId,
    partnerId,
    isTest,
    customPixelUrl,
    detectionType,
    mainUrl,
    fallbackUrl,
    customPixelVars,
  } satisfies PixelConfig;
};

const normalizeVariants = (value: unknown): ExperimentVariant[] => {
  if (!value) {
    return [];
  }

  const array = Array.isArray(value) ? value : [];

  return array
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const raw = entry as Record<string, unknown>;
      const label = raw.name ?? raw.lp ?? raw.pixel ?? raw.page_name;
      const name = typeof label === 'string' && label.trim().length > 0 ? label.trim() : null;

      if (!name) {
        return null;
      }

      const weightRaw = raw.weight ?? raw.distribution ?? raw.ratio;
      const weightNumber = typeof weightRaw === 'number' ? weightRaw : Number(weightRaw);
      const weight = Number.isFinite(weightNumber) ? weightNumber : 0;

      const config = sanitizePixelConfig(raw.config ?? raw.pixelConfig ?? raw.settings);

      return config
        ? ({ name, weight, config } satisfies ExperimentVariant)
        : ({ name, weight } satisfies ExperimentVariant);
    })
    .filter((variant): variant is ExperimentVariant => Boolean(variant));
};

const resolveVariantPayload = (raw: Record<string, unknown>): ExperimentVariantPayload => {
  const parsed = parseJsonSafe<Record<string, unknown>>(raw.lp_json);
  const hasLandingPagesArray = Array.isArray(raw.landingPages) || Array.isArray(parsed?.landingPages);
  const hasPixelsArray = Array.isArray(raw.pixels) || Array.isArray(parsed?.pixels);

  if (raw.variantType === 'pixels' || (!hasLandingPagesArray && hasPixelsArray)) {
    return {
      variantType: 'pixels',
      pixels: normalizeVariants(raw.pixels ?? parsed?.pixels),
      landingPages: undefined,
    };
  }

  return {
    variantType: 'landingPages',
    landingPages: normalizeVariants(raw.landingPages ?? parsed?.landingPages),
    pixels: undefined,
  } as ExperimentVariantPayload;
};

const normalizeExperimentMetadata = (raw: Record<string, unknown>): ExperimentMetadata => {
  const variantPayload = resolveVariantPayload(raw);
  const timestamp = toIsoString(raw.timestamp) ?? toIsoString(raw.Timestamp) ?? new Date().toISOString();
  const metadata: ExperimentMetadata = {
    ...variantPayload,
    experimentName: typeof raw.experimentName === 'string' && raw.experimentName.trim()
      ? raw.experimentName.trim()
      : typeof raw.page_name === 'string'
        ? raw.page_name
        : 'experiment',
    description: typeof raw.description === 'string' ? raw.description : undefined,
    user: typeof raw.user === 'string' ? raw.user : 'unknown',
    commit: typeof raw.commit === 'string' ? raw.commit : '',
    active: Boolean(raw.active),
    timestamp,
    type: 'experiment',
    hashid: typeof raw.hashid === 'string' ? raw.hashid : '',
    page_name: typeof raw.page_name === 'string' ? raw.page_name : (raw.experimentName as string) ?? '',
    lp_json: typeof raw.lp_json === 'string' ? raw.lp_json : JSON.stringify({}),
    Timestamp: toIsoString(raw.Timestamp) ?? timestamp,
    serverTimestamp: raw.serverTimestamp as FirestoreTimestamp | string | undefined,
  };

  return metadata;
};

const buildLpJsonPayload = (params: ExperimentSaveParams): Record<string, unknown> => {
  const base = pruneUndefined({
    experimentName: params.experimentName,
    variantType: params.variantType,
    description: params.description,
    commit: params.commit,
    active: params.active,
    user: params.user,
  });

  if (params.variantType === 'landingPages') {
    return pruneUndefined({
      ...base,
      landingPages: params.landingPages,
    });
  }

  return pruneUndefined({
    ...base,
    pixels: params.pixels,
  });
};

export const buildExperimentMetadata = async (
  params: ExperimentSaveParams
): Promise<ExperimentMetadata> => {
  const timestamp = params.timestamp ?? new Date().toISOString();
  const lpJsonObject = buildLpJsonPayload(params);
  const lp_json = JSON.stringify(lpJsonObject);
  const hashSource = `${params.experimentName}|${lp_json}`;
  const hashid = params.hashid ?? (await computeHashHex(hashSource));

  const variantPayload: ExperimentVariantPayload =
    params.variantType === 'landingPages'
      ? {
        variantType: 'landingPages',
        landingPages: params.landingPages,
      }
      : {
        variantType: 'pixels',
        pixels: params.pixels,
      };

  const metadata: ExperimentMetadata = {
    ...variantPayload,
    experimentName: params.experimentName,
    description: params.description,
    user: params.user,
    commit: params.commit,
    active: params.active,
    timestamp,
    type: 'experiment',
    hashid,
    page_name: params.experimentName,
    lp_json,
    Timestamp: timestamp,
    ...(params.extra ?? {}),
  };

  return metadata;
};

export const normalizeExperimentRecord = (raw: unknown): ExperimentRecord => {
  if (!raw || typeof raw !== 'object') {
    const fallbackMetadata = normalizeExperimentMetadata({});
    return {
      ...fallbackMetadata,
      id: undefined,
      version: undefined,
      createdAt: fallbackMetadata.timestamp,
      updatedAt: fallbackMetadata.timestamp,
    };
  }

  const record = raw as Record<string, unknown>;
  const metadata = normalizeExperimentMetadata(record);
  const createdAt = metadata.timestamp;
  const updatedAt = toIsoString(record.updatedAt) ?? toIsoString(record.serverTimestamp) ?? createdAt;

  return {
    ...metadata,
    id: typeof record.id === 'string' ? record.id : metadata.hashid,
    version: typeof record.version === 'number' ? record.version : undefined,
    createdAt,
    updatedAt,
  };
};

export async function listExperiments(limit?: number): Promise<ExperimentListRecord[]> {
  const suffix = typeof limit === 'number' ? `?limit=${limit}` : '';
  try {
    const raw = await requestJson<ExperimentListRecord[] | { results?: ExperimentListRecord[] }>(
      `${basePath}/all${suffix}`
    );

    if (Array.isArray(raw)) {
      return raw;
    }

    if (raw && typeof raw === 'object' && Array.isArray(raw.results)) {
      return raw.results;
    }

    return [];
  } catch (error: any) {
    if (/(404)/.test(error?.message || '')) {
      return [];
    }
    throw error;
  }
}

export function getExperimentLatest(name: string): Promise<ExperimentRecord> {
  return requestJson<ExperimentRecord>(`${basePath}/id/${encodeURIComponent(name)}`);
}

export async function getExperimentHistory(name: string): Promise<ExperimentHistoryRecord[]> {
  const raw = await requestJson<ExperimentHistoryRecord | ExperimentHistoryRecord[]>(
    `${basePath}/history/${encodeURIComponent(name)}`
  );

  if (Array.isArray(raw)) {
    return raw;
  }

  if (raw && typeof raw === 'object') {
    return [raw];
  }

  return [];
}

export async function fetchExperimentLatest(name: string): Promise<ExperimentRecord> {
  const raw = await getExperimentLatest(name);
  return normalizeExperimentRecord(raw);
}

export async function fetchExperimentHistory(name: string): Promise<ExperimentRecord[]> {
  const rawEntries = await getExperimentHistory(name);
  return rawEntries.map((entry) => normalizeExperimentRecord(entry));
}

export async function saveExperiment(
  request: SaveExperimentRequest
): Promise<SaveExperimentResponse>;
export async function saveExperiment(
  params: ExperimentSaveParams
): Promise<SaveExperimentResponse>;
export async function saveExperiment(
  input: SaveExperimentRequest | ExperimentSaveParams
): Promise<SaveExperimentResponse> {
  const payload: SaveExperimentRequest =
    'metadata' in input
      ? input
      : {
        metadata: await buildExperimentMetadata(input),
      };

  return requestJson<SaveExperimentResponse>(`${basePath}/save`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface DeleteExperimentResponse {
  message: string;
  deletedCount: number;
  collection: string;
  pageName: string;
}

export async function deleteExperiment(experimentName: string): Promise<DeleteExperimentResponse> {
  return requestJson<DeleteExperimentResponse>(`/common/delete/experiments/${encodeURIComponent(experimentName)}`, {
    method: 'DELETE',
  });
}

export type {
  ExperimentVariant,
  ExperimentMetadata,
  ExperimentRecord,
  ExperimentHistoryRecord,
  ExperimentListRecord,
  ExperimentSaveParams,
} from '../types/experiments';
