import { useState } from 'react';
import type { ButtonOptions } from '../../types';

export const useButtonOptions = () => {
  const [buttonOptions, setButtonOptions] = useState<ButtonOptions>({
    text: 'PLAY NOW',
    buttonText: 'PLAY NOW',
    href: '',
    gameId: '',
    backgroundColor: '#3b82f6',
    textColor: '#ffffff',
    borderRadius: '8px',
    padding: '8px 16px',
    margin: '',
    fontSize: '16px',
    fontWeight: '500',
    hoverBackgroundColor: '#2563eb',
    hoverTextColor: '#ffffff',
    buttonSize: 'default',
    disabled: false,
    fullWidth: false,
    shadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    width: 'auto',
    height: 'auto',
    hoverShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    transition: 'all 0.2s ease-in-out',
    shadowIntensity: 0.25,
    hoverShadowIntensity: 0.35,
    font: {
      family: 'inherit',
      weight: '500',
      size: '16px',
      color: '#ffffff',
      hoverColor: '#ffffff',
    },
    border: {
      radius: '8px',
      width: '2px',
      style: 'solid',
      color: 'transparent',
      hoverColor: 'transparent',
    },
    steamIcon: {
      display: false,
      size: '20px',
      variant: 'default',
      color: '#ffffff',
      hoverColor: '#ffffff',
    },
    image: {
      display: false,
      src: '',
      alt: '',
      width: 20,
      height: 20,
      position: 'left',
    },
  });

  return { buttonOptions, setButtonOptions };
};
