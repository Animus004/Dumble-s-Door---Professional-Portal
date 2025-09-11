import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { UserProfile, UserRole, ProfessionalStatus } from '../types';
import * as ApiService from '../services/supabaseService';
import Badge from '../components/Badge';
import Skeleton from '../components/Skeleton';
import VerificationDetails from './VerificationDetails';
import Input from '../components/Input';
import { useToast } from '../hooks/useToast';

const VerificationQueueSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th className="px-6 py-3 w-12"><Skeleton className="h-5 w-5 rounded"/></th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name / Business</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-5 w-5 rounded"/></td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-40" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-4 w-20" /></td>
                        <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-6 w-24 rounded-full" /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-right"><Skeleton className="h-4 w-16" /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const Pagination: React.FC<{
    currentPage: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}> = ({ currentPage, totalCount, pageSize, onPageChange }) => {
    const totalPages = Math.ceil(totalCount / pageSize);
    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-between mt-4 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-lg">
            <span className="text-sm text-gray-700 dark:text-gray-400">
                Showing <span className="font-semibold">{Math.min((currentPage - 1) * pageSize + 1, totalCount)}</span> to <span className="font-semibold">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-semibold">{totalCount}</span> results
            </span>
            <div className="space-x-2">
                <button 
                    onClick={() => onPageChange(currentPage - 1)} 
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm font-medium text-gray-600 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <button 
                    onClick={() => onPageChange(currentPage + 1)} 
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm font-medium text-gray-600 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
};


const VerificationQueue: React.FC = () => {
    const [profiles, setProfiles] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isProcessingBatch, setIsProcessingBatch] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const { addToast } = useToast();
    const selectAllCheckboxRef = useRef<HTMLInputElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const fetchVerifications = useCallback(async () => {
        setIsLoading(true);
        const { data, error } = await ApiService.getPendingVerifications();
        if (error) {
            addToast(error.message, 'error');
        } else if (data) {
            setProfiles(data);
        }
        setIsLoading(false);
    }, [addToast]);

    useEffect(() => {
        fetchVerifications();
    }, [fetchVerifications]);

    const filteredProfiles = useMemo(() => {
        return profiles.filter(p => {
            const name = p.veterinarian_profile?.full_name || p.vendor_profile?.business_name || '';
            const email = p.email;
            const searchMatch = name.toLowerCase().includes(searchTerm.toLowerCase()) || email.toLowerCase().includes(searchTerm.toLowerCase());
            const roleMatch = roleFilter === 'all' || p.role === roleFilter;
            return searchMatch && roleMatch;
        });
    }, [profiles, searchTerm, roleFilter]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, roleFilter]);

    const paginatedProfiles = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredProfiles.slice(start, start + pageSize);
    }, [filteredProfiles, currentPage, pageSize]);

    useEffect(() => {
        if (selectAllCheckboxRef.current) {
            const numSelected = selectedIds.size;
            const numVisible = filteredProfiles.length;
            selectAllCheckboxRef.current.checked = numSelected > 0 && numSelected === numVisible;
            selectAllCheckboxRef.current.indeterminate = numSelected > 0 && numSelected < numVisible;
        }
    }, [selectedIds, filteredProfiles]);
    
    const handleSelectOne = (id: string) => {
        const newSelectedIds = new Set(selectedIds);
        if (newSelectedIds.has(id)) {
            newSelectedIds.delete(id);
        } else {
            newSelectedIds.add(id);
        }
        setSelectedIds(newSelectedIds);
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(filteredProfiles.map(p => p.auth_user_id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleBatchAction = async (status: ProfessionalStatus) => {
        if(selectedIds.size === 0) return;
        setIsProcessingBatch(true);
        const { error } = await ApiService.batchUpdateProfileStatus(Array.from(selectedIds), status);
        if (error) {
            addToast(error.message, 'error');
        } else {
            addToast(`${selectedIds.size} profile(s) have been ${status}.`, 'success');
            setSelectedIds(new Set());
            fetchVerifications();
        }
        setIsProcessingBatch(false);
    };
    
    const handleExport = async () => {
        setIsExporting(true);
        try {
            const { error } = await ApiService.exportApprovedUsers();
            if (error) throw error;
            addToast('Export started successfully!', 'success');
        } catch (err) {
            if (err instanceof Error) {
                addToast(err.message, 'error');
            } else {
                addToast('An unknown error occurred during export.', 'error');
            }
        } finally {
            setIsExporting(false);
        }
    };

    const handleStatusUpdate = async (userId: string, status: ProfessionalStatus, rejectionDetails?: { reason: string, comments: string }) => {
        const { error } = await ApiService.updateProfileStatus(userId, status, rejectionDetails);
        if (error) {
            addToast(error.message, 'error');
        } else {
            addToast(`Profile has been ${status}.`, 'success');
            setSelectedProfile(null);
            fetchVerifications();
        }
    };

    if (selectedProfile) return <VerificationDetails profile={selectedProfile} onBack={() => setSelectedProfile(null)} onStatusUpdate={handleStatusUpdate} />;

    return (
        <div>
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Verification Queue</h1>
                <button 
                    onClick={handleExport}
                    disabled={isExporting}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-green-400"
                >
                    {isExporting ? 'Exporting...' : 'Export Approved'}
                </button>
            </div>
            
            <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <Input 
                      label=""
                      name="search"
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-48">
                    <Input
                        as="select"
                        label=""
                        name="roleFilter"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                    >
                        <option value="all">All Roles</option>
                        <option value={UserRole.Veterinarian}>Veterinarians</option>
                        <option value={UserRole.Vendor}>Vendors</option>
                    </Input>
                </div>
            </div>

            {selectedIds.size > 0 && (
                <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{selectedIds.size} item(s) selected.</p>
                    <div className="space-x-2">
                        <button onClick={() => handleBatchAction(ProfessionalStatus.Approved)} disabled={isProcessingBatch} className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">Approve</button>
                        <button onClick={() => handleBatchAction(ProfessionalStatus.Rejected)} disabled={isProcessingBatch} className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50">Reject</button>
                    </div>
                </div>
            )}

            {isLoading ? <VerificationQueueSkeleton /> : (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-3 w-12">
                                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-gray-900" 
                                            ref={selectAllCheckboxRef}
                                            onChange={handleSelectAll}
                                            checked={selectedIds.size > 0 && selectedIds.size === filteredProfiles.length}
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name / Business</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Submitted</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {paginatedProfiles.length === 0 ? (
                                    <tr><td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">No matching pending verifications.</td></tr>
                                ) : paginatedProfiles.map(p => (
                                    <tr key={p.auth_user_id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${selectedIds.has(p.auth_user_id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                                        <td className="px-6 py-4">
                                            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-100 dark:bg-gray-900"
                                                onChange={() => handleSelectOne(p.auth_user_id)}
                                                checked={selectedIds.has(p.auth_user_id)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{p.veterinarian_profile?.full_name || p.vendor_profile?.business_name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{p.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{p.role.replace('_', ' ')}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><Badge status={p.professional_status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => setSelectedProfile(p)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Review</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                     <Pagination 
                        currentPage={currentPage}
                        totalCount={filteredProfiles.length}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}
        </div>
    );
};

export default VerificationQueue;