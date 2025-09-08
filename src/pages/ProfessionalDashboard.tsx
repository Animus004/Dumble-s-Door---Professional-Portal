import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProfessionalStatus } from '../types';
import Badge from '../components/Badge';

const ProfessionalDashboard: React.FC = () => {
    const { user } = useAuth();
    const profile = user?.veterinarian_profile || user?.vendor_profile;
    
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Welcome, {user?.veterinarian_profile?.full_name || user?.vendor_profile?.business_name}!</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Your profile status:</h3>
                    <Badge status={profile?.status || ProfessionalStatus.Pending} />
                </div>
                 {profile?.status === ProfessionalStatus.Pending && <p className="text-gray-600 dark:text-gray-400 mt-2">Your profile is currently being reviewed by our team. You will be notified once the status changes.</p>}
                 {profile?.status === ProfessionalStatus.Approved && <p className="text-gray-600 dark:text-gray-400 mt-2">Your profile is approved and visible to customers. Welcome aboard!</p>}
                 {profile?.status === ProfessionalStatus.Rejected && <p className="text-red-600 dark:text-red-400 mt-2">Unfortunately, your profile could not be approved at this time. Please check your email for more details.</p>}
            </div>
        </div>
    )
};

export default ProfessionalDashboard;
