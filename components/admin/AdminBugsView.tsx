import React, { useMemo } from 'react';
import { useTranslation } from '../../index';
import { LogEntry } from '../../types';

export const AdminBugsView: React.FC<{ logs: LogEntry[] }> = ({ logs }) => {
    const { t, locale } = useTranslation();

    const bugReports = useMemo(() => logs.filter(log => log.type === 'BUG'), [logs]);
    
    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleString(locale, {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-100 mb-6">{t('bugsTitle')}</h2>
            {bugReports.length === 0 ? (
                 <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-12 text-center">
                    <p className="text-slate-400">No bug reports submitted in this session.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bugReports.map(bug => (
                        <div key={bug.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-sm text-slate-400">
                                    {t('bugsReportedBy')} <span className="font-semibold text-cyan-400">{bug.user?.email || 'Unknown User'}</span>
                                </p>
                                <p className="text-xs text-slate-500">{formatTimestamp(bug.timestamp)}</p>
                            </div>
                            <p className="text-slate-200 whitespace-pre-wrap">{bug.message}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};