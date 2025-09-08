import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { NotificationPreferences } from '../types';
import * as ApiService from '../services/supabaseService';

const Toggle: React.FC<{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}> = ({ label, checked, onChange, disabled }) => (
    <label className="flex items-center justify-between cursor-pointer">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <div className="relative">
            <input 
                type="checkbox" 
                className="sr-only" 
                checked={checked} 
                onChange={e => onChange(e.target.checked)}
                disabled={disabled}
            />
            <div className="block bg-gray-200 dark:bg-gray-600 w-12 h-6 rounded-full"></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-6 bg-blue-500' : ''}`}></div>
        </div>
    </label>
);


const NotificationPreferencesComponent: React.FC = () => {
    const { user, setUser } = useAuth();
    const { addToast } = useToast();
    const [preferences, setPreferences] = useState<NotificationPreferences>(user!.notification_preferences);
    const [isSaving, setIsSaving] = useState(false);

    const handlePreferenceChange = (category: 'in_app' | 'email', key: 'status_changes' | 'new_applicants', value: boolean) => {
        setPreferences(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value,
            }
        }));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        const { updatedProfile, error } = await ApiService.updateNotificationPreferences(user!.auth_user_id, preferences);
        if (error || !updatedProfile) {
            addToast(error?.message || 'Failed to update preferences.', 'error');
        } else {
            setUser(updatedProfile);
            addToast('Notification preferences saved!', 'success');
        }
        setIsSaving(false);
    };

    return (
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Notification Settings</h3>
            <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-300 mb-2">In-App Notifications</h4>
                    <div className="space-y-2">
                        <Toggle 
                            label="Profile Status Changes" 
                            checked={preferences.in_app.status_changes} 
                            onChange={val => handlePreferenceChange('in_app', 'status_changes', val)}
                        />
                    </div>
                </div>
                 <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-300 mb-2">Email Notifications</h4>
                     <div className="space-y-2">
                         <Toggle 
                            label="Profile Status Changes" 
                            checked={preferences.email.status_changes} 
                            onChange={val => handlePreferenceChange('email', 'status_changes', val)}
                        />
                    </div>
                </div>
                <div className="pt-4 flex justify-end">
                    <button 
                        onClick={handleSaveChanges} 
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isSaving ? 'Saving...' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationPreferencesComponent;