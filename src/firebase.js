import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Only in browser

const firebaseConfig = {
  apiKey: "AIzaSyB6fGDtjbuA3SgZhiuPKEAbD6VdUIYChoo",
  authDomain: "internship-48a2e.firebaseapp.com",
  projectId: "internship-48a2e",
  storageBucket: "internship-48a2e.appspot.com", 
  messagingSenderId: "116293893386",
  appId: "1:116293893386:web:b2007aa6ed441c07848ef3",
  measurementId: "G-R3WPMXBWP4"
};

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