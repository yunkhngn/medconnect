// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Analytics (check trước khi chạy vì nó chỉ hoạt động trên trình duyệt)
let analytics;
if (typeof window === "undefined") {
  analytics = null;
} else if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app);
  });
}

export default app;
