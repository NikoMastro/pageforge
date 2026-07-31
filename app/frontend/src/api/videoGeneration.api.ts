/**
 * Video Generation API using Google Gemini
 * Based on: https://ai.google.dev/gemini-api/docs/video?hl=fr&example=dialogue
 */

import { requestJson } from './baseClient';
import type { BaseRequestOptions } from './baseClient';
import { DEFAULT_VEO_MODEL_ID, VEO_MODEL_IDS, backendUrl } from '../config/config';
import type { VeoModelId } from '../config/config';

const VIDEO_API_BASE_URL = backendUrl;

const ensureApiBaseUrl = (value: string | undefined): string => {
  const trimmed = value?.trim() ?? '';
  const candidate = trimmed.length > 0 ? trimmed : '';
  const withoutTrailingSlash = candidate.replace(/\/+$/, '');
  return withoutTrailingSlash;
};

const RESOLVED_VIDEO_API_BASE_URL = ensureApiBaseUrl(VIDEO_API_BASE_URL);

const videoRequest = <T>(
  endpoint: string,
  options: BaseRequestOptions = {}
) => requestJson<T>(endpoint, { ...options, baseUrl: RESOLVED_VIDEO_API_BASE_URL });

export { VEO_MODEL_IDS, DEFAULT_VEO_MODEL_ID };
export const BASE_URL = RESOLVED_VIDEO_API_BASE_URL;

export const ASPECT_RATIOS = ['16:9', '9:16', '1:1'] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

export const COMPRESSION_QUALITIES = ['optimized', 'lossless'] as const;
export type CompressionQuality = (typeof COMPRESSION_QUALITIES)[number];

export const RESOLUTIONS = ['720p', '1080p'] as const;
export type Resolution = (typeof RESOLUTIONS)[number];

export const RESIZE_MODES = ['pad', 'crop'] as const;
export type ResizeMode = (typeof RESIZE_MODES)[number];

export const PERSON_GENERATION_OPTIONS = ['allow_adult', 'dont_allow'] as const;
export type PersonGeneration = (typeof PERSON_GENERATION_OPTIONS)[number];

export const SAMPLE_COUNTS = [1, 2, 3, 4] as const;
export type SampleCount = (typeof SAMPLE_COUNTS)[number];

export const DEFAULT_VIDEO_GENERATION_SETTINGS = {
  modelId: DEFAULT_VEO_MODEL_ID,
  aspectRatio: '16:9' as AspectRatio,
  compressionQuality: 'optimized' as CompressionQuality,
  durationSeconds: 8,
  generateAudio: true,
  personGeneration: 'allow_adult' as PersonGeneration,
  resizeMode: 'pad' as ResizeMode,
  resolution: '720p' as Resolution,
  sampleCount: 1 as SampleCount,
  seed: 123 as number,
  storageUri: null as string | null,
};

export interface SafetySettings {
  hateSpeech: string;
  harassment: string;
  sexuallyExplicit: string;
  dangerousContent: string;
}

export interface ReferenceImageParam {
  file?: File;
  sourceUri?: string;
  asset?: VertexVideoAsset;
  referenceType: 'asset' | 'style';
}

export interface VertexVideoAsset {
  gcsUri?: string;
  bytesBase64Encoded?: string;
  mimeType?: string;
  url?: string;
  uri?: string;
  [key: string]: unknown;
}

type Nullable<T> = T | null | undefined;

function inferMimeType(file: File): string {
  if (file.type) {
    return file.type;
  }

  const extension = file.name.split('.').pop()?.toLowerCase();

  if (!extension) {
    return 'application/octet-stream';
  }

  const fallback: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    mpeg: 'video/mpeg',
    mpg: 'video/mpeg',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
  };

  return fallback[extension] ?? 'application/octet-stream';
}

function isVertexVideoAsset(value: unknown): value is VertexVideoAsset {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return 'bytesBase64Encoded' in candidate || 'gcsUri' in candidate || 'mimeType' in candidate;
}

