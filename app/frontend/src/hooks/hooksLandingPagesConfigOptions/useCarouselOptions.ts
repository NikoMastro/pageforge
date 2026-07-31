import { useState } from 'react';
import type { CarouselOptions } from '../../types';

export const useCarouselOptions = () => {
  const [carouselOptions, setCarouselOptions] = useState<CarouselOptions>({
    images: [],
    autoPlay: true,
    interval: 5000,
    showDots: true,
    showArrows: true,
  });

  return { carouselOptions, setCarouselOptions };
};
