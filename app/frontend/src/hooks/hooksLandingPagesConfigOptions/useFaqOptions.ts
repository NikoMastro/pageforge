import { useState } from 'react';
import type { FaqOptions } from '../../types/ui.types';

export const useFaqOptions = () => {
  const [faqOptions, setFaqOptions] = useState<FaqOptions>({
    items: [],
    title: 'Frequently Asked Questions',
    background: {
      type: 'solid',
      color: '#ffffff',
    },
    backgroundColor: '#ffffff',
    textColor: '#000000',
    questionFontSize: '18px',
    answerFontSize: '16px',
    padding: '60px 20px',
    maxWidth: '1000px',
    display: false,
    separatorColor: '#e5e7eb',
    iconColor: '#6b7280',
  });

  return {
    faqOptions,
    setFaqOptions,
  };
};
