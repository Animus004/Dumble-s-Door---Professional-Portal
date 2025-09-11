import React from 'react';
import { UserRole } from './types';
import { useAuth } from './hooks/useAuth';
import Spinner from './components/Spinner';
import AuthForm from './auth/AuthForm';
import OnboardingFlow from './auth/OnboardingFlow';
import DashboardLayout from './layouts/DashboardLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import { NotificationProvider } from './contexts/NotificationContext';
import { supabaseUrl, supabaseAnonKey } from './supabaseClient';

// Add global declarations to fix TypeScript errors.
declare global {
  interface Window {
    google: any;
  }
  // FIX: Extend `ImportMetaEnv` to add type definitions for environment variables
  // instead of redeclaring `ImportMeta`. This resolves a TypeScript error about
  // subsequent property declarations having mismatched types.
  interface ImportMetaEnv {
    readonly VITE_GOOGLE_MAPS_API_KEY: string;
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
  }
}

const MissingEnvVarsError: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 text-center">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-lg">
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Configuration Error</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          The application is missing required environment variables for Supabase. Please make sure
          <code className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 font-mono p-1 rounded mx-1">VITE_SUPABASE_URL</code> and
          <code className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 font-mono p-1 rounded mx-1">VITE_SUPABASE_ANON_KEY</code>
          are set.
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          You may need to restart your development server after setting the variables.
        </p>
      </div>
    </div>
  );

const App: React.FC = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return <MissingEnvVarsError />;
  }
  
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <NotificationProvider>
            <ErrorBoundary>
              <MainApp />
            </ErrorBoundary>
          </NotificationProvider>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

const MainApp: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <div className="h-screen"><Spinner /></div>;
    }

    if (!user) {
        return <AuthForm />;
    }
    
    // Route to onboarding if profile is not complete
    const isProfileIncomplete = user.role !== UserRole.Admin && !user.veterinarian_profile && !user.vendor_profile;
    if (isProfileIncomplete) {
        return <OnboardingFlow />;
    }
    
    // Once onboarded, route to the appropriate dashboard
    return <DashboardLayout />;
};

export default App;