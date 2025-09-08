import React, { useState } from 'react';
import { VendorProfile } from '../types';
import * as ApiService from '../services/supabaseService';
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
        const { updatedProfile, error } = await ApiService.updateVendorProfile(user.auth_user_id, formData);
        
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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Business Profile</h1>
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input label="Business Name" name="business_name" value={formData.business_name} onChange={handleChange} required minLength={3}/>
                    <Input label="Business Phone" name="business_phone" type="tel" pattern="[0-9]{10,12}" title="Please enter a valid phone number (10-12 digits)" value={formData.business_phone} onChange={handleChange} required/>
                    <Input label="License Number" name="license_number" value={formData.license_number} onChange={handleChange} required minLength={5}/>
                    <Input label="GST Number" name="gst_number" value={formData.gst_number || ''} onChange={handleChange} pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$" title="Enter a valid GST number (e.g., 29ABCDE1234F1Z5)"/>
                </div>
                <Input label="Business Address" name="business_address" value={formData.business_address} onChange={handleChange} required minLength={10}/>
                <Input as="textarea" label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Describe your business..." required minLength={20}/>
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
