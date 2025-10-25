// Firebase Configuration - Centralized config file
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
import { Platform } from "react-native";

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyDWUQUTwTMWOtZbu2pWWNNrM8F-irgBmjk",
  authDomain: "vee-one-33b07.firebaseapp.com",
  projectId: "vee-one-33b07",
  storageBucket: "vee-one-33b07.appspot.com",
  messagingSenderId: "159982977729",
  appId: "1:159982977729:web:6a0c3c6b0a33a88d770a40"
};

// Initialize Firebase app (only once)
const app = initializeApp(firebaseConfig);

// Initialize Auth with platform-specific persistence
let auth;
try {
  if (Platform.OS === "web") {
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
  // If auth is already initialized, get the existing instance
  auth = getAuth(app);
}

// Initialize Firestore with long polling (helps in mobile/VPN environments)
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
});

// Initialize Storage
const storage = getStorage(app);

// Export instances (import auth functions directly from firebase/auth in components)
export { app, auth, db, storage };
export default app;
