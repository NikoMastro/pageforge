const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const corsMiddleware = require("./middleware/corsMiddleware");
const RouteRegistry = require("./core/routeRegistry");
const LandingPagesRoute = require("./routes/landingpages/landingPagesRoute");
const ConfigRoute = require("./routes/config/configRoute");
const LinkbioRoute = require("./routes/linkbio/linkbioRoute");
const ExperimentRoute = require("./routes/experiment/experimentRoute");
const CommonRoute = require("./routes/common/commonRoute");
// Crawler runs in-process from the /crawler package (local dev only).
// In production it was a GCP Cloud Function proxied by crawlerRoute.js.
const CrawlerLocalRoute = require("./routes/crawler/crawlerLocalRoute");
// --- GCP/Cloudflare-backed services — disabled in the public showcase, kept for reference ---
// const IAPUserRoute = require("./routes/auth/iAPUserRoute");
// const edgePurgeInvalidation = require("./routes/auth/invalidateCache");
// const CrawlerRoute = require("./routes/crawler/crawlerRoute");
// const cloudfareRouter = require("./routes/cloudfare/cloudfareApi");
// const VertexRoutes = require("./routes/vertexai/vertexRoutes");

// Setup middleware
app.use(corsMiddleware("pageforge-frontend")); // Allow requests from pageforge-frontend domain
app.use(express.json()); // Add middleware to parse JSON bodies

// Initialize route registry
const registry = new RouteRegistry();

// Register routes (storage-backed — MongoDB in the showcase)
registry.register("/lp", new LandingPagesRoute());
registry.register("/config", new ConfigRoute());
registry.register("/linkbio", new LinkbioRoute());
registry.register("/experiment", new ExperimentRoute());
registry.register("/common", new CommonRoute());
registry.register("/crawler", new CrawlerLocalRoute());
// --- Routes requiring GCP/Cloudflare accounts — disabled in the showcase ---
// registry.register("/iap", new IAPUserRoute());
// registry.register("/crawler", new CrawlerRoute()); // GCP Cloud Function proxy
// registry.register("/vertexai", new VertexRoutes());

// Showcase stand-in for the IAP-authenticated user endpoint.
// In production, Google Identity-Aware Proxy authenticated users at the load
// balancer and this endpoint reflected the IAP headers (see routes/auth/iAPUserRoute.js).
app.get("/iap/user", (req, res) => {
  res.json({ email: "demo@example.com", id: "demo-user" });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "pageforge-backend",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Use the registry router
app.use(registry.getRouter());

// --- External integrations — disabled in the showcase, kept for reference ---
// // Mount cloudflare router
// app.use("/cloudflare", cloudfareRouter);
// // Mount edge-purge (cache invalidation) router
// app.use("/edge-purge", edgePurgeInvalidation);

// Export the app so it can run as a serverless function (see /api/index.js).
module.exports = app;

// When executed directly (local dev / container), start the HTTP server.
if (require.main === module) {
  const server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
  );

  // Graceful shutdown handlers for Cloud Run
  const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Closing server gracefully...`);
    server.close(() => {
      console.log("Server closed. Exiting process.");
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}
