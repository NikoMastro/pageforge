// Load dotenv only in development (for local testing)
// if (process.env.NODE_ENV !== "production") {
//   require("dotenv").config();
// }

// Environment configuration
const NODE_ENV = process.env.NODE_ENV || "production";
const IS_DEVELOPMENT = NODE_ENV === "development";

// GCP Project configuration
const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const REGION = process.env.REGION;
const GCP_COMMON_PROJECT_ID = "your-gcp-project";

// Firestore configuration
const FIRESTORE_DATABASE_PAGEFORGE_METADATA =
  process.env.FIRESTORE_DATABASE_ID || "pageforge-metadata";

// Cloud Build webhook configuration
const LP_BUILD_TRIGGER_BASE_URL = process.env.LP_BUILD_TRIGGER_BASE_URL;
const LP_WEBHOOK_SECRET = process.env.LP_WEBHOOK_SECRET;
const LP_TRIGGER_NAME = process.env.LP_TRIGGER_NAME;
const CLOUDBUILD_API_KEY = process.env.CLOUDBUILD_API_KEY;

// Build complete webhook URLs with secrets
const LP_BUILD_TRIGGER_URL = LP_BUILD_TRIGGER_BASE_URL && LP_WEBHOOK_SECRET
  ? `${LP_BUILD_TRIGGER_BASE_URL}?key=${CLOUDBUILD_API_KEY}&secret=${LP_WEBHOOK_SECRET}&trigger=${LP_TRIGGER_NAME}&projectId=${GCP_PROJECT_ID}`
  : process.env.LP_BUILD_TRIGGER_URL; // Fallback to full URL if provided


// Storage and other service URLs
const DBT_RUNNER_URL = process.env.DBT_RUNNER_URL;

// VideoWorker service URL
const VIDEO_WORKER_URL = process.env.VIDEO_WORKER_URL;

// Crawler service URL
const CRAWLER_URL = process.env.CRAWLER_URL;

// Private key path (only used in local development)
const PRIVATE_KEY_FIRESTORE = process.env.PRIVATE_KEY_FIRESTORE;

// Cloudfare configuration
const CLOUDFARE_API_TOKEN = process.env.CLOUDFLARE_TOKEN;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;

// Google Cloud Storage configuration
const GCS_BUCKET_NAME = process.env.PIXEL_AND_LANDING_PAGE_BUCKET_NAME;

// GitHub webhook configuration for domain management
const EDGE_PURGE_URL = process.env.EDGE_PURGE_URL;
const EDGE_PURGE_GITHUB_WEBHOOK_TOKEN = process.env.EDGE_PURGE_GITHUB_WEBHOOK_TOKEN;
const DOMAIN_WEBHOOK_URI = process.env.DOMAIN_WEBHOOK_URI;
const CACHE_INVALIDATION_SECRET = process.env.CACHE_INVALIDATION_SECRET;

const APP_ENV = process.env.APP_ENV;

// Protected configs that cannot be saved from preprod environment
const PROTECTED_CONFIGS = [
  "pixel_config_common", "event_config_common"
];

module.exports = {
  NODE_ENV,
  IS_DEVELOPMENT,
  PRIVATE_KEY_FIRESTORE,
  FIRESTORE_DATABASE_PAGEFORGE_METADATA,
  GCP_PROJECT_ID,
  LP_BUILD_TRIGGER_URL,
  LP_WEBHOOK_SECRET,
  DBT_RUNNER_URL,
  VIDEO_WORKER_URL,
  CRAWLER_URL,
  REGION,
  CLOUDFARE_API_TOKEN,
  CLOUDFLARE_ACCOUNT_ID,
  GCP_COMMON_PROJECT_ID,
  GCS_BUCKET_NAME,
  EDGE_PURGE_GITHUB_WEBHOOK_TOKEN,
  DOMAIN_WEBHOOK_URI,
  PROTECTED_CONFIGS,
  EDGE_PURGE_URL,
  CACHE_INVALIDATION_SECRET,
  APP_ENV
};
