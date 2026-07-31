export type ExperimentVariantType = 'landingPages' | 'pixels';

export interface PixelConfig {
  pixelMode: 'global' | 'custom' | 'pftag_prod' | 'pftag_preprod';
  gameId?: string;
  partnerId?: string;
  isTest?: boolean;
  customPixelUrl?: string;
  detectionType?: string;
  mainUrl?: string;
  fallbackUrl?: string;
  customPixelVars?: Array<{ key: string; value: string }> | string;
}

export interface ExperimentVariant {
  name: string;
  weight: number;
  config?: PixelConfig;
}

export interface ExperimentStatsEntry {
  views: number;
  conversions: number;
  conversionRate: number;
}

export type ExperimentStats = Record<string, ExperimentStatsEntry>;

export type FirestoreTimestamp = {
  _seconds?: number;
  _nanoseconds?: number;
  seconds?: number;
  nanoseconds?: number;
  toDate?: () => Date;
} | null;

export type ExperimentVariantPayload =
  | {
    variantType: 'landingPages';
    landingPages: ExperimentVariant[];
    pixels?: never;
  }
  | {
    variantType: 'pixels';
    pixels: ExperimentVariant[];
    landingPages?: never;
  };

export type ExperimentMetadata = ExperimentVariantPayload & {
  experimentName: string;
  description?: string;
  user: string;
  commit: string;
  active: boolean;
  timestamp: string;
  type: 'experiment';
  hashid: string;
  page_name: string;
  lp_json: string;
  Timestamp?: string;
  serverTimestamp?: FirestoreTimestamp | string;
  [key: string]: unknown;
};

export type ExperimentRecord = ExperimentMetadata & {
  id?: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ExperimentHistoryRecord = ExperimentRecord;

export interface ExperimentListRecord {
  page_name: string;
  latest_timestamp?: string | FirestoreTimestamp;
}

export interface ExperimentModel {
  id: string;
  experimentName: string;
  variantType: ExperimentVariantType;
  landingPages: ExperimentVariant[];
  pixels: ExperimentVariant[];
  active: boolean;
  description?: string;
  commit: string;
  hashid: string;
  user?: string;
  createdAt: string;
  updatedAt?: string;
  stats?: ExperimentStats;
  metadata: ExperimentRecord;
}

export type Experiment = ExperimentModel;

export type ExperimentSaveBase = {
  experimentName: string;
  description?: string;
  commit: string;
  user: string;
  active: boolean;
  hashid?: string;
  timestamp?: string;
  extra?: Record<string, unknown>;
};

export type ExperimentSaveLandingPages = ExperimentSaveBase & {
  variantType: 'landingPages';
  landingPages: ExperimentVariant[];
};

export type ExperimentSavePixels = ExperimentSaveBase & {
  variantType: 'pixels';
  pixels: ExperimentVariant[];
};

export type ExperimentSaveParams = ExperimentSaveLandingPages | ExperimentSavePixels;

export interface ExperimentFormPayload {
  experimentName: string;
  variantType: ExperimentVariantType;
  landingPages: ExperimentVariant[];
  pixels: ExperimentVariant[];
  description?: string;
  commit: string;
  active: boolean;
}

export interface ExperimentLandingPage {
  lp: string;
  weight: number;
}

export interface ExperimentPixel extends ExperimentVariant {
  config: PixelConfig;
}

export type CreateExperimentPayload =
  | {
    name: string;
    variantType: 'landingPages';
    landingPages: ExperimentLandingPage[];
  }
  | {
    name: string;
    variantType: 'pixels';
    pixels: ExperimentPixel[];
  };
