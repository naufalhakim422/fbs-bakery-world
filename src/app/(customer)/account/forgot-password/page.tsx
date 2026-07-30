'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HeaderNav } from '@/components/customer/header-nav';
import { Footer } from '@/components/customer/footer';
import { AnnouncementBar } from '@/components/customer/announcement-bar';
import { FloatingWhatsApp } from '@/components/customer/floating-whatsapp';
import { hashPassword, validatePassword } from '@/lib/auth-security';
import { KeyRound, Mail, Phone, Lock, ArrowRight, CheckCircle2, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<'REQUEST' | 'VERIFY' | 'NEW_PASSWORD'>('REQUEST');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailOrPhone.trim()) {
      setError('Silakan masukkan Email atau Nomor WhatsApp Anda.');
      return;
    }

    setLoading(true);

    // Generate 6-digit reset token
    const token = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedToken(token);

    setTimeout(() => {
      setLoading(false);
      setStep('VERIFY');
    }, 600);
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (resetToken.trim() !== generatedToken) {
      setError(`Kode verifikasi token salah. Gunakan kode: ${generatedToken}`);
      return;
    }

    setStep('NEW_PASSWORD');
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      setError(passwordCheck.message);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok. Silakan periksa kembali.');
      return;
    }

    setLoading(true);

    // Hash new password using bcrypt/SHA-256 algorithm
    const hashedPassword = await hashPassword(newPassword);

    setTimeout(() => {
      setLoading(false);
      alert('Password berhasil diperbarui! Silakan sign in menggunakan password baru Anda.');
      router.push('/account/login');
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F0]">
      <AnnouncementBar />
      <HeaderNav />

      <main className="flex-1 max-w-md mx-auto px-4 py-12 w-full flex flex-col justify-center">
        
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-[#EADBC8] shadow-xl space-y-6">
          
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <Link href="/account/login" className="inline-flex items-center gap-1 text-xs font-bold text-[#800020] hover:underline">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Login
            </Link>
            <span className="text-[10px] font-extrabold text-[#D4AF37] uppercase tracking-widest bg-[#800020] px-2.5 py-0.5 rounded-full">
              LUPA PASSWORD
            </span>
          </div>

          {step === 'REQUEST' && (
            /* STEP 1: REQUEST EMAIL/PHONE */
            <div className="space-y-5 animate-fade-in">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mx-auto mb-3">
                  <KeyRound className="w-7 h-7" />
                </div>
                <h1 className="font-serif text-2xl font-extrabold text-[#2B1B1B]">
                  Lupa Password Akun?
                </h1>
                <p className="text-stone-600 text-xs mt-1">
                  Masukkan Email atau Nomor WhatsApp terdaftar Anda untuk menerima kode reset password.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    Email / WhatsApp Terdaftar <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      required
                      placeholder="e.g. naufal@example.com atau +60129876543"
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                    />
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {loading ? 'Mengirim Kode Reset...' : 'KIRIM KODE RESET PASSWORD'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {step === 'VERIFY' && (
            /* STEP 2: VERIFY 6-DIGIT RESET TOKEN */
            <div className="space-y-5 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[#2B1B1B]">
                Masukkan Kode Token Reset
              </h2>
              <p className="text-stone-600 text-xs">
                Kode token reset 6-digit telah dikirimkan ke Email / WhatsApp <strong className="text-[#800020]">{emailOrPhone}</strong>.
              </p>

              {/* SIMULATED RESET TOKEN DISPLAY NOTIFICATION */}
              <div className="p-4 bg-[#FFF8F0] border-2 border-dashed border-[#800020] rounded-2xl text-center space-y-1">
                <span className="text-[11px] font-bold text-[#800020] uppercase block">
                  Simulasi Notifikasi Email / WA Reset Password
                </span>
                <div className="font-mono text-2xl font-black text-[#800020] tracking-widest">
                  {generatedToken}
                </div>
                <span className="text-[10px] text-stone-500 block">
                  (Gunakan kode 6-digit ini untuk mereset kata sandi Anda)
                </span>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleVerifySubmit} className="space-y-4">
                <input 
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. 492018"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full text-center font-mono text-2xl font-black tracking-widest px-4 py-3 border-2 border-stone-300 rounded-xl focus:outline-none focus:border-[#800020]"
                />

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  VERIFIKASI TOKEN <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {step === 'NEW_PASSWORD' && (
            /* STEP 3: SET NEW BCRYPT-HASHED PASSWORD */
            <div className="space-y-5 animate-fade-in">
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-[#800020]/10 text-[#800020] flex items-center justify-center mx-auto mb-3">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#2B1B1B]">
                  Buat Password Baru
                </h2>
                <p className="text-stone-600 text-xs mt-1">
                  Password baru harus terdiri dari <strong>minimal 8 hingga 12+ karakter</strong>.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleNewPasswordSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    Password Baru (Min 8-12 Karakter) <span className="text-red-600">*</span>
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
                  {newPassword.length > 0 && (
                    <span className={`text-[10px] font-bold mt-1 block ${
                      newPassword.length >= 8 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      Panjang karakter: {newPassword.length} / 8-12 karakter {newPassword.length >= 8 ? '✓ (Aman)' : '(Terlalu pendek)'}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    Konfirmasi Password Baru <span className="text-red-600">*</span>
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
                  className="w-full py-3.5 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  {loading ? 'Menyimpan Password...' : 'SIMPAN PASSWORD BARU'} <CheckCircle2 className="w-4 h-4" />
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
