import { getFirestore, doc, getDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function getQuizById(userId, quizId) {
  let result = null;
  let error = null;

  try {
    const quizRef = doc(db, `users/${userId}/quizzes/${quizId}`);
    const docSnap = await getDoc(quizRef);

    if (docSnap.exists()) {
      result = { id: docSnap.id, ...docSnap.data() };
    } else {
      console.warn(`Quiz with ID ${quizId} not found.`);
      error = "Quiz not found";
    }
  } catch (e) {
    console.error("Error fetching quiz:", e);
    error = e;
  }

  return { result, error };
}
