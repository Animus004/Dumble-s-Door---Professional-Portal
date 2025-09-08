import React, { useState } from 'react';
import { UserProfile, ProfessionalStatus, Clinic } from '../types';
import { ICONS } from '../constants';
import Modal from '../components/Modal';

const VerificationDetails: React.FC<{ profile: UserProfile, onBack: () => void, onStatusUpdate: (userId: string, status: ProfessionalStatus) => void }> = ({ profile, onBack, onStatusUpdate }) => {
    const details = profile.veterinarian_profile || profile.vendor_profile;
    const isVet = !!profile.veterinarian_profile;
    const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

    return (
        <div>
             <button onClick={onBack} className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mb-4">
               {ICONS.ARROW_LEFT} <span className="ml-1">Back to Queue</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">Review Application</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{isVet ? (details as any).full_name : (details as any).business_name} ({profile.email})</p>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 dark:border-gray-700">{isVet ? 'Veterinarian Details' : 'Vendor Details'}</h3>
                <p className="text-gray-700 dark:text-gray-300"><strong>License:</strong> {details?.license_number}</p>
                {isVet && <p className="text-gray-700 dark:text-gray-300"><strong>Experience:</strong> {(details as any).experience_years} years</p>}
                {isVet && <p className="text-gray-700 dark:text-gray-300"><strong>Specializations:</strong> {(details as any).specializations.join(', ')}</p>}
                {!isVet && <p className="text-gray-700 dark:text-gray-300"><strong>Business Type:</strong> {(details as any).business_type}</p>}
                
                {isVet && (details as any).clinics && (
                    <div className="pt-2">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300">Clinics:</h4>
                        <ul className="list-disc list-inside space-y-2 mt-2 pl-2">
                            {(details as any).clinics.map((clinic: Clinic, index: number) => (
                                <li key={index} className="text-gray-600 dark:text-gray-400">
                                   <span className="font-medium text-gray-800 dark:text-gray-200">{clinic.clinic_name}</span> - {clinic.clinic_address} ({clinic.clinic_phone})
                                   {clinic.google_place_id && <span className="text-xs text-blue-500 ml-2">(Verified Location)</span>}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                 <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2 mt-4 dark:border-gray-700">Documents</h3>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {profile.verification_documents?.length > 0 ? (
                      profile.verification_documents.map(doc => (
                        <button key={doc.id} onClick={() => setPreviewDocUrl(doc.document_url)} className="border dark:border-gray-700 rounded-lg p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <p className="font-medium text-blue-600 dark:text-blue-400 capitalize">{doc.document_type.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Click to preview</p>
                        </button>
                      ))
                   ) : (
                     <p className="text-gray-500 dark:text-gray-400 col-span-full">No documents uploaded.</p>
                   )}
                 </div>
            </div>

            <div className="mt-6 flex space-x-4">
                 <button onClick={() => onStatusUpdate(profile.auth_user_id, ProfessionalStatus.Approved)} className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">Approve</button>
                 <button onClick={() => onStatusUpdate(profile.auth_user_id, ProfessionalStatus.Rejected)} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Reject</button>
            </div>
            
             <Modal isOpen={!!previewDocUrl} onClose={() => setPreviewDocUrl(null)} title="Document Preview">
                {previewDocUrl && <img src={previewDocUrl} alt="Document Preview" className="w-full h-auto rounded-md" />}
            </Modal>
        </div>
    );
};

export default VerificationDetails;
