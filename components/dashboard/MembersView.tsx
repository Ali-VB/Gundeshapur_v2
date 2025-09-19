import React, { useState, useMemo } from 'react';
import { useTranslation, useToast } from '../../index';
import { Member } from '../../types';
import { db } from '../../constants';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { MemberForm } from './MemberForm';
import { useSortableTable } from '../../hooks/useSortableTable';
import { SortIcon } from '../common/Icons';

export const MembersView: React.FC<{ members: Member[]; onUpdate: () => void }> = ({ members, onUpdate }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
    const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);
    
    const { items: sortedMembers, requestSort, sortConfig } = useSortableTable(members);

    const filteredMembers = useMemo(() => sortedMembers.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    ), [sortedMembers, search]);

    const handleSaveMember = async (memberData: any) => {
        if (editingMember) {
            await db.updateMember(editingMember.id, memberData);
            showToast(t('toastMemberUpdated'));
        } else {
            await db.addMember(memberData);
            showToast(t('toastMemberAdded'));
        }
        closeModal();
        onUpdate();
    };

    const handleDeleteMember = async () => {
        if (!deletingMemberId) return;
        await db.deleteMember(deletingMemberId);
        showToast(t('toastMemberDeleted'));
        setDeletingMemberId(null);
        onUpdate();
    };

    const openModal = (member?: Member) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMember(undefined);
    };

    const SortableHeader: React.FC<{ children: React.ReactNode, field: keyof Member }> = ({ children, field }) => {
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
                <Input type="text" placeholder={t('searchMembers')} value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:max-w-md" />
                <button onClick={() => openModal()} className="w-full sm:w-auto px-5 py-2.5 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition">{t('addMember')}</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/80">
                        <tr>
                            <SortableHeader field="name">{t('memberName')}</SortableHeader>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden md:table-cell">{t('memberEmail')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden lg:table-cell">{t('memberRole')}</th>
                            <SortableHeader field="status">{t('memberStatus')}</SortableHeader>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">{t('loanActions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredMembers.map(member => (
                            <tr key={member.id} className="hover:bg-slate-800/50">
                                <td className="px-4 py-4 whitespace-nowrap text-base font-medium text-white">{member.name}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-base text-slate-400 hidden md:table-cell">{member.email}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-base text-slate-400 hidden lg:table-cell">{member.role}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-slate-500/30 text-slate-300'}`}>{member.status}</span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-base font-medium space-x-4">
                                    <button onClick={() => openModal(member)} className="text-cyan-400 hover:text-cyan-300 transition">{t('edit')}</button>
                                    <button onClick={() => setDeletingMemberId(member.id)} className="text-red-500 hover:text-red-400 transition">{t('delete')}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingMember ? t('editMember') : t('addMember')}>
                <MemberForm member={editingMember} onSave={handleSaveMember} onCancel={closeModal} />
            </Modal>
            <Modal isOpen={!!deletingMemberId} onClose={() => setDeletingMemberId(null)} title={t('delete') + ' Member'}>
                <p className="mb-6 text-lg">{t('areYouSure')}?</p>
                <div className="flex justify-end gap-3">
                     <button onClick={() => setDeletingMemberId(null)} className="px-5 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-500 transition font-semibold">{t('cancel')}</button>
                     <button onClick={handleDeleteMember} className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold">{t('delete')}</button>
                </div>
            </Modal>
        </div>
    );
};
