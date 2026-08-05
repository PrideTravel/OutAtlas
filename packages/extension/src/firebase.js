import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const FB_CFG = {
  apiKey: "AIzaSyBr8E41ny_oPeQ5pjrpwuRS-Ub1pZNUhUc",
  authDomain: "pride-scout-26f4e.firebaseapp.com",
  projectId: "pride-scout-26f4e",
  storageBucket: "pride-scout-26f4e.firebasestorage.app",
  messagingSenderId: "402384469695",
  appId: "1:402384469695:web:13fa09d6c9c287d8c3100a",
  measurementId: "G-7SHNRD677F"
};

const app = initializeApp(FB_CFG);
export const auth = getAuth(app);
export const db = getFirestore(app);
// Analytics only where document exists (not in background SW)
export const analytics = typeof document !== 'undefined' ? getAnalytics(app) : null;
