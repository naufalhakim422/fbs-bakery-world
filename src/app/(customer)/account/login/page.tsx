'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { ShieldCheck, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import GoogleButton from '@/components/auth/google-button';
import { OtpModal } from '@/components/customer/otp-modal';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<any>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Ensure session is strictly cleared until OTP is verified
    localStorage.removeItem('fbs_customer_session');
    window.dispatchEvent(new Event('storage'));

    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail) {
      setError(language === 'EN' ? 'Please enter your email address.' : 'Sila masukkan alamat e-mel anda.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError(language === 'EN' ? 'Please enter a valid email address.' : 'Sila masukkan alamat e-mel yang sah.');
      return;
    }

    setLoading(true);

    // Look up customer record
    const customers = db.getCustomers();
    let customer = customers.find(c => c.email && c.email.toLowerCase() === cleanEmail);

    if (!customer) {
      setLoading(false);
      setError(language === 'EN' ? 'This email is not registered.' : 'Alamat e-mel ini tidak berdaftar. Sila daftar akaun baharu.');
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry

    customer = {
      ...customer,
      otpCode: otpCode,
      otpExpiresAt: otpExpiresAt,
    };

    db.saveCustomer(customer);
    setActiveCustomer(customer);

    // Send Resend OTP Email via /api/auth/send-otp
    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: otpCode,
          name: customer.name,
          type: 'EMAIL_VERIFICATION',
        }),
      });
    } catch (err) {
      console.error('Failed to send Resend OTP:', err);
    }

    setLoading(false);
    setShowOtpModal(true);
  };

  const handleOtpVerifySuccess = () => {
    if (!activeCustomer) return;

    const verifiedCustomer = {
      ...activeCustomer,
      isEmailVerified: true,
      isActive: true,
      otpCode: undefined,
      otpExpiresAt: undefined,
      loginAt: new Date().toISOString(),
    };

    db.saveCustomer(verifiedCustomer);
    localStorage.setItem('fbs_customer_session', JSON.stringify(verifiedCustomer));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('fbs_db_updated'));

    setShowOtpModal(false);
    router.push('/account');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full flex flex-col justify-center">
        
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-xl space-y-6 animate-fade-in">
          
          {/* Header Badge & Icon */}
          <div className="text-center space-y-2">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#800020] via-[#500014] to-[#3A0612] border-2 border-[#D4AF37] overflow-hidden flex items-center justify-center mx-auto shadow-lg p-1">
              <img src="/logo.jpg" alt="FBS Bakery World Logo" className="w-full h-full object-cover rounded-xl" />
            </div>
            
            <span className="text-[10px] font-black text-[#800020] uppercase tracking-widest bg-[#800020]/10 px-3 py-1 rounded-full inline-block">
              {language === 'EN' ? 'PORTAL PELANGGAN' : 'PORTAL PELANGGAN FBS BAKERY'}
            </span>

            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2B1B1B] tracking-tight pt-1">
              Log Masuk / Daftar
            </h1>
            
            <p className="text-stone-600 text-xs leading-relaxed max-w-xs mx-auto">
              Masukkan alamat email Anda untuk menerima **Kode OTP 6-Digit** via Resend.
            </p>
          </div>

          {/* 1-Click Google Sign-In */}
          <div className="space-y-2">
            <div className="w-full flex items-center gap-3">
              <div className="flex-1 h-[1px] bg-stone-200" />
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Atau Masuk Instan</span>
              <div className="flex-1 h-[1px] bg-stone-200" />
            </div>
            <GoogleButton />
          </div>

          <div className="w-full flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-stone-200" />
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Atau Masuk via Email OTP</span>
            <div className="flex-1 h-[1px] bg-stone-200" />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email OTP Input Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Alamat Email Pelanggan <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input 
                  type="email"
                  required
                  placeholder="e.g. naufal@example.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020] text-xs"
                />
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-4" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              {loading ? (
                <span>Mengirim Kode OTP...</span>
              ) : (
                <>
                  <span>MASUK / KIRIM KODE OTP</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </>
              )}
            </button>
          </form>

          {/* Guest Checkout Notice */}
          <div className="pt-2 text-center text-xs text-stone-600 border-t border-stone-100 space-y-2">
            <div className="p-3 bg-[#FFF8F0] rounded-xl border border-[#EADBC8] text-[11px] text-stone-600 flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Checkout tamu selalu didukung tanpa perlu mendaftar!</span>
            </div>
          </div>

        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />

      {/* Resend 6-Digit OTP Verification Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        targetDestination={emailInput}
        onVerifySuccess={handleOtpVerifySuccess}
        title="Verifikasi Kode OTP Resend"
        initialOtpCode={activeCustomer?.otpCode}
      />
    </div>
  );
}
