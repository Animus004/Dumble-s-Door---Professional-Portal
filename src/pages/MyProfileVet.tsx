import React, { useState } from 'react';
import { VeterinarianProfile } from '../types';
import * as ApiService from '../services/geminiService';
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
        try {
            const updatedUser = await ApiService.updateVeterinarianProfile(user.auth_user_id, formData);
            setUser(updatedUser);
            localStorage.setItem('dumble_user', JSON.stringify(updatedUser));
            addToast('Profile updated successfully!', 'success');
        } catch (error) {
            console.error("Failed to update profile", error);
            addToast('Failed to update profile.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">My Profile</h1>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} />
                    <Input label="License Number" name="license_number" value={formData.license_number} onChange={handleChange} />
                    <Input label="Years of Experience" name="experience_years" type="number" value={formData.experience_years || 0} onChange={handleChange} />
                    <Input label="Consultation Fee (INR)" name="consultation_fee" type="number" value={formData.consultation_fee || 0} onChange={handleChange} />
                 </div>
                 <Input as="textarea" label="Bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell patients about yourself..."/>
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
