const BaseRoute = require("../../core/baseRoute");
const { IS_DEVELOPMENT } = require("../../config/config");

class IAPUserRoute extends BaseRoute {
  constructor() {
    super(); 
    this.setupRoutes();
  }

  setupRoutes() {
    // Get IAP user info
    this.router.get("/user", (req, res) => {
      try {
        // In development mode, return mock user for testing
        if (IS_DEVELOPMENT) {
          console.log("🔧 Development mode: Returning mock IAP user");
          return res.json({
            email: "test@test.com",
            id: "123",
          });
        }

        // IAP provides these headers after authentication
        const iapJWT = req.headers["x-goog-iap-jwt-assertion"];
        const iapEmail = req.headers["x-goog-authenticated-user-email"];
        const iapUserId = req.headers["x-goog-authenticated-user-id"];

        // Extract email from the header format: "accounts.google.com:email@example.com"
        let email = null;
        if (iapEmail) {
          const parts = iapEmail.split(":");
          email = parts.length > 1 ? parts[1] : iapEmail;
        }

        let id = null;
        if (iapUserId) {
          const parts = iapUserId.split(":");
          id = parts.length > 1 ? parts[1] : iapUserId;
        }

        // Return user info in simple format
        if (email && id) {
          res.json({
            email: email,
            id: id,
          });
        } else {
          // No IAP headers - user not authenticated
          res.status(401).json({
            error: "Not authenticated",
            message: "No IAP headers found",
          });
        }
      } catch (error) {
        console.error("Error getting IAP user info:", error);
        res.status(500).json({
          success: false,
          error: error.message,
          message: "Failed to get IAP user info",
        });
      }
    });
  }
}

module.exports = IAPUserRoute;

