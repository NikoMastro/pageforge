import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import {
  PlusIcon,
  XMarkIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type {
  Experiment,
  ExperimentFormPayload,
  ExperimentVariant,
  ExperimentVariantType,
  PixelConfig,
} from '../../../types/experiments';

interface ExperimentConfigProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  experiment?: Experiment | null;
  availableLandingPages: string[];
  onSubmit: (payload: ExperimentFormPayload) => Promise<void>;
  onClose: () => void;
  headerActions?: React.ReactNode;
  allowClose?: boolean;
  defaultCommit?: string;
  isOverlay?: boolean;
}

interface LandingVariantForm {
  id: string;
  name: string;
  weight: number; // percentage 0-100
}

interface PixelVariantForm {
  id: string;
  name: string;
  weight: number; // percentage 0-100
  config: PixelConfig;
}

// const PIXEL_MODE_OPTIONS: Array<{ label: string; value: PixelConfig['pixelMode'] }> = [
//   { label: 'Global Pixel', value: 'global' },
//   { label: 'Custom Pixel', value: 'custom' },
//   { label: 'PfTag (Production)', value: 'pftag_prod' },
//   { label: 'PfTag (Pre-production)', value: 'pftag_preprod' },
// ];

// const DETECTION_TYPE_OPTIONS: string[] = [
//   '',
//   'client_detection',
//   'mobile_app_detection',
//   'iframe_detection',
//   'ios_app_detection',
//   'desktop',
//   'desktop_deep_link',
//   'desktop_iframe',
//   'meta_android',
//   'applovin_android',
//   'x_android',
//   'reddit_android',
//   'tiktok_android',
//   'meta_ios',
//   'applovin_ios',
//   'x_ios',
//   'reddit_ios',
//   'tiktok_ios',
// ];

const DEFAULT_PIXEL_CONFIG: PixelConfig = {
  pixelMode: 'global',
  gameId: '',
  partnerId: '',
  isTest: true,
  customPixelUrl: '',
  detectionType: '',
  mainUrl: '',
  fallbackUrl: '',
  customPixelVars: '',
};

const clonePixelConfig = (config?: PixelConfig): PixelConfig => {
  if (!config) {
    return { ...DEFAULT_PIXEL_CONFIG };
  }
  const customPixelVars = Array.isArray(config.customPixelVars)
    ? JSON.stringify(config.customPixelVars, null, 2)
    : config.customPixelVars ?? '';
  return {
    pixelMode: config.pixelMode ?? 'global',
    gameId: config.gameId ?? '',
    partnerId: config.partnerId ?? '',
    isTest: typeof config.isTest === 'boolean' ? config.isTest : true,
    customPixelUrl: config.customPixelUrl ?? '',
    detectionType: config.detectionType ?? '',
    mainUrl: config.mainUrl ?? '',
    fallbackUrl: config.fallbackUrl ?? '',
    customPixelVars,
  };
};

// const prepareCustomPixelVarsForSave = (
//   value: PixelConfig['customPixelVars']
// ): PixelConfig['customPixelVars'] => {
//   if (!value) return undefined;
//   if (typeof value !== 'string') {
//     return value;
//   }
//   const trimmed = value.trim();
//   if (!trimmed) return undefined;

//   if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
//     try {
//       const parsed = JSON.parse(trimmed);
//       if (Array.isArray(parsed)) {
//         const sanitized = parsed
//           .map((entry) => {
//             if (!entry || typeof entry !== 'object') return null;
//             const raw = entry as Record<string, unknown>;
//             const key = typeof raw.key === 'string' ? raw.key : undefined;
//             const val = typeof raw.value === 'string' ? raw.value : undefined;
//             if (!key) return null;
//             return { key, value: val ?? '' };
//           })
//           .filter((entry): entry is { key: string; value: string } => Boolean(entry));
//         if (sanitized.length > 0) {
//           return sanitized;
//         }
//       }
//     } catch (error) {
//       // Ignore JSON parse errors and fall back to storing the raw string
//     }
//   }

//   return trimmed;
// };

