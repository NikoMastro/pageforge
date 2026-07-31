export const modelOptions = [
  { value: 'veo-3.0-generate-001', label: 'Veo 3.0 Generate (Default)' },
  { value: 'veo-3.0-fast-generate-001', label: 'Veo 3.0 Fast Generate' },
  { value: 'veo-3.1-generate-preview', label: 'Veo 3.1 Generate (Preview)' },
  { value: 'veo-3.1-fast-generate-preview', label: 'Veo 3.1 Fast Generate (Preview)' },
  { value: 'veo-2.0-generate-001', label: 'Veo 2.0 Generate' },
  { value: 'veo-2.0-generate-exp', label: 'Veo 2.0 Generate Experimental' },
  { value: 'veo-2.0-generate-preview', label: 'Veo 2.0 Generate (Preview)' },
] as const;

export const aspectRatioOptions = [
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Portrait)' },
] as const;

export const compressionOptions = [
  { value: 'optimized', label: 'Optimized (Default)' },
  { value: 'lossless', label: 'Lossless' },
] as const;

export const durationOptions = [4, 5, 6, 8] as const;

export const personGenerationOptions = [
  { value: 'allow_adult', label: 'Allow Adults (Default)' },
  { value: 'dont_allow', label: 'Disallow Faces' },
] as const;

export const resizeModeOptions = [
  { value: 'pad', label: 'Pad (Default)' },
  { value: 'crop', label: 'Crop' },
] as const;

export const resolutionOptions = [
  { value: '720p', label: '720p' },
  { value: '1080p', label: '1080p' },
] as const;

export const sampleCountOptions = [1, 2, 3, 4] as const;

export const referenceTypeOptions = [
  { value: 'asset', label: 'Asset' },
  { value: 'style', label: 'Style' },
] as const;

export const safetyLevels = [
  { value: 'BLOCK_NONE', label: 'None' },
  { value: 'BLOCK_LOW_AND_ABOVE', label: 'Low+' },
  { value: 'BLOCK_MEDIUM_AND_ABOVE', label: 'Medium+' },
  { value: 'BLOCK_ONLY_HIGH', label: 'High Only' },
] as const;
