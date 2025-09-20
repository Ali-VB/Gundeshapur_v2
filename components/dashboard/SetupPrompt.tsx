import React, { useState } from 'react';
import { useAuth, useTranslation, useToast } from '../../index';
import { Input } from '../common/Input';
import { createSpreadsheet } from '../../googleApi';

export const SetupPrompt = () => {
    const { updateSheetId } = useAuth();
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [sheetIdInput, setSheetIdInput] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateSheet = async () => {
        setIsCreating(true);
        try {
            const newSheetId = await createSpreadsheet('Gundeshapur Library');
            if (newSheetId) {
                await updateSheetId(newSheetId);
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
        await updateSheetId(sheetIdInput.trim());
    };

    return (
        <div className="w-full max-w-4xl mx-auto text-center p-4">
            <h1 className="text-4xl font-bold text-slate-100 mb-3">{t('setupTitle')}</h1>
            <p className="text-lg text-slate-400 mb-10">{t('setupSubtitle')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 flex flex-col">
                    <h2 className="text-2xl font-bold text-cyan-300 mb-4">{t('setupOpt1Title')}</h2>
                    <p className="text-slate-400 flex-grow mb-8 text-base">{t('setupOpt1Desc')}</p>
                    <button 
                        onClick={handleCreateSheet} 
                        disabled={isCreating}
                        className="w-full px-5 py-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition disabled:bg-cyan-800 disabled:cursor-not-allowed"
                    >
                        {isCreating ? t('loading') + '...' : t('setupOpt1Button')}
                    </button>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-8 flex flex-col">
                    <h2 className="text-2xl font-bold text-cyan-300 mb-4">{t('setupOpt2Title')}</h2>
                    <p className="text-slate-400 flex-grow mb-8 text-base">{t('setupOpt2Desc')}</p>
                    <form onSubmit={handleConnectSheet} className="flex items-center gap-3">
                        <Input type="text" value={sheetIdInput} onChange={(e) => setSheetIdInput(e.target.value)} placeholder={t('setupOpt2Placeholder')} />
                        <button type="submit" className="px-5 py-2.5 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition flex-shrink-0">
                            {t('setupOpt2Button')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
