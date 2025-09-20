
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../index';
import { User } from '../../types';
import { getAllUsers } from '../../firebase';

export const AdminPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const userList = await getAllUsers();
            setUsers(userList);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const PlanBadge = ({ plan }: { plan: string }) => {
        const colors: { [key: string]: string } = {
            free: 'bg-slate-500/30 text-slate-300',
            pro: 'bg-cyan-500/20 text-cyan-300',
            enterprise: 'bg-indigo-500/20 text-indigo-300',
        };
        const color = colors[plan] || colors.free;
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${color}`}>{plan.toUpperCase()}</span>;
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h1 className="text-3xl font-bold text-slate-100 mb-6">{t('adminTitle')}</h1>
            {loading ? <p>{t('loading')}...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('adminDisplayName')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('adminEmail')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('adminPlan')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('adminStatus')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-900/50 divide-y divide-slate-700">
                            {users.map(user => (
                                <tr key={user.uid}>
                                    <td className="px-6 py-4 whitespace-nowrap text-base font-medium text-white">{user.displayName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-slate-400">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><PlanBadge plan={user.plan} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-base text-green-400 capitalize">{user.subscriptionStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
