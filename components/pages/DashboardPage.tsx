

import React, { useState, useEffect } from 'react';
import { useAuth, useTranslation } from '../../index';
import { Book, Member, Loan } from '../../types';
import * as libraryApi from '../../libraryApi';

// Import Views
import { BooksView } from '../dashboard/BooksView';
import { MembersView } from '../dashboard/MembersView';
import { LoansView } from '../dashboard/LoansView';
import { SettingsPage } from '../dashboard/SettingsPage';
import { TableSkeleton } from '../common/Skeleton';
import { DashboardStats } from '../dashboard/DashboardStats';

// Import Layout Components
import { Logo } from '../common/Logo';
import { GlobeIcon } from '../common/Icons';
import { Locale } from '../../types';

// Sidebar Component
const Sidebar: React.FC<{ activeView: string; setActiveView: (view: string) => void }> = ({ activeView, setActiveView }) => {
    const { t } = useTranslation();
    const navItems = [
        { id: 'dashboard', label: t('dashboardTitle') },
        { id: 'books', label: t('tabBooks') },
        { id: 'members', label: t('tabMembers') },
        { id: 'loans', label: t('tabLoans') },
        { id: 'billing', label: t('tabBilling') },
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
                                className={`w-full text-left text-lg font-semibold px-4 py-3 rounded-lg transition ${activeView === item.id ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                            >
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

// Header Component
const DashboardHeader: React.FC<{ onSignOut: () => void; libraryName: string | null; }> = ({ onSignOut, libraryName }) => {
    const { user } = useAuth();
    const { t, locale, setLanguage } = useTranslation();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    
    const changeLanguage = (lang: Locale) => {
        setLanguage(lang);
        setDropdownOpen(false);
    };

    return (
        <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-20 h-20 flex items-center px-8">
            <div className="flex-grow">
                {libraryName && <span className="text-2xl font-bold text-slate-300">{libraryName}</span>}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-300 hidden sm:block">{user?.email}</span>
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
              <button onClick={onSignOut} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition">
                {t('signOut')}
              </button>
            </div>
        </header>
    );
};


export const DashboardPage = () => {
    const { user, signOut } = useAuth();
    const { t } = useTranslation();
    const [activeView, setActiveView] = useState('dashboard');
    const [books, setBooks] = useState<Book[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const fetchData = async () => {
        if (!user || !user.sheetId) return;
        if (!loadingData) setLoadingData(true);
        try {
            const [booksData, membersData, loansData] = await Promise.all([
                libraryApi.getBooks(user.sheetId),
                libraryApi.getMembers(user.sheetId),
                libraryApi.getLoans(user.sheetId),
            ]);
            setBooks(booksData);
            setMembers(membersData);
            setLoans(loansData);
        } catch (error) {
            console.error("Failed to fetch library data:", error);
            // Optionally: show a toast notification to the user
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const UpgradeBanner = () => (
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-5 mb-8 flex items-center justify-between text-white flex-col sm:flex-row gap-4 text-center sm:text-left">
            <div>
                <h3 className="font-bold text-lg">{t('upgradeBannerTitle')}</h3>
                <p className="text-sm opacity-90">{t('upgradeBannerSubtitle')}</p>
            </div>
            <button onClick={() => setActiveView('billing')} className="bg-white text-cyan-600 font-bold py-2 px-5 rounded-lg hover:bg-slate-100 transition whitespace-nowrap">{t('upgradeBannerButton')}</button>
        </div>
    );
    
    const renderContent = () => {
        if(loadingData) return <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 min-h-[400px]"><TableSkeleton /></div>;
        
        const views: { [key: string]: React.ReactNode } = {
            'dashboard': <DashboardStats books={books} members={members} loans={loans} />,
            'books': <BooksView books={books} onUpdate={fetchData} />,
            'members': <MembersView members={members} onUpdate={fetchData} />,
            'loans': <LoansView loans={loans} books={books} members={members} onUpdate={fetchData} />,
            'billing': <SettingsPage />,
        };

        const content = views[activeView] || null;
        if(activeView === 'dashboard') return content;
        
        return <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6 min-h-[400px]">{content}</div>;
    };
    
    const libraryName = user?.plan === 'enterprise' && user?.libraryName ? user.libraryName : null;

    return (
        <div className="flex min-h-screen">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <div className="flex-1 flex flex-col">
                 <DashboardHeader onSignOut={signOut} libraryName={libraryName} />
                <main className="flex-grow p-8">
                    {user?.plan === 'free' && <UpgradeBanner />}
                     <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-4xl font-bold text-slate-100 capitalize">{activeView}</h1>
                         {(activeView === 'dashboard' && user && user.plan !== 'free') && (
                            <div className="flex gap-3">
                                <button className="px-4 py-2 text-sm font-semibold bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                                    {t('backupButtonPro')}
                                </button>
                                <button disabled={user.plan !== 'enterprise'} className="px-4 py-2 text-sm font-semibold bg-slate-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition">
                                     {user.plan === 'enterprise' ? t('exportButtonEnt') : t('exportButton')}
                                </button>
                            </div>
                        )}
                    </div>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};
