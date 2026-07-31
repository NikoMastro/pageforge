export interface LanguageConfig {
  code: string;
  cc: string | null;
  name?: string;
  buttonWidths: {
    buy: number;
    install: number;
    wishlist: number;
  };
}

/**
 * Browser language to Steam language mapping
 */
export const BROWSER_LANG_MAPPING: Record<string, string> = {
  'en': 'english',
  'en-us': 'english',
  'pt': 'portuguese',
  'pt-br': 'portuguese',
  'es': 'spanish',
  'es-es': 'spanish',
  'zh': 'chinese',
  'zh-cn': 'chinese',
  'fr': 'french',
  'fr-fr': 'french',
  'de': 'german',
  'de-de': 'german',
  'ru': 'russian',
  'ru-ru': 'russian'
};

/**
 * Complete language configuration with button dimensions for all widget types
 */
export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
  'english': {
    code: 'english',
    cc: null,
    name: '🇺🇸 English',
    buttonWidths: {
      buy: 112,
      install: 102,
      wishlist: 139
    }
  },
  'portuguese': {
    code: 'portuguese',
    cc: 'br',
    name: '🇧🇷 Portuguese (Brazil)',
    buttonWidths: {
      buy: 144,
      install: 101,
      wishlist: 205
    }
  },
  'spanish': {
    code: 'spanish',
    cc: 'es',
    name: '🇪🇸 Spanish',
    buttonWidths: {
      buy: 144,
      install: 110,
      wishlist: 205
    }
  },
  'chinese': {
    code: 'chinese',
    cc: 'cn',
    name: '🇨🇳 Chinese (Simplified)',
    buttonWidths: {
      buy: 127,
      install: 101,
      wishlist: 137
    }
  },
  'french': {
    code: 'french',
    cc: 'fr',
    name: '🇫🇷 French',
    buttonWidths: {
      buy: 142,
      install: 113,
      wishlist: 251
    }
  },
  'german': {
    code: 'german',
    cc: 'de',
    name: '🇩🇪 German',
    buttonWidths: {
      buy: 136,
      install: 128,
      wishlist: 245
    }
  },
  'russian': {
    code: 'russian',
    cc: 'ru',
    name: '🇷🇺 Russian',
    buttonWidths: {
      buy: 101,
      install: 131,
      wishlist: 113
    }
  }
};

/**
 * Default language fallback
 */
export const DEFAULT_LANGUAGE = 'english';

/**
 * Get all available languages as an array
 */
export const getAvailableLanguages = (): LanguageConfig[] => {
  return Object.values(LANGUAGE_CONFIGS);
};

/**
 * Detect language from browser or use provided language
 */
export const detectLanguage = (providedLanguage?: string | null): string => {
  // Handle empty string, null, undefined - all should trigger detection
  const lang = providedLanguage && providedLanguage.trim() !== '' ? providedLanguage : null;

  if (lang && LANGUAGE_CONFIGS[lang]) {
    return lang;
  }

  // Browser detection
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;

  const browserLang = navigator.language.toLowerCase();
  const detected = BROWSER_LANG_MAPPING[browserLang] ||
                   BROWSER_LANG_MAPPING[browserLang.split('-')[0]] ||
                   DEFAULT_LANGUAGE;

  return detected;
};


export const getLanguageConfig = (languageCode: string): LanguageConfig => {
  return LANGUAGE_CONFIGS[languageCode] || LANGUAGE_CONFIGS[DEFAULT_LANGUAGE];
};


export const getButtonWidth = (
  languageCode: string,
  widgetType: 'buy' | 'install' | 'wishlist'
): number => {
  const config = getLanguageConfig(languageCode);
  return config.buttonWidths[widgetType];
};
