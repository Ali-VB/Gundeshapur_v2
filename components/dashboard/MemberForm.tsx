import React, { useState } from 'react';
import { useTranslation } from '../../index';
import { Member } from '../../types';
import { Input } from '../common/Input';
import { Select } from '../common/Select';

export const MemberForm: React.FC<{ member?: Member; onSave: (memberData: any) => void; onCancel: () => void; }> = ({ member, onSave, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: member?.name || '', email: member?.email || '', phone: member?.phone || '',
        role: member?.role || 'Member', status: member?.status || 'Active',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder={t('memberName')} value={formData.name} onChange={handleChange} required />
            <Input name="email" type="email" placeholder={t('memberEmail')} value={formData.email} onChange={handleChange} required />
            <Input name="phone" placeholder={t('memberPhone')} value={formData.phone} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
                <Select name="role" value={formData.role} onChange={handleChange}>
                    <option>Member</option>
                    <option>Librarian</option>
                </Select>
                <Select name="status" value={formData.status} onChange={handleChange}>
                    <option>Active</option>
                    <option>Inactive</option>
                </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-500 transition font-semibold">{t('cancel')}</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition font-semibold">{t('save')}</button>
            </div>
        </form>
    );
};
