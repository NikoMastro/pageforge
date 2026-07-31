const { deployDomains } = require("./deployDomain");
const { runDbtRollupJob } = require("./run-dbt-rollup-job");
const { handleBqTableCreation } = require("./createBqTable");
const { uploadToGcs } = require("./upload-to-gcs");
const { triggerVideoWorkerBackfill } = require("./video-worker-backfill");

// Actions mapped by type_value
const TYPE_VALUE_ACTIONS = {
  bq_table: handleBqTableCreation,
  rollup: runDbtRollupJob,
  gcs: uploadToGcs,
  "video-worker": triggerVideoWorkerBackfill,
};

// Actions mapped by page_name (used when type_value is "unique")
const PAGE_NAME_ACTIONS = {
  domain_whitelist: deployDomains,
};

async function platformActions(payload) {
  let action;

  if (payload.type_value === "unique") {
    // When type_value is "unique", use page_name to find the action
    action = PAGE_NAME_ACTIONS[payload.page_name];
  } else if (payload.type_value && TYPE_VALUE_ACTIONS[payload.type_value]) {
    // When type_value exists and is in TYPE_VALUE_ACTIONS, use it
    action = TYPE_VALUE_ACTIONS[payload.type_value];
  }

  if (action && payload.active === true) {
    try {
      const result = await action(payload.value);
      if (result === "error") {
        throw new Error("Action failed");
      }
      return {
        status: 200,
        message: "Executed",
      };
    } catch (error) {
      console.error(`Error executing action for ${payload.page_name}:`, error);
      return {
        status: 500,
        message: "Error",
        error: error.message,
      };
    }
  }

  return {
    status: 200,
    message: "Passed",
  };
}

module.exports = {
  platformActions,
};
