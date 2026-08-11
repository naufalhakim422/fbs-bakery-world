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
      {/* Floating Bottom Sticky Cookie Consent Banner */}
      <aside aria-label="Cookie Consent Notice" className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 animate-fade-in select-none">
        <div className="max-w-7xl mx-auto bg-gradient-to-r from-stone-950 via-[#40040F] to-[#70001B] border border-[#D4AF37]/40 shadow-2xl rounded-3xl p-4 sm:p-6 text-white backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 relative overflow-hidden">
          
          {/* Decorative Corner Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Left Text Info Section */}
          <div className="flex items-start gap-3.5 flex-1">
            <div className="p-2.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-2xl text-[#D4AF37] flex-shrink-0 mt-0.5 shadow">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-extrabold text-sm sm:text-base text-[#F7E7CE] flex items-center gap-2">
                <span>{language === 'EN' ? 'Cookie & Privacy Preferences' : language === 'MS' ? 'Privasi & Tetapan Cookie' : 'Privasi & Pengaturan Cookie'}</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#D4AF37] text-[#800020] font-black rounded-full uppercase tracking-wider">FBS Bakery</span>
              </h4>
              <p className="text-xs text-stone-300 leading-relaxed max-w-4xl">
                {language === 'EN' ? (
                  <>
                    By clicking <strong className="text-white">“Accept All Cookies”</strong>, you agree to the storing of cookies on your device to enhance <strong className="text-[#F7E7CE]">FBS Bakery World</strong> site navigation, analyze site usage, and assist in providing your best shopping experience.
                  </>
                ) : language === 'MS' ? (
                  <>
                    Dengan mengklik <strong className="text-white">“Terima Semua Cookie”</strong>, anda bersetuju dengan penyimpanan cookie pada peranti anda untuk meningkatkan navigasi laman web <strong className="text-[#F7E7CE]">FBS Bakery World</strong>, menganalisis penggunaan laman, serta menyokong pengalaman membeli-belah terbaik anda.
                  </>
                ) : (
                  <>
                    Dengan mengklik <strong className="text-white">“Terima Semua Cookie”</strong>, Anda menyetujui penyimpanan cookie di perangkat Anda untuk meningkatkan navigasi situs <strong className="text-[#F7E7CE]">FBS Bakery World</strong>, menganalisis penggunaan situs, serta mendukung pengalaman belanja terbaik Anda.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 w-full lg:w-auto flex-shrink-0">
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold text-stone-200 transition-all flex items-center gap-1.5"
            >
              <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{language === 'EN' ? 'Cookie Settings' : language === 'MS' ? 'Tetapan Cookie' : 'Pengaturan Cookie'}</span>
            </button>

            <button
              type="button"
              onClick={handleRejectAll}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-xs font-bold text-stone-200 transition-all"
            >
              {language === 'EN' ? 'Reject All' : language === 'MS' ? 'Tolak Semua' : 'Tolak Semua'}
            </button>

            <button
              type="button"
              onClick={handleAcceptAll}
              className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#F7E7CE] to-[#D4AF37] hover:brightness-110 text-[#4A0010] font-bold text-xs rounded-2xl shadow-xl transition-all flex items-center gap-1.5 uppercase tracking-wider"
            >
              <Check className="w-4 h-4 text-[#4A0010]" />
              <span>{language === 'EN' ? 'Accept All Cookies' : language === 'MS' ? 'Terima Semua Cookie' : 'Terima Semua Cookie'}</span>
            </button>
          </div>

        </div>
      </aside>

      {/* Cookie Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#D4AF37]/40 shadow-2xl space-y-6 relative text-stone-900">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#800020] text-[#D4AF37] rounded-2xl">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif font-extrabold text-lg text-stone-900">
                    {language === 'EN' ? 'FBS Bakery Cookie Preferences' : 'Tetapan Privasi Cookie FBS Bakery'}
                  </h3>
                  <p className="text-xs text-stone-500">fbsbaker.store Cookie Management</p>
                </div>
              </div>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 text-stone-400 hover:text-stone-700 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {/* Essential Cookies (Always Active) */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-stone-900 flex items-center gap-2">
                    <span>{language === 'EN' ? 'Essential Cookies' : 'Cookie Asas Wajib'}</span>
                    <span className="text-[9px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-full">Always Active</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    {language === 'EN' 
                      ? 'Necessary for session security, shopping cart persistence, and customer account login.'
                      : 'Diperlukan untuk keselamatan sesi, bakul belanjaan, dan log masuk akaun pelanggan.'}
                  </p>
                </div>
                <input type="checkbox" checked disabled className="w-5 h-5 rounded text-[#800020] opacity-60 cursor-not-allowed mt-1" />
              </div>

              {/* Analytics Cookies */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-stone-900">
                    {language === 'EN' ? 'Performance & Analytics Cookies' : 'Cookie Prestasi & Analitik'}
                  </h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    {language === 'EN' 
                      ? 'Helps us measure site traffic and improve overall website speed and catalog navigation.'
                      : 'Membantu kami mengukur trafik laman dan meningkatkan kelajuan serta navigasi katalog.'}
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={analyticsEnabled} 
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)} 
                  className="w-5 h-5 rounded border-stone-300 text-[#800020] focus:ring-[#800020] cursor-pointer mt-1" 
                />
              </div>

              {/* Marketing Cookies */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-stone-900">
                    {language === 'EN' ? 'Marketing & Promotion Cookies' : 'Cookie Pemasaran & Promosi'}
                  </h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    {language === 'EN' 
                      ? 'Used to provide relevant promotional discounts and personalized baking product recommendations.'
                      : 'Digunakan untuk memberikan diskaun promosi yang relevan dan cadangan produk bakeri.'}
                  </p>
                </div>
                <input 
                  type="checkbox" 
                  checked={marketingEnabled} 
                  onChange={(e) => setMarketingEnabled(e.target.checked)} 
                  className="w-5 h-5 rounded border-stone-300 text-[#800020] focus:ring-[#800020] cursor-pointer mt-1" 
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4">
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="px-6 py-2.5 bg-[#800020] hover:bg-[#600018] text-[#D4AF37] font-bold text-xs rounded-xl shadow-lg uppercase tracking-wider"
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
