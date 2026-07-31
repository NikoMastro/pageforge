import { useState } from 'react';
import type { GeneralOptions } from '../../types';

export const useGeneralOptions = () => {
  const [generalOptions, setGeneralOptions] = useState<GeneralOptions>({
    font: {
      family: 'Inter, sans-serif',
      weight: '400',
    },
  });

  return { generalOptions, setGeneralOptions };
};
