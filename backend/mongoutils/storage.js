/**
 * MongoDB storage adapter — public showcase edition.
 *
 * In production this project persisted documents in Firestore
 * (see ../firestoreutils/, kept intact for reference) and deployed pages
 * through GCP Cloud Build. The showcase swaps storage to MongoDB so the
 * whole app runs with a single MONGODB_URI and no GCP account.
 *
 * The four exports keep the exact names and contracts of their Firestore
 * counterparts, so consuming routes only change a require path.
 *
 * Showcase guardrails (this is a public, writable demo):
 *   - max 50 distinct page_name per collection (MAX_PAGES_PER_COLLECTION)
 *   - max 20 saved versions per page_name (older ones are pruned)
 *   - max 1 MB per saved document
 */
const { MongoClient } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DB = process.env.MONGODB_DB || "pageforge";

const MAX_PAGES_PER_COLLECTION = parseInt(
  process.env.MAX_PAGES_PER_COLLECTION || "50",
  10
);
const MAX_VERSIONS_PER_PAGE = parseInt(
  process.env.MAX_VERSIONS_PER_PAGE || "20",
  10
);
const MAX_DOCUMENT_BYTES = 1_000_000; // 1 MB per saved JSON document

let clientPromise = null;

async function getDb() {
  if (!clientPromise) {
    const client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
  }
  const client = await clientPromise;
  return client.db(MONGODB_DB);
}

/** Serialize a stored document to the shape the frontend expects. */
function toApiDoc(doc) {
  if (!doc) return doc;
  const { _id, serverTimestamp, ...rest } = doc;
  return {
    ...rest,
    serverTimestamp:
      serverTimestamp instanceof Date
        ? serverTimestamp.toISOString()
        : serverTimestamp,
  };
}

// Accept only plain-string page names so client-supplied values can never
// smuggle Mongo query operators (e.g. {"$gt": ""}) into the queries and
// deletes that later use page_name.
const SAFE_PAGE_NAME = /^[A-Za-z0-9 _.\-]{1,120}$/;

/** Reject documents whose top-level keys could be Mongo operators. */
function hasUnsafeKeys(data) {
  return Object.keys(data).some((k) => k.startsWith("$") || k.includes("."));
}

// Same contract as firestoreutils/savetoFirestore.js
async function SavetoFirestore(data, collection) {
  try {
    if (data === null || typeof data !== "object" || Array.isArray(data)) {
      return { status: 400, error: "Invalid payload", message: "Invalid payload" };
    }
    if (hasUnsafeKeys(data)) {
      return {
        status: 400,
        error: "Invalid field names",
        message: "Field names must not start with '$' or contain '.'",
      };
    }
    if (data.page_name !== undefined && (typeof data.page_name !== "string" || !SAFE_PAGE_NAME.test(data.page_name))) {
      return {
        status: 400,
        error: "Invalid page name",
        message:
          "page_name must be a string of letters, digits, spaces, '_', '-' or '.' (max 120 chars)",
      };
    }

    const db = await getDb();
    const col = db.collection(collection);

    const payloadBytes = Buffer.byteLength(JSON.stringify(data), "utf8");
    if (payloadBytes > MAX_DOCUMENT_BYTES) {
      return {
        status: 413,
        error: "Document too large",
        message: `Showcase limit: documents are capped at ${Math.round(
          MAX_DOCUMENT_BYTES / 1000
        )} KB (got ${Math.round(payloadBytes / 1000)} KB)`,
      };
    }

    const pageName = data.page_name;
    if (pageName) {
      const existing = await col.distinct("page_name");
      if (
        !existing.includes(pageName) &&
        existing.length >= MAX_PAGES_PER_COLLECTION
      ) {
        return {
          status: 403,
          error: "Page limit reached",
          message: `Showcase limit reached: this demo stores at most ${MAX_PAGES_PER_COLLECTION} pages. Delete an existing page to create a new one.`,
        };
      }
    }

    const result = await col.insertOne({
      ...data,
      serverTimestamp: new Date(),
    });

    // Prune old versions so a single page can't grow unbounded
    if (pageName) {
      const excess = await col
        .find({ page_name: pageName })
        .sort({ serverTimestamp: -1 })
        .skip(MAX_VERSIONS_PER_PAGE)
        .project({ _id: 1 })
        .toArray();
      if (excess.length > 0) {
        await col.deleteMany({ _id: { $in: excess.map((d) => d._id) } });
      }
    }

    return {
      status: 200,
      message: "Saved to MongoDB successfully",
      docId: result.insertedId.toString(),
    };
  } catch (err) {
    console.error("Error saving to MongoDB:", err);
    return {
      status: 500,
      error: err.message,
      message: "Failed to save document",
    };
  }
}

