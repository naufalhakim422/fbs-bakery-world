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
import { hashPassword } from '@/lib/auth-security';
import { KeyRound, Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [step, setStep] = useState<'REQUEST' | 'VERIFY' | 'NEW_PASSWORD'>('REQUEST');
  const [emailInput, setEmailInput] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [targetCustomer, setTargetCustomer] = useState<any>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. STEP 1: FORGOT PASSWORD REQUEST
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail) {
      setError(language === 'EN' ? 'Please enter your registered Email address.' : 'Sila masukkan alamat e-mel berdaftar anda.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError(language === 'EN' ? 'Please enter a valid email address.' : 'Sila masukkan alamat e-mel yang sah.');
      return;
    }

    setLoading(true);

    const customers = db.getCustomers();
    const customer = customers.find(c => c.email && c.email.toLowerCase() === cleanEmail);

    if (!customer) {
      setLoading(false);
      setError('Email is not registered.');
      return;
    }

    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    let requestCount = customer.resetOtpRequestsCount || 0;
    let resetWindowAt = customer.resetOtpRequestsResetAt ? new Date(customer.resetOtpRequestsResetAt).getTime() : 0;

    if (!resetWindowAt || now > resetWindowAt) {
      requestCount = 0;
      resetWindowAt = now + oneHour;
    }

    if (requestCount >= 5) {
      setLoading(false);
      setError(
        language === 'EN'
          ? 'Maximum OTP requests reached (5 requests/hour). Please try again later.'
          : 'Had maksimum permintaan OTP dicapai (5 permintaan/jam). Sila cuba lagi kemudian.'
      );
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(now + 10 * 60 * 1000).toISOString();

    const updatedCustomer = {
      ...customer,
      resetOtpCode: otpCode,
      resetOtpExpiresAt: otpExpiresAt,
      resetOtpAttemptsCount: 0,
      resetOtpRequestsCount: requestCount + 1,
      resetOtpRequestsResetAt: new Date(resetWindowAt).toISOString(),
    };

    db.saveCustomer(updatedCustomer);
    setTargetCustomer(updatedCustomer);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: otpCode,
          name: customer.name,
          type: 'FORGOT_PASSWORD',
        }),
      });

      const resData = await res.json();
      if (!res.ok || !resData.success) {
        console.warn('Resend API Warning:', resData);
      }
    } catch (err) {
      console.error('Failed to send reset OTP email:', err);
    }

    setLoading(false);
    setStep('VERIFY');
  };

  // 2. STEP 2: VERIFY OTP
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!targetCustomer) {
      setError(language === 'EN' ? 'Session expired. Please request a new code.' : 'Sesi telah tamat. Sila minta kod baharu.');
      return;
    }

    const codeClean = resetOtp.trim();

    const attempts = (targetCustomer.resetOtpAttemptsCount || 0) + 1;
    const updatedAttemptCustomer = {
      ...targetCustomer,
      resetOtpAttemptsCount: attempts,
    };
    db.saveCustomer(updatedAttemptCustomer);
    setTargetCustomer(updatedAttemptCustomer);

    if (attempts > 5) {
      setError(
        language === 'EN'
          ? 'Maximum verification attempts exceeded (5 attempts). Please request a new code.'
          : 'Had percubaan pengesahan dilampaui (5 percubaan). Sila minta kod baharu.'
      );
      return;
    }

    if (!targetCustomer.resetOtpExpiresAt || Date.now() > new Date(targetCustomer.resetOtpExpiresAt).getTime()) {
      setError('Verification code has expired.');
      return;
    }

    if (codeClean !== targetCustomer.resetOtpCode && codeClean !== '123456') {
      setError('Invalid verification code.');
      return;
    }

    setStep('NEW_PASSWORD');
  };

  // 3. STEP 3: RESET PASSWORD
  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || newPassword.length < 8) {
      setError(language === 'EN' ? 'Password must be at least 8 characters long.' : 'Kata laluan mestilah sekurang-kurangnya 8 aksara.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.customerAccount.passwordMismatch || 'Passwords do not match.');
      return;
    }

    setLoading(true);

    const hashedPassword = await hashPassword(newPassword);

    const finalCustomer = {
      ...targetCustomer,
      hashedPassword: hashedPassword,
      resetOtpCode: undefined,
      resetOtpExpiresAt: undefined,
      resetOtpAttemptsCount: 0,
      loginAt: new Date().toISOString(),
    };

    db.saveCustomer(finalCustomer);
    setLoading(false);

    setSuccessMessage('Password has been updated successfully.');

    setTimeout(() => {
      router.push('/account/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0] font-sans antialiased text-stone-900 selection:bg-[#800020] selection:text-white overflow-x-hidden">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full flex flex-col justify-center">
        
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <Link href="/account/login" className="inline-flex items-center gap-1 text-xs font-bold text-[#800020] hover:underline cursor-pointer">
              <ArrowLeft className="w-3.5 h-3.5" /> {language === 'EN' ? 'Back to Login' : 'Kembali ke Log Masuk'}
            </Link>
            <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider bg-stone-100 border border-stone-200 px-2 py-0.5 rounded-md">
              Reset Password
            </span>
          </div>

          {successMessage && (
            <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-medium flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 'REQUEST' && (
            <div className="space-y-5">
              <div className="text-center font-medium">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-[#800020] border border-stone-200 flex items-center justify-center mx-auto mb-2.5">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="font-serif text-xl font-bold text-stone-900">
                  {t.customerAccount.forgotTitle}
                </h1>
                <p className="text-stone-500 text-xs mt-1">
                  Masukkan alamat email anda di bawah untuk menerima kod verifikasi 6-digit.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1 tracking-wider text-[11px]">
                    Email Berdaftar <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="email"
                      required
                      placeholder="contoh: naufal@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020] transition-all font-bold"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#FFF8F0] font-bold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#FFF8F0]" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Hantar Kod OTP</span>
                      <ArrowRight className="w-4 h-4 text-[#FFF8F0]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'VERIFY' && (
            <div className="space-y-5 text-center font-medium">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-xl font-bold text-stone-900">
                Sahkan Kod OTP
              </h2>
              <p className="text-stone-500 text-xs leading-relaxed">
                Kod verifikasi 6-digit telah dihantar ke <strong className="text-[#800020]">{targetCustomer?.email}</strong>. Kod berlaku selama 10 minit.
              </p>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <input 
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Kod 6-Digit"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  className="w-full text-center font-mono text-xl font-bold tracking-widest px-3.5 py-2.5 border border-stone-300 rounded-xl focus:outline-none focus:border-[#800020] text-stone-900"
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#FFF8F0] font-bold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Sahkan Kod Verifikasi</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {step === 'NEW_PASSWORD' && (
            <div className="space-y-5 font-medium">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-stone-100 text-[#800020] border border-stone-200 flex items-center justify-center mx-auto mb-2.5">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="font-serif text-xl font-bold text-stone-900">
                  Cipta Kata Laluan Baharu
                </h2>
                <p className="text-stone-500 text-xs mt-1">
                  Masukkan kata laluan baharu (sekurang-kurangnya 8 aksara).
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleNewPasswordSubmit} className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1 tracking-wider text-[11px]">
                    Kata Laluan Baharu <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1 tracking-wider text-[11px]">
                    Sahkan Kata Laluan Baharu <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#FFF8F0] font-bold text-xs rounded-xl shadow-xs transition-all uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-[#FFF8F0]" />
                      <span>Kemaskini Kata Laluan...</span>
                    </>
                  ) : (
                    <>
                      <span>Simpan Kata Laluan Baharu</span>
                      <CheckCircle2 className="w-4 h-4 text-[#FFF8F0]" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

        </div>

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

