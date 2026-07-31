const { Storage } = require("@google-cloud/storage");

/**
 * Get a signed URL for a video stored in Google Cloud Storage
 * @param {string} gcsUri - REQUIRED: GCS URI (e.g., 'gs://bucket-name/path/to/video.mp4')
 * @param {number} [expiresInMinutes=120] - OPTIONAL: URL expiration time in minutes (default: 120)
 * @returns {Promise<Object>} - Response containing:
 *   - success: boolean indicating if the operation succeeded
 *   - url: signed URL that can be used in a webapp to stream/play the video
 *   - expiresAt: ISO timestamp when the URL expires
 *   - error: error message if the operation failed
 */
async function getVideoUrl(gcsUri, expiresInMinutes = 120) {
  try {
    // Validate input
    if (!gcsUri || typeof gcsUri !== "string") {
      throw new Error("gcsUri is required and must be a string");
    }

    if (!gcsUri.startsWith("gs://")) {
      throw new Error("gcsUri must start with 'gs://'");
    }

    // Parse the GCS URI to extract bucket and file path
    // Format: gs://bucket-name/path/to/file.mp4
    const uriWithoutProtocol = gcsUri.substring(5); // Remove 'gs://'
    const firstSlashIndex = uriWithoutProtocol.indexOf("/");

    if (firstSlashIndex === -1) {
      throw new Error(
        "Invalid GCS URI format. Expected: gs://bucket-name/path/to/file.mp4"
      );
    }

    const bucketName = uriWithoutProtocol.substring(0, firstSlashIndex);
    const filePath = uriWithoutProtocol.substring(firstSlashIndex + 1);

    if (!bucketName || !filePath) {
      throw new Error("Could not extract bucket name and file path from GCS URI");
    }

    // Initialize Google Cloud Storage client
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filePath);

    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      throw new Error(`File not found: ${gcsUri}`);
    }

    // Calculate expiration time
    const expirationTime = Date.now() + expiresInMinutes * 120 * 1000;
    const expiresAt = new Date(expirationTime).toISOString();

    // Generate signed URL
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: expirationTime,
    });

    return {
      success: true,
      url: signedUrl,
      expiresAt: expiresAt,
      bucket: bucketName,
      filePath: filePath,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

module.exports = {
  getVideoUrl,
};

