// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDcIvCfXx9uDhf91lQQ3ZbE9tZF7Z0neUc",
  authDomain: "miniproject-36417.firebaseapp.com",
  projectId: "miniproject-36417",
  storageBucket: "miniproject-36417.firebasestorage.app",
  messagingSenderId: "449698370050",
  appId: "1:449698370050:web:1d5535f05000cabd9e0d1b",
  measurementId: "G-DL6ZY1WNPC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
