import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';

export const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [favorites, setFavorites] = useState([]);

  // Load favorites from AsyncStorage when user changes
  useEffect(() => {
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    try {
      const key = user ? `favorites_${user.uid}` : 'favorites_guest';
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setFavorites(JSON.parse(stored));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    }
  };

  const saveFavorites = async (newFavorites) => {
    try {
      const key = user ? `favorites_${user.uid}` : 'favorites_guest';
      await AsyncStorage.setItem(key, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const toggleFavorite = (productId) => {
    setFavorites((prevFavorites) => {
      const isFavorite = prevFavorites.includes(productId);
      const newFavorites = isFavorite
        ? prevFavorites.filter((id) => id !== productId)
        : [...prevFavorites, productId];
      
      saveFavorites(newFavorites);
      return newFavorites;
    });
  };

  const isFavorite = (productId) => {
    return favorites.includes(productId);
  };

  const clearFavorites = async () => {
    try {
      const key = user ? `favorites_${user.uid}` : 'favorites_guest';
      await AsyncStorage.removeItem(key);
      setFavorites([]);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}
