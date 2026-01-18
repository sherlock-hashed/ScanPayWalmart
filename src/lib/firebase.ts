// Firebase configuration and initialization for Realtime Database and Authentication
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDYTnm09_QcJAWtXhvWhe6x4Wfb2DdOV3A",
  authDomain: "scanpay-6f7cf.firebaseapp.com",
  projectId: "scanpay-6f7cf",
  storageBucket: "scanpay-6f7cf.firebasestorage.app",
  messagingSenderId: "431386614030",
  appId: "1:431386614030:web:a9a94a38d4ad5e15b3df5f",
  measurementId: "G-DHXVT59GQ9"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider }; 