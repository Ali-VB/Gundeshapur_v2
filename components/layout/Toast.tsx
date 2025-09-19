import React from 'react';
import { useToast } from '../../index';

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onDismiss: () => void }> = ({ message, type, onDismiss }) => {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
        <div className={`relative rounded-md shadow-lg text-white text-sm font-semibold py-3 px-4 ${bgColor} animate-fade-in-down`}>
            {message}
            <button onClick={onDismiss} className="absolute top-0 right-0 p-1.5 text-lg leading-none">&times;</button>
            <style>{`
                @keyframes fade-in-down {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export const ToastContainer = () => {
    const { toasts, removeToast } = useToast();
    return (
        <div className="fixed top-5 right-5 z-50 space-y-2 w-80">
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};