async function buildMediaPayload(
  input: Nullable<File | string | VertexVideoAsset>
): Promise<VertexVideoAsset | undefined> {
  if (!input) {
    return undefined;
  }

  if (input instanceof File) {
    const bytesBase64Encoded = await fileToBase64(input);
    return {
      bytesBase64Encoded,
      mimeType: inferMimeType(input),
    };
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) {
      return undefined;
    }
    return {
      gcsUri: trimmed,
    };
  }

  if (isVertexVideoAsset(input)) {
    return input;
  }

  return undefined;
}

export async function fileToBase64(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => {
      reader.abort();
      reject(new Error('Failed to read file'));
    };
    reader.onload = () => {
      const result = reader.result as string;
      const commaIndex = result.indexOf(',');
      if (commaIndex >= 0) {
        resolve(result.slice(commaIndex + 1));
      } else {
        resolve(result);
      }
    };
    reader.readAsDataURL(file);
  });
}

export async function createVertexVideoAssetFromFile(file: File): Promise<VertexVideoAsset> {
  const bytesBase64Encoded = await fileToBase64(file);
  return {
    bytesBase64Encoded,
    mimeType: file.type || 'video/mp4',
  };
}

export interface VideoGenerationParams {
  provider?: string;
  prompt: string;
  negativePrompt?: string;
  negativePrompts?: string[];
  image?: File | string | VertexVideoAsset;
  imageTemplate?: File | string;
  lastFrame?: File | string | VertexVideoAsset;
  video?: File | string | VertexVideoAsset;
  referenceImages?: ReferenceImageParam[];
  durationSeconds?: number;
  duration: number;
  resolution: Resolution | string;
  aspectRatio: AspectRatio | string;
  compressionQuality?: CompressionQuality | string;
  generateAudio?: boolean;
  includeAudio: boolean;
  personGeneration?: PersonGeneration | string;
  resizeMode?: ResizeMode;
  sampleCount?: SampleCount;
  seed?: number;
  storageUri?: string | null;
  safetySettings: SafetySettings;
  modelId?: VeoModelId | string;
  enhancePrompt?: boolean;
}

export interface VideoGenerationResponse {
  id: string;
  status: 'generating' | 'completed' | 'failed';
  url?: string | null;
  urls?: string[];
  videos?: VertexVideoAsset[];
  thumbnail?: string;
  error?: string;
  operationId?: string;
  modelId?: string;
  backendId?: string;
  [key: string]: unknown;
}

export interface VideoIterationRequest {
  videoId: string;
  prompt: string;
  modifications?: Partial<VideoGenerationParams>;
}

export interface VideoStatusRequest {
  operationId: string;
  modelId?: string;
  legacyId?: string;
}

type RawVideoResponse = Record<string, unknown>;

interface NormalizeDefaults {
  operationId?: string;
  modelId?: string;
  defaultStatus?: VideoGenerationResponse['status'];
  fallbackId?: string;
  legacyId?: string;
}

const SUCCESS_STATUS_KEYWORDS = ['success', 'succeed', 'complete', 'done', 'finished', 'ready'];
const FAILURE_STATUS_KEYWORDS = ['fail', 'error', 'cancel', 'timeout'];

const stringifyUnknown = (value: unknown): string => {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value === 'object') {
    const candidate = value as { message?: unknown };
    if (typeof candidate.message === 'string') {
      return candidate.message;
    }
    try {
      return JSON.stringify(value);
    } catch (err) {
      console.error('Failed to stringify error payload:', err);
    }
  }
  return 'Unknown error';
};

const normalizeStatus = (
  raw: RawVideoResponse,
  defaultStatus: VideoGenerationResponse['status']
): VideoGenerationResponse['status'] => {
  const error = raw.error ?? (typeof raw.response === 'object' && raw.response
    ? (raw.response as Record<string, unknown>).error
    : undefined);

  if (error) {
    return 'failed';
  }

  const doneField = raw.done;
  if (typeof doneField === 'boolean') {
    if (doneField) {
      return 'completed';
    }
  }

  const statusCandidate = (raw.status ?? raw.state ?? raw.phase) as unknown;
  if (typeof statusCandidate === 'string') {
    const normalized = statusCandidate.toLowerCase();
    if (FAILURE_STATUS_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
      return 'failed';
    }
    if (SUCCESS_STATUS_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
      return 'completed';
    }
  }

  return defaultStatus;
};

