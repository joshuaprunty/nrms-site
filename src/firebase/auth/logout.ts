import { getAuth, signOut } from "firebase/auth";
import firebase_app from "../config";

const auth = getAuth(firebase_app);

export default async function logout() {
  let error = null;
  try {
    await signOut(auth);
  } catch (e) {
    error = e;
  }
  return { error };
}