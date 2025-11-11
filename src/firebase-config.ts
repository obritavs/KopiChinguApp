// src/firebase-config.ts

import { getAuth } from "firebase/auth"; 
import { getFirestore } from "firebase/firestore"; 
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage"; // Import the Storage module

const firebaseConfig = {
    apiKey: "AIzaSyAabt-SWiAE5mNvfVuTmiAxQkwnAJEx9dU",
    authDomain: "kopichingu-2edce.firebaseapp.com",
    projectId: "kopichingu-2edce",
    storageBucket: "kopichingu-2edce.firebasestorage.app",
    messagingSenderId: "858384599587",
    appId: "1:858384599587:web:b296c3f0eca007d4f9bf96",
    measurementId: "G-7H1WSYJER7"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); 
export const db = getFirestore(app); 
export const analytics = getAnalytics(app);
export const storage = getStorage(app); 
