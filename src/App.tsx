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
import { supabaseUrl, supabaseAnonKey } from './supabaseClient'; // Import the variables

// Add global declarations to fix TypeScript errors.
declare global {
  interface Window {
    google: any;
  }
}

// A new component to show a clear error message
const MissingEnvVarsError: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-800 p-4">
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-2">Configuration Error</h1>
      <p>The Supabase URL or Key is missing. Please set them as Environment Variables in your Vercel project settings.</p>
    </div>
  </div>
);


const App: React.FC = () => {
  // This check now happens safely inside the component
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

    const isProfileIncomplete = user.role !== UserRole.Admin && !user.veterinarian_profile && !user.vendor_profile;
    if (isProfileIncomplete) {
        return <OnboardingFlow />;
    }

    return <DashboardLayout />;
};

export default App;