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

export default async function saveQuiz(userId, quizData) {
  let result = null;
  let error = null;

  try {
    const quizRef = collection(db, `users/${userId}/quizzes`);

    const q = query(quizRef, where("title", "==", quizData.title));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return { result: null, error: "A quiz with this title already exists." };
    }

    const docRef = await addDoc(quizRef, {
      ...quizData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    result = { id: docRef.id };
  } catch (e) {
    error = e;
  }

  return { result, error };
}
