const BaseRoute = require("../../core/baseRoute");
// GCP Cloud Build deployment — disabled in the showcase, kept for reference:
// const {
//   LP_BUILD_TRIGGER_URL,
// } = require("../../config/config");
const {
  requiredMetadataFields,
} = require("../../config/requiredMetadataFirestore");
// const { splitConfigIntoChunks } = require("../../utils/cloudBuildUtils");

class LinkbioRoute extends BaseRoute {
  constructor() {
    super("linkbio", requiredMetadataFields);
    this.setupRoutes();
  }

  setupRoutes() {
    // Setup standard routes
    this.setupGetRoute().setupHistoryRoute().setupListRoute().setupSaveRoute();

    // Setup custom deploy route
    this.setupDeployRoute();
  }

  async validateDeployment(name) {
    try {
      // Check if the linkbio exists in storage directly
      // (production used Firestore: require("../../firestoreutils/getFromFirestore"))
      const { getFromFirestore } = require("../../mongoutils/storage");
      const { status, data } = await getFromFirestore(
        { params: { name } },
        this.collectionName,
        1
      );

      if (status === 404) {
        return {
          error: "This Linkbio doesn't exist",
          status: 404,
          data: null,
        };
      }

      if (status !== 200) {
        console.error("Error validating deployment:", data);
        return {
          error: "An error occurred while validating the Linkbio",
          status: 500,
          data: null,
        };
      }

      // If we get here, validation passed
      return { error: null, status: 200, data: data };
    } catch (err) {
      console.error("Error validating deployment:", err);
      return {
        error: "Failed to validate deployment",
        status: 500,
        data: null,
      };
    }
  }

  setupDeployRoute() {
    this.router.post("/deploy/:name", async (req, res) => {
      // Showcase: deployment is disabled. In production this endpoint pushed
      // the page JSON to a GCP Cloud Build trigger which built and published
      // the static page. The original implementation is kept below.
      return res.status(501).json({
        error:
          "Deployment is disabled in this public showcase. In production, pages were deployed via GCP Cloud Build to static hosting.",
      });
    });

    /* --- Original GCP Cloud Build deployment (disabled in showcase) ---
    this.router.post("/deploy/:name", async (req, res) => {
      const { name } = req.params;
      if (!name) {
        return res.status(400).json({ error: "Name parameter is required" });
      }

      const { isValid, error } = this.validateMetadata(
        req.body?.metadata,
        this.requiredFields
      );
      if (!isValid) {
        return res.status(400).json({ error });
      }

      const validationResult = await this.validateDeployment(name);
      if (validationResult.error) {
        return res
          .status(validationResult.status)
          .json({ error: validationResult.error, data: validationResult.data });
      }

      if (!LP_BUILD_TRIGGER_URL) {
        console.error("LP_BUILD_TRIGGER_URL is not configured");
        return res.status(500).json({
          error:
            "Server configuration error: LP_BUILD_TRIGGER_URL is not set",
        });
      }

      // Parse lp_json field and send only its content (not entire Firestore doc)
      let lpContent = validationResult.data.lp_json;
      if (typeof lpContent === 'string') {
        lpContent = JSON.parse(lpContent);
      }

      // Split config into chunks for Cloud Build substitutions
      const { chunks, totalChunks, error: chunkError } = splitConfigIntoChunks(
        JSON.stringify(lpContent),
        'JSON_CONFIG'
      );

      if (chunkError) {
        console.error("Config too large:", chunkError);
        return res.status(400).json({
          error: chunkError,
          hint: "Consider reducing the size of your Linkbio configuration",
        });
      }

      console.log(
        `Splitting config into ${totalChunks} chunk(s) for deployment of ${name}`
      );

      try {
        const responseBuildTrigger = await fetch(LP_BUILD_TRIGGER_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            substitutions: {
              _CONTENT_TYPE: "linkbio",
              _NAME: name,
              ...chunks,
            },
          }),
        });

        if (!responseBuildTrigger.ok) {
          throw new Error(
            `Build trigger failed with status: ${responseBuildTrigger.status}`
          );
        }

        res.status(200).json({
          message:
            "Was Successfully Sent to Build. You can check the status in the build tab.",
          configChunks: totalChunks,
        });
      } catch (error) {
        console.error("Error triggering build:", error);
        res.status(500).json({ error: "Failed to trigger build deployment" });
      }
    });
    --- End of original deployment implementation --- */

    return this;
  }
}

module.exports = LinkbioRoute;
