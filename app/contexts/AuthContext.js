import React, { createContext, useState, useEffect, useMemo } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, storage, db } from '../config/firebase';

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

      const imageRef = ref(storage, `profilePictures/${user.uid}`);
      const response = await fetch(imageUri);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      const photoURL = await getDownloadURL(imageRef);

      await updateProfile(auth.currentUser, { photoURL });
      await setDoc(doc(db, 'users', user.uid), { photoURL }, { merge: true });

      setUser({ ...user, photoURL });
      return { success: true, photoURL };
    } catch (error) {
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
      updateProfilePicture 
    }), 
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

