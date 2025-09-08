import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ProfessionalStatus, ProfileAnalytics, UserProfile, VerificationDocument, DocumentType } from '../types';
import Badge from '../components/Badge';
import Skeleton from '../components/Skeleton';
import * as ApiService from '../services/supabaseService';
import clsx from 'clsx';

const AnalyticsCard: React.FC<{ title: string; value: string | number; change: number; isLoading: boolean }> = ({ title, value, change, isLoading }) => {
    const isIncrease = change >= 0;
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        );
    }
    return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h4>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
            <p className={clsx('text-sm flex items-center', isIncrease ? 'text-green-500' : 'text-red-500')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isIncrease ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />}
                </svg>
                <span>{Math.abs(change)}% {isIncrease ? 'increase' : 'decrease'} vs last month</span>
            </p>
        </div>
    );
};

const ProfileAnalyticsDashboard = () => {
    const [analytics, setAnalytics] = useState<ProfileAnalytics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        ApiService.getProfileAnalytics().then(({ data }) => {
            if (data) setAnalytics(data);
            setIsLoading(false);
        });
    }, []);

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Your Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AnalyticsCard title="Profile Views" value={analytics?.profile_views.total ?? 0} change={analytics?.profile_views.change ?? 0} isLoading={isLoading} />
                <AnalyticsCard title="Appointments Booked" value={analytics?.appointments_booked.total ?? 0} change={analytics?.appointments_booked.change ?? 0} isLoading={isLoading} />
                <AnalyticsCard title="Conversion Rate" value={`${analytics?.conversion_rate.value ?? 0}%`} change={analytics?.conversion_rate.change ?? 0} isLoading={isLoading} />
            </div>
        </div>
    );
};

const SubscriptionWidget: React.FC<{ user: UserProfile }> = ({ user }) => {
    const isPremium = user.subscription_status === 'premium';
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mt-6">
             <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Subscription Status</h3>
             <div className="flex items-center justify-between">
                <div>
                    <p className={clsx("font-bold text-xl", isPremium ? "text-amber-500" : "text-green-500")}>{isPremium ? 'Premium Plan' : 'Free Plan'}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{isPremium ? 'Your profile has enhanced visibility.' : 'Upgrade to get more views and bookings.'}</p>
                </div>
                {!isPremium && <button className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors">Upgrade Now</button>}
             </div>
        </div>
    );
};

const RenewalReminders: React.FC<{ user: UserProfile }> = ({ user }) => {
    // Mock data for this example
    const documents: Partial<VerificationDocument>[] = [
        { document_type: DocumentType.License, expires_at: new Date(Date.now() + 2592000000).toISOString() }, // 30 days from now
        { document_type: DocumentType.Degree, expires_at: undefined },
    ];

    const expiringDocs = documents.filter(d => d.expires_at && new Date(d.expires_at).getTime() < Date.now() + 2592000000 * 2); // expiring in next 60 days
    if (expiringDocs.length === 0) return null;

    return (
        <div className="bg-yellow-50 dark:bg-yellow-900/50 border-l-4 border-yellow-400 p-4 mt-6 rounded-r-lg">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                     <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">Renewals Needed</h3>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-yellow-700 dark:text-yellow-300">
                        {expiringDocs.map(doc => (
                            <li key={doc.document_type}>{doc.document_type?.replace('_', ' ')} expires on {new Date(doc.expires_at as string).toLocaleDateString()}.</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};


const ProfessionalDashboard: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;
    const profile = user.veterinarian_profile || user.vendor_profile;
    
    return (
        <div>
            {/* FIX: Correctly access profile name from user object to avoid type errors on the profile union type. */}
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Welcome, {user.veterinarian_profile?.full_name || user.vendor_profile?.business_name}!</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Your profile status:</h3>
                    <Badge status={profile?.status || ProfessionalStatus.Pending} />
                </div>
                 {profile?.status === ProfessionalStatus.Pending && <p className="text-gray-600 dark:text-gray-400 mt-2">Your profile is currently being reviewed by our team. You will be notified once the status changes.</p>}
                 {profile?.status === ProfessionalStatus.Approved && <p className="text-gray-600 dark:text-gray-400 mt-2">Your profile is approved and visible to customers. Welcome aboard!</p>}
                 {profile?.status === ProfessionalStatus.Rejected && <p className="text-red-600 dark:text-red-400 mt-2">Unfortunately, your profile could not be approved at this time. Please check your email for more details.</p>}
            </div>

            <RenewalReminders user={user} />
            <ProfileAnalyticsDashboard />
            <SubscriptionWidget user={user} />
        </div>
    )
};

export default ProfessionalDashboard;