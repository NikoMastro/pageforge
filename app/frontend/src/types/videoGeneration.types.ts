import type { AspectRatio, SafetySettings } from '../api/videoGeneration.api';
import type { VeoModelId } from '../config/config';

export type ReferenceImageState = {
  id: string;
  file: File;
  preview: string;
  referenceType: 'asset' | 'style';
};

export type VideoGenerationSettings = {
  provider: 'GCP' | 'custom' | string;
  customProvider: string;
  modelId: VeoModelId | string;
  customModelId: string;
  durationSeconds: number;
  resolution: '720p' | '1080p';
  aspectRatio: AspectRatio;
  compressionQuality: string;
  generateAudio: boolean;
  personGeneration: 'allow_adult' | 'dont_allow' | string;
  resizeMode: 'pad' | 'crop';
  sampleCount: number;
  seed: number | '';
  storageUri: string;
  enhancePrompt: boolean;
  safetySettings: SafetySettings;
};

export type MediaInputs = {
  image: File | null;
  imagePreview: string | null;
  lastFrame: File | null;
  lastFramePreview: string | null;
  videoInput: File | null;
  videoPreview: string | null;
  referenceImages: ReferenceImageState[];
};

export type PromptState = {
  prompt: string;
  negativePrompt: string;
  useMultipleNegativePrompts: boolean;
  negativePromptsText: string;
};
