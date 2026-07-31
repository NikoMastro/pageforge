/**
 * Shared types and interfaces for the crawler services.
 * This module contains all type definitions used across the crawler system.
 */

import type { Browser, Page, BrowserContext } from 'playwright-core';
import type { ChildProcess } from 'node:child_process';

// ==========================================
// Browser Management Types
// ==========================================

export interface BrowserInstance {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  debuggingPort: number;
  chromeProcess?: ChildProcess;
}

// ==========================================
// Iframe Analysis Types
// ==========================================

export interface WidgetUTM {
  source?: string;
  campaign?: string;
  medium?: string;
  content?: string;
  term?: string;
}

export interface WidgetProps {
  gameId?: string;
  enabled?: boolean;
  type?: string;
  utm?: WidgetUTM;
}

export interface IframeDetail {
  id: string | null;
  name: string | null;
  src: string | null;
  title: string | null;
  width: number;
  height: number;
  isVisible: boolean;
  widgetProps?: WidgetProps | null;
}

export interface IframeAnalysis {
  total: number;
  visible: number;
  details: IframeDetail[];
}

// ==========================================
// Capture Services Types (Gghst, Redirect)
// ==========================================

export interface GghstInfo {
  found: boolean;
  url?: string;
  scriptName?: string;
  method?: string;
  status?: number;
  ok?: boolean;
  error?: string;
  bigQueryMessage?: string;
}

export interface RedirectInfo {
  occurred: boolean;
  fromUrl?: string;
  toUrl?: string;
  statusCode?: number;
}

export interface CombinedButtonClickResult {
  gghst: GghstInfo;
  redirect: RedirectInfo;
}

// ==========================================
// X Pixel (Twitter/X) Types
// ==========================================

export interface XPixelEvent {
  eventType: string;
  timestamp: number;
  parameters?: Record<string, any>;
  source?: string;
}

export interface XPixelInfo {
  found: boolean;
  pixelId?: string;
  loadTime?: number;
  pageUrl?: string;
  events?: XPixelEvent[];
  errors?: string[];
}

// ==========================================
// TikTok Pixel Types
// ==========================================

export interface TikTokPixelEvent {
  eventType: string;
  timestamp: number;
  parameters?: Record<string, any>;
  source?: string;
  eventId?: string;
}

export interface TikTokPixelData {
  pixelId: string;
  loadTime?: number;
  pageUrl?: string;
  events?: TikTokPixelEvent[];
  payloads?: Array<Record<string, any>>;
  detectionMethod?: 'code_inspection' | 'network' | 'ttq_object';
}

export interface TikTokPixelInfo {
  found: boolean;
  pixels?: TikTokPixelData[];
  errors?: string[];
}

// ==========================================
// Reddit Pixel Types
// ==========================================

export interface RedditPixelEvent {
  eventType: string;
  timestamp: number;
  parameters?: Record<string, any>;
  source?: string;
  eventId?: string;
}

export interface RedditPixelData {
  pixelId: string;
  loadTime?: number;
  pageUrl?: string;
  events?: RedditPixelEvent[];
}

export interface RedditPixelInfo {
  found: boolean;
  pixels?: RedditPixelData[];
  errors?: string[];
}

// ==========================================
// Global Pixel Types
// ==========================================

export interface GlobalPixelInfo {
  found: boolean;
  scriptUrl?: string;
  pixelId?: string;
  loadTime?: number;
  pageUrl?: string;
  detectionMethod?: 'network' | 'dom_inspection';
  errors?: string[];
}

// ==========================================
// Meta Pixel (Facebook) Types
// ==========================================

export interface MetaPixelEvent {
  eventType: string;
  timestamp: number;
  parameters?: Record<string, any>;
  source?: string;
  eventId?: string;
}

export interface MetaPixelData {
  pixelId: string;
  loadTime?: number;
  pageUrl?: string;
  events?: MetaPixelEvent[];
  detectionMethod?: 'network' | 'fbq_object' | 'code_inspection';
}

export interface MetaPixelInfo {
  found: boolean;
  pixels?: MetaPixelData[];
  errors?: string[];
}

// ==========================================
// Google Tag Manager Types
// ==========================================

export interface GoogleTagData {
  tagId: string;
  loadTime?: number;
  pageUrl?: string;
  detectionMethod?: 'network' | 'dataLayer' | 'gtag_object';
  dataLayerVariables?: Record<string, any>;
}

export interface GoogleTagInfo {
  found: boolean;
  tags?: GoogleTagData[];
  errors?: string[];
}
