import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200';
        let icon = <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />;

        if (toast.type === 'success') {
          bg = 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-100';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          bg = 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800/60 text-red-900 dark:text-red-100';
          icon = <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-100';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start space-x-3 p-3.5 rounded-lg border shadow-xl transition-all duration-200 animate-in slide-in-from-bottom-2 ${bg}`}
          >
            <div className="mt-0.5">{icon}</div>
            <div className="flex-1">
              <h5 className="font-bold text-xs">{toast.title}</h5>
              <p className="text-[11px] opacity-80 mt-0.5 leading-relaxed">{toast.description}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-50 hover:opacity-100 p-1 rounded transition-opacity cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
