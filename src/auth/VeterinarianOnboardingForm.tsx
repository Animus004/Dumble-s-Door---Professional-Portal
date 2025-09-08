import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { UserProfile, Clinic, DocumentType } from '../types';
import * as ApiService from '../services/supabaseService';
import Input from '../components/Input';
import ProgressBar from '../components/ProgressBar';
import FileUploadComponent from '../components/FileUploadComponent';
import { useToast } from '../hooks/useToast';

const GoogleMapsApiKeyPrompt: React.FC = () => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-2xl max-w-md text-center">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Google Maps API Key Required</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        This feature requires a Google Maps API key to function. Please set your API key as the{' '}
        <code className="bg-gray-200 dark:bg-gray-700 text-red-600 dark:text-red-400 font-mono p-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> environment variable.
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-500">
        The application will start working automatically once the environment variable is correctly configured. You might need to restart your development server.
      </p>
    </div>
  </div>
);

interface OnboardingFormProps {
  user: UserProfile;
  onComplete: (user: UserProfile) => void;
}

interface GooglePlace {
    place_id: string;
    name: string;
    formatted_address: string;
    international_phone_number: string;
    geometry?: { location?: { lat: () => number; lng: () => number; } };
}

interface UploadingFile {
    file: File;
    progress: number;
    error?: string;
    type: DocumentType;
}

