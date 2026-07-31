const BaseRoute = require("../../core/baseRoute");

/**
 * Read-only media library backed by Cloudinary — showcase edition.
 *
 * In production the library was Cloudflare Images/Stream, served by
 * routes/cloudfare/cloudfareApi.js (kept for reference, disabled). This route
 * answers the exact same endpoints the frontend already calls (so the paths
 * keep the /cloudflare prefix) but reads from a single Cloudinary folder.
 *
 * Strictly read-only by design (public demo):
 *   - only list/get endpoints are implemented,
 *   - every mutating endpoint (upload/update/delete) returns 403,
 *   - results are scoped to one folder (CLOUDINARY_FOLDER, default
 *     "ShowcasePCH") and get-by-id refuses anything outside it,
 *   - responses are cached in-memory for 60s so the public demo cannot
 *     hammer the Cloudinary Admin API.
 *
 * Configuration (env):
 *   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
 *   — or the three separate variables —
 *   CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
 *   CLOUDINARY_FOLDER (optional, default "ShowcasePCH")
 */

const CACHE_TTL_MS = 60_000;
const MAX_RESULTS = 100;

function readConfig() {
  let cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  let apiKey = process.env.CLOUDINARY_API_KEY;
  let apiSecret = process.env.CLOUDINARY_API_SECRET;

  const url = process.env.CLOUDINARY_URL;
  if (url && (!cloudName || !apiKey || !apiSecret)) {
    // cloudinary://<api_key>:<api_secret>@<cloud_name>
    const match = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (match) {
      apiKey = apiKey || match[1];
      apiSecret = apiSecret || match[2];
      cloudName = cloudName || match[3];
    }
  }

  const folder = process.env.CLOUDINARY_FOLDER || "ShowcasePCH";
  const configured = Boolean(cloudName && apiKey && apiSecret);
  return { cloudName, apiKey, apiSecret, folder, configured };
}

function notConfiguredResponse() {
  return {
    success: false,
    result: { images: [] },
    errors: [
      {
        message:
          "Media library not configured. Set CLOUDINARY_URL (cloudinary://key:secret@cloud_name) or the CLOUDINARY_* variables.",
      },
    ],
    messages: [],
  };
}

function readOnlyResponse() {
  return {
    success: false,
    errors: [
      {
        message:
          "The showcase media library is read-only. Uploads, edits and deletions are disabled.",
      },
    ],
    messages: [],
  };
}

class CloudinaryLibraryRoute extends BaseRoute {
  constructor() {
    super(); // No collection name needed - this route doesn't use storage
    this.cache = new Map(); // key -> { at, data }
    this.setupRoutes();
  }

  async cloudinaryGet(cfg, path, params = {}) {
    const query = new URLSearchParams({ max_results: String(MAX_RESULTS), ...params });
    const url = `https://api.cloudinary.com/v1_1/${cfg.cloudName}/${path}?${query}`;

    const cached = this.cache.get(url);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.data;
    }

