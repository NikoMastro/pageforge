import type { DiffSummary, LpJson } from '../types/config.types';

export function computeDiffSummary(prev: LpJson | null, next: LpJson): DiffSummary {
  const prevData = prev ? prev.data : null;
  const nextData = next.data;
  const added: string[] = [];
  const modified: string[] = [];
  const removed: string[] = [];

  const walk = (p: any, n: any, path: string) => {
    if (p === undefined && n === undefined) return;
    if (p === undefined) {
      collectAll(n, path, added);
      return;
    }
    if (n === undefined) {
      collectAll(p, path, removed);
      return;
    }
    if (isPrimitive(p) && isPrimitive(n)) {
      if (p !== n) modified.push(path);
      return;
    }
    if (Array.isArray(p) && Array.isArray(n)) {
      const len = Math.max(p.length, n.length);
      for (let i = 0; i < len; i++) {
        const childPath = path ? `${path}[${i}]` : `[${i}]`;
        if (i >= p.length) collectAll(n[i], childPath, added);
        else if (i >= n.length) collectAll(p[i], childPath, removed);
        else walk(p[i], n[i], childPath);
      }
      return;
    }
    if (typeof p === 'object' && typeof n === 'object') {
      const keys = new Set([...Object.keys(p), ...Object.keys(n)]);
      for (const k of keys) {
        const childPath = path ? `${path}.${k}` : k;
        walk(p[k], n[k], childPath);
      }
      return;
    }
    modified.push(path);
  };

  const collectAll = (val: any, base: string, bucket: string[]) => {
    if (isPrimitive(val) || val === null) {
      bucket.push(base);
      return;
    }
    if (Array.isArray(val)) {
      if (val.length === 0) bucket.push(base);
      val.forEach((item, idx) => collectAll(item, `${base}[${idx}]`, bucket));
      return;
    }
    if (typeof val === 'object') {
      const keys = Object.keys(val);
      if (keys.length === 0) bucket.push(base);
      keys.forEach(k => collectAll(val[k], `${base}.${k}`.replace(/^\./, ''), bucket));
      return;
    }
    bucket.push(base);
  };

  const isPrimitive = (v: any) => v === null || ['string', 'number', 'boolean'].includes(typeof v);

  if (!prevData) {
    collectAll(nextData, '', added);
    added.push('schema_version', 'pageforge_version_hash');
    return normalize({ added, modified, removed });
  }

  if (prev && prev.schema_version !== next.schema_version) modified.push('schema_version');
  if (prev && prev.pageforge_version_hash !== next.pageforge_version_hash) modified.push('pageforge_version_hash');

  walk(prevData, nextData, '');
  return normalize({ added, modified, removed });
}

function normalize(diff: DiffSummary): DiffSummary {
  const norm = (arr: string[]) => Array.from(new Set(arr.filter(p => p !== ''))).sort();
  return { added: norm(diff.added), modified: norm(diff.modified), removed: norm(diff.removed) };
}