const createInternalId = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`;

const ensureUniqueVariantName = (desired: string, existing: string[]): string => {
  if (!desired.trim()) {
    desired = 'variant';
  }
  const base = desired.trim();
  if (!existing.includes(base)) {
    return base;
  }
  let idx = 2;
  let candidate = `${base}-${idx}`;
  while (existing.includes(candidate)) {
    idx += 1;
    candidate = `${base}-${idx}`;
  }
  return candidate;
};

const ExperimentConfig: React.FC<ExperimentConfigProps> = ({
  mode,
  isOpen,
  experiment,
  availableLandingPages,
  onSubmit,
  onClose,
  headerActions,
  allowClose = true,
  defaultCommit,
  isOverlay = true,
}) => {
  const [experimentName, setExperimentName] = useState('');
  const [description, setDescription] = useState('');
  const [variantType, setVariantType] = useState<ExperimentVariantType>('landingPages');
  const [landingVariants, setLandingVariants] = useState<LandingVariantForm[]>([]);
  const [pixelVariants, setPixelVariants] = useState<PixelVariantForm[]>([]);
  const [commit, setCommit] = useState(defaultCommit ?? (mode === 'create' ? 'create-experiment' : 'update-experiment'));
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [overlayRect, setOverlayRect] = useState<{ left: number; width: number } | null>(null);
  const [showCommitDialog, setShowCommitDialog] = useState(false);

  const activeState = mode === 'edit' ? Boolean(experiment?.active) : false;

  const selectedLandingPages = useMemo(() => landingVariants.map((item) => item.name), [landingVariants]);

  const availableLandingOptions = useMemo(() => {
    const selectedSet = new Set(selectedLandingPages);
    return availableLandingPages.filter((name) => !selectedSet.has(name));
  }, [availableLandingPages, selectedLandingPages]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (mode === 'edit' && experiment) {
      setExperimentName(experiment.experimentName);
      setDescription(experiment.description ?? '');
      setVariantType(experiment.variantType);
      setCommit(defaultCommit ?? 'update-experiment');

      if (experiment.variantType === 'landingPages') {
        const variants = experiment.landingPages.map((lp, index) => ({
          id: createInternalId(`lp-${index}`),
          name: lp.name,
          weight: Math.round(lp.weight),
        }));
        setLandingVariants(variants);
        setPixelVariants([]);
      } else {
        const variants = experiment.pixels.map((px, index) => ({
          id: createInternalId(`px-${index}`),
          name: px.name,
          weight: Math.round(px.weight),
          config: clonePixelConfig(px.config),
        }));
        setPixelVariants(variants);
        setLandingVariants([]);
      }
    }

    if (mode === 'create') {
      setExperimentName('');
      setDescription('');
      setVariantType('landingPages');
      setCommit(defaultCommit ?? 'create-experiment');
      setLandingVariants([]);
      setPixelVariants([]);
    }

    setError(null);
    setSuccessMessage(null);
  }, [mode, experiment, isOpen, defaultCommit]);

  useLayoutEffect(() => {
    if (!isOverlay || !isOpen) {
      return;
    }

    const mainEl = document.querySelector('main');
    if (!mainEl) {
      setOverlayRect(null);
      return;
    }

    const measure = () => {
      const rect = mainEl.getBoundingClientRect();
      setOverlayRect({ left: rect.left, width: rect.width });
    };

    measure();

    const resizeObserver = new ResizeObserver(() => {
      measure();
    });
    resizeObserver.observe(mainEl);

    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('resize', measure);
      resizeObserver.disconnect();
    };
  }, [isOverlay, isOpen]);

  const totalLandingWeight = useMemo(
    () => landingVariants.reduce((sum, variant) => sum + (Number.isFinite(variant.weight) ? variant.weight : 0), 0),
    [landingVariants]
  );

  const totalPixelWeight = useMemo(
    () => pixelVariants.reduce((sum, variant) => sum + (Number.isFinite(variant.weight) ? variant.weight : 0), 0),
    [pixelVariants]
  );

  const handleAddLandingPage = () => {
    const next = availableLandingOptions[0];
    if (!next) {
      setError('No more landing pages available to add.');
      return;
    }

    setLandingVariants((prev) => [
      ...prev,
      {
        id: createInternalId('lp'),
        name: next,
        weight: prev.length > 0 ? Math.round(totalLandingWeight / (prev.length + 1)) : 0,
      },
    ]);
    setError(null);
  };

  const handleLandingPageChange = (id: string, name: string) => {
    setLandingVariants((prev) => prev.map((variant) => (variant.id === id ? { ...variant, name } : variant)));
  };

  const handleLandingWeightChange = (id: string, weight: string) => {
    if (weight === '' || /^\d+$/.test(weight)) {
      const num = weight === '' ? 0 : parseInt(weight, 10);
      setLandingVariants((prev) => prev.map((variant) => (variant.id === id ? { ...variant, weight: num } : variant)));
    }
  };

  const handleRemoveLandingPage = (id: string) => {
    setLandingVariants((prev) => prev.filter((variant) => variant.id !== id));
  };

  const distributeLandingEvenly = () => {
    if (landingVariants.length === 0) return;
    const evenWeight = Math.round(100 / landingVariants.length);
    setLandingVariants((prev) => prev.map((variant) => ({ ...variant, weight: evenWeight })));
  };

  const handleAddPixelVariant = () => {
    const existingNames = pixelVariants.map((variant) => variant.name);
    const nextName = ensureUniqueVariantName('pixel', existingNames);
    setPixelVariants((prev) => [
      ...prev,
      {
        id: createInternalId('px'),
        name: nextName,
        weight: prev.length > 0 ? Math.round(totalPixelWeight / (prev.length + 1)) : 0,
        config: { ...DEFAULT_PIXEL_CONFIG },
      },
    ]);
    setError(null);
  };

  const handlePixelNameChange = (id: string, value: string) => {
    setPixelVariants((prev) => prev.map((variant) => (variant.id === id ? { ...variant, name: value } : variant)));
  };

  const handlePixelWeightChange = (id: string, weight: string) => {
    // Only allow integers (no floats, letters, or other strings)
    if (weight === '' || /^\d+$/.test(weight)) {
      const num = weight === '' ? 0 : parseInt(weight, 10);
      setPixelVariants((prev) => prev.map((variant) => (variant.id === id ? { ...variant, weight: num } : variant)));
    }
  };

  const handlePixelConfigChange = (id: string, patch: Partial<PixelConfig>) => {
    setPixelVariants((prev) =>
      prev.map((variant) =>
        variant.id === id
          ? {
            ...variant,
            config: {
              ...variant.config,
              ...patch,
            },
          }
          : variant
      )
    );
  };

  const handleRemovePixelVariant = (id: string) => {
    setPixelVariants((prev) => prev.filter((variant) => variant.id !== id));
  };

  const distributePixelsEvenly = () => {
    if (pixelVariants.length === 0) return;
    const evenWeight = Math.round(100 / pixelVariants.length);
    setPixelVariants((prev) => prev.map((variant) => ({ ...variant, weight: evenWeight })));
  };

  const buildLandingPayload = (): ExperimentVariant[] => {
    const total = landingVariants.reduce((sum, item) => sum + (Number.isFinite(item.weight) ? item.weight : 0), 0);
    return landingVariants.map((variant) => {
      const normalizedWeight = total > 0 ? (variant.weight / total) * 100 : 0;
      return {
        name: variant.name,
        weight: Math.round(normalizedWeight),
      } satisfies ExperimentVariant;
    });
  };

  const buildPixelPayload = (): ExperimentVariant[] => {
    const total = pixelVariants.reduce((sum, item) => sum + (Number.isFinite(item.weight) ? item.weight : 0), 0);
    return pixelVariants.map((variant) => {
      const normalizedWeight = total > 0 ? (variant.weight / total) * 100 : 0;
      return {
        name: variant.name,
        weight: Math.round(normalizedWeight),
        // Config is optional for experiments - only name and weight are required
      } satisfies ExperimentVariant;
    });
  };

  const validateLandingPayload = (): string | null => {
    if (landingVariants.length < 1) return 'An experiment must have at least 1 landing page.';
    const total = landingVariants.reduce((sum, variant) => sum + (Number.isFinite(variant.weight) ? variant.weight : 0), 0);
    if (total <= 0) return 'Total distribution must be greater than 0.';
    const names = landingVariants.map((variant) => variant.name.trim());
    if (names.some((name) => !name)) return 'Each landing page must be selected.';
    const unique = new Set(names);
    if (unique.size !== names.length) return 'Landing page selections must be unique.';
    return null;
  };

  const validatePixelPayload = (): string | null => {
    if (pixelVariants.length < 1) return 'Add at least 1 pixel configuration to run an experiment.';
    const total = pixelVariants.reduce((sum, variant) => sum + (Number.isFinite(variant.weight) ? variant.weight : 0), 0);
    if (total <= 0) return 'Total pixel distribution must be greater than 0.';

    const names = pixelVariants.map((variant) => variant.name.trim());
    if (names.some((name) => !name)) return 'Each pixel configuration requires a name.';
    const unique = new Set(names);
    if (unique.size !== names.length) return 'Pixel configuration names must be unique.';

    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!experimentName.trim()) {
      setError('Experiment name is required.');
      setSuccessMessage(null);
      return;
    }

    let validationError: string | null = null;

    if (variantType === 'landingPages') {
      validationError = validateLandingPayload();
      if (!validationError) {
        buildLandingPayload();
      }
    } else {
      validationError = validatePixelPayload();
      if (!validationError) {
        buildPixelPayload();
      }
    }

    if (validationError) {
      setError(validationError);
      setSuccessMessage(null);
      return;
    }

    // Show commit dialog instead of submitting directly
    setError(null);
    setSuccessMessage(null);
    setShowCommitDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!experimentName.trim()) return;

    let validationError: string | null = null;
    let landingPayload: ExperimentVariant[] = [];
    let pixelPayload: ExperimentVariant[] = [];

    if (variantType === 'landingPages') {
      validationError = validateLandingPayload();
      if (!validationError) {
        landingPayload = buildLandingPayload();
      }
    } else {
      validationError = validatePixelPayload();
      if (!validationError) {
        pixelPayload = buildPixelPayload();
      }
    }

    if (validationError) {
      setError(validationError);
      setSuccessMessage(null);
      setShowCommitDialog(false);
      return;
    }

    const payload: ExperimentFormPayload = {
      experimentName: experimentName.trim(),
      variantType,
      landingPages: landingPayload,
      pixels: pixelPayload,
      description: description.trim() ? description.trim() : undefined,
      commit: commit.trim() ? commit.trim() : mode === 'create' ? 'create-experiment' : 'update-experiment',
      active: activeState,
    };

    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      await onSubmit(payload);
      setSuccessMessage(mode === 'create' ? 'Experiment created successfully.' : 'Experiment updated successfully.');
      setShowCommitDialog(false);
      if (mode === 'create') {
        // Reset form to allow rapid creation
        setLandingVariants([]);
        setPixelVariants([]);
        setExperimentName('');
        setDescription('');
        setVariantType('landingPages');
      }
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : 'Unable to save experiment.';
      setError(message);
      setSuccessMessage(null);
      setShowCommitDialog(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  const disableVariantSwitch = mode === 'edit';

  const defaultPanelOffset = '16rem';
  const overlayLeft = overlayRect ? `${Math.max(0, Math.floor(overlayRect.left))}px` : defaultPanelOffset;
  const overlayWidth = overlayRect ? `${Math.max(0, Math.floor(overlayRect.width))}px` : `calc(100vw - ${defaultPanelOffset})`;
  const overlayStyle = isOverlay ? ({ left: overlayLeft, width: overlayWidth } as React.CSSProperties) : undefined;

  const overlayWrapperClass = isOverlay
    ? 'fixed top-0 bottom-0 z-[70] flex h-full min-h-0 flex-col transform transition-all duration-200 ease-out translate-x-0 opacity-100'
    : 'relative flex h-full min-h-full flex-col';

  const panelWrapperClass = isOverlay
    ? 'flex h-full w-full flex-1 flex-col overflow-hidden border-l border-gray-800 bg-gray-900 shadow-2xl min-h-0'
    : 'relative mx-auto flex h-full w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-2xl border border-gray-800/80 bg-gray-900/95 shadow-2xl min-h-0';

  return (
    <>
      {isOverlay && (
        <div
          className="fixed top-0 bottom-0 z-[60] bg-gray-950/70 backdrop-blur-sm transition-opacity duration-200"
          style={overlayStyle}
          role="presentation"
          onClick={() => {
            if (!allowClose) return;
            onClose();
          }}
        />
      )}
      <div className={overlayWrapperClass} style={overlayStyle}>
        <div className={panelWrapperClass}>
          <form onSubmit={handleSubmit} className="flex h-full flex-1 min-h-0 flex-col overflow-hidden">
            <div className="flex flex-1 min-h-0 flex-col">
              <header className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {mode === 'create' ? 'Create Experiment' : 'Edit Experiment'}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {variantType === 'landingPages'
                      ? 'Configure landing page distribution and metadata.'
                      : 'Configure pixel variants, distribution, and metadata.'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${activeState ? 'bg-green-900/60 text-green-300' : 'bg-gray-800 text-gray-300'
                      }`}
                  >
                    {activeState ? 'Active' : 'Inactive'}
                  </span>
                  {headerActions}
                  {allowClose && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="inline-flex items-center rounded-md border border-gray-700 px-3 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
                    >
                      Close
                    </button>
                  )}
                </div>
              </header>

              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-8">
                {error && (
                  <div className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {successMessage}
                  </div>
                )}

                <section className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300" htmlFor="experiment-name">
                        Experiment Name
                      </label>
                      <input
                        id="experiment-name"
                        type="text"
                        value={experimentName}
                        onChange={(event) => setExperimentName(event.target.value)}
                        disabled={mode === 'edit'}
                        className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-70"
                        placeholder="e.g., Global vs Custom Pixel"
                      />
                      {mode === 'edit' && (
                        <p className="text-xs text-gray-500">
                          Experiment name cannot be changed once created.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-300">
                        Experiment Type
                      </label>
                      <div className="flex overflow-hidden rounded-md border border-gray-700 bg-gray-800">
                        {(['landingPages', 'pixels'] as ExperimentVariantType[]).map((type) => {
                          const isActive = variantType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                if (disableVariantSwitch) return;
                                setVariantType(type);
                                setError(null);
                                setSuccessMessage(null);
                              }}
                              disabled={disableVariantSwitch}
                              className={`flex-1 px-3 py-2 text-sm font-medium transition ${isActive
                                ? 'bg-indigo-600 text-white shadow-inner'
                                : 'text-gray-400 hover:text-gray-200'
                                } ${disableVariantSwitch ? 'cursor-not-allowed opacity-60' : ''}`}
                            >
                              {type === 'landingPages' ? 'Landing Pages' : 'Pixels'}
                            </button>
                          );
                        })}
                      </div>
                      {disableVariantSwitch && (
                        <p className="text-xs text-gray-500">
                          Experiment type is locked after creation.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300" htmlFor="experiment-description">
                      Description (optional)
                    </label>
                    <textarea
                      id="experiment-description"
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      placeholder="Short description for this experiment"
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Variant Distribution</h3>
                      <p className="text-sm text-gray-400">
                        {variantType === 'landingPages'
                          ? 'Select landing pages and define their traffic share.'
                          : 'Configure pixel variants, scripts, and distribution weights.'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={variantType === 'landingPages' ? distributeLandingEvenly : distributePixelsEvenly}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-xs font-medium text-gray-200 transition hover:border-gray-500 hover:text-white"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                        Distribute Evenly
                      </button>
                      {variantType === 'landingPages' ? (
                        <button
                          type="button"
                          onClick={handleAddLandingPage}
                          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Add Landing Page
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleAddPixelVariant}
                          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500"
                        >
                          <PlusIcon className="h-4 w-4" />
                          Add Pixel Variant
                        </button>
                      )}
                    </div>
                  </div>

                  {variantType === 'landingPages' ? (
                    <div className="space-y-3">
                      {landingVariants.length === 0 && (
                        <div className="rounded-md border border-dashed border-gray-700 bg-gray-800/60 px-4 py-6 text-center text-sm text-gray-400">
                          No landing pages selected yet. Add at least one to configure the experiment.
                        </div>
                      )}

                      {landingVariants.map((variant) => (
                        <div
                          key={variant.id}
                          className="flex flex-col gap-3 rounded-lg border border-gray-800 bg-gray-800/80 p-4 shadow-sm md:flex-row md:items-center"
                        >
                          <div className="flex-1">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Landing Page
                            </label>
                            <select
                              value={variant.name}
                              onChange={(event) => handleLandingPageChange(variant.id, event.target.value)}
                              className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            >
                              <option value="" disabled>
                                Select a landing page
                              </option>
                              {[variant.name, ...availableLandingOptions].filter((value, index, self) => value && self.indexOf(value) === index).map((nameOption) => (
                                <option key={nameOption} value={nameOption}>
                                  {nameOption}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-end gap-3">
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Weight
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                value={variant.weight}
                                onChange={(event) => handleLandingWeightChange(variant.id, event.target.value)}
                                className="mt-1 w-28 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                placeholder="0"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveLandingPage(variant.id)}
                              className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pixelVariants.length === 0 && (
                        <div className="rounded-md border border-dashed border-gray-700 bg-gray-800/60 px-4 py-6 text-center text-sm text-gray-400">
                          No pixel variants defined yet. Add at least one configuration.
                        </div>
                      )}

                      {pixelVariants.map((variant) => (
                        <div key={variant.id} className="space-y-4 rounded-xl border border-gray-800 bg-gray-800/80 p-4 shadow-sm">
                          <div className="flex flex-col gap-3 md:flex-row md:items-end">
                            <div className="flex-1">
                              <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Variant Name
                              </label>
                              <input
                                type="text"
                                value={variant.name}
                                onChange={(event) => handlePixelNameChange(variant.id, event.target.value)}
                                className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                placeholder="e.g., Global-20"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
                                Weight
                              </label>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                value={variant.weight}
                                onChange={(event) => handlePixelWeightChange(variant.id, event.target.value)}
                                className="mt-1 w-28 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                placeholder="0"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemovePixelVariant(variant.id)}
                              className="inline-flex items-center justify-center rounded-md border border-transparent bg-red-500/10 p-2 text-red-300 transition hover:bg-red-500/20 hover:text-red-200"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>

                          {/* All pixel configuration fields removed - only name and weight remain */}
                          <div className="space-y-2 hidden">
                            <label className="text-xs font-medium uppercase tracking-wide text-gray-400">
                              Custom Pixel Vars (JSON or text)
                            </label>
                            <textarea
                              rows={3}
                              value={typeof variant.config.customPixelVars === 'string' ? variant.config.customPixelVars : ''}
                              onChange={(event) => handlePixelConfigChange(variant.id, { customPixelVars: event.target.value })}
                              className="w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                              placeholder='e.g., [{"key": "foo", "value": "bar"}] or raw text'
                            />
                            <p className="text-xs text-gray-500">
                              Provide an array of key/value objects or raw text. Leave empty if unused.
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>

              <footer className="flex items-center justify-between border-t border-gray-800 bg-gray-900/80 px-6 py-4">
                <div className="text-xs text-gray-500">
                  Changes are saved to Firestore under the experiments collection.
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                    {mode === 'create' ? 'Create Experiment' : 'Save Changes'}
                  </button>
                </div>
              </footer>
            </div>
          </form>
        </div>
      </div>

      {/* Commit Message Dialog */}
      {showCommitDialog && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
          <div className="absolute inset-0 backdrop-blur-sm bg-black/50" onClick={() => setShowCommitDialog(false)} />
          <div className="relative z-10 w-full max-w-md rounded-lg border border-gray-600 bg-gray-700 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Commit Message</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Enter a commit message for this change
                </label>
                <input
                  type="text"
                  value={commit}
                  onChange={(event) => setCommit(event.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  placeholder={mode === 'create' ? 'create-experiment' : 'update-experiment'}
                  autoFocus
                />
                <p className="mt-2 text-xs text-gray-500">Used for version history in Firestore.</p>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCommitDialog(false)}
                  className="rounded-md border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                  {mode === 'create' ? 'Create Experiment' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExperimentConfig;
