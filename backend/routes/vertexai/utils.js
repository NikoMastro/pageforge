const { handleCustomProvider } = require("./custom/customAIModels");
const { handleGCPProvider } = require("./gcp/generate-video");

async function generateVideo(request) {
  try {
    // Validate request object
    if (!request || typeof request !== "object") {
      throw new Error("Request body is required and must be an object");
    }

    const provider = request.provider;

    // Handle custom provider
    if (provider === "custom") {
      return await handleCustomProvider(request);
    }

    // Handle GCP provider (Vertex AI)
    if (provider === "GCP") {
      return await handleGCPProvider(request);
    }

    throw new Error(`Unsupported provider: ${provider}`);
  } catch (error) {
    console.error("Error generating video:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  generateVideo,
};