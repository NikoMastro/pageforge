const BaseRoute = require("../../core/baseRoute");
// Production storage was Firestore — kept for reference:
// const { deleteByPageName } = require("../../firestoreutils/deleteFromFirestore");
const { deleteByPageName } = require("../../mongoutils/storage");

const { isProtectedPage, isAdminRequest } = require("../../config/showcase");

class CommonRoute extends BaseRoute {
  constructor() {
    super("common", []); // No required fields for common operations
    this.setupRoutes();
  }

  setupRoutes() {
    // DELETE /delete/:collection/:pageName - Delete all documents with matching page_name
    this.router.delete(`/delete/:collection/:pageName`, async (req, res) => {
      try {
        const { collection, pageName } = req.params;

        // Validate collection name (whitelist approach for security)
        const allowedCollections = ["lps", "linkbio", "configs", "experiments"];

        if (!allowedCollections.includes(collection)) {
          return res.status(400).json({
            error: `Invalid collection. Allowed collections: ${allowedCollections.join(", ")}`,
          });
        }

        if (!pageName) {
          return res.status(400).json({
            error: "Page name is required",
          });
        }

        // Permanent showcase pages can only be deleted with the admin token
        if (isProtectedPage(collection, pageName) && !isAdminRequest(req)) {
          return res.status(403).json({
            error: `'${pageName}' is a permanent showcase page and cannot be deleted. Create your own page to experiment.`,
          });
        }

        const { status, message, deletedCount, error } = await deleteByPageName(
          pageName,
          collection
        );

        if (status !== 200) {
          return res.status(status).json({ error: error || message });
        }

        res.status(200).json({
          message,
          deletedCount,
          collection,
          pageName,
        });
      } catch (err) {
        console.error(`Error in delete route:`, err);
        res.status(500).json({
          error: err.message,
          message: `Failed to delete from Firestore`,
        });
      }
    });

    return this;
  }
}

module.exports = CommonRoute;
