/**
 * Page Interactions Module
 * Handles page navigation, button counting, clicks, and modal dismissal.
 */

import type { Page } from 'playwright-core';
import { BUTTON_CSS_SELECTORS, TIMEOUTS_MS } from '../shared/index.js';

/**
 * Navigate to a URL and wait for DOMContentLoaded and network idle.
 */
export async function gotoAndWait(page: Page, url: string): Promise<void> {
  await page.goto(url, {
    waitUntil: 'networkidle',
    timeout: TIMEOUTS_MS.NAVIGATION_MS,
  });
  // Ensure network is quiet and DOM is ready
  await Promise.all([
    page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS_MS.NAVIGATION_MS }),
    page.waitForLoadState('networkidle', { timeout: TIMEOUTS_MS.NAVIGATION_MS }),
  ]);
}

/**
 * Count visible elements that look like buttons using a union of selectors.
 */
export async function countButtons(page: Page): Promise<number> {
  try {
    const buttons = await page.locator(BUTTON_CSS_SELECTORS).all();

    let visibleCount = 0;
    for (const button of buttons) {
      try {
        const isVisible = await button.isVisible();
        if (isVisible) {
          visibleCount++;
        }
      } catch {
        // Skip elements that might be detached from DOM
      }
    }

    return visibleCount;
  } catch (error) {
    console.warn('Error counting buttons:', error);
    return 0;
  }
}

/**
 * Attempt to dismiss modal overlays that might block button clicks.
 * Common modal patterns include overlays, popups, and cookie banners.
 */
export async function dismissModals(page: Page): Promise<void> {
  try {
    // Common modal overlay selectors
    const modalSelectors = [
      '.modal-backdrop',
      '.overlay',
      '.newmodal_background', // Specific to the error we saw
      '.popup-background',
      '.modal-overlay',
      '[class*="modal"][class*="background"]',
      '[class*="overlay"]'
    ];

    for (const selector of modalSelectors) {
      try {
        const overlays = await page.locator(selector).all();
        for (const overlay of overlays) {
          const isVisible = await overlay.isVisible();
          if (isVisible) {
            console.log(`Attempting to dismiss modal overlay: ${selector}`);
            // Try clicking the overlay to dismiss it
            await overlay.click({ timeout: 2000 });
            await page.waitForTimeout(500);
          }
        }
      } catch {
        // Continue with next selector if this one fails
      }
    }

    // Also try common close button selectors
    const closeSelectors = [
      '[aria-label="Close"]',
      '[title="Close"]',
      '.close',
      '.modal-close',
      '[class*="close"]',
      'button:has-text("Close")',
      'button:has-text("×")',
      'button:has-text("✕")'
    ];

    for (const selector of closeSelectors) {
      try {
        const closeButtons = await page.locator(selector).all();
        for (const closeButton of closeButtons) {
          const isVisible = await closeButton.isVisible();
          if (isVisible) {
            console.log(`Attempting to close modal with: ${selector}`);
            await closeButton.click({ timeout: 2000 });
            await page.waitForTimeout(500);
          }
        }
      } catch {
        // Continue with next selector if this one fails
      }
    }

    // Press Escape key as a fallback to close modals
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  } catch (error) {
    console.log('Error dismissing modals:', error instanceof Error ? error.message : String(error));
  }
}
