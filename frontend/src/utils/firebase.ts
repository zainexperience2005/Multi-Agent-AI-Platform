// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAnalytics } from "firebase/analytics"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCSID2XxQdZl8-hpXVZr3uQEz7M9e_q92o",
  authDomain: "multi-agent-ai-platform-cd449.firebaseapp.com",
  projectId: "multi-agent-ai-platform-cd449",
  storageBucket: "multi-agent-ai-platform-cd449.firebasestorage.app",
  messagingSenderId: "655515051149",
  appId: "1:655515051149:web:f2d567fe7ec1eba3ee6ec4",
  measurementId: "G-755DJCZ0VT",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
