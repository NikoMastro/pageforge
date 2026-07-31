import React from 'react';
import type { VideoGenerationSettings, ReferenceImageState } from '../../../../types/videoGeneration.types';
import {
  aspectRatioOptions,
  compressionOptions,
  durationOptions,
  modelOptions,
  personGenerationOptions,
  resizeModeOptions,
  resolutionOptions,
  sampleCountOptions,
} from '../constants';
import { toBooleanSelect, fromBooleanSelect } from '../../../../utils/videoGeneration.utils';
import { MediaInputsSection } from './mediaInputSettings';
import { SafetySettingsSection } from './safetySettings';

type SettingsDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  settings: VideoGenerationSettings;
  onSettingsChange: (settings: VideoGenerationSettings) => void;
  // Media inputs props
  image: File | null;
  imagePreview: string | null;
  lastFrame: File | null;
  lastFramePreview: string | null;
  videoInput: File | null;
  videoPreview: string | null;
  referenceImages: ReferenceImageState[];
  onImageSelect: (file: File) => void;
  onLastFrameSelect: (file: File) => void;
  onVideoSelect: (file: File) => void;
  onReferenceImagesAdd: (files: File[]) => void;
  onClearImage: () => void;
  onClearLastFrame: () => void;
  onClearVideo: () => void;
  onRemoveReferenceImage: (id: string) => void;
  onUpdateReferenceType: (id: string, referenceType: 'asset' | 'style') => void;
  encodeVideo: boolean;
  setEncodeVideo: (value: boolean) => void;
  encodedVideoSizeKB: number | null;
  setEncodedVideoSizeKB: (value: number | null) => void;
  isEncodingVideo: boolean;
  setIsEncodingVideo: (value: boolean) => void;
};

