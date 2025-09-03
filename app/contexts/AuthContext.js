import React, { createContext, useState, useMemo } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simulate login
  const login = (email, password) => {
    // Simple local check — replace with your own logic
    setUser({ email });
    return Promise.resolve();
  };

  // Simulate sign-up
  const signUp = (email, password) => {
    setUser({ email });
    return Promise.resolve();
  };

  // Simulate logout
  const logout = () => {
    setUser(null);
    return Promise.resolve();
  };

  const value = useMemo(() => ({ user, loading, login, signUp, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
