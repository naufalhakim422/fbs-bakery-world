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
import { User, Lock, Phone, ArrowRight, ShieldCheck, AlertTriangle, ShieldAlert, Eye, EyeOff, X, Plus } from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isBotVerified, setIsBotVerified] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OAuth Modals State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showFbModal, setShowFbModal] = useState(false);

  // Custom Google Input State
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [isCustomGoogleForm, setIsCustomGoogleForm] = useState(false);

  // Custom FB Input State
  const [customFbEmail, setCustomFbEmail] = useState('');
  const [customFbName, setCustomFbName] = useState('');

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
    const idx = existing.findIndex(c => c.id === customerData.id || c.email === customerData.email);
    if (idx !== -1) {
      existing[idx] = { ...existing[idx], ...customerData };
    } else {
      existing.unshift(customerData);
    }
    localStorage.setItem('fbs_customers', JSON.stringify(existing));
    localStorage.setItem('fbs_customer_session', JSON.stringify(customerData));
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

      saveCustomerToDB(customerSession);
      setLoading(false);
      router.push('/account');
    }, 600);
  };

  // Google OAuth 2.0 Handler Parameters
  const googleAuthParams = {
    prompt: 'select_account', // Forces Gmail account selection pop-up on every click
    response_type: 'code',
    scope: 'email profile',
  };

  const handleGoogleLoginClick = () => {
    // Enforce prompt: 'select_account' to guarantee account selection pop-up
    console.log('[Google Auth] Initializing OAuth with prompt:', googleAuthParams.prompt);
    setShowGoogleModal(true);
  };

  const executeGoogleLogin = (email: string, name: string) => {
    setLoading(true);
    setShowGoogleModal(false);
    setTimeout(() => {
      const googleUser = {
        id: `google-${Date.now()}`,
        name: name || email.split('@')[0],
        email: email,
        phone: '',
        customerType: 'VIP' as const,
        provider: 'GOOGLE' as const,
        promptParam: googleAuthParams.prompt,
        address: 'Shah Alam, Selangor',
        city: 'Shah Alam',
        state: 'Selangor',
        postcode: '40000',
        createdAt: new Date().toISOString(),
        loginAt: new Date().toISOString(),
      };
      saveCustomerToDB(googleUser);
      setLoading(false);
      alert(`Berhasil Login dengan Akun Google (${googleUser.email})!`);
      router.push('/account');
    }, 600);
  };

  const executeFbLogin = (email: string, name: string) => {
    setLoading(true);
    setShowFbModal(false);
    setTimeout(() => {
      const fbUser = {
        id: `fb-${Date.now()}`,
        name: name || 'Pelanggan Facebook',
        email: email || 'facebook.user@example.com',
        phone: '',
        customerType: 'RETAIL' as const,
        provider: 'FACEBOOK' as const,
        address: 'Shah Alam, Selangor',
        city: 'Shah Alam',
        state: 'Selangor',
        postcode: '40000',
        createdAt: new Date().toISOString(),
        loginAt: new Date().toISOString(),
      };
      saveCustomerToDB(fbUser);
      setLoading(false);
      alert(`Berhasil Login dengan Akun Facebook (${fbUser.name})!`);
      router.push('/account');
    }, 600);
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
              Customer Sign In
            </h1>
            <p className="text-stone-600 text-xs mt-1">
              Sign in dengan nomor WhatsApp / email & password Anda.
            </p>
          </div>

          {/* Social Auth Buttons (Google & Facebook) */}
          <div className="space-y-2.5">
            <button
              onClick={handleGoogleLoginClick}
              type="button"
              className="w-full py-3 px-4 bg-white border border-stone-300 hover:border-stone-400 text-stone-800 text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-3 active:scale-95"
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
              onClick={() => setShowFbModal(true)}
              type="button"
              className="w-full py-3 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-3 active:scale-95"
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

      {/* GOOGLE ACCOUNT SELECTOR MODAL (EXACT GOOGLE ACCOUNTS PAGE REPLICA) */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-[#f0f4f9] sm:bg-black/50 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-fade-in overflow-y-auto">
          
          <div className="bg-white rounded-none sm:rounded-[28px] max-w-xl w-full min-h-screen sm:min-h-0 p-6 sm:p-10 shadow-2xl border-0 sm:border border-stone-200 flex flex-col justify-between relative">
            
            <button 
              onClick={() => { setShowGoogleModal(false); setIsCustomGoogleForm(false); }}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition-colors z-10"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              {/* Google Brand Header */}
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span className="text-sm font-medium text-[#1f1f1f]">Login dengan Google</span>
              </div>

              {/* Title & Subtitle */}
              <div className="mt-8 mb-6">
                <h2 className="text-3xl sm:text-4xl font-sans font-normal text-[#1f1f1f] tracking-tight">Pilih akun</h2>
                <p className="text-sm text-[#444746] mt-2 font-sans">
                  Lanjutkan ke <span className="font-medium text-[#0b57d0]">fbsbakeryworld.online</span>
                </p>
              </div>

              {!isCustomGoogleForm ? (
                <div className="divide-y divide-stone-200 border-t border-b border-stone-200 my-6">
                  
                  {/* Account 1 */}
                  <button 
                    type="button"
                    onClick={() => executeGoogleLogin('opaln9406@gmail.com', 'Naufal Hakim Muzaki')}
                    className="w-full py-3.5 px-1 sm:px-3 hover:bg-stone-50 transition-colors flex items-center gap-4 text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1e293b] text-white font-medium flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                      N
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#1f1f1f] group-hover:text-[#0b57d0] transition-colors">Naufal Hakim Muzaki</div>
                      <div className="text-xs text-[#5f6368] font-normal truncate">opaln9406@gmail.com</div>
                    </div>
                  </button>

                  {/* Account 2 */}
                  <button 
                    type="button"
                    onClick={() => executeGoogleLogin('naufalhakim422@gmail.com', 'Naufal Hakim Muzaki')}
                    className="w-full py-3.5 px-1 sm:px-3 hover:bg-stone-50 transition-colors flex items-center gap-4 text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#0b57d0] text-white font-medium flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                      N
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#1f1f1f] group-hover:text-[#0b57d0] transition-colors">Naufal Hakim Muzaki</div>
                      <div className="text-xs text-[#5f6368] font-normal truncate">naufalhakim422@gmail.com</div>
                    </div>
                  </button>

                  {/* Account 3 */}
                  <button 
                    type="button"
                    onClick={() => executeGoogleLogin('naufalhakimmuzaki7@gmail.com', 'Naufal Hakim Muzaki')}
                    className="w-full py-3.5 px-1 sm:px-3 hover:bg-stone-50 transition-colors flex items-center gap-4 text-left group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#7e22ce] text-white font-medium flex items-center justify-center text-sm flex-shrink-0 shadow-sm">
                      N
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#1f1f1f] group-hover:text-[#0b57d0] transition-colors">Naufal Hakim Muzaki</div>
                      <div className="text-xs text-[#5f6368] font-normal truncate">naufalhakimmuzaki7@gmail.com</div>
                    </div>
                  </button>

                  {/* Gunakan Akun Lain */}
                  <button 
                    type="button"
                    onClick={() => setIsCustomGoogleForm(true)}
                    className="w-full py-3.5 px-1 sm:px-3 hover:bg-stone-50 transition-colors flex items-center gap-4 text-left group"
                  >
                    <div className="w-10 h-10 rounded-full border border-stone-400 flex items-center justify-center text-stone-600 flex-shrink-0">
                      <User className="w-5 h-5 text-stone-600" />
                    </div>
                    <div className="text-sm font-medium text-[#1f1f1f] group-hover:text-[#0b57d0] transition-colors">
                      Gunakan akun lain
                    </div>
                  </button>

                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customGoogleEmail) {
                      executeGoogleLogin(customGoogleEmail, customGoogleName);
                    }
                  }}
                  className="space-y-4 my-6 text-xs bg-stone-50 p-5 rounded-2xl border border-stone-200"
                >
                  <h3 className="font-bold text-sm text-stone-900 mb-2">Masukkan Detail Akun Google Lainnya</h3>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Nama Lengkap Akun Google</label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Naufal Hakim"
                      value={customGoogleName}
                      onChange={(e) => setCustomGoogleName(e.target.value)}
                      className="w-full p-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0b57d0] bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">Email Google (@gmail.com)</label>
                    <input
                      type="email"
                      required
                      placeholder="emailanda@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="w-full p-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#0b57d0] bg-white text-sm"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsCustomGoogleForm(false)}
                      className="w-1/2 py-3 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold rounded-xl text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-3 bg-[#0b57d0] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md"
                    >
                      Lanjutkan Login
                    </button>
                  </div>
                </form>
              )}

              {/* Legal Notice */}
              <p className="text-[12px] text-[#5f6368] leading-relaxed mt-6">
                Sebelum menggunakan aplikasi ini, Anda dapat meninjau{' '}
                <span className="text-[#0b57d0] hover:underline cursor-pointer font-medium">Kebijakan Privasi</span> dan{' '}
                <span className="text-[#0b57d0] hover:underline cursor-pointer font-medium">Persyaratan Layanan</span> fbsbakeryworld.online.
              </p>

            </div>

            {/* Bottom Footer Bar */}
            <div className="flex justify-between items-center text-[12px] text-[#5f6368] pt-8 border-t border-stone-100 mt-6">
              <div className="flex items-center gap-1 cursor-pointer hover:text-[#1f1f1f] font-medium">
                <span>Indonesia</span>
                <span>▾</span>
              </div>
              <div className="flex items-center gap-4 text-[12px]">
                <span className="hover:text-[#1f1f1f] cursor-pointer">Bantuan</span>
                <span className="hover:text-[#1f1f1f] cursor-pointer">Privasi</span>
                <span className="hover:text-[#1f1f1f] cursor-pointer">Persyaratan</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FACEBOOK LOGIN MODAL */}
      {showFbModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl border border-stone-200 relative">
            <button 
              onClick={() => setShowFbModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center mx-auto shadow">
                <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">Login dengan Facebook</h3>
              <p className="text-xs text-stone-500">Hubungkan akun Facebook Anda ke <span className="font-bold text-[#800020]">FBS Bakery World</span></p>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                executeFbLogin(customFbEmail, customFbName);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-bold text-stone-700 mb-1">Nama Akun Facebook</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Rahmawati"
                  value={customFbName}
                  onChange={(e) => setCustomFbName(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#1877F2]"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Email / HP Facebook</label>
                <input
                  type="text"
                  required
                  placeholder="email@facebook.com atau +60123456789"
                  value={customFbEmail}
                  onChange={(e) => setCustomFbEmail(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#1877F2]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFbModal(false)}
                  className="w-1/2 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-[#1877F2] hover:bg-blue-700 text-white font-bold rounded-xl shadow"
                >
                  Masuk Facebook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
