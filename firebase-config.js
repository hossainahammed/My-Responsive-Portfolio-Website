// Firebase SDK v10 Modular Initialization for Portfolio Admin Backend
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp 
} from "firebase/firestore";

// =========================================================================
// YOUR FIREBASE CONFIGURATION
// Paste your 6 Firebase API keys from https://console.firebase.google.com/
// Project Settings -> General -> Your apps -> Web App
// =========================================================================
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if valid user keys are provided
export const isFirebaseConfigured = () => {
  return (
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== "YOUR_API_KEY" &&
    firebaseConfig.projectId !== "YOUR_PROJECT_ID"
  );
};

let app = null;
let auth = null;
let db = null;

if (isFirebaseConfigured()) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("🔥 Firebase Backend Initialized Successfully!");
  } catch (err) {
    console.warn("Firebase initialization warning:", err);
  }
} else {
  console.log("ℹ️ Firebase API keys pending. Running with smart local storage fallback backend.");
}

export { 
  app, 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp 
};