const extractErrorMessage = (raw: RawVideoResponse): string | undefined => {
  const error = raw.error ?? (typeof raw.response === 'object' && raw.response
    ? (raw.response as Record<string, unknown>).error
    : undefined);

  if (!error) {
    return undefined;
  }

  return stringifyUnknown(error);
};

const collectString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return undefined;
};

const extractUrls = (raw: RawVideoResponse): { url: string | null; urls?: string[] } => {
  const collected: string[] = [];

  const pushValue = (candidate: unknown) => {
    const resolved = collectString(candidate);
    if (resolved) {
      collected.push(resolved);
    }
  };

  const pushArray = (candidate: unknown) => {
    if (Array.isArray(candidate)) {
      candidate.forEach(pushValue);
    }
  };

  pushArray(raw.urls);
  pushArray((raw as Record<string, unknown>).outputUrls);
  pushArray((raw as Record<string, unknown>).resultUrls);
  pushValue(raw.url);
  pushValue((raw as Record<string, unknown>).outputUrl);
  pushValue((raw as Record<string, unknown>).videoUrl);

  if (Array.isArray(raw.videos)) {
    raw.videos.forEach((video) => {
      if (video && typeof video === 'object') {
        const entry = video as Record<string, unknown>;
        pushValue(entry.url);
        pushValue(entry.uri);
        pushValue(entry.gcsUri);
      }
    });
  }

  if (raw.response && typeof raw.response === 'object') {
    const response = raw.response as Record<string, unknown>;
    pushValue(response.url);
    pushValue(response.outputUrl);
    pushValue(response.videoUrl);

    if (Array.isArray(response.videos)) {
      response.videos.forEach((video) => {
        if (video && typeof video === 'object') {
          const entry = video as Record<string, unknown>;
          pushValue(entry.url);
          pushValue(entry.uri);
          pushValue(entry.gcsUri);
        }
      });
    }
  }

  const uniqueUrls = collected.length ? Array.from(new Set(collected)) : undefined;
  const primaryUrl = uniqueUrls?.[0] ?? null;

  return {
    url: primaryUrl,
    urls: uniqueUrls,
  };
};

const extractThumbnail = (raw: RawVideoResponse): string | undefined => {
  const candidates: unknown[] = [
    raw.thumbnail,
    (raw as Record<string, unknown>).thumbnailUrl,
    (raw as Record<string, unknown>).thumbnailUri,
    (raw as Record<string, unknown>).preview,
    (raw as Record<string, unknown>).previewImage,
    (raw as Record<string, unknown>).previewUri,
  ];

  if (raw.response && typeof raw.response === 'object') {
    const response = raw.response as Record<string, unknown>;
    candidates.push(response.thumbnail);
    candidates.push(response.thumbnailUrl);
    candidates.push(response.thumbnailUri);
  }

  for (const candidate of candidates) {
    const resolved = collectString(candidate);
    if (resolved) {
      return resolved;
    }
  }

  return undefined;
};

