import React, { useState, useEffect } from 'react';
import * as ApiService from '../services/supabaseService';
import { DashboardAnalytics, AuditLog } from '../types';
import Skeleton from '../components/Skeleton';
import { useToast } from '../hooks/useToast';

const StatCard: React.FC<{ title: string; value: string | number; isLoading: boolean }> = ({ title, value, isLoading }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
        {isLoading ? <Skeleton className="h-9 w-24 mt-1" /> : <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{value}</p>}
    </div>
);

const TrendChart: React.FC<{ data: DashboardAnalytics['registrationTrends']; isLoading: boolean }> = ({ data, isLoading }) => {
    if (isLoading) return <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"><h3 className="font-semibold mb-4">Registration Trends</h3><Skeleton className="h-64 w-full" /></div>;
    
    const maxVal = Math.max(...data.vetData, ...data.vendorData);

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-full flex flex-col">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-200">Registration Trends (Last 6 Months)</h3>
            <div className="flex-grow flex items-end space-x-4">
                {data.labels.map((label, index) => (
                    <div key={label} className="flex-1 flex flex-col items-center">
                        <div className="flex items-end h-48 w-full">
                            <div className="w-1/2 bg-blue-400 hover:bg-blue-500 rounded-t-md" style={{ height: `${(data.vetData[index] / maxVal) * 100}%` }} title={`Vets: ${data.vetData[index]}`}></div>
                            <div className="w-1/2 bg-indigo-400 hover:bg-indigo-500 rounded-t-md" style={{ height: `${(data.vendorData[index] / maxVal) * 100}%` }} title={`Vendors: ${data.vendorData[index]}`}></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">{label}</span>
                    </div>
                ))}
            </div>
             <div className="flex justify-center space-x-4 mt-4 text-sm">
                <div className="flex items-center"><span className="w-3 h-3 bg-blue-400 rounded-full mr-2"></span>Veterinarians</div>
                <div className="flex items-center"><span className="w-3 h-3 bg-indigo-400 rounded-full mr-2"></span>Vendors</div>
            </div>
        </div>
    );
};

const DoughnutChart: React.FC<{ data: DashboardAnalytics['approvalStats']; isLoading: boolean }> = ({ data, isLoading }) => {
    if (isLoading) return <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"><h3 className="font-semibold mb-4">Approval Stats</h3><div className="flex justify-center items-center"><Skeleton className="h-32 w-32 rounded-full" /></div></div>;

    const total = data.approved + data.pending + data.rejected;
    const approvedPercent = (data.approved / total) * 100;
    const pendingPercent = (data.pending / total) * 100;

    const approvedOffset = 25;
    const pendingOffset = 25 + (100 - approvedPercent);
    
    return (
         <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow h-full flex flex-col">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">Approval Overview</h3>
            <div className="relative flex-grow flex items-center justify-center my-4">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-red-200 dark:text-red-800" cx="18" cy="18" r="15.915" fill="transparent" stroke="currentColor" strokeWidth="3.8"></circle>
                    <circle className="text-yellow-300 dark:text-yellow-700" cx="18" cy="18" r="15.915" fill="transparent" stroke="currentColor" strokeWidth="3.8" strokeDasharray={`${approvedPercent + pendingPercent}, 100`} strokeDashoffset={`-${approvedOffset}`}></circle>
                    <circle className="text-green-500" cx="18" cy="18" r="15.915" fill="transparent" stroke="currentColor" strokeWidth="3.8" strokeDasharray={`${approvedPercent}, 100`} strokeDashoffset={`-${approvedOffset}`}></circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800 dark:text-gray-200">{total}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
                </div>
            </div>
             <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <div className="flex justify-between"><span className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>Approved</span> <strong>{data.approved}</strong></div>
                <div className="flex justify-between"><span className="flex items-center"><span className="w-3 h-3 bg-yellow-300 dark:bg-yellow-700 rounded-full mr-2"></span>Pending</span> <strong>{data.pending}</strong></div>
                <div className="flex justify-between"><span className="flex items-center"><span className="w-3 h-3 bg-red-200 dark:bg-red-800 rounded-full mr-2"></span>Rejected</span> <strong>{data.rejected}</strong></div>
            </div>
        </div>
    )
}

const AuditTrail: React.FC<{ logs: AuditLog[], isLoading: boolean }> = ({ logs, isLoading }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Recent Activity</h3>
        <ul className="space-y-4">
            {isLoading ? Array.from({ length: 3 }).map((_, i) => <li key={i}><Skeleton className="h-8 w-full" /></li>) :
             logs.map(log => (
                <li key={log.id} className="text-sm">
                    <p className="text-gray-800 dark:text-gray-300">
                        <span className="font-semibold">{log.admin_email}</span> {log.action.toLowerCase()} <span className="font-semibold">{log.target_user_email}</span>.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                </li>
            ))}
        </ul>
    </div>
);


const AdminDashboard: React.FC = () => {
    const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
    const [auditLog, setAuditLog] = useState<AuditLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { addToast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [analyticsRes, auditRes] = await Promise.all([
                    ApiService.getDashboardAnalytics(),
                    ApiService.getAuditTrail()
                ]);

                if (analyticsRes.error) throw new Error(analyticsRes.error.message);
                if (auditRes.error) throw new Error(auditRes.error.message);

                setAnalytics(analyticsRes.data);
                setAuditLog(auditRes.data);
            } catch (err: any) {
                addToast(err.message || "Failed to fetch dashboard data.", "error");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [addToast]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard title="Pending Verifications" value={analytics?.pendingVerifications ?? 0} isLoading={isLoading} />
                <StatCard title="New Registrations (24h)" value={analytics?.newRegistrations ?? 0} isLoading={isLoading} />
                <StatCard title="Overall Approval Rate" value={`${analytics?.approvalRate ?? 0}%`} isLoading={isLoading} />
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <TrendChart data={analytics?.registrationTrends} isLoading={isLoading} />
                </div>
                <div>
                    <DoughnutChart data={analytics?.approvalStats} isLoading={isLoading} />
                </div>
             </div>
             <div className="mt-6">
                <AuditTrail logs={auditLog} isLoading={isLoading} />
             </div>
        </div>
    );
};

export default AdminDashboard;
