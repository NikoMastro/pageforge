import React, { useState } from 'react';
import { PlayCircleIcon } from '@heroicons/react/24/outline';
import { useVideoGeneration } from '../../../hooks/hooksMedia/useVideoGeneration';
import { useSavedConfigurations } from '../../../hooks/hooksConfigs/useSavedConfigurations';
import { DEFAULT_VEO_MODEL_ID, type ReferenceImageParam, type SampleCount } from '../../../api/videoGeneration.api';
import {
  PromptSection,
  VideoPreview,
  MediaInputsSection,
  SafetySettingsSection,
  ConfigurationControls,
} from '../../../components/ui/videoGeneration';
import type {
  ReferenceImageState,
  VideoGenerationSettings,
  PromptState,
} from '../../../types/videoGeneration.types';
import {
  aspectRatioOptions,
  compressionOptions,
  durationOptions,
  modelOptions,
  personGenerationOptions,
  resizeModeOptions,
  resolutionOptions,
  sampleCountOptions,
} from '../../../components/ui/videoGeneration/constants';
import {
  toBooleanSelect,
  fromBooleanSelect,
  readFileAsDataUrl,
  createId,
  downloadVideo,
} from '../../../utils/videoGeneration.utils';

const VideoGenerationPage: React.FC = () => {
  const { videos: generatedVideos, isGenerating, generate, iterate } = useVideoGeneration();
  const {
    savedConfigurations,
    saveConfiguration,
    deleteConfiguration,
    incrementUsageCount,
    duplicateConfiguration
  } = useSavedConfigurations();

  // Prompt state
  const [promptState, setPromptState] = useState<PromptState>({
    prompt: '',
    negativePrompt: '',
    useMultipleNegativePrompts: false,
    negativePromptsText: '',
  });

  // Media inputs state
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [lastFrame, setLastFrame] = useState<File | null>(null);
  const [lastFramePreview, setLastFramePreview] = useState<string | null>(null);
  const [videoInput, setVideoInput] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<ReferenceImageState[]>([]);

  // Video encoding state
  const [encodeVideo, setEncodeVideo] = useState(false);
  const [encodedVideoSizeKB, setEncodedVideoSizeKB] = useState<number | null>(null);
  const [isEncodingVideo, setIsEncodingVideo] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<VideoGenerationSettings>({
    provider: 'GCP',
    customProvider: '',
    modelId: DEFAULT_VEO_MODEL_ID,
    customModelId: '',
    durationSeconds: 8,
    resolution: '1080p',
    aspectRatio: '16:9',
    compressionQuality: 'optimized',
    generateAudio: true,
    personGeneration: 'allow_adult',
    resizeMode: 'pad',
    sampleCount: 1,
    seed: 123,
    storageUri: '',
    enhancePrompt: false,
    safetySettings: {
      hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
      harassment: 'BLOCK_MEDIUM_AND_ABOVE',
      sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
      dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  });

  // Media input handlers
  const handleImageSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    setImage(file);
    try {
      const preview = await readFileAsDataUrl(file);
      setImagePreview(preview);
    } catch (error) {
      console.error('Error generating image preview:', error);
      setImagePreview(null);
    }
  };

  const handleLastFrameSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image for the last frame.');
      return;
    }

    setLastFrame(file);
    try {
      const preview = await readFileAsDataUrl(file);
      setLastFramePreview(preview);
    } catch (error) {
      console.error('Error generating last frame preview:', error);
      setLastFramePreview(null);
    }
  };

  const handleVideoSelect = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file.');
      return;
    }

    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }

    const objectUrl = URL.createObjectURL(file);
    setVideoPreview(objectUrl);
    setVideoInput(file);
  };

  const addReferenceImages = async (files: File[]) => {
    const remainingSlots = Math.max(0, 3 - referenceImages.length);

    if (remainingSlots === 0) {
      alert('You can upload up to 3 reference images.');
      return;
    }

    const selected = files.slice(0, remainingSlots);
    const entries: ReferenceImageState[] = [];

    for (const file of selected) {
      if (!file.type.startsWith('image/')) {
        continue;
      }

      try {
        const preview = await readFileAsDataUrl(file);
        entries.push({
          id: createId(),
          file,
          preview,
          referenceType: 'asset',
        });
      } catch (error) {
        console.error('Error generating reference image preview:', error);
      }
    }

    if (entries.length) {
      setReferenceImages((prev) => [...prev, ...entries]);
    }
  };

  const removeReferenceImage = (id: string) => {
    setReferenceImages((prev) => prev.filter((ref) => ref.id !== id));
  };

  const updateReferenceType = (id: string, referenceType: 'asset' | 'style') => {
    setReferenceImages((prev) =>
      prev.map((ref) => (ref.id === id ? { ...ref, referenceType } : ref))
    );
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const clearLastFrame = () => {
    setLastFrame(null);
    setLastFramePreview(null);
  };

  const clearVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoInput(null);
    setVideoPreview(null);
  };

  // Configuration handlers
  const handleSaveConfiguration = (configName: string) => {
    if (!configName.trim()) {
      alert('Please enter a configuration name');
      return;
    }

    saveConfiguration(
      configName,
      promptState,
      settings,
      {
        hasImage: image !== null,
        hasLastFrame: lastFrame !== null,
        hasVideo: videoInput !== null,
        referenceImagesCount: referenceImages.length,
      }
    );
  };

  const handleLoadConfiguration = (configId: string) => {
    const config = savedConfigurations.find((c) => c.id === configId);
    if (!config) return;

    // Load prompt state
    setPromptState(config.promptState);

    // Load settings
    setSettings(config.settings);

    // Increment usage count
    incrementUsageCount(configId);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Video generation handlers
  const handleGenerateVideo = async () => {
    if (!promptState.prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }

    const referenceImageParams: ReferenceImageParam[] | undefined = referenceImages.length
      ? referenceImages.map(({ file, referenceType }) => ({ file, referenceType }))
      : undefined;

    const resolvedProvider =
      settings.provider === 'custom'
        ? settings.customProvider.trim() || 'custom'
        : settings.provider;
    const resolvedModelId =
      settings.provider === 'custom'
        ? settings.customModelId.trim() || settings.modelId
        : settings.modelId;
    const storageUri = settings.storageUri.trim();

    const params = {
      provider: resolvedProvider,
      modelId: resolvedModelId,
      prompt: promptState.prompt,
      negativePrompt:
        !promptState.useMultipleNegativePrompts && promptState.negativePrompt.trim()
          ? promptState.negativePrompt
          : undefined,
      negativePrompts:
        promptState.useMultipleNegativePrompts && promptState.negativePromptsText.trim()
          ? promptState.negativePromptsText
            .split('\n')
            .map((segment: string) => segment.trim())
            .filter(Boolean)
          : undefined,
      image: image || undefined,
      lastFrame: lastFrame || undefined,
      video: videoInput || undefined,
      referenceImages: referenceImageParams,
      aspectRatio: settings.aspectRatio,
      compressionQuality: settings.compressionQuality,
      duration: settings.durationSeconds,
      durationSeconds: settings.durationSeconds,
      generateAudio: settings.generateAudio,
      includeAudio: settings.generateAudio,
      personGeneration: settings.personGeneration,
      resizeMode: settings.resizeMode,
      resolution: settings.resolution,
      sampleCount: settings.sampleCount as SampleCount,
      seed: settings.seed === '' ? undefined : Number(settings.seed),
      storageUri: storageUri || undefined,
      safetySettings: settings.safetySettings,
      enhancePrompt: settings.enhancePrompt,
    };

    try {
      await generate(params);
    } catch (error) {
      console.error('Error generating video:', error);
      alert('Failed to generate video. Please try again.');
    }
  };

  const handleIterateVideo = async (videoId: string) => {
    const video = generatedVideos.find((v) => v.id === videoId);
    if (!video) {
      return;
    }

    if (!promptState.prompt.trim()) {
      setPromptState({
        prompt: video.params.prompt,
        negativePrompt: video.params.negativePrompt ?? '',
        useMultipleNegativePrompts: false,
        negativePromptsText: '',
      });
      const incomingProvider =
        typeof video.params.provider === 'string' && video.params.provider
          ? video.params.provider
          : 'GCP';
      const normalizedProvider = incomingProvider.trim() || 'GCP';
      const isCustomProvider = normalizedProvider !== 'GCP';
      const incomingModel =
        typeof video.params.modelId === 'string' && video.params.modelId
          ? video.params.modelId
          : DEFAULT_VEO_MODEL_ID;

      setSettings((prev) => ({
        ...prev,
        provider: isCustomProvider ? 'custom' : normalizedProvider,
        customProvider: isCustomProvider ? normalizedProvider : '',
        modelId: isCustomProvider ? DEFAULT_VEO_MODEL_ID : incomingModel,
        customModelId: isCustomProvider ? incomingModel : '',
        durationSeconds:
          typeof video.params.durationSeconds === 'number'
            ? video.params.durationSeconds
            : prev.durationSeconds,
        resolution:
          video.params.resolution === '720p' || video.params.resolution === '1080p'
            ? video.params.resolution
            : prev.resolution,
        aspectRatio:
          video.params.aspectRatio === '16:9' || video.params.aspectRatio === '9:16'
            ? video.params.aspectRatio
            : prev.aspectRatio,
        compressionQuality:
          typeof video.params.compressionQuality === 'string'
            ? video.params.compressionQuality
            : prev.compressionQuality,
        generateAudio:
          typeof video.params.generateAudio === 'boolean'
            ? video.params.generateAudio
            : prev.generateAudio,
        personGeneration:
          typeof video.params.personGeneration === 'string'
            ? video.params.personGeneration
            : prev.personGeneration,
        resizeMode: video.params.resizeMode ?? prev.resizeMode,
        sampleCount:
          typeof video.params.sampleCount === 'number'
            ? video.params.sampleCount
            : prev.sampleCount,
        seed: typeof video.params.seed === 'number' ? video.params.seed : '',
        storageUri: typeof video.params.storageUri === 'string' ? video.params.storageUri : '',
        safetySettings: video.params.safetySettings ?? prev.safetySettings,
        enhancePrompt: Boolean(video.params.enhancePrompt),
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const resolvedProvider =
      settings.provider === 'custom'
        ? settings.customProvider.trim() || 'custom'
        : settings.provider;
    const resolvedModelId =
      settings.provider === 'custom'
        ? settings.customModelId.trim() || settings.modelId
        : settings.modelId;
    const storageUri = settings.storageUri.trim();

    try {
      await iterate(videoId, promptState.prompt, {
        negativePrompt:
          !promptState.useMultipleNegativePrompts && promptState.negativePrompt.trim()
            ? promptState.negativePrompt
            : undefined,
        negativePrompts:
          promptState.useMultipleNegativePrompts && promptState.negativePromptsText.trim()
            ? promptState.negativePromptsText
              .split('\n')
              .map((segment: string) => segment.trim())
              .filter(Boolean)
            : undefined,
        provider: resolvedProvider,
        modelId: resolvedModelId,
        aspectRatio: settings.aspectRatio,
        compressionQuality: settings.compressionQuality,
        duration: settings.durationSeconds,
        durationSeconds: settings.durationSeconds,
        generateAudio: settings.generateAudio,
        includeAudio: settings.generateAudio,
        personGeneration: settings.personGeneration,
        resizeMode: settings.resizeMode,
        resolution: settings.resolution,
        sampleCount: settings.sampleCount as SampleCount,
        seed: settings.seed === '' ? undefined : Number(settings.seed),
        storageUri: storageUri || undefined,
        safetySettings: settings.safetySettings,
        enhancePrompt: settings.enhancePrompt,
      });
    } catch (error) {
      console.error('Error iterating video:', error);
      alert('Failed to iterate video. Please try again.');
    }
  };

  const primaryPreview = generatedVideos[0];

  const updateSetting = <K extends keyof VideoGenerationSettings>(
    key: K,
    value: VideoGenerationSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="relative flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
          {/* Configuration Controls - Top */}
          <section className="rounded-lg border border-gray-800 bg-gray-800 p-4 shadow-sm">
            <ConfigurationControls
              savedConfigurations={savedConfigurations}
              onSaveConfiguration={handleSaveConfiguration}
              onLoadConfiguration={handleLoadConfiguration}
              onDeleteConfiguration={deleteConfiguration}
              onDuplicateConfiguration={duplicateConfiguration}
              disabled={!promptState.prompt.trim()}
            />
          </section>

          {/* Generation Defaults */}
          <section className="space-y-8">
            <div className="rounded-lg border border-gray-800 bg-gray-800 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">Generation Defaults</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Configure duration, resolution, and other defaults once before iterating on prompts.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Provider</label>
                  <select
                    value={settings.provider}
                    onChange={(e) => {
                      const nextProvider = e.target.value as 'GCP' | 'custom';
                      setSettings((prev) => ({
                        ...prev,
                        provider: nextProvider,
                        ...(nextProvider !== 'custom'
                          ? { customProvider: '', customModelId: '' }
                          : {}),
                      }));
                    }}
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="GCP">Google Cloud (Default)</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                {settings.provider === 'custom' && (
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
                  {settings.provider === 'custom' ? (
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
                    onChange={(e) => updateSetting('compressionQuality', e.target.value)}
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {compressionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    {compressionOptions.every((option) => option.value !== settings.compressionQuality) && (
                      <option value={settings.compressionQuality}>{settings.compressionQuality}</option>
                    )}
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
                    onChange={(e) => updateSetting('personGeneration', e.target.value)}
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {personGenerationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                    {personGenerationOptions.every((option) => option.value !== settings.personGeneration) && (
                      <option value={settings.personGeneration}>{settings.personGeneration}</option>
                    )}
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
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">Storage URI (optional)</label>
                  <input
                    type="text"
                    value={settings.storageUri}
                    onChange={(e) => updateSetting('storageUri', e.target.value)}
                    placeholder="gs://bucket-name/output/"
                    className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Media Inputs */}
          <section className="space-y-4">
            <div className="rounded-lg border border-gray-800 bg-gray-800 p-6 shadow-sm">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">Media Inputs (Optional)</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Provide reference media to guide the generation. All inputs are optional.
                </p>
              </div>
              <MediaInputsSection
                image={image}
                imagePreview={imagePreview}
                lastFrame={lastFrame}
                lastFramePreview={lastFramePreview}
                videoInput={videoInput}
                videoPreview={videoPreview}
                referenceImages={referenceImages}
                onImageSelect={handleImageSelect}
                onLastFrameSelect={handleLastFrameSelect}
                onVideoSelect={handleVideoSelect}
                onReferenceImagesAdd={addReferenceImages}
                onClearImage={clearImage}
                onClearLastFrame={clearLastFrame}
                onClearVideo={clearVideo}
                onRemoveReferenceImage={removeReferenceImage}
                onUpdateReferenceType={updateReferenceType}
                encodeVideo={encodeVideo}
                setEncodeVideo={setEncodeVideo}
                encodedVideoSizeKB={encodedVideoSizeKB}
                setEncodedVideoSizeKB={setEncodedVideoSizeKB}
                isEncodingVideo={isEncodingVideo}
                setIsEncodingVideo={setIsEncodingVideo}
              />
            </div>
          </section>

          {/* Safety Filters */}
          <section className="rounded-lg border border-gray-800 bg-gray-800 p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">Safety Filters</h3>
              <p className="mt-1 text-sm text-gray-400">
                Adjust safety thresholds for the generated content.
              </p>
            </div>
            <SafetySettingsSection
              safetySettings={settings.safetySettings}
              onChange={(safetySettings) => updateSetting('safetySettings', safetySettings)}
            />
          </section>

          {/* Preview Section */}
          <section className="flex flex-col rounded-lg border border-gray-800 bg-gray-800 p-4" style={{ height: '58vh' }}>
            <VideoPreview
              video={primaryPreview || null}
              onIterate={handleIterateVideo}
              onDownload={downloadVideo}
            />
          </section>

          {/* Prompt Section */}
          <section className="rounded-lg border border-gray-800 bg-gray-800 p-6 shadow-sm">
            <PromptSection
              promptState={promptState}
              setPromptState={setPromptState}
            />
          </section>

          {/* Generate Button */}
          <div className="flex justify-center pb-6">
            <button
              onClick={handleGenerateVideo}
              disabled={isGenerating || !promptState.prompt.trim()}
              className="flex w-full max-w-xl items-center justify-center gap-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-10 py-5 text-xl font-semibold text-white shadow-xl transition-all hover:from-blue-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="h-7 w-7 animate-spin rounded-full border-b-2 border-white"></div>
                  Generating Video...
                </>
              ) : (
                <>
                  <PlayCircleIcon className="h-8 w-8" />
                  Generate Video
                </>
              )}
            </button>
          </div>

          {/* Configuration Controls - Bottom (duplicate for easy access) */}
          <section className="rounded-lg border border-gray-800 bg-gray-800 p-4 shadow-sm">
            <ConfigurationControls
              savedConfigurations={savedConfigurations}
              onSaveConfiguration={handleSaveConfiguration}
              onLoadConfiguration={handleLoadConfiguration}
              onDeleteConfiguration={deleteConfiguration}
              onDuplicateConfiguration={duplicateConfiguration}
              disabled={!promptState.prompt.trim()}
            />
          </section>
        </div>
      </div>
    </div>
  );
};

export default VideoGenerationPage;
