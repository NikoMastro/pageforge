const { VIDEO_WORKER_URL } = require("../../config/config");

const VIDEO_WORKER_INGEST_URL = `${VIDEO_WORKER_URL}/ingest`;

const REQUIRED_FIELDS = [
  "config_id",
  "is_backfill",
  "start_date",
  "end_date",
];

// Fetch identity token from GCP metadata server for service-to-service auth (OIDC)
async function getIdentityToken(audience) {
  const metadataUrl = `http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/identity?audience=${audience}`;
  const response = await fetch(metadataUrl, {
    headers: { "Metadata-Flavor": "Google" },
  });
  return response.text();
}

async function triggerVideoWorkerBackfill(payload) {
  try {
    // Validate required fields
    const missingFields = REQUIRED_FIELDS.filter(
      (field) => payload[field] === undefined
    );
    if (missingFields.length > 0) {
      return {
        status: 400,
        message: `Missing required fields: ${missingFields.join(", ")}`,
      };
    }

    if (!VIDEO_WORKER_URL) {
      console.error("VIDEO_WORKER_URL is not configured");
      return {
        status: 500,
        message: "VideoWorker URL is not configured",
      };
    }

    console.log("Triggering VideoWorker backfill with payload:", payload);

    // Get identity token for OIDC authentication
    const token = await getIdentityToken(VIDEO_WORKER_URL);

    const requestBody = {
      config_id: payload.config_id,
      is_backfill: payload.is_backfill,
      start_date: payload.start_date,
      end_date: payload.end_date,
      default_window_days: payload.default_window_days,
      custom_params: payload.custom_params,
    };

    console.log("Calling VideoWorker ingest endpoint:", VIDEO_WORKER_INGEST_URL);

    const response = await fetch(VIDEO_WORKER_INGEST_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("VideoWorker ingest response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("VideoWorker ingest error:", errorText);
      return {
        status: response.status,
        message: "VideoWorker ingest request failed",
        error: errorText,
      };
    }

    const data = await response.json().catch(() => ({}));

    return {
      status: 200,
      message: "VideoWorker backfill triggered successfully",
      data,
    };
  } catch (error) {
    console.error("Error triggering VideoWorker backfill:", error);
    return {
      status: 500,
      message: "Error triggering VideoWorker backfill",
      error: error.message,
    };
  }
}

module.exports = {
  triggerVideoWorkerBackfill,
};
