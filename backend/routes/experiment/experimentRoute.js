const BaseRoute = require("../../core/baseRoute");
const {
  requiredMetadataFields,
} = require("../../config/requiredMetadataFirestore");

class CrawlerRoute extends BaseRoute {
  constructor() {
    super("experiments", requiredMetadataFields);
    this.setupRoutes();
  }

  setupRoutes() {
    // Setup standard routes
    this.setupListRoute()
      .setupHistoryRoute()
      .setupGetRoute()
      .setupSaveRoute(this.preProcessConfig.bind(this));
  }

  async preProcessConfig(metadata, req) {
    return { success: true };
  }
}

module.exports = CrawlerRoute;
