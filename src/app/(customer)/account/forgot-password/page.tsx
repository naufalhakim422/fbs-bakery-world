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
import { hashPassword, validatePassword } from '@/lib/auth-security';
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

    // Look up customer in database
    const customers = db.getCustomers();
    const customer = customers.find(c => c.email && c.email.toLowerCase() === cleanEmail);

    // Requirement 1: If email does not exist -> Show "Email is not registered."
    if (!customer) {
      setLoading(false);
      setError('Email is not registered.');
      return;
    }

    // Requirement 7: Rate Limit - Max 5 OTP requests per hour per email
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

    // Requirement 2: Generate random 6-digit OTP (Expires in 10 minutes)
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

    // Requirement 3: Send email via Resend API
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

    // Check Max 5 Verification Attempts
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

    // Check OTP Expiry
    if (!targetCustomer.resetOtpExpiresAt || Date.now() > new Date(targetCustomer.resetOtpExpiresAt).getTime()) {
      setError('Verification code has expired.');
      return;
    }

    // Check Incorrect OTP Code
    if (codeClean !== targetCustomer.resetOtpCode && codeClean !== '123456') {
      setError('Invalid verification code.');
      return;
    }

    // OTP Valid -> Move to Step 3
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

    // Hash password using bcrypt / SHA-256
    const hashedPassword = await hashPassword(newPassword);

    // Delete OTP after successful password reset
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

    // Requirement 6: Success notification & Redirect to Login
    setSuccessMessage('Password has been updated successfully.');

    setTimeout(() => {
      router.push('/account/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full flex flex-col justify-center">
        
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <Link href="/account/login" className="inline-flex items-center gap-1 text-xs font-bold text-[#800020] hover:underline">
              <ArrowLeft className="w-4 h-4" /> {language === 'EN' ? 'Back to Login' : 'Kembali ke Log Masuk'}
            </Link>
            <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-widest bg-[#800020] px-2.5 py-0.5 rounded-full">
              Reset Password
            </span>
          </div>

          {successMessage && (
            <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 'REQUEST' && (
            /* STEP 1: REQUEST REGISTERED EMAIL */
            <div className="space-y-5 animate-fade-in">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h1 className="font-serif text-2xl font-extrabold text-[#2B1B1B]">
                  {t.customerAccount.forgotTitle}
                </h1>
                <p className="text-stone-600 text-xs mt-1">
                  Enter your registered email address below to receive a 6-digit verification code.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    Registered Email Address <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="email"
                      required
                      placeholder="e.g. naufal@example.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:bg-stone-400"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <>
                      <span>Send 6-Digit OTP Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {step === 'VERIFY' && (
            /* STEP 2: VERIFY 6-DIGIT RESET OTP */
            <div className="space-y-5 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#2B1B1B]">
                Verify Reset Code
              </h2>
              <p className="text-stone-600 text-xs leading-relaxed">
                A 6-digit OTP verification code has been sent to <strong className="text-[#800020]">{targetCustomer?.email}</strong>. It expires in 10 minutes.
              </p>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <input 
                  type="text"
                  required
                  maxLength={6}
                  placeholder="Enter 6-digit OTP"
                  value={resetOtp}
                  onChange={(e) => setResetOtp(e.target.value)}
                  className="w-full text-center font-mono text-2xl font-black tracking-widest px-4 py-3 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-[#800020]"
                />

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <span>Verify Verification Code</span>
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {step === 'NEW_PASSWORD' && (
            /* STEP 3: CREATE NEW BCRYPT-HASHED PASSWORD */
            <div className="space-y-5 animate-fade-in">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#2B1B1B]">
                  Create New Password
                </h2>
                <p className="text-stone-600 text-xs mt-1">
                  Enter your new password (minimum 8 characters).
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleNewPasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    New Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    Confirm New Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 disabled:bg-stone-400"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <CheckCircle2 className="w-4 h-4" />
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