const normalizeVideoResponse = (
  raw: RawVideoResponse,
  defaults: NormalizeDefaults = {}
): VideoGenerationResponse => {
  const operationId =
    collectString((raw as Record<string, unknown>).operationId) ??
    collectString((raw as Record<string, unknown>).operation_id) ??
    defaults.operationId;
  const modelId =
    collectString((raw as Record<string, unknown>).modelId) ??
    collectString((raw as Record<string, unknown>).model_id) ??
    defaults.modelId;

  const explicitId =
    collectString(raw.id) ??
    collectString((raw as Record<string, unknown>).videoId) ??
    collectString((raw as Record<string, unknown>).video_id) ??
    collectString((raw as Record<string, unknown>).name);

  const fallbackId = defaults.fallbackId ?? operationId ?? defaults.legacyId;
  const id = explicitId ?? fallbackId ?? `${Date.now()}`;

  const status = normalizeStatus(raw, defaults.defaultStatus ?? 'generating');
  const error = extractErrorMessage(raw);
  const { url, urls } = extractUrls(raw);

  const videos = Array.isArray(raw.videos)
    ? (raw.videos as VertexVideoAsset[])
    : Array.isArray((raw.response as Record<string, unknown> | undefined)?.videos)
      ? ((raw.response as { videos: VertexVideoAsset[] }).videos)
      : undefined;

  return {
    id,
    status,
    url,
    urls,
    videos,
    thumbnail: extractThumbnail(raw),
    error,
    operationId,
    modelId,
    backendId: explicitId && explicitId !== id ? explicitId : undefined,
  };
};

const buildReferenceImagesPayload = async (
  referenceImages?: ReferenceImageParam[]
): Promise<{ image: VertexVideoAsset; referenceType: 'asset' | 'style' }[] | undefined> => {
  if (!referenceImages?.length) {
    return undefined;
  }

  const entries = await Promise.all(
    referenceImages.map(async (ref) => {
      const mediaSource = ref.file ?? ref.asset ?? ref.sourceUri;
      const payload = await buildMediaPayload(mediaSource);
      if (!payload) {
        return null;
      }

      return {
        image: payload,
        referenceType: ref.referenceType,
      } as { image: VertexVideoAsset; referenceType: 'asset' | 'style' };
    })
  );

  const filtered = entries.filter((entry): entry is { image: VertexVideoAsset; referenceType: 'asset' | 'style' } => Boolean(entry));
  return filtered.length ? filtered : undefined;
};

const resolveDurationSeconds = (params: VideoGenerationParams): number => {
  if (typeof params.durationSeconds === 'number') {
    return params.durationSeconds;
  }
  return params.duration;
};

const resolveGenerateAudio = (params: VideoGenerationParams): boolean => {
  if (typeof params.generateAudio === 'boolean') {
    return params.generateAudio;
  }
  return params.includeAudio;
};

/**
 * Generate a video using Gemini API / Vertex AI
 */
