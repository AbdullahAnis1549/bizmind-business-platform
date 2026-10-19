import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast]);
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast]);
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast]);
  const warning = useCallback((msg, duration) => addToast(msg, 'warning', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
            },
            error: {
              bg: 'bg-rose-50 border-rose-200 text-rose-900',
              icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
            },
            warning: {
              bg: 'bg-amber-50 border-amber-200 text-amber-900',
              icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
            },
            info: {
              bg: 'bg-brand-50 border-brand-200 text-brand-900',
              icon: <Info className="w-5 h-5 text-brand-600 shrink-0" />,
            },
          }[toast.type] || {
            bg: 'bg-slate-50 border-slate-200 text-slate-900',
            icon: <Info className="w-5 h-5 text-slate-600 shrink-0" />,
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-soft-lg transition-all duration-300 animate-in slide-in-from-bottom-2 ${typeConfig.bg}`}
            >
              {typeConfig.icon}
              <div className="text-sm font-medium flex-1 break-words leading-snug">{toast.message}</div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
