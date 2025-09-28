import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

type Toast = { id: number; message: string; type?: 'success' | 'error' };

export const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        let counter = 1;
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as { message: string; type?: 'success' | 'error' } | undefined;
            if (!detail) return;
            const id = counter++;
            const newToast = { id, message: detail.message, type: detail.type || 'success' };
            
            setToasts(prev => [...prev, newToast]);
            
            // Auto-remove after 4 seconds
            setTimeout(() => {
                setToasts((t) => t.filter(x => x.id !== id));
            }, 4000);
        };
        window.addEventListener('toast:show', handler as EventListener);
        return () => window.removeEventListener('toast:show', handler as EventListener);
    }, []);

    const removeToast = (id: number) => {
        setToasts(t => t.filter(x => x.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 space-y-3">
            {toasts.map((toast) => (
                <div 
                    key={toast.id} 
                    className={`flex items-center space-x-3 max-w-md w-full px-4 py-3 rounded-xl shadow-lg border backdrop-blur-sm animate-slide-up ${
                        toast.type === 'error' 
                            ? 'bg-red-50 border-red-200 text-red-800' 
                            : 'bg-green-50 border-green-200 text-green-800'
                    }`}
                >
                    {toast.type === 'error' ? (
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium flex-1">{toast.message}</span>
                    <button 
                        onClick={() => removeToast(toast.id)}
                        className="flex-shrink-0 p-1 hover:bg-black/10 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastContainer;