const { db } = require("../config/firebase");

const getFromFirestore = async (
  req,
  collection,
  limit,
  isNotHistory = true
) => {
  try {
    const { name } = req.params;

    // Query Firestore for documents with matching page_name, ordered by timestamp
    const snapshot = await db
      .collection(collection)
      .where("page_name", "==", name)
      .orderBy("serverTimestamp", "desc")
      .limit(limit)
      .get();

    if (snapshot.empty) {
      return {
        status: 404,
        data: { error: `No JSON found for page name: ${name}` },
      };
    }

    // Get all documents
    if (isNotHistory) {
      // Get the first (latest) document
      const doc = snapshot.docs[0];
      const data = doc.data();
      return { status: 200, data: data };
    } else {
      const documents = snapshot.docs.map((doc) => doc.data());
      return { status: 200, data: documents };
    }
  } catch (error) {
    console.error("Error fetching JSON from Firestore:", error);
    return {
      status: 500,
      data: { error: "Failed to fetch JSON from Firestore" },
    };
  }
};

module.exports = {
  getFromFirestore,
};
