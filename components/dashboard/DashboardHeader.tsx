import React from 'react';
import { useAuth, useTranslation, useToast } from '../../index';

export const DashboardHeader = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { showToast } = useToast();

    const isPro = user?.plan === 'pro' || user?.plan === 'enterprise';
    const isEnterprise = user?.plan === 'enterprise';

    const handleExport = () => {
        showToast("Export started! Your data will be available shortly.", "success");
    };

     const handleBackup = () => {
        showToast("Backup initiated! This may take a few moments.", "success");
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-4xl font-bold text-slate-100">{t('dashboardTitle')}</h1>
            <div className="flex gap-3">
                <button onClick={handleBackup} disabled={!isPro} className="px-4 py-2 text-sm font-semibold bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition">
                    {isPro ? t('backupButtonPro') : t('backupButton')}
                </button>
                <button onClick={handleExport} disabled={!isEnterprise} className="px-4 py-2 text-sm font-semibold bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition">
                     {isEnterprise ? t('exportButtonEnt') : t('exportButton')}
                </button>
            </div>
        </div>
    );
}
