const { db } = require("../config/firebase");

const listItems = async (req, collection) => {
  try {
    // Get the limit from query params, default to 10 if not specified
    const limit = parseInt(req.query.limit) || 10;

    // Get documents ordered by serverTimestamp with limit
    const snapshot = await db
      .collection(collection)
      .select("page_name", "serverTimestamp")
      .orderBy("serverTimestamp", "desc")
      .get();

    if (snapshot.empty) {
      return {
        status: 404,
        results: [],
        message: "No landing pages found",
      };
    }

    // Create a map to store the latest timestamp for each page_name
    const latestTimestamps = new Map();

    // Keep only the first (latest) timestamp for each page_name
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const pageName = data.page_name;

      if (pageName && !latestTimestamps.has(pageName)) {
        latestTimestamps.set(pageName, {
          page_name: pageName,
          latest_timestamp: data.serverTimestamp,
        });
      }

      // Stop if we have reached the limit
      if (latestTimestamps.size >= limit) {
        break;
      }
    }

    // Convert map to array
    const results = Array.from(latestTimestamps.values());

    return {
      status: 200,
      results: results,
      message: "Landing pages fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching items from Firestore", error, {
      collection,
      limit: req.query.limit,
    });
    return {
      status: 500,
      results: [],
      message: "Failed to fetch landing pages from Firestore",
    };
  }
};

module.exports = {
  listItems,
};
