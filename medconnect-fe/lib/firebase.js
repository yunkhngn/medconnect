// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDVhKvRppmWjfg8RLylH6YE6G7Q1a0CPOM",
  authDomain: "medconnect-2eaff.firebaseapp.com",
  projectId: "medconnect-2eaff",
  storageBucket: "medconnect-2eaff.firebasestorage.app",
  messagingSenderId: "183795808131",
  appId: "1:183795808131:web:f367eea401528b3bf168b6",
  measurementId: "G-LF9M9EJ4J8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();

// Analytics (check trước khi chạy vì nó chỉ hoạt động trên trình duyệt)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app);
  });
}

export default app;
