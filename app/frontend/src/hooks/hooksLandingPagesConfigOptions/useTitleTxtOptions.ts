import { useState } from 'react';
import type { TitleTxtOptions } from '../../types/ui.types';

export const useTitleTxtOptions = () => {
  const [titleTxtOptions, setTitleTxtOptions] = useState<TitleTxtOptions>({
    title: 'Title',
    subtext: 'Subtitle text',
    background: {
      type: 'solid',
      color: '#ffffff',
    },
    backgroundColor: '#ffffff',
    titleColor: '#000000',
    subtextColor: '#666666',
    titleFontSize: '48px',
    subtextFontSize: '24px',
    display: false,
  });

  return {
    titleTxtOptions,
    setTitleTxtOptions,
  };
};
