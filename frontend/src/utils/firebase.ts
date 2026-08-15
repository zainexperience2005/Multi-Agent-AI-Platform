// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAzh7hGqlCBCvpdvI2ADCLFVHubWH3O_aQ",
  authDomain: "nexus-ai-8bb57.firebaseapp.com",
  projectId: "nexus-ai-8bb57",
  storageBucket: "nexus-ai-8bb57.firebasestorage.app",
  messagingSenderId: "215645500285",
  appId: "1:215645500285:web:ef87a500d54beae0ee5214",
  measurementId: "G-4HDD2GHEH4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

