import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchExperimentHistory,
  fetchExperimentLatest,
  listExperiments,
  saveExperiment,
  normalizeExperimentRecord,
  deleteExperiment as deleteExperimentApi,
} from '../../api/experiments.api';
import { defaultExperimentFetchLimit } from '../../config/config';
import type {
  Experiment,
  ExperimentFormPayload,
  ExperimentMetadata,
  ExperimentRecord,
  ExperimentSaveParams,
  ExperimentVariant,
  ExperimentStats,
} from '../../types/experiments';
import { useAuth } from '../../components/layout/authContext';

type ExperimentIdentifier = string;

type ExperimentsMap = Map<ExperimentIdentifier, Experiment>;

type SaveOptions = {
  hashid?: string;
  timestamp?: string;
};

const toIsoString = (value?: string): string => {
  if (!value) {
    return new Date().toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
};

const normalizeStats = (value: unknown): ExperimentStats | undefined => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const entries = Object.entries(value as Record<string, unknown>).reduce<Record<string, { views: number; conversions: number; conversionRate: number }>>((acc, [key, raw]) => {
    if (!raw || typeof raw !== 'object') {
      return acc;
    }

    const entry = raw as Record<string, unknown>;
    const views = Number(entry.views);
    const conversions = Number(entry.conversions);
    const conversionRate = Number(entry.conversionRate);

    acc[key] = {
      views: Number.isFinite(views) ? views : 0,
      conversions: Number.isFinite(conversions) ? conversions : 0,
      conversionRate: Number.isFinite(conversionRate) ? conversionRate : 0,
    };

    return acc;
  }, {});

  return Object.keys(entries).length > 0 ? entries : undefined;
};

const cloneVariants = (variants: ExperimentVariant[] | undefined): ExperimentVariant[] => {
  if (!Array.isArray(variants)) {
    return [];
  }
  return variants.map((variant) => ({
    name: variant.name,
    weight: Number.isFinite(variant.weight) ? variant.weight : 0,
    config: variant.config
      ? {
        pixelMode: variant.config.pixelMode,
        gameId: variant.config.gameId,
        partnerId: variant.config.partnerId,
        isTest: typeof variant.config.isTest === 'boolean' ? variant.config.isTest : undefined,
        customPixelUrl: variant.config.customPixelUrl,
        detectionType: variant.config.detectionType,
        mainUrl: variant.config.mainUrl,
        fallbackUrl: variant.config.fallbackUrl,
        customPixelVars: Array.isArray(variant.config.customPixelVars)
          ? variant.config.customPixelVars.map((entry) => ({ key: entry.key, value: entry.value }))
          : typeof variant.config.customPixelVars === 'string'
            ? variant.config.customPixelVars
            : undefined,
      }
      : undefined,
  } satisfies ExperimentVariant));
};

const mapRecordToExperiment = (record: ExperimentRecord): Experiment => {
  const landingPages = record.variantType === 'landingPages'
    ? cloneVariants(record.landingPages)
    : [];
  const pixels = record.variantType === 'pixels'
    ? cloneVariants(record.pixels)
    : [];

  const createdAt = record.createdAt ?? record.timestamp;
  const updatedAt = record.updatedAt
    ?? (typeof record.serverTimestamp === 'string' ? record.serverTimestamp : undefined)
    ?? createdAt;

  const stats = normalizeStats((record as Record<string, unknown>).stats);

  return {
    id: record.page_name || record.experimentName || record.hashid,
    experimentName: record.experimentName,
    variantType: record.variantType,
    landingPages,
    pixels,
    active: Boolean(record.active),
    description: typeof record.description === 'string' ? record.description : undefined,
    commit: typeof record.commit === 'string' ? record.commit : '',
    hashid: record.hashid,
    user: typeof record.user === 'string' ? record.user : undefined,
    createdAt: toIsoString(createdAt),
    updatedAt: toIsoString(updatedAt),
    stats,
    metadata: record,
  };
};

const upsertExperiment = (map: ExperimentsMap, experiment: Experiment): ExperimentsMap => {
  const next = new Map(map);
  next.set(experiment.id, experiment);
  return next;
};

const experimentsFromMap = (map: ExperimentsMap): Experiment[] => {
  return Array.from(map.values()).sort((a, b) => {
    const left = a.createdAt ?? '';
    const right = b.createdAt ?? '';
    if (left === right) {
      return a.experimentName.localeCompare(b.experimentName);
    }
    return right.localeCompare(left);
  });
};

const toSaveParams = (
  payload: ExperimentFormPayload,
  user: string,
  overrides: SaveOptions = {}
): ExperimentSaveParams => {
  const common = {
    experimentName: payload.experimentName,
    description: payload.description,
    commit: payload.commit,
    user,
    active: payload.active,
    hashid: overrides.hashid,
    timestamp: overrides.timestamp,
  };

  if (payload.variantType === 'landingPages') {
    return {
      ...common,
      variantType: 'landingPages',
      landingPages: cloneVariants(payload.landingPages),
    };
  }

  return {
    ...common,
    variantType: 'pixels',
    pixels: cloneVariants(payload.pixels),
  };
};

const ensureExperimentIdentifier = (value: string): string => value.trim().toLowerCase();

