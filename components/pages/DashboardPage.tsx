
import React, { useState, useEffect } from 'react';
import { useAuth, useTranslation, useToast } from '../../index';
import { Book, Member, Loan } from '../../types';
import * as libraryApi from '../../libraryApi';
import { createSpreadsheet } from '../../googleApi';

// Import Views
import { BooksView } from '../dashboard/BooksView';
import { MembersView } from '../dashboard/MembersView';
import { LoansView } from '../dashboard/LoansView';
import { SettingsPage } from '../dashboard/SettingsPage';
import { TableSkeleton } from '../common/Skeleton';
import { DashboardStats } from '../dashboard/DashboardStats';

// Import Layout Components
import { Logo } from '../common/Logo';
import { DashboardHeader } from '../dashboard/DashboardHeader';
import { Input } from '../common/Input';

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


export const DashboardPage = () => {
    const { user, updateSheetId } = useAuth();
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [activeView, setActiveView] = useState('dashboard');
    const [books, setBooks] = useState<Book[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [sheetIdInput, setSheetIdInput] = useState('');
    const [isCreating, setIsCreating] = useState(false);

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
        if(activeView !== 'billing') {
            fetchData();
        }
    }, [user, activeView]);

    const handleCreateSheet = async () => {
        setIsCreating(true);
        try {
            const newSheetId = await createSpreadsheet('Gundeshapur Library');
            if (newSheetId) {
                await updateSheetId(newSheetId);
                showToast('Sheet created successfully!', 'success');
            } else {
                 showToast('Failed to create new sheet.', 'error');
            }
        } catch (error) {
            console.error("Failed to create sheet:", error);
            showToast('An error occurred while creating the sheet.', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const handleConnectSheet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sheetIdInput.trim()) return;
        try {
            await updateSheetId(sheetIdInput.trim());
            showToast('Sheet connected successfully!', 'success');
            setSheetIdInput('');
        } catch (error) {
            console.error("Failed to connect sheet:", error);
            showToast('Failed to connect sheet. Please check the Sheet ID.', 'error');
        }
    };

    const SetupPrompt = () => (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 mb-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-100 mb-3">{t('setupTitle')}</h2>
                <p className="text-lg text-slate-400">{t('setupSubtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-cyan-300 mb-4">{t('setupOpt1Title')}</h3>
                    <p className="text-slate-300 flex-grow mb-6">{t('setupOpt1Desc')}</p>
                    <button 
                        onClick={handleCreateSheet} 
                        disabled={isCreating}
                        className="w-full px-5 py-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition disabled:bg-cyan-800 disabled:cursor-not-allowed"
                    >
                        {isCreating ? t('loading') + '...' : t('setupOpt1Button')}
                    </button>
                </div>
                <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-cyan-300 mb-4">{t('setupOpt2Title')}</h3>
                    <p className="text-slate-300 flex-grow mb-6">{t('setupOpt2Desc')}</p>
                    <form onSubmit={handleConnectSheet} className="flex items-center gap-3">
                        <Input 
                            type="text" 
                            value={sheetIdInput} 
                            onChange={(e) => setSheetIdInput(e.target.value)} 
                            placeholder={t('setupOpt2Placeholder')} 
                            className="flex-1"
                        />
                        <button 
                            type="submit" 
                            className="px-5 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex-shrink-0"
                        >
                            {t('setupOpt2Button')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

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
        if(loadingData && activeView !== 'billing') {
             return <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 min-h-[400px]"><TableSkeleton /></div>;
        }
        
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
    
    return (
        <div className="flex min-h-screen">
            <Sidebar activeView={activeView} setActiveView={setActiveView} />
            <div className="flex-1 flex flex-col">
                 <DashboardHeader />
                <main className="flex-grow p-4 sm:p-8">
                    {/* Show setup prompt if user doesn't have a sheetId */}
                    {!user?.sheetId && <SetupPrompt />}
                    
                    {user?.plan === 'free' && activeView !== 'billing' && <UpgradeBanner />}
                     <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h1 className="text-4xl font-bold text-slate-100 capitalize">
                            {activeView}
                        </h1>
                    </div>
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};
