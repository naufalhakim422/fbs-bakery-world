'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { Cookie, X, Check, Settings, ShieldCheck } from 'lucide-react';

export function CookieConsentBanner() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Cookie Settings Toggles
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [marketingEnabled, setMarketingEnabled] = useState(true);

  useEffect(() => {
    // Check if user has already given cookie consent
    const consent = localStorage.getItem('fbs_cookie_consent');
    if (!consent) {
      // Delay 1s for smooth entrance animation
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('fbs_cookie_consent', JSON.stringify({
      status: 'accepted',
      essential: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleRejectAll = () => {
    localStorage.setItem('fbs_cookie_consent', JSON.stringify({
      status: 'rejected',
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('fbs_cookie_consent', JSON.stringify({
      status: 'dismissed',
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setIsVisible(false);
  };

  const handleSaveSettings = () => {
    localStorage.setItem('fbs_cookie_consent', JSON.stringify({
      status: 'customized',
      essential: true,
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
      timestamp: new Date().toISOString()
    }));
    setShowSettingsModal(false);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Bottom Desktop & Mobile Cookie Consent Dock */}
      <aside 
        aria-label="Cookie Consent Notice" 
        className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-xl z-50 animate-fade-in select-none"
      >
        <div className="bg-stone-950/95 backdrop-blur-2xl border-2 border-[#D4AF37]/50 shadow-[0_20px_60px_rgba(0,0,0,0.8)] rounded-3xl p-4 sm:p-6 text-white relative overflow-hidden flex flex-col gap-4">
          
          {/* Top Decorative Gold Shimmer Bar & Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent animate-pulse" />
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#D4AF37]/20 border border-[#D4AF37]/50 rounded-2xl text-[#D4AF37] shadow-lg flex-shrink-0">
                <Cookie className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-full text-[#F7E7CE] text-[10px] font-black uppercase tracking-widest mb-0.5">
                  <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
                  <span>PRIVASI & PRIVILEGE COOKIE</span>
                </div>
                <h4 className="font-serif font-black text-sm sm:text-base text-white tracking-wide">
                  {language === 'EN' ? 'Cookie & Privacy Preferences' : language === 'MS' ? 'Privasi & Tetapan Cookie' : 'Privasi & Pengaturan Cookie'}
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss Cookie Banner"
              className="p-1.5 text-stone-400 hover:text-white bg-white/5 hover:bg-white/15 rounded-xl border border-white/10 transition-all flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description Body */}
          <p className="text-xs text-stone-300 leading-relaxed relative z-10">
            {language === 'EN' ? (
              <>
                We use cookies to personalize your shopping experience, secure your customer session, and optimize <strong className="text-[#F7E7CE]">FBS Bakery World</strong> catalog speed.
              </>
            ) : language === 'MS' ? (
              <>
                Kami menggunakan cookie untuk memudahi sesi beli-belah anda, keselamatan akaun, dan kelajuan katalog <strong className="text-[#F7E7CE]">FBS Bakery World</strong>.
              </>
            ) : (
              <>
                Kami menggunakan cookie untuk mempersonalisasi sesi belanja Anda, mengamankan akun pelanggan, dan mengoptimalkan kecepatan katalog <strong className="text-[#F7E7CE]">FBS Bakery World</strong>.
              </>
            )}
          </p>

          {/* Action Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2 border-t border-white/10 relative z-10">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="w-full sm:flex-1 py-3 px-5 bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37] hover:brightness-110 text-[#4A0010] font-black text-xs rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-98 cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#4A0010] stroke-[3]" />
              <span>{language === 'EN' ? 'Accept All Cookies' : language === 'MS' ? 'Terima Semua' : 'Terima Semua Cookie'}</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleRejectAll}
                className="flex-1 sm:flex-none py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold text-stone-200 transition-all text-center cursor-pointer"
              >
                {language === 'EN' ? 'Reject All' : language === 'MS' ? 'Tolak Semua' : 'Tolak Semua'}
              </button>

              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="py-2.5 px-3.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold text-stone-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Kelola Pengaturan Cookie"
              >
                <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="hidden sm:inline">{language === 'EN' ? 'Settings' : language === 'MS' ? 'Tetapan' : 'Atur'}</span>
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* Cookie Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-stone-900 border-2 border-[#D4AF37]/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative text-white">
            
            <div className="flex items-center justify-between border-b border-stone-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#800020] text-[#D4AF37] rounded-2xl border border-[#D4AF37]/40 shadow-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-[#F7E7CE]">
                    {language === 'EN' ? 'FBS Bakery Cookie Preferences' : 'Tetapan Privasi Cookie FBS Bakery'}
                  </h3>
                  <p className="text-xs text-stone-400">Pengaturan Privasi & Keamanan Sesi</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)} 
                className="p-2 text-stone-400 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Essential Cookies (Always Active) */}
              <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-[#F7E7CE] flex items-center gap-2">
                    <span>{language === 'EN' ? 'Essential Cookies' : 'Cookie Sesi Wajib'}</span>
                    <span className="text-[9px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold rounded-full">Always Active</span>
                  </h4>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    {language === 'EN' 
                      ? 'Necessary for session security, shopping cart persistence, and customer account login.'
                      : 'Diperlukan untuk keselamatan sesi login, keranjang belanjaan, dan akun pelanggan.'}
                  </p>
                </div>
                <input type="checkbox" checked disabled className="w-5 h-5 rounded text-[#800020] opacity-60 cursor-not-allowed mt-1" />
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-white">
                    {language === 'EN' ? 'Performance & Analytics Cookies' : 'Cookie Kecepatan & Analitik'}
                  </h4>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    {language === 'EN' 
                      ? 'Helps us measure site traffic and improve overall website speed and catalog navigation.'
                      : 'Membantu kami mengukur trafik situs dan meningkatkan kelajuan serta navigasi katalog.'}
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={analyticsEnabled} 
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)} 
                  className="w-5 h-5 rounded border-stone-600 bg-stone-800 text-[#800020] focus:ring-[#800020] cursor-pointer mt-1" 
                />
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 bg-stone-950/80 rounded-2xl border border-stone-800 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-white">
                    {language === 'EN' ? 'Marketing & Promotion Cookies' : 'Cookie Diskon & Promosi'}
                  </h4>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    {language === 'EN' 
                      ? 'Used to provide relevant promotional discounts and personalized baking product recommendations.'
                      : 'Digunakan untuk memberikan diskaun promosi yang relevan dan rekomendasi produk.'}
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={marketingEnabled} 
                  onChange={(e) => setMarketingEnabled(e.target.checked)} 
                  className="w-5 h-5 rounded border-stone-600 bg-stone-800 text-[#800020] focus:ring-[#800020] cursor-pointer mt-1" 
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-stone-800 pt-4">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs rounded-xl transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-[#800020] hover:bg-[#600018] text-[#D4AF37] border border-[#D4AF37]/40 font-bold text-xs rounded-xl shadow-lg uppercase tracking-wider transition-all"
              >
                Simpan Tetapan
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
