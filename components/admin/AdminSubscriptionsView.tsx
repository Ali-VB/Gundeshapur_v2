import React from 'react';
import { useTranslation } from '../../index';
import { Subscription } from '../../types';

export const AdminSubscriptionsView: React.FC<{ subscriptions: Subscription[] }> = ({ subscriptions }) => {
    const { t, locale } = useTranslation();

    const StatusBadge = ({ status }: { status: Subscription['status'] }) => {
        const colors = {
            active: 'bg-green-500/20 text-green-300',
            past_due: 'bg-yellow-500/20 text-yellow-300',
            canceled: 'bg-slate-500/30 text-slate-300',
        };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${colors[status]}`}>{status.replace('_', ' ')}</span>;
    };

    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-100 mb-6">{t('adminNavSubscriptions')}</h2>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/80">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('subsUser')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('subsPlan')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('subsStatus')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('subsPeriod')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {subscriptions.map(sub => (
                            <tr key={sub.id} className="hover:bg-slate-800/50">
                                <td className="px-6 py-4 whitespace-nowrap text-base text-slate-300">{sub.userEmail}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{sub.plan}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm"><StatusBadge status={sub.status} /></td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                                    {`${formatDate(sub.currentPeriodStart)} - ${formatDate(sub.currentPeriodEnd)}`}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};