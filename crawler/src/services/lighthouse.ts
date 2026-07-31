import lighthouse from 'lighthouse';
import { LIGHTHOUSE_CATEGORY_KEYS, LIGHTHOUSE_AUDIT_METRIC_KEYS } from '../shared/index.js';
import type { LighthouseDataSchema } from '../shared/index.js';
import type { z } from 'zod';

export interface LighthouseOptions {
  url: string;
  port: number;
  generateHtmlReport?: boolean;
}

/**
 * Run Lighthouse using an existing Chromium instance exposed via the given port.
 * Returns selected category scores (0-100), core metrics, and an optional HTML report path.
 */
export async function runLighthouse(
  options: LighthouseOptions
): Promise<z.infer<typeof LighthouseDataSchema>> {
  const { url, port, generateHtmlReport = false } = options;

  const lighthouseOptions = {
    logLevel: 'error' as const,
    output: (generateHtmlReport ? ['json', 'html'] : ['json']) as ('json' | 'html')[],
    onlyCategories: [...LIGHTHOUSE_CATEGORY_KEYS],
    port,
    chromeFlags: ['--headless'],
    // Increase timeouts to prevent PROTOCOL_TIMEOUT errors
    maxWaitForFcp: 30000,
    maxWaitForLoad: 45000,
    // Disable CPU throttling in cloud environment
    throttlingMethod: 'provided' as const,
  };

  try {
    const runnerResult = await lighthouse(url, lighthouseOptions);

    if (!runnerResult?.lhr) {
      throw new Error('Lighthouse failed to generate report');
    }

    const { lhr, report } = runnerResult;

    const scores: Record<string, number> = {};
    for (const category of LIGHTHOUSE_CATEGORY_KEYS) {
      const categoryData = lhr.categories[category];
      const score = categoryData?.score ?? 0;
      scores[category] = Math.round(score * 100);
    }

    const audits: Record<string, number> = {};
    for (const auditName of LIGHTHOUSE_AUDIT_METRIC_KEYS) {
      const audit = lhr.audits[auditName];
      if (audit?.numericValue !== undefined) {
        audits[auditName] = audit.numericValue;
      } else {
        audits[auditName] = 0;
      }
    }

    let rawReportHtmlPath: string | null = null;
    if (generateHtmlReport && Array.isArray(report) && typeof report[1] === 'string') {
      try {
        const fs = await import('fs');
        const path = '/tmp/lighthouse-report.html';
        fs.writeFileSync(path, report[1]);
        rawReportHtmlPath = path;
      } catch (error) {
        console.warn('Failed to write HTML report:', error);
      }
    }

    return {
      scores: scores as any,
      audits: audits as any,
      rawReportHtmlPath,
    };
  } catch (error) {
    console.error('Lighthouse error:', error);
    // Return empty scores on timeout or error instead of crashing
    return {
      scores: {
        performance: 0,
        accessibility: 0,
        'best-practices': 0,
        seo: 0,
        pwa: 0,
      } as any,
      audits: {
        'first-contentful-paint': 0,
        'largest-contentful-paint': 0,
        'cumulative-layout-shift': 0,
        'total-blocking-time': 0,
        'speed-index': 0,
      } as any,
      rawReportHtmlPath: null,
    };
  }
}
