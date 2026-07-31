const { DBT_RUNNER_URL } = require("../../config/config");

const DBT_RUNNER_SCHEDULE_URL = `${DBT_RUNNER_URL}/run_schedule`;

// Fetch identity token from GCP metadata server for service-to-service auth
async function getIdentityToken(audience) {
  const metadataUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${audience}`;
  const response = await fetch(metadataUrl, {
    headers: { "Metadata-Flavor": "Google" },
  });
  return response.text();
}

async function runDbtRollupJob(payload) {
  try {
    console.log("DBT_RUNNER_SCHEDULE_URL:", DBT_RUNNER_SCHEDULE_URL);
    console.log("payload received in runDbtRollupJob:", payload);

    // Get identity token for dbt_runner service
    const token = await getIdentityToken(DBT_RUNNER_URL);

    const requestBody = {
      job_type: payload.job_type,
      test: payload.test,
      is_rollup: payload.is_rollup,
      schedule: payload.schedule,
    };

    console.log("requestBody:", requestBody);

    const response = await fetch(DBT_RUNNER_SCHEDULE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("status:", response.status);
    console.log("message:", response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        status: response.status,
        message: "Response not ok",
        error: errorText,
      };
    }

    return {
      status: response.status,
      message: "Success",
    };
  } catch (error) {
    console.error("Error triggering dbt rollup job:", error);
    return {
      status: 500,
      message: "Error triggering dbt rollup job",
      error: error.message,
    };
  }
}

module.exports = {
  runDbtRollupJob,
};
