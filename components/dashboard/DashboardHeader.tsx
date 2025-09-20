
import React, { useState } from 'react';
import { useAuth, useTranslation, useToast } from '../../index';
import { Locale } from '../../types';
import { GlobeIcon } from '../common/Icons';
import { Logo } from '../common/Logo';

export const DashboardHeader = () => {
    const { user, signOut } = useAuth();
    const { t, locale, setLanguage } = useTranslation();
    const { showToast } = useToast();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const isPro = user?.plan === 'pro' || user?.plan === 'enterprise';
    const isEnterprise = user?.plan === 'enterprise';
    const libraryName = isEnterprise && user?.libraryName ? user.libraryName : null;

    const handleExport = () => {
        showToast("Export started! Your data will be available shortly.", "success");
    };

     const handleBackup = () => {
        showToast("Backup initiated! This may take a few moments.", "success");
    };
    
    const changeLanguage = (lang: Locale) => {
        setLanguage(lang);
        setDropdownOpen(false);
    };

    return (
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-20 h-20 flex items-center px-4 sm:px-8">
            <div className="flex-grow">
                 <div className="md:hidden">
                    <Logo className="h-10 w-auto" />
                 </div>
                 {libraryName && <span className="text-xl sm:text-2xl font-bold text-slate-300 hidden md:inline">{libraryName}</span>}
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden sm:flex gap-3">
                    <button onClick={handleBackup} disabled={!isPro} className="px-3 py-2 text-xs sm:text-sm font-semibold bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition">
                        {isPro ? t('backupButtonPro') : t('backupButton')}
                    </button>
                    <button onClick={handleExport} disabled={!isEnterprise} className="px-3 py-2 text-xs sm:text-sm font-semibold bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition">
                         {isEnterprise ? t('exportButtonEnt') : t('exportButton')}
                    </button>
                </div>

                <div className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-2 rounded-full hover:bg-slate-700 transition">
                        <GlobeIcon />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-40">
                            <button onClick={() => changeLanguage('en')} className={`block w-full text-left px-4 py-2 text-sm ${locale === 'en' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}>English</button>
                            <button onClick={() => changeLanguage('es')} className={`block w-full text-left px-4 py-2 text-sm ${locale === 'es' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}>Español</button>
                            <button onClick={() => changeLanguage('fr')} className={`block w-full text-left px-4 py-2 text-sm ${locale === 'fr' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}>Français</button>
                        </div>
                    )}
                </div>
                <button onClick={signOut} className="px-3 sm:px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
                  {t('signOut')}
                </button>
            </div>
        </header>
    );
}