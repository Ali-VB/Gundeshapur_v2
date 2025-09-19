import React from 'react';
import { Book, Member, Loan } from '../../types';

interface DashboardStatsProps {
    books: Book[];
    members: Member[];
    loans: Loan[];
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ books, members, loans }) => {
    const totalBooks = books.length;
    const activeMembers = members.filter(m => m.status === 'Active').length;
    const overdueLoans = loans.filter(l => l.status === 'Overdue').length;

    const StatCard: React.FC<{ title: string; value: number; color: string }> = ({ title, value, color }) => (
        <div className={`bg-slate-800 p-5 rounded-xl border-l-4 ${color}`}>
            <div className="text-sm text-slate-400">{title}</div>
            <div className="text-3xl font-bold text-white">{value}</div>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard title="Total Books" value={totalBooks} color="border-cyan-500" />
            <StatCard title="Active Members" value={activeMembers} color="border-green-500" />
            <StatCard title="Overdue Loans" value={overdueLoans} color="border-yellow-500" />
        </div>
    );
};
