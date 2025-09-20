import React, { useState, useEffect } from 'react';
import { useAuth, useTranslation, useToast } from '../../index';
import { User, Subscription, LogEntry } from '../../types';
import { getAllUsers, updateUser } from '../../firebase';
import { Logo } from '../common/Logo';
import { ManageUserModal } from '../admin/ManageUserModal';
import { getSubscriptions } from '../../stripeApi';
import { log } from '../../loggingService';
import { AdminSubscriptionsView } from '../admin/AdminSubscriptionsView';
import { AdminLogsView } from '../admin/AdminLogsView';
import { AdminBugsView } from '../admin/AdminBugsView';

// --- SUB-COMPONENTS FOR DIFFERENT VIEWS ---

const StatCard: React.FC<{ title: string; value: string | number; color: string }> = ({ title, value, color }) => (
    <div className={`bg-slate-800 p-5 rounded-xl border-l-4 ${color}`}>
        <div className="text-sm text-slate-400">{title}</div>
        <div className="text-3xl font-bold text-white">{value}</div>
    </div>
);

const AdminDashboardView: React.FC<{ users: User[] }> = ({ users }) => {
    const totalUsers = users.length;
    const activeLibraries = users.filter(u => u.sheetId).length;
    const plans = users.reduce((acc, user) => {
        acc[user.plan] = (acc[user.plan] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-100 mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={totalUsers} color="border-cyan-500" />
                <StatCard title="Active Libraries" value={activeLibraries} color="border-green-500" />
                <StatCard title="Pro Users" value={plans.pro || 0} color="border-cyan-500" />
                <StatCard title="Free Users" value={plans.free || 0} color="border-slate-500" />
            </div>
        </div>
    );
};

const AdminUsersView: React.FC<{ users: User[], onManageUser: (user: User) => void }> = ({ users, onManageUser }) => {
    const { t } = useTranslation();

    const PlanBadge = ({ plan }: { plan: string }) => {
        const colors: { [key: string]: string } = {
            free: 'bg-slate-500/30 text-slate-300',
            pro: 'bg-cyan-500/20 text-cyan-300',
            enterprise: 'bg-indigo-500/20 text-indigo-300',
        };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colors[plan] || colors.free}`}>{plan.toUpperCase()}</span>;
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-100 mb-6">User Management</h2>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-x-auto">
                 <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/80">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('adminEmail')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('adminSheetId')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('adminPlan')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('adminStatus')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {users.map(user => (
                            <tr key={user.uid} className="hover:bg-slate-800/50">
                                <td className="px-6 py-4 whitespace-nowrap text-base text-slate-300">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400 font-mono" title={user.sheetId || ''}>{user.sheetId ? `${user.sheetId.substring(0, 15)}...` : 'Not connected'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><PlanBadge plan={user.plan} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${user.subscriptionStatus === 'active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                                        {user.subscriptionStatus}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                                    <button onClick={() => onManageUser(user)} className="text-cyan-400 hover:text-cyan-300 transition">Manage</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- MAIN ADMIN PAGE COMPONENT ---

export const AdminPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [managingUser, setManagingUser] = useState<User | null>(null);
    const [activeView, setActiveView] = useState('dashboard');
    const { signOut } = useAuth();
    const { t } = useTranslation();
    const { showToast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        const userList = await getAllUsers();
        setUsers(userList);
        const subs = await getSubscriptions(userList);
        setSubscriptions(subs);
        setLogs(log.getLogs()); // Get current logs
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // Subscribe to log updates
        const unsubscribe = log.subscribe(setLogs);
        return () => unsubscribe();
    }, []);

    const handleUpdateUser = async (uid: string, updates: Partial<User>) => {
        try {
            await updateUser(uid, updates);
            // Refetch all data to ensure consistency across views
            await fetchData(); 
            showToast(t('toastUserUpdatedAdmin'));
            setManagingUser(null);
        } catch (error) {
            console.error("Failed to update user:", error);
            showToast('Failed to update user.', 'error');
        }
    };

    const renderContent = () => {
        if (loading) return <p>Loading...</p>;

        switch (activeView) {
            case 'dashboard':
                return <AdminDashboardView users={users} />;
            case 'users':
                return <AdminUsersView users={users} onManageUser={setManagingUser} />;
            case 'subscriptions':
                return <AdminSubscriptionsView subscriptions={subscriptions} />;
            case 'logs':
                return <AdminLogsView logs={logs} onRefresh={() => setLogs(log.getLogs())} />;
            case 'bugs':
                return <AdminBugsView logs={logs} />;
            default:
                return <AdminDashboardView users={users} />;
        }
    };

    const Sidebar: React.FC = () => {
        const navItems = [
            { id: 'dashboard', label: t('adminNavDashboard') },
            { id: 'users', label: t('adminNavUsers') },
            { id: 'subscriptions', label: t('adminNavSubscriptions') },
            { id: 'logs', label: t('adminNavLogs') },
            { id: 'bugs', label: t('adminNavBugs') },
        ];

        return (
             <aside className="w-64 flex-shrink-0 bg-slate-800/70 p-6 hidden md:flex flex-col">
                <div className="mb-10">
                    <Logo />
                </div>
                <nav className="flex-grow">
                    <ul>
                        {navItems.map(item => (
                            <li key={item.id}>
                                <button
                                    onClick={() => setActiveView(item.id)}
                                    className={`w-full text-left text-base font-semibold px-4 py-3 rounded-lg transition ${activeView === item.id ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                                >
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                 <div>
                    <button onClick={signOut} className="w-full text-left text-base font-semibold px-4 py-3 rounded-lg transition text-red-400 hover:bg-red-500/20">
                        {t('signOut')}
                    </button>
                </div>
            </aside>
        );
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                 <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 h-20 flex items-center px-4 sm:px-8 md:hidden">
                    <div className="flex-grow">
                        <Logo />
                    </div>
                    <button onClick={signOut} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
                        {t('signOut')}
                    </button>
                </header>
                 <main className="flex-grow p-4 sm:p-8">
                    {renderContent()}
                </main>
            </div>

            {managingUser && (
                <ManageUserModal
                    user={managingUser}
                    onClose={() => setManagingUser(null)}
                    onSave={handleUpdateUser}
                />
            )}
        </div>
    );
};