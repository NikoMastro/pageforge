/**
 * Lightweight per-IP rate limiter for the public showcase API.
 *
 * Dependency-free fixed-window limiter with separate budgets for reads and
 * writes: enough to stop scripted flooding and brute force, while normal
 * builder usage never notices. State is in-memory — on serverless (Vercel)
 * that means per-instance, which still throttles any single hot client and
 * keeps the demo cluster safe together with the storage-level caps
 * (50 pages / 20 versions / 1 MB, see mongoutils/storage.js).
 */

const WINDOWS = {
  read: { windowMs: 60_000, max: 120 },   // GET/HEAD: 120 per minute per IP
  write: { windowMs: 300_000, max: 20 },  // POST/PUT/PATCH/DELETE: 20 per 5 min per IP
};

const buckets = new Map();

// Drop stale buckets so the map cannot grow unbounded
const cleanup = setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.start > 600_000) buckets.delete(key);
  }
}, 60_000);
if (typeof cleanup.unref === "function") cleanup.unref();

function clientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) {
    return fwd.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

function rateLimiter(req, res, next) {
  const kind = req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS"
    ? "read"
    : "write";
  const { windowMs, max } = WINDOWS[kind];
  const key = `${kind}:${clientIp(req)}`;
  const now = Date.now();

  let bucket = buckets.get(key);
  if (!bucket || now - bucket.start >= windowMs) {
    bucket = { start: now, count: 0 };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  if (bucket.count > max) {
    res.set("Retry-After", String(Math.ceil((bucket.start + windowMs - now) / 1000)));
    return res.status(429).json({
      error:
        "Too many requests — the public showcase API is rate limited. Please try again in a moment.",
    });
  }

  next();
}

module.exports = rateLimiter;
