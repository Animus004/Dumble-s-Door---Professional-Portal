import React, { useState } from 'react';
import { VendorProfile, PortfolioItem } from '../types';
import * as ApiService from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Input from '../components/Input';
import Modal from '../components/Modal';
import NotificationPreferencesComponent from '../components/NotificationPreferences';

const PortfolioManager: React.FC<{
    items: PortfolioItem[];
    onUpdate: (items: PortfolioItem[]) => void;
}> = ({ items, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<PortfolioItem> | null>(null);

    const handleSave = (itemToSave: Partial<PortfolioItem>) => {
        let updatedItems;
        if (itemToSave.id) {
            updatedItems = items.map(item => item.id === itemToSave.id ? itemToSave as PortfolioItem : item);
        } else {
            updatedItems = [...items, { ...itemToSave, id: `portfolio-${Date.now()}` } as PortfolioItem];
        }
        onUpdate(updatedItems);
        setIsModalOpen(false);
        setCurrentItem(null);
    };

    const handleDelete = (id: string) => {
        if(window.confirm('Are you sure you want to delete this portfolio item?')) {
            onUpdate(items.filter(item => item.id !== id));
        }
    };

    const handleAddNew = () => {
        setCurrentItem({});
        setIsModalOpen(true);
    };

    const handleEdit = (item: PortfolioItem) => {
        setCurrentItem(item);
        setIsModalOpen(true);
    };

    const PortfolioForm = () => {
        const [formState, setFormState] = useState(currentItem || {});
        return (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(formState); }} className="space-y-4">
                <Input label="Title" name="title" value={formState.title || ''} onChange={(e) => setFormState({...formState, title: e.target.value})} required />
                <Input as="textarea" label="Description" name="description" value={formState.description || ''} onChange={(e) => setFormState({...formState, description: e.target.value})} required />
                <p className="text-sm text-gray-600 dark:text-gray-400">Image uploads are mocked. In a real app, this would be a file input.</p>
                <Input label="Before Image URL" name="before_image_url" value={formState.before_image_url || 'https://via.placeholder.com/400x300.png?text=Before'} onChange={(e) => setFormState({...formState, before_image_url: e.target.value})} />
                <Input label="After Image URL" name="after_image_url" value={formState.after_image_url || 'https://via.placeholder.com/400x300.png?text=After'} onChange={(e) => setFormState({...formState, after_image_url: e.target.value})} />
                <div className="pt-4 flex justify-end space-x-2">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg">Save Item</button>
                </div>
            </form>
        );
    }

    return (
        <div className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Portfolio</h3>
                <button type="button" onClick={handleAddNew} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700">Add New</button>
            </div>
            {items.length === 0 ? <p className="text-gray-500 dark:text-gray-400">Showcase your products or services by adding portfolio items.</p> : (
                <div className="space-y-4">
                    {items.map(item => (
                        <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-md flex justify-between items-start">
                           <div>
                                <h4 className="font-bold">{item.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                           </div>
                           <div className="space-x-2 flex-shrink-0 ml-4">
                               <button type="button" onClick={() => handleEdit(item)} className="text-blue-600 dark:text-blue-400 hover:underline text-sm">Edit</button>
                               <button type="button" onClick={() => handleDelete(item.id)} className="text-red-600 dark:text-red-400 hover:underline text-sm">Delete</button>
                           </div>
                        </div>
                    ))}
                </div>
            )}
            {isModalOpen && <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentItem?.id ? 'Edit Portfolio Item' : 'Add Portfolio Item'}><PortfolioForm /></Modal>}
        </div>
    );
};

const MyProfileVendor: React.FC = () => {
    const { user, setUser } = useAuth();
    const { addToast } = useToast();
    const [formData, setFormData] = useState<Partial<VendorProfile>>(user?.vendor_profile || {});
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

     const handlePortfolioUpdate = (portfolio: PortfolioItem[]) => {
        setFormData(prev => ({ ...prev, portfolio }));
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
            <div className="space-y-8">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md space-y-6">
                    <div>
                         <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2 dark:border-gray-700">Business Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input label="Business Name" name="business_name" value={formData.business_name} onChange={handleChange} required minLength={3}/>
                            <Input label="Business Phone" name="business_phone" type="tel" pattern="[0-9]{10,12}" title="Please enter a valid phone number (10-12 digits)" value={formData.business_phone} onChange={handleChange} required/>
                            <Input label="License Number" name="license_number" value={formData.license_number} onChange={handleChange} required minLength={5}/>
                            <Input label="GST Number" name="gst_number" value={formData.gst_number || ''} onChange={handleChange} pattern="^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$" title="Enter a valid GST number (e.g., 29ABCDE1234F1Z5)"/>
                        </div>
                        <Input label="Business Address" name="business_address" value={formData.business_address} onChange={handleChange} required minLength={10}/>
                        <Input as="textarea" label="Description" name="description" value={formData.description} onChange={(e) => handleChange(e as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>)} placeholder="Describe your business..." required minLength={20}/>
                    </div>

                     <div className="pt-4">
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2 dark:border-gray-700">Showcase</h2>
                        <PortfolioManager items={formData.portfolio || []} onUpdate={handlePortfolioUpdate} />
                    </div>
                     <div>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                     <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2 dark:border-gray-700">Account Settings</h2>
                     <NotificationPreferencesComponent />
                </div>
            </div>
        </div>
    );
};

export default MyProfileVendor;