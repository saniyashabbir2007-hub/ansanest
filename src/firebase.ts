import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtP6RXJCGAtHw-aeRClYvNzgFKRMaZJLw",
  authDomain: "ansanest-store.firebaseapp.com",
  projectId: "ansanest-store",
  storageBucket: "ansanest-store.firebasestorage.app",
  messagingSenderId: "296470117995",
  appId: "1:296470117995:web:59c9d17b432c7d2673fb2e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);