import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBVci6APXZEwofOm1Dsp7HjdcBxyAU8PYk",
  authDomain: "sufuf-c6cd6.firebaseapp.com",
  databaseURL: "https://sufuf-c6cd6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "sufuf-c6cd6",
  storageBucket: "sufuf-c6cd6.firebasestorage.app",
  messagingSenderId: "799388036430",
  appId: "1:799388036430:web:ce7f4bcad3e8926573c21f",
  measurementId: "G-NE231CGCD4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

// Initialize Analytics only in browser environment
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);

export default app;