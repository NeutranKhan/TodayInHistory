import { initializeApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC9prO7oRBGLhbGpcZqIqq0a3KvsOuxUlY",
  authDomain: "todayinhistory-eb25d.firebaseapp.com",
  projectId: "todayinhistory-eb25d",
  storageBucket: "todayinhistory-eb25d.firebasestorage.app",
  messagingSenderId: "779610209169",
  appId: "1:779610209169:web:990308187c2eae0b9fb830",
  measurementId: "G-CYZDDK7CL3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const db = getFirestore(app);
const auth = getAuth(app);

// Analytics only run on client side
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((yes) => yes && (analytics = getAnalytics(app)));
}

export { app, db, auth, analytics };
