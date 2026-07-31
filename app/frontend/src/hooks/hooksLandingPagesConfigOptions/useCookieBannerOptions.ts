import { useState } from 'react';
import type { CookieBannerOptions } from '../../types';

export const useCookieBannerOptions = () => {
  const [cookieBannerOptions, setCookieBannerOptions] = useState<CookieBannerOptions>({
    backgroundColor: '#111827',
    backgroundOpacity: 0.95,
    textColor: '#ffffff',
    headerText: '',
    bodyText: '',
    policyUrl: '',
    acceptText: 'Accept All',
    customizeText: 'Customize',
    showReject: true,
  });

  return { cookieBannerOptions, setCookieBannerOptions };
};
