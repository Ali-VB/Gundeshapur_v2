import React, { useState } from 'react';
import { useTranslation } from '../../index';
import { Book, Member } from '../../types';
import { Select } from '../common/Select';

export const LoanForm: React.FC<{ books: Book[]; members: Member[]; onSave: (loanData: { bookId: string; memberId: string; }) => void; onCancel: () => void; }> = ({ books, members, onSave, onCancel }) => {
    const { t } = useTranslation();
    const [bookId, setBookId] = useState('');
    const [memberId, setMemberId] = useState('');

    const availableBooks = books.filter(b => b.availableCopies > 0);
    const activeMembers = members.filter(m => m.status === 'Active');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookId || !memberId) return;
        onSave({ bookId, memberId });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Select value={bookId} onChange={e => setBookId(e.target.value)} required>
                <option value="">{t('selectBook')}</option>
                {availableBooks.map(b => <option key={b.id} value={b.id}>{b.title} ({b.author})</option>)}
            </Select>
            <Select value={memberId} onChange={e => setMemberId(e.target.value)} required>
                <option value="">{t('selectMember')}</option>
                {activeMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
            </Select>
             <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-500 transition font-semibold">{t('cancel')}</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition font-semibold">{t('save')}</button>
             </div>
        </form>
    );
};
