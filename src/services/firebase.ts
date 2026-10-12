import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCekQqPO-e-PLx9IbL-VW5o9BebI56qjAc",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "adminapk-116ba.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "adminapk-116ba",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "adminapk-116ba.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1039695264339",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1039695264339:web:9687be6f0519a9fa8524a6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-6V1CBQLB0K"
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
