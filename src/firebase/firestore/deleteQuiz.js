import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function deleteQuiz(userId, quizId) {
  let error = null;

  try {
    await deleteDoc(doc(db, `users/${userId}/quizzes/${quizId}`));
  } catch (e) {
    error = e;
  }

  return { error };
}