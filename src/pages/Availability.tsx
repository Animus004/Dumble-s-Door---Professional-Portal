import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import * as ApiService from '../services/geminiService';
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

        try {
            const updatedUser = await ApiService.updateVeterinarianProfile(user.auth_user_id, { clinics: updatedClinics });
            setUser(updatedUser);
            localStorage.setItem('dumble_user', JSON.stringify(updatedUser));
            addToast('Availability updated successfully!', 'success');
        } catch (error) {
            console.error("Failed to update availability", error);
            addToast('Failed to update availability.', 'error');
        } finally {
            setIsSaving(false);
        }
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
        </div>
    );
};

export default Availability;
