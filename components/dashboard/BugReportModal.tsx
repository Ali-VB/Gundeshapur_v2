import React, { useState } from 'react';
import { useAuth, useTranslation, useToast } from '../../index';
import { Modal } from '../common/Modal';
import { log } from '../../loggingService';

export const BugReportModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { showToast } = useToast();
    const [report, setReport] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!report.trim()) return;
        
        log.addLog('BUG', report, user);
        showToast(t('toastBugReported'));
        setReport('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('bugReportTitle')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-slate-400 text-sm">{t('bugReportDesc')}</p>
                <textarea
                    value={report}
                    onChange={(e) => setReport(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-base"
                    placeholder="Please be as detailed as possible..."
                    required
                />
                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-500 transition font-semibold">{t('cancel')}</button>
                    <button type="submit" className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition font-semibold">{t('submit')}</button>
                </div>
            </form>
        </Modal>
    );
};