// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDFjh62d3GDUQFhhjrZd6zBSyml5F-ohiE",
    authDomain: "leads-management-93245.firebaseapp.com",
    projectId: "leads-management-93245",
    storageBucket: "leads-management-93245.firebasestorage.app",
    messagingSenderId: "458457615272",
    appId: "1:458457615272:web:b074c3b1207834131b2b9d",
    measurementId: "G-NC7QYRHH2X"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;
