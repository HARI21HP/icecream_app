// firebaseConfig.js

// Import Firebase core + modules
import { initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import { initializeFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Your Firebase project configuration (VEE-ONE)
const firebaseConfig = {
  apiKey: "AIzaSyArHAvaY3IQflhNLY8ltkYgUX0JQQIxF8c",
  authDomain: "vee-one-7ec61.firebaseapp.com",
  projectId: "vee-one-7ec61",
  storageBucket: "vee-one-7ec61.appspot.com",
  messagingSenderId: "144639120405",
  appId: "1:144639120405:web:YOUR_APP_ID_HERE", // 🔹 Replace with actual App ID from Firebase Console
};

// Initialize Firebase app (only once)
const app = initializeApp(firebaseConfig);

// Initialize Auth with platform-specific persistence
let auth;
try {
  if (typeof window !== "undefined") {
    // Web (Browser or Expo Web)
    auth = getAuth(app);
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  } else {
    // React Native (Android / iOS)
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  }
} catch (error) {
  // If already initialized
  auth = getAuth(app);
}

// Initialize Firestore with long polling (helps in mobile/VPN environments)
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

// Initialize Storage
const storage = getStorage(app);

// Export everything
export { auth, db, storage };
export default app;
