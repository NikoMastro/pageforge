
export type UrlCandidate = {
  label: string;
  value: string | undefined | null;
  allowRelative?: boolean;
};

export interface UrlValidationOptions {
  allowSchemes?: string[];
}

const DEFAULT_ALLOWED_SCHEMES = [
  'http',
  'https',
  'steam',
  'steammobile',
  'com.epicgames.launcher',
  'psapp',
];

export function isValidUrlOptional(
  raw: string | undefined | null,
  opts?: UrlValidationOptions & { allowRelative?: boolean }
): boolean {
  const value = (raw ?? '').trim();
  if (!value) return true; // blank is OK

  if (opts?.allowRelative) {
    if (value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) return true;
  }

  try {
    const u = new URL(value);
    const scheme = u.protocol.replace(/:$/, '');
    const allowed = (opts?.allowSchemes && opts.allowSchemes.length > 0)
      ? opts.allowSchemes
      : DEFAULT_ALLOWED_SCHEMES;
    if (!allowed.includes(scheme)) return false;
    if ((scheme === 'http' || scheme === 'https') && !u.hostname) return false;
    return true;
  } catch {
    return false;
  }
}

export function collectInvalidUrls(
  items: UrlCandidate[],
  opts?: UrlValidationOptions
): UrlCandidate[] {
  const out: UrlCandidate[] = [];
  for (const it of items) {
    const allowRelative = !!it.allowRelative;
    const ok = isValidUrlOptional(it.value ?? '', { ...opts, allowRelative });
    if (!ok) out.push(it);
  }
  return out;
}
