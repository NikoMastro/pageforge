const { Storage } = require('@google-cloud/storage');
const { GCS_BUCKET_NAME } = require('../../config/config');

// Initialize Google Cloud Storage client
const storage = new Storage();

/**
 * Upload/overwrite data to Google Cloud Storage in the configs/ folder
 * @param {Object} payload - The data to upload
 * @returns {Promise<Object>} - Status object with success/error information
 */
async function uploadToGcs(payload) {
  try {
    console.log('uploadToGcs called with payload:', JSON.stringify(payload, null, 2));

    if (!payload) {
      throw new Error('Payload is required');
    }

    if (!GCS_BUCKET_NAME) {
      throw new Error('GCS_BUCKET_NAME is not configured');
    }

    // Generate filename - you can customize this based on your needs
    // For example, using a timestamp or a specific identifier from the payload
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `config/${payload.page_name || `config-${timestamp}`}.json`;

    const bucket = storage.bucket(GCS_BUCKET_NAME);
    const file = bucket.file(fileName);

    // Convert payload to JSON string
    const fileContent = JSON.stringify(payload, null, 2);

    // Upload/overwrite the file
    await file.save(fileContent, {
      contentType: 'application/json',
      metadata: {
        cacheControl: 'no-cache',
      },
      // This will overwrite the file if it already exists
      resumable: false,
    });

    console.log(`Successfully uploaded to gs://${GCS_BUCKET_NAME}/${fileName}`);

    return {
      status: 200,
      message: 'Successfully uploaded to GCS',
      filePath: `gs://${GCS_BUCKET_NAME}/${fileName}`,
    };
  } catch (error) {
    console.error('Error uploading to GCS:', error);
    return {
      status: 500,
      message: 'Error uploading to GCS',
      error: error.message,
    };
  }
}

module.exports = {
  uploadToGcs,
};

