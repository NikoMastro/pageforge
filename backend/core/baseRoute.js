const express = require("express");
// Production storage was Firestore — kept for reference:
// const { SavetoFirestore } = require("../firestoreutils/savetoFirestore");
// const { getFromFirestore } = require("../firestoreutils/getFromFirestore");
// const { listItems } = require("../firestoreutils/listItems");
// Showcase storage: MongoDB adapter with identical contracts.
const {
  SavetoFirestore,
  getFromFirestore,
  listItems,
} = require("../mongoutils/storage");
const { isProtectedPage, isAdminRequest } = require("../config/showcase");

class BaseRoute {
  constructor(collectionName, requiredFields = []) {
    this.router = express.Router();
    this.collectionName = collectionName;
    this.requiredFields = requiredFields;
  }

  validateMetadata(metadata, mandatoryFields) {
    if (!metadata) {
      return {
        isValid: false,
        error: "Missing metadata in request",
      };
    }

    const missingFields = mandatoryFields.filter(
      (field) => metadata[field] === undefined || metadata[field] === null
    );

    if (missingFields.length > 0) {
      return {
        isValid: false,
        error: `Missing required metadata fields: ${missingFields.join(", ")}`,
      };
    }

    return {
      isValid: true,
      error: null,
    };
  }

  // GET /:name - Get single item
  setupGetRoute() {
    this.router.get(`/id/:name`, async (req, res) => {
      try {
        const { status, data } = await getFromFirestore(
          req,
          this.collectionName,
          1
        );
        res.status(status).json(data);
      } catch (err) {
        console.error(`Error fetching from Firestore:`, err);
        res.status(500).json({
          error: err.message,
          message: `Failed to fetch from Firestore`,
        });
      }
    });
    return this;
  }

  // GET /history/:name - Get item history
  setupHistoryRoute() {
    this.router.get(`/history/:name`, async (req, res) => {
      try {
        const { status, data } = await getFromFirestore(
          req,
          this.collectionName,
          300,
          false
        );
        res.status(status).json(data);
      } catch (err) {
        console.error(`Error fetching history from Firestore:`, err);
        res.status(500).json({
          error: err.message,
          message: `Failed to fetch history from Firestore`,
        });
      }
    });
    return this;
  }

  // GET /all - List all items
  setupListRoute() {
    this.router.get(`/all`, async (req, res) => {
      const { status, results, message } = await listItems(
        req,
        this.collectionName
      );
      if (status !== 200) {
        return res.status(status).json(message);
      }
      res.status(200).json(results);
    });
    return this;
  }

  // POST /save - Save item
  setupSaveRoute(preProcessCallback = null) {
    this.router.post(`/save`, async (req, res) => {
      const { isValid, error } = this.validateMetadata(
        req.body?.metadata,
        this.requiredFields
      );
      if (!isValid) {
        return res.status(400).json({ error });
      }

      // Permanent showcase pages can only be changed with the admin token
      const pageName = req.body?.metadata?.page_name;
      if (isProtectedPage(this.collectionName, pageName) && !isAdminRequest(req)) {
        return res.status(403).json({
          error: `'${pageName}' is a permanent showcase page and cannot be modified. Create your own page to experiment.`,
        });
      }

      // Allow custom preprocessing of data before save
      if (preProcessCallback) {
        const preprocessResult = await preProcessCallback(req.body.metadata, req);
        if (preprocessResult.error) {
          return res
            .status(preprocessResult.status || 400)
            .json({ error: preprocessResult.error });
        }
      }

      const { status, message, docId } = await SavetoFirestore(
        req.body.metadata,
        this.collectionName
      );

      if (status !== 200) {
        return res.status(status).json({ error: message });
      }

      res.status(200).json({
        message: "Saved successfully",
        docId: docId,
      });
    });
    return this;
  }

  getRouter() {
    return this.router;
  }
}

module.exports = BaseRoute;
