import React from 'react';
import type { CarouselProps } from '../../../types';
import CarouselContainer from './carouselContainer';

interface LayoutCarouselProps extends Partial<CarouselProps> {
  display?: boolean;
}

const LayoutCarousel: React.FC<LayoutCarouselProps> = ({ display = true, ...rest }) => {
  if (!display) return null;
  if (!rest.images || rest.images.length === 0) return null;

  return (
    <div className="w-full flex justify-center px-2 sm:px-4 border-radius-lg">
      <div className="w-full max-w-[100%] sm:max-w-[600px]">
        <CarouselContainer {...rest as any} />
      </div>
    </div>
  );
};

export default LayoutCarousel;
