/**
 * Utility functions for Cloud Build operations
 */

/**
 * Split a large string into chunks for Cloud Build substitutions
 * Cloud Build has a limit of 4000 characters per substitution field
 *
 * @param {string} dataString - The JSON string to split (caller should JSON.stringify first)
 * @param {string} [prefix='CONFIG'] - Prefix for the chunk keys (e.g., 'JSON_CONFIG', 'JSON_CONFIG')
 * @param {number} [chunkSize=4000] - Maximum size per chunk (accounting for JSON escaping in HTTP body)
 * @param {number} [maxChunks=90] - Maximum number of chunks allowed
 * @returns {Object} - { chunks: Object, totalChunks: number, error: string|null }
 *
 * @example
 * const { chunks, totalChunks, error } = splitConfigIntoChunks(JSON.stringify(myData), 'JSON_CONFIG');
 * if (error) {
 *   console.error(error);
 * } else {
 *   // chunks will contain: _JSON_CONFIG_1, _JSON_CONFIG_2, ..., _JSON_CONFIG_TOTAL
 *   const substitutions = { _NAME: 'my-config', ...chunks };
 * }
 */
function splitConfigIntoChunks(dataString, prefix = 'CONFIG', chunkSize = 4000, maxChunks = 90) {
  // Build chunks char by char, counting escaped size (", \ each become 2 chars)
  const chunkArray = [];
  let currentChunk = '';
  let currentEscapedSize = 0;

  for (let i = 0; i < dataString.length; i++) {
    const char = dataString[i];
    // In JSON escaping: " and \ each add 1 extra character
    const charEscapedSize = (char === '"' || char === '\\') ? 2 : 1;

    // If adding this char would exceed limit, start a new chunk
    if (currentEscapedSize + charEscapedSize > chunkSize && currentChunk.length > 0) {
      chunkArray.push(currentChunk);
      currentChunk = '';
      currentEscapedSize = 0;

      // Check if we've exceeded max chunks
      if (chunkArray.length >= maxChunks) {
        const remainingChars = dataString.length - i;
        return {
          chunks: null,
          totalChunks: chunkArray.length + 1,
          error: `Config too large: requires more than ${maxChunks} chunks (${remainingChars} characters remaining)`,
        };
      }
    }

    currentChunk += char;
    currentEscapedSize += charEscapedSize;
  }

  // Add the last chunk if it has content
  if (currentChunk.length > 0) {
    chunkArray.push(currentChunk);
  }

  const totalChunks = chunkArray.length;
  console.log(`[cloudBuild] Split ${dataString.length} characters into ${totalChunks} chunk(s)`);

  // Build the chunks object with padding
  const chunks = {};
  for (let i = 1; i <= maxChunks; i++) {
    if (i <= totalChunks) {
      chunks[`_${prefix}_${i}`] = chunkArray[i - 1];
    } else {
      // Padding for unused chunks (Cloud Build requires all pre-defined substitutions)
      chunks[`_${prefix}_${i}`] = "-";
    }
  }

  // Add total count for reassembly in the build script
  chunks[`_${prefix}_TOTAL`] = totalChunks.toString();

  return { chunks, totalChunks, error: null };
}

module.exports = {
  splitConfigIntoChunks,
};
