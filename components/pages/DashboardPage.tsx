import React, { useState, useEffect } from 'react';
import { useAuth, useTranslation } from '../../index';
import { Book, Member, Loan } from '../../types';
import { db } from '../../constants';
import { BooksView } from '../dashboard/BooksView';
import { MembersView } from '../dashboard/MembersView';
import { LoansView } from '../dashboard/LoansView';
import { SettingsPage } from '../dashboard/SettingsPage';
import { TableSkeleton } from '../common/Skeleton';
import { DashboardStats } from '../dashboard/DashboardStats';
import { DashboardHeader } from '../dashboard/DashboardHeader';

export const DashboardPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState('books');
    const [books, setBooks] = useState<Book[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const fetchData = async () => {
        if (!loadingData) setLoadingData(true);
        const [booksData, membersData, loansData] = await Promise.all([
            db.getBooks() as Promise<Book[]>,
            db.getMembers() as Promise<Member[]>,
            db.getLoans() as Promise<Loan[]>,
        ]);
        setBooks(booksData);
        setMembers(membersData);
        setLoans(loansData);
        setLoadingData(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const UpgradeBanner = () => (
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-5 mb-8 flex items-center justify-between text-white flex-col sm:flex-row gap-4 text-center sm:text-left">
            <div>
                <h3 className="font-bold text-lg">{t('upgradeBannerTitle')}</h3>
                <p className="text-sm opacity-90">{t('upgradeBannerSubtitle')}</p>
            </div>
            <button onClick={() => setActiveTab('billing')} className="bg-white text-cyan-600 font-bold py-2 px-5 rounded-lg hover:bg-slate-100 transition whitespace-nowrap">{t('upgradeBannerButton')}</button>
        </div>
    );
    
    const renderContent = () => {
        if(loadingData) return <TableSkeleton />;
        switch(activeTab) {
            case 'books': return <BooksView books={books} onUpdate={fetchData} />;
            case 'members': return <MembersView members={members} onUpdate={fetchData} />;
            case 'loans': return <LoansView loans={loans} books={books} members={members} onUpdate={fetchData} />;
            case 'billing': return <SettingsPage />;
            default: return null;
        }
    };

    return (
        <div>
            {user?.plan === 'free' && <UpgradeBanner />}
            <DashboardHeader />
            {!loadingData && <DashboardStats books={books} members={members} loans={loans} />}
            
            <div className="border-b border-slate-700 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {[t('tabBooks'), t('tabMembers'), t('tabLoans'), t('tabBilling')].map(tabName => {
                        const tabId = (tabName === t('tabBooks')) ? 'books' : (tabName === t('tabMembers')) ? 'members' : (tabName === t('tabLoans')) ? 'loans' : 'billing';
                        return (
                             <button key={tabId} onClick={() => setActiveTab(tabId)} className={`${activeTab === tabId ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-base`}>
                                {tabName}
                            </button>
                        )
                    })}
                </nav>
            </div>
            
             <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6 min-h-[400px]">
                {renderContent()}
            </div>
        </div>
    );
};
