import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0ig9ydA0HGu0HS2fM1J1w9blZbMcl87g",
  authDomain: "paw-manager-3e46b.firebaseapp.com",
  projectId: "paw-manager-3e46b",
  storageBucket: "paw-manager-3e46b.firebasestorage.app",
  messagingSenderId: "1089763357375",
  appId: "1:1089763357375:web:eec03bcdd466fe16be4c0a"
};

// Initialize Firebase safely (prevents duplicate app errors in React hot-reloads)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth & Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
