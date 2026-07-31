const BaseRoute = require("../../core/baseRoute");

/**
 * Read-only media library backed by Cloudinary — showcase edition.
 *
 * In production the library was Cloudflare Images/Stream, served by
 * routes/cloudfare/cloudfareApi.js (kept for reference, disabled). This route
 * answers the exact same endpoints the frontend already calls (so the paths
 * keep the /cloudflare prefix) but reads from a single Cloudinary folder.
 *
 * The Cloudinary account uses dynamic folders, so scoping is enforced on the
 * `asset_folder` attribute (not the public_id prefix) via the Search API.
 *
 * SECURITY — the configured key may be powerful (admin), so this route is the
 * only thing standing between the public demo and the Cloudinary account:
 *   - only list/get endpoints are implemented; every mutating endpoint
 *     (upload/update/delete) returns 403,
 *   - all results are constrained to one folder (CLOUDINARY_FOLDER, default
 *     "ShowcasePCH") inside the search expression, and single-asset lookups
 *     re-verify the returned asset_folder,
 *   - user-supplied asset ids are validated against a strict charset before
 *     being placed in a search expression — no quotes, spaces, or operators
 *     can be injected,
 *   - responses are cached in-memory for 60s and capped at 100 results, so
 *     the public demo cannot hammer the Admin API,
 *   - the API secret never leaves the server; responses expose only delivery
 *     URLs and display metadata.
 *
 * Configuration (env):
 *   CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>
 *   — or the three separate variables —
 *   CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET
 *   CLOUDINARY_FOLDER (optional, default "ShowcasePCH")
 */

const CACHE_TTL_MS = 60_000;
const MAX_RESULTS = 100;

// Asset ids: letters, digits, underscore, hyphen, slash. Nothing that could
// close a quoted string or add operators to a Cloudinary search expression.
const SAFE_ASSET_ID = /^[A-Za-z0-9_/-]{1,200}$/;
// Folder names come from env (trusted), but keep them expression-safe too.
const SAFE_FOLDER = /^[A-Za-z0-9 _/-]{1,120}$/;

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
  const configured = Boolean(
    cloudName && apiKey && apiSecret && SAFE_FOLDER.test(folder)
  );
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

  /**
   * Run a Cloudinary Search API query. Every expression built here already
   * pins `asset_folder` to the configured showcase folder.
   */
  async search(cfg, expression) {
    const cacheKey = expression;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.data;
    }

    const auth = Buffer.from(`${cfg.apiKey}:${cfg.apiSecret}`).toString("base64");
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cfg.cloudName}/resources/search`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          expression,
          max_results: MAX_RESULTS,
          sort_by: [{ created_at: "desc" }],
        }),
      }
    );
    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Cloudinary API ${response.status}: ${body.slice(0, 200)}`);
    }
    const data = await response.json();
    this.cache.set(cacheKey, { at: Date.now(), data });
    return data;
  }

  // Map a Cloudinary image resource to the CloudflareImageDetail shape the UI expects
  imageToDetail(resource) {
    const publicId = resource.public_id || "";
    const name = (resource.display_name || publicId.split("/").pop() || publicId).toString();
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
    const name = (resource.display_name || publicId.split("/").pop() || publicId).toString();
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

  setupRoutes() {
    // GET /listImages — images from the showcase folder only
    this.router.get("/listImages", async (req, res) => {
      const cfg = readConfig();
      if (!cfg.configured) return res.status(200).json(notConfiguredResponse());
      try {
        const data = await this.search(
          cfg,
          `asset_folder="${cfg.folder}" AND resource_type:image`
        );
        const images = (data.resources || []).map((r) => this.imageToDetail(r));
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
        const data = await this.search(
          cfg,
          `asset_folder="${cfg.folder}" AND resource_type:video`
        );
        const videos = (data.resources || []).map((r) => this.videoToDetail(cfg, r));
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

    // GET /images/:id — single image; id charset-validated, folder re-verified
    this.router.get("/images/:id", async (req, res) => {
      const cfg = readConfig();
      if (!cfg.configured) return res.status(503).json(notConfiguredResponse());
      const publicId = req.params.id;
      if (!SAFE_ASSET_ID.test(publicId) || publicId.includes("..")) {
        return res.status(400).json({
          success: false,
          errors: [{ message: "Invalid asset id" }],
        });
      }
      try {
        const data = await this.search(
          cfg,
          `public_id="${publicId}" AND asset_folder="${cfg.folder}" AND resource_type:image`
        );
        const resource = (data.resources || [])[0];
        if (!resource || resource.asset_folder !== cfg.folder) {
          return res
            .status(404)
            .json({ success: false, errors: [{ message: "Image not found" }] });
        }
        res.json(this.imageToDetail(resource));
      } catch (error) {
        console.error("Cloudinary get image failed:", error.message);
        res
          .status(404)
          .json({ success: false, errors: [{ message: "Image not found" }] });
      }
    });

    // GET /videos/:id — single video; id charset-validated, folder re-verified
    this.router.get("/videos/:id", async (req, res) => {
      const cfg = readConfig();
      if (!cfg.configured) return res.status(503).json(notConfiguredResponse());
      const publicId = req.params.id;
      if (!SAFE_ASSET_ID.test(publicId) || publicId.includes("..")) {
        return res.status(400).json({
          success: false,
          errors: [{ message: "Invalid asset id" }],
        });
      }
      try {
        const data = await this.search(
          cfg,
          `public_id="${publicId}" AND asset_folder="${cfg.folder}" AND resource_type:video`
        );
        const resource = (data.resources || [])[0];
        if (!resource || resource.asset_folder !== cfg.folder) {
          return res
            .status(404)
            .json({ success: false, errors: [{ message: "Video not found" }] });
        }
        res.json(this.videoToDetail(cfg, resource));
      } catch (error) {
        console.error("Cloudinary get video failed:", error.message);
        res
          .status(404)
          .json({ success: false, errors: [{ message: "Video not found" }] });
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
