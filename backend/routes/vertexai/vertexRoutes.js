const BaseRoute = require("../../core/baseRoute");
const {
  requiredMetadataFields,
} = require("../../config/requiredMetadataFirestore");
const { generateVideo } = require("./utils");
const { getStatusVideoGeneration } = require("./gcp/status-check");
const { getVideoUrl } = require("./gcp/get-video-url");

class VertexRoutes extends BaseRoute {
  constructor() {
    super("vertexai", requiredMetadataFields);
    this.setupRoutes();
  }

  setupRoutes() {
    // Setup status route FIRST (before other routes) to ensure it matches
    this.setupGetStatusVideoGenerationRoute();
    this.setupGetVideoUrlRoute();
    
    // Setup standard routes
    this.setupGetRoute()
      .setupHistoryRoute()
      .setupListRoute()
      .setupSaveRoute();

    this.setupGenerateVideoRoute();
  }

  setupGenerateVideoRoute() {
    this.router.post("/generate", async (req, res) => {
      try {

        if (!req.body || Object.keys(req.body).length === 0) {
          return res.status(400).json({
            success: false,
            error: 'Request body is required and must contain at least one field'
          });
        }

        const result = await generateVideo(req.body);
        
        // Return appropriate status code based on result
        const statusCode = result.success ? 200 : 400;
        res.status(statusCode).json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }
  setupGetStatusVideoGenerationRoute() {
    // Support both GET with query parameter and POST with body
    // GET: /status?operationName=projects/.../operations/...
    // POST: /status with { "operationName": "projects/.../operations/..." } in body
    this.router.get("/status", async (req, res) => {
      try {
        const operationName = req.query.operationName;
        
        if (!operationName) {
          return res.status(400).json({
            success: false,
            error: 'Operation name is required as query parameter: ?operationName=projects/.../operations/...'
          });
        }

        const result = await getStatusVideoGeneration(operationName);
        
        const statusCode = result.success ? 200 : 400;
        res.status(statusCode).json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  setupGetVideoUrlRoute() {
    // GET: /video-url with { "gcsUri": "gs://...", "expiresInMinutes": 120 } in body
    this.router.get("/video-url", async (req, res) => {
      try {
        const { gcsUri } = req.body;
        
        if (!gcsUri) {
          return res.status(400).json({
            success: false,
            error: 'GCS URI is required in request body: { "gcsUri": "gs://bucket/path/video.mp4" }'
          });
        }

        const result = await getVideoUrl(gcsUri);
        
        const statusCode = result.success ? 200 : 400;
        res.status(statusCode).json(result);
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }
}

module.exports = VertexRoutes;
