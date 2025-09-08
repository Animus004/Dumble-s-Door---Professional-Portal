import React, { useState } from 'react';
import { VeterinarianProfile } from '../types';
import * as ApiService from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Input from '../components/Input';

const MyProfileVet: React.FC = () => {
    const { user, setUser } = useAuth();
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<VeterinarianProfile>>(user?.veterinarian_profile || {});
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user) return;
        setIsSaving(true);
        const { updatedProfile, error } = await ApiService.updateVeterinarianProfile(user.auth_user_id, formData);
        
        if (error || !updatedProfile) {
             console.error("Failed to update profile", error);
            addToast(error?.message || 'Failed to update profile.', 'error');
        } else {
            setUser(updatedProfile);
            localStorage.setItem('dumble_user', JSON.stringify(updatedProfile));
            addToast('Profile updated successfully!', 'success');
        }
        setIsSaving(false);
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">My Profile</h1>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} required minLength={3}/>
                    <Input label="License Number" name="license_number" value={formData.license_number} onChange={handleChange} required minLength={5}/>
                    <Input label="Years of Experience" name="experience_years" type="number" min="0" value={formData.experience_years || 0} onChange={handleChange} required/>
                    <Input label="Consultation Fee (INR)" name="consultation_fee" type="number" min="0" value={formData.consultation_fee || 0} onChange={handleChange} required/>
                 </div>
                 <Input as="textarea" label="Bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell patients about yourself..." required minLength={20}/>
                 <div>
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MyProfileVet;
