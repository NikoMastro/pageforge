import { pageforgeApi, parseJsonWithFallback } from '../api';
import type { LandingPageRecord } from '../api';
import { deploymentCacheUrl, publicDeployBaseUrl } from '../config/config';

interface DeploymentCacheEntry {
  deployed: boolean;
  url?: string;
  deployPath?: string;
  lastChecked: number;
  deployedAt?: number;
}

interface DeploymentCache {
  deployedPages: Record<string, DeploymentCacheEntry>;
  lastUpdated: number | null;
  version: string;
}

export interface DeploymentStatus {
  deployed: boolean;
  folderName?: string;
  deployPath?: string;
  estimatedUrl?: string;
  message: string;
  lastChecked?: number;
  deployedAt?: number;
}

export class DeploymentCacheService {
  private cache: DeploymentCache | null = null;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_RETRIES = 3;
  private pendingRequests = new Map<string, Promise<DeploymentCacheEntry>>();

  async getCache(): Promise<DeploymentCache> {
    if (this.cache) {
      return this.cache;
    }

    // 1. Try localStorage first (fast & no network noise)
    try {
      const ls = localStorage.getItem('deployment-cache');
      if (ls) {
        this.cache = parseJsonWithFallback(ls, 'deploymentCache:localStorage', null);
      }
    } catch { /* ignore privacy mode / disabled storage */ }

    // 2. Optionally attempt remote fetch ONLY if an explicit env var is provided.
    //    This avoids constant 404s in dev where the file does not exist.
    //    Configure by adding VITE_DEPLOYMENT_CACHE_URL to a .env file if you host a JSON snapshot.
    const remoteUrl = deploymentCacheUrl;
    if (!this.cache && remoteUrl) {
      try {
        const response = await fetch(remoteUrl, { cache: 'no-store' });
        if (response.ok) {
          try {
            const text = await response.text();
            this.cache = parseJsonWithFallback(text, 'deploymentCache:remote', null);
          } catch (e) {
            console.warn('[deploymentCache] Failed to read remote body:', e);
          }
        } else if (response.status !== 404) {
          console.warn(`[deploymentCache] Remote non OK: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.warn('[deploymentCache] Remote fetch failed:', error);
      }
    }

    if (!this.cache) {
      this.cache = {
        deployedPages: {},
        lastUpdated: null,
        version: "1.0"
      };
    }

    return this.cache;
  }

  async saveCache(): Promise<void> {
    if (!this.cache) return;

    try {
      // In a real application, you'd save this to a backend or localStorage
      // For now, we'll just update the in-memory cache
      this.cache.lastUpdated = Date.now();

      // Optional: Save to localStorage as backup
      try { localStorage.setItem('deployment-cache', JSON.stringify(this.cache)); } catch { /* storage quota or disabled */ }
    } catch (error) {
      console.warn('Could not save deployment cache:', error);
    }
  }

  async getDeploymentStatus(configName: string): Promise<DeploymentCacheEntry> {
    // Check if there's already a pending request for this config
    if (this.pendingRequests.has(configName)) {
      return this.pendingRequests.get(configName)!;
    }

    const cache = await this.getCache();
    const cached = cache.deployedPages[configName];
    const now = Date.now();

    // Return cached result if still valid
    if (cached && (now - cached.lastChecked) < this.CACHE_DURATION) {
      return cached;
    }

    // Create a promise for the API request
    const requestPromise = this.fetchDeploymentStatus(configName);
    this.pendingRequests.set(configName, requestPromise);

    try {
      const result = await requestPromise;

      // Update cache
      cache.deployedPages[configName] = result;
      await this.saveCache();

      return result;
    } finally {
      // Clean up pending request
      this.pendingRequests.delete(configName);
    }
  }

  private async fetchDeploymentStatus(configName: string): Promise<DeploymentCacheEntry> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        // Attempt to retrieve a specific landing page record
        let page: LandingPageRecord | null = null;
        try {
          page = await pageforgeApi.getLandingPageLatest(configName);
        } catch {
          page = null;
        }

        if (page) {
          const base = publicDeployBaseUrl;
          const cleanBase = base ? base.replace(/\/$/, '') : undefined;
          const derivedUrl = cleanBase ? `${cleanBase}/${page.page_name}/` : undefined;
          return {
            deployed: true, // We assume presence in Firestore implies at least one deployment historically
            url: derivedUrl, // May be undefined if no base URL configured
            deployPath: `/deployed/${page.hashid}`,
            lastChecked: Date.now(),
            deployedAt: Date.now(),
          };
        }
        return { deployed: false, lastChecked: Date.now() };
      } catch (error) {
        lastError = error as Error;

        if (attempt < this.MAX_RETRIES) {
          // Exponential backoff: wait 1s, then 2s, then 4s
          const delay = Math.pow(2, attempt - 1) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // If all retries failed, return a cached result or default
    console.warn(`Failed to check deployment status for ${configName} after ${this.MAX_RETRIES} attempts:`, lastError);

    const cache = await this.getCache();
    const cached = cache.deployedPages[configName];

    return cached || {
      deployed: false,
      lastChecked: Date.now(),
    };
  }

  async getMultipleDeploymentStatuses(configNames: string[]): Promise<Record<string, DeploymentCacheEntry>> {
    const results: Record<string, DeploymentCacheEntry> = {};

    // Process requests in batches to avoid overwhelming the server
    const batchSize = 3;
    for (let i = 0; i < configNames.length; i += batchSize) {
      const batch = configNames.slice(i, i + batchSize);
      const batchPromises = batch.map(name =>
        this.getDeploymentStatus(name).then(status => ({ name, status }))
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        const configName = batch[index];
        if (result.status === 'fulfilled') {
          results[configName] = result.value.status;
        } else {
          console.warn(`Failed to get status for ${configName}:`, result.reason);
          results[configName] = {
            deployed: false,
            lastChecked: Date.now(),
          };
        }
      });

      // Small delay between batches
      if (i + batchSize < configNames.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  async invalidateCache(configName?: string): Promise<void> {
    const cache = await this.getCache();

    if (configName) {
      // Remove specific entry
      delete cache.deployedPages[configName];
    } else {
      // Clear entire cache
      cache.deployedPages = {};
    }

    await this.saveCache();
  }

  async markAsDeployed(configName: string, url: string, deployPath?: string): Promise<void> {
    const cache = await this.getCache();

    cache.deployedPages[configName] = {
      deployed: true,
      url,
      deployPath,
      lastChecked: Date.now(),
      deployedAt: Date.now(),
    };

    await this.saveCache();
  }

  async markAsDeleted(configName: string): Promise<void> {
    await this.invalidateCache(configName);
  }

  // ---------------- Unified status methods ----------------

  async checkDeploymentStatus(configName: string): Promise<DeploymentStatus> {
    const entry = await this.getDeploymentStatus(configName);
    return this.entryToStatus(configName, entry);
  }

  async checkMultipleDeployments(configNames: string[]): Promise<Record<string, DeploymentStatus>> {
    const entries = await this.getMultipleDeploymentStatuses(configNames);
    const result: Record<string, DeploymentStatus> = {};
    Object.entries(entries).forEach(([name, entry]) => { result[name] = this.entryToStatus(name, entry); });
    return result;
  }

  openDeployedPage(url: string): void { try { if (url) window.open(url, '_blank', 'noopener,noreferrer'); } catch (e) { console.error('Failed to open deployed page:', e); } }
  async copyDeploymentUrl(url: string): Promise<void> { try { await navigator.clipboard.writeText(url); } catch (e) { console.error('Failed to copy URL:', e); throw e; } }

  private entryToStatus(configName: string, entry: DeploymentCacheEntry): DeploymentStatus {
    return {
      deployed: entry.deployed,
      folderName: configName,
      deployPath: entry.deployPath,
      estimatedUrl: entry.url,
      message: entry.deployed ? 'Configuration is deployed' : 'Configuration not found or not deployed',
      lastChecked: entry.lastChecked,
      deployedAt: entry.deployedAt,
    };
  }
}

export const deploymentCacheService = new DeploymentCacheService();
