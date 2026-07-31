const BaseRoute = require("../../core/baseRoute");
// Production storage was Firestore — kept for reference:
// const { deleteByPageName } = require("../../firestoreutils/deleteFromFirestore");
const { deleteByPageName } = require("../../mongoutils/storage");

// Showcase seed pages that visitors cannot delete (they can still create
// versions; history is capped and restorable). Override with PROTECTED_PAGES.
const PROTECTED_PAGES = (process.env.PROTECTED_PAGES ||
  "hades,stardew-valley,hollow-knight,celeste")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

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

        if (collection === "lps" && PROTECTED_PAGES.includes(pageName)) {
          return res.status(403).json({
            error: `'${pageName}' is a showcase demo page and cannot be deleted. Create your own page to experiment.`,
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
