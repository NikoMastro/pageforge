const { db } = require("../config/firebase");

/**
 * Delete all documents from a collection that match a specific page_name
 * @param {string} pageName - The page name to match
 * @param {string} collection - The Firestore collection name
 * @returns {Promise<Object>} - Status and message about deletion
 */
async function deleteByPageName(pageName, collection) {
  try {
    if (!pageName) {
      return {
        status: 400,
        message: "Page name is required",
      };
    }

    // Query all documents with matching page_name
    const snapshot = await db
      .collection(collection)
      .where("page_name", "==", pageName)
      .get();

    if (snapshot.empty) {
      return {
        status: 404,
        message: `No documents found for page name: ${pageName}`,
        deletedCount: 0,
      };
    }

    // Delete all matching documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return {
      status: 200,
      message: `Successfully deleted ${snapshot.size} document(s) for page name: ${pageName}`,
      deletedCount: snapshot.size,
    };
  } catch (err) {
    console.error("Error deleting from Firestore:", err);
    return {
      status: 500,
      error: err.message,
      message: "Failed to delete from Firestore",
    };
  }
}

module.exports = {
  deleteByPageName,
};

