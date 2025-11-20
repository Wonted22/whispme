import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { username, message } = req.body;

    if (!username || !message) {
      return res.status(400).json({ error: "Missing fields" });
    }

    await addDoc(collection(db, "messages"), {
      username,
      message,
      createdAt: serverTimestamp(),
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
