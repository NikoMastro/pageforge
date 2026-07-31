const { db } = require("../config/firebase");
const { FieldValue } = require("firebase-admin/firestore");

async function SavetoFirestore(data, collection) {
  try {
    const docRef = await db.collection(collection).add({
      ...data,
      serverTimestamp: FieldValue.serverTimestamp(),
    });

    return {
      status: 200,
      message: "Saved to firestore successfully",
      docId: docRef.id,
    };
  } catch (err) {
    console.error("Error saving to Firestore:", err);
    return {
      status: 500,
      error: err.message,
      message: "Failed to save to Firestore",
    };
  }
}

module.exports = {
  SavetoFirestore,
};