const VeterinarianOnboardingForm: React.FC<OnboardingFormProps> = ({ user, onComplete }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        full_name: '', license_number: '', experience_years: 0,
        emergency_available: false, consultation_fee: 0,
        clinics: [{ clinic_name: '', clinic_address: '', clinic_phone: '' } as Partial<Clinic>],
    });
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isMapsScriptLoaded, setIsMapsScriptLoaded] = useState(!!window.google?.maps);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const [uploadedDocs, setUploadedDocs] = useState<{ document_type: DocumentType, document_url: string }[]>([]);
    const isUploading = uploadingFiles.some(f => f.progress < 100);

    const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!googleApiKey || window.google?.maps) {
          if (window.google?.maps) setIsMapsScriptLoaded(true);
          return;
        }
        const scriptId = 'google-maps-script';
        if (document.getElementById(scriptId)) return;

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setIsMapsScriptLoaded(true);
        script.onerror = () => console.error("Google Maps script failed to load.");
        
        document.head.appendChild(script);
    }, [googleApiKey]);
    
    const handleFileSelect = (files: FileList) => {
        const newFiles: UploadingFile[] = Array.from(files).map(file => ({
            file,
            progress: 0,
            type: file.name.toLowerCase().includes('degree') ? DocumentType.Degree : DocumentType.License
        }));

        setUploadingFiles(prev => [...prev, ...newFiles]);
        
        newFiles.forEach(uploadingFile => {
            ApiService.uploadDocument(user.auth_user_id, uploadingFile.file, (progress) => {
                setUploadingFiles(current => current.map(f => f.file === uploadingFile.file ? { ...f, progress } : f));
            }).then(({ publicUrl, error }) => {
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

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const handleClinicChange = (index: number, e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const updatedClinics = formData.clinics.map((clinic, i) => i === index ? { ...clinic, [e.target.name]: e.target.value } : clinic);
        setFormData({ ...formData, clinics: updatedClinics });
    };
    
    const handlePlaceSelected = (index: number, place: GooglePlace) => {
        const updatedClinics = formData.clinics.map((clinic, i) => i === index ? {
            ...clinic,
            clinic_name: place.name || clinic.clinic_name,
            clinic_address: (clinic.clinic_address || '').trim() === '' ? (place.formatted_address || '') : clinic.clinic_address,
            clinic_phone: (clinic.clinic_phone || '').trim() === '' ? (place.international_phone_number || '') : clinic.clinic_phone,
            google_place_id: place.place_id,
            latitude: place.geometry?.location?.lat(),
            longitude: place.geometry?.location?.lng(),
        } : clinic);
        setFormData({ ...formData, clinics: updatedClinics });
    };

    const clearPlaceSelection = (index: number) => {
        const updatedClinics = formData.clinics.map((clinic, i) => i === index ? { ...clinic, clinic_address: '', clinic_phone: '', google_place_id: undefined, latitude: undefined, longitude: undefined, } : clinic );
        setFormData({ ...formData, clinics: updatedClinics });
    }

    const addClinic = () => setFormData({ ...formData, clinics: [...formData.clinics, { clinic_name: '', clinic_address: '', clinic_phone: '' }] });
    const removeClinic = (index: number) => { if (formData.clinics.length > 1) setFormData({ ...formData, clinics: formData.clinics.filter((_, i) => i !== index) }); };
    const handleNext = (e: React.FormEvent) => { e.preventDefault(); setStep(s => s + 1); };
    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (uploadedDocs.length < 2) {
            addToast("Please upload both license and degree documents.", "error");
            return;
        }
        setIsSubmitting(true);
        const profileData = { ...formData, clinics: formData.clinics as Clinic[], specializations: ['General'], bio: 'N/A', services_offered: [], languages_spoken: [] };
        
        const { profile, error } = await ApiService.saveVeterinarianProfile(user.auth_user_id, profileData, uploadedDocs);
        
        if (error || !profile) {
            addToast(error?.message || "Failed to save profile.", "error");
            setIsSubmitting(false);
            return;
        }

        onComplete(profile);
    };
    
    const AutocompleteInput: React.FC<{ clinic: Partial<Clinic>, index: number, onPlaceSelected: (index: number, place: GooglePlace) => void, isMapsReady: boolean }> = ({ clinic, index, onPlaceSelected, isMapsReady }) => {
        const inputRef = useRef<HTMLInputElement>(null);

        useEffect(() => {
            if (!isMapsReady || !inputRef.current) return;
            const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['establishment'], fields: ['place_id', 'name', 'formatted_address', 'international_phone_number', 'geometry.location']
            });
            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                if (place.place_id) onPlaceSelected(index, place);
            });
        }, [isMapsReady, index, onPlaceSelected]);

        return <Input ref={inputRef} label={`Clinic Name #${index + 1}`} name="clinic_name" value={clinic.clinic_name || ''} onChange={(e) => handleClinicChange(index, e as ChangeEvent<HTMLInputElement>)} placeholder="Start typing clinic name..." />;
    };

    if (!googleApiKey) return <GoogleMapsApiKeyPrompt />;
    
    const displayedFiles = uploadingFiles.map(f => ({name: f.file.name, progress: f.progress, error: f.error}));

    return (
        <form onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Veterinarian Onboarding</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Complete your professional profile to get started.</p>
            <ProgressBar currentStep={step} totalSteps={3} />
            <div className="mt-8 space-y-4">
                {step === 1 && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Professional Information</h3>
                        <Input label="Full Name" name="full_name" value={formData.full_name} onChange={handleChange} required minLength={3} />
                        <Input label="Veterinary License Number" name="license_number" value={formData.license_number} onChange={handleChange} required minLength={5} />
                        <Input label="Years of Experience" name="experience_years" type="number" min="0" value={formData.experience_years} onChange={handleChange} required />
                        <Input label="Consultation Fee (INR)" name="consultation_fee" type="number" min="0" value={formData.consultation_fee} onChange={handleChange} placeholder="e.g., 500" required />
                        <div className="flex items-center justify-between pt-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Available for Emergencies?</span>
                            <label htmlFor="emergency_available" className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" id="emergency_available" className="sr-only peer" checked={formData.emergency_available} onChange={e => setFormData({ ...formData, emergency_available: e.target.checked })} />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </>
                )}
                {step === 2 && (
                    <>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Clinic Details</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Search for your clinic on Google Maps or enter details manually.</p>
                        {!isMapsScriptLoaded && <div className="text-center text-gray-500 dark:text-gray-400">Loading mapping service...</div>}
                        {isMapsScriptLoaded && formData.clinics.map((clinic, index) => {
                           const placeSelected = !!clinic.google_place_id;
                           return (
                            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md relative space-y-4 mb-4 bg-gray-50 dark:bg-gray-800/50">
                                {formData.clinics.length > 1 && (
                                    <button type="button" onClick={() => removeClinic(index)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500" aria-label="Remove clinic">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                    </button>
                                )}
                                <AutocompleteInput clinic={clinic} index={index} onPlaceSelected={handlePlaceSelected} isMapsReady={isMapsScriptLoaded} />
                                <Input label="Clinic Address" name="clinic_address" value={clinic.clinic_address || ''} onChange={(e) => handleClinicChange(index, e)} disabled={placeSelected} required minLength={10} />
                                <Input label="Clinic Phone" name="clinic_phone" type="tel" pattern="[0-9]{10,12}" title="Please enter a valid phone number (10-12 digits)" value={clinic.clinic_phone || ''} onChange={(e) => handleClinicChange(index, e)} disabled={placeSelected} required />
                                {placeSelected && <button type="button" onClick={() => clearPlaceSelection(index)} className="text-sm text-blue-600 hover:underline dark:text-blue-400">Clear & Enter Manually</button>}
                            </div>
                           )
                        })}
                        {isMapsScriptLoaded && <button type="button" onClick={addClinic} className="w-full mt-2 flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            Add Another Clinic
                        </button>}
                    </>
                )}
                 {step === 3 && (
                     <FileUploadComponent 
                        title="Document Upload"
                        description="Please upload your veterinary license and degree certificates."
                        onFilesSelected={handleFileSelect}
                        uploadedFiles={displayedFiles}
                        isUploading={isUploading}
                     />
                )}
            </div>
            <div className="mt-8 flex justify-between">
                {step > 1 ? (<button type="button" onClick={handleBack} className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500">Back</button>) : <div />}
                {step < 3 && <button type="submit" onClick={handleNext} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Next</button>}
                {step === 3 && <button type="submit" disabled={isSubmitting || isUploading} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed">{isSubmitting ? 'Submitting...' : 'Submit for Verification'}</button>}
            </div>
        </form>
    );
};

export default VeterinarianOnboardingForm;
