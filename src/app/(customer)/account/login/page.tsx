'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { BotChallenge } from '@/components/customer/bot-challenge';
import { hashPassword, checkRateLimit, recordFailedAttempt, resetFailedAttempts } from '@/lib/auth-security';
import { OtpModal } from '@/components/customer/otp-modal';
import { User, Lock, Phone, ArrowRight, ShieldCheck, AlertTriangle, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import GoogleButton from '@/components/auth/google-button';
import FacebookButton from '@/components/auth/facebook-button';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isBotVerified, setIsBotVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

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
      alert(`Selamat datang kembali, ${finalUser.name}! Login berhasil.`);
    } else {
      existing.unshift(finalUser);
      alert(`Akun baru berhasil didaftarkan & diverifikasi untuk ${finalUser.name}!`);
    }

    localStorage.setItem('fbs_customers', JSON.stringify(existing));
    localStorage.setItem('fbs_customer_session', JSON.stringify(finalUser));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const identifier = phoneOrEmail.trim();

    const status = checkRateLimit(identifier);
    if (status.isLocked) {
      setError(`Terlalu banyak percobaan login gagal! Akses dikunci sementara selama ${status.lockoutRemainingSeconds} detik untuk mencegah brute force.`);
      setRateLimitState(status);
      return;
    }

    if (!phoneOrEmail || !password) {
      const newStatus = recordFailedAttempt(identifier);
      setRateLimitState(newStatus);
      setError(`Silakan isi Email / WhatsApp dan Password.`);
      return;
    }

    if ((status.shouldShowCaptcha || rateLimitState.shouldShowCaptcha) && !isBotVerified) {
      setError('Terdeteksi percobaan login berulang. Silakan centang dan selesaikan verifikasi "Saya Bukan Robot" di bawah.');
      return;
    }

    // Trigger 2-Step OTP Verification
    setShowOtpModal(true);
  };

  const handleOtpVerifySuccess = async () => {
    setShowOtpModal(false);
    setLoading(true);

    const identifier = phoneOrEmail.trim();
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
      address: 'Shah Alam, Selangor',
      city: 'Shah Alam',
      state: 'Selangor',
      postcode: '40000',
      createdAt: new Date().toISOString(),
      loginAt: new Date().toISOString(),
    };

    setTimeout(() => {
      saveCustomerToDB(customerSession);
      setLoading(false);
      router.push('/account');
    }, 400);
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
              Masuk Pelanggan
            </h1>
            <p className="text-stone-600 text-xs mt-1">
              Sign in dengan nomor WhatsApp / email & password Anda.
            </p>
          </div>
          {/* Social Login Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1, height: '1px', background: '#E5E0D8' }} />
              <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500, whiteSpace: 'nowrap', letterSpacing: '0.05em' }}>atau masuk dengan</span>
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
                <span>BRUTE-FORCE LOCKOUT AKTIF</span>
              </div>
              <p>
                Akun ini dikunci sementara karena 5x percobaan login gagal. Silakan tunggu <strong>{rateLimitState.lockoutRemainingSeconds} detik</strong> sebelum mencoba kembali.
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
                WhatsApp Phone or Email <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input 
                  type="text"
                  required
                  placeholder="e.g. +60123456789 or name@example.com"
                  value={phoneOrEmail}
                  onChange={(e) => setPhoneOrEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
                <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Password <span className="text-red-600">*</span>
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
                  title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <BotChallenge onVerified={setIsBotVerified} />

            <div className="flex items-center justify-between text-xs text-stone-600">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded text-[#800020]" />
                <span>Remember me</span>
              </label>
              
              <Link 
                href="/account/forgot-password" 
                className="text-[#800020] font-bold hover:underline"
              >
                Lupa Password?
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
              {loading ? 'Signing In...' : 'Sign In To Account'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-stone-200 text-center space-y-3 text-xs">
            <p className="text-stone-600">
              Don't have an account yet?{' '}
              <Link href="/account/register" className="text-[#800020] font-bold hover:underline">
                Register New Account
              </Link>
            </p>

            <div className="p-3 bg-[#FFF8F0] rounded-xl border border-[#EADBC8] text-[11px] text-stone-600 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#800020] flex-shrink-0" />
              <span>Guest checkout is always supported without requiring registration!</span>
            </div>
          </div>
        </div>
      </main>

      {/* 2-STEP OTP VERIFICATION MODAL */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        targetDestination={phoneOrEmail}
        onVerifySuccess={handleOtpVerifySuccess}
        title="Verifikasi Keamanan 2 Langkah (OTP)"
      />

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
