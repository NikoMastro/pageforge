/**
 * PfTag Pixel Detection Type Configuration
 * Maps detection types to their requirements:
 * [SupportUniversalLink, RequireMainUrl, RequireFallbackUrl]
 */
export const DETECTION_TYPE_MAP: Record<string, [boolean, boolean, boolean]> = {
  // Desktop
  desktop: [true, true, false],
  desktop_deep_link: [false, true, true],
  desktop_iframe: [false, false, false],
  // Android
  meta_android: [false, true, true],
  applovin_android: [true, true, false],
  x_android: [true, true, false],
  reddit_android: [true, true, false],
  tiktok_android: [true, true, false],
  // iOS
  meta_ios: [true, true, false],
  applovin_ios: [true, true, false],
  x_ios: [true, true, false],
  reddit_ios: [true, true, false],
  tiktok_ios: [true, true, false],
};

export interface PfTagConfig {
  detectionType?: string;
  mainUrl?: string;
  fallbackUrl?: string;
}

/**
 * Validates PfTag pixel configuration based on detection type requirements
 * @param config - The PfTag configuration to validate
 * @returns true if valid, false otherwise
 */
export function validatePfTagConfig(config: PfTagConfig): boolean {
  const { detectionType, mainUrl, fallbackUrl } = config;

  // Return true if detection type is empty (null, undefined, or empty string)
  if (!detectionType || (typeof detectionType === "string" && detectionType.trim() === "")) {
    return true;
  }

  // Check if detection type exists in DETECTION_TYPE_MAP
  if (!(detectionType in DETECTION_TYPE_MAP)) {
    return false;
  }

  const [supportUniversalLink, requireMainUrl, requireFallbackUrl] =
    DETECTION_TYPE_MAP[detectionType].slice(0, 3);

  // Check if mainUrl is required and provided
  if (requireMainUrl) {
    if (!mainUrl || (typeof mainUrl === "string" && mainUrl.trim() === "")) {
      return false;
    }

    // Check if mainUrl is or is not a universal link based on supportUniversalLink
    const isUniversalLink =
      typeof mainUrl === "string" &&
      (mainUrl.trim().startsWith("http://") || mainUrl.trim().startsWith("https://"));

    if (supportUniversalLink && !isUniversalLink) {
      return false; // Should be universal link but isn't
    }

    if (!supportUniversalLink && isUniversalLink) {
      return false; // Should not be universal link but is
    }
  }
  // Note: If mainUrl is NOT required, we don't validate it (it will be cleaned up on save)

  // Check if fallbackUrl is required and provided
  if (requireFallbackUrl) {
    if (!fallbackUrl || (typeof fallbackUrl === "string" && fallbackUrl.trim() === "")) {
      return false;
    }
  }
  // Note: If fallbackUrl is NOT required, we don't validate it (it will be cleaned up on save)

  return true;
}

/**
 * Gets detection type requirements for display purposes
 */
export function getDetectionTypeRequirements(detectionType: string): {
  supportUniversalLink: boolean;
  requireMainUrl: boolean;
  requireFallbackUrl: boolean;
} | null {
  if (!detectionType || !(detectionType in DETECTION_TYPE_MAP)) {
    return null;
  }

  const [supportUniversalLink, requireMainUrl, requireFallbackUrl] = DETECTION_TYPE_MAP[detectionType];
  return { supportUniversalLink, requireMainUrl, requireFallbackUrl };
}
