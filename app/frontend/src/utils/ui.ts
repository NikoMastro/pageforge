// Helpers to render components by section type using local components only
import React from 'react';
import * as Components from '../components';
import { inferComponentName } from '@builders/landingPages/componentMapper';
import type { Section } from './interfaces';
import type { HeroOptions } from '../types';

export function renderSection(section: Section): React.ReactElement | null {
  const inferred = inferComponentName(section.type, section.props);
  if (!inferred) return null;
  const Cmp = (Components as Record<string, any>)[inferred];
  if (!Cmp) return null;
  return React.createElement(Cmp, { ...section.props });
}

export { Components };

// Helper functions for CSS value parsing and formatting
export const parseCSSValue = (value: string, defaultValue: number = 0): number => {
  const match = value.match(/(\d+)/);
  return match ? parseInt(match[1]) : defaultValue;
};

export const formatCSSValue = (value: number): string => {
  return `${value}px`;
};

// Helper functions to convert visual settings to Tailwind classes
export const generateHeroClasses = (heroOptions: HeroOptions) => {
  let baseClassName = heroOptions.className || 'py-12 md:py-20 text-center';
  const headingClassName = heroOptions.headingClassName || '';
  const subheadingClassName = heroOptions.subheadingClassName || '';

  // Background handling
  if (heroOptions.backgroundGradient && heroOptions.backgroundGradient !== '') {
    baseClassName += ` ${heroOptions.backgroundGradient}`;
  } else if (heroOptions.backgroundColor && heroOptions.backgroundColor !== 'transparent') {
    // Convert hex color to closest Tailwind class or use arbitrary value
    if (heroOptions.backgroundColor === '#ffffff') baseClassName += ' bg-white';
    else if (heroOptions.backgroundColor === '#000000') baseClassName += ' bg-black';
    else if (heroOptions.backgroundColor === '#3b82f6') baseClassName += ' bg-blue-500';
    else if (heroOptions.backgroundColor === '#ef4444') baseClassName += ' bg-red-500';
    else if (heroOptions.backgroundColor === '#10b981') baseClassName += ' bg-emerald-500';
    else if (heroOptions.backgroundColor === '#8b5cf6') baseClassName += ' bg-violet-500';
    else baseClassName += ` bg-[${heroOptions.backgroundColor}]`;
  }

  // Heading classes
  const headingSizes = {
    'small': 'text-2xl md:text-3xl',
    'medium': 'text-3xl md:text-4xl',
    'large': 'text-4xl md:text-5xl',
    'extra-large': 'text-5xl md:text-6xl'
  };

  let headingClasses = `font-bold mb-4 ${headingSizes[heroOptions.headingSize || 'large']}`;

  // Comprehensive color mapping for heading colors
  if (heroOptions.headingColor) {
    if (heroOptions.headingColor === '#000000') headingClasses += ' text-black';
    else if (heroOptions.headingColor === '#ffffff') headingClasses += ' text-white';
    else if (heroOptions.headingColor === '#fbbf24') headingClasses += ' text-yellow-400';
    else if (heroOptions.headingColor === '#3b82f6') headingClasses += ' text-blue-500';
    else if (heroOptions.headingColor === '#ef4444') headingClasses += ' text-red-500';
    else if (heroOptions.headingColor === '#10b981') headingClasses += ' text-emerald-500';
    else headingClasses += ` text-[${heroOptions.headingColor}]`;
  }

  if (heroOptions.textShadow) {
    const alpha = typeof heroOptions.textShadowIntensity === 'number' ? Math.min(Math.max(heroOptions.textShadowIntensity, 0), 1) : 0.8;
    headingClasses += ` drop-shadow-[0_2px_8px_rgba(0,0,0,${alpha})]`;
  }

  // Subheading classes
  const subheadingSizes = {
    'small': 'text-lg md:text-xl',
    'medium': 'text-xl md:text-2xl',
    'large': 'text-2xl md:text-3xl'
  };

  let subheadingClasses = `mb-8 ${subheadingSizes[heroOptions.subheadingSize || 'medium']}`;

  // Comprehensive color mapping for subheading colors
  if (heroOptions.subheadingColor) {
    if (heroOptions.subheadingColor === '#6b7280') subheadingClasses += ' text-gray-500';
    else if (heroOptions.subheadingColor === '#ffffff') subheadingClasses += ' text-white';
    else if (heroOptions.subheadingColor === '#9ca3af') subheadingClasses += ' text-gray-400';
    else if (heroOptions.subheadingColor === '#374151') subheadingClasses += ' text-gray-700';
    else if (heroOptions.subheadingColor === '#3b82f6') subheadingClasses += ' text-blue-500';
    else if (heroOptions.subheadingColor === '#ef4444') subheadingClasses += ' text-red-500';
    else if (heroOptions.subheadingColor === '#10b981') subheadingClasses += ' text-emerald-500';
    else subheadingClasses += ` text-[${heroOptions.subheadingColor}]`;
  }

  if (heroOptions.textShadow) {
    const alpha = typeof heroOptions.textShadowIntensity === 'number' ? Math.min(Math.max(heroOptions.textShadowIntensity, 0), 1) : 0.6;
    subheadingClasses += ` drop-shadow-[0_1px_4px_rgba(0,0,0,${alpha})]`;
  }

  return {
    className: baseClassName,
    headingClassName: headingClassName || headingClasses,
    subheadingClassName: subheadingClassName || subheadingClasses
  };
};
