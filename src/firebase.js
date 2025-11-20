// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyB4cCXP3PPtaTaSjVWtPKbWdJo5TOw_FTE",
  authDomain: "wondcord.firebaseapp.com",
  databaseURL: "https://wondcord-default-rtdb.firebaseio.com",
  projectId: "wondcord",
  storageBucket: "wondcord.appspot.com",
  messagingSenderId: "614084629601",
  appId: "1:614084629601:web:484309313e153ba80a0620",
  measurementId: "G-JFLSXRGXGM"
};

// Firebase app'i başlat
const app = initializeApp(firebaseConfig);

// Firestore referansını al
export const db = getFirestore(app);
export default app;
