import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

function getEnv(key: string): string {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key]!;
  }
  return "";
}

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY") || "AIzaSyAIP5RsZOC8thH-aeRCIYbMtgFK0WaZJls",
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN") || "ansanest-store.firebaseapp.com",
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID") || "ansanest-store",
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET") || "ansanest-store.firebasestorage.app",
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") || "296470117995",
  appId: getEnv("VITE_FIREBASE_APP_ID") || "1:296470117995:web:59c9d17b432c7d2673fb2e",
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);