export async function generateVideo(params: VideoGenerationParams): Promise<VideoGenerationResponse> {
  const modelId = params.modelId ?? DEFAULT_VEO_MODEL_ID;
  const provider = params.provider ?? 'GCP';

  const [imagePayload, lastFramePayload, videoPayload, referenceImagesPayload] = await Promise.all([
    buildMediaPayload(params.image ?? params.imageTemplate),
    buildMediaPayload(params.lastFrame),
    buildMediaPayload(params.video),
    buildReferenceImagesPayload(params.referenceImages),
  ]);

  const combinedNegativePrompt = params.negativePrompts?.length
    ? params.negativePrompts.join('\n')
    : params.negativePrompt;

  const payload: Record<string, unknown> = {
    provider,
    modelId,
    prompt: params.prompt,
    ...(imagePayload ? { image: imagePayload } : {}),
    ...(lastFramePayload ? { lastFrame: lastFramePayload } : {}),
    ...(videoPayload ? { video: videoPayload } : {}),
    ...(referenceImagesPayload ? { referenceImages: referenceImagesPayload } : {}),
    aspectRatio: params.aspectRatio,
    compressionQuality: params.compressionQuality ?? DEFAULT_VIDEO_GENERATION_SETTINGS.compressionQuality,
    durationSeconds: resolveDurationSeconds(params),
    generateAudio: resolveGenerateAudio(params),
    personGeneration: params.personGeneration ?? DEFAULT_VIDEO_GENERATION_SETTINGS.personGeneration,
    resizeMode: params.resizeMode ?? DEFAULT_VIDEO_GENERATION_SETTINGS.resizeMode,
    resolution: params.resolution,
    sampleCount: params.sampleCount ?? DEFAULT_VIDEO_GENERATION_SETTINGS.sampleCount,
    safetySettings: params.safetySettings,
  };

  if (typeof params.seed === 'number') {
    payload.seed = params.seed;
  }

  if (params.storageUri) {
    payload.storageUri = params.storageUri;
  }

  if (combinedNegativePrompt) {
    payload.negativePrompt = combinedNegativePrompt;
  }

  if (params.negativePrompts?.length) {
    payload.negativePrompts = params.negativePrompts;
  }

  if (typeof params.enhancePrompt === 'boolean') {
    payload.enhancePrompt = params.enhancePrompt;
  }

  try {
    const data = await videoRequest<RawVideoResponse>(`/vertexai/generate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const operationId =
      collectString((data as Record<string, unknown>).operationId) ??
      collectString((data as Record<string, unknown>).operation_id);

    return normalizeVideoResponse(data, {
      modelId: typeof modelId === 'string' ? modelId : undefined,
      operationId,
      defaultStatus: 'generating',
      fallbackId:
        collectString((data as Record<string, unknown>).id) ??
        collectString((data as Record<string, unknown>).operation_id),
    });
  } catch (error) {
    console.error('Error generating video:', error);
    throw error;
  }
}

/**
 * Iterate on an existing video (legacy V1 endpoint)
 */
export async function iterateVideo(request: VideoIterationRequest): Promise<VideoGenerationResponse> {
  try {
    const data = await videoRequest<RawVideoResponse>(`/video/iterate`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return normalizeVideoResponse(data, { defaultStatus: 'generating' });
  } catch (error) {
    console.error('Error iterating video:', error);
    throw error;
  }
}

export async function getVideoStatus(request: VideoStatusRequest): Promise<VideoGenerationResponse>;
export async function getVideoStatus(operationId: string): Promise<VideoGenerationResponse>;
export async function getVideoStatus(
  request: VideoStatusRequest | string
): Promise<VideoGenerationResponse> {
  const normalizedRequest: VideoStatusRequest =
    typeof request === 'string'
      ? { operationId: request, legacyId: request }
      : request;

  const { modelId, operationId, legacyId } = normalizedRequest;

  const fallbackId = legacyId ?? operationId;
  const normalizeDefaults: NormalizeDefaults = {
    modelId,
    operationId,
    defaultStatus: 'generating',
    fallbackId,
    legacyId,
  };

  let attemptedLegacy = false;

  const fetchLegacyStatus = async () => {
    attemptedLegacy = true;
    const data = await videoRequest<RawVideoResponse>(`/vertexai/status/${encodeURIComponent(fallbackId)}`);
    return normalizeVideoResponse(data, normalizeDefaults);
  };

  try {
    // Build query string for GET request
    const queryParams = new URLSearchParams();
    queryParams.append('operationName', operationId);
    if (modelId) {
      queryParams.append('modelId', modelId);
    }

    const data = await videoRequest<RawVideoResponse>(`/vertexai/status?${queryParams.toString()}`);
    return normalizeVideoResponse(data, normalizeDefaults);
  } catch (error) {
    if (legacyId && !attemptedLegacy) {
      try {
        return await fetchLegacyStatus();
      } catch (legacyError) {
        console.error('Legacy video status fallback failed:', legacyError);
      }
    }
    console.error('Error fetching video status:', error);
    throw error;
  }
}

/**
 * List images from Cloudflare
 */
export async function listCloudflareImages(): Promise<any[]> {
  try {
    const data = await videoRequest<{ images?: any[] }>(`/cloudflare/images`);
    return data.images || [];
  } catch (error) {
    console.error('Error listing Cloudflare images:', error);
    throw error;
  }
}

/**
 * Get Cloudflare image URL
 */
export function getCloudflareImageUrl(imageId: string, variant: string = 'public'): string {
  const sanitizedVariant = variant || 'public';
  return `${RESOLVED_VIDEO_API_BASE_URL}/cloudflare/images/${encodeURIComponent(imageId)}/${encodeURIComponent(sanitizedVariant)}`;
}

/**
 * Video Generation API using Google Gemini
 * Based on: https://ai.google.dev/gemini-api/docs/video?hl=fr&example=dialogue
 */
