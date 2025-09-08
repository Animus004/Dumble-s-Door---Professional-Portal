import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import { SIDENAV_ITEMS } from '../constants';
import Header from '../components/Header';
import AdminDashboard from '../pages/AdminDashboard';
import ProfessionalDashboard from '../pages/ProfessionalDashboard';
import VerificationQueue from '../pages/VerificationQueue';
import MyProfileVet from '../pages/MyProfileVet';
import MyProfileVendor from '../pages/MyProfileVendor';
import Availability from '../pages/Availability';
import Products from '../pages/Products';

const Sidebar: React.FC<{ userRole: UserRole, currentPage: string, setPage: (page: string) => void, isOpen: boolean }> = ({ userRole, currentPage, setPage, isOpen }) => {
    const navItems = SIDENAV_ITEMS[userRole] || [];
    return (
        <aside className={`bg-gray-800 text-white w-64 space-y-2 py-4 flex-shrink-0 absolute lg:relative lg:translate-x-0 transform transition-transform duration-200 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} z-40`}>
             <nav>
                {navItems.map(item => (
                    <button key={item.path} onClick={() => setPage(item.path)} className={`w-full flex items-center px-4 py-3 text-left transition-colors duration-200 ${currentPage === item.path ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'}`}>
                        {item.icon}
                        <span className="ml-4 font-medium">{item.title}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};

const DashboardLayout: React.FC = () => {
    const { user, signOut } = useAuth();
    const [page, setPage] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    if (!user) return null;

    const renderPage = () => {
        // A simple router
        switch (page) {
            case 'dashboard':
                 if (user.role === UserRole.Admin) return <AdminDashboard />;
                 return <ProfessionalDashboard />; // Default for Vet/Vendor
            case 'verification':
                 if (user.role === UserRole.Admin) return <VerificationQueue />;
                 return <p>Access Denied</p>
            case 'profile':
                 if (user.role === UserRole.Veterinarian) return <MyProfileVet />;
                 if (user.role === UserRole.Vendor) return <MyProfileVendor />;
                 return <p>No profile page available.</p>;
            case 'availability':
                 if (user.role === UserRole.Veterinarian) return <Availability />;
                 return <p>Access Denied</p>;
            case 'products':
                 if (user.role === UserRole.Vendor) return <Products />;
                 return <p>Access Denied</p>;
            default:
                return <ProfessionalDashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <Sidebar userRole={user.role} currentPage={page} setPage={setPage} isOpen={isSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header user={user} onLogout={signOut} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
                   {renderPage()}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
