import React, { useState } from 'react';
import { VendorProfile } from '../types';
import * as ApiService from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Input from '../components/Input';

const MyProfileVendor: React.FC = () => {
    const { user, setUser } = useAuth();
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<VendorProfile>>(user?.vendor_profile || {});
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
     const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user) return;
        setIsSaving(true);
        try {
            const updatedUser = await ApiService.updateVendorProfile(user.auth_user_id, formData);
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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Business Profile</h1>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Business Name" name="business_name" value={formData.business_name} onChange={handleChange} />
                    <Input label="Business Phone" name="business_phone" value={formData.business_phone} onChange={handleChange} />
                    <Input label="License Number" name="license_number" value={formData.license_number} onChange={handleChange} />
                    <Input label="GST Number" name="gst_number" value={formData.gst_number || ''} onChange={handleChange} required={false}/>
                </div>
                <Input label="Business Address" name="business_address" value={formData.business_address} onChange={handleChange} />
                <Input as="textarea" label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe your business..."/>
                 <div>
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MyProfileVendor;
