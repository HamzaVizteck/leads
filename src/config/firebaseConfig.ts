// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // Importing the authentication module

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDFjh62d3GDUQFhhjrZd6zBSyml5F-ohiE",
  authDomain: "leads-management-93245.firebaseapp.com",
  projectId: "leads-management-93245",
  storageBucket: "leads-management-93245.firebasestorage.app",
  messagingSenderId: "458457615272",
  appId: "1:458457615272:web:b074c3b1207834131b2b9d",
  measurementId: "G-NC7QYRHH2X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); // Exporting the auth instance

export default app;
