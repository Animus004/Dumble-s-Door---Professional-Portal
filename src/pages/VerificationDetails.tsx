import React, { useState } from 'react';
import { UserProfile, ProfessionalStatus, Clinic } from '../types';
import { ICONS } from '../constants';
import Modal from '../components/Modal';
import Input from '../components/Input';

interface RejectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (details: { reason: string, comments: string }) => void;
}

const RejectionModal: React.FC<RejectionModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [reason, setReason] = useState('');
    const [comments, setComments] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ reason, comments });
    };
    
    const rejectionReasons = [
        "Incomplete Profile Information",
        "Document(s) are Unclear or Illegible",
        "Invalid or Expired License",
        "Verification Information Mismatch",
        "Other (Please specify in comments)"
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reason for Rejection">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    as="select"
                    label="Rejection Reason"
                    name="rejection_reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                >
                    <option value="" disabled>Select a reason...</option>
                    {rejectionReasons.map(r => <option key={r} value={r}>{r}</option>)}
                </Input>
                
                <Input
                    as="textarea"
                    label="Additional Comments (optional)"
                    name="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide specific feedback to the applicant..."
                />
                
                <div className="pt-4 flex justify-end space-x-2">
                     <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                     <button type="submit" className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Submit Rejection</button>
                 </div>
            </form>
        </Modal>
    );
};


const VerificationDetails: React.FC<{ profile: UserProfile, onBack: () => void, onStatusUpdate: (userId: string, status: ProfessionalStatus, rejectionDetails?: { reason: string, comments: string }) => void }> = ({ profile, onBack, onStatusUpdate }) => {
    const details = profile.veterinarian_profile || profile.vendor_profile;
    const isVet = !!profile.veterinarian_profile;
    const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);

    const handleRejectSubmit = (rejectionDetails: { reason: string, comments: string }) => {
        onStatusUpdate(profile.auth_user_id, ProfessionalStatus.Rejected, rejectionDetails);
        setIsRejectionModalOpen(false);
    }

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
                   {profile.verification_documents && profile.verification_documents.length > 0 ? (
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
                 <button onClick={() => setIsRejectionModalOpen(true)} className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Reject</button>
            </div>
            
             <Modal isOpen={!!previewDocUrl} onClose={() => setPreviewDocUrl(null)} title="Document Preview">
                {previewDocUrl && <img src={previewDocUrl} alt="Document Preview" className="w-full h-auto rounded-md" />}
            </Modal>
            <RejectionModal isOpen={isRejectionModalOpen} onClose={() => setIsRejectionModalOpen(false)} onSubmit={handleRejectSubmit} />
        </div>
    );
};

export default VerificationDetails;