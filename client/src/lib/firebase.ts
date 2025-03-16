import { initializeApp } from "firebase/app";
import { 
  getAuth, 
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
    // Use hardcoded credentials
    const email = 'mosque@sufuf.com';
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Successfully signed in with password');
    return result.user;
  } catch (error: any) {
    console.error('Error signing in:', error.code, error.message);
    // This will help us see exactly what's going wrong
    if (error.code === 'auth/invalid-credential') {
      throw new Error('Incorrect wachtwoord of gebruiker bestaat niet. Controleer of de gebruiker is aangemaakt in Firebase Console.');
    }
    throw error;
  }
};

export { auth, analytics };