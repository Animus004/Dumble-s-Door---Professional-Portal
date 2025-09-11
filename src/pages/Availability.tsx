import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import * as ApiService from '../services/supabaseService';
import Input from '../components/Input';

const Availability: React.FC = () => {
    const { user, setUser } = useAuth();
    const { addToast } = useToast();
    const [hours, setHours] = useState(user?.veterinarian_profile?.clinics?.[0]?.working_hours || {});
    const [isSaving, setIsSaving] = useState(false);

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    const handleTimeChange = (day: string, field: string, value: string) => {
        setHours((prev: any) => ({
            ...prev,
            [day]: { ...prev[day], [field]: value }
        }));
    };

    const handleClosedToggle = (day: string) => {
        setHours((prev: any) => ({
            ...prev,
            [day]: { ...prev[day], closed: !prev[day]?.closed }
        }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.veterinarian_profile) return;
        setIsSaving(true);

        const updatedClinics = [...user.veterinarian_profile.clinics];
        updatedClinics[0] = { ...updatedClinics[0], working_hours: hours };

        const { updatedProfile, error } = await ApiService.updateVeterinarianProfile(user.auth_user_id, { clinics: updatedClinics });

        if (error || !updatedProfile) {
            console.error("Failed to update availability", error);
            addToast(error?.message || 'Failed to update availability.', 'error');
        } else {
            setUser(updatedProfile);
            localStorage.setItem('dumble_user', JSON.stringify(updatedProfile));
            addToast('Availability updated successfully!', 'success');
        }
        setIsSaving(false);
    };

    return (
         <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Manage Availability</h1>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                <p className="mb-6 text-gray-600 dark:text-gray-400">Set your working hours for your primary clinic. This will be visible to pet parents searching for appointments.</p>
                <div className="space-y-4">
                    {days.map(day => (
                        <div key={day} className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4 items-center">
                            <span className="font-medium capitalize text-gray-700 dark:text-gray-300">{day}</span>
                            <div className="col-span-1 sm:col-span-2 flex items-center gap-2">
                                <Input label="" name={`${day}-start`} type="time" value={(hours as any)[day]?.start || ''} onChange={e => handleTimeChange(day, 'start', e.target.value)} disabled={(hours as any)[day]?.closed} />
                                <span className="text-gray-500 dark:text-gray-400">to</span>
                                <Input label="" name={`${day}-end`} type="time" value={(hours as any)[day]?.end || ''} onChange={e => handleTimeChange(day, 'end', e.target.value)} disabled={(hours as any)[day]?.closed} />
                            </div>
                            <div className="flex items-center justify-self-start sm:justify-self-center">
                                <input type="checkbox" id={`${day}-closed`} checked={(hours as any)[day]?.closed || false} onChange={() => handleClosedToggle(day)} className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-gray-700" />
                                <label htmlFor={`${day}-closed`} className="ml-2 text-sm text-gray-600 dark:text-gray-400">Closed</label>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="mt-8">
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isSaving ? 'Saving...' : 'Save Availability'}
                    </button>
                </div>
            </form>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mt-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Calendar Integration</h2>
                <p className="mb-4 text-gray-600 dark:text-gray-400">Sync your Dumble's Door schedule with your external calendars to avoid booking conflicts.</p>
                <div className="flex items-center space-x-4">
                    <button onClick={() => addToast('Google Calendar integration is coming soon!', 'success')} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center">
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#EA4335" d="M16 33.1c0 1.9.8 3.7 2.1 4.9l-3.3 3.3c-2.2-2-3.8-4.8-3.8-7.9V16.6H28v4.6H16v11.9z"></path><path fill="#4285F4" d="M36.1 43.3l-3.3-3.3c1.3-1.3 2.2-3.1 2.2-5V16.6h4.6v18.1c0 3.1-1.5 5.9-3.5 7.9z"></path><path fill="#34A853" d="M11 16.6c-1.9 0-3.7-.8-4.9-2.1l-3.3 3.3c2 2.2 4.8 3.8 7.9 3.8h18.4v-4.6H11.3l-.3-.4z"></path><path fill="#FBBC04" d="M43.3 11.2l-3.3 3.3C38.7 13.2 37 12 35 12H16.6v-4.6h18.1c3.1 0 5.9 1.5 7.9 3.5z"></path><path fill="#4285F4" d="M33.4 24.1c0-5.2-4.2-9.4-9.4-9.4s-9.4 4.2-9.4 9.4c0 5.2 4.2 9.4 9.4 9.4s9.4-4.2 9.4-9.4z"></path></svg>
                        Connect with Google Calendar
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Feature coming soon.</p>
            </div>
        </div>
    );
};

export default Availability;