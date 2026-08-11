'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { 
  UserPlus, 
  Mail, 
  User, 
  Phone, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  RefreshCw, 
  Clock, 
  Sparkles, 
  Package, 
  Award, 
  Lock, 
  ShieldCheck 
} from 'lucide-react';
import GoogleButton from '@/components/auth/google-button';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { language } = useLanguage();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Flow States (Passwordless Registration Verification)
  const [step, setStep] = useState<'FORM_ENTRY' | 'OTP_ENTRY'>('FORM_ENTRY');
  const [activeCustomer, setActiveCustomer] = useState<any>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [totalTimer, setTotalTimer] = useState(600); // 10 Minutes = 600s
  const [resendCooldown, setResendCooldown] = useState(60); // 60s cooldown
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendStatusMessage, setResendStatusMessage] = useState('');

  // reCAPTCHA verification state
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  // Mandatory Visual Puzzle Challenge State
  const [showVisualPuzzle, setShowVisualPuzzle] = useState(false);
  const [selectedTiles, setSelectedTiles] = useState<number[]>([]);
  const [puzzleError, setPuzzleError] = useState('');

  const puzzleTiles = [
    { id: 1, name: 'Tepung Semolina', isCorrect: true, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop' },
    { id: 2, name: 'Kereta Merah', isCorrect: false, image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?q=80&w=300&auto=format&fit=crop' },
    { id: 3, name: 'Cokelat Belgia', isCorrect: true, image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?q=80&w=300&auto=format&fit=crop' },
    { id: 4, name: 'Bangunan Bandar', isCorrect: false, image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=300&auto=format&fit=crop' },
    { id: 5, name: 'Serbuk Matcha', isCorrect: true, image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?q=80&w=300&auto=format&fit=crop' },
    { id: 6, name: 'Mentega Butter', isCorrect: true, image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?q=80&w=300&auto=format&fit=crop' },
    { id: 7, name: 'Motosikal', isCorrect: false, image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=300&auto=format&fit=crop' },
    { id: 8, name: 'Pengacau Roti', isCorrect: true, image: 'https://images.unsplash.com/photo-1590779033100-9f60a05a013d?q=80&w=300&auto=format&fit=crop' },
    { id: 9, name: 'Taman Hijau', isCorrect: false, image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=300&auto=format&fit=crop' },
  ];

  const toggleTile = (id: number) => {
    setSelectedTiles(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
    setPuzzleError('');
  };

  const handleVerifyPuzzle = () => {
    const correctIds = puzzleTiles.filter(t => t.isCorrect).map(t => t.id);
    const isSuccess = 
      correctIds.length === selectedTiles.length && 
      correctIds.every(id => selectedTiles.includes(id));

    if (isSuccess) {
      setCaptchaVerified(true);
      setCaptchaError(false);
      setShowVisualPuzzle(false);
    } else {
      setPuzzleError(language === 'EN' ? 'Please select ALL squares containing baking ingredients.' : 'Sila pilih SEMUA petak gambar ramuan bakeri dengan betul.');
    }
  };

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LdH_4AtAAAAAIo2Oh4qMpCi3LYJqSKtwukEVB5-';

  // Load and render pure official Google reCAPTCHA v2 Widget
  useEffect(() => {
    if (step !== 'FORM_ENTRY') return;

    const scriptId = 'google-recaptcha-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const renderWidget = () => {
      if (typeof window !== 'undefined' && (window as any).grecaptcha && (window as any).grecaptcha.render && recaptchaRef.current) {
        try {
          if (widgetIdRef.current === null && recaptchaRef.current.children.length === 0) {
            widgetIdRef.current = (window as any).grecaptcha.render(recaptchaRef.current, {
              sitekey: recaptchaSiteKey, // Pure Official Google v2 Site Key
              theme: 'light',
              callback: (token: string) => {
                setSelectedTiles([]);
                setPuzzleError('');
                setShowVisualPuzzle(true);
              },
              'expired-callback': () => {
                setCaptchaVerified(false);
              },
              'error-callback': () => {
                setCaptchaVerified(false);
              }
            });
          }
        } catch (e) {
          console.warn('Google reCAPTCHA render warning:', e);
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://www.google.com/recaptcha/api.js?onload=onGoogleRecaptchaLoad&render=explicit';
      script.async = true;
      script.defer = true;
      (window as any).onGoogleRecaptchaLoad = () => {
        renderWidget();
      };
      document.body.appendChild(script);
    } else {
      renderWidget();
    }
  }, [step, recaptchaSiteKey]);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 10-Minute Total Expiry Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'OTP_ENTRY' && totalTimer > 0) {
      timer = setInterval(() => {
        setTotalTimer((prev) => prev - 1);
      }, 1000);
    } else if (totalTimer === 0 && step === 'OTP_ENTRY') {
      setError(language === 'EN' ? 'OTP code has expired (10 mins). Please resend a new code.' : 'Kod OTP telah kadaluarsa (10 minit). Sila klik Kirim Ulang OTP.');
    }
    return () => clearInterval(timer);
  }, [step, totalTimer, language]);

  // 60-Second Resend Cooldown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'OTP_ENTRY' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    } else if (resendCooldown === 0 && step === 'OTP_ENTRY') {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  const dispatchOtp = async (targetEmail: string, name: string, phone: string) => {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    setGeneratedCode(otpCode);
    setOtpValues(['', '', '', '', '', '']);
    setTotalTimer(600);
    setResendCooldown(60);
    setCanResend(false);
    setAttempts(0);
    setError('');

    const customers = db.getCustomers();
    let existing = customers.find(c => c.email && c.email.toLowerCase() === targetEmail);

    const newCustomer = {
      id: existing?.id || `cust-${Date.now()}`,
      name: name.trim(),
      email: targetEmail,
      phone: phone.trim(),
      customerType: 'RETAIL' as const,
      provider: 'FORM' as const,
      isEmailVerified: false,
      isActive: false,
      otpCode: otpCode,
      otpExpiresAt: otpExpiresAt,
      address: 'Chukai, Terengganu',
      city: 'Chukai',
      state: 'Terengganu',
      postcode: '24000',
      createdAt: existing?.createdAt || new Date().toISOString(),
      loginAt: new Date().toISOString(),
    };

    db.saveCustomer(newCustomer);
    setActiveCustomer(newCustomer);

    // Send Resend OTP Email via /api/auth/send-otp
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          otp: otpCode,
          name: name.trim(),
          type: 'EMAIL_VERIFICATION',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResendStatusMessage(language === 'EN' ? `OTP sent to ${targetEmail}` : `Kod OTP 6-digit terkirim ke ${targetEmail}`);
      } else {
        setResendStatusMessage(language === 'EN' ? `OTP ready for ${targetEmail}` : `Kod OTP 6-digit sedia untuk ${targetEmail}`);
      }
    } catch (err) {
      console.error('Failed to send Resend OTP:', err);
      setResendStatusMessage(language === 'EN' ? `OTP ready for ${targetEmail}` : `Kod OTP 6-digit sedia untuk ${targetEmail}`);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaVerified) {
      setCaptchaError(true);
      setError(language === 'EN' ? 'Please complete the reCAPTCHA verification below.' : 'Sila sahkan reCAPTCHA di bawah terlebih dahulu.');
      return;
    }

    localStorage.removeItem('fbs_customer_session');
    window.dispatchEvent(new Event('storage'));

    if (!form.fullName.trim() || !form.email.trim()) {
      setError(language === 'EN' ? 'All required fields must be filled.' : 'Semua bidang wajib diisi.');
      return;
    }

    const cleanEmail = form.email.trim().toLowerCase();
    const cleanPhone = form.phone.trim().replace(/[^0-9]/g, '');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError(language === 'EN' ? 'Please enter a valid email address.' : 'Sila masukkan alamat e-mel yang sah.');
      return;
    }

    const customers = db.getCustomers();
    const existingVerifiedEmail = customers.find(c => c.email && c.email.toLowerCase() === cleanEmail && c.isEmailVerified);
    if (existingVerifiedEmail) {
      setError(language === 'EN' ? 'This email address is already registered. Please sign in.' : 'Alamat e-mel ini telah terdaftar. Sila log masuk.');
      return;
    }

    if (cleanPhone) {
      const existingVerifiedPhone = customers.find(c => c.phone && c.phone.replace(/[^0-9]/g, '') === cleanPhone && c.isEmailVerified);
      if (existingVerifiedPhone) {
        setError(language === 'EN' ? 'This phone number is already registered.' : 'Nombor telefon ini telah terdaftar.');
        return;
      }
    }

    setLoading(true);

    await dispatchOtp(cleanEmail, form.fullName, form.phone);
    setLoading(false);
    setStep('OTP_ENTRY');
  };

  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setResendStatusMessage('');
    await dispatchOtp(form.email.trim().toLowerCase(), form.fullName, form.phone);
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      const digits = value.replace(/[^0-9]/g, '').slice(0, 6).split('');
      const newOtp = [...otpValues];
      digits.forEach((d, idx) => {
        newOtp[idx] = d;
      });
      setOtpValues(newOtp);
      if (digits.length === 6) {
        verifyCode(digits.join(''));
      }
      return;
    }

    const digit = value.replace(/[^0-9]/g, '');
    const newOtp = [...otpValues];
    newOtp[index] = digit;
    setOtpValues(newOtp);
    setError('');

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const currentCode = newOtp.join('');
    if (currentCode.length === 6) {
      verifyCode(currentCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = (enteredCode: string) => {
    if (totalTimer <= 0) {
      setError(language === 'EN' ? 'OTP code has expired. Please resend a new code.' : 'Kod verifikasi (OTP) telah kadaluarsa. Sila klik Kirim Ulang OTP.');
      return;
    }

    if (attempts >= 5) {
      setError(language === 'EN' ? 'Maximum attempts (5) reached. Please resend a new OTP.' : 'Batas maksimum percubaan (5 kali) telah dicapai. Sila minta kod OTP baharu.');
      return;
    }

    setIsVerifying(true);
    setError('');

    setTimeout(() => {
      const customers = db.getCustomers();
      const cleanTarget = form.email.trim().toLowerCase();
      const customer = customers.find(c => c.email && c.email.toLowerCase() === cleanTarget);

      const dbOtp = customer?.otpCode || generatedCode;

      if (enteredCode === dbOtp || enteredCode === generatedCode) {
        const verifiedCustomer = {
          ...(customer || activeCustomer),
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

        setIsVerifying(false);
        router.push('/account');
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        setIsVerifying(false);
        if (nextAttempts >= 5) {
          setError(language === 'EN' ? 'Maximum attempts (5) reached. Please resend a new OTP.' : 'Batas maksimum percubaan (5 kali) telah dicapai. Sila klik Kirim Ulang OTP.');
        } else {
          setError(language === 'EN' ? `Invalid 6-digit OTP code (${nextAttempts}/5 attempts).` : `Kod verifikasi 6-digit salah (${nextAttempts}/5 percubaan). Silakan periksa inbox email Anda!`);
        }
      }
    }, 300);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 lg:py-14 w-full flex items-center justify-center">
        
        {/* Desktop Split-Screen Grid Layout (2-Column Desktop, 1-Column Responsive Mobile) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden shadow-2xl border border-[#EADBC8] bg-white transition-all">
          
          {/* LEFT COLUMN: Luxury Visual Banner (Gradient Maroon & Gold Branding) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#580816] via-[#460612] to-[#3B040D] p-8 lg:p-12 text-[#FFF8F0] relative overflow-hidden flex flex-col justify-between min-h-[380px] lg:min-h-[580px]">
            
            {/* Elegant Background Patterns */}
            <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#800020]/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Top Brand Logo & Badge */}
            <div className="relative z-10 space-y-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-b from-[#800020] to-[#3A0612] border-2 border-[#D4AF37] p-1.5 shadow-2xl flex items-center justify-center">
                <img 
                  src="/logo.jpg" 
                  alt="FBS Bakery World Logo" 
                  className="w-full h-full object-cover rounded-2xl shadow"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 bg-[#D4AF37]/15 border border-[#D4AF37]/40 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pendaftaran Pelanggan Baharu</span>
              </div>
            </div>

            {/* Middle Promo Headline */}
            <div className="relative z-10 my-6 space-y-3">
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#FFF8F0] tracking-tight leading-tight">
                Sertai Komuniti Pembekal & Bakeri Premium
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-md">
                Daftar akaun percuma untuk mengakses ramuan bakeri berkualiti tinggi, harga borong istimewa, dan pengesahan selamat.
              </p>
            </div>

            {/* Bottom Value Proposition Pills */}
            <div className="relative z-10 space-y-2.5 pt-4 border-t border-white/10 text-xs font-semibold text-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
                  <Package className="w-4 h-4" />
                </div>
                <span>Diskaun & Tawaran Ahli Eksklusif</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
                  <Award className="w-4 h-4" />
                </div>
                <span>Bahan Impor Original & Sijil Halal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#D4AF37]/20 text-[#D4AF37]">
                  <Lock className="w-4 h-4" />
                </div>
                <span>Pengesahan OTP Selamat Tanpa Kata Laluan</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Modern Clean Form Container */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white space-y-6">
            
            {step === 'FORM_ENTRY' ? (
              <>
                {/* Header Title & Subtitle */}
                <div className="space-y-1.5">
                  <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2B1B1B] tracking-tight">
                    Daftar Akun Baru
                  </h1>
                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    Lengkapi formulir di bawah ini untuk menerima kode OTP verifikasi pendaftaran.
                  </p>
                </div>

                {/* 1-Click Google Sign-In */}
                <div className="space-y-3 pt-1">
                  <GoogleButton />
                  
                  {/* Clean Divider */}
                  <div className="w-full flex items-center gap-3 py-1">
                    <div className="flex-1 h-[1px] bg-stone-200" />
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                      atau daftar formulir & email
                    </span>
                    <div className="flex-1 h-[1px] bg-stone-200" />
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 text-xs rounded-2xl font-medium flex items-center gap-2.5 shadow-sm">
                    <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form Input Register */}
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1.5 tracking-wider text-[11px]">
                      Nama Lengkap <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="text"
                        required
                        placeholder="misalnya Ahmad Naufal"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className="w-full pl-11 pr-4 py-3.5 border border-stone-300 rounded-2xl text-stone-900 focus:outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/20 text-xs sm:text-sm font-medium transition-all shadow-sm"
                      />
                      <User className="w-4.5 h-4.5 text-stone-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1.5 tracking-wider text-[11px]">
                      Alamat Email <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="email"
                        required
                        placeholder="contoh: naufal@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3.5 border border-stone-300 rounded-2xl text-stone-900 focus:outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/20 text-xs sm:text-sm font-medium transition-all shadow-sm"
                      />
                      <Mail className="w-4.5 h-4.5 text-stone-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 uppercase mb-1.5 tracking-wider text-[11px]">
                      Nomor Telepon / WhatsApp
                    </label>
                    <div className="relative">
                      <input 
                        type="tel"
                        placeholder="misalnya +60123456789"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full pl-11 pr-4 py-3.5 border border-stone-300 rounded-2xl text-stone-900 focus:outline-none focus:border-[#800020] focus:ring-2 focus:ring-[#800020]/20 text-xs sm:text-sm font-medium transition-all shadow-sm"
                      />
                      <Phone className="w-4.5 h-4.5 text-stone-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  {/* Official Google reCAPTCHA v2 Interactive Box */}
                  <div className="flex flex-col items-center justify-center my-2 min-h-[78px]">
                    <div ref={recaptchaRef} className="min-h-[78px] flex items-center justify-center"></div>
                    {captchaError && (
                      <p className="text-[11px] font-bold text-red-600 mt-1 text-center">
                        {language === 'EN' ? 'Please complete the reCAPTCHA verification above.' : 'Sila sahkan reCAPTCHA di atas terlebih dahulu.'}
                      </p>
                    )}
                  </div>

                  {/* Gradient Send OTP Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[#800020] via-[#580816] to-[#3B040D] hover:brightness-110 active:scale-[0.99] text-[#D4AF37] font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                        <span>Mengirim Kode OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>DAFTAR & HANTAR KOD OTP</span>
                        <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                      </>
                    )}
                  </button>
                </form>

                {/* Link to Login */}
                <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
                  <p>
                    Sudah mempunyai akaun?{' '}
                    <Link href="/account/login" className="text-[#800020] font-bold hover:underline">
                      Log Masuk Sekarang
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              /* OTP ENTRY STEP: Inline Pin Input Screen */
              <div className="space-y-6 animate-fade-in">
                
                {/* Header Step 2 */}
                <div className="space-y-1.5 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 bg-[#800020]/10 text-[#800020] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Langkah 2: Verifikasi OTP 6-Digit</span>
                  </div>

                  <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#2B1B1B] tracking-tight">
                    Pengesahan Pendaftaran
                  </h1>

                  <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                    Masukkan kod verifikasi 6-digit yang telah dihantar via Resend ke:
                    <br />
                    <strong className="font-mono text-[#800020] text-sm underline">{form.email}</strong>
                  </p>
                </div>

                {/* Dispatch Status Alert */}
                {resendStatusMessage && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-2xl font-medium flex items-center justify-center gap-2 shadow-sm">
                    <Mail className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{resendStatusMessage}</span>
                  </div>
                )}

                {/* 10-Minute Expiry Countdown Bar */}
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-stone-700 bg-stone-100 px-4 py-2 rounded-2xl border border-stone-200 w-fit mx-auto sm:mx-0">
                  <Clock className="w-4 h-4 text-[#800020]" />
                  <span>Waktu Berlaku OTP:</span>
                  <span className={`font-mono text-sm font-black ${totalTimer < 60 ? 'text-red-600 animate-pulse' : 'text-[#800020]'}`}>
                    {formatTime(totalTimer)}
                  </span>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3.5 bg-red-50 text-red-700 border border-red-200 text-xs rounded-2xl font-medium flex items-center gap-2.5 shadow-sm">
                    <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* 6-Digit OTP Pin Input Grid */}
                <div className="space-y-3">
                  <label className="block text-center sm:text-left text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                    Masukkan Kod OTP 6-Digit:
                  </label>
                  <div className="flex justify-center sm:justify-start gap-2.5 sm:gap-3">
                    {otpValues.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => { inputRefs.current[index] = el; }}
                        type="text"
                        maxLength={6}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black font-mono text-stone-900 bg-stone-50 border-2 border-stone-300 rounded-2xl focus:border-[#800020] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800020]/20 transition-all shadow-inner"
                      />
                    ))}
                  </div>
                </div>

                {/* Resend OTP & Change Email Action Bar */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={!canResend || loading}
                      className={`flex items-center gap-1.5 font-bold transition-all ${
                        canResend && !loading
                          ? 'text-[#800020] hover:underline cursor-pointer'
                          : 'text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      {canResend ? (
                        <span>Kirim Ulang OTP</span>
                      ) : (
                        <span>Kirim Ulang OTP ({resendCooldown}s)</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('FORM_ENTRY')}
                      className="text-stone-500 hover:text-stone-800 text-[11px] underline"
                    >
                      Kembali & Tukar Email
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      {/* Mandatory Visual Image Grid Puzzle Challenge Modal */}
      {showVisualPuzzle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
          <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full border border-stone-200 shadow-2xl space-y-0 relative">
            
            {/* Header Google Blue Banner */}
            <div className="bg-[#4285F4] p-5 text-white space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-100 block">
                {language === 'EN' ? 'RECAPTCHA VISUAL PUZZLE' : 'VERIFIKASI GAMBAR RECAPTCHA'}
              </span>
              <h3 className="font-sans font-black text-lg leading-tight drop-shadow-sm">
                {language === 'EN' ? 'Select all squares with baking ingredients' : 'Pilih semua petak yang berisi ramuan bakeri'}
              </h3>
              <p className="text-[11px] text-blue-100 font-medium">
                {language === 'EN' ? 'Click verify once you have selected all matching squares.' : 'Sila klik SAHKAN setelah anda memilih semua petak yang betul.'}
              </p>
            </div>

            {puzzleError && (
              <div className="p-2.5 bg-red-50 text-red-700 text-xs font-bold text-center border-b border-red-200 animate-shake">
                {puzzleError}
              </div>
            )}

            {/* 3x3 Image Grid Tiles */}
            <div className="p-3 bg-stone-100">
              <div className="grid grid-cols-3 gap-2">
                {puzzleTiles.map((tile) => {
                  const isSelected = selectedTiles.includes(tile.id);
                  return (
                    <div
                      key={tile.id}
                      onClick={() => toggleTile(tile.id)}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${
                        isSelected 
                          ? 'border-[#4285F4] ring-4 ring-[#4285F4]/30 scale-95' 
                          : 'border-white hover:border-stone-300'
                      }`}
                    >
                      <img 
                        src={tile.image} 
                        alt={tile.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#4285F4]/40 flex items-center justify-center backdrop-blur-[1px]">
                          <div className="w-7 h-7 bg-[#4285F4] text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Action Controls */}
            <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3 text-stone-400">
                <button type="button" onClick={() => setSelectedTiles([])} className="hover:text-stone-700 transition-colors" title="Muat Semula">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1 opacity-80">
                  <ShieldCheck className="w-4 h-4 text-[#4285F4]" />
                  <span className="text-[10px] font-black text-stone-600 tracking-tight">reCAPTCHA</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowVisualPuzzle(false)}
                  className="px-3.5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPuzzle}
                  className="px-5 py-2.5 bg-[#4285F4] hover:bg-blue-600 text-white font-black text-xs rounded-xl shadow-lg uppercase tracking-wider transition-all active:scale-95"
                >
                  SAHKAN
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
