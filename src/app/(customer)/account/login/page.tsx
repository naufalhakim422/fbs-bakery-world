'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { BotChallenge } from '@/components/customer/bot-challenge';
import { hashPassword, checkRateLimit, recordFailedAttempt, resetFailedAttempts } from '@/lib/auth-security';
import { OtpModal } from '@/components/customer/otp-modal';
import { PhoneOtpModal } from '@/components/auth/phone-otp-modal';
import { User, Lock, Phone, ArrowRight, ShieldCheck, AlertTriangle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import GoogleButton from '@/components/auth/google-button';
import FacebookButton from '@/components/auth/facebook-button';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isBotVerified, setIsBotVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showPhoneOtpModal, setShowPhoneOtpModal] = useState(false);

  // Rate Limiting & Security State
  const [rateLimitState, setRateLimitState] = useState({
    isLocked: false,
    remainingAttempts: 5,
    lockoutRemainingSeconds: 0,
    shouldShowCaptcha: false,
  });

  useEffect(() => {
    if (phoneOrEmail.trim()) {
      const status = checkRateLimit(phoneOrEmail.trim());
      setRateLimitState(status);
    }
  }, [phoneOrEmail]);

  const saveCustomerToDB = (customerData: any) => {
    const existing = db.getCustomers();
    const idx = existing.findIndex(c => 
      c.id === customerData.id || 
      (customerData.email && c.email?.toLowerCase() === customerData.email?.toLowerCase())
    );
    
    let finalUser = customerData;
    if (idx !== -1) {
      finalUser = { 
        ...existing[idx], 
        loginAt: new Date().toISOString() 
      };
      existing[idx] = finalUser;
    } else {
      existing.unshift(finalUser);
    }

    localStorage.setItem('fbs_customers', JSON.stringify(existing));
    localStorage.setItem('fbs_customer_session', JSON.stringify(finalUser));
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    const identifier = phoneOrEmail.trim();

    const status = checkRateLimit(identifier);
    if (status.isLocked) {
      setError(`${t.customerAccount.accountLocked} ${status.lockoutRemainingSeconds}s.`);
      setRateLimitState(status);
      return;
    }

    if (!phoneOrEmail || !password) {
      const newStatus = recordFailedAttempt(identifier);
      setRateLimitState(newStatus);
      setError(t.customerAccount.wrongCredentials);
      return;
    }

    if ((status.shouldShowCaptcha || rateLimitState.shouldShowCaptcha) && !isBotVerified) {
      setError(t.customerAccount.rateLimitWarning);
      return;
    }

    setLoading(true);
    resetFailedAttempts(identifier);

    const inputClean = identifier;
    const isEmail = inputClean.includes('@');
    
    const customerSession = {
      id: `cust-${Date.now()}`,
      name: isEmail ? inputClean.split('@')[0] : `Customer (${inputClean})`,
      email: isEmail ? inputClean : `${inputClean.replace(/[^0-9]/g, '')}@fbsbakeryworld.com`,
      phone: isEmail ? '' : inputClean,
      customerType: 'RETAIL' as const,
      provider: isEmail ? ('EMAIL' as const) : ('PHONE' as const),
      address: 'Chukai, Terengganu',
      city: 'Chukai',
      state: 'Terengganu',
      postcode: '24000',
      createdAt: new Date().toISOString(),
      loginAt: new Date().toISOString(),
    };

    setTimeout(() => {
      saveCustomerToDB(customerSession);
      setLoading(false);
      router.push('/account');
    }, 400);
  };

  const handlePhoneAuthSuccess = (firebaseUser: any) => {
    setShowPhoneOtpModal(false);
    setLoading(true);

    const userPhone = firebaseUser.phoneNumber || phoneOrEmail || '+628123456789';
    const customerSession = {
      id: firebaseUser.uid || `cust-${Date.now()}`,
      name: `User ${userPhone.slice(-4)}`,
      email: `${userPhone.replace(/[^0-9]/g, '')}@fbsbakeryworld.com`,
      phone: userPhone,
      customerType: 'RETAIL' as const,
      provider: 'PHONE' as const,
      address: 'Chukai, Terengganu',
      city: 'Chukai',
      state: 'Terengganu',
      postcode: '24000',
      createdAt: new Date().toISOString(),
      loginAt: new Date().toISOString(),
    };

    saveCustomerToDB(customerSession);
    setLoading(false);
    router.push('/account');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full flex flex-col justify-center">
        
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-xl space-y-6">
          
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mx-auto mb-3">
              <User className="w-7 h-7" />
            </div>
            <span className="text-xs font-bold text-[#800020] uppercase tracking-widest block mb-1">
              Member Portal
            </span>
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              {t.customerAccount.loginTitle}
            </h1>
            <p className="text-stone-600 text-xs mt-1">
              {t.customerAccount.loginSubtitle}
            </p>
          </div>

          {/* Social Login Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E0D8' }} />
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>{t.customerAccount.orContinueWith}</span>
              <div style={{ flex: 1, height: '1px', background: '#E5E0D8' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <GoogleButton />
              <FacebookButton />
            </div>
          </div>

          {rateLimitState.isLocked && (
            <div className="p-4 bg-red-100 border-2 border-red-500 text-red-900 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <span>{t.customerAccount.securityCheck}</span>
              </div>
              <p>
                {t.customerAccount.accountLocked} <strong>{rateLimitState.lockoutRemainingSeconds}s</strong>.
              </p>
            </div>
          )}

          {error && !rateLimitState.isLocked && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                {t.customerAccount.phoneOrEmail} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  placeholder="e.g. +60123456789 / name@example.com"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                {t.customerAccount.password} <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-stone-400 hover:text-[#800020] transition-colors"
                  title={showPassword ? t.customerAccount.hidePassword : t.customerAccount.showPassword}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <BotChallenge onVerified={setIsBotVerified} />

            <div className="flex items-center justify-between text-xs text-stone-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#800020]" />
                <span>{t.customerAccount.rememberMe}</span>
              </label>
              
              <Link 
                href="/account/forgot-password" 
                className="text-[#800020] font-bold hover:underline"
              >
                {t.customerAccount.forgotPassword}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading || rateLimitState.isLocked}
              className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                rateLimitState.isLocked 
                  ? 'bg-red-300 cursor-not-allowed'
                  : isBotVerified || !rateLimitState.shouldShowCaptcha 
                  ? 'bg-[#800020] hover:bg-[#6F1D1B]' 
                  : 'bg-stone-400 cursor-not-allowed'
              }`}
            >
              {loading ? t.customerAccount.loggingIn : t.customerAccount.loginBtn} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-stone-200 text-center space-y-3 text-xs">
            <p className="text-stone-600">
              {t.customerAccount.noAccount}{' '}
              <Link href="/account/register" className="text-[#800020] font-bold hover:underline">
                {t.customerAccount.registerTitle}
              </Link>
            </p>

            <div className="p-3 bg-[#FFF8F0] rounded-xl border border-[#EADBC8] text-[11px] text-stone-600 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#800020] flex-shrink-0" />
              <span>Guest checkout is always supported without requiring registration!</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
