import React, { useMemo } from 'react';
import { buildSteamWidgetUrl } from '../../../types';
import type { UtmParams } from '../../../types';
import { detectLanguage, getLanguageConfig, getButtonWidth } from './steamLanguageConfig';

interface SteamWidgetCropInstallProps {
  gameId: string;
  scale?: number;
  language?: string | null;
  className?: string;
  utm?: UtmParams;
}

const SteamWidgetCropInstall: React.FC<SteamWidgetCropInstallProps> = ({
  gameId,
  scale = 1,
  language = null,
  className = '',
  utm = {}
}) => {
  // Detect language immediately - use language prop or detect from browser
  const detectedLanguage = useMemo(() => {
    return detectLanguage(language);
  }, [language, gameId]);

  const buildWidgetUrl = (gameId: string, cc: string | null): string => {
    return buildSteamWidgetUrl(gameId, cc, utm);
  };

  const getCropDimensions = (lang: string) => {
    const buttonWidth = getButtonWidth(lang, 'install');

    return {
      // Crop position (12px from right edge, 5px from bottom)
      cropX: 646 - 12 - buttonWidth, // X start crop
      cropY: 190 - 5 - 32,          // Y start crop (5px from bottom, height 32px - 2px removed from bottom)
      // Crop dimensions
      cropWidth: buttonWidth,
      cropHeight: 32
    };
  };

  // Use provided language prop or detected language
  // Ensure we have a valid language that exists in our mapping
  // IMPORTANT: Ignore 'english' prop to force auto-detection (english has no cc code)
  let currentLanguage = detectedLanguage;
  if (language && language.trim() !== '' && language !== 'english' && getLanguageConfig(language)) {
    currentLanguage = language;
  }

  const langData = getLanguageConfig(currentLanguage);
  const cropDims = getCropDimensions(currentLanguage);

  return (
    <div
      className={`${className}`}
      style={{
        width: `${cropDims.cropWidth * scale}px`,
        height: `${cropDims.cropHeight * scale}px`,
        display: 'inline-block'
      }}
      data-pf-platform="pf-steam-desktop"
    >
      <div
        className="relative rounded-sm overflow-hidden"
        style={{
          width: `${cropDims.cropWidth}px`,
          height: `${cropDims.cropHeight}px`,
          borderRadius: '2px',
          transform: `scale(${scale})`,
          transformOrigin: 'top left'
        }}
      >
        <iframe
          src={buildWidgetUrl(gameId, langData.cc)}
          frameBorder="0"
          style={{
            width: '646px',
            height: '190px',
            position: 'absolute',
            top: `-${cropDims.cropY}px`,
            left: `-${cropDims.cropX}px`
          }}
          title={`Steam Install Button - ${currentLanguage}`}
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default SteamWidgetCropInstall;
