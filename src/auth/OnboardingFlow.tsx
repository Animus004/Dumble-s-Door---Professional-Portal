import React from 'react';
import { UserProfile, UserRole } from '../types';
import { useAuth } from '../hooks/useAuth';
import VeterinarianOnboardingForm from './VeterinarianOnboardingForm';
import VendorOnboardingForm from './VendorOnboardingForm';

const OnboardingFlow: React.FC = () => {
    const { user, setUser, signOut } = useAuth();
    
    const handleOnboardingComplete = (updatedUser: UserProfile) => {
        setUser(updatedUser);
        localStorage.setItem('dumble_user', JSON.stringify(updatedUser));
    };

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="w-full max-w-2xl">
                 <div className="text-right mb-2">
                    <button onClick={signOut} className="text-sm text-gray-500 hover:underline dark:text-gray-400">Logout</button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-lg shadow-lg">
                    {user.role === UserRole.Veterinarian && <VeterinarianOnboardingForm user={user} onComplete={handleOnboardingComplete} />}
                    {user.role === UserRole.Vendor && <VendorOnboardingForm user={user} onComplete={handleOnboardingComplete} />}
                </div>
            </div>
        </div>
    );
}

export default OnboardingFlow;
