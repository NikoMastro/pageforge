/**
 * Public-showcase protection policy (single source of truth).
 *
 * - PROTECTED_PAGES: the permanent demo pages. Only requests carrying the
 *   admin token may modify or delete them.
 * - Admin token: set ADMIN_TOKEN in the environment (.env locally, project
 *   env vars on Vercel) and send it as the `x-admin-token` header. If no
 *   ADMIN_TOKEN is configured, protected pages are fully immutable
 *   (fail closed).
 * - TTL: pages created by visitors expire automatically. Protected pages
 *   never expire.
 */
const crypto = require("crypto");

const csv = (value) => value.split(",").map((s) => s.trim()).filter(Boolean);

const PROTECTED_PAGES = csv(
  process.env.PROTECTED_PAGES || "hades,stardew-valley,hollow-knight,celeste"
);
const PROTECTED_LINKBIO = csv(process.env.PROTECTED_LINKBIO || "game-hub");

// Lifetime of visitor-created documents (default 1 hour)
const NEW_PAGE_TTL_MS = parseInt(process.env.NEW_PAGE_TTL_MS || "3600000", 10);

/** Permanent demo pages, per collection. */
const PROTECTED_BY_COLLECTION = {
  lps: PROTECTED_PAGES,
  linkbio: PROTECTED_LINKBIO,
};

function isProtectedPage(collection, pageName) {
  return (PROTECTED_BY_COLLECTION[collection] || []).includes(pageName);
}

/** Constant-time comparison of the x-admin-token header with ADMIN_TOKEN. */
function isAdminRequest(req) {
  const expected = process.env.ADMIN_TOKEN;
  const provided = req?.headers?.["x-admin-token"];
  if (!expected || typeof provided !== "string") return false;
  const a = crypto.createHash("sha256").update(expected).digest();
  const b = crypto.createHash("sha256").update(provided).digest();
  return crypto.timingSafeEqual(a, b);
}

module.exports = {
  PROTECTED_PAGES,
  PROTECTED_LINKBIO,
  NEW_PAGE_TTL_MS,
  isProtectedPage,
  isAdminRequest,
};
