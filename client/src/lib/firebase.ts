import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDzZB7z0tjstC3ZWs6jlGric53-kwzy57Y",
  authDomain: "sufuf-c61e0.firebaseapp.com",
  projectId: "sufuf-c61e0",
  storageBucket: "sufuf-c61e0.firebasestorage.app",
  messagingSenderId: "759510003093",
  appId: "1:759510003093:web:6fba5d85da0a5c5aea9a9c",
  measurementId: "G-VKCD38BY9M"
};

let auth;
let analytics;
const provider = new GoogleAuthProvider();

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  analytics = getAnalytics(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw error;
}

// Function to sign in with just a password
export const signInWithPassword = async (password: string) => {
  try {
    // Use a default email with the provided password
    const defaultEmail = 'mosque@sufuf.com';
    const result = await signInWithEmailAndPassword(auth, defaultEmail, password);
    console.log('Successfully signed in with password');
    return result.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log('Successfully signed in with Google:', result.user);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export { auth, analytics };