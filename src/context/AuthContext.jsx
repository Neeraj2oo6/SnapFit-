import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(authService.getCurrentUser()));
  const [onboardingCompleted, setOnboardingCompleted] = useState(() => {
    const cur = authService.getCurrentUser();
    return Boolean(cur?.onboardingCompleted);
  });
  const [loading, setLoading] = useState(true);

  // Subscribe to real Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setIsLoggedIn(true);
        setOnboardingCompleted(Boolean(currentUser.onboardingCompleted));
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setOnboardingCompleted(false);
      }
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      setUser(data.user);
      setIsLoggedIn(true);
      const isDone = Boolean(data.user?.onboardingCompleted);
      setOnboardingCompleted(isDone);
      return { ...data, onboardingCompleted: isDone };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password);
      setUser(data.user);
      setIsLoggedIn(true);
      setOnboardingCompleted(false);
      return { ...data, onboardingCompleted: false };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setIsLoggedIn(false);
      setOnboardingCompleted(false);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    return await authService.sendPasswordReset(email);
  };

  const updateUserProfile = async (updatedFields) => {
    if (!user?.uid) return;
    try {
      const updated = await authService.updateProfile(user.uid, updatedFields);
      setUser(updated);
      return updated;
    } catch (err) {
      console.error('Failed to update profile:', err);
      throw err;
    }
  };

  const completeOnboarding = async (onboardingData) => {
    if (!user?.uid) return;
    try {
      const updated = await authService.saveOnboardingData(user.uid, onboardingData);
      setUser(updated);
      setOnboardingCompleted(true);
      return updated;
    } catch (err) {
      console.error('Failed to save onboarding data:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        onboardingCompleted,
        loading,
        login,
        register,
        logout,
        resetPassword,
        updateUserProfile,
        completeOnboarding
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
