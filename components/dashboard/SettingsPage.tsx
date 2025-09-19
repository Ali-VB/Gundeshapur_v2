import React from 'react';
import { useAuth, useTranslation, useToast } from '../../index';

export const SettingsPage = () => {
    const { user, updateSubscription } = useAuth();
    const { t } = useTranslation();
    const { showToast } = useToast();
    
    const handleUpgrade = async (plan: 'free' | 'pro' | 'enterprise') => {
        await updateSubscription(plan);
        showToast(`Successfully changed plan to ${plan}!`, 'success');
    }

    const PricingCard = ({ plan, title, price, features, recommended = false }: {plan: 'free' | 'pro' | 'enterprise', title: string, price: string, features: string[], recommended?: boolean}) => (
        <div className={`border rounded-xl p-8 flex flex-col ${recommended ? 'border-cyan-500 bg-slate-800' : 'border-slate-700 bg-slate-800/50'}`}>
            {recommended && <span className="text-xs font-bold uppercase text-cyan-400 mb-2 text-center">{t('recommended')}</span>}
            <h3 className="text-2xl font-bold text-center text-white">{title}</h3>
            <p className="text-5xl font-extrabold text-center my-6 text-white">{price}<span className="text-base font-normal text-slate-400">/mo</span></p>
            <ul className="space-y-4 text-slate-300 mb-8 flex-grow">
                {features.map(f => <li key={f} className="flex items-center gap-3"><svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{f}</li>)}
            </ul>
            {user?.plan === plan ? (
                <button disabled className="w-full py-3 font-semibold text-center rounded-lg bg-slate-600 text-slate-400 cursor-not-allowed">{t('currentPlan')}</button>
            ) : (
                <button onClick={() => handleUpgrade(plan)} className={`w-full py-3 font-semibold text-center rounded-lg transition ${recommended ? 'bg-cyan-600 text-white hover:bg-cyan-700' : 'bg-slate-600 hover:bg-slate-500'}`}>
                    {user?.plan === 'free' ? t('upgrade') : (plan === 'enterprise' ? t('upgrade') : t('downgrade'))}
                </button>
            )}
        </div>
    );

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-100 mb-2">{t('billingTitle')}</h2>
            <p className="text-slate-400 mb-10">{t('billingSubtitle')}</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <PricingCard plan="free" title={t('planFree')} price="$0" features={["Up to 100 books", "Up to 25 members", "Basic support"]} />
                <PricingCard plan="pro" title={t('planPro')} price="$15" features={["Unlimited books & members", "JSON Backup & Restore", "Multi-language support", "Priority email support"]} recommended />
                <PricingCard plan="enterprise" title={t('planEnterprise')} price="$40" features={["All Pro features", "CSV/Excel Export", "Custom Branding", "Dedicated support"]} />
            </div>
        </div>
    );
};
