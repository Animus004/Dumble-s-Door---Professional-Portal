import React from 'react';
import { ProfessionalStatus, AppointmentStatus } from '../types';

const Badge: React.FC<{ status: ProfessionalStatus | AppointmentStatus | string }> = ({ status }) => {
    const statusStyles: { [key: string]: string } = {
        [ProfessionalStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        [ProfessionalStatus.Approved]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        [ProfessionalStatus.Rejected]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        [ProfessionalStatus.Suspended]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        [AppointmentStatus.Confirmed]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        [AppointmentStatus.Cancelled]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        [AppointmentStatus.Completed]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        'draft': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        'out_of_stock': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusStyles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
            {status.replace('_', ' ')}
        </span>
    );
};

export default Badge;