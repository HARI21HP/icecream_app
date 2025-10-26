import React, { createContext, useState, useEffect, useMemo } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { ref, uploadBytes, uploadString, getDownloadURL } from 'firebase/storage';
// Use legacy API for readAsStringAsync base64 fallback on Expo SDK 54
import * as FileSystem from 'expo-file-system/legacy';
// Safe base64 encoding constant for Expo native and web shims
const BASE64_ENCODING = (FileSystem && FileSystem.EncodingType && FileSystem.EncodingType.Base64) ? FileSystem.EncodingType.Base64 : 'base64';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, storage, db } from '../config/firebaseConfig';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || userData.displayName || '',
          photoURL: firebaseUser.photoURL || userData.photoURL || null,
          ...userData
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign up with email and password
  const signUp = async (email, password, displayName, profileImage) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let photoURL = null;

      // Upload profile image if provided
      if (profileImage) {
        const imageRef = ref(storage, `profilePictures/${user.uid}`);
        const response = await fetch(profileImage);
        const blob = await response.blob();
        await uploadBytes(imageRef, blob);
        photoURL = await getDownloadURL(imageRef);
      }

      // Update user profile
      await updateProfile(user, {
        displayName: displayName || email.split('@')[0],
        photoURL: photoURL
      });

      // Save additional user data to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName: displayName || email.split('@')[0],
        photoURL,
        createdAt: new Date().toISOString()
      });

      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Login with email and password
  const login = async (email, password) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Google Sign-In (Expo)
  const loginWithGoogle = async (idToken) => {
    try {
      setLoading(true);
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
      setLoading(false);
      return { success: true };
    } catch (error) {
      setLoading(false);
      return { success: false, error: error.message };
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Update profile picture
  const updateProfilePicture = async (imageUri) => {
    try {
      if (!user) return { success: false, error: 'No user logged in' };

      console.log('Starting upload for user:', user.uid);
      console.log('Image URI:', imageUri);

      // Generate unique filename from timestamp
      const fileName = `profile_${Date.now()}.jpg`;
      const storagePath = `profile_pictures/${user.uid}/${fileName}`;
      console.log('Storage path:', storagePath);

      // Create storage reference
      const imageRef = ref(storage, storagePath);
      console.log('Storage reference created');
      console.log('Storage bucket:', storage.app.options.storageBucket);
      
      // Upload to Firebase Storage using data_url to avoid Blob issues on RN
      console.log('Starting upload to Firebase Storage (data_url)...');
      const base64 = await FileSystem.readAsStringAsync(imageUri, { encoding: BASE64_ENCODING });
      const dataUrl = `data:image/jpeg;base64,${base64}`;
      const uploadResult = await uploadString(imageRef, dataUrl, 'data_url');
      console.log('Upload complete:', uploadResult.metadata);
      
      // Get download URL
      const photoURL = await getDownloadURL(imageRef);
      console.log('Download URL obtained:', photoURL);

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { photoURL });
      console.log('Auth profile updated');
      
      // Update Firestore users collection with profileImageUrl
      await setDoc(doc(db, 'users', user.uid), { 
        photoURL,
        profileImageUrl: photoURL,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log('Firestore updated');

      setUser({ ...user, photoURL });
      return { success: true, photoURL };
    } catch (error) {
      console.error('Upload error details:');
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error name:', error.name);
      if (error.serverResponse) {
        console.error('Server response:', error.serverResponse);
      }
      console.error('Full error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = useMemo(
    () => ({ 
      user, 
      loading, 
      login, 
      signUp, 
      logout,
      loginWithGoogle,
      updateProfilePicture 
    }), 
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