export interface UseExperimentsResult {
  experiments: Experiment[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<Experiment[]>;
  getExperiment: (idOrName: string) => Promise<Experiment | null>;
  getExperimentHistory: (name: string) => Promise<ExperimentMetadata[]>;
  createExperiment: (payload: ExperimentFormPayload, options?: SaveOptions) => Promise<Experiment | null>;
  updateExperiment: (payload: ExperimentFormPayload, options?: SaveOptions) => Promise<Experiment | null>;
  toggleExperimentStatus: (experimentId: string, commitMessage?: string) => Promise<boolean>;
  deleteExperiment: (experimentId: string) => Promise<boolean>;
}

export function useExperiments(limit: number = defaultExperimentFetchLimit): UseExperimentsResult {
  const { user: authUser } = useAuth();
  const actor = authUser?.email || 'unknown';

  const [experimentsState, setExperimentsState] = useState<ExperimentsMap>(new Map());
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<Experiment[]> => {
    setLoading(true);
    setError(null);

    try {
      const entries = await listExperiments(limit);
      const uniqueNames = Array.from(
        new Set(
          entries
            .map((entry) => entry.page_name)
            .filter((name): name is string => typeof name === 'string' && name.trim().length > 0)
        )
      );

      if (uniqueNames.length === 0) {
        setExperimentsState(new Map());
        return [];
      }

      const results = await Promise.all(
        uniqueNames.map(async (name) => {
          try {
            const record = await fetchExperimentLatest(name);
            return mapRecordToExperiment(record);
          } catch (err) {
            console.error(`Failed to load experiment ${name}:`, err);
            return null;
          }
        })
      );

      const filtered = results.filter((item): item is Experiment => Boolean(item));
      const mapped = new Map<ExperimentIdentifier, Experiment>();
      filtered.forEach((experiment) => {
        mapped.set(experiment.id, experiment);
      });

      setExperimentsState(mapped);
      return experimentsFromMap(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load experiments';
      setError(message);
      setExperimentsState(new Map());
      return [];
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getExperiment = useCallback(
    async (idOrName: string): Promise<Experiment | null> => {
      const normalizedId = ensureExperimentIdentifier(idOrName);
      const existing = Array.from(experimentsState.values()).find((experiment) => {
        const identifiers = [experiment.id, experiment.experimentName, experiment.metadata.page_name]
          .filter((value): value is string => typeof value === 'string')
          .map((value) => ensureExperimentIdentifier(value));
        return identifiers.includes(normalizedId);
      });

      if (existing) {
        return existing;
      }

      try {
        const record = await fetchExperimentLatest(idOrName);
        const experiment = mapRecordToExperiment(record);
        setExperimentsState((prev) => upsertExperiment(prev, experiment));
        return experiment;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Experiment not found';
        setError(message);
        return null;
      }
    },
    [experimentsState]
  );

  const getExperimentHistory = useCallback(async (name: string): Promise<ExperimentMetadata[]> => {
    const records = await fetchExperimentHistory(name);
    return records.map((entry) => normalizeExperimentRecord(entry));
  }, []);

  const persistExperiment = useCallback(
    async (payload: ExperimentFormPayload, options: SaveOptions = {}): Promise<Experiment | null> => {
      setSaving(true);
      setError(null);

      try {
        const params = toSaveParams(payload, actor, options);
        await saveExperiment(params);

        const record = await fetchExperimentLatest(payload.experimentName);
        const experiment = mapRecordToExperiment(record);
        setExperimentsState((prev) => upsertExperiment(prev, experiment));
        return experiment;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save experiment';
        setError(message);
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [actor]
  );

  const createExperiment = useCallback(
    async (payload: ExperimentFormPayload, options?: SaveOptions): Promise<Experiment | null> => {
      return persistExperiment(payload, options);
    },
    [persistExperiment]
  );

  const updateExperiment = useCallback(
    async (payload: ExperimentFormPayload, options?: SaveOptions): Promise<Experiment | null> => {
      return persistExperiment(payload, options);
    },
    [persistExperiment]
  );

  const toggleExperimentStatus = useCallback(
    async (experimentId: string, commitMessage?: string): Promise<boolean> => {
      const experiment = await getExperiment(experimentId);
      if (!experiment) {
        return false;
      }

      const payload: ExperimentFormPayload = {
        experimentName: experiment.experimentName,
        variantType: experiment.variantType,
        landingPages: cloneVariants(experiment.landingPages),
        pixels: cloneVariants(experiment.pixels),
        description: experiment.description,
        commit: commitMessage || `toggle-status-${experiment.active ? 'off' : 'on'}`,
        active: !experiment.active,
      };

      await persistExperiment(payload, { hashid: experiment.hashid });
      return true;
    },
    [getExperiment, persistExperiment]
  );

  const deleteExperiment = useCallback(async (experimentId: string): Promise<boolean> => {
    try {
      await deleteExperimentApi(experimentId);
      // Remove from local state
      setExperimentsState(prev => {
        const next = new Map(prev);
        next.delete(experimentId);
        return next;
      });
      setError(null);
      return true;
    } catch (err: any) {
      setError(err?.message || 'Failed to delete experiment');
      return false;
    }
  }, []);

  const experiments = useMemo(() => experimentsFromMap(experimentsState), [experimentsState]);

  return {
    experiments,
    loading,
    saving,
    error,
    refresh,
    getExperiment,
    getExperimentHistory,
    createExperiment,
    updateExperiment,
    toggleExperimentStatus,
    deleteExperiment,
  };
}
