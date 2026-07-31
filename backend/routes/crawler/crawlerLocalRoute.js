const BaseRoute = require("../../core/baseRoute");

/**
 * Local crawler route — showcase edition.
 *
 * In production the crawler ran as a GCP Cloud Function (Gen 2) and
 * crawlerRoute.js proxied to it with an authenticated request. The crawler
 * source still lives in /crawler as an independent package; here we load its
 * compiled output directly and run it in-process, so the URL Tester works
 * with no GCP account.
 *
 * Requires a one-time build:  cd crawler && npm install && npm run build
 * (or `npm run setup:crawler` from the repo root)
 *
 * Note: the crawler drives a real Chromium via Playwright + Lighthouse, so
 * this route is disabled on serverless hosts (e.g. the Vercel demo) — it is
 * a local-development feature.
 */
class CrawlerLocalRoute extends BaseRoute {
  constructor() {
    super(); // No collection name needed - this route doesn't use storage
    this.analyzeUrlPromise = null;
    this.setupRoutes();
  }

  loadAnalyzeUrl() {
    if (!this.analyzeUrlPromise) {
      // Non-literal specifier keeps serverless bundlers from tracing the
      // crawler (and its Playwright/Lighthouse deps) into the API bundle.
      const crawlerEntry = ["..", "..", "..", "crawler", "dist", "index.js"].join("/");
      this.analyzeUrlPromise = import(crawlerEntry).then((m) => m.analyzeUrl);
    }
    return this.analyzeUrlPromise;
  }

  setupRoutes() {
    this.router.post("/analyze", async (req, res) => {
      if (process.env.VERCEL) {
        return res.status(503).json({
          ok: false,
          error:
            "The URL Tester runs the crawler (Playwright + Lighthouse) in-process and is only available when running the showcase locally.",
        });
      }

      let analyzeUrl;
      try {
        analyzeUrl = await this.loadAnalyzeUrl();
      } catch (error) {
        this.analyzeUrlPromise = null; // allow retry after the user builds it
        console.error("Crawler library not available:", error.message);
        return res.status(503).json({
          ok: false,
          error:
            "Crawler library not built. Run `npm run setup:crawler` from the repo root, then try again.",
        });
      }

      try {
        // The crawler handler is Express-compatible: (req, res)
        await analyzeUrl(req, res);
      } catch (error) {
        console.error("Error running local crawler:", error);
        if (!res.headersSent) {
          res.status(500).json({
            ok: false,
            error: "Failed to analyze URL",
            message: error.message,
          });
        }
      }
    });

    return this;
  }
}

module.exports = CrawlerLocalRoute;
