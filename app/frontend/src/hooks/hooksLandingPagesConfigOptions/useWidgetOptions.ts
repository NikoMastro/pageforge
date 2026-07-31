import { useState } from 'react';
import type { WidgetOptions } from '../../types';

export const useWidgetOptions = () => {
  const [widgetOptions, setWidgetOptions] = useState<WidgetOptions>({
    gameId: '',
    width: 646,
    height: 190,
    enabled: false,
    type: 'full',
    scale: 1,
    language: undefined,
    alignX: 'center',
    alignY: 'middle',
    positionX: 0,
    positionY: 0,
    shadowIntensity: 0,
    utm: {
      source: 'pageforge',
      campaign: '',
      medium: '',
      content: '',
      term: '',
    },
  });

  return { widgetOptions, setWidgetOptions };
};
