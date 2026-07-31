export function slugify(raw: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function isValidSlug(raw: string): boolean {
  if (!raw) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(raw);
}

export const sanitizeFilename = slugify;
export const sanitizeFolderName = slugify;
