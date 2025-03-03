import {
  getFirestore,
  collection,
  query,
  where,
  addDoc,
  getDocs,
} from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function saveStory(userId, storyData) {
  let result = null;
  let error = null;

  try {
    const storyRef = collection(db, `users/${userId}/stories`);

    const q = query(storyRef, where("title", "==", storyData.title));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { result: null, error: "A story with this title already exists." };
    }

    const docRef = await addDoc(storyRef, {
      ...storyData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    result = { id: docRef.id };
  } catch (e) {
    error = e;
  }

  return { result, error };
} 