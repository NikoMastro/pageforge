const { Firestore } = require("@google-cloud/firestore");
const {
  PRIVATE_KEY_FIRESTORE,
  FIRESTORE_DATABASE_PAGEFORGE_METADATA,
  GCP_PROJECT_ID,
} = require("./config");

// Initialize Firestore client
// In production (Cloud Run), it uses Application Default Credentials automatically
// In development with emulator, uses FIRESTORE_EMULATOR_HOST
const firestoreConfig = {
  projectId: GCP_PROJECT_ID,
  databaseId: FIRESTORE_DATABASE_PAGEFORGE_METADATA,
};

// Only use keyFilename if provided (not needed for emulator)
if (PRIVATE_KEY_FIRESTORE) {
  firestoreConfig.keyFilename = PRIVATE_KEY_FIRESTORE;
}

const db = new Firestore(firestoreConfig);

// Log connection info for debugging
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log(`🔧 Firestore Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}, DB: ${FIRESTORE_DATABASE_PAGEFORGE_METADATA}`);
} else {
  console.log(`☁️  Firestore Production: ${GCP_PROJECT_ID}/${FIRESTORE_DATABASE_PAGEFORGE_METADATA}`);
}

module.exports = {
  db,
};
