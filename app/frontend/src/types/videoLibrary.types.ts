import type { VideoGenerationResponse } from '../api/videoGeneration.api';

export type GeneratedVideoSummaryStatus = VideoGenerationResponse['status'];

export type GeneratedVideoSummary = {
  id: string;
  name: string;
  createdBy?: string | null;
  createdAt?: string | null;
  status?: GeneratedVideoSummaryStatus;
  prompt?: string | null;
  thumbnailUrl?: string | null;
};
