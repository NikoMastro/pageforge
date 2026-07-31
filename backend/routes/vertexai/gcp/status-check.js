const { GoogleAuth } = require("google-auth-library");
const { GCP_PROJECT_ID } = require("../../../config/config");

/**
 * Poll the status of a long-running video generation operation
 * @param {string} operationName - REQUIRED: The operation name returned from generateVideo (e.g., 'projects/123/locations/us-central1/publishers/google/models/veo-2.0-generate-exp/operations/456')
 * @returns {Promise<Object>} - Operation status containing:
 *   - success: boolean indicating if the API call succeeded
 *   - data: operation details including 'done' (boolean), 'metadata', and 'response' (when complete with videos array)
 *   - error: error message if the API call failed
 */
async function getStatusVideoGeneration(operationName) {
  try {
    // Parse the operation name to extract project ID, location, and model ID
    // Format: projects/PROJECT_ID/locations/LOCATION/publishers/google/models/MODEL_ID/operations/OPERATION_ID
    const operationParts = operationName.split("/");
    const projectIdIndex = operationParts.indexOf("projects") + 1;
    const locationIndex = operationParts.indexOf("locations") + 1;
    const modelIdIndex = operationParts.indexOf("models") + 1;

    if (projectIdIndex === 0 || locationIndex === 0 || modelIdIndex === 0) {
      throw new Error(
        "Invalid operation name format. Expected: projects/PROJECT_ID/locations/LOCATION/publishers/google/models/MODEL_ID/operations/OPERATION_ID"
      );
    }

    const projectId =
      operationParts[projectIdIndex] || GCP_PROJECT_ID || "your-gcp-project";
    const location = operationParts[locationIndex] || "us-central1";
    const modelId = operationParts[modelIdIndex];

    if (!modelId) {
      throw new Error("Could not extract model ID from operation name");
    }

    // Get access token
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // Use fetchPredictOperation endpoint as per Vertex AI documentation
    // https://docs.cloud.google.com/vertex-ai/generative-ai/docs/model-reference/veo-video-generation
    const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:fetchPredictOperation`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        operationName: operationName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Vertex AI API error: ${response.status} - ${JSON.stringify(data)}`
      );
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  getStatusVideoGeneration,
};