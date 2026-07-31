import React, { useMemo } from 'react';
import type { VideoGenerationSettings } from '../../../../types/videoGeneration.types';
import {
  aspectRatioOptions,
  compressionOptions,
  modelOptions,
  personGenerationOptions,
  resizeModeOptions,
  resolutionOptions,
  safetyLevels,
} from '../constants';

type SettingsSummaryProps = {
  settings: VideoGenerationSettings;
};

export const SettingsSummary: React.FC<SettingsSummaryProps> = ({ settings }) => {
  const safetySummary = useMemo(() => {
    const uniqueLevels = new Set(Object.values(settings.safetySettings));
    if (uniqueLevels.size === 1) {
      const [onlyLevel] = Array.from(uniqueLevels);
      const match = safetyLevels.find((level) => level.value === onlyLevel);
      return match ? match.label : onlyLevel.replace('BLOCK_', '').replace(/_/g, ' ');
    }
    return 'Mixed';
  }, [settings.safetySettings]);

  const providerLabel = useMemo(() => {
    if (!settings.provider) {
      return 'Default';
    }
    if (settings.provider === 'custom') {
      return settings.customProvider.trim() || 'Custom';
    }
    return settings.provider;
  }, [settings.provider, settings.customProvider]);

  const compressionLabel = useMemo(
    () =>
      compressionOptions.find((option) => option.value === settings.compressionQuality)?.label ??
      settings.compressionQuality,
    [settings.compressionQuality]
  );

  const personGenerationLabel = useMemo(
    () =>
      personGenerationOptions.find((option) => option.value === settings.personGeneration)?.label ??
      settings.personGeneration,
    [settings.personGeneration]
  );

  const resizeModeLabel = useMemo(
    () =>
      resizeModeOptions.find((option) => option.value === settings.resizeMode)?.label ??
      settings.resizeMode,
    [settings.resizeMode]
  );

  const aspectRatioLabel = useMemo(
    () =>
      aspectRatioOptions.find((option) => option.value === settings.aspectRatio)?.label ??
      settings.aspectRatio,
    [settings.aspectRatio]
  );

  const resolutionLabel = useMemo(
    () =>
      resolutionOptions.find((option) => option.value === settings.resolution)?.label ??
      settings.resolution,
    [settings.resolution]
  );

  const modelLabel = useMemo(() => {
    const resolvedModelId =
      settings.provider === 'custom'
        ? settings.customModelId.trim() || settings.modelId
        : settings.modelId;

    if (!resolvedModelId) {
      return 'Default';
    }

    if (settings.provider === 'custom') {
      return resolvedModelId;
    }

    return modelOptions.find((option) => option.value === resolvedModelId)?.label ?? resolvedModelId;
  }, [settings.provider, settings.customModelId, settings.modelId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-800 p-3 text-xs text-gray-300 shadow-sm">
      <div className="flex-1 space-y-2 overflow-y-auto pr-1">
        <div className="flex flex-col gap-0.5 border-b border-gray-700 pb-2">
          <span className="text-[10px] uppercase text-gray-500">Provider</span>
          <span className="text-sm text-gray-200">{providerLabel}</span>
        </div>
        <div className="flex flex-col gap-0.5 border-b border-gray-700 pb-2">
          <span className="text-[10px] uppercase text-gray-500">Model</span>
          <span className="text-sm text-gray-200">{modelLabel}</span>
        </div>
        <div className="flex flex-col gap-0.5 border-b border-gray-700 pb-2">
          <span className="text-[10px] uppercase text-gray-500">Duration</span>
          <span className="text-sm text-gray-200">{settings.durationSeconds}s</span>
        </div>
        <div className="flex flex-col gap-0.5 border-b border-gray-700 pb-2">
          <span className="text-[10px] uppercase text-gray-500">Aspect</span>
          <span className="text-sm text-gray-200">{aspectRatioLabel}</span>
        </div>
        <div className="flex flex-col gap-0.5 border-b border-gray-700 pb-2">
          <span className="text-[10px] uppercase text-gray-500">Resolution</span>
          <span className="text-sm text-gray-200">{resolutionLabel}</span>
        </div>
        <div className="flex flex-col gap-0.5 border-b border-gray-700 pb-2">
          <span className="text-[10px] uppercase text-gray-500">Compression</span>
          <span className="text-sm text-gray-200">{compressionLabel}</span>
        </div>
        <div className="flex flex-col gap-0.5 border-b border-gray-700 pb-2">
          <span className="text-[10px] uppercase text-gray-500">Audio</span>
          <span className="text-sm text-gray-200">{settings.generateAudio ? 'On' : 'Off'}</span>
        </div>
        <div className="flex flex-col gap-0.5 border-b border-gray-700 pb-2">
          <span className="text-[10px] uppercase text-gray-500">Samples</span>
          <span className="text-sm text-gray-200">{settings.sampleCount}</span>
        </div>
        <div className="flex flex-col gap-0.5 border-b border-gray-700 pb-2">
          <span className="text-[10px] uppercase text-gray-500">Enhance Prompt</span>
          <span className="text-sm text-gray-200">{settings.enhancePrompt ? 'On' : 'Off'}</span>
        </div>
        <div className="flex flex-col gap-0.5 border-b border-gray-700 pb-2">
          <span className="text-[10px] uppercase text-gray-500">People</span>
          <span className="text-sm text-gray-200">{personGenerationLabel}</span>
        </div>
        <div className="flex flex-col gap-0.5 border-b border-gray-700 pb-2">
          <span className="text-[10px] uppercase text-gray-500">Resize</span>
          <span className="text-sm text-gray-200">{resizeModeLabel}</span>
        </div>
        <div className="flex flex-col gap-0.5 pb-2">
          <span className="text-[10px] uppercase text-gray-500">Safety</span>
          <span className="text-sm text-gray-200">{safetySummary}</span>
        </div>
      </div>
    </div>
  );
};
