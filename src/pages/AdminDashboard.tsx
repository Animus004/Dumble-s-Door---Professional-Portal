import React from 'react';

const AdminDashboard: React.FC = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Pending Verifications</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">1</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Veterinarians</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">1</p>
                </div>
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Vendors</h3>
                    <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">1</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
