import React from 'react';
import { buildSteamWidgetUrl } from '../../../types';
import type { UtmParams } from '../../../types';

interface WidgetFullProps {
  gameId: string;
  width?: number;
  height?: number;
  className?: string;
  utm?: UtmParams;
  layout?: 'desktop' | 'phone';
}

const WidgetFull: React.FC<WidgetFullProps> = ({
  gameId,
  width,
  height,
  className = '',
  utm = {},
  layout = 'desktop'
}) => {
  // Default dimensions based on layout
  const defaultWidth = layout === 'phone' ? 320 : 646;
  const defaultHeight = layout === 'phone' ? 94 : 190;

  const finalWidth = width ?? defaultWidth;
  const finalHeight = height ?? defaultHeight;

  const steamWidgetUrl = buildSteamWidgetUrl(gameId, null, utm);

  return (
    <div className={`steam-widget-container ${className}`} data-pf-platform="pf-steam-desktop">
      <iframe
        src={steamWidgetUrl}
        frameBorder="0"
        width={finalWidth}
        height={finalHeight}
        title={`Steam Widget for game ${gameId}`}
        loading="lazy"
        style={{
          border: 'none',
          borderRadius: '4px',
          ...(layout === 'phone' && { maxWidth: '100%' }),
        }}
      />
    </div>
  );
};

export default WidgetFull;
