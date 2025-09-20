
import React, { useState, useEffect } from 'react';
import { useAuth, useTranslation } from '../../index';
import { Book, Member, Loan } from '../../types';
import * as libraryApi from '../../libraryApi';

// Import Views
import { BooksView } from '../dashboard/BooksView';
import { MembersView } from '../dashboard/MembersView';
import { LoansView } from '../dashboard/LoansView';
import { SettingsPage } from '../dashboard/SettingsPage';
import { AILibrarianView } from '../dashboard/AILibrarianView';
import { TableSkeleton } from '../common/Skeleton';
import { DashboardStats } from '../dashboard/DashboardStats';

// Import Layout Components
import { Logo } from '../common/Logo';
import { DashboardHeader } from '../dashboard/DashboardHeader';

// Sidebar Component
const Sidebar: React.FC<{ activeView: string; setActiveView: (view: string) => void }> = ({ activeView, setActiveView }) => {
    const { t } = useTranslation();
    const navItems = [
        { id: 'dashboard', label: t('dashboardTitle') },
        { id: 'books', label: t('tabBooks') },
        { id: 'members', label: t('tabMembers') },
        { id: 'loans', label: t('tabLoans') },
        { id: 'billing', label: t('tabBilling') },
        { id: 'aiLibrarian', label: t('tabAILibrarian') },
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


export const DashboardPage = () => {
    const { user } = useAuth();
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
        if(activeView !== 'aiLibrarian' && activeView !== 'billing') {
            fetchData();
        }
    }, [user, activeView]);

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
        if(loadingData && activeView !== 'aiLibrarian' && activeView !== 'billing') {
             return <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 min-h-[400px]"><TableSkeleton /></div>;
        }
        
        const views: { [key: string]: React.ReactNode } = {
            'dashboard': <DashboardStats books={books} members={members} loans={loans} />,
            'books': <BooksView books={books} onUpdate={fetchData} />,
            'members': <MembersView members={members} onUpdate={fetchData} />,
            'loans': <LoansView loans={loans} books={books} members={members} onUpdate={fetchData} />,
            'billing': <SettingsPage />,
            'aiLibrarian': <AILibrarianView />,
        };

        const content = views[activeView] || null;
        if(activeView === 'dashboard') return content;
        
        return <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6 min-h-[400px]">{content}</div>;
    };
    
    return (
        <div className="flex min-h-screen">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <div className="flex-1 flex flex-col">
                 <DashboardHeader />
                <main className="flex-grow p-4 sm:p-8">
                    {user?.plan === 'free' && activeView !== 'billing' && <UpgradeBanner />}
                     <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-4xl font-bold text-slate-100 capitalize">
                            {activeView === 'aiLibrarian' ? t('tabAILibrarian') : activeView}
                        </h1>
                    </div>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};