export const SettingsDrawer: React.FC<SettingsDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  image,
  imagePreview,
  lastFrame,
  lastFramePreview,
  videoInput,
  videoPreview,
  referenceImages,
  onImageSelect,
  onLastFrameSelect,
  onVideoSelect,
  onReferenceImagesAdd,
  onClearImage,
  onClearLastFrame,
  onClearVideo,
  onRemoveReferenceImage,
  onUpdateReferenceType,
  encodeVideo,
  setEncodeVideo,
  encodedVideoSizeKB,
  setEncodedVideoSizeKB,
  isEncodingVideo,
  setIsEncodingVideo,
}) => {
  const updateSetting = <K extends keyof VideoGenerationSettings>(
    key: K,
    value: VideoGenerationSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleProviderChange = (nextProvider: 'GCP' | 'custom') => {
    const nextSettings: VideoGenerationSettings = {
      ...settings,
      provider: nextProvider,
    };

    if (nextProvider !== 'custom') {
      nextSettings.customProvider = '';
      nextSettings.customModelId = '';
    }

    onSettingsChange(nextSettings);
  };

  const isCustomProvider = settings.provider === 'custom';

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
          }`}
        onClick={onClose}
      ></div>

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-3xl transform border-l border-gray-800 bg-gray-900 shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Configuration</h2>
            <p className="text-xs text-gray-400">Adjust inputs and defaults without losing your place.</p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-2 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-200 transition-colors hover:border-blue-500 hover:text-white"
          >
            <XMarkIcon className="h-4 w-4" />
            Close
          </button>
        </div> */}

        <div className="h-full space-y-8 overflow-y-auto px-6 py-6">
          {/* Generation Defaults */}
          <section className="rounded-lg border border-gray-800 bg-gray-800 p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">Generation Defaults</h3>
              <p className="mt-1 text-sm text-gray-400">
                Configure duration, resolution, and other defaults once before iterating on prompts.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Provider</label>
                <select
                  value={settings.provider === 'custom' || settings.provider === 'GCP' ? settings.provider : 'GCP'}
                  onChange={(e) => handleProviderChange(e.target.value as 'GCP' | 'custom')}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GCP">Default</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              {isCustomProvider && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Custom Provider</label>
                  <input
                    type="text"
                    value={settings.customProvider}
                    onChange={(e) => updateSetting('customProvider', e.target.value)}
                    placeholder="Enter provider identifier"
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Model</label>
                {isCustomProvider ? (
                  <input
                    type="text"
                    value={settings.customModelId}
                    onChange={(e) => updateSetting('customModelId', e.target.value)}
                    placeholder="Enter model identifier"
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <select
                    value={settings.modelId}
                    onChange={(e) => updateSetting('modelId', e.target.value)}
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {modelOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    {modelOptions.every((option) => option.value !== settings.modelId) && (
                      <option value={settings.modelId}>{settings.modelId}</option>
                    )}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Duration (seconds)</label>
                <select
                  value={settings.durationSeconds}
                  onChange={(e) => updateSetting('durationSeconds', Number(e.target.value))}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {durationOptions.map((durationOption) => (
                    <option key={durationOption} value={durationOption}>
                      {durationOption}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Aspect Ratio</label>
                <select
                  value={settings.aspectRatio}
                  onChange={(e) => updateSetting('aspectRatio', e.target.value as '16:9' | '9:16')}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {aspectRatioOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Compression</label>
                <select
                  value={settings.compressionQuality}
                  onChange={(e) =>
                    updateSetting('compressionQuality', e.target.value as 'optimized' | 'lossless')
                  }
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {compressionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Generate Audio</label>
                <select
                  value={toBooleanSelect(settings.generateAudio)}
                  onChange={(e) => updateSetting('generateAudio', fromBooleanSelect(e.target.value))}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="true">Enabled</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Person Generation</label>
                <select
                  value={settings.personGeneration}
                  onChange={(e) =>
                    updateSetting('personGeneration', e.target.value as 'allow_adult' | 'dont_allow')
                  }
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {personGenerationOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Resize Mode</label>
                <select
                  value={settings.resizeMode}
                  onChange={(e) => updateSetting('resizeMode', e.target.value as 'pad' | 'crop')}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {resizeModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Resolution</label>
                <select
                  value={settings.resolution}
                  onChange={(e) => updateSetting('resolution', e.target.value as '720p' | '1080p')}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {resolutionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Sample Count</label>
                <select
                  value={settings.sampleCount}
                  onChange={(e) => updateSetting('sampleCount', Number(e.target.value))}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sampleCountOptions.map((count) => (
                    <option key={count} value={count}>
                      {count}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Enhance Prompt</label>
                <select
                  value={toBooleanSelect(settings.enhancePrompt)}
                  onChange={(e) => updateSetting('enhancePrompt', fromBooleanSelect(e.target.value))}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="false">Disabled</option>
                  <option value="true">Enabled</option>
                </select>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Seed (optional)</label>
                <input
                  type="number"
                  value={settings.seed === '' ? '' : settings.seed}
                  onChange={(e) => updateSetting('seed', e.target.value === '' ? '' : Number(e.target.value))}
                  min={0}
                  className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </section>

          {/* Media Inputs */}
          <MediaInputsSection
            image={image}
            imagePreview={imagePreview}
            lastFrame={lastFrame}
            lastFramePreview={lastFramePreview}
            videoInput={videoInput}
            videoPreview={videoPreview}
            referenceImages={referenceImages}
            onImageSelect={onImageSelect}
            onLastFrameSelect={onLastFrameSelect}
            onVideoSelect={onVideoSelect}
            onReferenceImagesAdd={onReferenceImagesAdd}
            onClearImage={onClearImage}
            onClearLastFrame={onClearLastFrame}
            onClearVideo={onClearVideo}
            onRemoveReferenceImage={onRemoveReferenceImage}
            onUpdateReferenceType={onUpdateReferenceType}
            encodeVideo={encodeVideo}
            setEncodeVideo={setEncodeVideo}
            encodedVideoSizeKB={encodedVideoSizeKB}
            setEncodedVideoSizeKB={setEncodedVideoSizeKB}
            isEncodingVideo={isEncodingVideo}
            setIsEncodingVideo={setIsEncodingVideo}
          />

          {/* Safety Settings */}
          <SafetySettingsSection
            safetySettings={settings.safetySettings}
            onChange={(safetySettings) => updateSetting('safetySettings', safetySettings)}
          />
        </div>
      </div>
    </>
  );
};
