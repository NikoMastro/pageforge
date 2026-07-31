import { useCallback, useEffect, useState } from 'react';
import { backendUrl, videoLibraryEndpoint } from '../../config/config';
import type { GeneratedVideoSummary } from '../../types/videoLibrary.types';

export type UseVideoLibraryResult = {
  videos: GeneratedVideoSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const parseDate = (value: unknown): string | null => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }

  if (typeof value === 'number') {
    const timestamp = value > 1e12 ? value : value * 1000;
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  return null;
};

const normalizeVideo = (entry: unknown, index: number): GeneratedVideoSummary | null => {
  if (!entry || typeof entry !== 'object') {
    return null;
  }

  const raw = entry as Record<string, unknown>;
  const idCandidate = raw.id ?? raw.videoId ?? raw.generationId ?? raw.hash ?? raw.uuid ?? index;
  const id = typeof idCandidate === 'string' && idCandidate.trim().length > 0
    ? idCandidate.trim()
    : typeof idCandidate === 'number'
      ? idCandidate.toString()
      : `video-${index + 1}`;

  const nameCandidate = raw.name ?? raw.title ?? raw.promptTitle ?? raw.prompt ?? raw.videoName;
  const name = typeof nameCandidate === 'string' && nameCandidate.trim().length > 0
    ? nameCandidate.trim()
    : `Video ${index + 1}`;

  const createdByCandidate = raw.createdBy ?? raw.user ?? raw.owner ?? raw.created_by ?? raw.createdUser;
  const createdBy = typeof createdByCandidate === 'string' && createdByCandidate.trim().length > 0
    ? createdByCandidate.trim()
    : null;

  const createdAtCandidate = raw.createdAt ?? raw.created_at ?? raw.timestamp ?? raw.createdOn ?? raw.created_on ?? raw.updatedAt;
  const createdAt = parseDate(createdAtCandidate);

  const promptCandidate = raw.prompt ?? raw.promptText ?? raw.prompt_text;
  const prompt = typeof promptCandidate === 'string' && promptCandidate.trim().length > 0
    ? promptCandidate
    : null;

  const statusCandidate = raw.status;
  const status = statusCandidate === 'completed' || statusCandidate === 'generating' || statusCandidate === 'failed'
    ? statusCandidate
    : undefined;

  const thumbnailCandidate = raw.thumbnailUrl ?? raw.thumbnail ?? raw.previewUrl ?? raw.cover;
  const thumbnailUrl = typeof thumbnailCandidate === 'string' && thumbnailCandidate.trim().length > 0
    ? thumbnailCandidate
    : null;

  return {
    id,
    name,
    createdBy,
    createdAt,
    status,
    prompt,
    thumbnailUrl,
  };
};

const joinBaseAndPath = (base: string, path: string): string => {
  if (path.startsWith('http')) {
    return path;
  }

  const sanitizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const sanitizedPath = path.startsWith('/') ? path : `/${path}`;

  if (!sanitizedBase) {
    return sanitizedPath;
  }

  if (sanitizedBase.endsWith('/api')) {
    if (sanitizedPath === '/api') {
      return sanitizedBase;
    }
    if (sanitizedPath.startsWith('/api/')) {
      return `${sanitizedBase}${sanitizedPath.slice(4)}`;
    }
  }

  return `${sanitizedBase}${sanitizedPath}`;
};

const resolveEndpoint = (): { url: string; configured: boolean } => {
  const baseUrl = backendUrl || '/api';
  const configuredEndpoint = videoLibraryEndpoint;
  const fallbackEndpoint = '/video/history';

  if (!configuredEndpoint) {
    return {
      url: joinBaseAndPath(baseUrl, fallbackEndpoint),
      configured: false,
    };
  }

  return {
    url: joinBaseAndPath(baseUrl, configuredEndpoint),
    configured: true,
  };
};

export const useVideoLibrary = (): UseVideoLibraryResult => {
  const [videos, setVideos] = useState<GeneratedVideoSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { url, configured } = resolveEndpoint();

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Video history endpoint is not available yet.');
        } else if (response.status >= 500) {
          setError('Server error while trying to load generated videos.');
        } else if (configured) {
          setError(`Failed to load generated videos (status ${response.status}).`);
        }
        setVideos([]);
        return;
      }

      const payload = await response.json().catch(() => []);
      const collection: unknown[] = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as Record<string, unknown>)?.items)
          ? ((payload as Record<string, unknown>).items as unknown[])
          : Array.isArray((payload as Record<string, unknown>)?.videos)
            ? ((payload as Record<string, unknown>).videos as unknown[])
            : [];

      const normalized = collection
        .map((entry: unknown, index: number) => normalizeVideo(entry, index))
        .filter((item: GeneratedVideoSummary | null): item is GeneratedVideoSummary => Boolean(item));

      setVideos(normalized);
    } catch (err) {
      console.warn('Unable to load generated videos yet:', err);
      if (configured) {
        setError('Unable to load generated videos. Please try again later.');
      }
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { videos, loading, error, refresh };
};
