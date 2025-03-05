import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
