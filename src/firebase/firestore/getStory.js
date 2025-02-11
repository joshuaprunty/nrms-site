import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function getStory(userId, storyId) {
  let result = null;
  let error = null;

  try {
    const storyRef = doc(db, `users/${userId}/stories/${storyId}`);
    const storySnap = await getDoc(storyRef);
    
    if (storySnap.exists()) {
      result = {
        id: storySnap.id,
        ...storySnap.data()
      };
    }
  } catch (e) {
    error = e;
  }

  return { result, error };
} 