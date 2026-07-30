'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { BotChallenge } from '@/components/customer/bot-challenge';
import { hashPassword, checkRateLimit, recordFailedAttempt, resetFailedAttempts } from '@/lib/auth-security';
import { User, Lock, Phone, ArrowRight, ShieldCheck, AlertTriangle, ShieldAlert, Eye, EyeOff } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isBotVerified, setIsBotVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

    if ((status.shouldShowCaptcha || rateLimitState.shouldShowCaptcha) && !isBotVerified) {
      setError('Terdeteksi percobaan login berulang. Silakan centang dan selesaikan verifikasi "Saya Bukan Robot" di bawah.');
      return;
    }

    setLoading(true);

    const hashedPassword = await hashPassword(password);

    setTimeout(() => {
      if (!phoneOrEmail || !password) {
        const newStatus = recordFailedAttempt(identifier);
        setRateLimitState(newStatus);
        setError(`Email / WhatsApp atau Password salah. Sisa percobaan: ${newStatus.remainingAttempts}`);
        setLoading(false);
        return;
      }

      resetFailedAttempts(identifier);

      const inputClean = identifier;
      const isEmail = inputClean.includes('@');
      
      const customerSession = {
        id: `cust-${Date.now()}`,
        name: isEmail ? inputClean.split('@')[0] : `Customer (${inputClean})`,
        email: isEmail ? inputClean : `${inputClean.replace(/[^0-9]/g, '')}@fbsbakeryworld.com`,
        phone: isEmail ? '+60129876543' : inputClean,
        customerType: 'RETAIL',
        provider: isEmail ? 'EMAIL' : 'PHONE',
        hashedPassword: hashedPassword,
        loginAt: new Date().toISOString(),
      };

      localStorage.setItem('fbs_customer_session', JSON.stringify(customerSession));
      setLoading(false);
      router.push('/account');
    }, 600);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const googleUser = {
        id: `google-${Date.now()}`,
        name: 'Google User',
        email: 'user.google@gmail.com',
        phone: '+60129876543',
        customerType: 'VIP',
        provider: 'GOOGLE',
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem('fbs_customer_session', JSON.stringify(googleUser));
      alert('Successfully authenticated with Google Account!');
      router.push('/account');
    }, 800);
  };

  const handleFacebookLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const fbUser = {
        id: `fb-${Date.now()}`,
        name: 'Facebook User',
        email: 'user.fb@example.com',
        phone: '+60129876543',
        customerType: 'RETAIL',
        provider: 'FACEBOOK',
        loginAt: new Date().toISOString(),
      };
      localStorage.setItem('fbs_customer_session', JSON.stringify(fbUser));
      alert('Successfully authenticated with Facebook!');
      router.push('/account');
    }, 800);
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
              CUSTOMER ACCOUNT
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2B1B1B]">
              Sign In to Your Account
            </h1>
            <p className="text-stone-600 text-xs mt-1">
              Sign in dengan nomor WhatsApp / email & password Anda.
            </p>
          </div>

          {/* Social Auth Buttons (Google & Facebook) */}
          <div className="space-y-2.5">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full py-3 px-4 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              onClick={handleFacebookLogin}
              type="button"
              className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continue with Facebook</span>
            </button>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink mx-3 text-[11px] font-bold text-stone-400 uppercase">Or sign in with email/phone</span>
            <div className="flex-grow border-t border-stone-200"></div>
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
                
                {/* SHOW/HIDE PASSWORD TOGGLE BUTTON */}
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

            {/* ANTI-BOT SAYA BUKAN ROBOT CHALLENGE */}
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

          {/* Guest Checkout Notice & Register Button */}
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

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