// Same contract as firestoreutils/getFromFirestore.js
async function getFromFirestore(req, collection, limit, isNotHistory = true) {
  try {
    const { name } = req.params;
    if (typeof name !== "string") {
      return { status: 400, data: { error: "Invalid page name" } };
    }
    const db = await getDb();
    const docs = await db
      .collection(collection)
      .find({ page_name: name })
      .sort({ serverTimestamp: -1 })
      .limit(limit)
      .toArray();

    if (docs.length === 0) {
      return {
        status: 404,
        data: { error: `No JSON found for page name: ${name}` },
      };
    }

    if (isNotHistory) {
      return { status: 200, data: toApiDoc(docs[0]) };
    }
    return { status: 200, data: docs.map(toApiDoc) };
  } catch (error) {
    console.error("Error fetching JSON from MongoDB:", error);
    return {
      status: 500,
      data: { error: "Failed to fetch JSON from storage" },
    };
  }
}

// Same contract as firestoreutils/listItems.js
async function listItems(req, collection) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const db = await getDb();

    const rows = await db
      .collection(collection)
      .aggregate([
        { $sort: { serverTimestamp: -1 } },
        {
          $group: {
            _id: "$page_name",
            latest_timestamp: { $first: "$serverTimestamp" },
          },
        },
        { $match: { _id: { $ne: null } } },
        { $sort: { latest_timestamp: -1 } },
        { $limit: limit },
      ])
      .toArray();

    if (rows.length === 0) {
      return {
        status: 404,
        results: [],
        message: "No landing pages found",
      };
    }

    const results = rows.map((row) => ({
      page_name: row._id,
      latest_timestamp:
        row.latest_timestamp instanceof Date
          ? row.latest_timestamp.toISOString()
          : row.latest_timestamp,
    }));

    return {
      status: 200,
      results,
      message: "Landing pages fetched successfully",
    };
  } catch (error) {
    console.error("Error listing items from MongoDB", error, { collection });
    return {
      status: 500,
      results: [],
      message: "Failed to fetch landing pages from storage",
    };
  }
}

// Same contract as firestoreutils/deleteFromFirestore.js
async function deleteByPageName(pageName, collection) {
  try {
    if (!pageName || typeof pageName !== "string") {
      return {
        status: 400,
        message: "Page name is required",
      };
    }

    const db = await getDb();
    const result = await db
      .collection(collection)
      .deleteMany({ page_name: pageName });

    if (result.deletedCount === 0) {
      return {
        status: 404,
        message: `No documents found for page name: ${pageName}`,
        deletedCount: 0,
      };
    }

    return {
      status: 200,
      message: `Successfully deleted ${result.deletedCount} document(s) for page name: ${pageName}`,
      deletedCount: result.deletedCount,
    };
  } catch (err) {
    console.error("Error deleting from MongoDB:", err);
    return {
      status: 500,
      error: err.message,
      message: "Failed to delete documents",
    };
  }
}

module.exports = {
  SavetoFirestore,
  getFromFirestore,
  listItems,
  deleteByPageName,
};
