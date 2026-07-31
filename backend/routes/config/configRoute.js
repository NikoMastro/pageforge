const BaseRoute = require("../../core/baseRoute");
// GCP/Cloudflare integrations — disabled in the showcase, kept for reference:
// const { platformActions } = require("../gcputils/platform-actions");
// const { checkDomainExists } = require("../gcputils/deployDomain");
const { PROTECTED_CONFIGS } = require("../../config/config");

const requiredMetadataFields = [
  "page_name",
  "description",
  "active",
  "type",
  "type_value",
  "value",
  "Timestamp",
  "hashid",
  "user",
  "commit",
];

class ConfigRoute extends BaseRoute {
  constructor() {
    super("configs", requiredMetadataFields);
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
    // Check if request is from preprod and config is protected
    const origin = req?.headers?.origin || '';
    const pageName = metadata.page_name;
    
    if (origin.includes('preprod') && PROTECTED_CONFIGS.includes(pageName)) {
      return { 
        error: `Config '${pageName}' cannot be saved from preprod environment`, 
        status: 403 
      };
    }

    // Showcase: external validations disabled (no Cloudflare/GCP account).
    // Original checks kept for reference:
    /*
    // Check if domains exist for domain_whitelist config
    if (pageName === 'domain_whitelist' && metadata.value?.domains) {
      const checked = new Set();
      for (const domain of metadata.value.domains) {
        const root = domain.split('.').slice(-2).join('.');
        if (checked.has(root)) continue;
        checked.add(root);
        if (!(await checkDomainExists(root))) {
          return {
            error: `Cannot save: domain '${root}' doesn't exist in Cloudflare`,
            status: 400
          };
        }
      }
    }

    // Existing validation
    if (metadata.active === true) {
      const isAction = await platformActions(metadata);
      if (isAction.status !== 200) {
        return { error: isAction.message, status: isAction.status };
      }
    }
    */
    return { success: true };
  }
}

module.exports = ConfigRoute;
