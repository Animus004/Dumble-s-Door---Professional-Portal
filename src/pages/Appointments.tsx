import React, { useState, useEffect, useCallback } from 'react';
import { Appointment, AppointmentStatus } from '../types';
import * as ApiService from '../services/supabaseService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Badge from '../components/Badge';
import Skeleton from '../components/Skeleton';

const AppointmentsSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                 <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pet</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
                        <td className="px-6 py-4 flex justify-end space-x-4"><Skeleton className="h-8 w-20 rounded" /><Skeleton className="h-8 w-20 rounded" /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);


const Appointments: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchAppointments = useCallback(async () => {
        if(!user?.veterinarian_profile) return;
        setIsLoading(true);
        const { data, error } = await ApiService.getAppointmentsForVet(user.veterinarian_profile.id);
        if (error) {
            addToast("Failed to fetch appointments. This feature requires an 'appointments' table in Supabase.", 'error');
            console.error(error);
        } else if (data) {
             const appointmentsWithMockPet = data.map((apt: Appointment) => ({
                ...apt,
                // The pet's name/breed would come from a 'pets' table in a real app
                pet_details: { name: `Pet-${(apt.pet_id || '').substring(0,4)}`, breed: 'Unknown' }
            }));
            setAppointments(appointmentsWithMockPet);
        }
        setIsLoading(false);
    }, [user, addToast]);
    
    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleStatusUpdate = async (appointmentId: string, status: AppointmentStatus) => {
        const originalAppointments = [...appointments];
        // Optimistic update
        setAppointments(prev => prev.map(apt => apt.id === appointmentId ? {...apt, status} : apt));

        const { error } = await ApiService.updateAppointmentStatus(appointmentId, status);
        if (error) {
            addToast(`Failed to update appointment: ${error.message}`, 'error');
            setAppointments(originalAppointments); // Revert on error
        } else {
            addToast(`Appointment has been ${status}.`, 'success');
            // No need to refetch if optimistic update is sufficient, but refetching ensures consistency.
            fetchAppointments();
        }
    };
    
    if(!user?.veterinarian_profile) return <p>Veterinarian profile not found.</p>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Appointments</h1>
            </div>
            {isLoading ? <AppointmentsSkeleton /> : (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pet</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Owner</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date & Time</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {appointments.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">You have no upcoming appointments.</td></tr>
                            ) : appointments.map(apt => (
                                <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200">{apt.pet_details?.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{apt.pet_details?.breed}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{apt.user_profiles?.email || 'Unknown Owner'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(apt.appointment_date).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><Badge status={apt.status} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        {apt.status === AppointmentStatus.Pending && (
                                            <button onClick={() => handleStatusUpdate(apt.id, AppointmentStatus.Confirmed)} className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-xs">Confirm</button>
                                        )}
                                        {apt.status !== AppointmentStatus.Cancelled && apt.status !== AppointmentStatus.Completed && (
                                            <button onClick={() => handleStatusUpdate(apt.id, AppointmentStatus.Cancelled)} className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 text-xs">Cancel</button>
                                        )}
                                        {/* FIX: Corrected a syntax error from a truncated file. Completed the button JSX and closing tags. */}
                                        {apt.status === AppointmentStatus.Confirmed && (
                                             <button onClick={() => handleStatusUpdate(apt.id, AppointmentStatus.Completed)} className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-xs">Complete</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Appointments;