import React, { useRef, useEffect } from 'react';
import { useTranslation } from '../../index';
import { LogEntry, LogType } from '../../types';

export const AdminLogsView: React.FC<{ logs: LogEntry[], onRefresh: () => void }> = ({ logs, onRefresh }) => {
    const { t, locale } = useTranslation();
    const logsEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [logs]);

    const LogTypeBadge: React.FC<{ type: LogType }> = ({ type }) => {
        const colors = {
            INFO: 'bg-blue-500/20 text-blue-300',
            ERROR: 'bg-red-500/20 text-red-300',
            BUG: 'bg-purple-500/20 text-purple-300',
        };
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded ${colors[type]}`}>{type}</span>;
    };

    const formatTimestamp = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-100">{t('logsTitle')}</h2>
                <button onClick={onRefresh} className="px-4 py-2 text-sm font-semibold bg-slate-700 rounded-lg hover:bg-slate-600 transition">
                    {t('logsRefresh')}
                </button>
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl h-[calc(100vh-250px)] overflow-y-auto p-4 font-mono text-sm">
                {logs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 mb-2">
                        <span className="text-slate-500">{formatTimestamp(log.timestamp)}</span>
                        <LogTypeBadge type={log.type} />
                        <p className="text-slate-300 flex-1 break-words">{log.message}</p>
                    </div>
                ))}
                <div ref={logsEndRef} />
            </div>
        </div>
    );
};