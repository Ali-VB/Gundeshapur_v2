import React, { useState, useEffect } from 'react';
import { useAuth, useTranslation } from '../../index';
import { User } from '../../types';
import { getAllUsers } from '../../firebase';
import { Logo } from '../common/Logo';

const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
    <div className={`bg-slate-800 p-5 rounded-xl border-l-4 ${color}`}>
        <div className="text-sm text-slate-400">{title}</div>
        <div className="text-3xl font-bold text-white">{value}</div>
    </div>
);

export const AdminPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { signOut } = useAuth();
    const { locale } = useTranslation();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const userList = await getAllUsers();
            setUsers(userList);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const totalUsers = users.length;
    const activeLibraries = users.filter(u => u.sheetId).length;
    const plans = users.reduce((acc, user) => {
        acc[user.plan] = (acc[user.plan] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const PlanBadge = ({ plan }: { plan: string }) => {
        const colors: { [key: string]: string } = {
            free: 'bg-slate-500/30 text-slate-300',
            pro: 'bg-cyan-500/20 text-cyan-300',
            enterprise: 'bg-indigo-500/20 text-indigo-300',
        };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colors[plan] || colors.free}`}>{plan.toUpperCase()}</span>;
    };
    
    const formatDate = (isoString?: string) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200">
            <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 h-20 flex items-center px-4 sm:px-8">
                <div className="flex-grow">
                    <Logo />
                </div>
                <button onClick={signOut} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
                    Sign Out
                </button>
            </header>

            <main className="container mx-auto p-4 sm:p-8">
                <h1 className="text-4xl font-bold text-slate-100 mb-8">Admin Dashboard</h1>

                {/* Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Users" value={totalUsers} color="border-cyan-500" />
                    <StatCard title="Active Libraries" value={activeLibraries} color="border-green-500" />
                    <StatCard title="Pro Users" value={plans.pro || 0} color="border-cyan-500" />
                    <StatCard title="Free Users" value={plans.free || 0} color="border-slate-500" />
                </div>

                {/* Users Table */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl">
                    <h2 className="text-2xl font-bold text-slate-100 p-6">User Management</h2>
                    {loading ? <p className="p-6">Loading users...</p> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-700">
                                <thead className="bg-slate-800/80">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Display Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Plan</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Last Active</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {users.map(user => (
                                        <tr key={user.uid} className="hover:bg-slate-800/50">
                                            <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-white">{user.displayName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-slate-400">{user.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm"><PlanBadge plan={user.plan} /></td>
                                            <td className="px-6 py-4 whitespace-nowrap text-base text-slate-400">{formatDate(user.lastLogin)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${user.subscriptionStatus === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                                    {user.subscriptionStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                                                <button className="text-cyan-400 hover:text-cyan-300 transition">Manage</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};