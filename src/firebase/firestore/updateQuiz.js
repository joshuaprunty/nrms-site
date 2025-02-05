import { getFirestore, doc, updateDoc } from "firebase/firestore";
import firebase_app from "../config";

const db = getFirestore(firebase_app);

const updateQuiz = async (userId, quizId, updatedQuiz) => {
  try {
    const quizRef = doc(db, `users/${userId}/quizzes/${quizId}`);

    await updateDoc(quizRef, updatedQuiz);
    return { success: true };
  } catch (error) {
    console.error("Error updating quiz in database:", error);
    return { error };
  }
};

export default updateQuiz;
