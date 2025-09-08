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

// Add global declarations to fix TypeScript errors.
declare global {
  interface Window {
    google: any;
  }
  interface ImportMeta {
    readonly env: {
      readonly VITE_GOOGLE_MAPS_API_KEY: string;
    };
  }
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <MainApp />
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
