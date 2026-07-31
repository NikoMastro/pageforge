import { useState } from 'react';
import type { SteamReviewsOptions } from '../../types';

export const useSteamReviewsOptions = () => {
  const [steamReviewsOptions, setSteamReviewsOptions] = useState<SteamReviewsOptions>({
    images: [],
    orientation: 'horizontal',
    scrollSpeed: 50,
    height: 400,
    width: '100%',
    maxWidth: 960,
    imageHeight: '150px',
    imageWidth: '600px',
    gap: 16,
  });

  return { steamReviewsOptions, setSteamReviewsOptions };
};
