import { useState } from 'react';
import type { VideoPlayerOptions } from '../../types/ui.types';

export const useVideoPlayerOptions = () => {
  const [videoPlayerOptions, setVideoPlayerOptions] = useState<VideoPlayerOptions>({
    background: {
      type: 'solid',
      color: '#000000'
    },
    videoSource: {
      type: 'url',
      url: ''
    },
    videoWidth: '100%',
    videoHeight: 'auto',
    aspectRatio: '16/9',
    autoPlay: false,
    loop: false,
    muted: false,
    controls: false,
    playsInline: false,
    poster: ''
  });

  return {
    videoPlayerOptions,
    setVideoPlayerOptions,
  };
};
