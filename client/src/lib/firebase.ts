import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword
} from "firebase/auth";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDzZB7z0tjstC3ZWs6jlGric53-kwzy57Y",
  authDomain: "sufuf-c61e0.firebaseapp.com",
  projectId: "sufuf-c61e0",
  storageBucket: "sufuf-c61e0.firebasestorage.app",
  messagingSenderId: "759510003093",
  appId: "1:759510003093:web:6fba5d85da0a5c5aea9a9c",
  measurementId: "G-VKCD38BY9M",
  databaseURL: `https://sufuf-c61e0-default-rtdb.europe-west1.firebasedatabase.app`
};

let auth;
let analytics;
let database;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  analytics = getAnalytics(app);
  database = getDatabase(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

export { auth, analytics, database };