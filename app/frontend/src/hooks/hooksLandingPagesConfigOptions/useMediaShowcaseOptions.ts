import { useState } from 'react';
import type { MediaShowcaseOptions } from '../../types/ui.types';

export const useMediaShowcaseOptions = () => {
  const [mediaShowcaseOptions, setMediaShowcaseOptions] = useState<MediaShowcaseOptions>({
    items: [],
    title: 'Medias',
    background: {
      type: 'solid',
      color: '#000000',
    },
    rows: 2,
    columns: 3,
    gap: 10,
    backgroundColor: '#000000',
    padding: '0',
    cellHeight: '300px',
    display: false,
  });

  return {
    mediaShowcaseOptions,
    setMediaShowcaseOptions,
  };
};
