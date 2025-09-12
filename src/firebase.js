import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Only in browser

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Check if any required environment variables are missing
const missingVars = Object.entries(firebaseConfig)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error("Missing required Firebase configuration:", missingVars.join(", "));
  if (process.env.NODE_ENV === 'production') {
    throw new Error("Missing required Firebase configuration");
  }
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // <-- This line initializes Firestore.
const storage = getStorage(app);
const auth = getAuth(app);

// Google sign-in
const googleProvider = new GoogleAuthProvider();
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);

// Email/password sign-in
export const signInWithEmail = (email, password) => signInWithEmailAndPassword(auth, email, password);

// Sign out
export const logout = () => signOut(auth);

// Auth state observer
export const observeUser = (callback) => onAuthStateChanged(auth, callback);

export { app, db, storage, auth }; // <-- 'db' is exported here for use in other files.

export default app;