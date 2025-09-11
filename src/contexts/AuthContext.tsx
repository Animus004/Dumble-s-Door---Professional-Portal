import React, { useState, useEffect, createContext, useCallback } from 'react';
import { UserProfile, UserRole } from '../types';
import * as ApiService from '../services/supabaseService';
import { AuthError, Session, User } from '@supabase/supabase-js';

export interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, pass: string, role: UserRole) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (session: Session | null) => {
    if (session?.user) {
      const profile = await ApiService.getCurrentUserProfile(session.user.id);
      setUser(profile);
      // Persist to localStorage for faster initial loads on refresh
      if (profile) {
        localStorage.setItem('dumble_user', JSON.stringify(profile));
      } else {
        localStorage.removeItem('dumble_user');
      }
    } else {
      setUser(null);
      localStorage.removeItem('dumble_user');
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    // Attempt to load user from localStorage first for faster UI response,
    // while the real session check happens via the listener.
    const storedUser = localStorage.getItem('dumble_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('dumble_user');
      }
    }

    // The onAuthStateChange listener is the single source of truth.
    // It fires immediately with the current session state and listens for changes.
    const { data: { subscription } } = ApiService.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await fetchUserProfile(session);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signIn: AuthContextType['signIn'] = async (email, pass) => {
    return ApiService.signIn(email, pass);
  };
  
  const signUp: AuthContextType['signUp'] = async (email, pass, role) => {
     const { data, error } = await ApiService.signUp(email, pass, role);
     return { user: data.user, error };
  };

  const signOut: AuthContextType['signOut'] = async () => {
    const { error } = await ApiService.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
      localStorage.removeItem('dumble_user');
    }
    return { error };
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signIn, signUp, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