    const auth = Buffer.from(`${cfg.apiKey}:${cfg.apiSecret}`).toString("base64");
    const response = await fetch(url, {
      headers: { Authorization: `Basic ${auth}` },
    });
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Cloudinary API ${response.status}: ${body.slice(0, 200)}`);
    }
    const data = await response.json();
    this.cache.set(url, { at: Date.now(), data });
    return data;
  }

  // Map a Cloudinary image resource to the CloudflareImageDetail shape the UI expects
  imageToDetail(resource) {
    const publicId = resource.public_id || "";
    const name = publicId.split("/").pop() || publicId;
    return {
      id: publicId,
      filename: resource.format ? `${name}.${resource.format}` : name,
      uploaded: resource.created_at || new Date(0).toISOString(),
      requireSignedURLs: false,
      variants: [resource.secure_url || resource.url].filter(Boolean),
    };
  }

  // Map a Cloudinary video resource to the CloudflareVideoDetail shape the UI expects
  videoToDetail(cfg, resource) {
    const publicId = resource.public_id || "";
    const name = publicId.split("/").pop() || publicId;
    return {
      uid: publicId,
      name: resource.format ? `${name}.${resource.format}` : name,
      created: resource.created_at,
      duration: resource.duration,
      size: resource.bytes,
      preview: resource.secure_url || resource.url,
      thumbnail: `https://res.cloudinary.com/${cfg.cloudName}/video/upload/${publicId}.jpg`,
      playback: null,
      status: { state: "ready" },
    };
  }

  inFolder(cfg, publicId) {
    return typeof publicId === "string" && publicId.startsWith(`${cfg.folder}/`);
  }

  setupRoutes() {
    // GET /listImages — images from the showcase folder only
    this.router.get("/listImages", async (req, res) => {
      const cfg = readConfig();
      if (!cfg.configured) return res.status(200).json(notConfiguredResponse());
      try {
        const data = await this.cloudinaryGet(cfg, "resources/image/upload", {
          prefix: `${cfg.folder}/`,
        });
        const images = (data.resources || [])
          .filter((r) => this.inFolder(cfg, r.public_id))
          .map((r) => this.imageToDetail(r));
        res.json({ success: true, result: { images }, errors: [], messages: [] });
      } catch (error) {
        console.error("Cloudinary listImages failed:", error.message);
        res.status(502).json({
          success: false,
          result: { images: [] },
          errors: [{ message: "Failed to list media library images" }],
          messages: [],
        });
      }
    });

    // GET /listVideos — videos from the showcase folder only
    this.router.get("/listVideos", async (req, res) => {
      const cfg = readConfig();
      if (!cfg.configured)
        return res.status(200).json({ ...notConfiguredResponse(), result: [] });
      try {
        const data = await this.cloudinaryGet(cfg, "resources/video/upload", {
          prefix: `${cfg.folder}/`,
        });
        const videos = (data.resources || [])
          .filter((r) => this.inFolder(cfg, r.public_id))
          .map((r) => this.videoToDetail(cfg, r));
        res.json({ success: true, result: videos, errors: [], messages: [] });
      } catch (error) {
        console.error("Cloudinary listVideos failed:", error.message);
        res.status(502).json({
          success: false,
          result: [],
          errors: [{ message: "Failed to list media library videos" }],
          messages: [],
        });
      }
    });

    // GET /images/:id — single image, refused outside the showcase folder
    this.router.get("/images/:id", async (req, res) => {
      const cfg = readConfig();
      if (!cfg.configured) return res.status(503).json(notConfiguredResponse());
      const publicId = req.params.id;
      if (!this.inFolder(cfg, publicId)) {
        return res.status(403).json(readOnlyResponse());
      }
      try {
        const data = await this.cloudinaryGet(
          cfg,
          `resources/image/upload/${encodeURIComponent(publicId)}`
        );
        res.json(this.imageToDetail(data));
      } catch (error) {
        console.error("Cloudinary get image failed:", error.message);
        res.status(404).json({ success: false, errors: [{ message: "Image not found" }] });
      }
    });

    // GET /videos/:id — single video, refused outside the showcase folder
    this.router.get("/videos/:id", async (req, res) => {
      const cfg = readConfig();
      if (!cfg.configured) return res.status(503).json(notConfiguredResponse());
      const publicId = req.params.id;
      if (!this.inFolder(cfg, publicId)) {
        return res.status(403).json(readOnlyResponse());
      }
      try {
        const data = await this.cloudinaryGet(
          cfg,
          `resources/video/upload/${encodeURIComponent(publicId)}`
        );
        res.json(this.videoToDetail(cfg, data));
      } catch (error) {
        console.error("Cloudinary get video failed:", error.message);
        res.status(404).json({ success: false, errors: [{ message: "Video not found" }] });
      }
    });

    // --- Mutating endpoints: always refused (read-only showcase) ---
    this.router.post("/uploadImageFromFiles", (req, res) =>
      res.status(403).json(readOnlyResponse())
    );
    this.router.post("/uploadImageFromUrl", (req, res) =>
      res.status(403).json(readOnlyResponse())
    );
    this.router.patch("/updateImage/:id", (req, res) =>
      res.status(403).json(readOnlyResponse())
    );
    this.router.delete("/deleteImage/:id", (req, res) =>
      res.status(403).json(readOnlyResponse())
    );

    return this;
  }
}

module.exports = CloudinaryLibraryRoute;
