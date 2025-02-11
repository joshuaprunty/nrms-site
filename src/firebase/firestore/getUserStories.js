import { getFirestore, collection, getDocs } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function getUserStories(userId) {
  let result = null;
  let error = null;

  try {
    const storyRef = collection(db, `users/${userId}/stories`);
    const querySnapshot = await getDocs(storyRef);
    
    result = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    error = e;
  }

  return { result, error };
} 