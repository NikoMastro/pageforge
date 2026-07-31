import { useCallback, useRef, useState } from 'react';
import {
  DEFAULT_VEO_MODEL_ID,
  generateVideo,
  getVideoStatus,
  type VideoGenerationParams,
  type VideoGenerationResponse,
} from '../../api/videoGeneration.api';

interface GeneratedVideo extends VideoGenerationResponse {
  version: number;
  params: VideoGenerationParams;
  createdAt: Date;
}

export function useVideoGeneration() {
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const versionCounterRef = useRef(0);

  const pollVideoStatus = useCallback(
    (videoKey: string, modelId: string, operationId: string, legacyId?: string) => {
      const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5 seconds)
      let attempts = 0;

      const poll = async () => {
        try {
          const status = await getVideoStatus({
            modelId,
            operationId,
            legacyId,
          });

          setVideos((prev) =>
            prev.map((video) => {
              const matches = video.id === videoKey || video.operationId === operationId;
              if (!matches) {
                return video;
              }

              return {
                ...video,
                ...status,
                id: status.id ?? video.id,
                operationId,
                modelId: status.modelId ?? video.modelId ?? modelId,
                backendId: status.backendId ?? video.backendId ?? status.id ?? video.id,
              };
            })
          );

          if (status.status === 'generating' && attempts < maxAttempts) {
            attempts++;
            setTimeout(poll, 5000); // Poll every 5 seconds
          }
        } catch (err) {
          console.error('Error polling video status:', err);
          setVideos((prev) =>
            prev.map((video) => {
              const matches = video.id === videoKey || video.operationId === operationId;
              if (!matches) {
                return video;
              }

              return {
                ...video,
                status: 'failed',
                error: err instanceof Error ? err.message : 'Failed to fetch status',
              };
            })
          );
        }
      };

      poll();
    },
    []
  );

  const generate = useCallback(
    async (params: VideoGenerationParams) => {
      setIsGenerating(true);
      setError(null);

      try {
        const response = await generateVideo(params);
        const resolvedModelId =
          typeof params.modelId === 'string' && params.modelId
            ? params.modelId
            : DEFAULT_VEO_MODEL_ID;
        const legacyId = response.backendId ?? response.id;
        const trackingOperationId = response.operationId ?? legacyId;
        const nextVideoModelId = response.modelId ?? resolvedModelId;
        const createdAt = new Date();
        versionCounterRef.current += 1;
        const version = versionCounterRef.current;

        const nextVideo: GeneratedVideo = {
          ...response,
          version,
          params,
          createdAt,
          operationId: trackingOperationId,
          modelId: nextVideoModelId,
          backendId: response.backendId ?? legacyId,
        };

        setVideos((prev) => [nextVideo, ...prev]);

        if (response.status === 'generating' && trackingOperationId) {
          pollVideoStatus(nextVideo.id, nextVideoModelId, trackingOperationId, legacyId);
        }

        return nextVideo;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate video';
        setError(errorMessage);
        throw err;
      } finally {
        setIsGenerating(false);
      }
    },
    [pollVideoStatus]
  );

  const iterate = useCallback(
    async (
      videoId: string,
      prompt: string,
      modifications: Partial<VideoGenerationParams> = {}
    ) => {
      const originalVideo = videos.find((video) => video.id === videoId);

      if (!originalVideo) {
        throw new Error('Original video not found');
      }

      const mergedParams: VideoGenerationParams = {
        ...originalVideo.params,
        ...modifications,
        prompt,
      };

      if (originalVideo.params.referenceImages) {
        mergedParams.referenceImages = [...originalVideo.params.referenceImages];
      }

      return generate(mergedParams);
    },
    [videos, generate]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    videos,
    isGenerating,
    error,
    generate,
    iterate,
    clearError,
  };
}
