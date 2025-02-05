import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function getQuizByTitle(userId, quizTitle) {
  let result = null;
  let error = null;

  try {
    const quizRef = collection(db, `users/${userId}/quizzes`);
    const q = query(quizRef, where("title", "==", quizTitle));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      result = {
        id: doc.id,
        ...doc.data(),
      };
    }
  } catch (e) {
    error = e;
  }

  return { result, error };
}
