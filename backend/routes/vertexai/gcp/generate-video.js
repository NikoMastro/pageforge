const { GoogleAuth } = require("google-auth-library");
const { GCP_PROJECT_ID, REGION } = require("../../../config/config");
const { getFromFirestore } = require("../../../firestoreutils/getFromFirestore");


/**
 * Generate video using Vertex AI or custom provider
 * @param {Object} request - Simplified video generation request
 * @param {string} request.page_name - REQUIRED: Unique name/identifier for this video (used to construct storage path)
 * @param {string} [request.provider] - REQUIRED: Provider: 'GCP' or 'custom'
 * @param {string} request.modelId - Model ID (e.g., 'veo-2.0-generate-exp', 'veo-3.1-generate-preview')
 * @param {string} request.prompt - REQUIRED: Text description of the video to generate
 * @param {Object} [request.image] - OPTIONAL: First frame image for image-to-video generation
 * @param {string} [request.image.bytesBase64Encoded] - Base64 encoded image bytes (use this OR gcsUri)
 * @param {string} [request.image.gcsUri] - GCS URI to image (use this OR bytesBase64Encoded)
 * @param {string} [request.image.mimeType] - MIME type of the image (e.g., 'image/jpeg', 'image/png')
 * @param {Object} [request.lastFrame] - OPTIONAL: Last frame image for video generation
 * @param {string} [request.lastFrame.bytesBase64Encoded] - Base64 encoded image bytes
 * @param {string} [request.lastFrame.gcsUri] - GCS URI to image
 * @param {string} [request.lastFrame.mimeType] - MIME type of the image
 * @param {Object} [request.video] - OPTIONAL: Input video for video-to-video generation
 * @param {string} [request.video.bytesBase64Encoded] - Base64 encoded video bytes
 * @param {string} [request.video.gcsUri] - GCS URI to video
 * @param {string} [request.video.mimeType] - MIME type of the video (e.g., 'video/mp4')
 * @param {Array<Object>} [request.referenceImages] - OPTIONAL: Up to 3 asset images or 1 style image
 * @param {Object} [request.referenceImages[].image] - Reference image data
 * @param {string} [request.referenceImages[].referenceType] - Type: 'asset' or 'style'
 * @param {string} [request.aspectRatio] - OPTIONAL: Aspect ratio (e.g., '16:9', '9:16', '1:1')
 * @param {string} [request.compressionQuality] - OPTIONAL: Compression quality
 * @param {number} [request.durationSeconds] - OPTIONAL: Video duration in seconds
 * @param {boolean} [request.enhancePrompt] - OPTIONAL: Auto-enhance prompt (Veo 2 models only)
 * @param {boolean} [request.generateAudio] - OPTIONAL: Generate audio for the video
 * @param {string} [request.negativePrompt] - OPTIONAL: What to avoid in generation
 * @param {string} [request.personGeneration] - OPTIONAL: Person generation settings
 * @param {string} [request.resizeMode] - OPTIONAL: Resize mode (Veo 3 image-to-video only)
 * @param {string} [request.resolution] - OPTIONAL: Video resolution (Veo 3 models only)
 * @param {number} [request.sampleCount] - OPTIONAL: Number of samples to generate
 * @param {number} [request.seed] - OPTIONAL: Random seed for reproducibility
 * @returns {Promise<Object>} - API response with success status and data/error
 * @note Videos are automatically stored in gs://gemini-pageforge/{provider}/ where provider is taken from the request
 */

/**
 * Handle video generation for GCP Vertex AI
 * @param {Object} request - Video generation request
 * @returns {Promise<Object>} - API response
 */
async function handleGCPProvider(request) {

  const { status } = await getFromFirestore(
    { params: { name: request.page_name } },
    "vertexai",
    1
  );

  if (status !== 200) {
    throw new Error("Failed to get landing page from Firestore");
  }
  const location = REGION;
  const { page_name, modelId, prompt, provider } = request;
  const storageUri = `gs://gemini-pageforge/${provider}/${page_name}/`;

  // Validate required fields
  if (!modelId || !prompt || !page_name || !provider) {
    throw new Error("Both modelId and prompt and page_name and provider are required for GCP provider");
  }

  // Get access token
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  // Build the instance body (media inputs and prompt)
  const instanceBody = {
    prompt: prompt,
  };

  // Add optional media inputs
  if (request.image) {
    instanceBody.image = request.image;
  }
  if (request.lastFrame) {
    instanceBody.lastFrame = request.lastFrame;
  }
  if (request.video) {
    instanceBody.video = request.video;
  }
  if (request.referenceImages && Array.isArray(request.referenceImages)) {
    instanceBody.referenceImages = request.referenceImages;
  }

  // Build the parameters object
  const parameters = {
    storageUri: storageUri, // Always use the constructed storage path
  };

  const parameterFields = [
    "aspectRatio",
    "compressionQuality",
    "durationSeconds",
    "enhancePrompt",
    "generateAudio",
    "negativePrompt",
    "personGeneration",
    "resizeMode",
    "resolution",
    "sampleCount",
    "seed",
  ];

  parameterFields.forEach((field) => {
    if (request[field] !== undefined) {
      parameters[field] = request[field];
    }
  });

  // Build the API URL
  const projectId = GCP_PROJECT_ID || "your-gcp-project"; // Hardcoded for testing
  const url = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predictLongRunning`;

  // Prepare the request body
  const requestBody = {
    instances: [instanceBody],
    ...(Object.keys(parameters).length > 0 && { parameters }),
  };

  // Make the API call
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  // Parse response
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
}

module.exports = {
  handleGCPProvider,
};