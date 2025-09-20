

import React, { useState, useMemo } from 'react';
import { useTranslation, useToast, useAuth } from '../../index';
import { Loan, Book, Member } from '../../types';
import * as libraryApi from '../../libraryApi';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { LoanForm } from './LoanForm';
import { useSortableTable } from '../../hooks/useSortableTable';
import { SortIcon } from '../common/Icons';

export const LoansView: React.FC<{ loans: Loan[]; books: Book[]; members: Member[]; onUpdate: () => void }> = ({ loans, books, members, onUpdate }) => {
    const { t, locale } = useTranslation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const bookMap = useMemo(() => new Map(books.map(b => [b.id, b])), [books]);
    const memberMap = useMemo(() => new Map(members.map(m => [m.id, m])), [members]);

    const enrichedLoans = useMemo(() => loans.map(l => ({
        ...l,
        bookTitle: bookMap.get(l.bookId)?.title || 'N/A',
        memberName: memberMap.get(l.memberId)?.name || 'N/A',
    })), [loans, bookMap, memberMap]);

    const { items: sortedLoans, requestSort, sortConfig } = useSortableTable(enrichedLoans, { key: 'dueDate', direction: 'ascending'});

    const filteredLoans = useMemo(() => sortedLoans.filter(l => {
        const searchTerm = search.toLowerCase();
        return (l.bookTitle.toLowerCase().includes(searchTerm) || l.memberName.toLowerCase().includes(searchTerm));
    }), [sortedLoans, search]);

    const handleSaveLoan = async (loanData: { bookId: string; memberId: string; }) => {
        if (!user?.sheetId) return;
        try {
            await libraryApi.addLoan(user.sheetId, loanData);
            showToast(t('toastLoanAdded'));
            setIsModalOpen(false);
            onUpdate();
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const handleReturnLoan = async (loanId: string) => {
        if (!user?.sheetId) return;
        await libraryApi.returnLoan(user.sheetId, loanId);
        showToast(t('toastLoanReturned'));
        onUpdate();
    };

    const StatusBadge = ({ status }: { status: Loan['status'] }) => {
        const colors = {
            'On Loan': 'bg-blue-500/20 text-blue-300',
            'Overdue': 'bg-yellow-500/20 text-yellow-300',
            'Returned': 'bg-green-500/20 text-green-300',
        };
        return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{status}</span>;
    };
    
    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    const SortableHeader: React.FC<{ children: React.ReactNode, field: keyof (typeof enrichedLoans[0]) }> = ({ children, field }) => {
        const isSorted = sortConfig?.key === field;
        return (
             <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                <button className="flex items-center gap-2" onClick={() => requestSort(field)}>
                    {children}
                    <SortIcon direction={isSorted ? sortConfig.direction : undefined} />
                </button>
            </th>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <Input type="text" placeholder={t('searchLoans')} value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:max-w-md" />
                <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-5 py-2.5 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition">{t('lendBook')}</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/80">
                        <tr>
                            <SortableHeader field="bookTitle">{t('loanBookTitle')}</SortableHeader>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden md:table-cell">{t('loanMemberName')}</th>
                            <SortableHeader field="dueDate">{t('loanDueDate')}</SortableHeader>
                            <SortableHeader field="status">{t('loanStatus')}</SortableHeader>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">{t('loanActions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredLoans.map(loan => (
                            <tr key={loan.id} className="hover:bg-slate-800/50">
                                <td className="px-4 py-4 whitespace-nowrap text-base font-medium text-white">{loan.bookTitle}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-base text-slate-400 hidden md:table-cell">{loan.memberName}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-base text-slate-400">{formatDate(loan.dueDate)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm"><StatusBadge status={loan.status} /></td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-base font-medium">
                                    {loan.status !== 'Returned' && (
                                        <button onClick={() => handleReturnLoan(loan.id)} className="text-cyan-400 hover:text-cyan-300 transition">{t('returnLoan')}</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('lendBook')}>
                <LoanForm books={books} members={members} onSave={handleSaveLoan} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};