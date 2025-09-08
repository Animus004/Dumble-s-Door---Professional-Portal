import React, { useState, useEffect, createContext } from 'react';
import { UserProfile, UserRole } from '../types';
import * as ApiService from '../services/geminiService';

export interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<string | null>;
  signUp: (email: string, pass: string, role: UserRole) => Promise<string | null>;
  signOut: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
    try {
      const storedUser = localStorage.getItem('dumble_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('dumble_user');
    }
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, pass: string) => {
    const { user, error } = await ApiService.mockSignIn(email, pass);
    if (user) {
      setUser(user);
      localStorage.setItem('dumble_user', JSON.stringify(user));
    }
    return error;
  };
  
  const signUp = async (email: string, pass: string, role: UserRole) => {
     const { user, error } = await ApiService.mockSignUp(email, pass, role);
     if (user) {
      setUser(user);
      // Don't store in localStorage until onboarding is complete in a real app
      // But for this mock, we'll store it to persist login state.
      localStorage.setItem('dumble_user', JSON.stringify(user));
     }
     return error;
  };

  const signOut = async () => {
    await ApiService.mockSignOut();
    setUser(null);
    localStorage.removeItem('dumble_user');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
