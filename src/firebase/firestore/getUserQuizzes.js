import { getFirestore, collection, getDocs } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

export default async function getUserQuizzes(userId) {
  let result = [];
  let error = null;

  try {
    const quizRef = collection(db, `users/${userId}/quizzes`);
    const querySnapshot = await getDocs(quizRef);
    querySnapshot.forEach((doc) => {
      result.push({
        id: doc.id,
        ...doc.data()
      });
    });
  } catch (e) {
    error = e;
  }

  return { result, error };
}