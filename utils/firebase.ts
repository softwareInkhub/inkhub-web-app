import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC0kLxRiw__uRm4AphkGbZX2h4o5Mqi29M",
    authDomain: "inkhub-admin-v2.firebaseapp.com",
    projectId: "inkhub-admin-v2",
    storageBucket: "inkhub-admin-v2.firebasestorage.app",
    messagingSenderId: "313666062878",
    appId: "1:313666062878:web:39692b1b66db96cb08bc0f",
    measurementId: "G-JR6GD05DHE"
  };
  

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app); 