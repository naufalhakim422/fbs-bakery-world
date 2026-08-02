'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X, Sparkles, Tag } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'voucher';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface NotificationContextType {
  showToast: (title: string, message: string, type?: ToastType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((title: string, message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, title, message };
    
    setToasts(prev => [newToast, ...prev].slice(0, 3));

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl transition-all duration-300 transform translate-y-0 animate-slide-up ${
              t.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-700/50 backdrop-blur-md'
                : t.type === 'voucher'
                ? 'bg-[#800020]/95 text-[#F7E7CE] border-[#D4AF37]/50 backdrop-blur-md'
                : t.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-700/50 backdrop-blur-md'
                : 'bg-stone-900/90 text-stone-100 border-stone-700/50 backdrop-blur-md'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {t.type === 'voucher' && <Tag className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />}
            {t.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              <h5 className="font-bold text-sm tracking-wide mb-0.5">{t.title}</h5>
              <p className="opacity-90 leading-relaxed font-medium">{t.message}</p>
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Close Notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    // Safe fallback if used outside provider
    return {
      showToast: (title: string, message: string) => {
        console.log(`[Toast] ${title}: ${message}`);
      }
    };
  }
  return context;
};
