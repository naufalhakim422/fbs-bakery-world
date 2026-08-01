'use client';

import React from 'react';
import { AlertTriangle, LogOut, CheckCircle, HelpCircle, X, Save, Trash2, ImageIcon, Upload } from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'logout' | 'save' | 'upload';
  imageSrc?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  type = 'danger',
  imageSrc,
  onConfirm,
  onCancel
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  // Icons based on type
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <Trash2 className="w-10 h-10 text-red-600 animate-bounce" />;
      case 'logout':
        return <LogOut className="w-10 h-10 text-[#800020] animate-pulse" />;
      case 'save':
        return <Save className="w-10 h-10 text-emerald-600 animate-pulse" />;
      case 'upload':
        return <Upload className="w-10 h-10 text-blue-600 animate-pulse" />;
      case 'info':
        return <HelpCircle className="w-10 h-10 text-amber-500" />;
      case 'warning':
        return <AlertTriangle className="w-10 h-10 text-amber-500" />;
      default:
        return <CheckCircle className="w-10 h-10 text-emerald-500" />;
    }
  };

  // Localized default buttons
  const getDefaultConfirmText = () => {
    if (confirmText) return confirmText;
    switch (type) {
      case 'logout':
        return language === 'ID' ? 'Ya, Keluar' : language === 'MS' ? 'Ya, Keluar' : 'Yes, Logout';
      case 'save':
        return language === 'ID' ? 'Ya, Simpan' : language === 'MS' ? 'Ya, Simpan' : 'Yes, Save';
      case 'upload':
        return language === 'ID' ? 'Ya, Unggah' : language === 'MS' ? 'Ya, Muat Naik' : 'Yes, Upload';
      default:
        return language === 'ID' ? 'Ya, Hapus' : language === 'MS' ? 'Ya, Padam' : 'Yes, Delete';
    }
  };

  const defaultCancelText = cancelText || (
    language === 'ID' ? 'Batal' : language === 'MS' ? 'Batal' : 'Cancel'
  );

  // Theme styles based on type
  const getButtonStyles = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border border-red-500';
      case 'logout':
        return 'bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] border border-[#D4AF37]/30';
      case 'save':
        return 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500';
      case 'upload':
        return 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-500';
      case 'warning':
        return 'bg-amber-500 hover:bg-amber-600 text-white';
      default:
        return 'bg-stone-900 hover:bg-stone-850 text-white';
    }
  };

  // Border glow based on type
  const getBorderGlow = () => {
    switch (type) {
      case 'danger':
        return 'border-red-200 shadow-red-100/50';
      case 'logout':
        return 'border-[#D4AF37]/30 shadow-[#D4AF37]/10';
      case 'save':
        return 'border-emerald-200 shadow-emerald-100/50';
      case 'upload':
        return 'border-blue-200 shadow-blue-100/50';
      case 'warning':
        return 'border-amber-200 shadow-amber-100/50';
      default:
        return 'border-stone-200';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      style={{ animation: 'modal-fade-in 0.25s ease-out' }}
    >
      <div 
        className={`bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border ${getBorderGlow()} relative space-y-4`}
        style={{ animation: 'modal-scale-up 0.25s ease-out' }}
      >
        
        {/* Close Button */}
        <button 
          onClick={onCancel} 
          className="absolute top-4 right-4 p-1 text-stone-400 hover:text-stone-800 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          
          {/* Image or Icon */}
          {imageSrc ? (
            <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-stone-100 shadow-lg">
              <img 
                src={imageSrc} 
                alt="Konfirmasi" 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-150 shadow-inner">
              {getIcon()}
            </div>
          )}
          
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug">
              {title}
            </h3>
            <p className="text-stone-500 text-xs leading-relaxed max-w-[280px] mx-auto">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl border border-stone-200 transition-colors"
          >
            {defaultCancelText}
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onCancel(); }}
            className={`w-1/2 py-2.5 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 ${getButtonStyles()}`}
          >
            {getDefaultConfirmText()}
          </button>
        </div>

      </div>
    </div>
  );
};
