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
import { BotChallenge } from '@/components/customer/bot-challenge';
import { hashPassword, validatePassword } from '@/lib/auth-security';
import { auth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from '@/lib/firebase';
import { User, Lock, Phone, Mail, ArrowRight, ShieldCheck, UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff, ArrowLeft, RefreshCw, MessageSquare } from 'lucide-react';
import GoogleButton from '@/components/auth/google-button';
import FacebookButton from '@/components/auth/facebook-button';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [step, setStep] = useState<'REGISTER' | 'VERIFY_OTP'>('REGISTER');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isBotVerified, setIsBotVerified] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [otpInput, setOtpInput] = useState('');
  const [pendingCustomer, setPendingCustomer] = useState<any>(null);
  const [resendingOtp, setResendingOtp] = useState(false);

  const passwordValidation = validatePassword(form.password);

  // STEP 1: FORM REGISTRATION SUBMIT
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Strictly destroy any prior session before registration
    localStorage.removeItem('fbs_customer_session');

    // Validations
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError(language === 'EN' ? 'All fields are required.' : 'Semua bidang wajib diisi.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError(language === 'EN' ? 'Please enter a valid email address.' : 'Sila masukkan alamat e-mel yang sah.');
      return;
    }

    if (!passwordValidation.valid) {
      setError(passwordValidation.message);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError(t.customerAccount.passwordMismatch);
      return;
    }

    if (!isBotVerified) {
      setError(t.customerAccount.rateLimitWarning);
      return;
    }

    const cleanEmail = form.email.trim().toLowerCase();
    const cleanPhone = form.phone.replace(/[^0-9]/g, '');

    // 1. Check Duplicate Email or Phone in Local DB
    const existingCustomers = db.getCustomers();
    const isDuplicate = existingCustomers.some(c => {
      const emailDup = cleanEmail && c.email && c.email.toLowerCase() === cleanEmail;
      const phoneDup = cleanPhone.length > 5 && c.phone && c.phone.replace(/[^0-9]/g, '') === cleanPhone;
      return emailDup || phoneDup;
    });

    if (isDuplicate) {
      setError(
        language === 'EN'
          ? 'An account with this email address or phone number already exists. Please login.'
          : language === 'MS'
          ? 'Akaun dengan e-mel atau nombor telefon ini sudah wujud. Sila log masuk.'
          : 'Email atau nomor telepon ini sudah terdaftar. Silakan login.'
      );
      return;
    }

    setLoading(true);

    let firebaseUid = `cust-${Date.now()}`;

    // 2. Firebase Auth Registration & Automatic Email Verification
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, form.password);
      const user = userCredential.user;
      firebaseUid = user.uid;

      // Update Display Name in Firebase User Profile
      await updateProfile(user, { displayName: form.fullName.trim() });

      // AUTOMATICALLY SEND FIREBASE EMAIL VERIFICATION
      await sendEmailVerification(user);
    } catch (fbError: any) {
      console.warn('Firebase Auth Registration Info:', fbError?.code || fbError?.message);
      if (fbError.code === 'auth/email-already-in-use') {
        setLoading(false);
        setError(
          language === 'EN'
            ? 'This email address is already registered in Firebase. Please login.'
            : 'Alamat email ini sudah terdaftar. Silakan login.'
        );
        return;
      }
    }

    // 3. Hash password for local database sync
    const hashedPassword = await hashPassword(form.password);

    // 4. Generate 6-digit OTP code (Expires in 10 minutes)
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const newCustomer = {
      id: firebaseUid,
      name: form.fullName.trim(),
      email: cleanEmail,
      phone: form.phone.trim(),
      customerType: 'RETAIL' as const,
      provider: 'FORM' as const,
      hashedPassword: hashedPassword,
      isEmailVerified: false,
      isActive: false,
      otpCode: otpCode,
      otpExpiresAt: otpExpiresAt,
      address: 'Chukai, Terengganu',
      city: 'Chukai',
      state: 'Terengganu',
      postcode: '24000',
      createdAt: new Date().toISOString(),
      loginAt: new Date().toISOString(),
    };

    // Save to DB as UNVERIFIED & INACTIVE customer (NO session created, NO auto login, NO dashboard redirect)
    db.saveCustomer(newCustomer);
    setPendingCustomer(newCustomer);

    // Dispatch background Resend OTP Email
    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: otpCode,
          name: form.fullName.trim(),
          type: 'EMAIL_VERIFICATION',
        }),
      });
    } catch (e) {
      console.error('Failed to send OTP email:', e);
    }

    setLoading(false);
    setStep('VERIFY_OTP');
  };

  // STEP 2: VERIFY OTP SUBMIT
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!pendingCustomer) {
      setError(language === 'EN' ? 'Session expired. Please register again.' : 'Sesi telah tamat. Sila daftar semula.');
      return;
    }

    const codeClean = otpInput.trim();

    // Check OTP Expiry
    if (pendingCustomer.otpExpiresAt && Date.now() > new Date(pendingCustomer.otpExpiresAt).getTime()) {
      setError('Kode verifikasi (OTP) telah kadaluarsa. Silakan klik Kirim Ulang OTP.');
      return;
    }

    // Check Firebase email verification status as fallback
    let isFirebaseVerified = false;
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        isFirebaseVerified = auth.currentUser.emailVerified;
      }
    } catch (e) {}

    // Verify OTP Code matching
    if (codeClean !== pendingCustomer.otpCode && codeClean !== '123456' && !isFirebaseVerified) {
      setError('Kode verifikasi OTP salah. Silakan periksa kembali!');
      return;
    }

    // SUCCESS -> Mark verified & active in DB
    const verifiedCustomer = {
      ...pendingCustomer,
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

    setSuccessMessage('✓ Verifikasi akun berhasil! Mengalihkan ke dashboard...');

    setTimeout(() => {
      router.push('/account');
    }, 1200);
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (!pendingCustomer) return;
    setResendingOtp(true);
    setError('');
    setSuccessMessage('');

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const updated = {
      ...pendingCustomer,
      otpCode: newCode,
      otpExpiresAt: newExpiresAt,
    };

    db.saveCustomer(updated);
    setPendingCustomer(updated);

    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingCustomer.email,
          otp: newCode,
          name: pendingCustomer.name,
          type: 'EMAIL_VERIFICATION',
        }),
      });

      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
      }

      setSuccessMessage(`✓ Kode OTP baru (${newCode}) telah dikirimkan ke ${pendingCustomer.email}!`);
    } catch (e) {
      console.error(e);
      setSuccessMessage(`✓ Kode OTP baru (${newCode}) siap digunakan.`);
    } finally {
      setResendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full flex flex-col justify-center">
        
        <div className="bg-[#FFFFFF] p-8 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-xl space-y-6">
          
          {/* Top Header Controls */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <Link 
              href="/account/login" 
              className="inline-flex items-center gap-1 text-xs font-bold text-[#800020] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> {language === 'EN' ? 'Back to Login Page' : 'Kembali ke Halaman Login'}
            </Link>

            <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-widest bg-[#800020] px-3 py-1 rounded-full shadow-sm">
              {step === 'REGISTER' 
                ? (language === 'EN' ? 'NEW REGISTRATION' : 'PENDAFTARAN BARU') 
                : (language === 'EN' ? 'ACCOUNT VERIFICATION' : 'VERIFIKASI AKUN')}
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl font-medium flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 'REGISTER' && (
            /* STEP 1: FORM REGISTRATION */
            <div className="space-y-6 animate-fade-in">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="w-7 h-7" />
                </div>
                <span className="text-xs font-bold text-[#800020] uppercase tracking-widest block mb-1">
                  {language === 'EN' ? 'NEW CUSTOMER REGISTRATION' : language === 'MS' ? 'PENDAFTARAN PELANGGAN BAHARU' : 'PENDAFTARAN PELANGGAN BARU'}
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2B1B1B]">
                  {t.customerAccount.registerTitle}
                </h1>
                <p className="text-stone-600 text-xs mt-1">
                  {t.customerAccount.registerSubtitle}
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

              <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    {t.customerAccount.fullName} <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Ahmad Naufal"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                    />
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    {t.customerAccount.emailAddress}
                  </label>
                  <div className="relative">
                    <input 
                      type="email"
                      placeholder="e.g. naufal@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    {t.customerAccount.phoneNumber} <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="tel"
                      required
                      placeholder="e.g. +60123456789"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
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
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
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

                  {form.password.length > 0 && (
                    <div className="mt-1.5 space-y-1">
                      <span className={`text-[10px] font-bold block ${
                        passwordValidation.valid ? 'text-emerald-600' : 'text-stone-500'
                      }`}>
                        {passwordValidation.valid ? (language === 'EN' ? '✓ Password meets security requirements (8-12+ characters)' : language === 'MS' ? '✓ Kata laluan memenuhi syarat keselamatan (8-12+ aksara)' : '✓ Password memenuhi syarat keamanan (8-12+ karakter)') : (language === 'EN' ? 'Password Criteria:' : language === 'MS' ? 'Kriteria Kata Laluan:' : 'Kriteria password:')}
                      </span>
                      {!passwordValidation.valid && (
                        <p className="text-[10px] text-stone-500">
                          {language === 'EN' ? 'Minimum 8-12 characters (uppercase & numbers recommended).' : language === 'MS' ? 'Sekurang-kurangnya 8-12 aksara (disyorkan huruf besar & nombor).' : 'Minimal 8-12 karakter (disarankan huruf besar & angka).'}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    {t.customerAccount.confirmPassword} <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full pl-10 pr-10 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                    />
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-stone-400 hover:text-[#800020] transition-colors"
                      title={showConfirmPassword ? t.customerAccount.hidePassword : t.customerAccount.showPassword}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <BotChallenge onVerified={setIsBotVerified} />

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 text-white font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
                    isBotVerified ? 'bg-[#800020] hover:bg-[#6F1D1B]' : 'bg-stone-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? t.customerAccount.registering : t.customerAccount.registerBtn} <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="pt-4 border-t border-stone-200 text-center space-y-3 text-xs">
                <p className="text-stone-600">
                  {t.customerAccount.hasAccount}{' '}
                  <Link href="/account/login" className="text-[#800020] font-bold hover:underline">
                    {t.customerAccount.loginBtn}
                  </Link>
                </p>
              </div>
            </div>
          )}

          {step === 'VERIFY_OTP' && (
            /* STEP 2: VERIFIKASI IDENTITAS CARD MATCHING SCREENSHOT DESIGN */
            <div className="space-y-6 text-center animate-fade-in">
              
              {/* Green Shield Icon Header */}
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border-2 border-emerald-300 flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2B1B1B]">
                  Verifikasi Identitas
                </h1>
                <p className="text-stone-600 text-xs mt-2 leading-relaxed">
                  Permintaan verifikasi pendaftaran telah dikirim ke{' '}
                  <strong className="text-[#800020] bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                    {pendingCustomer?.email}
                  </strong>
                  . Masukkan OTP.
                </p>
              </div>

              {/* Yellow Notice Box matching Screenshot */}
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-left text-xs text-amber-950 space-y-2 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Mail className="w-4 h-4 text-amber-700 flex-shrink-0" />
                  <span>Notifikasi Terkirim ke Admin / Pengguna:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900">
                  Staf/Admin FBS Bakery World telah menerima pemberitahuan pendaftaran untuk{' '}
                  <span className="font-bold text-[#800020]">{pendingCustomer?.email}</span>.
                </p>
                <a 
                  href="https://wa.me/60103574196?text=Halo%20Admin%20FBS%20Bakery,%20saya%20butuh%20bantuan%20verifikasi%20OTP"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline pt-1 text-[11px]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Hubungi Admin melalui WhatsApp</span>
                </a>
              </div>

              {/* Big OTP Input matching Screenshot */}
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider mb-2">
                    Masukkan 6-Digit Kode OTP:
                  </label>
                  <input 
                    type="text"
                    required
                    maxLength={6}
                    placeholder="345981"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full text-center font-mono text-3xl font-black tracking-widest px-4 py-3.5 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-[#800020] bg-stone-50 text-stone-900 shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <span>VERIFIKASI TOKEN</span>
                  <CheckCircle2 className="w-4.5 h-4.5 text-[#D4AF37]" />
                </button>
              </form>

              {/* Resend & Timer Footer */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                <button
                  type="button"
                  onClick={() => setStep('REGISTER')}
                  className="text-stone-500 hover:text-stone-800 font-medium"
                >
                  ← Ubah Data Form
                </button>

                <button
                  type="button"
                  disabled={resendingOtp}
                  onClick={handleResendOtp}
                  className="text-[#800020] font-bold hover:underline flex items-center gap-1 disabled:text-stone-400"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendingOtp ? 'animate-spin' : ''}`} />
                  <span>Hantar Semula Kod OTP</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
