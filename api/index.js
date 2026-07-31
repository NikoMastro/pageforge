/**
 * Vercel serverless entry point.
 *
 * Wraps the Express backend (backend/server.js) so the whole API runs as a
 * single Vercel Function. The frontend calls `/api/*` (see
 * app/frontend/src/config/config.ts), so the app is mounted under that prefix.
 *
 * In production this backend ran as a container on GCP Cloud Run; the
 * showcase runs it serverless with MongoDB (MONGODB_URI env var) as storage.
 */
const express = require("express");
const backend = require("../backend/server");

const app = express();
app.use("/api", backend);

module.exports = app;
