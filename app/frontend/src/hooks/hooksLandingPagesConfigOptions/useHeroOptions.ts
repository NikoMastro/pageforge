import { useState } from 'react';
import type { HeroOptions } from '../../types';

export const useHeroOptions = () => {
  const [heroOptions, setHeroOptions] = useState<HeroOptions>({
    title: 'Welcome to Our Platform',
    heading: 'Welcome to Our Platform',
    subtitle: 'The best solution for your needs with powerful features',
    subheading: 'The best solution for your needs with powerful features',
    backgroundImage: '',
    backgroundOverlay: '',
    backgroundColor: 'transparent',
    textAlignment: 'center',
    titleColor: '#000000',
    subtitleColor: '#6b7280',
    headingSize: 'large',
    headingColor: '#000000',
    subheadingSize: 'medium',
    subheadingColor: '#6b7280',
    textShadow: false,
    textShadowIntensity: 0.3,
  });

  return { heroOptions, setHeroOptions };
};
