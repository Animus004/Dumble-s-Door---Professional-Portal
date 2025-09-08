import React, { useState } from 'react';
import { UserProfile, BusinessType } from '../types';
import * as ApiService from '../services/geminiService';
import Input from '../components/Input';
import ProgressBar from '../components/ProgressBar';
import FileUploadComponent from '../components/FileUploadComponent';

interface OnboardingFormProps {
  user: UserProfile;
  onComplete: (user: UserProfile) => void;
}

const VendorOnboardingForm: React.FC<OnboardingFormProps> = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        business_name: '', business_type: BusinessType.PetShop, license_number: '',
        business_address: '', business_phone: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleNext = (e: React.FormEvent) => { e.preventDefault(); setStep(s => s + 1); };
    const handleBack = () => setStep(s => s - 1);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const fullProfileData = { ...formData, description: 'N/A', delivery_available: false, operating_hours: {}, services_offered: [] };
        const updatedUser = await ApiService.saveVendorProfile(user.auth_user_id, fullProfileData);
        onComplete(updatedUser);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Vendor Onboarding</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Complete your business profile to get started.</p>
            <ProgressBar currentStep={step} totalSteps={3} />
            <div className="mt-8 space-y-4">
                {step === 1 && (
                     <>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Business Information</h3>
                        <Input label="Business Name" name="business_name" value={formData.business_name} onChange={handleChange} />
                        <Input as="select" label="Business Type" name="business_type" value={formData.business_type} onChange={handleChange}>
                            {Object.values(BusinessType).map(type => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
                        </Input>
                        <Input label="Business License Number" name="license_number" value={formData.license_number} onChange={handleChange} />
                    </>
                )}
                 {step === 2 && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Contact & Location</h3>
                        <Input label="Business Address" name="business_address" value={formData.business_address} onChange={handleChange} />
                        <Input label="Business Phone" name="business_phone" value={formData.business_phone} onChange={handleChange} />
                    </>
                )}
                 {step === 3 && (
                     <FileUploadComponent
                        title="Document Upload"
                        description="Please upload your business license and GST certificate."
                     />
                )}
            </div>
            <div className="mt-8 flex justify-between">
                {step > 1 ? (
                    <button type="button" onClick={handleBack} className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500">Back</button>
                ): <div />}
                {step < 3 && <button onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Next</button>}
                {step === 3 && <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed">{isSubmitting ? 'Submitting...' : 'Submit for Verification'}</button>}
            </div>
        </form>
    );
};

export default VendorOnboardingForm;
