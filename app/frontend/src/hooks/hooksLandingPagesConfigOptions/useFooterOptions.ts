import { useState } from 'react';
import type { FooterOptions } from '../../types';

export const useFooterOptions = () => {
  const [footerOptions, setFooterOptions] = useState<FooterOptions>({
    backgroundColor: '#1f2937',
    textColor: '#f3f4f6',
    footerText: '',
    logoUrl: '',
    logoSize: 48,
    hasAdditionalLogo: false,
    additionalLogoUrl: '',
    additionalLogoPosition: 'below',
    additionalLogoSize: 48,
    links: [],
    socialMedia: [],
    copyrightText: '',
    termsUrl: '',
    privacyUrl: '',
    refundUrl: '',
    eulaUrl: '',
    contactUrl: '',
    includeSocialIcons: false,
    selectedSocialIcons: [],
    socialIconSize: 'medium',
    customSocialUrls: {},
    layout: {
      containerClass: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      brandColumnSpan: 'sm:col-span-3',
      brandColumnAlignment: 'text-left',
      contentColumnSpan: 'sm:col-span-6',
      contentColumnAlignment: 'text-center',
      socialColumnSpan: 'sm:col-span-3',
      socialColumnAlignment: 'text-right',
      containerPadding: 'pb-4 pt-2 px-4',
      sectionPadding: 'py-4',
      verticalPadding: 'py-2',
      horizontalPadding: 'px-4',
      leftMargin: '0',
      rightMargin: '0',
      mobileLayout: 'flex-col',
      mobileOrder: 'order-1',
    },
  });

  return { footerOptions, setFooterOptions };
};
