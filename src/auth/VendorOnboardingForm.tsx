import React, { useState } from 'react';
import { UserProfile, BusinessType, DocumentType } from '../types';
import * as ApiService from '../services/supabaseService';
import Input from '../components/Input';
import ProgressBar from '../components/ProgressBar';
import FileUploadComponent from '../components/FileUploadComponent';
import { useToast } from '../hooks/useToast';

interface OnboardingFormProps {
  user: UserProfile;
  onComplete: (user: UserProfile) => void;
}

interface UploadingFile {
    file: File;
    progress: number;
    error?: string;
    type: DocumentType;
}

const VendorOnboardingForm: React.FC<OnboardingFormProps> = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        business_name: '', business_type: BusinessType.PetShop, license_number: '',
        business_address: '', business_phone: '',
    });
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [uploadedDocs, setUploadedDocs] = useState<{ document_type: DocumentType, document_url: string }[]>([]);
    const isUploading = uploadingFiles.some(f => f.progress < 100);

    const handleFileSelect = (files: FileList) => {
        const newFiles: UploadingFile[] = Array.from(files).map(file => ({
            file,
            progress: 0,
            // Simple logic to assign type based on name, can be improved with a dropdown per file
            type: file.name.toLowerCase().includes('gst') ? DocumentType.GstCertificate : DocumentType.BusinessLicense
        }));

        setUploadingFiles(prev => [...prev, ...newFiles]);
        
        newFiles.forEach(uploadingFile => {
            ApiService.uploadDocument(
                user.auth_user_id,
                uploadingFile.file,
                (progress) => {
                    setUploadingFiles(current => current.map(f => f.file === uploadingFile.file ? { ...f, progress } : f));
                }
            ).then(({ publicUrl, error }) => {
                 setUploadingFiles(current => current.map(f => {
                    if (f.file === uploadingFile.file) {
                        if (error) return { ...f, error: error.message, progress: 100 };
                        if (publicUrl) setUploadedDocs(prev => [...prev, {document_type: f.type, document_url: publicUrl}]);
                        return { ...f, progress: 100 };
                    }
                    return f;
                }));
            });
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleNext = (e: React.FormEvent) => { e.preventDefault(); setStep(s => s + 1); };
    const handleBack = () => setStep(s => s - 1);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (uploadedDocs.length === 0) {
            addToast("Please upload the required documents.", "error");
            return;
        }
        setIsSubmitting(true);
        const fullProfileData = { ...formData, description: 'N/A', delivery_available: false, operating_hours: {}, services_offered: [] };
        
        const { profile, error } = await ApiService.saveVendorProfile(user.auth_user_id, fullProfileData, uploadedDocs);
        
        if (error || !profile) {
            addToast(error?.message || "Failed to save profile.", "error");
            setIsSubmitting(false);
            return;
        }

        onComplete(profile);
    };

    const displayedFiles = uploadingFiles.map(f => ({name: f.file.name, progress: f.progress, error: f.error}));

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Vendor Onboarding</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Complete your business profile to get started.</p>
            <ProgressBar currentStep={step} totalSteps={3} />
            <div className="mt-8 space-y-4">
                {step === 1 && (
                     <>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Business Information</h3>
                        <Input label="Business Name" name="business_name" value={formData.business_name} onChange={handleChange} required minLength={3}/>
                        <Input as="select" label="Business Type" name="business_type" value={formData.business_type} onChange={handleChange}>
                            {Object.values(BusinessType).map(type => <option key={type} value={type}>{type.replace('_', ' ')}</option>)}
                        </Input>
                        <Input label="Business License Number" name="license_number" value={formData.license_number} onChange={handleChange} required minLength={5}/>
                    </>
                )}
                 {step === 2 && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Contact & Location</h3>
                        <Input label="Business Address" name="business_address" value={formData.business_address} onChange={handleChange} required minLength={10}/>
                        <Input label="Business Phone" name="business_phone" type="tel" pattern="[0-9]{10,12}" title="Please enter a valid phone number (10-12 digits)" value={formData.business_phone} onChange={handleChange} required/>
                    </>
                )}
                 {step === 3 && (
                     <FileUploadComponent
                        title="Document Upload"
                        description="Please upload your business license and GST certificate."
                        onFilesSelected={handleFileSelect}
                        uploadedFiles={displayedFiles}
                        isUploading={isUploading}
                     />
                )}
            </div>
            <div className="mt-8 flex justify-between">
                {step > 1 ? (
                    <button type="button" onClick={handleBack} className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500">Back</button>
                ): <div />}
                {step < 3 && <button type="submit" onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Next</button>}
                {step === 3 && <button type="submit" disabled={isSubmitting || isUploading} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed">{isSubmitting ? 'Submitting...' : 'Submit for Verification'}</button>}
            </div>
        </form>
    );
};

export default VendorOnboardingForm;