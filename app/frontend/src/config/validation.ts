import type { CreateConfigRequest } from '../types/config.types';
import { isValidSlug } from '../utils/slug';

export interface ValidationResult { valid: boolean; errors: string[] }

export function validateConfig(config: CreateConfigRequest): ValidationResult {
  const errors: string[] = [];

  if (!config.page_name || config.page_name.trim().length === 0) errors.push('page_name is required');
  else if (config.page_name.length > 100) errors.push('page_name must be < 100 chars');
  else if (!isValidSlug(config.page_name)) errors.push('page_name must be lowercase, use only a-z, 0-9 and hyphens');

  if (!config.landingPageData) errors.push('landingPageData missing');
  else {
    if (!Array.isArray((config.landingPageData as any).sections)) errors.push('landingPageData.sections must be an array');
  }

  if (!config.htmlConfig) errors.push('htmlConfig missing');
  else {
    if (config.htmlConfig.pixelMode && config.htmlConfig.pixelMode !== 'none') {
      if (!config.htmlConfig.gameId) errors.push('htmlConfig.gameId required when pixelMode enabled');
    }
  }

  if (!config.commit) errors.push('commit required');
  if (!config.user) errors.push('user required');
  if (!config.type) errors.push('type required');

  return { valid: errors.length === 0, errors };
}
