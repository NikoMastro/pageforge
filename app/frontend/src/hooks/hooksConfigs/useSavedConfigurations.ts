import { useState, useEffect, useCallback } from 'react';
import type { VideoGenerationSettings, PromptState } from '../../types/videoGeneration.types';

export interface SavedConfiguration {
  id: string;
  page_name: string;

  // Prompt state
  promptState: PromptState;

  // Settings
  settings: VideoGenerationSettings;

  // Media inputs metadata (we don't save actual files, just references/info)
  mediaInputs: {
    hasImage: boolean;
    hasLastFrame: boolean;
    hasVideo: boolean;
    referenceImagesCount: number;
  };

  // Metadata
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    usageCount?: number;
    lastUsedAt?: Date;
  };
}

const STORAGE_KEY = 'video-gen-saved-configurations';

export function useSavedConfigurations() {
  const [savedConfigurations, setSavedConfigurations] = useState<SavedConfiguration[]>([]);

  // Load configurations from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const configurations = parsed.map((config: any) => ({
          ...config,
          metadata: {
            ...config.metadata,
            createdAt: new Date(config.metadata.createdAt),
            updatedAt: new Date(config.metadata.updatedAt),
            lastUsedAt: config.metadata.lastUsedAt ? new Date(config.metadata.lastUsedAt) : undefined,
          },
        }));
        setSavedConfigurations(configurations);
      }
    } catch (error) {
      console.error('Error loading saved configurations:', error);
    }
  }, []);

  // Save configurations to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConfigurations));
    } catch (error) {
      console.error('Error saving configurations:', error);
    }
  }, [savedConfigurations]);

  const saveConfiguration = useCallback((
    page_name: string,
    promptState: PromptState,
    settings: VideoGenerationSettings,
    mediaInputs: {
      hasImage: boolean;
      hasLastFrame: boolean;
      hasVideo: boolean;
      referenceImagesCount: number;
    }
  ) => {
    const now = new Date();
    const newConfiguration: SavedConfiguration = {
      id: `config-${Date.now()}`,
      page_name,
      promptState,
      settings,
      mediaInputs,
      metadata: {
        createdAt: now,
        updatedAt: now,
        usageCount: 0,
      },
    };

    setSavedConfigurations((prev) => [newConfiguration, ...prev]);
    return newConfiguration;
  }, []);

  const deleteConfiguration = useCallback((id: string) => {
    setSavedConfigurations((prev) => prev.filter((config) => config.id !== id));
  }, []);

  const updateConfiguration = useCallback((id: string, updates: Partial<SavedConfiguration>) => {
    setSavedConfigurations((prev) =>
      prev.map((config) =>
        config.id === id
          ? {
            ...config,
            ...updates,
            metadata: {
              ...config.metadata,
              ...updates.metadata,
              updatedAt: new Date(),
            },
          }
          : config
      )
    );
  }, []);

  const incrementUsageCount = useCallback((id: string) => {
    setSavedConfigurations((prev) =>
      prev.map((config) =>
        config.id === id
          ? {
            ...config,
            metadata: {
              ...config.metadata,
              usageCount: (config.metadata.usageCount || 0) + 1,
              lastUsedAt: new Date(),
            },
          }
          : config
      )
    );
  }, []);

  const duplicateConfiguration = useCallback((id: string) => {
    const config = savedConfigurations.find((c) => c.id === id);
    if (!config) return;

    const now = new Date();
    const duplicated: SavedConfiguration = {
      ...config,
      id: `config-${Date.now()}`,
      page_name: `${config.page_name} (copy)`,
      metadata: {
        ...config.metadata,
        createdAt: now,
        updatedAt: now,
        usageCount: 0,
        lastUsedAt: undefined,
      },
    };

    setSavedConfigurations((prev) => [duplicated, ...prev]);
    return duplicated;
  }, [savedConfigurations]);

  return {
    savedConfigurations,
    saveConfiguration,
    deleteConfiguration,
    updateConfiguration,
    incrementUsageCount,
    duplicateConfiguration,
  };
}
