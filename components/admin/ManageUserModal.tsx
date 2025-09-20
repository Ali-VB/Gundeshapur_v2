import React, { useState } from 'react';
import { User } from '../../types';
import { useTranslation } from '../../index';
import { Modal } from '../common/Modal';
import { Select } from '../common/Select';

interface ManageUserModalProps {
    user: User;
    onClose: () => void;
    onSave: (uid: string, updates: Partial<User>) => void;
}

export const ManageUserModal: React.FC<ManageUserModalProps> = ({ user, onClose, onSave }) => {
    const { t } = useTranslation();
    const [plan, setPlan] = useState(user.plan);
    const [role, setRole] = useState(user.role);

    const handleSave = () => {
        const updates: Partial<User> = {};
        if (plan !== user.plan) {
            updates.plan = plan;
        }
        if (role !== user.role) {
            updates.role = role;
        }
        if (Object.keys(updates).length > 0) {
            onSave(user.uid, updates);
        } else {
            onClose(); // No changes were made
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose} title={`${t('manageUser')}: ${user.displayName}`}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{t('changePlan')}</label>
                    <Select value={plan} onChange={(e) => setPlan(e.target.value as User['plan'])}>
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="enterprise">Enterprise</option>
                    </Select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">{t('changeRole')}</label>
                    <Select value={role} onChange={(e) => setRole(e.target.value as User['role'])}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </Select>
                </div>
                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-500 transition font-semibold">{t('cancel')}</button>
                    <button type="button" onClick={handleSave} className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition font-semibold">{t('save')}</button>
                 </div>
            </div>
        </Modal>
    );
};
