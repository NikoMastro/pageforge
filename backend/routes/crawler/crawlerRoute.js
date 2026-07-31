const BaseRoute = require("../../core/baseRoute");
const { GoogleAuth } = require("google-auth-library");
const { CRAWLER_URL } = require("../../config/config");

class CrawlerRoute extends BaseRoute {
  constructor() {
    super(); // No collection name needed - this route doesn't use Firestore
    this.auth = new GoogleAuth();
    this.setupRoutes();
  }

  setupRoutes() {
    // Proxy endpoint for crawler requests
    this.router.post("/analyze", async (req, res) => {
      const { url } = req.body;

      if (!url || typeof url !== "string") {
        return res.status(400).json({
          ok: false,
          error: "Missing or invalid URL parameter",
        });
      }

      if (!CRAWLER_URL) {
        return res.status(503).json({
          ok: false,
          error: "Crawler service not configured",
        });
      }

      try {
        // Get authenticated client for the crawler service
        const client = await this.auth.getIdTokenClient(CRAWLER_URL);
        
        // Make authenticated request
        const response = await client.request({
          url: CRAWLER_URL,
          method: "POST",
          data: { url },
        });

        res.status(response.status).json(response.data);
      } catch (error) {
        console.error("Error calling crawler service:", error);
        res.status(500).json({
          ok: false,
          error: "Failed to analyze URL",
          message: error.message,
        });
      }
    });

    return this;
  }
}

module.exports = CrawlerRoute;

