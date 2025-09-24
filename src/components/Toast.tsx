import React, { useEffect, useState } from 'react';

type Toast = { id: number; message: string; type?: 'success' | 'error' };

export const ToastContainer: React.FC = () => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    useEffect(() => {
        let counter = 1;
        const handler = (e: Event) => {
            const detail = (e as CustomEvent).detail as { message: string; type?: 'success' | 'error' } | undefined;
            if (!detail) return;
            const id = counter++;
            // keep only the latest toast in state (show one at a time)
            setToasts([{ id, message: detail.message, type: detail.type || 'success' }]);
            // auto-remove after 3s
            setTimeout(() => {
                setToasts((t) => t.filter(x => x.id !== id));
            }, 3000);
        };
        window.addEventListener('toast:show', handler as EventListener);
        return () => window.removeEventListener('toast:show', handler as EventListener);
    }, []);

    if (toasts.length === 0) return null;
    const t = toasts[0];

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <div key={t.id} className={`max-w-md w-full px-4 py-3 rounded shadow-md text-sm text-white bg-red-600`}>
                {t.message}
            </div>
        </div>
    );
};

export default ToastContainer;
