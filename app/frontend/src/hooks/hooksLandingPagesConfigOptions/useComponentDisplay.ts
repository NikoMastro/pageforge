import { useState } from 'react';
import type { ComponentDisplay } from '../../types';

type ComponentPreset = 'Basic' | 'Widget' | 'Full-Content';

export const useComponentDisplay = () => {
  const [componentDisplay, setComponentDisplay] = useState<ComponentDisplay>({
    background: true,
    navbar: true,
    hero: true,
    carousel: false,
    steamReviews: false,
    widget: false,
    button: false,
    videoPlayer: false,
    titleTxt: false,
    columnTxt: false,
    mediaShowcase: false,
    faq: false,
    cookiesBanner: false,
    footer: true,
  });

  const handleComponentToggle = (component: keyof ComponentDisplay) => {
    setComponentDisplay({
      ...componentDisplay,
      [component]: !componentDisplay[component],
    });
  };

  const setPresetComponents = (preset: ComponentPreset) => {
    if (preset === 'Basic') {
      setComponentDisplay({
        ...componentDisplay,
        background: true,
        navbar: true,
        hero: true,
        carousel: false,
        steamReviews: false,
        widget: false,
        button: true,
        videoPlayer: false,
        titleTxt: false,
        columnTxt: false,
        mediaShowcase: false,
        faq: false,
        cookiesBanner: false,
        footer: true,
      });
    } else if (preset === 'Widget') {
      setComponentDisplay({
        ...componentDisplay,
        background: true,
        navbar: true,
        hero: true,
        carousel: false,
        steamReviews: false,
        widget: true,
        button: false,
        videoPlayer: false,
        titleTxt: false,
        columnTxt: false,
        mediaShowcase: false,
        faq: false,
        cookiesBanner: false,
        footer: true,
      });
    } else if (preset === 'Full-Content') {
      setComponentDisplay({
        ...componentDisplay,
        background: true,
        navbar: true,
        hero: true,
        carousel: true,
        steamReviews: false,
        widget: false,
        button: true,
        videoPlayer: true,
        titleTxt: true,
        columnTxt: true,
        mediaShowcase: false,
        faq: true,
        cookiesBanner: false,
        footer: true,
      });
    }
  };

  return {
    componentDisplay,
    setComponentDisplay,
    handleComponentToggle,
    setPresetComponents,
  };
};
