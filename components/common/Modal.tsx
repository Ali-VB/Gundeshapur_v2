import React from 'react';

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex justify-center items-center p-4 transition-opacity duration-300" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-lg border border-slate-700 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale" 
                 onClick={e => e.stopPropagation()}
                 style={{ animation: 'fade-in-scale 0.3s forwards' }}>
                <div className="flex justify-between items-center p-5 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6">{children}</div>
            </div>
             <style>{`
                @keyframes fade-in-scale {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fade-in-scale { animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
};
