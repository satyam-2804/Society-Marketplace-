import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBc-hwH_PI8RYfZSgDHth13JmZdSk4Zvis",
  authDomain: "excellent-star-nds98.firebaseapp.com",
  projectId: "excellent-star-nds98",
  storageBucket: "excellent-star-nds98.firebasestorage.app",
  messagingSenderId: "101329829320",
  appId: "1:101329829320:web:2434dc95ca1dfed9bc14fd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Use custom Firestore database ID
const db = getFirestore(app, "ai-studio-manokamnaapartme-224d8477-7a45-4a3c-8880-50d1202809ee");

let messaging: Messaging | null = null;
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app);
  }
}).catch((err) => {
  console.warn("FCM is not supported in this environment:", err);
});

export { app, auth, db, messaging };
