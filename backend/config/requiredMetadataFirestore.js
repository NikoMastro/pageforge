const requiredMetadataFields = [
  "user",
  "type",
  "commit",
  "timestamp",
  "page_name",
  "lp_json",
  "hashid",
];

function validateMetadata(req, mandatoryFields) {
  let isValid = false;
  // Check if metadata exists in request
  const metadata = req.body?.metadata;
  if (!metadata) {
    return {
      isValid: false,
      error: "Missing metadata in request",
    };
  }

  // Check each required field
  const missingFields = mandatoryFields.filter((field) => !metadata[field]);

  if (missingFields.length > 0) {
    return {
      isValid: false,
      error: `Missing required metadata fields: ${missingFields.join(", ")}`,
    };
  }

  isValid = true;
  return {
    isValid: true,
    error: null,
  };
}

module.exports = {
  requiredMetadataFields,
  validateMetadata,
};
