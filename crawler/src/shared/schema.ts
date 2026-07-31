import { z } from 'zod';

export const RequestSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      'URL must use HTTP or HTTPS protocol'
    ),
});

export type RequestBody = z.infer<typeof RequestSchema>;

export const LighthouseScoresSchema = z.object({
  // Scores are returned as percentages from 0 to 100
  performance: z.number().int().min(0).max(100),
  accessibility: z.number().int().min(0).max(100),
  'best-practices': z.number().int().min(0).max(100),
  seo: z.number().int().min(0).max(100),
  pwa: z.number().int().min(0).max(100),
});

export const LighthouseAuditsSchema = z.object({
  'first-contentful-paint': z.number(),
  'largest-contentful-paint': z.number(),
  'cumulative-layout-shift': z.number(),
  'total-blocking-time': z.number(),
  'speed-index': z.number(),
});

export const LighthouseDataSchema = z.object({
  scores: LighthouseScoresSchema,
  audits: LighthouseAuditsSchema,
  rawReportHtmlPath: z.string().nullable(),
});

export const ShortAuditsSchema = z.object({
  fcp: z.number(),
  lcp: z.number(),
  cls: z.number(),
  tbt: z.number(),
  si: z.number(),
});

export const SuccessResponseSchema = z.object({
  ok: z.literal(true),
  target: z.string().url(),
  buttonCount: z.number().int().min(0),
  iframes: z.object({
    total: z.number().int().min(0),
    visible: z.number().int().min(0),
    details: z.array(z.object({
      id: z.string().nullable(),
      name: z.string().nullable(),
      src: z.string().nullable(),
      title: z.string().nullable(),
      width: z.number().min(0),
      height: z.number().min(0),
      isVisible: z.boolean(),
      widgetProps: z.object({
        gameId: z.string().optional(),
        enabled: z.boolean().optional(),
        type: z.string().optional(),
        utm: z.object({
          source: z.string().optional(),
          campaign: z.string().optional(),
          medium: z.string().optional(),
          content: z.string().optional(),
          term: z.string().optional(),
        }).optional(),
      }).nullable().optional(),
    })),
  }),
  // Info about a network request whose URL contains "gghst.cc" (combines previous s2s and games tests)
  // Expected URL pattern: https://[preprod|prod].gghst.cc/ingest/p
  gghst: z.object({
    found: z.boolean(),
    url: z.string().optional(),
    scriptName: z.string().optional(),
    method: z.string().optional(),
    status: z.number().int().optional(),
    ok: z.boolean().optional(),
    error: z.string().optional(),
    bigQueryMessage: z.string().optional(),
  }),
  // Info about page redirects after button clicks
  redirect: z.object({
    occurred: z.boolean(),
    fromUrl: z.string().optional(),
    toUrl: z.string().optional(),
    statusCode: z.number().int().optional(),
  }),
  // Info about X Pixel analysis and events
  xpixel: z.object({
    found: z.boolean(),
    pixelId: z.string().optional(),
    loadTime: z.number().optional(),
    pageUrl: z.string().optional(),
    events: z.array(z.object({
      eventType: z.string(),
      timestamp: z.number(),
      parameters: z.record(z.any()).optional(),
      source: z.string().optional(),
    })).optional(),
    errors: z.array(z.string()).optional(),
  }),
  // Info about TikTok Pixel analysis and events
  tiktokpixel: z.object({
    found: z.boolean(),
    pixels: z.array(z.object({
      pixelId: z.string(),
      loadTime: z.number().optional(),
      pageUrl: z.string().optional(),
      events: z.array(z.object({
        eventType: z.string(),
        timestamp: z.number(),
        parameters: z.record(z.any()).optional(),
        source: z.string().optional(),
        eventId: z.string().optional(),
      })).optional(),
      payloads: z.array(z.record(z.any())).optional(),
    })).optional(),
    errors: z.array(z.string()).optional(),
  }),
  // Info about Reddit Pixel analysis and events (can have multiple pixels similar to TikTok)
  redditpixel: z.object({
    found: z.boolean(),
    pixels: z.array(z.object({
      pixelId: z.string(),
      loadTime: z.number().optional(),
      pageUrl: z.string().optional(),
      events: z.array(z.object({
        eventType: z.string(),
        timestamp: z.number(),
        parameters: z.record(z.any()).optional(),
        source: z.string().optional(),
        eventId: z.string().optional(),
      })).optional(),
    })).optional(),
    errors: z.array(z.string()).optional(),
  }),
  // Info about Global Pixel (pixel_global.js?t=TIMESTAMP)
  globalpixel: z.object({
    found: z.boolean(),
    scriptUrl: z.string().optional(),
    pixelId: z.string().optional(), // The timestamp ID after ?t=
    loadTime: z.number().optional(),
    pageUrl: z.string().optional(),
    responseHeaders: z.record(z.string()).optional(),
    errors: z.array(z.string()).optional(),
  }),
  // Info about Meta Pixel (Facebook Pixel - fbevents.js and /tr/ requests)
  metapixel: z.object({
    found: z.boolean(),
    pixels: z.array(z.object({
      pixelId: z.string(),
      loadTime: z.number().optional(),
      pageUrl: z.string().optional(),
      events: z.array(z.object({
        eventType: z.string(),
        timestamp: z.number(),
        parameters: z.record(z.any()).optional(),
        source: z.string().optional(),
      })).optional(),
    })).optional(),
    errors: z.array(z.string()).optional(),
  }),
  // Info about Google Tag Manager (gtag.js?id=)
  googletag: z.object({
    found: z.boolean(),
    tags: z.array(z.object({
      tagId: z.string(),
      loadTime: z.number().optional(),
      pageUrl: z.string().optional(),
    })).optional(),
    errors: z.array(z.string()).optional(),
  }),
  // Complete Lighthouse data including scores and audits
  lighthouse: LighthouseDataSchema,
});

export const ErrorResponseSchema = z.object({
  ok: z.literal(false),
  error: z.string(),
});

export const ResponseSchema = z.union([SuccessResponseSchema, ErrorResponseSchema]);

export type SuccessResponse = z.infer<typeof SuccessResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type Response = z.infer<typeof ResponseSchema>;
