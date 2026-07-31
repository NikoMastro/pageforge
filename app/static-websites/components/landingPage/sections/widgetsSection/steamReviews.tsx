import React from 'react';
import type { SteamReviewsProps } from '../../../types';
import SteamReviewsContainer from './steamReviewsContainer';

interface LayoutSteamReviewsProps extends Partial<SteamReviewsProps> {
  display?: boolean;
}

const LayoutSteamReviews: React.FC<LayoutSteamReviewsProps> = ({ display = true, ...rest }) => {
  if (!display) return null;
  if (!rest.images || rest.images.length === 0) return null;

  return (
    <div className="w-full flex justify-center px-4">
      <div className="w-full max-w-[960px]">
        <SteamReviewsContainer {...rest as any} />
      </div>
    </div>
  );
};

export default LayoutSteamReviews;
