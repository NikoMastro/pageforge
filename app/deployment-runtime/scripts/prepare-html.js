#!/usr/bin/env node

/**
 * Pre-build script to prepare index.html from environment variables
 * This script extracts the generatedHtml from chunked environment variables
 * and replaces the index.html file before Vite builds the project.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Reassemble chunked environment variables
 */
function reassembleChunks(prefix) {
  const total = process.env[`_${prefix}_TOTAL`];
  if (!total) return null;

  const numChunks = parseInt(total, 10);
  let json = '';

  for (let i = 1; i <= numChunks; i++) {
    const chunk = process.env[`_${prefix}_${i}`];
    if (!chunk) {
      throw new Error(`Missing ${prefix} chunk ${i}`);
    }
    json += chunk;
  }

  return JSON.parse(json);
}

function main() {
  const type = process.env._CONTENT_TYPE;

  // If not LP type or no config, skip this script
  if (type !== 'lp') {
    console.log('Content type is not "lp", skipping HTML preparation');
    return;
  }

  const rawData = reassembleChunks('JSON_CONFIG');

  if (!rawData) {
    console.log('No JSON_CONFIG found, skipping HTML preparation');
    return;
  }

  if (!rawData.generatedHtml) {
    console.log('No generatedHtml in config, skipping HTML preparation');
    return;
  }

  // Path to index.html
  const indexHtmlPath = path.join(__dirname, '..', 'index.html');

  // Write the generatedHtml to index.html
  fs.writeFileSync(indexHtmlPath, rawData.generatedHtml, 'utf8');

  console.log('✅ index.html prepared from generatedHtml');
}

try {
  main();
} catch (error) {
  console.error('❌ Error preparing HTML:', error.message);
  process.exit(1);
}
