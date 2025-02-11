import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function deleteStory(userId, storyId) {
  let error = null;

  try {
    await deleteDoc(doc(db, `users/${userId}/stories/${storyId}`));
  } catch (e) {
    error = e;
  }

  return { error };
} 